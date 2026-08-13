export type QuestionSubject =
  | 'Physics'
  | 'Chemistry'
  | 'Biology'

export type SourceType =
  | 'PYQ'
  | 'Mock Test'
  | 'Module'
  | 'Custom'

export interface Question {
  id: string
  subject: QuestionSubject
  chapter: string
  year?: number
  sourceType: SourceType
  questionText: string
  options: string[]
  correctAnswer: number
  explanation?: string
  imageUrl?: string
  createdAt: string
}