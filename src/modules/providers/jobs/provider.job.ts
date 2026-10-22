import { and, eq, ilike } from "drizzle-orm";
import { broadcast, db, shouldQueue } from "@/framework/facade.js";
import { merchantProviders } from "../database/models/providers.js";

/**
 * প্রোভাইডার সংরক্ষণ ব্যাকগ্রাউন্ড কিউ প্রসেসর
 * হাজার হাজার ব্যবহারকারী বা দ্রুত পরপর সাবমিট করলেও কিউতে জমা হয়ে
 * একের পর এক নিরাপদে ডাটাবেজে সেভ হবে এবং রিয়েলটাইমে ক্লায়েন্টকে ব্রডকাস্ট করবে।
 */
export async function handleProviderCreate(job: any) {
  const data = job.data;
  if (!data || !data.userId || !data.providerName || !data.accountNumber || !data.accountType) {
    console.warn("Invalid provider data received in queue job:", data);
    return null;
  }

  // কিউ প্রসেসিংয়ের সময়ও ডুপ্লিকেট এন্ট্রি প্রতিরোধ
  const existing = await db.query.merchantProviders.findFirst({
    where: and(
      eq(merchantProviders.userId, data.userId),
      ilike(merchantProviders.providerName, data.providerName),
      eq(merchantProviders.accountNumber, data.accountNumber)
    )
  });

  if (existing) {
    console.warn("Duplicate provider creation skipped in queue job:", data.providerName, data.accountNumber);
    return existing;
  }

  const [newProvider] = await db
    .insert(merchantProviders)
    .values({
      userId: data.userId,
      providerId: data.providerId || null,
      providerName: data.providerName,
      accountType: data.accountType,
      accountNumber: data.accountNumber,
      balance: String(data.balance ?? "0.00"),
      note: data.note || null,
      isActive: data.isActive ?? true
    })
    .returning();

  // রিয়েলটাইমে সব কানেক্টেড ক্লায়েন্টকে নতুন প্রোভাইডার ব্রডকাস্ট
  broadcast("provider.created", newProvider, { all: true, rooms: ["providers"] });

  return newProvider;
}

// "providers" এবং "default" উভয় কিউতেই হ্যান্ডলার রেজিস্টার
shouldQueue("provider.create", "providers", handleProviderCreate);
shouldQueue("provider.create", "default", handleProviderCreate);
