import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import type { Handler } from "hono";
import { broadcast, db, HttpStatusCodes, queueJob } from "@/framework/facade.js";
import { redisReady } from "@/framework/redis/client.js";
import { customers } from "../database/models/customers.js";

let tablesEnsured = false;
async function ensureTables() {
  if (tablesEnsured) return;
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "customers" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL REFERENCES "users"("id") ON UPDATE cascade ON DELETE cascade,
        "name" varchar(255) NOT NULL,
        "mobile" varchar(50) NOT NULL,
        "type" varchar(50) DEFAULT 'ব্যক্তিগত' NOT NULL,
        "organization_name" varchar(255),
        "address" text,
        "note" text,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      )
    `);
    tablesEnsured = true;
  } catch (e) {
    console.error("Failed to ensure customers table:", e);
  }
}

/**
 * কাস্টমার তালিকা ফেচ করা (মার্চেন্ট ভিত্তিক)
 */
export const index: Handler = async (c: any) => {
  await ensureTables();
  const auth = c.get("auth");
  if (!auth?.id) {
    return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);
  }

  const query = c.req.query("search");
  let customerList;

  if (query && String(query).trim()) {
    const term = `%${String(query).trim()}%`;
    customerList = await db.query.customers.findMany({
      where: and(
        eq(customers.userId, auth.id),
        or(
          ilike(customers.name, term),
          ilike(customers.mobile, term),
          ilike(customers.organizationName, term),
          ilike(customers.address, term)
        )
      ),
      orderBy: [desc(customers.createdAt)]
    });
  } else {
    customerList = await db.query.customers.findMany({
      where: eq(customers.userId, auth.id),
      orderBy: [desc(customers.createdAt)]
    });
  }

  return c.json({
    message: "কাস্টমার তালিকা সফলভাবে লোড হয়েছে",
    data: customerList || [],
    total: customerList?.length || 0
  });
};

/**
 * নির্দিষ্ট কাস্টমারের বিবরণ
 */
export const show: Handler = async (c: any) => {
  await ensureTables();
  const auth = c.get("auth");
  const params = c.req.valid("param");

  const customer = await db.query.customers.findFirst({
    where: and(eq(customers.id, Number(params.id)), eq(customers.userId, auth.id))
  });

  if (!customer) {
    return c.json({ message: "কাস্টমার পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
  }

  return c.json({ message: "কাস্টমার বিবরণ", data: customer });
};

/**
 * নতুন কাস্টমার সংরক্ষণ (Create Customer)
 * কিউ সাপোর্ট: হাজার হাজার ব্যবহারকারী একসাথে রিকোয়েস্ট পাঠালেও
 * BullMQ কিউতে জমা হয়ে ক্রমান্বয়ে সুরক্ষিতভাবে ডাটাবেজে এন্ট্রি হবে
 * এবং রিয়েলটাইমে সব ক্লায়েন্টে ব্রডকাস্ট হবে।
 */
export const store: Handler = async (c: any) => {
  await ensureTables();
  const auth = c.get("auth");
  if (!auth?.id) {
    return c.json({ message: "অননুমোদিত অ্যাক্সেস" }, HttpStatusCodes.UNAUTHORIZED);
  }

  const body = c.req.valid("json");
  const customerPayload = {
    userId: auth.id,
    name: body.name.trim(),
    mobile: body.mobile.trim(),
    type: body.type?.trim() || "সাধারণ",
    organizationName: body.organizationName ? body.organizationName.trim() : null,
    address: body.address ? body.address.trim() : null,
    note: body.note ? body.note.trim() : null,
    isActive: true
  };

  // উচ্চ ট্রাফিকের সময় হাজার হাজার রিকোয়েস্ট নিরাপদে ডাটাবেজে হ্যান্ডেল করার জন্য কিউ
  if (redisReady()) {
    await queueJob("customer.create", customerPayload, { queue: "customers" });
    return c.json(
      {
        message: "কাস্টমার সফলভাবে কিউতে যোগ করা হয়েছে",
        queued: true,
        data: customerPayload
      },
      HttpStatusCodes.ACCEPTED
    );
  }

  // ফালব্যাক (যদি কোনো কারণে রেডিস অফলাইন থাকে): সরাসরি ডাটাবেজে সংরক্ষণ ও ব্রডকাস্ট
  const [newCustomer] = await db
    .insert(customers)
    .values(customerPayload)
    .returning();

  broadcast("customer.created", newCustomer, { all: true, rooms: ["customers"] });

  return c.json(
    { message: "কাস্টমার সফলভাবে সংরক্ষণ করা হয়েছে", data: newCustomer },
    HttpStatusCodes.CREATED
  );
};

/**
 * কাস্টমার তথ্য আপডেট (Update Customer)
 */
export const update: Handler = async (c: any) => {
  await ensureTables();
  const auth = c.get("auth");
  const params = c.req.valid("param");
  const body = c.req.valid("json");

  const existing = await db.query.customers.findFirst({
    where: and(eq(customers.id, Number(params.id)), eq(customers.userId, auth.id))
  });

  if (!existing) {
    return c.json({ message: "কাস্টমার পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
  }

  const [updatedCustomer] = await db
    .update(customers)
    .set({
      name: body.name !== undefined ? body.name.trim() : existing.name,
      mobile: body.mobile !== undefined ? body.mobile.trim() : existing.mobile,
      type: body.type !== undefined ? body.type.trim() : existing.type,
      organizationName:
        body.organizationName !== undefined
          ? body.organizationName ? body.organizationName.trim() : null
          : existing.organizationName,
      address:
        body.address !== undefined
          ? body.address ? body.address.trim() : null
          : existing.address,
      note:
        body.note !== undefined
          ? body.note ? body.note.trim() : null
          : existing.note,
      isActive: body.isActive !== undefined ? body.isActive : existing.isActive,
      updatedAt: new Date()
    })
    .where(and(eq(customers.id, Number(params.id)), eq(customers.userId, auth.id)))
    .returning();

  // রিয়েলটাইম আপডেট ব্রডকাস্ট
  broadcast("customer.updated", updatedCustomer, { all: true, rooms: ["customers"] });

  return c.json({ message: "কাস্টমার তথ্য সফলভাবে আপডেট হয়েছে", data: updatedCustomer });
};

/**
 * কাস্টমার মুছে ফেলা (Delete Customer)
 */
export const destroy: Handler = async (c: any) => {
  await ensureTables();
  const auth = c.get("auth");
  const params = c.req.valid("param");

  const existing = await db.query.customers.findFirst({
    where: and(eq(customers.id, Number(params.id)), eq(customers.userId, auth.id))
  });

  if (!existing) {
    return c.json({ message: "কাস্টমার পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
  }

  await db
    .delete(customers)
    .where(and(eq(customers.id, Number(params.id)), eq(customers.userId, auth.id)));

  // রিয়েলটাইম ডিলিট ব্রডকাস্ট
  broadcast("customer.deleted", { id: Number(params.id), userId: auth.id }, { all: true, rooms: ["customers"] });

  return c.json({ message: "কাস্টমার সফলভাবে মুছে ফেলা হয়েছে" });
};
