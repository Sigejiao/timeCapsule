import {
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  vector,
} from "drizzle-orm/pg-core";

export const notes = pgTable("notes", {
  id: uuid("id")
    .primaryKey()
    .defaultRandom(),

  userId: text("user_id")
    .notNull(),

  content: text("content")
    .notNull(),

  patternCard: jsonb("pattern_card"),

  embedding: vector("embedding", {
    dimensions: 1024,
  }),

  status: text("status")
    .notNull()
    .default("processing"),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
  
});