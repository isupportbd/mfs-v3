import { relations } from "drizzle-orm";
import { boolean, decimal, integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "@/modules/auth/database/models/user.js";
import { customers } from "@/modules/customers/database/models/customers.js";
import { merchantProviders } from "@/modules/providers/database/models/providers.js";

/**
 * লেনদেন টেবিল:
 * ক্যাশ ইন, ক্যাশ আউট, পে-বিল, এবং ট্রান্সফার (বি২বি, বিকাশ টু ব্যাংক, ব্যাংক টু বিকাশ, ব্যাংক টু ব্যাংক)
 */
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onUpdate: "cascade", onDelete: "cascade" }),
  
  // ক্যাশ ইন | ক্যাশ আউট | পে-বিল | ট্রান্সফার
  type: varchar("type", { length: 50 }).notNull(),

  // ট্রান্সফারের সাব-টাইপ: বি২বি | বিকাশ টু ব্যাংক | ব্যাংক টু বিকাশ | ব্যাংক টু ব্যাংক (অন্য টাইপের জন্য প্রযোজ্য নয়)
  transferSubtype: varchar("transfer_subtype", { length: 100 }),

  // গ্রাহক (ক্যাশ ইন, ক্যাশ আউট বা পে-বিলের ক্ষেত্রে)
  customerId: integer("customer_id").references(() => customers.id, {
    onUpdate: "cascade",
    onDelete: "set null"
  }),
  customerMobile: varchar("customer_mobile", { length: 50 }),

  // যে ওয়ালেট/প্রোভাইডার থেকে বা যেটিতে ট্রানজাকশন হচ্ছে
  fromProviderId: integer("from_provider_id").references(() => merchantProviders.id, {
    onUpdate: "cascade",
    onDelete: "set null"
  }),
  toProviderId: integer("to_provider_id").references(() => merchantProviders.id, {
    onUpdate: "cascade",
    onDelete: "set null"
  }),

  // টাকার অংক ও ফি/কমিশন
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  fee: decimal("fee", { precision: 10, scale: 2 }).default("0.00").notNull(),
  commission: decimal("commission", { precision: 10, scale: 2 }).default("0.00").notNull(),
  otherFee: decimal("other_fee", { precision: 10, scale: 2 }).default("0.00").notNull(),
  netAmount: decimal("net_amount", { precision: 15, scale: 2 }).notNull(),

  // রেফারেন্স ও পে-বিল তথ্য
  trNumber: varchar("tr_number", { length: 100 }), // যেমন TrxID
  billerName: varchar("biller_name", { length: 100 }), // পে-বিলের জন্য (পল্লী বিদ্যুৎ, নেসকো ইত্যাদি)
  billAccountNumber: varchar("bill_account_number", { length: 100 }),

  status: varchar("status", { length: 50 }).default("সফল").notNull(), // সফল | পেন্ডিং | বাতিল
  note: text("note"),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id]
  }),
  customer: one(customers, {
    fields: [transactions.customerId],
    references: [customers.id]
  }),
  fromProvider: one(merchantProviders, {
    fields: [transactions.fromProviderId],
    references: [merchantProviders.id]
  }),
  toProvider: one(merchantProviders, {
    fields: [transactions.toProviderId],
    references: [merchantProviders.id]
  })
}));

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
