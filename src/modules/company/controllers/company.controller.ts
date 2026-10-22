import { and, desc, eq, sql } from "drizzle-orm";
import type { Handler } from "hono";
import { db, HttpStatusCodes } from "@/framework/facade.js";
import { users } from "@/modules/auth/database/models/user.js";
import { companyProfiles, shareholders } from "../database/models/company.js";

let tablesEnsured = false;
async function ensureTables() {
  if (tablesEnsured) return;
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "company_profiles" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL UNIQUE REFERENCES "users"("id") ON UPDATE cascade ON DELETE cascade,
        "company_name" varchar(255) NOT NULL,
        "business_type" varchar(100) DEFAULT 'একক মালিকানা' NOT NULL,
        "phone" varchar(50),
        "email" varchar(255),
        "address" text,
        "trade_license" varchar(100),
        "tin_bin" varchar(100),
        "established_date" date,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "shareholders" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL REFERENCES "users"("id") ON UPDATE cascade ON DELETE cascade,
        "name" varchar(255) NOT NULL,
        "mobile" varchar(50),
        "share_percentage" numeric(5, 2) DEFAULT '0.00' NOT NULL,
        "role" varchar(100) DEFAULT 'শেয়ারহোল্ডার' NOT NULL,
        "nid" varchar(100),
        "is_active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      )
    `);

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

    try {
      await db.execute(sql`ALTER TABLE "company_profiles" ADD COLUMN IF NOT EXISTS "printer_layout" varchar(50) DEFAULT 'pos'`);
      await db.execute(sql`ALTER TABLE "company_profiles" ADD COLUMN IF NOT EXISTS "print_header_show" varchar(10) DEFAULT 'yes'`);
      await db.execute(sql`ALTER TABLE "company_profiles" ADD COLUMN IF NOT EXISTS "receipt_prefix" varchar(50) DEFAULT 'MR-'`);
      await db.execute(sql`ALTER TABLE "company_profiles" ADD COLUMN IF NOT EXISTS "receipt_footer_note" text DEFAULT 'আমাদের সাথে লেনদেন করার জন্য ধন্যবাদ!'`);
    } catch {
      // columns might already exist
    }

    tablesEnsured = true;
  } catch (e) {
    console.error("Failed to ensure company and shareholders tables:", e);
  }
}

/**
 * বর্তমান ইউজারের কোম্পানি প্রোফাইল ও শেয়ারহোল্ডারদের তথ্য ফেচ করা
 */
export const getCompanySettings: Handler = async (c: any) => {
  await ensureTables();
  const auth = c.get("auth");
  if (!auth?.id) {
    return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);
  }

  // ১. ইউজারের কোম্পানি প্রোফাইল খোঁজা
  let profile = await db.query.companyProfiles.findFirst({
    where: eq(companyProfiles.userId, auth.id)
  });

  // যদি পূর্বে তৈরি করা না থাকে, তবে ইউজারের বেসিক ইনফো থেকে ইনিশিয়াল অবজেক্ট তৈরি
  if (!profile) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, auth.id)
    });

    profile = {
      id: 0,
      userId: auth.id,
      companyName: user?.companyName || user?.name || "",
      businessType: "একক মালিকানা",
      phone: user?.mobile || "",
      email: user?.email || "",
      address: user?.address || "",
      tradeLicense: "",
      tinBin: "",
      establishedDate: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // ২. ইউজারের শেয়ারহোল্ডার তালিকা
  const shareholderList = await db.query.shareholders.findMany({
    where: eq(shareholders.userId, auth.id),
    orderBy: [shareholders.id]
  });

  // মোট শেয়ার হিসাব
  const totalSharePercentage = shareholderList.reduce((acc, s) => acc + (Number(s.sharePercentage) || 0), 0);

  return c.json({
    message: "কোম্পানি প্রোফাইল সফলভাবে লোড হয়েছে",
    data: {
      profile,
      shareholders: shareholderList,
      summary: {
        totalShareholders: shareholderList.length,
        totalSharePercentage: Number(totalSharePercentage.toFixed(2))
      }
    }
  });
};

/**
 * কোম্পানির প্রোফাইল আপডেট বা সংরক্ষণ
 */
export const saveCompanyProfile: Handler = async (c: any) => {
  await ensureTables();
  const auth = c.get("auth");
  if (!auth?.id) {
    return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);
  }

  const body = c.req.valid("json");
  const companyName = String(body.companyName).trim();
  const businessType = String(body.businessType || "একক মালিকানা").trim();
  const phone = body.phone ? String(body.phone).trim() : null;
  const email = body.email ? String(body.email).trim() : null;
  const address = body.address ? String(body.address).trim() : null;
  const tradeLicense = body.tradeLicense ? String(body.tradeLicense).trim() : null;
  const tinBin = body.tinBin ? String(body.tinBin).trim() : null;

  const existing = await db.query.companyProfiles.findFirst({
    where: eq(companyProfiles.userId, auth.id)
  });

  let savedProfile;
  if (existing) {
    const [updated] = await db
      .update(companyProfiles)
      .set({
        companyName,
        businessType,
        phone,
        email,
        address,
        tradeLicense,
        tinBin,
        updatedAt: new Date()
      })
      .where(eq(companyProfiles.userId, auth.id))
      .returning();
    savedProfile = updated;
  } else {
    const [created] = await db
      .insert(companyProfiles)
      .values({
        userId: auth.id,
        companyName,
        businessType,
        phone,
        email,
        address,
        tradeLicense,
        tinBin
      })
      .returning();
    savedProfile = created;
  }

  // ইউজারের মূল কোম্পানী নামও সিঙ্ক করা
  await db
    .update(users)
    .set({
      companyName,
      updatedAt: new Date()
    })
    .where(eq(users.id, auth.id));

  return c.json({
    message: "কোম্পানীর তথ্য সফলভাবে সংরক্ষণ করা হয়েছে",
    data: savedProfile
  });
};

/**
 * নতুন শেয়ারহোল্ডার যোগ করা
 */
export const createShareholder: Handler = async (c: any) => {
  await ensureTables();
  const auth = c.get("auth");
  if (!auth?.id) {
    return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);
  }

  const body = c.req.valid("json");
  const name = String(body.name).trim();
  const mobile = body.mobile ? String(body.mobile).trim() : null;
  const role = String(body.role || "শেয়ারহোল্ডার").trim();
  const sharePercentage = String(Number(body.sharePercentage) || 0);
  const nid = body.nid ? String(body.nid).trim() : null;
  const isActive = body.isActive !== undefined ? Boolean(body.isActive) : true;

  const [newShareholder] = await db
    .insert(shareholders)
    .values({
      userId: auth.id,
      name,
      mobile,
      role,
      sharePercentage,
      nid,
      isActive
    })
    .returning();

  return c.json({
    message: "শেয়ারহোল্ডার সফলভাবে যোগ করা হয়েছে",
    data: newShareholder
  }, HttpStatusCodes.CREATED);
};

/**
 * শেয়ারহোল্ডার তথ্য আপডেট করা
 */
export const updateShareholder: Handler = async (c: any) => {
  await ensureTables();
  const auth = c.get("auth");
  if (!auth?.id) {
    return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);
  }

  const { id } = c.req.valid("param");
  const body = c.req.valid("json");

  const existing = await db.query.shareholders.findFirst({
    where: and(eq(shareholders.id, Number(id)), eq(shareholders.userId, auth.id))
  });

  if (!existing) {
    return c.json({ message: "শেয়ারহোল্ডার পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
  }

  const [updated] = await db
    .update(shareholders)
    .set({
      name: body.name ? String(body.name).trim() : existing.name,
      mobile: body.mobile !== undefined ? (body.mobile ? String(body.mobile).trim() : null) : existing.mobile,
      role: body.role ? String(body.role).trim() : existing.role,
      sharePercentage: body.sharePercentage !== undefined ? String(Number(body.sharePercentage) || 0) : existing.sharePercentage,
      nid: body.nid !== undefined ? (body.nid ? String(body.nid).trim() : null) : existing.nid,
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : existing.isActive,
      updatedAt: new Date()
    })
    .where(and(eq(shareholders.id, Number(id)), eq(shareholders.userId, auth.id)))
    .returning();

  return c.json({
    message: "শেয়ারহোল্ডার তথ্য সফলভাবে আপডেট হয়েছে",
    data: updated
  });
};

/**
 * শেয়ারহোল্ডার মুছে ফেলা
 */
export const deleteShareholder: Handler = async (c: any) => {
  await ensureTables();
  const auth = c.get("auth");
  if (!auth?.id) {
    return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);
  }

  const { id } = c.req.valid("param");

  const existing = await db.query.shareholders.findFirst({
    where: and(eq(shareholders.id, Number(id)), eq(shareholders.userId, auth.id))
  });

  if (!existing) {
    return c.json({ message: "শেয়ারহোল্ডার পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
  }

  await db
    .delete(shareholders)
    .where(and(eq(shareholders.id, Number(id)), eq(shareholders.userId, auth.id)));

  return c.json({
    message: "শেয়ারহোল্ডার সফলভাবে মুছে ফেলা হয়েছে"
  });
};

/**
 * প্রিন্ট সেটিংস আপডেট বা সংরক্ষণ
 */
export const savePrintSettings: Handler = async (c: any) => {
  await ensureTables();
  const auth = c.get("auth");
  if (!auth?.id) {
    return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);
  }

  const body = c.req.valid("json");
  const printerLayout = String(body.printerLayout || "pos").trim();
  const printHeaderShow = String(body.printHeaderShow || "yes").trim();

  const existing = await db.query.companyProfiles.findFirst({
    where: eq(companyProfiles.userId, auth.id)
  });

  if (existing) {
    await db
      .update(companyProfiles)
      .set({
        printerLayout,
        printHeaderShow,
        updatedAt: new Date()
      })
      .where(eq(companyProfiles.userId, auth.id));
  } else {
    const user = await db.query.users.findFirst({ where: eq(users.id, auth.id) });
    await db.insert(companyProfiles).values({
      userId: auth.id,
      companyName: user?.companyName || user?.name || "আমার প্রতিষ্ঠান",
      printerLayout,
      printHeaderShow
    });
  }

  return c.json({
    message: "প্রিন্ট সেটিংস সফলভাবে আপডেট করা হয়েছে",
    data: { printerLayout, printHeaderShow }
  });
};

/**
 * মানি রিসিট সেটিংস আপডেট বা সংরক্ষণ
 */
export const saveReceiptSettings: Handler = async (c: any) => {
  await ensureTables();
  const auth = c.get("auth");
  if (!auth?.id) {
    return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);
  }

  const body = c.req.valid("json");
  const receiptPrefix = String(body.receiptPrefix || "MR-").trim();
  const receiptFooterNote = body.receiptFooterNote ? String(body.receiptFooterNote).trim() : null;

  const existing = await db.query.companyProfiles.findFirst({
    where: eq(companyProfiles.userId, auth.id)
  });

  if (existing) {
    await db
      .update(companyProfiles)
      .set({
        receiptPrefix,
        receiptFooterNote,
        updatedAt: new Date()
      })
      .where(eq(companyProfiles.userId, auth.id));
  } else {
    const user = await db.query.users.findFirst({ where: eq(users.id, auth.id) });
    await db.insert(companyProfiles).values({
      userId: auth.id,
      companyName: user?.companyName || user?.name || "আমার প্রতিষ্ঠান",
      receiptPrefix,
      receiptFooterNote
    });
  }

  return c.json({
    message: "মানি রিসিট সেটিংস সফলভাবে আপডেট করা হয়েছে",
    data: { receiptPrefix, receiptFooterNote }
  });
};

