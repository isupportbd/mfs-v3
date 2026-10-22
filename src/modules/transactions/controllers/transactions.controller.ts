import { and, desc, eq, sql } from "drizzle-orm";
import type { Handler } from "hono";
import { broadcast, db, HttpStatusCodes, queueJob } from "@/framework/facade.js";
import { redisReady } from "@/framework/redis/client.js";
import { transactions } from "../database/models/transactions.js";
import { merchantProviders } from "@/modules/providers/database/models/providers.js";

let tableEnsured = false;
async function ensureTransactionsTable() {
  if (tableEnsured) return;
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "transactions" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL REFERENCES "users"("id") ON UPDATE cascade ON DELETE cascade,
        "type" varchar(50) NOT NULL,
        "transfer_subtype" varchar(100),
        "customer_id" integer REFERENCES "customers"("id") ON UPDATE cascade ON DELETE set null,
        "customer_mobile" varchar(50),
        "from_provider_id" integer REFERENCES "merchant_providers"("id") ON UPDATE cascade ON DELETE set null,
        "to_provider_id" integer REFERENCES "merchant_providers"("id") ON UPDATE cascade ON DELETE set null,
        "amount" numeric(15, 2) NOT NULL,
        "fee" numeric(10, 2) DEFAULT '0.00' NOT NULL,
        "commission" numeric(10, 2) DEFAULT '0.00' NOT NULL,
        "other_fee" numeric(10, 2) DEFAULT '0.00' NOT NULL,
        "net_amount" numeric(15, 2) NOT NULL,
        "tr_number" varchar(100),
        "biller_name" varchar(100),
        "bill_account_number" varchar(100),
        "status" varchar(50) DEFAULT 'সফল' NOT NULL,
        "note" text,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      )
    `);
    await db.execute(sql`
      ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "other_fee" numeric(10, 2) DEFAULT '0.00' NOT NULL;
    `);
    tableEnsured = true;
  } catch (e) {
    console.error("Failed to ensure transactions table:", e);
  }
}

/**
 * লেনদেনের তালিকা ও সারসংক্ষেপ
 */
export const getTransactionList: Handler = async (c: any) => {
  await ensureTransactionsTable();
  const auth = c.get("auth");
  if (!auth?.id) {
    return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);
  }

  const list = await db.query.transactions.findMany({
    where: eq(transactions.userId, auth.id),
    orderBy: [desc(transactions.id)],
    limit: 100
  });

  // হিসাব সারসংক্ষেপ
  const totalCashIn = list.filter(t => t.type === "ক্যাশ ইন").reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
  const totalCashOut = list.filter(t => t.type === "ক্যাশ আউট").reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
  const totalPayBill = list.filter(t => t.type === "পে-বিল").reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
  const totalTransfer = list.filter(t => t.type === "ট্রান্সফার").reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  return c.json({
    message: "লেনদেনের তালিকা সফলভাবে লোড হয়েছে",
    data: {
      transactions: list,
      summary: {
        totalCashIn,
        totalCashOut,
        totalPayBill,
        totalTransfer,
        totalCount: list.length
      }
    }
  });
};

/**
 * নতুন লেনদেন তৈরি
 */
export const createTransaction: Handler = async (c: any) => {
  await ensureTransactionsTable();
  const auth = c.get("auth");
  if (!auth?.id) {
    return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);
  }

  const body = c.req.valid("json");
  const amount = Number(body.amount);
  const fee = Number(body.fee || 0);
  const commission = Number(body.commission || 0);
  const otherFee = Number(body.otherFee || 0);
  const netAmount = amount + fee;

  // পেলোড হাইজিন: অপ্রয়োজনীয় টাইপের ডাটা null করে ফেলা
  const isTransfer = body.type === "ট্রান্সফার";
  const isPayBill = body.type === "পে-বিল";

  const payload = {
    userId: auth.id,
    type: body.type,
    transferSubtype: isTransfer ? (body.transferSubtype || null) : null,
    customerId: body.customerId ? Number(body.customerId) : null,
    customerMobile: isTransfer ? null : (body.customerMobile ? String(body.customerMobile).trim() : null),
    fromProviderId: body.fromProviderId ? Number(body.fromProviderId) : null,
    toProviderId: isTransfer && body.toProviderId ? Number(body.toProviderId) : null,
    amount: String(amount),
    fee: String(fee),
    commission: String(commission),
    otherFee: String(otherFee),
    netAmount: String(netAmount),
    trNumber: body.trNumber ? String(body.trNumber).trim() : null,
    billerName: isPayBill && body.billerName ? String(body.billerName).trim() : null,
    billAccountNumber: isPayBill && body.billAccountNumber ? String(body.billAccountNumber).trim() : null,
    note: body.note ? String(body.note).trim() : null
  };

  // উচ্চ ট্রাফিকের সময় নিরাপদে হ্যান্ডেল করার জন্য BullMQ কিউ
  if (redisReady()) {
    await queueJob("transaction.create", payload, { queue: "transactions" });
    return c.json(
      {
        message: "লেনদেন সফলভাবে কিউতে যোগ করা হয়েছে",
        queued: true,
        data: payload
      },
      HttpStatusCodes.ACCEPTED
    );
  }

  // ফালব্যাক (যদি রেডিস অফলাইন থাকে): সরাসরি ডাটাবেজে সংরক্ষণ ও রিয়েলটাইম ব্রডকাস্ট
  const [created] = await db
    .insert(transactions)
    .values(payload)
    .returning();

  broadcast("transaction.created", created, { users: [auth.id], rooms: ["transactions"] });

  return c.json({
    message: "লেনদেন সফলভাবে সম্পন্ন হয়েছে",
    data: created
  }, HttpStatusCodes.CREATED);
};

/**
 * লেনদেন মুছে ফেলা
 */
export const deleteTransaction: Handler = async (c: any) => {
  await ensureTransactionsTable();
  const auth = c.get("auth");
  if (!auth?.id) {
    return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);
  }

  const { id } = c.req.valid("param");
  const existing = await db.query.transactions.findFirst({
    where: and(eq(transactions.id, Number(id)), eq(transactions.userId, auth.id))
  });

  if (!existing) {
    return c.json({ message: "লেনদেন পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
  }

  await db.delete(transactions).where(eq(transactions.id, Number(id)));

  // রিয়েলটাইমে নির্দিষ্ট ব্যবহারকারীকে লেনদেন মুছে ফেলার তথ্য ব্রডকাস্ট
  broadcast("transaction.deleted", { id: Number(id), userId: auth.id }, { users: [auth.id], rooms: ["transactions"] });

  return c.json({
    message: "লেনদেন সফলভাবে মুছে ফেলা হয়েছে",
    data: { id: Number(id) }
  });
};
