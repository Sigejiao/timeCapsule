import type {
  Note,
  PatternCard,
} from "../types.ts";


export interface NoteMatch {
    note: Note;
    similarity: number;
}

export function createEmbeddingText(
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

export function cosineSimilarity(
  vectorA: number[],
  vectorB: number[],
): number {
  if (vectorA.length !== vectorB.length) {
    throw new Error("两个向量的维度不一致");
  }

  let dotProduct = 0;
  let lengthA = 0;
  let lengthB = 0;

  for (
    let index = 0;
    index < vectorA.length;
    index += 1
  ) {
    const valueA = vectorA[index];
    const valueB = vectorB[index];

    if (
      valueA === undefined ||
      valueB === undefined
    ) {
      throw new Error(
        `向量在第 ${index} 个位置缺少数值`,
      );
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

  return (
    dotProduct /
    (magnitudeA * magnitudeB)
  );
}


export function findMostSImilarNote(
    newNote: Note,
    notes: Note[],
): NoteMatch | null {
    if (!newNote.embedding) {
        return null;
    }

    const candidates  = notes.filter(
        (note) =>
            note.id !== newNote.id &&
            note.status === "ready" &&
            Array.isArray(note.embedding),
    );

    const firstCandidate = candidates[0];

    if (!firstCandidate?.embedding) {
        return null;
    }

    let bestNote = firstCandidate;
    let bestSimilarity = cosineSimilarity(
        newNote.embedding,
        firstCandidate.embedding,
    );

    for (const candidate of candidates.slice(1)) {
        if (!candidate.embedding) {
            continue;
        }

        const similarity = cosineSimilarity(
            newNote.embedding,
            candidate.embedding,
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