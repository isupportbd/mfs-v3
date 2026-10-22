import { relations } from "drizzle-orm";
import { boolean, date, decimal, integer, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "@/modules/auth/database/models/user.js";
import { merchantProviders } from "@/modules/providers/database/models/providers.js";

/**
 * কোম্পানি অফার ও ডিসবার্সমেন্ট পলিসি টেবিল
 * বিকাশ, নগদ বা রকেট কোম্পানির টার্গেট ইনসেন্টিভ ও বোনাস অফার সংরক্ষণ
 */
export const companyOfferRules = pgTable("company_offer_rules", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onUpdate: "cascade", onDelete: "cascade" }),
  providerId: integer("provider_id").references(() => merchantProviders.id, {
    onUpdate: "cascade",
    onDelete: "set null"
  }),
  title: varchar("title", { length: 150 }).notNull(),
  // ক্যাশ ইন | ক্যাশ আউট | পে-বিল | ট্রান্সফার | সকল
  transactionType: varchar("transaction_type", { length: 50 }).default("সকল").notNull(),
  // target_amount | per_transaction | transaction_count | slab_range
  triggerType: varchar("trigger_type", { length: 50 }).default("target_amount").notNull(),
  targetThreshold: decimal("target_threshold", { precision: 15, scale: 2 }).default("0.00").notNull(),
  // percentage | flat
  rewardType: varchar("reward_type", { length: 50 }).default("percentage").notNull(),
  rewardValue: decimal("reward_value", { precision: 10, scale: 2 }).default("0.00").notNull(),
  // instant | daily | monthly
  settlementType: varchar("settlement_type", { length: 50 }).default("monthly").notNull(),
  startDate: date("start_date"),
  endDate: date("end_date"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const companyOfferRulesRelations = relations(companyOfferRules, ({ one }) => ({
  user: one(users, {
    fields: [companyOfferRules.userId],
    references: [users.id]
  }),
  provider: one(merchantProviders, {
    fields: [companyOfferRules.providerId],
    references: [merchantProviders.id]
  })
}));

export type CompanyOfferRule = typeof companyOfferRules.$inferSelect;
export type NewCompanyOfferRule = typeof companyOfferRules.$inferInsert;
