import { z } from "@/framework/facade.js";

export const SettingItemSchema = z.object({
  id: z.number(),
  key: z.string(),
  value: z.string().nullable().optional(),
  group: z.string(),
  description: z.string().nullable().optional(),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional()
});

export const UpdateSettingSchema = z.object({
  key: z.string().min(1, "Key is required"),
  value: z.string().optional(),
  group: z.string().default("general"),
  description: z.string().optional()
});

export const BulkUpdateSettingsSchema = z.object({
  settings: z.record(z.string(), z.string().optional())
});

export const ProviderItemSchema = z.object({
  id: z.number(),
  type: z.string(),
  name: z.string(),
  isActive: z.boolean(),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional()
});

export const CreateProviderSchema = z.object({
  type: z.enum(["bank", "mfs"]),
  name: z.string().min(1, "Name is required").max(100)
});

export const ProviderIdParamSchema = z.object({
  id: z.coerce.number()
});

export const RuleIdParamSchema = z.object({
  id: z.coerce.number()
});

export const CompanyOfferRuleSchema = z.object({
  id: z.number().optional(),
  providerId: z.number().nullable().optional(),
  title: z.string().min(1, "Title is required").max(150),
  transactionType: z.string().default("সকল"),
  triggerType: z.enum(["target_amount", "per_transaction", "transaction_count", "slab_range"]).default("target_amount"),
  targetThreshold: z.coerce.number().default(0),
  rewardType: z.enum(["percentage", "flat"]).default("percentage"),
  rewardValue: z.coerce.number().default(0),
  settlementType: z.enum(["instant", "daily", "monthly"]).default("monthly"),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  isActive: z.boolean().default(true)
});

export const CustomerFeeRuleSchema = z.object({
  id: z.number().optional(),
  transactionType: z.string().default("পে-বিল"),
  billerName: z.string().nullable().optional(),
  feeType: z.enum(["flat", "percentage", "slab"]).default("flat"),
  flatFee: z.coerce.number().default(0),
  percentageFee: z.coerce.number().default(0),
  slabsJson: z.array(
    z.object({
      min: z.number(),
      max: z.number(),
      fee: z.number()
    })
  ).nullable().optional(),
  isActive: z.boolean().default(true)
});
