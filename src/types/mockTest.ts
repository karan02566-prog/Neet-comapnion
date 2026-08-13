import type { ChapterSubject } from "./chapter"

export interface SubjectScore {
  subject: ChapterSubject
  score: number
  maxScore: number
}

export interface MockTest {
  id: string
  name: string
  date: string
  subjectScores: SubjectScore[]
  total: number
  maxTotal: number
  accuracy: number
  attempted: number
  incorrect: number
  timeTakenMinutes: number
  createdAt: string
  updatedAt: string
}
