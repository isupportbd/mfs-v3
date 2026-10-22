import { and, desc, eq, sql } from "drizzle-orm";
import type { Handler } from "hono";
import { db, HttpStatusCodes } from "@/framework/facade.js";
import { financialProviders } from "../database/models/providers.js";
import { settings } from "../database/models/settings.js";

let tablesEnsured = false;
async function ensureTables() {
  if (tablesEnsured) return;
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "financial_providers" (
        "id" serial PRIMARY KEY NOT NULL,
        "type" varchar(20) NOT NULL,
        "name" varchar(100) NOT NULL,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      )
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "settings" (
        "id" serial PRIMARY KEY NOT NULL,
        "key" varchar(100) NOT NULL UNIQUE,
        "value" text,
        "group" varchar(50) DEFAULT 'general' NOT NULL,
        "description" text,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      )
    `);
    tablesEnsured = true;
  } catch (e) {
    console.error("Failed to ensure settings tables:", e);
  }
}

// ১. সকল সেটিংস তালিকা (সুপার এডমিনের জন্য)
export const listSettings: Handler = async (c: any) => {
  await ensureTables();
  const allSettings = await db.query.settings.findMany();
  return c.json({ data: allSettings });
};

// ২. সাধারণ পাবলিক সেটিংস (লগিন পেজ বা সাধারণ ব্যবহারকারীর জন্য)
export const getPublicSettings: Handler = async (c: any) => {
  await ensureTables();
  const publicList = await db.query.settings.findMany({
    where: eq(settings.group, "general")
  });
  return c.json({ data: publicList });
};

// ৩. সেটিংস আপডেট বা তৈরি (Upsert)
export const saveSetting: Handler = async (c: any) => {
  const body = c.req.valid("json");
  const key = String(body.key).trim();
  const existing = await db.query.settings.findFirst({
    where: eq(settings.key, key)
  });

  if (existing) {
    const [updated] = await db
      .update(settings)
      .set({
        value: body.value,
        group: body.group || existing.group,
        description: body.description ?? existing.description,
        updatedAt: new Date()
      })
      .where(eq(settings.key, key))
      .returning();

    return c.json({ message: "Setting updated successfully", data: updated });
  }

  const [created] = await db
    .insert(settings)
    .values({
      key,
      value: body.value,
      group: body.group || "general",
      description: body.description
    })
    .returning();

  return c.json({ message: "Setting created successfully", data: created }, HttpStatusCodes.CREATED);
};

// ৪. একাধিক সেটিংস একসাথে সেভ করা (Bulk update)
export const bulkUpdateSettings: Handler = async (c: any) => {
  const { settings: settingsMap } = c.req.valid("json");
  const entries = Object.entries(settingsMap);

  for (const [key, value] of entries) {
    const existing = await db.query.settings.findFirst({
      where: eq(settings.key, key)
    });

    if (existing) {
      await db
        .update(settings)
        .set({ value: String(value ?? ""), updatedAt: new Date() })
        .where(eq(settings.key, key));
    } else {
      await db.insert(settings).values({
        key,
        value: String(value ?? ""),
        group: "general"
      });
    }
  }

  const updatedAll = await db.query.settings.findMany();
  return c.json({ message: "Settings saved successfully", data: updatedAll });
};

// ৫. ব্যাংক ও এমএফএস প্রোভাইডারের তালিকা পাওয়া
export const listProviders: Handler = async (c: any) => {
  await ensureTables();
  const type = c.req.query("type");
  const showAll = c.req.query("all") === "true";

  const conditions = [];
  if (type) conditions.push(eq(financialProviders.type, type));
  if (!showAll) conditions.push(eq(financialProviders.isActive, true));

  const list = await db.query.financialProviders.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: [desc(financialProviders.createdAt)]
  });
  return c.json({ data: list });
};

// ৬. নতুন ব্যাংক বা এমএফএস প্রোভাইডার তৈরি করা
export const createProvider: Handler = async (c: any) => {
  await ensureTables();
  const body = c.req.valid("json");
  const name = String(body.name).trim();
  const type = body.type;

  const existing = await db.query.financialProviders.findFirst({
    where: and(
      eq(financialProviders.type, type),
      eq(financialProviders.name, name)
    )
  });

  if (existing) {
    return c.json({ message: "This provider already exists" }, HttpStatusCodes.CONFLICT);
  }

  const [created] = await db
    .insert(financialProviders)
    .values({
      type,
      name,
      isActive: true
    })
    .returning();

  return c.json({ message: "Provider added successfully", data: created }, HttpStatusCodes.CREATED);
};

// ৭. প্রোভাইডার অ্যাক্টিভ বা ইনঅ্যাক্টিভ করা (টগল)
export const toggleProviderStatus: Handler = async (c: any) => {
  await ensureTables();
  const { id } = c.req.valid("param");
  const provider = await db.query.financialProviders.findFirst({
    where: eq(financialProviders.id, id)
  });

  if (!provider) {
    return c.json({ message: "Provider not found" }, HttpStatusCodes.NOT_FOUND);
  }

  const [updated] = await db
    .update(financialProviders)
    .set({
      isActive: !provider.isActive,
      updatedAt: new Date()
    })
    .where(eq(financialProviders.id, id))
    .returning();

  return c.json({
    message: `Provider is now ${updated.isActive ? "Active" : "Inactive"}`,
    data: updated
  });
};

// ৮. স্থায়ীভাবে ডিলিট সম্পূর্ণ ব্লক/নিষিদ্ধ করা (API Guard)
export const blockDeleteProvider: Handler = async (c: any) => {
  return c.json(
    {
      message: "Permanent deletion of financial providers is strictly prohibited to preserve historical financial ledger integrity. You can deactivate it instead."
    },
    HttpStatusCodes.FORBIDDEN
  );
};

