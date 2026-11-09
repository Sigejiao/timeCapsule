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
        .max(5000, "笔记不能超过5000字")
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

export interface EncounterDto {
    similarity: number;
    shownAt: string;
}

export interface CreateNoteResponse {
    newNote: NoteDto;
    recalledNote: NoteDto | null;
    encounter: EncounterDto | null;
}

export interface ErrorResponse {
    error: string;
}

export const patternCardSchema = z.object({
  situation: z
    .string()
    .trim()
    .min(1, "情景不能为空")
    .max(500, "情景不能超过 500 字"),

  recurringPattern: z
    .string()
    .trim()
    .min(1, "重复模式不能为空")
    .max(500, "重复模式不能超过 500 字"),

  thinkingTension: z
    .string()
    .trim()
    .min(1, "思维张力不能为空")
    .max(500, "思维张力不能超过 500 字"),

  motivationNeed: z
    .string()
    .trim()
    .min(1, "动机需求不能为空")
    .max(500, "动机需求不能超过 500 字"),

  keywords: z
    .array(
      z
        .string()
        .trim()
        .min(1, "关键词不能为空")
        .max(50, "单个关键词不能超过 50 字"),
    )
    .min(2, "请填写至少 2 个关键词")
    .max(4, "关键词不能超过 4 个"),
})