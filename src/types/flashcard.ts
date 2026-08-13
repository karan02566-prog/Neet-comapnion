import type { ChapterSubject } from "./chapter"

export interface Flashcard {
  id: string
  subject: ChapterSubject
  chapter: string
  front: string
  back: string
  tags: string[]
  leitnerBox: number
  nextReviewAt: string
  createdAt: string
  updatedAt: string
}
