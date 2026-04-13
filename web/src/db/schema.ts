import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const sites = sqliteTable("sites", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const facilitators = sqliteTable("facilitators", {
  id: text("id").primaryKey(),
  siteId: text("site_id")
    .notNull()
    .references(() => sites.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const sessionReports = sqliteTable("session_reports", {
  id: text("id").primaryKey(),
  siteId: text("site_id")
    .notNull()
    .references(() => sites.id, { onDelete: "cascade" }),
  facilitatorId: text("facilitator_id")
    .notNull()
    .references(() => facilitators.id, { onDelete: "cascade" }),
  /** ISO date string YYYY-MM-DD */
  sessionDate: text("session_date").notNull(),
  youthRegistered: integer("youth_registered").notNull(),
  youthPresent: integer("youth_present").notNull(),
  sessionsDelivered: integer("sessions_delivered").notNull().default(1),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const sitesRelations = relations(sites, ({ many }) => ({
  facilitators: many(facilitators),
  sessionReports: many(sessionReports),
}));

export const facilitatorsRelations = relations(facilitators, ({ one, many }) => ({
  site: one(sites, {
    fields: [facilitators.siteId],
    references: [sites.id],
  }),
  sessionReports: many(sessionReports),
}));

export const sessionReportsRelations = relations(sessionReports, ({ one }) => ({
  site: one(sites, {
    fields: [sessionReports.siteId],
    references: [sites.id],
  }),
  facilitator: one(facilitators, {
    fields: [sessionReports.facilitatorId],
    references: [facilitators.id],
  }),
}));
