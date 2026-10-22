import { z } from "@/framework/facade.js";

export const CompanyProfileSchema = z.object({
  id: z.number().optional(),
  userId: z.number().optional(),
  companyName: z.string().min(1, "কোম্পানী বা প্রতিষ্ঠানের নাম আবশ্যক"),
  businessType: z.string().default("একক মালিকানা"),
  phone: z.string().optional().nullable(),
  email: z.string().email("সঠিক ইমেইল ঠিকানা দিন").optional().nullable().or(z.literal("")),
  address: z.string().optional().nullable(),
  tradeLicense: z.string().optional().nullable(),
  tinBin: z.string().optional().nullable()
});

export const ShareholderItemSchema = z.object({
  id: z.number().optional(),
  userId: z.number().optional(),
  name: z.string().min(1, "শেয়ারহোল্ডারের নাম আবশ্যক"),
  mobile: z.string().optional().nullable(),
  sharePercentage: z.coerce.number().min(0).max(100, "শেয়ারের হার ০% থেকে ১০০% এর মধ্যে হতে হবে"),
  role: z.string().default("শেয়ারহোল্ডার"),
  nid: z.string().optional().nullable(),
  isActive: z.boolean().default(true)
});

export const SaveCompanyProfileSchema = z.object({
  companyName: z.string().min(1, "কোম্পানী বা প্রতিষ্ঠানের নাম আবশ্যক"),
  businessType: z.string().default("একক মালিকানা"),
  phone: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  tradeLicense: z.string().optional().nullable(),
  tinBin: z.string().optional().nullable()
});

export const SaveShareholderSchema = z.object({
  name: z.string().min(1, "শেয়ারহোল্ডারের নাম আবশ্যক"),
  mobile: z.string().optional().nullable(),
  sharePercentage: z.coerce.number().min(0).max(100, "শেয়ারের হার ০% থেকে ১০০% এর মধ্যে হতে হবে"),
  role: z.string().default("শেয়ারহোল্ডার"),
  nid: z.string().optional().nullable(),
  isActive: z.boolean().default(true)
});

export const ShareholderIdParamsSchema = z.object({
  id: z.coerce.number().int().positive()
});

export const SavePrintSettingsSchema = z.object({
  printerLayout: z.string().default("pos"),
  printHeaderShow: z.string().default("yes")
});

export const SaveReceiptSettingsSchema = z.object({
  receiptPrefix: z.string().default("MR-"),
  receiptFooterNote: z.string().optional().nullable()
});

