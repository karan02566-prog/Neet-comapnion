import { getDB } from './db'
import type { Chapter, ChapterSubject, ChapterStatus } from '../types/chapter'

export async function addChapter(chapter: Chapter): Promise<void> {
  const db = await getDB()
  await db.add('chapters', chapter)
}

export async function updateChapter(chapter: Chapter): Promise<void> {
  const db = await getDB()
  await db.put('chapters', chapter)
}

export async function deleteChapter(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('chapters', id)
}

export async function getChapter(id: string): Promise<Chapter | undefined> {
  const db = await getDB()
  return db.get('chapters', id)
}

export async function getAllChapters(): Promise<Chapter[]> {
  const db = await getDB()
  return db.getAll('chapters')
}

export async function getChaptersBySubject(subject: ChapterSubject): Promise<Chapter[]> {
  const db = await getDB()
  return db.getAllFromIndex('chapters', 'by-subject', subject)
}

export async function updateChapterStatus(id: string, status: ChapterStatus): Promise<void> {
  const db = await getDB()
  const chapter = await db.get('chapters', id)
  if (!chapter) return
  chapter.status = status
  chapter.updatedAt = new Date().toISOString()
  await db.put('chapters', chapter)
}

export async function getSyllabusProgress(): Promise<{
  total: number
  completed: number
  percent: number
}> {
  const db = await getDB()
  const all = await db.getAll('chapters')
  const total = all.length
  const completed = all.filter((c) => c.status === 'completed').length
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100)
  return { total, completed, percent }
}
