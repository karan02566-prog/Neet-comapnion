import type { ChapterSubject } from "./chapter"

export type MistakeCategory = "conceptual" | "silly" | "time-pressure" | "calculation" | "unknown"
export type MistakeReviewStatus = "unreviewed" | "reviewing" | "resolved"

export interface Mistake {
  id: string
  subject: ChapterSubject
  chapter: string
  question: string
  herAnswer: string
  correctAnswer: string
  whyWrong: string
  category: MistakeCategory
  reviewStatus: MistakeReviewStatus
  createdAt: string
  updatedAt: string
}
