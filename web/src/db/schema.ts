import { relations } from "drizzle-orm";
import { date, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const sites = pgTable("sites", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
});

export const facilitators = pgTable("facilitators", {
  id: text("id").primaryKey(),
  siteId: text("site_id")
    .notNull()
    .references(() => sites.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
});

export const sessionReports = pgTable("session_reports", {
  id: text("id").primaryKey(),
  siteId: text("site_id")
    .notNull()
    .references(() => sites.id, { onDelete: "cascade" }),
  facilitatorId: text("facilitator_id")
    .notNull()
    .references(() => facilitators.id, { onDelete: "cascade" }),
  /** Calendar date (YYYY-MM-DD) */
  sessionDate: date("session_date", { mode: "string" }).notNull(),
  youthRegistered: integer("youth_registered").notNull(),
  youthPresent: integer("youth_present").notNull(),
  sessionsDelivered: integer("sessions_delivered").notNull().default(1),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
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
