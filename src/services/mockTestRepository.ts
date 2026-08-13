import { getDB } from "./db"
import type { MockTest } from "../types/mockTest"

export async function addMockTest(test: MockTest): Promise<void> {
  const db = await getDB()
  await db.add("mockTests", test)
}

export async function updateMockTest(test: MockTest): Promise<void> {
  const db = await getDB()
  await db.put("mockTests", test)
}

export async function deleteMockTest(id: string): Promise<void> {
  const db = await getDB()
  await db.delete("mockTests", id)
}

export async function getAllMockTests(): Promise<MockTest[]> {
  const db = await getDB()
  const all = await db.getAll("mockTests")
  return all.sort((a, b) => a.date.localeCompare(b.date))
}

export function getScoreProgression(tests: MockTest[]): number[] {
  return tests
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((t) => t.total)
}
