import { z } from "@/framework/facade.js";

export const CreateTransactionSchema = z.object({
  type: z.enum(["ক্যাশ ইন", "ক্যাশ আউট", "পে-বিল", "ট্রান্সফার"]),
  transferSubtype: z.string().optional().nullable(),
  customerId: z.coerce.number().int().positive().optional().nullable(),
  customerMobile: z.string().optional().nullable(),
  fromProviderId: z.coerce.number().int().positive().optional().nullable(),
  toProviderId: z.coerce.number().int().positive().optional().nullable(),
  amount: z.coerce.number().positive("সঠিক টাকার পরিমাণ দিন"),
  fee: z.coerce.number().min(0).default(0),
  commission: z.coerce.number().min(0).default(0),
  otherFee: z.coerce.number().min(0).default(0),
  trNumber: z.string().optional().nullable(),
  billerName: z.string().optional().nullable(),
  billAccountNumber: z.string().optional().nullable(),
  note: z.string().optional().nullable()
});

export const TransactionIdParamsSchema = z.object({
  id: z.coerce.number().int().positive()
});
