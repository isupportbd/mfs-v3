import { boolean, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

export const financialProviders = pgTable("financial_providers", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 20 }).notNull(), // 'mfs' | 'bank'
  name: varchar("name", { length: 100 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export type FinancialProvider = typeof financialProviders.$inferSelect;
export type NewFinancialProvider = typeof financialProviders.$inferInsert;
