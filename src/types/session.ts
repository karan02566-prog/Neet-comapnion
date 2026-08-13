import type { Subject } from './task'

export type SessionStatus =
  | 'active'
  | 'completed'
  | 'cancelled'

export interface Session {
  id: string
  taskId?: string
  subject?: Subject
  chapter?: string
  startedAt: string
  endedAt?: string
  durationSeconds: number
  status: SessionStatus
  createdAt: string
  updatedAt: string
}
