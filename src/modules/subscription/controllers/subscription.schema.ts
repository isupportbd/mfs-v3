import { z } from "@/framework/facade.js";

// Plan Schemas
export const PlanItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable().optional(),
  price: z.string(),
  durationDays: z.number(),
  yearlyDiscount: z.string().nullable().optional(),
  maxMfsAccounts: z.number().nullable().optional(),
  maxTransactions: z.number().nullable().optional(),
  isActive: z.boolean(),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional()
});

export const CreatePlanSchema = z.object({
  name: z.string().min(2, "Plan name is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be 0 or more"),
  durationDays: z.coerce.number().int().positive("Duration must be at least 1 day"),
  yearlyDiscount: z.coerce.number().min(0).max(100).optional().default(0),
  maxMfsAccounts: z.coerce.number().min(0).nullable().optional(), // 0 বা null মানে Unlimited
  maxTransactions: z.coerce.number().min(0).nullable().optional() // 0 বা null মানে Unlimited
});

export const UpdatePlanSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  price: z.coerce.number().min(0).optional(),
  durationDays: z.coerce.number().int().positive().optional(),
  maxMfsAccounts: z.coerce.number().min(0).nullable().optional(),
  maxTransactions: z.coerce.number().min(0).nullable().optional(),
  isActive: z.boolean().optional()
});

export const PlanIdParamsSchema = z.object({
  id: z.coerce.number().int().positive()
});

// Subscription Approval Schema
export const ApproveSubscriptionSchema = z.object({
  subscriptionId: z.coerce.number().int().positive()
});

export const RequestSubscriptionSchema = z.object({
  planId: z.coerce.number().int().positive("প্লান নির্বাচন আবশ্যক"),
  paymentMethod: z.string().min(1, "পেমেন্ট মাধ্যম আবশ্যক"),
  trxId: z.string().min(1, "ট্রানজেকশন আইডি আবশ্যক"),
  paymentNote: z.string().optional()
});
