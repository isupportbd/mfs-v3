import { eq } from "drizzle-orm";
import { db } from "@/framework/facade.js";
import { plans } from "@/modules/subscription/database/models/subscription.js";

export const table = plans;

export default async function PlanSeeder() {
  const defaultPlans = [
    {
      id: 1,
      name: "Basic",
      description: "ছোট দোকান বা একক উদ্যোক্তাদের জন্য উপযুক্ত।",
      price: "500.00",
      durationDays: 30,
      yearlyDiscount: "15.00",
      maxMfsAccounts: 2,
      maxTransactions: 100,
      isActive: true
    },
    {
      id: 2,
      name: "Business",
      description: "বিকাশ ও নগদ দুটোই যাদের নিয়মিত লেনদেন করতে হয়।",
      price: "1000.00",
      durationDays: 30,
      yearlyDiscount: "20.00",
      maxMfsAccounts: 5,
      maxTransactions: 500,
      isActive: true
    },
    {
      id: 3,
      name: "Enterprise",
      description: "বড় ব্যবসা বা এজেন্সির জন্য আনলিমিটেড অ্যাকাউন্ট সুবিধা।",
      price: "2000.00",
      durationDays: 30,
      yearlyDiscount: "25.00",
      maxMfsAccounts: null,
      maxTransactions: null,
      isActive: true
    }
  ];

  for (const plan of defaultPlans) {
    const existing = await db.query.plans.findFirst({
      where: eq(plans.name, plan.name)
    });

    if (!existing) {
      await db.insert(plans).values(plan);
    }
  }

  console.log("Plan seeder completed successfully");
}
