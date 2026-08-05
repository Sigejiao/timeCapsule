import {
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  vector,
  doublePrecision,
} from "drizzle-orm/pg-core";

import type {
  NoteStatus,
  PatternCard,
  Encounter,
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

export const encounters = pgTable("encounters", {
  id: uuid("id")
    .primaryKey()
    .defaultRandom(),

  userId: text("user_id")
    .notNull(),

  newNoteId: uuid("new_note_id")
    .notNull()
    .references(() => notes.id, {
      onDelete: "cascade",
    }),

  oldNoteId: uuid("old_note_id")
    .notNull()
    .references(() => notes.id, {
      onDelete: "cascade",
    }),

  similarity: doublePrecision("similarity")
    .notNull(),

  selectionMethod: text("selection_method")
    .$type<Encounter["selectionMethod"]>()
    .notNull()
    .default("pattern_top_1"),

  shownAt: timestamp("shown_at", {
    withTimezone: true,
  })
    .notNull(),

  feedback: text("feedback")
    .$type<Encounter["feedback"]>(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
});