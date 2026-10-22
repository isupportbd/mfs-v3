import { and, desc, eq, ilike, ne, or, sql } from "drizzle-orm";
import type { Handler } from "hono";
import { broadcast, db, HttpStatusCodes, queueJob } from "@/framework/facade.js";
import { redisReady } from "@/framework/redis/client.js";
import { financialProviders } from "@/modules/settings/database/models/providers.js";
import { merchantProviders } from "../database/models/providers.js";

let tablesEnsured = false;
async function ensureTables() {
  if (tablesEnsured) return;
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "merchant_providers" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL REFERENCES "users"("id") ON UPDATE cascade ON DELETE cascade,
        "provider_id" integer REFERENCES "financial_providers"("id") ON UPDATE cascade ON DELETE set null,
        "provider_name" varchar(100) NOT NULL,
        "account_type" varchar(50) NOT NULL,
        "account_number" varchar(100) NOT NULL,
        "balance" numeric(15, 2) DEFAULT '0.00' NOT NULL,
        "note" text,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      )
    `);

    // বিদ্যমান ডুপ্লিকেট পরিষ্কার করা (যদি থেকে থাকে) এবং ইউনিক ইনডেক্স তৈরি করা
    await db.execute(sql`
      DELETE FROM "merchant_providers" a USING "merchant_providers" b
      WHERE a.id > b.id
        AND a.user_id = b.user_id
        AND lower(a.provider_name) = lower(b.provider_name)
        AND a.account_number = b.account_number;
    `);

    await db.execute(sql`
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_merchant_providers_user_prov_acc"
      ON "merchant_providers" ("user_id", lower("provider_name"), "account_number");
    `);

    // ডিফল্ট আর্থিক প্রোভাইডার নিশ্চিত করা (যদি খালি থাকে)
    const existing = await db.query.financialProviders.findFirst();
    if (!existing) {
      const defaultProviders = [
        { name: "বিকাশ", type: "mfs", isActive: true },
        { name: "নগদ", type: "mfs", isActive: true },
        { name: "রকেট", type: "mfs", isActive: true },
        { name: "উপায়", type: "mfs", isActive: true },
        { name: "সেলফিন", type: "mfs", isActive: true },
        { name: "ইসলামী ব্যাংক", type: "bank", isActive: true },
        { name: "ডাচ-বাংলা ব্যাংক", type: "bank", isActive: true },
        { name: "ব্র্যাক ব্যাংক", type: "bank", isActive: true },
        { name: "সিটি ব্যাংক", type: "bank", isActive: true },
        { name: "সোনালী ব্যাংক", type: "bank", isActive: true }
      ];
      for (const p of defaultProviders) {
        await db.insert(financialProviders).values(p);
      }
    }

    tablesEnsured = true;
  } catch (e) {
    console.error("Failed to ensure merchant_providers tables:", e);
  }
}

/**
 * মার্চেন্টের প্রোভাইডার তালিকা ফেচ করা
 */
export const index: Handler = async (c: any) => {
  await ensureTables();
  const auth = c.get("auth");
  if (!auth?.id) {
    return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);
  }

  const query = c.req.query("search");
  let providerList;

  if (query && String(query).trim()) {
    const term = `%${String(query).trim()}%`;
    providerList = await db.query.merchantProviders.findMany({
      where: and(
        eq(merchantProviders.userId, auth.id),
        or(
          ilike(merchantProviders.providerName, term),
          ilike(merchantProviders.accountType, term),
          ilike(merchantProviders.accountNumber, term)
        )
      ),
      with: {
        provider: true
      },
      orderBy: [desc(merchantProviders.createdAt)]
    });
  } else {
    providerList = await db.query.merchantProviders.findMany({
      where: eq(merchantProviders.userId, auth.id),
      with: {
        provider: true
      },
      orderBy: [desc(merchantProviders.createdAt)]
    });
  }

  return c.json({
    message: "প্রোভাইডার তালিকা সফলভাবে লোড হয়েছে",
    data: providerList || [],
    total: providerList?.length || 0
  });
};

/**
 * নির্দিষ্ট প্রোভাইডারের বিবরণ
 */
export const show: Handler = async (c: any) => {
  await ensureTables();
  const auth = c.get("auth");
  const params = c.req.valid("param");

  const provider = await db.query.merchantProviders.findFirst({
    where: and(eq(merchantProviders.id, Number(params.id)), eq(merchantProviders.userId, auth.id))
  });

  if (!provider) {
    return c.json({ message: "প্রোভাইডার পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
  }

  return c.json({ message: "প্রোভাইডার বিবরণ", data: provider });
};

/**
 * নতুন প্রোভাইডার সংরক্ষণ (Create Merchant Provider)
 * কিউ সাপোর্ট: দ্রুত পরপর রিকোয়েস্ট পাঠালেও কিউতে জমা হয়ে ক্রমান্বয়ে ডাটাবেজে এন্ট্রি হবে
 * এবং রিয়েলটাইমে সব ক্লায়েন্টে ব্রডকাস্ট হবে।
 */
export const store: Handler = async (c: any) => {
  await ensureTables();
  const auth = c.get("auth");
  if (!auth?.id) {
    return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);
  }

  const body = c.req.valid("json");
  const payload = {
    userId: auth.id,
    providerId: body.providerId ? Number(body.providerId) : null,
    providerName: String(body.providerName).trim(),
    accountType: String(body.accountType).trim(),
    accountNumber: String(body.accountNumber).trim(),
    balance: String(body.balance !== undefined ? body.balance : "0.00"),
    note: body.note ? String(body.note).trim() : null,
    isActive: true
  };

  // একই প্রোভাইডারে একই একাউন্ট নম্বর একাধিকবার এন্ট্রি রোধ
  const duplicate = await db.query.merchantProviders.findFirst({
    where: and(
      eq(merchantProviders.userId, auth.id),
      ilike(merchantProviders.providerName, payload.providerName),
      eq(merchantProviders.accountNumber, payload.accountNumber)
    )
  });

  if (duplicate) {
    return c.json(
      { message: "এই প্রোভাইডারে এই একাউন্ট নম্বরটি ইতিমধ্যে যুক্ত আছে" },
      HttpStatusCodes.CONFLICT
    );
  }

  // উচ্চ ট্রাফিকের সময় নিরাপদে হ্যান্ডেল করার জন্য BullMQ কিউ
  if (redisReady()) {
    await queueJob("provider.create", payload, { queue: "providers" });
    return c.json(
      {
        message: "প্রোভাইডার সফলভাবে কিউতে যোগ করা হয়েছে",
        queued: true,
        data: payload
      },
      HttpStatusCodes.ACCEPTED
    );
  }

  // ফালব্যাক (যদি রেডিস অফলাইন থাকে): সরাসরি ডাটাবেজে সংরক্ষণ ও ব্রডকাস্ট
  const [newProvider] = await db
    .insert(merchantProviders)
    .values(payload)
    .returning();

  broadcast("provider.created", newProvider, { all: true, rooms: ["providers"] });

  return c.json(
    { message: "প্রোভাইডার সফলভাবে সংরক্ষণ করা হয়েছে", data: newProvider },
    HttpStatusCodes.CREATED
  );
};

/**
 * প্রোভাইডার তথ্য আপডেট (Update Provider)
 */
export const update: Handler = async (c: any) => {
  await ensureTables();
  const auth = c.get("auth");
  const params = c.req.valid("param");
  const body = c.req.valid("json");

  const existing = await db.query.merchantProviders.findFirst({
    where: and(eq(merchantProviders.id, Number(params.id)), eq(merchantProviders.userId, auth.id))
  });

  if (!existing) {
    return c.json({ message: "প্রোভাইডার পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
  }

  const newProviderName = body.providerName !== undefined ? String(body.providerName).trim() : existing.providerName;
  const newAccountNumber = body.accountNumber !== undefined ? String(body.accountNumber).trim() : existing.accountNumber;

  // অন্য কোনো রেকর্ডে একই প্রোভাইডারে একই একাউন্ট আছে কিনা চেক
  const duplicate = await db.query.merchantProviders.findFirst({
    where: and(
      eq(merchantProviders.userId, auth.id),
      ne(merchantProviders.id, Number(params.id)),
      ilike(merchantProviders.providerName, newProviderName),
      eq(merchantProviders.accountNumber, newAccountNumber)
    )
  });

  if (duplicate) {
    return c.json(
      { message: "এই প্রোভাইডারে এই একাউন্ট নম্বরটি ইতিমধ্যে যুক্ত আছে" },
      HttpStatusCodes.CONFLICT
    );
  }

  const [updatedProvider] = await db
    .update(merchantProviders)
    .set({
      providerId: body.providerId !== undefined ? (body.providerId ? Number(body.providerId) : null) : existing.providerId,
      providerName: newProviderName,
      accountType: body.accountType !== undefined ? String(body.accountType).trim() : existing.accountType,
      accountNumber: newAccountNumber,
      balance: body.balance !== undefined ? String(body.balance) : existing.balance,
      note: body.note !== undefined ? (body.note ? String(body.note).trim() : null) : existing.note,
      isActive: body.isActive !== undefined ? body.isActive : existing.isActive,
      updatedAt: new Date()
    })
    .where(and(eq(merchantProviders.id, Number(params.id)), eq(merchantProviders.userId, auth.id)))
    .returning();

  // রিয়েলটাইম আপডেট ব্রডকাস্ট
  broadcast("provider.updated", updatedProvider, { all: true, rooms: ["providers"] });

  return c.json({ message: "প্রোভাইডার তথ্য সফলভাবে আপডেট হয়েছে", data: updatedProvider });
};

/**
 * প্রোভাইডার মুছে ফেলা (Delete Provider)
 */
export const destroy: Handler = async (c: any) => {
  await ensureTables();
  const auth = c.get("auth");
  const params = c.req.valid("param");

  const existing = await db.query.merchantProviders.findFirst({
    where: and(eq(merchantProviders.id, Number(params.id)), eq(merchantProviders.userId, auth.id))
  });

  if (!existing) {
    return c.json({ message: "প্রোভাইডার পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
  }

  await db
    .delete(merchantProviders)
    .where(and(eq(merchantProviders.id, Number(params.id)), eq(merchantProviders.userId, auth.id)));

  // রিয়েলটাইম ডিলিট ব্রডকাস্ট
  broadcast("provider.deleted", { id: Number(params.id), userId: auth.id }, { all: true, rooms: ["providers"] });

  return c.json({ message: "প্রোভাইডার সফলভাবে মুছে ফেলা হয়েছে" });
};
