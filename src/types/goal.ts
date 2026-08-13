export type GoalPeriod = "daily" | "weekly" | "long-term"
export type GoalMetric = "hours" | "tasks" | "sessions"

export interface Goal {
  id: string
  period: GoalPeriod
  title: string
  metric: GoalMetric
  targetValue: number
  startDate: string
  endDate?: string
  createdAt: string
  updatedAt: string
}
