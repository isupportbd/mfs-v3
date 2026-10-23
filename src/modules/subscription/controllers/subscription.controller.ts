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
  const maxTrx = body.maxTransactions ? Number(body.maxTransactions) : null;

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
    maxMfsAccounts: maxAccounts && maxAccounts > 0 ? maxAccounts : null,
    maxTransactions: maxTrx && maxTrx > 0 ? maxTrx : null,
    isActive: true
  }).returning();

  return c.json({ message: "Plan created successfully. Previous plan with same name has been frozen.", data: newPlan }, HttpStatusCodes.CREATED);
};

// ৩. পেন্ডিং সাবস্ক্রিপশন তালিকা (সুপার এডমিনের জন্য)
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

// ৪. সকল সাবস্ক্রিপশন ও ইউজারের তালিকা (সুপার এডমিনের জন্য)
export const listAllSubscriptions: Handler = async (c: any) => {
  const all = await db.query.subscriptions.findMany({
    with: {
      user: true,
      plan: true
    },
    orderBy: [desc(subscriptions.id)]
  });
  return c.json({ data: all });
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

// ৫.১ সাবস্ক্রিপশন Reject করা (সুপার এডমিন)
export const rejectSubscription: Handler = async (c: any) => {
  const { id } = c.req.valid("param");
  const sub = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.id, id)
  });

  if (!sub) {
    return c.json({ message: "Subscription request not found" }, HttpStatusCodes.NOT_FOUND);
  }

  const [rejected] = await db
    .update(subscriptions)
    .set({
      status: "cancelled",
      updatedAt: new Date()
    })
    .where(eq(subscriptions.id, id))
    .returning();

  return c.json({
    message: "Subscription request rejected/cancelled",
    data: rejected
  });
};

// ৬. বর্তমান ইউজারের সক্রিয় সাবস্ক্রিপশন ও সকল পূর্ববর্তী হিস্ট্রি
export const getMySubscription: Handler = async (c: any) => {
  const auth = c.get("auth");

  const history = await db.query.subscriptions.findMany({
    where: eq(subscriptions.userId, auth.id),
    with: { plan: true },
    orderBy: [desc(subscriptions.id)]
  });

  // বর্তমান সক্রিয় বা ট্রায়াল সাবস্ক্রিপশন (যদি থাকে)
  const current = history.find(s => s.status === "active" || s.status === "trial") || history[0] || null;

  return c.json({
    data: {
      current,
      history
    }
  });
};

// ৭. ইউজার নতুন প্লানের জন্য পেমেন্ট রিকোয়েস্ট সাবমিট করা (আপগ্রেড / পরিবর্তন)
export const requestSubscription: Handler = async (c: any) => {
  const auth = c.get("auth");
  const body = c.req.valid("json");

  const plan = await db.query.plans.findFirst({
    where: eq(plans.id, body.planId)
  });

  if (!plan) {
    return c.json({ message: "প্লানটি পাওয়া যায়নি" }, HttpStatusCodes.NOT_FOUND);
  }

  const [created] = await db
    .insert(subscriptions)
    .values({
      userId: auth.id,
      planId: plan.id,
      status: "pending",
      paymentMethod: body.paymentMethod,
      trxId: body.trxId,
      paymentNote: body.paymentNote || null,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .returning();

  return c.json(
    {
      message: "সাবস্ক্রিপশন রিকোয়েস্ট জমা হয়েছে। সুপারএডমিন ভেরিফাই করে সক্রিয় করবেন।",
      data: created
    },
    HttpStatusCodes.CREATED
  );
};
