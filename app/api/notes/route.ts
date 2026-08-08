import { NextResponse } from "next/server";

import { DEMO_USER_ID } from "../../../src/config.ts";

import {
  createNoteRequestSchema,
} from "../../../src/contracts/notes.ts";

import type {
  CreateNoteResponse,
  ErrorResponse,
  NoteDto,
} from "../../../src/contracts/notes.ts";

import {
  processNewNote,
} from "../../../src/services/notes.ts";

import type {
  Note,
} from "../../../src/types.ts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toNoteDto(note: Note): NoteDto { // 重整格式
    return {
    id: note.id,
    content: note.content,
    createdAt: note.createdAt,
    status: note.status,
    patternCard: note.patternCard ?? null,
    };
}

export async function POST(
    request: Request,
): Promise<
    NextResponse< CreateNoteResponse |  ErrorResponse>
> {
    const body: unknown = await request
        .json()
        .catch(() => null)

    const parsed = createNoteRequestSchema.safeParse(body);

    if (!parsed. success) {
        return NextResponse.json(
            {
                error:
                    parsed.error.issues[0]?.message ??
                    "请求格式不正确",
            },
            {
                status: 400,
            },
        );
    }

    try {
        const result = await processNewNote( // 返回匹配的newNote（整理为type{Note}的原笔记）,\n recalledNote: match.note,\n encounter,
            DEMO_USER_ID,
            parsed.data.content,
        );

        const responseBody: CreateNoteResponse = {
        newNote: toNoteDto(result.newNote),

        recalledNote: result.recalledNote // 如果有值
            ? toNoteDto(result.recalledNote)
            : null,

        encounter: result.encounter //删去id等字段
            ? {
                similarity:
                result.encounter.similarity,
                shownAt:
                result.encounter.shownAt,
            }
            : null,
        };

        return NextResponse.json(
        responseBody,
        {
            status: 201,
        },
        );

        } catch(error) {
            console.error(
            "处理新笔记失败：",
            error,
            );

        return NextResponse.json(
            {
                error: "处理笔记失败，请稍后重试",
            },
            {
                status: 500,
            },
        );


    }
}