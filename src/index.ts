import { randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

import { analyzePattern } from "./ai/analyze-pattern.ts";
import { createEmbedding } from "./ai/create-embedding.ts";

import { asc,  eq, and } from "drizzle-orm";

import { db } from "./db/client.ts";
import { 
  notes as notesTable,
  encounters as encountersTable
} from "./db/schema.ts";

import type {
  Encounter,
  Note,
  PatternCard,
} from "./types.ts";

// const notesFile = new URL("../data/notes.json", import.meta.url);
const encountersFile = new URL("../data/encounters.json",import.meta.url);

async function readJson<T>(
  file: URL,
  fallback: T,
): Promise<T> {
  try {
    const content = await readFile(file, "utf-8");
    return JSON.parse(content) as T;
  } catch {
    return fallback;
  }
}

const currentUserId = "demo";

async function readNotesFromDatabase(): Promise<Note[]> {
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
    .where(eq(notesTable.userId, currentUserId))
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

async function readEncountersFromDatabase(): Promise<Encounter[]> {
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
    .where(eq(encountersTable.userId, currentUserId))
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

async function insertNoteIntoDatabase(
  note: Note,
): Promise<void> {
  await db.insert(notesTable).values({
    id: note.id,
    userId: currentUserId,
    content: note.content,
    createdAt: new Date(note.createdAt),
    status: note.status,
  });   
}

async function insertEncounterIntoDatabase(
  encounter: Encounter,
): Promise<void> {
  await db.insert(encountersTable).values({
    id: encounter.id,
    userId: currentUserId,
    newNoteId: encounter.newNoteId,
    oldNoteId: encounter.oldNoteId,
    similarity: encounter.similarity,
    selectionMethod: encounter.selectionMethod,
    shownAt: new Date(encounter.shownAt),
    feedback: encounter.feedback ?? null,
  });
}

async function updateNoteInDatabase(
  note: Note,
): Promise<void> {
  const [ updatedNote ] = await db
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
        eq(notesTable.userId, currentUserId),
      ),
    )
    .returning({
      id: notesTable.id,
    });
    
  if (!updatedNote) {
    throw new Error(
      `未找到要更新的笔记: ${note.id}`,
    );  
  }
}



async function writeJson<T>(
  file: URL,
  data: T,
): Promise<void> {
  await writeFile(
    file,
    JSON.stringify(data, null, 2),
    "utf-8",
  );
}

function createEmbeddingText(
  card: PatternCard,
): string {
  return [
    `情景：${card.situation}`,
    `模式：${card.recurringPattern}`,
    `思维张力：${card.thinkingTension}`,
    `动机需求：${card.motivationNeed}`,
    `关键词：${card.keywords.join("、")}`,
  ].join("\n");
}
function cosineSimilarity(
  vectorA: number[],
  vectorB: number[],
): number {
  if (vectorA.length !== vectorB.length) {
    throw new Error("两个向量的维度不一致");
  }

  let dotProduct = 0;
  let lengthA = 0;
  let lengthB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    const valueA = vectorA[i];
    const valueB = vectorB[i];

    if (valueA === undefined || valueB === undefined) {
      throw new Error(`向量在第 ${i} 个位置缺少数值`);
    }

    dotProduct += valueA * valueB;
    lengthA += valueA * valueA;
    lengthB += valueB * valueB;
  }

  const magnitudeA = Math.sqrt(lengthA);
  const magnitudeB = Math.sqrt(lengthB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

function findMostSimilarNote(
  newNote: Note,
  notes: Note[],
): {
  note: Note;
  similarity: number;
} | null {
  if (!newNote.embedding) {
    return null;
  }

  const candidates = notes.filter(
    (note) =>
      note.id !== newNote.id &&
      note.status === "ready" &&
      Array.isArray(note.embedding),
  );

  if (candidates.length === 0) {
    return null;
  }

  let bestNote = candidates[0];

  if (!bestNote) {
    throw new Error("没有找到任何可召回的历史笔记");
  }



  let bestSimilarity = cosineSimilarity(
    newNote.embedding,
    bestNote.embedding!,
  );

  for (const candidate of candidates.slice(1)) {
    const similarity = cosineSimilarity(
      newNote.embedding,
      candidate.embedding!,
    );

    if (similarity > bestSimilarity) {
      bestNote = candidate;
      bestSimilarity = similarity;
    }
  }

  return {
    note: bestNote,
    similarity: bestSimilarity,
  };
}

async function processNewNote(
  content: string,
  notes: Note[],
  encounters: Encounter[],
): Promise<void> {
  const newNote: Note = {
    id: randomUUID(),
    content,
    createdAt: new Date().toISOString(),
    status: "pending",
  };


  // 先保存原文，防止后面的 API 调用失败导致内容丢失。
  await insertNoteIntoDatabase(newNote);

  // 同步到内存
  notes.push(newNote);

  console.log("\n原始笔记已保存。");
  console.log("正在生成模式卡片……");

  try {
    newNote.patternCard = await analyzePattern(content);
    newNote.embeddingText = createEmbeddingText(
      newNote.patternCard,
    );
  } catch (error) {
    newNote.status = "analysis_failed";
    await updateNoteInDatabase(newNote);
    throw error;
  }

  console.log("模式卡片生成完成。");
  console.log("正在生成向量……"); 
  
  try {
    newNote.embedding = await createEmbedding(
      newNote.embeddingText,
    );
  } catch (error) {
    newNote.status = "embedding_failed";
    await updateNoteInDatabase(newNote);
    throw error;
  }

    newNote.status = "ready";
    await updateNoteInDatabase(newNote);
  
  console.log("向量生成完成。");

  console.log("\n模式卡片：");
  console.log(
    JSON.stringify(newNote.patternCard, null, 2),
  );

  const match = findMostSimilarNote(newNote, notes);

  if (!match) {
    console.log(
      "\n目前还没有可匹配的旧笔记。继续写入下一条后，就可以开始召回。",
    );
    return;
  }

  const shownAt = new Date().toISOString();

  match.note.lastShownAt = shownAt;

  const encounter: Encounter = {
    id: randomUUID(),
    newNoteId: newNote.id,
    oldNoteId: match.note.id,
    similarity: match.similarity,
    selectionMethod: "pattern_top_1",
    shownAt,
    feedback: null,
  };

  encounters.push(encounter);

  await writeJson(encountersFile, encounters);

  console.log("\n找到了一条与你当前状态相呼应的旧笔记：");
  console.log("--------------------------------");
  console.log(match.note.content);
  console.log("--------------------------------");
  console.log(
    `相似度：${match.similarity.toFixed(3)}`,
  );

  if (match.note.patternCard) {
    console.log("\n旧笔记的模式：");
    console.log(match.note.patternCard.recurringPattern);
  }
}

async function showNotes(notes: Note[]): Promise<void> {
  if (notes.length === 0) {
    console.log("\n目前还没有笔记。");
    return;
  }

  console.log(`\n共有 ${notes.length} 条笔记：`);

  notes.forEach((note, index) => {
    console.log(`\n${index + 1}. ${note.content}`);
    console.log(`状态：${note.status}`);

    if (note.patternCard) {
      console.log(`模式：${note.patternCard.recurringPattern}`);
    }
  });
}

async function main(): Promise<void> {
  const notes = await readNotesFromDatabase();

  const encounters = await readJson<Encounter[]>(
    encountersFile,
    [],
  );

  const readline = createInterface({
    input: stdin,
    output: stdout,
  });

  console.log("时间胶囊 MVP");
  console.log("============");

  while (true) {
    console.log("\n请选择：");
    console.log("1. 写入一条新笔记");
    console.log("2. 查看已有笔记");
    console.log("3. 退出");

    const choice = (
      await readline.question("\n请输入数字：")
    ).trim();

    if (choice === "1") {
      const content = (
        await readline.question(
          "\n请写下此刻想记录的内容：\n",
        )
      ).trim();

      if (!content) {
        console.log("笔记内容不能为空。");
        continue;
      }

      try {
        await processNewNote(
          content,
          notes,
          encounters,
        );
      } catch (error) {
        console.error("\nAI 处理失败，但原始笔记已经保存。");
        console.error(
          error instanceof Error
            ? error.message
            : error,
        );
      }

      continue;
    }

    if (choice === "2") {
      await showNotes(notes);
      continue;
    }

    if (choice === "3") {
      console.log("\n时间胶囊已关闭。");
      readline.close();
      return;
    }

    console.log("请输入 1、2 或 3。");
  }
}

main().catch((error) => {
  console.error("\n程序启动失败：");
  console.error(
    error instanceof Error ? error.message : error,
  );
  process.exit(1);
});