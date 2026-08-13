import { getDB } from "./db"
import type { Goal, GoalPeriod } from "../types/goal"
import type { Task } from "../types/task"

export async function addGoal(goal: Goal): Promise<void> {
  const db = await getDB()
  await db.add("goals", goal)
}

export async function updateGoal(goal: Goal): Promise<void> {
  const db = await getDB()
  await db.put("goals", goal)
}

export async function deleteGoal(id: string): Promise<void> {
  const db = await getDB()
  await db.delete("goals", id)
}

export async function getAllGoals(): Promise<Goal[]> {
  const db = await getDB()
  return db.getAll("goals")
}

export async function getGoalsByPeriod(period: GoalPeriod): Promise<Goal[]> {
  const db = await getDB()
  return db.getAllFromIndex("goals", "by-period", period)
}

// 16.3 — progress against goal, computed from existing task data.
// hours: sum of durationMinutes for completed tasks in range
// tasks: count of completed tasks in range
// sessions: count of distinct dates with >=1 completed task in range
export function computeGoalProgress(
  goal: Goal,
  tasks: Task[],
): { current: number; target: number; percentage: number } {
  const start = goal.startDate
  const end = goal.endDate ?? new Date().toISOString().slice(0, 10)

  const inRange = tasks.filter(
    (t) => t.status === "completed" && t.date >= start && t.date <= end,
  )

  let current = 0

  if (goal.metric === "hours") {
    const totalMinutes = inRange.reduce(
      (sum, t) => sum + (t.durationMinutes ?? 0),
      0,
    )
    current = Math.round((totalMinutes / 60) * 10) / 10
  } else if (goal.metric === "tasks") {
    current = inRange.length
  } else {
    current = new Set(inRange.map((t) => t.date)).size
  }

  const percentage =
    goal.targetValue > 0
      ? Math.min(100, Math.round((current / goal.targetValue) * 100))
      : 0

  return { current, target: goal.targetValue, percentage }
}
