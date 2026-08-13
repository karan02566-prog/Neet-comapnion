import { getDB } from "./db"
import type { Flashcard } from "../types/flashcard"
import type { ChapterSubject } from "../types/chapter"

const boxIntervalDays: Record<number, number> = {
  1: 1,
  2: 2,
  3: 4,
  4: 7,
  5: 14,
}

export function computeNextReview(box: number, from: Date): string {
  const days = boxIntervalDays[box] ?? 1
  const due = new Date(from)
  due.setDate(due.getDate() + days)
  return due.toISOString()
}

export async function addFlashcard(card: Flashcard): Promise<void> {
  const db = await getDB()
  await db.add("flashcards", card)
}

export async function updateFlashcard(card: Flashcard): Promise<void> {
  const db = await getDB()
  await db.put("flashcards", card)
}

export async function deleteFlashcard(id: string): Promise<void> {
  const db = await getDB()
  await db.delete("flashcards", id)
}

export async function getAllFlashcards(): Promise<Flashcard[]> {
  const db = await getDB()
  return db.getAll("flashcards")
}

export async function getFlashcardsBySubject(
  subject: ChapterSubject,
): Promise<Flashcard[]> {
  const db = await getDB()
  return db.getAllFromIndex("flashcards", "by-subject", subject)
}

export async function getDueFlashcards(
  subject?: ChapterSubject,
): Promise<Flashcard[]> {
  const all = subject
    ? await getFlashcardsBySubject(subject)
    : await getAllFlashcards()
  const now = new Date()
  return all.filter((c) => new Date(c.nextReviewAt) <= now)
}

export async function reviewFlashcard(
  id: string,
  correct: boolean,
): Promise<void> {
  const db = await getDB()
  const card = await db.get("flashcards", id)
  if (!card) return

  const now = new Date()
  const newBox = correct ? Math.min(card.leitnerBox + 1, 5) : 1

  const updated: Flashcard = {
    ...card,
    leitnerBox: newBox,
    nextReviewAt: computeNextReview(newBox, now),
    updatedAt: now.toISOString(),
  }

  await db.put("flashcards", updated)
}
