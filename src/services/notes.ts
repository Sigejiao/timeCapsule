import { randomUUID } from "node:crypto";

import { analyzePattern } from "../ai/analyze-pattern.ts";
import { createEmbedding } from "../ai/create-embedding.ts";

import {
  insertEncounter,
  insertNote,
  updateNote,
} from "../db/mutations.ts";

import { readNotesByUserId } from "../db/queries.ts";

import type {
  Encounter,
  Note,
} from "../types.ts";

import {
  createEmbeddingText,
  findMostSimilarNote,
} from "./recall.ts";



export interface ProcessNewNoteResult {
    newNote: Note;
    recalledNote: Note | null;
    encounter: Encounter | null;
}

export async function processNewNote(
    userId: string,
    content: string,
): Promise<ProcessNewNoteResult> {
    const newNote: Note = {
        id: randomUUID(),
        content,
        createdAt: new Date().toISOString(),
        status: "pending",
    };

    await insertNote(userId, newNote);

    try {
        newNote.patternCard = 
            await analyzePattern(content);
        
        newNote.embeddingText = 
            createEmbeddingText(newNote.patternCard);   
    } catch (error) {
        newNote.status = "analysis_failed";
        await updateNote(userId, newNote);
        throw error;
    }

    try {
        newNote.embedding = 
            await createEmbedding(
                newNote.embeddingText,
            );
    } catch (error) {
        newNote.status = "embedding_failed";
        await updateNote(userId, newNote);
        throw error;
    }

    newNote.status = "ready";
    await updateNote(userId, newNote);

    const notes = await readNotesByUserId(userId);

    const match = findMostSimilarNote(newNote, notes, );

    if (!match) {
        return {
            newNote,
            recalledNote: null,
            encounter: null,
        };
    }

    const encounter: Encounter = {
        id: randomUUID(),
        newNoteId: newNote.id,
        oldNoteId: match.note.id,
        similarity: match.similarity,
        selectionMethod: "pattern_top_1",
        shownAt: new Date().toISOString(),
        feedback: null,

    };

    await insertEncounter(userId, encounter);

    return {
        newNote,
        recalledNote: match.note,
        encounter,
    };
}

