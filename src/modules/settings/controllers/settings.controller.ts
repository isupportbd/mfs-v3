import { and, desc, eq, sql } from "drizzle-orm";
import type { Handler } from "hono";
import { db, HttpStatusCodes } from "@/framework/facade.js";
import { financialProviders } from "../database/models/providers.js";
import { settings } from "../database/models/settings.js";
import { companyOfferRules } from "../database/models/company-offers.js";
import { customerFeeRules } from "../database/models/customer-fees.js";

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

// ==========================================
// ৯. কোম্পানি অফার রুলস (Company Offer Rules)
// ==========================================

export const listCompanyOffers: Handler = async (c: any) => {
  const auth = c.get("auth");
  const offers = await db.query.companyOfferRules.findMany({
    where: eq(companyOfferRules.userId, auth.id),
    orderBy: [desc(companyOfferRules.id)],
    with: { provider: true }
  });
  return c.json({ data: offers });
};

export const createCompanyOffer: Handler = async (c: any) => {
  const auth = c.get("auth");
  const body = c.req.valid("json");

  const [created] = await db
    .insert(companyOfferRules)
    .values({
      userId: auth.id,
      providerId: body.providerId || null,
      title: body.title,
      transactionType: body.transactionType,
      triggerType: body.triggerType,
      targetThreshold: String(body.targetThreshold || 0),
      rewardType: body.rewardType,
      rewardValue: String(body.rewardValue || 0),
      settlementType: body.settlementType,
      startDate: body.startDate || null,
      endDate: body.endDate || null,
      isActive: body.isActive !== undefined ? body.isActive : true
    })
    .returning();

  return c.json({ message: "অফার সফলভাবে সংরক্ষিত হয়েছে", data: created }, HttpStatusCodes.CREATED);
};

