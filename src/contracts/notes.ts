import { z } from "zod";

import type {
  NoteStatus,
  PatternCard,
} from "../types.ts";


export const createNoteRequestSchema = z.object({
    content: z
        .string()
        .trim()
        .min(1,"笔记内容不能为空")
        .max(50000, "笔记不能超过5000字")
});

export type CreateNoteRequest = z.infer<
    typeof createNoteRequestSchema
>;

export interface NoteDto {
  id: string;
  content: string;
  createdAt: string;
  status: NoteStatus;
  patternCard: PatternCard | null;
}

export interface EnocunterDto {
    similarity: number;
    shownAt: string;
}

export interface CreateNoteResponse {
    newNote: NoteDto;
    recalledNote: NoteDto | null;
    encounter: EnocunterDto | null;
}

export interface ErrorResponse {
    error: string;
}