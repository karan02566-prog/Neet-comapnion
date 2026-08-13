import type { ChapterSubject } from './chapter'

export type RevisionStage =
  | 'learned'
  | 'rev1'
  | 'rev2'
  | 'rev3'
  | 'mastered'

export interface Revision {
  id: string
  subject: ChapterSubject
  chapter: string
  stage: RevisionStage
  lastRevisedAt: string
  nextDueAt: string
  createdAt: string
  updatedAt: string
}
