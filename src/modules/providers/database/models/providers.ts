import { relations } from "drizzle-orm";
import { boolean, decimal, integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "@/modules/auth/database/models/user.js";
import { financialProviders } from "@/modules/settings/database/models/providers.js";

export const merchantProviders = pgTable("merchant_providers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onUpdate: "cascade", onDelete: "cascade" }),
  providerId: integer("provider_id").references(() => financialProviders.id, {
    onUpdate: "cascade",
    onDelete: "set null"
  }),
  providerName: varchar("provider_name", { length: 100 }).notNull(),
  accountType: varchar("account_type", { length: 50 }).notNull(), // 'এজেন্ট' | 'পার্সনাল' | 'কারেন্ট' | 'সেইভিংস'
  accountNumber: varchar("account_number", { length: 100 }).notNull(),
  balance: decimal("balance", { precision: 15, scale: 2 }).default("0.00").notNull(),
  note: text("note"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
});

export const merchantProvidersRelations = relations(merchantProviders, ({ one }) => ({
  user: one(users, {
    fields: [merchantProviders.userId],
    references: [users.id]
  }),
  provider: one(financialProviders, {
    fields: [merchantProviders.providerId],
    references: [financialProviders.id]
  })
}));

export type MerchantProvider = typeof merchantProviders.$inferSelect;
export type NewMerchantProvider = typeof merchantProviders.$inferInsert;
