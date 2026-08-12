export type TaskPriority = 'low' | 'medium' | 'high'
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'skipped'
export type Subject = 'Physics' | 'Chemistry' | 'Biology'

export interface RepeatConfig {
  frequency: 'daily' | 'weekly'
  daysOfWeek?: number[]
  endDate?: string
}

export interface Task {
  id: string
  title: string
  description?: string
  date: string
  startTime?: string
  durationMinutes?: number
  subject?: Subject
  chapter?: string
  priority: TaskPriority
  status: TaskStatus
  completedAt?: string
  repeat?: RepeatConfig
  notes?: string
  createdAt: string
  updatedAt: string
}