export const updateCompanyOffer: Handler = async (c: any) => {
  const auth = c.get("auth");
  const { id } = c.req.valid("param");
  const body = c.req.valid("json");

  const existing = await db.query.companyOfferRules.findFirst({
    where: and(eq(companyOfferRules.id, id), eq(companyOfferRules.userId, auth.id))
  });

  if (!existing) {
    return c.json({ message: "অফার পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
  }

  const [updated] = await db
    .update(companyOfferRules)
    .set({
      providerId: body.providerId !== undefined ? body.providerId : existing.providerId,
      title: body.title !== undefined ? body.title : existing.title,
      transactionType: body.transactionType !== undefined ? body.transactionType : existing.transactionType,
      triggerType: body.triggerType !== undefined ? body.triggerType : existing.triggerType,
      targetThreshold: body.targetThreshold !== undefined ? String(body.targetThreshold) : existing.targetThreshold,
      rewardType: body.rewardType !== undefined ? body.rewardType : existing.rewardType,
      rewardValue: body.rewardValue !== undefined ? String(body.rewardValue) : existing.rewardValue,
      settlementType: body.settlementType !== undefined ? body.settlementType : existing.settlementType,
      startDate: body.startDate !== undefined ? body.startDate : existing.startDate,
      endDate: body.endDate !== undefined ? body.endDate : existing.endDate,
      isActive: body.isActive !== undefined ? body.isActive : existing.isActive,
      updatedAt: new Date()
    })
    .where(and(eq(companyOfferRules.id, id), eq(companyOfferRules.userId, auth.id)))
    .returning();

  return c.json({ message: "অফার সফলভাবে আপডেট হয়েছে", data: updated });
};

export const deleteCompanyOffer: Handler = async (c: any) => {
  const auth = c.get("auth");
  const { id } = c.req.valid("param");

  await db
    .delete(companyOfferRules)
    .where(and(eq(companyOfferRules.id, id), eq(companyOfferRules.userId, auth.id)));

  return c.json({ message: "অফার মুছে ফেলা হয়েছে" });
};

export const toggleCompanyOfferStatus: Handler = async (c: any) => {
  const auth = c.get("auth");
  const { id } = c.req.valid("param");

  const existing = await db.query.companyOfferRules.findFirst({
    where: and(eq(companyOfferRules.id, id), eq(companyOfferRules.userId, auth.id))
  });

  if (!existing) {
    return c.json({ message: "অফার পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
  }

  const [updated] = await db
    .update(companyOfferRules)
    .set({
      isActive: !existing.isActive,
      updatedAt: new Date()
    })
    .where(and(eq(companyOfferRules.id, id), eq(companyOfferRules.userId, auth.id)))
    .returning();

  return c.json({ message: "স্ট্যাটাস পরিবর্তন হয়েছে", data: updated });
};

// ==========================================
// ১০. গ্রাহক সার্ভিস চার্জ পলিসি (Customer Fee Rules)
// ==========================================

export const listCustomerFees: Handler = async (c: any) => {
  const auth = c.get("auth");
  const fees = await db.query.customerFeeRules.findMany({
    where: eq(customerFeeRules.userId, auth.id),
    orderBy: [desc(customerFeeRules.id)]
  });
  return c.json({ data: fees });
};

export const createCustomerFee: Handler = async (c: any) => {
  const auth = c.get("auth");
  const body = c.req.valid("json");

  const [created] = await db
    .insert(customerFeeRules)
    .values({
      userId: auth.id,
      transactionType: body.transactionType,
      billerName: body.billerName || null,
      feeType: body.feeType,
      flatFee: String(body.flatFee || 0),
      percentageFee: String(body.percentageFee || 0),
      slabsJson: body.slabsJson || null,
      isActive: body.isActive !== undefined ? body.isActive : true
    })
    .returning();

  return c.json({ message: "সার্ভিস ফি পলিসি সফলভাবে তৈরি হয়েছে", data: created }, HttpStatusCodes.CREATED);
};

export const updateCustomerFee: Handler = async (c: any) => {
  const auth = c.get("auth");
  const { id } = c.req.valid("param");
  const body = c.req.valid("json");

  const existing = await db.query.customerFeeRules.findFirst({
    where: and(eq(customerFeeRules.id, id), eq(customerFeeRules.userId, auth.id))
  });

  if (!existing) {
    return c.json({ message: "পলিসি পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
  }

  const [updated] = await db
    .update(customerFeeRules)
    .set({
      transactionType: body.transactionType !== undefined ? body.transactionType : existing.transactionType,
      billerName: body.billerName !== undefined ? body.billerName : existing.billerName,
      feeType: body.feeType !== undefined ? body.feeType : existing.feeType,
      flatFee: body.flatFee !== undefined ? String(body.flatFee) : existing.flatFee,
      percentageFee: body.percentageFee !== undefined ? String(body.percentageFee) : existing.percentageFee,
      slabsJson: body.slabsJson !== undefined ? body.slabsJson : existing.slabsJson,
      isActive: body.isActive !== undefined ? body.isActive : existing.isActive,
      updatedAt: new Date()
    })
    .where(and(eq(customerFeeRules.id, id), eq(customerFeeRules.userId, auth.id)))
    .returning();

  return c.json({ message: "সার্ভিস ফি পলিসি আপডেট হয়েছে", data: updated });
};

export const deleteCustomerFee: Handler = async (c: any) => {
  const auth = c.get("auth");
  const { id } = c.req.valid("param");

  await db
    .delete(customerFeeRules)
    .where(and(eq(customerFeeRules.id, id), eq(customerFeeRules.userId, auth.id)));

  return c.json({ message: "পলিসি মুছে ফেলা হয়েছে" });
};

export const toggleCustomerFeeStatus: Handler = async (c: any) => {
  const auth = c.get("auth");
  const { id } = c.req.valid("param");

  const existing = await db.query.customerFeeRules.findFirst({
    where: and(eq(customerFeeRules.id, id), eq(customerFeeRules.userId, auth.id))
  });

  if (!existing) {
    return c.json({ message: "পলিসি পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
  }

  const [updated] = await db
    .update(customerFeeRules)
    .set({
      isActive: !existing.isActive,
      updatedAt: new Date()
    })
    .where(and(eq(customerFeeRules.id, id), eq(customerFeeRules.userId, auth.id)))
    .returning();

  return c.json({ message: "স্ট্যাটাস পরিবর্তন হয়েছে", data: updated });
};

