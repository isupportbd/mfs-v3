import { z } from "@/framework/facade.js";

export const CustomerItemSchema = z.object({
  id: z.number(),
  userId: z.number(),
  name: z.string(),
  mobile: z.string(),
  type: z.string(),
  organizationName: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  isActive: z.boolean(),
  createdAt: z.any(),
  updatedAt: z.any()
});

export const CreateCustomerSchema = z.object({
  name: z.string().min(1, "কাস্টমারের নাম আবশ্যক"),
  mobile: z.string().min(1, "মোবাইল নম্বর আবশ্যক"),
  type: z.string().default("সাধারণ"),
  organizationName: z.string().optional().nullable(),
  address: z.string().min(1, "ঠিকানা আবশ্যক"),
  note: z.string().optional().nullable()
});

export const UpdateCustomerSchema = z.object({
  name: z.string().min(1, "কাস্টমারের নাম আবশ্যক"),
  mobile: z.string().min(1, "মোবাইল নম্বর আবশ্যক"),
  type: z.string().default("সাধারণ"),
  organizationName: z.string().optional().nullable(),
  address: z.string().min(1, "ঠিকানা আবশ্যক"),
  note: z.string().optional().nullable(),
  isActive: z.boolean().optional()
});

export const CustomerIdParamsSchema = z.object({
  id: z.coerce.number().int().positive()
});

export const CustomerListResponseSchema = z.object({
  message: z.string(),
  data: z.array(CustomerItemSchema),
  total: z.number().optional()
});

export const CustomerSingleResponseSchema = z.object({
  message: z.string(),
  data: CustomerItemSchema
});

export const CustomerMessageSchema = z.object({
  message: z.string()
});
