import { z } from "@/framework/facade.js";

export const ProviderItemSchema = z.object({
  id: z.number(),
  userId: z.number(),
  providerId: z.number().nullable().optional(),
  providerName: z.string(),
  accountType: z.string(), // 'এজেন্ট' | 'পার্সনাল' | 'কারেন্ট' | 'সেইভিংস'
  accountNumber: z.string(),
  balance: z.string().or(z.number()),
  note: z.string().nullable().optional(),
  isActive: z.boolean(),
  createdAt: z.any(),
  updatedAt: z.any()
});

export const CreateProviderSchema = z.object({
  providerId: z.number().optional().nullable(),
  providerName: z.string().min(1, "প্রোভাইডারের নাম আবশ্যক"),
  accountType: z.enum(["এজেন্ট", "পার্সনাল", "কারেন্ট", "সেইভিংস", "বি2বি"], {
    message: "সঠিক একাউন্টের ধরন নির্বাচন করুন (এজেন্ট, পার্সনাল, কারেন্ট, সেইভিংস অথবা বি2বি)"
  }),
  accountNumber: z.string().min(1, "একাউন্ট নম্বর আবশ্যক"),
  balance: z.coerce.number().default(0),
  note: z.string().optional().nullable()
});

export const UpdateProviderSchema = z.object({
  providerId: z.number().optional().nullable(),
  providerName: z.string().min(1, "প্রোভাইডারের নাম আবশ্যক"),
  accountType: z.enum(["এজেন্ট", "পার্সনাল", "কারেন্ট", "সেইভিংস", "বি2বি"], {
    message: "সঠিক একাউন্টের ধরন নির্বাচন করুন (এজেন্ট, পার্সনাল, কারেন্ট, সেইভিংস অথবা বি2বি)"
  }),
  accountNumber: z.string().min(1, "একাউন্ট নম্বর আবশ্যক"),
  balance: z.coerce.number().optional(),
  note: z.string().optional().nullable(),
  isActive: z.boolean().optional()
});

export const ProviderIdParamsSchema = z.object({
  id: z.coerce.number().int().positive()
});

export const ProviderListResponseSchema = z.object({
  message: z.string(),
  data: z.array(ProviderItemSchema),
  total: z.number().optional()
});

export const ProviderSingleResponseSchema = z.object({
  message: z.string(),
  data: ProviderItemSchema
});

export const ProviderMessageSchema = z.object({
  message: z.string()
});
