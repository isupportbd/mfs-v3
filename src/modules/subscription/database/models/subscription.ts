import { relations } from "drizzle-orm";
import { boolean, integer, numeric, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "@/modules/auth/database/models/user.js";

// ১. প্লানস টেবিল (Plans)
export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: numeric("price", { precision: 12, scale: 2 }).notNull().default("0"),
  durationDays: integer("duration_days").notNull(), // যেমন ৩০ দিন বা ৩৬৫ দিন
  yearlyDiscount: numeric("yearly_discount", { precision: 5, scale: 2 }).default("0"), // বাৎসরিক ছাড়ের শতকরা হার (%)
  maxMfsAccounts: integer("max_mfs_accounts"), // যেমন 2 টি অথবা null/0 হলে Unlimited
  maxTransactions: integer("max_transactions"), // যেমন 50 টি অথবা null/0 হলে Unlimited
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

// ২. সাবস্ক্রিপশন টেবিল (Subscriptions)
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onUpdate: "cascade", onDelete: "cascade" }),
  planId: integer("plan_id").references(() => plans.id, { onUpdate: "cascade", onDelete: "set null" }),
  status: varchar("status", { length: 50 }).notNull().default("trial"), // trial, pending, active, expired, cancelled
  trxId: varchar("trx_id", { length: 100 }), // পেমেন্ট ট্রানজেকশন আইডি (ম্যানুয়াল ভেরিফিকেশনের জন্য)
  paymentMethod: varchar("payment_method", { length: 100 }), // bKash, Nagad, Bank etc.
  paymentNote: text("payment_note"),
  activatedAt: timestamp("activated_at", { withTimezone: true }), // সুপারএডমিন যেদিন ও যে সময়ে এপ্রুভ করবেন
  expiresAt: timestamp("expires_at", { withTimezone: true }), // ট্রায়াল শেষ অথবা এপ্রুভালের সময় + প্ল্যান মেয়াদ
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const plansRelations = relations(plans, ({ many }) => ({
  subscriptions: many(subscriptions)
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id]
  }),
  plan: one(plans, {
    fields: [subscriptions.planId],
    references: [plans.id]
  })
}));
