import type { ChapterSubject } from "./chapter"

export interface Note {
  id: string
  subject: ChapterSubject
  chapter: string
  topic: string
  title: string
  content: string
  tags: string[]
  favorite: 0 | 1
  createdAt: string
  updatedAt: string
}
