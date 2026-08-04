import {
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  vector,
} from "drizzle-orm/pg-core";

import type {
  NoteStatus,
  PatternCard,
} from "../types.ts";

export const notes = pgTable("notes", {
  id: uuid("id")
    .primaryKey()
    .defaultRandom(),

  userId: text("user_id")
    .notNull(),

  content: text("content")
    .notNull(),

  patternCard: jsonb("pattern_card").$type<PatternCard>(),

  embedding: vector("embedding", {
    dimensions: 1024,
  }),

  status: text("status")
    .$type<NoteStatus>()
    .notNull()
    .default("pending"),

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