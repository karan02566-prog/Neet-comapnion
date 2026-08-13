import { getDB } from "./db"
import type { Mistake, MistakeCategory } from "../types/mistake"
import type { ChapterSubject } from "../types/chapter"

export async function addMistake(mistake: Mistake): Promise<void> {
  const db = await getDB()
  await db.add("mistakes", mistake)
}

export async function updateMistake(mistake: Mistake): Promise<void> {
  const db = await getDB()
  await db.put("mistakes", mistake)
}

export async function deleteMistake(id: string): Promise<void> {
  const db = await getDB()
  await db.delete("mistakes", id)
}

export async function getAllMistakes(): Promise<Mistake[]> {
  const db = await getDB()
  return db.getAll("mistakes")
}

export async function getMistakesBySubject(
  subject: ChapterSubject,
): Promise<Mistake[]> {
  const db = await getDB()
  return db.getAllFromIndex("mistakes", "by-subject", subject)
}

export interface CategoryBreakdown {
  category: MistakeCategory
  count: number
  percentage: number
}

export function computeCategoryBreakdown(
  mistakes: Mistake[],
): CategoryBreakdown[] {
  if (mistakes.length === 0) return []

  const counts = new Map<MistakeCategory, number>()
  for (const m of mistakes) {
    counts.set(m.category, (counts.get(m.category) ?? 0) + 1)
  }

  return Array.from(counts.entries())
    .map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / mistakes.length) * 100),
    }))
    .sort((a, b) => b.count - a.count)
}
