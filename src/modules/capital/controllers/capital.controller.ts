import { and, desc, eq, sql } from "drizzle-orm";
import type { Handler } from "hono";
import { db, HttpStatusCodes } from "@/framework/facade.js";
import { capitalTransactions } from "../database/models/capital.js";
import { shareholders } from "@/modules/company/database/models/company.js";

let capitalTableEnsured = false;
async function ensureCapitalTable() {
  if (capitalTableEnsured) return;
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "capital_transactions" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL REFERENCES "users"("id") ON UPDATE cascade ON DELETE cascade,
        "shareholder_id" integer NOT NULL REFERENCES "shareholders"("id") ON UPDATE cascade ON DELETE cascade,
        "amount" numeric(15, 2) NOT NULL,
        "deposit_date" date NOT NULL,
        "payment_method" varchar(100) DEFAULT 'ক্যাশ' NOT NULL,
        "note" text,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      )
    `);
    capitalTableEnsured = true;
  } catch (e) {
    console.error("Failed to ensure capital_transactions table:", e);
  }
}

/**
 * পুঁজি লেনদেনের তালিকা ও শেয়ারহোল্ডার ভিত্তিক স্বয়ংক্রিয় অনুপাত হিসাব
 */
export const getCapitalList: Handler = async (c: any) => {
  await ensureCapitalTable();
  const auth = c.get("auth");
  if (!auth?.id) {
    return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);
  }

  // শেয়ারহোল্ডারদের তালিকা আনা
  const shareholderList = await db.query.shareholders.findMany({
    where: eq(shareholders.userId, auth.id),
    orderBy: [desc(shareholders.id)]
  });

  // পুঁজি লেনদেনসমূহ আনা
  const transactions = await db.query.capitalTransactions.findMany({
    where: eq(capitalTransactions.userId, auth.id),
    orderBy: [desc(capitalTransactions.depositDate), desc(capitalTransactions.id)]
  });

  // প্রতি শেয়ারহোল্ডারের নাম ম্যাপ করা
  const shareholderMap = new Map(shareholderList.map(s => [s.id, s.name]));

  // মোট মূলধন হিসাব
  const totalCapital = transactions.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  // প্রতি শেয়ারহোল্ডারের দেওয়া মোট পুঁজি ও অনুপাত হিসাব
  const shareholderCapitalSummary = shareholderList.map(s => {
    const sTotal = transactions
      .filter(t => t.shareholderId === s.id)
      .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
    const calculatedPercentage = totalCapital > 0 ? (sTotal / totalCapital) * 100 : 0;
    return {
      shareholderId: s.id,
      shareholderName: s.name,
      mobile: s.mobile,
      role: s.role,
      totalCapital: sTotal,
      sharePercentage: Number(calculatedPercentage.toFixed(2))
    };
  });

  const formattedTransactions = transactions.map(t => ({
    id: t.id,
    shareholderId: t.shareholderId,
    shareholderName: shareholderMap.get(t.shareholderId) || "অজানা",
    amount: Number(t.amount),
    depositDate: t.depositDate,
    paymentMethod: t.paymentMethod,
    note: t.note,
    createdAt: t.createdAt
  }));

  return c.json({
    message: "পুঁজি তালিকা সফলভাবে লোড হয়েছে",
    data: {
      transactions: formattedTransactions,
      shareholderSummary: shareholderCapitalSummary,
      totalCapital: Number(totalCapital.toFixed(2))
    }
  });
};

/**
 * নতুন পুঁজি যোগ করা
 */
export const createCapitalTransaction: Handler = async (c: any) => {
  await ensureCapitalTable();
  const auth = c.get("auth");
  if (!auth?.id) {
    return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);
  }

  const body = c.req.valid("json");
  const shareholderId = Number(body.shareholderId);
  const amount = String(Number(body.amount));
  const depositDate = String(body.depositDate).trim();
  const paymentMethod = String(body.paymentMethod || "ক্যাশ").trim();
  const note = body.note ? String(body.note).trim() : null;

  // শেয়ারহোল্ডার বৈধ কিনা যাচাই
  const shareholder = await db.query.shareholders.findFirst({
    where: and(eq(shareholders.id, shareholderId), eq(shareholders.userId, auth.id))
  });

  if (!shareholder) {
    return c.json({ message: "নির্বাচিত শেয়ারহোল্ডার পাওয়া যায়নি" }, HttpStatusCodes.BAD_REQUEST);
  }

  const [created] = await db
    .insert(capitalTransactions)
    .values({
      userId: auth.id,
      shareholderId,
      amount,
      depositDate,
      paymentMethod,
      note
    })
    .returning();

  return c.json({
    message: "পুঁজি সফলভাবে যোগ করা হয়েছে",
    data: created
  }, HttpStatusCodes.CREATED);
};

/**
 * পুঁজি লেনদেন মুছে ফেলা
 */
export const deleteCapitalTransaction: Handler = async (c: any) => {
  const auth = c.get("auth");
  if (!auth?.id) {
    return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);
  }

  const params = c.req.valid("param");
  const id = Number(params.id);

  const existing = await db.query.capitalTransactions.findFirst({
    where: and(eq(capitalTransactions.id, id), eq(capitalTransactions.userId, auth.id))
  });

  if (!existing) {
    return c.json({ message: "পুঁজি এন্ট্রি পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
  }

  await db
    .delete(capitalTransactions)
    .where(and(eq(capitalTransactions.id, id), eq(capitalTransactions.userId, auth.id)));

  return c.json({
    message: "পুঁজি লেনদেন সফলভাবে মুছে ফেলা হয়েছে",
    data: { id }
  });
};
