import { broadcast, db, shouldQueue } from "@/framework/facade.js";
import { transactions } from "../database/models/transactions.js";

/**
 * লেনদেন সংরক্ষণ ব্যাকগ্রাউন্ড কিউ প্রসেসর
 * উচ্চ ট্রাফিকের সময় হাজার হাজার লেনদেন আসলেও কিউতে জমা হয়ে
 * একের পর এক নিরাপদে ডাটাবেজে সেভ হবে এবং রিয়েলটাইমে ব্রডকাস্ট করবে।
 */
export async function handleTransactionCreate(job: any) {
  const data = job.data;
  if (!data || !data.userId || !data.type || !data.amount) {
    console.warn("Invalid transaction data in queue job:", data);
    return null;
  }

  const amount = Number(data.amount);
  const fee = Number(data.fee || 0);
  const commission = Number(data.commission || 0);
  const otherFee = Number(data.otherFee || 0);
  const netAmount = amount + fee;

  const [created] = await db
    .insert(transactions)
    .values({
      userId: data.userId,
      type: data.type,
      transferSubtype: data.transferSubtype || null,
      customerId: data.customerId ? Number(data.customerId) : null,
      customerMobile: data.customerMobile ? String(data.customerMobile).trim() : null,
      fromProviderId: data.fromProviderId ? Number(data.fromProviderId) : null,
      toProviderId: data.toProviderId ? Number(data.toProviderId) : null,
      amount: String(amount),
      fee: String(fee),
      commission: String(commission),
      otherFee: String(otherFee),
      netAmount: String(netAmount),
      trNumber: data.trNumber ? String(data.trNumber).trim() : null,
      billerName: data.billerName ? String(data.billerName).trim() : null,
      billAccountNumber: data.billAccountNumber ? String(data.billAccountNumber).trim() : null,
      note: data.note ? String(data.note).trim() : null
    })
    .returning();

  // রিয়েলটাইমে নির্দিষ্ট ইউজার ও চ্যানেলে লেনদেন ব্রডকাস্ট
  broadcast("transaction.created", created, { users: [data.userId], rooms: ["transactions"] });

  return created;
}

// "transactions" এবং "default" কিউতে হ্যান্ডলার রেজিস্টার
shouldQueue("transaction.create", "transactions", handleTransactionCreate);
shouldQueue("transaction.create", "default", handleTransactionCreate);
