import { broadcast, db, shouldQueue } from "@/framework/facade.js";
import { customers } from "../database/models/customers.js";

/**
 * কাস্টমার সংরক্ষণ ব্যাকগ্রাউন্ড কিউ প্রসেসর
 * হাজার হাজার ব্যবহারকারী একসাথে রিকোয়েস্ট পাঠালেও কিউতে জমা হয়ে
 * একের পর এক নিরাপদে ডাটাবেজে সেভ হবে এবং রিয়েলটাইমে সব ক্লায়েন্টকে ব্রডকাস্ট করবে।
 */
export async function handleCustomerCreate(job: any) {
  const data = job.data;
  if (!data || !data.userId || !data.name || !data.mobile) {
    console.warn("Invalid customer data received in queue job:", data);
    return null;
  }

  const [newCustomer] = await db
    .insert(customers)
    .values({
      userId: data.userId,
      name: data.name,
      mobile: data.mobile,
      type: data.type || "সাধারণ",
      organizationName: data.organizationName || null,
      address: data.address || null,
      note: data.note || null,
      isActive: data.isActive ?? true
    })
    .returning();

  // রিয়েলটাইমে সবার কাছে নতুন কাস্টমার তথ্য ব্রডকাস্ট
  broadcast("customer.created", newCustomer, { all: true, rooms: ["customers"] });

  return newCustomer;
}

// "customers" এবং "default" উভয় কিউতেই হ্যান্ডলার রেজিস্টার
shouldQueue("customer.create", "customers", handleCustomerCreate);
shouldQueue("customer.create", "default", handleCustomerCreate);
