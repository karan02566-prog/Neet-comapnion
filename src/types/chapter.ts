export type ChapterStatus =
  | 'not-started'
  | 'in-progress'
  | 'completed'

export type ChapterSubject =
  | 'Physics'
  | 'Chemistry'
  | 'Biology'

export interface Chapter {
  id: string
  subject: ChapterSubject
  name: string
  status: ChapterStatus
  updatedAt: string
}