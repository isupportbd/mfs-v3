import { date, decimal, integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "@/modules/auth/database/models/user.js";
import { shareholders } from "@/modules/company/database/models/company.js";

export const capitalTransactions = pgTable("capital_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onUpdate: "cascade", onDelete: "cascade" }),
  shareholderId: integer("shareholder_id")
    .notNull()
    .references(() => shareholders.id, { onUpdate: "cascade", onDelete: "cascade" }),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  depositDate: date("deposit_date").notNull(),
  paymentMethod: varchar("payment_method", { length: 100 }).notNull().default("ক্যাশ"),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export type CapitalTransaction = typeof capitalTransactions.$inferSelect;
export type NewCapitalTransaction = typeof capitalTransactions.$inferInsert;
