import { z } from "@/framework/facade.js";

// Plan Schemas
export const PlanItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable().optional(),
  price: z.string(),
  durationDays: z.number(),
  yearlyDiscount: z.string().nullable().optional(),
  isActive: z.boolean(),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional()
});

export const CreatePlanSchema = z.object({
  name: z.string().min(2, "Plan name is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be 0 or more"),
  durationDays: z.coerce.number().int().positive("Duration must be at least 1 day"),
  yearlyDiscount: z.coerce.number().min(0).max(100).optional().default(0)
});

export const UpdatePlanSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  price: z.coerce.number().min(0).optional(),
  durationDays: z.coerce.number().int().positive().optional(),
  isActive: z.boolean().optional()
});

export const PlanIdParamsSchema = z.object({
  id: z.coerce.number().int().positive()
});

// Subscription Approval Schema
export const ApproveSubscriptionSchema = z.object({
  subscriptionId: z.coerce.number().int().positive()
});
