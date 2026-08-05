import { asc, eq } from "drizzle-orm";

import { db } from "./client.ts";
import {
  encounters as encountersTable,
  notes as notesTable,
} from "./schema.ts";

import type {
  Encounter,
  Note,
} from "../types.ts";

export async function readNotesByUserId(
    userId: string
): Promise<Note[]> {
    const rows = await db
        .select({
            id: notesTable.id,
            content: notesTable.content,
            createdAt: notesTable.createdAt,
            status: notesTable.status,
            patternCard: notesTable.patternCard,
            embedding: notesTable.embedding,
        })
        .from(notesTable)
        .where(eq(notesTable.userId, userId))
        .orderBy(asc(notesTable.createdAt));

    return rows.map((row) => ({
        id: row.id,
        content: row.content,
        createdAt: row.createdAt.toISOString(),
        status: row.status,

        ...(row.patternCard !== null
            ? { patternCard: row.patternCard }
            : {}),

        ...(row.embedding !== null
            ? { embedding: row.embedding }
            : {}),
    }));
}
 

export async function readEncountersByUserId(
    userId: string
): Promise<Encounter[]> {
    const rows = await db
        .select({
            id: encountersTable.id,
            newNoteId: encountersTable.newNoteId,
            oldNoteId: encountersTable.oldNoteId,
            similarity: encountersTable.similarity,
            selectionMethod: encountersTable.selectionMethod,
            shownAt: encountersTable.shownAt,
            feedback: encountersTable.feedback,
        })
        .from(encountersTable)
        .where(eq(encountersTable.userId, userId))
        .orderBy(asc(encountersTable.shownAt));

    return rows.map((row) => ({
        id: row.id,
        newNoteId: row.newNoteId,
        oldNoteId: row.oldNoteId,
        similarity: row.similarity,
        selectionMethod: row.selectionMethod,
        shownAt: row.shownAt.toISOString(),
        feedback: row.feedback,
    }));
}