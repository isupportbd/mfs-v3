import { relations } from "drizzle-orm";
import { boolean, decimal, integer, jsonb, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "@/modules/auth/database/models/user.js";

/**
 * গ্রাহক সার্ভিস চার্জ পলিসি টেবিল
 */
export const customerFeeRules = pgTable("customer_fee_rules", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onUpdate: "cascade", onDelete: "cascade" }),
  // পে-বিল | ক্যাশ ইন | ক্যাশ আউট | ট্রান্সফার
  transactionType: varchar("transaction_type", { length: 50 }).default("পে-বিল").notNull(),
  billerName: varchar("biller_name", { length: 100 }),
  // flat | percentage | slab
  feeType: varchar("fee_type", { length: 50 }).default("flat").notNull(),
  flatFee: decimal("flat_fee", { precision: 10, scale: 2 }).default("0.00").notNull(),
  percentageFee: decimal("percentage_fee", { precision: 10, scale: 2 }).default("0.00").notNull(),
  slabsJson: jsonb("slabs_json").$type<Array<{ min: number; max: number; fee: number }>>(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const customerFeeRulesRelations = relations(customerFeeRules, ({ one }) => ({
  user: one(users, {
    fields: [customerFeeRules.userId],
    references: [users.id]
  })
}));

export type CustomerFeeRule = typeof customerFeeRules.$inferSelect;
export type NewCustomerFeeRule = typeof customerFeeRules.$inferInsert;
