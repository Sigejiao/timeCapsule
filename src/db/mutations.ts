import { and, eq } from "drizzle-orm";

import { db } from "./client.ts";
import {
  encounters as encountersTable,
  notes as notesTable,
} from "./schema.ts";

import type {
  Encounter,
  Note,
} from "../types.ts";


export async function insertNote(
    userId: string,
    note: Note,
): Promise<void> {
    await db.insert(notesTable).values({
        id: note.id,
        userId,
        content: note.content,
        createdAt: new Date(note.createdAt),
        status: note.status, 
    });
}

export async function updateNote(
    userId: string,
    note: Note,
): Promise<void> {
    const [updatedNote] = await db
        .update(notesTable)
        .set({
            status: note.status,
            patternCard: note.patternCard ?? null,
            embedding: note.embedding ?? null,
            updatedAt: new Date(),
        })
        .where(
            and(
                eq(notesTable.id, note.id),
                eq(notesTable.userId, userId)
            ),
        )
        .returning({
            id: notesTable.id,
        });

    if (!updatedNote) {
        throw new Error(
            `未找到要更新的笔记:  ${note.id}`,
        );
    }
}


export async function insertEncounter(
  userId: string,
  encounter: Encounter,
): Promise<void> {
  await db.insert(encountersTable).values({
    id: encounter.id,
    userId,
    newNoteId: encounter.newNoteId,
    oldNoteId: encounter.oldNoteId,
    similarity: encounter.similarity,
    selectionMethod: encounter.selectionMethod,
    shownAt: new Date(encounter.shownAt),
    feedback: encounter.feedback,
  });
}

