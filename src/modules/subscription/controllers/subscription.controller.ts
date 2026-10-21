import { desc, eq } from "drizzle-orm";
import type { Handler } from "hono";
import { db, HttpStatusCodes } from "@/framework/facade.js";
import { plans, subscriptions } from "../database/models/subscription.js";

// ১. সকল প্ল্যান তালিকা পাওয়া
export const listPlans: Handler = async (c: any) => {
  const allPlans = await db.query.plans.findMany({
    orderBy: [desc(plans.createdAt)]
  });
  return c.json({ data: allPlans });
};

// ২. নতুন প্ল্যান তৈরি করা (সুপার এডমিন)
// একই নামে নতুন প্ল্যান তৈরি হলে আগের প্ল্যানটি স্বয়ংক্রিয়ভাবে ফ্রিজ/ইনঅ্যাক্টিভ (isActive = false) হয়ে যাবে
export const createPlan: Handler = async (c: any) => {
  const body = c.req.valid("json");
  const planName = String(body.name || "").trim();
  const maxAccounts = body.maxMfsAccounts ? Number(body.maxMfsAccounts) : null;

  // একই নামের পূর্বের সকল প্ল্যান স্বয়ংক্রিয়ভাবে ফ্রিজ/নিষ্ক্রিয় করা
  await db
    .update(plans)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(plans.name, planName));

  // নতুন রেট/শর্তের প্ল্যানটি সক্রিয় (isActive = true) হিসেবে যুক্ত করা
  const [newPlan] = await db.insert(plans).values({
    name: planName,
    description: body.description ?? null,
    price: String(body.price),
    durationDays: body.durationDays,
    yearlyDiscount: String(body.yearlyDiscount ?? 0),
    maxMfsAccounts: maxAccounts,
    isActive: true
  }).returning();

  return c.json({ message: "Plan created successfully. Previous plan with same name has been frozen.", data: newPlan }, HttpStatusCodes.CREATED);
};

// ৩. প্ল্যান আপডেট বা ডিলিট/ইনঅ্যাক্টিভ করা
export const togglePlanStatus: Handler = async (c: any) => {
  const { id } = c.req.valid("param");
  const plan = await db.query.plans.findFirst({ where: eq(plans.id, id) });
  if (!plan) {
    return c.json({ message: "Plan not found" }, HttpStatusCodes.NOT_FOUND);
  }

  const [updated] = await db
    .update(plans)
    .set({ isActive: !plan.isActive, updatedAt: new Date() })
    .where(eq(plans.id, id))
    .returning();

  return c.json({ message: "Plan status updated", data: updated });
};

// ৪. পেন্ডিং সাবস্ক্রিপশন তালিকা (সুপার এডমিনের জন্য)
export const listPendingSubscriptions: Handler = async (c: any) => {
  const pending = await db.query.subscriptions.findMany({
    where: eq(subscriptions.status, "pending"),
    with: {
      user: true,
      plan: true
    },
    orderBy: [desc(subscriptions.createdAt)]
  });
  return c.json({ data: pending });
};

// ৫. পেমেন্ট ভেরিফাই করে সাবস্ক্রিপশন Approve করা (সুপার এডমিন)
export const approveSubscription: Handler = async (c: any) => {
  const { id } = c.req.valid("param");
  const sub = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.id, id),
    with: { plan: true }
  });

  if (!sub) {
    return c.json({ message: "Subscription request not found" }, HttpStatusCodes.NOT_FOUND);
  }

  // এপ্রুভালের সঠিক তারিখ ও সময়
  const now = new Date();
  const durationDays = sub.plan?.durationDays ?? 30; // প্ল্যান অনুযায়ী ৩০ দিন বা ৩৬৫ দিন
  const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

  const [approved] = await db
    .update(subscriptions)
    .set({
      status: "active",
      activatedAt: now,
      expiresAt: expiresAt,
      updatedAt: now
    })
    .where(eq(subscriptions.id, id))
    .returning();

  return c.json({
    message: `Subscription approved successfully. Valid for ${durationDays} days.`,
    data: approved
  });
};
