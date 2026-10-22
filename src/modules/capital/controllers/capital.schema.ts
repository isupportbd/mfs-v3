import { z } from "@/framework/facade.js";

export const SaveCapitalSchema = z.object({
  shareholderId: z.coerce.number().int().positive("শেয়ারহোল্ডার নির্বাচন করুন"),
  amount: z.coerce.number().positive("পুঁজির সঠিক পরিমাণ দিন"),
  depositDate: z.string().min(1, "জমার তারিখ দিন"),
  paymentMethod: z.string().min(1, "লেনদেনের মাধ্যম নির্বাচন করুন"),
  note: z.string().optional().nullable()
});

export const CapitalIdParamsSchema = z.object({
  id: z.coerce.number().int().positive()
});
