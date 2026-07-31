export type NoteStatus =
  | "pending"
  | "ready"
  | "analysis_failed"
  | "embedding_failed";

export interface PatternCard {
  situation: string;
  pattern: string;
  thinkingTension: string;
  motivationNeed: string;
  keywords: string[];
}

export interface Note {
  id: string;
  content: string;
  createdAt: string;
  status: NoteStatus;

  patternCard?: PatternCard;
  embeddingText?: string;
  embedding?: number[];

  lastShownAt?: string;
}

export interface Encounter {
  id: string;
  newNoteId: string;
  oldNoteId: string;
  similarity: number;
  selectionMethod: "pattern_top_1";
  shownAt: string;
  feedback: null | "inspiring" | "too_similar" | "no_feeling";
}
