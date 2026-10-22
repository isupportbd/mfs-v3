import { date, decimal, integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "@/modules/auth/database/models/user.js";

// ১. মূল ঋণ ও দেনা টেবিল
export const loans = pgTable("loans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onUpdate: "cascade", onDelete: "cascade" }),

  // 'payable' = গৃহীত ঋণ (দেনা / ব্যবসা নিজে ঋণ নিয়েছে)
  // 'receivable' = প্রদত্ত ঋণ (পাওনা / ব্যবসা অন্য কাউকে ঋণ দিয়েছে)
  type: varchar("type", { length: 50 }).notNull(),

  // ঋণ গ্রহীতা বা দাতার নাম
  personName: varchar("person_name", { length: 255 }).notNull(),
  // মোবাইল নম্বর
  mobile: varchar("mobile", { length: 50 }),
  // ঠিকানা
  address: text("address"),

  // মূল ঋণের পরিমাণ
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  // এ পর্যন্ত মোট পরিশোধিত পরিমাণ
  paidAmount: decimal("paid_amount", { precision: 15, scale: 2 }).default("0.00").notNull(),
  // অবশিষ্ট বকেয়া পরিমাণ
  remainingAmount: decimal("remaining_amount", { precision: 15, scale: 2 }).notNull(),

  // লেনদেনের মাধ্যম: ক্যাশ, ব্যাংক বা ওয়ালেট
  paymentMethod: varchar("payment_method", { length: 100 }).notNull().default("ক্যাশ"),

  // ঋণ গ্রহণের/প্রদানের তারিখ
  loanDate: date("loan_date").notNull(),
  // সম্ভাব্য পরিশোধের শেষ তারিখ
  dueDate: date("due_date"),

  // স্ট্যাটাস: 'active' (চলতি), 'paid' (পরিশোধিত)
  status: varchar("status", { length: 50 }).notNull().default("active"),

  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

// ২. কিস্তি / আংশিক পরিশোধের ইতিহাস টেবিল
export const loanPayments = pgTable("loan_payments", {
  id: serial("id").primaryKey(),
  loanId: integer("loan_id")
    .notNull()
    .references(() => loans.id, { onUpdate: "cascade", onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onUpdate: "cascade", onDelete: "cascade" }),

  // পরিশোধিত টাকার পরিমাণ
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  // পরিশোধের তারিখ
  paymentDate: date("payment_date").notNull(),
  // পরিশোধের মাধ্যম (ক্যাশ, ব্যাংক, বিকাশ ইত্যাদি)
  paymentMethod: varchar("payment_method", { length: 100 }).notNull().default("ক্যাশ"),

  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export type Loan = typeof loans.$inferSelect;
export type NewLoan = typeof loans.$inferInsert;
export type LoanPayment = typeof loanPayments.$inferSelect;
export type NewLoanPayment = typeof loanPayments.$inferInsert;
