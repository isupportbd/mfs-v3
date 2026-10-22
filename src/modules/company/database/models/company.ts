import { boolean, date, integer, numeric, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "@/modules/auth/database/models/user.js";

export const companyProfiles = pgTable("company_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onUpdate: "cascade", onDelete: "cascade" }),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  businessType: varchar("business_type", { length: 100 }).notNull().default("একক মালিকানা"),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  tradeLicense: varchar("trade_license", { length: 100 }),
  tinBin: varchar("tin_bin", { length: 100 }),
  establishedDate: date("established_date"),
  printerLayout: varchar("printer_layout", { length: 50 }).default("pos"),
  printHeaderShow: varchar("print_header_show", { length: 10 }).default("yes"),
  receiptPrefix: varchar("receipt_prefix", { length: 50 }).default("MR-"),
  receiptFooterNote: text("receipt_footer_note").default("আমাদের সাথে লেনদেন করার জন্য ধন্যবাদ!"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const shareholders = pgTable("shareholders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onUpdate: "cascade", onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  mobile: varchar("mobile", { length: 50 }),
  sharePercentage: numeric("share_percentage", { precision: 5, scale: 2 }).notNull().default("0.00"),
  role: varchar("role", { length: 100 }).notNull().default("শেয়ারহোল্ডার"),
  nid: varchar("nid", { length: 100 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export type CompanyProfile = typeof companyProfiles.$inferSelect;
export type NewCompanyProfile = typeof companyProfiles.$inferInsert;
export type Shareholder = typeof shareholders.$inferSelect;
export type NewShareholder = typeof shareholders.$inferInsert;
