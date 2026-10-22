import { z } from "@/framework/facade.js";

export const CreateLoanSchema = z.object({
  type: z.enum(["payable", "receivable"]),
  personName: z.string().min(1, "ব্যক্তি বা প্রতিষ্ঠানের নাম দিন"),
  mobile: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  amount: z.coerce.number().positive("সঠিক টাকার অংক লিখুন"),
  paymentMethod: z.string().min(1, "লেনদেনের মাধ্যম নির্বাচন করুন").default("ক্যাশ"),
  loanDate: z.string().min(1, "ঋণ গ্রহণের তারিখ দিন"),
  dueDate: z.string().optional().nullable(),
  note: z.string().optional().nullable()
});

export const RecordPaymentSchema = z.object({
  amount: z.coerce.number().positive("পরিশোধের টাকার অংক দিন"),
  paymentDate: z.string().min(1, "পরিশোধের তারিখ দিন"),
  paymentMethod: z.string().min(1, "পরিশোধের মাধ্যম দিন").default("ক্যাশ"),
  note: z.string().optional().nullable()
});

export const LoanIdParamsSchema = z.object({
  id: z.coerce.number().int().positive()
});
