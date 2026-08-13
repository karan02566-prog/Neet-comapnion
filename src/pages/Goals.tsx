import { useEffect, useMemo, useState } from 'react'
import { motion, type Variants } from 'motion/react'

import Text from '../components/ui/Text'
import Rule from '../components/ui/Rule'
import {
  getAllGoals,
  addGoal,
  deleteGoal,
  computeGoalProgress,
} from '../services/goalRepository'
import { taskRepository } from '../services/taskRepository'

import type { Goal, GoalPeriod, GoalMetric } from '../types/goal'
import type { Task } from '../types/task'

const periods: GoalPeriod[] = ['daily', 'weekly', 'long-term']
const periodLabels: Record<GoalPeriod, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  'long-term': 'Long-term',
}

const metrics: GoalMetric[] = ['hours', 'tasks', 'sessions']
const metricLabels: Record<GoalMetric, string> = {
  hours: 'Hours',
  tasks: 'Tasks completed',
  sessions: 'Study days',
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function Goals() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const [title, setTitle] = useState('')
  const [period, setPeriod] = useState<GoalPeriod>('daily')
  const [metric, setMetric] = useState<GoalMetric>('hours')
  const [targetValue, setTargetValue] = useState('')
  const [startDate, setStartDate] = useState(todayIso())
  const [endDate, setEndDate] = useState('')

  async function loadData() {
    try {
      const [loadedGoals, loadedTasks] = await Promise.all([
        getAllGoals(),
        taskRepository.getAll(),
      ])
      setGoals(loadedGoals)
      setTasks(loadedTasks)
    } catch {
      setGoals([])
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const goalsWithProgress = useMemo(
    () => goals.map((g) => ({ goal: g, progress: computeGoalProgress(g, tasks) })),
    [goals, tasks],
  )

  function resetForm() {
    setTitle('')
    setPeriod('daily')
    setMetric('hours')
    setTargetValue('')
    setStartDate(todayIso())
    setEndDate('')
    setShowForm(false)
  }

  async function handleSave() {
    if (!title.trim() || !targetValue) return

    const nowIso = new Date().toISOString()
    const newGoal: Goal = {
      id: crypto.randomUUID(),
      period,
      title: title.trim(),
      metric,
      targetValue: Number(targetValue),
      startDate,
      endDate: endDate || undefined,
      createdAt: nowIso,
      updatedAt: nowIso,
    }

    await addGoal(newGoal)
    resetForm()
    await loadData()
  }

  async function handleDelete(id: string) {
    await deleteGoal(id)
    await loadData()
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] px-6 py-8 md:px-12 md:py-10">
      <motion.section variants={fadeUp} initial="hidden" animate="visible" className="grid gap-2">
        <Text variant="meta">Goals</Text>
        <Text variant="display">
          SET IT.
          <br />
          CHASE IT.
        </Text>
        <Text variant="caption">Daily, weekly, long-term — track real progress.</Text>
      </motion.section>

      <Rule />

      {loading && <Text variant="caption" className="mt-8 block">Loading goals…</Text>}

      {!loading && (
        <section className="mt-8 grid max-w-2xl gap-3">
          <div className="flex items-center justify-between">
            <Text variant="meta">Your goals ({goals.length})</Text>
            <button
              type="button"
              onClick={() => (showForm ? resetForm() : setShowForm(true))}
              className="border border-ink px-3 py-2 text-xs transition-colors hover:bg-ink hover:text-paper"
            >
              {showForm ? 'Cancel' : '+ New goal'}
            </button>
          </div>

          {showForm && (
            <div className="grid gap-2 border border-line p-4">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Goal title (e.g. Study 6 hours a day)"
                className="border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-ink"
              />

              <div className="grid grid-cols-3 gap-2">
                {periods.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    className={`border px-2 py-2 text-xs transition-colors ${
                      period === p
                        ? 'border-ink bg-ink text-paper'
                        : 'border-line hover:border-ink'
                    }`}
                  >
                    {periodLabels[p]}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {metrics.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMetric(m)}
                    className={`border px-2 py-2 text-xs transition-colors ${
                      metric === m
                        ? 'border-ink bg-ink text-paper'
                        : 'border-line hover:border-ink'
                    }`}
                  >
                    {metricLabels[m]}
                  </button>
                ))}
              </div>

              <input
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder={`Target (${metricLabels[metric].toLowerCase()})`}
                className="border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-ink"
              />

              <div className="grid grid-cols-2 gap-2">
                <label className="grid gap-1">
                  <Text variant="caption">Start</Text>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-ink"
                  />
                </label>
                <label className="grid gap-1">
                  <Text variant="caption">End (optional)</Text>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-ink"
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={() => void handleSave()}
                className="border border-ink bg-ink px-3 py-2 text-sm text-paper transition-opacity hover:opacity-80"
              >
                Add goal
              </button>
            </div>
          )}

          <div className="grid gap-2">
            {goalsWithProgress.map(({ goal, progress }) => (
              <div key={goal.id} className="border border-line px-4 py-3 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div>{goal.title}</div>
                    <div className="mt-1 text-xs text-neutral">
                      {periodLabels[goal.period]} · {progress.current}/{progress.target}{' '}
                      {metricLabels[goal.metric].toLowerCase()} · {progress.percentage}%
                    </div>
                    <div className="mt-2 h-1.5 w-full max-w-xs bg-line">
                      <div
                        className="h-1.5 bg-ink transition-all"
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleDelete(goal.id)}
                    className="text-xs text-neutral hover:text-ink"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {goals.length === 0 && (
              <Text variant="caption">No goals set yet.</Text>
            )}
          </div>
        </section>
      )}
    </div>
  )
}

export default Goals
