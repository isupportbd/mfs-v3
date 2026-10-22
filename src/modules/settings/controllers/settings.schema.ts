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
