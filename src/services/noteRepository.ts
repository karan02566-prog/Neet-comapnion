import { getDB } from "./db"
import type { Note } from "../types/note"
import type { ChapterSubject } from "../types/chapter"

export async function addNote(note: Note): Promise<void> {
  const db = await getDB()
  await db.add("notes", note)
}

export async function updateNote(note: Note): Promise<void> {
  const db = await getDB()
  await db.put("notes", note)
}

export async function deleteNote(id: string): Promise<void> {
  const db = await getDB()
  await db.delete("notes", id)
}

export async function getAllNotes(): Promise<Note[]> {
  const db = await getDB()
  return db.getAll("notes")
}

export async function getNotesBySubject(
  subject: ChapterSubject,
): Promise<Note[]> {
  const db = await getDB()
  return db.getAllFromIndex("notes", "by-subject", subject)
}

export async function getFavoriteNotes(): Promise<Note[]> {
  const db = await getDB()
  const all = await db.getAll("notes")
  return all.filter((n) => n.favorite === 1)
}

export async function toggleFavorite(id: string): Promise<void> {
  const db = await getDB()
  const note = await db.get("notes", id)
  if (!note) return

  const updated: Note = {
    ...note,
    favorite: note.favorite === 1 ? 0 : 1,
    updatedAt: new Date().toISOString(),
  }

  await db.put("notes", updated)
}

export function searchNotes(notes: Note[], query: string): Note[] {
  const q = query.trim().toLowerCase()
  if (!q) return notes

  return notes.filter((n) => {
    return (
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.tags.some((t) => t.toLowerCase().includes(q))
    )
  })
}
