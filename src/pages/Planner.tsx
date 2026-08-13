import { useEffect, useMemo, useState } from 'react'
import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import { motion, type Variants } from 'motion/react'
import {
  Check,
  Copy,
  Pencil,
  Trash2,
  Play,
  CalendarDays,
} from 'lucide-react'

import { taskRepository } from '../services/taskRepository'
import { syncRevisionTasksToPlanner } from '../services/revisionRepository'
import type {
  Task,
  Subject,
  TaskPriority,
} from '../types/task'

const subjects: Subject[] = [
  'Physics',
  'Chemistry',
  'Biology',
]

const priorities: TaskPriority[] = [
  'low',
  'medium',
  'high',
]

type PlannerView =
  | 'today'
  | 'week'
  | 'month'

type GroupMode =
  | 'date'
  | 'subject'

const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delay: i * 0.07,
      ease: 'easeOut',
    },
  }),
}

function getTodayDate(): string {
  const now = new Date()

  const year = now.getFullYear()
  const month = String(
    now.getMonth() + 1,
  ).padStart(2, '0')
  const day = String(
    now.getDate(),
  ).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function parseDate(date: string): Date {
  return new Date(`${date}T00:00:00`)
}

function formatTaskDate(
  date: string,
): string {
  return parseDate(
    date,
  ).toLocaleDateString(
    'en-IN',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  )
}

function formatDayName(
  date: string,
): string {
  return parseDate(
    date,
  ).toLocaleDateString(
    'en-IN',
    {
      weekday: 'short',
    },
  )
}

function getDateKey(
  date: Date,
): string {
  const year =
    date.getFullYear()

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0')

  const day = String(
    date.getDate(),
  ).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function startOfWeek(
  date: Date,
): Date {
  const result = new Date(date)

  result.setHours(
    0,
    0,
    0,
    0,
  )

  const day =
    result.getDay()

  const difference =
    day === 0
      ? -6
      : 1 - day

  result.setDate(
    result.getDate() +
      difference,
  )

  return result
}

function startOfMonth(
  date: Date,
): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    1,
  )
}

function endOfMonth(
  date: Date,
): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
  )
}

function formatWeekRange(
  start: Date,
): string {
  const end = new Date(start)

  end.setDate(
    end.getDate() + 6,
  )

  const startText =
    start.toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
      },
    )

  const endText =
    end.toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      },
    )

  return `${startText} – ${endText}`
}

function formatMonthLabel(
  date: Date,
): string {
  return date.toLocaleDateString(
    'en-IN',
    {
      month: 'long',
      year: 'numeric',
    },
  )
}

function Planner() {
  const navigate = useNavigate()

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams()

  const [
    tasks,
    setTasks,
  ] = useState<Task[]>([])

  const [
    editingId,
    setEditingId,
  ] = useState<string | null>(
    null,
  )

  const [
    title,
    setTitle,
  ] = useState('')

  const [
    date,
    setDate,
  ] = useState('')

  const [
    subject,
    setSubject,
  ] = useState<Subject | ''>(
    '',
  )

  const [
    priority,
    setPriority,
  ] = useState<TaskPriority>(
    'medium',
  )

  const [
    movingTaskId,
    setMovingTaskId,
  ] = useState<string | null>(
    null,
  )

  const [
    moveDate,
    setMoveDate,
  ] = useState('')

  const [
    plannerView,
    setPlannerView,
  ] = useState<PlannerView>(
    'week',
  )

  const [
    groupMode,
    setGroupMode,
  ] = useState<GroupMode>(
    'date',
  )

  useEffect(() => {
    let isMounted = true

    async function loadTasks() {
      await syncRevisionTasksToPlanner()

      const storedTasks =
        await taskRepository.getAll()

      if (isMounted) {
        setTasks(storedTasks)
      }
    }

    void loadTasks()

    const unsubscribe =
      taskRepository.subscribeToChanges(
        () => {
          void loadTasks()
        },
      )

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    const requestedId =
      searchParams.get('edit')

    if (
      !requestedId ||
      tasks.length === 0
    ) {
      return
    }

    const requestedTask =
      tasks.find(
        (task) =>
          task.id ===
          requestedId,
      )

    if (requestedTask) {
      startEdit(requestedTask)

      setSearchParams(
        {},
        {
          replace: true,
        },
      )
    }
  }, [
    searchParams,
    setSearchParams,
    tasks,
  ])

  function resetForm() {
    setEditingId(null)
    setTitle('')
    setDate('')
    setSubject('')
    setPriority('medium')
  }

  function startEdit(
    task: Task,
  ) {
    setEditingId(task.id)
    setTitle(task.title)
    setDate(task.date)
    setSubject(
      task.subject ?? '',
    )
    setPriority(task.priority)
  }

  function startFocus(
    task: Task,
  ) {
    if (
      task.status ===
      'completed'
    ) {
      return
    }

    navigate(
      `/focus?task=${encodeURIComponent(
        task.id,
      )}`,
    )
  }

  async function handleDelete(
    id: string,
  ) {
    await taskRepository.remove(
      id,
    )

    setTasks((prev) =>
      prev.filter(
        (task) =>
          task.id !== id,
      ),
    )

    if (editingId === id) {
      resetForm()
    }

    if (
      movingTaskId === id
    ) {
      setMovingTaskId(null)
      setMoveDate('')
    }
  }

  async function handleToggleComplete(
    id: string,
  ) {
    const updatedTask =
      await taskRepository.toggleComplete(
        id,
      )

    if (!updatedTask) {
      return
    }

    setTasks((prev) =>
      prev.map((task) =>
        task.id ===
        updatedTask.id
          ? updatedTask
          : task,
      ),
    )
  }

  async function handleSubmit(
    e: React.FormEvent,
  ) {
    e.preventDefault()

    if (
      !title.trim() ||
      !date
    ) {
      return
    }

    const now =
      new Date().toISOString()

    if (editingId) {
      const existing =
        tasks.find(
          (task) =>
            task.id ===
            editingId,
        )

      if (!existing) {
        return
      }

      const updatedTask: Task =
        {
          ...existing,
          title: title.trim(),
          date,
          subject:
            subject ||
            undefined,
          priority,
          updatedAt: now,
        }

      await taskRepository.save(
        updatedTask,
      )

      setTasks((prev) =>
        prev.map((task) =>
          task.id ===
          editingId
            ? updatedTask
            : task,
        ),
      )
    } else {
      const newTask: Task = {
        id: crypto.randomUUID(),
        title: title.trim(),
        date,
        subject:
          subject ||
          undefined,
        priority,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      }

      await taskRepository.save(
        newTask,
      )

      setTasks((prev) => [
        ...prev,
        newTask,
      ])
    }

    resetForm()
  }

  async function handleDuplicate(
    task: Task,
  ) {
    const now =
      new Date().toISOString()

    const duplicatedTask: Task =
      {
        ...task,
        id: crypto.randomUUID(),
        title: `${task.title} (Copy)`,
        status: 'pending',
        completedAt: undefined,
        createdAt: now,
        updatedAt: now,
      }

    await taskRepository.save(
      duplicatedTask,
    )

    setTasks((prev) => [
      ...prev,
      duplicatedTask,
    ])
  }

  function startMove(
    task: Task,
  ) {
    setMovingTaskId(task.id)
    setMoveDate(task.date)
  }

  function cancelMove() {
    setMovingTaskId(null)
    setMoveDate('')
  }

  async function handleMove(
    task: Task,
  ) {
    if (
      !moveDate ||
      moveDate === task.date
    ) {
      cancelMove()
      return
    }

    const updatedTask =
      await taskRepository.moveToDate(
        task.id,
        moveDate,
      )

    if (!updatedTask) {
      return
    }

    setTasks((prev) =>
      prev.map(
        (currentTask) =>
          currentTask.id ===
          updatedTask.id
            ? updatedTask
            : currentTask,
      ),
    )

    cancelMove()
  }

  const today =
    getTodayDate()

  const currentWeekStart =
    useMemo(
      () =>
        startOfWeek(
          new Date(),
        ),
      [],
    )

  const currentMonthStart =
    useMemo(
      () =>
        startOfMonth(
          new Date(),
        ),
      [],
    )

  const currentMonthEnd =
    useMemo(
      () =>
        endOfMonth(
          new Date(),
        ),
      [],
    )

  const weekDates =
    useMemo(() => {
      return Array.from(
        { length: 7 },
        (_, index) => {
          const weekDate =
            new Date(
              currentWeekStart,
            )

          weekDate.setDate(
            weekDate.getDate() +
              index,
          )

          return getDateKey(
            weekDate,
          )
        },
      )
    }, [currentWeekStart])

  const filteredTasks =
    useMemo(() => {
      if (
        plannerView ===
        'today'
      ) {
        return tasks.filter(
          (task) =>
            task.date === today,
        )
      }

      if (
        plannerView ===
        'week'
      ) {
        const start =
          weekDates[0]

        const end =
          weekDates[
            weekDates.length -
              1
          ]

        return tasks.filter(
          (task) =>
            task.date >= start &&
            task.date <= end,
        )
      }

      const monthStart =
        getDateKey(
          currentMonthStart,
        )

      const monthEnd =
        getDateKey(
          currentMonthEnd,
        )

      return tasks.filter(
        (task) =>
          task.date >=
            monthStart &&
          task.date <=
            monthEnd,
      )
    }, [
      tasks,
      plannerView,
      today,
      weekDates,
      currentMonthStart,
      currentMonthEnd,
    ])

  const sortedTasks =
    useMemo(
      () =>
        filteredTasks
          .slice()
          .sort((a, b) => {
            const dateCompare =
              a.date.localeCompare(
                b.date,
              )

            if (
              dateCompare !== 0
            ) {
              return dateCompare
            }

            return (
              a.startTime ??
              '99:99'
            ).localeCompare(
              b.startTime ??
                '99:99',
            )
          }),
      [filteredTasks],
    )

  const completedCount =
    useMemo(
      () =>
        tasks.filter(
          (task) =>
            task.status ===
            'completed',
        ).length,
      [tasks],
    )

  const tasksByDate =
    useMemo(() => {
      const groups =
        new Map<
          string,
          Task[]
        >()

      sortedTasks.forEach(
        (task) => {
          const existing =
            groups.get(
              task.date,
            ) ?? []

          existing.push(task)

          groups.set(
            task.date,
            existing,
          )
        },
      )

      return Array.from(
        groups.entries(),
      )
    }, [sortedTasks])

  const tasksBySubject =
    useMemo(() => {
      const groups =
        new Map<
          string,
          Task[]
        >()

      sortedTasks.forEach(
        (task) => {
          const key =
            task.subject ??
            'General'

          const existing =
            groups.get(key) ??
            []

          existing.push(task)

          groups.set(
            key,
            existing,
          )
        },
      )

      return Array.from(
        groups.entries(),
      )
    }, [sortedTasks])

  function renderTask(
    task: Task,
    index: number,
  ) {
    const isCompleted =
      task.status ===
      'completed'

    const isEditing =
      editingId === task.id

    const isMoving =
      movingTaskId ===
      task.id

    return (
      <motion.div
        key={task.id}
        custom={index + 3}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className={`group border-b border-line py-5 transition-opacity ${
          isCompleted
            ? 'opacity-55'
            : ''
        } ${
          isEditing
            ? 'bg-accent-soft/40'
            : ''
        }`}
      >
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4">
          <button
            type="button"
            onClick={() =>
              void handleToggleComplete(
                task.id,
              )
            }
            aria-label={
              isCompleted
                ? `Mark ${task.title} as incomplete`
                : `Mark ${task.title} as complete`
            }
            className={`flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-200 ${
              isCompleted
                ? 'border-accent bg-accent text-white'
                : 'border-line bg-paper text-transparent hover:border-accent'
            }`}
          >
            <Check
              size={13}
              strokeWidth={2}
            />
          </button>

          <button
            type="button"
            onClick={() =>
              startEdit(task)
            }
            className="min-w-0 text-left"
          >
            <p
              className={`text-sm transition-colors md:text-base ${
                isCompleted
                  ? 'line-through'
                  : 'group-hover:text-accent'
              }`}
            >
              {task.title}
            </p>

            <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-[11px] text-neutral">
              <span>
                {formatTaskDate(
                  task.date,
                )}
              </span>

              <span>·</span>

              <span>
                {task.subject ??
                  'General'}
              </span>

              <span>·</span>

              <span>
                {task.priority}
              </span>
            </div>
          </button>

          <div className="flex items-center gap-1">
            {!isCompleted && (
              <button
                type="button"
                onClick={() =>
                  startFocus(task)
                }
                aria-label={`Start focus for ${task.title}`}
                className="flex h-8 items-center gap-1.5 border border-line px-2.5 text-xs text-neutral opacity-0 transition-all hover:border-accent hover:text-accent group-hover:opacity-100 focus:opacity-100"
              >
                <Play
                  size={13}
                  fill="currentColor"
                />

                <span className="hidden sm:inline">
                  Focus
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() =>
                void handleDuplicate(
                  task,
                )
              }
              aria-label={`Duplicate ${task.title}`}
              className="flex h-8 w-8 items-center justify-center text-neutral opacity-0 transition-all hover:text-accent group-hover:opacity-100 focus:opacity-100"
            >
              <Copy
                size={14}
                strokeWidth={1.7}
              />
            </button>

            <button
              type="button"
              onClick={() =>
                startMove(task)
              }
              aria-label={`Move ${task.title} to another date`}
              className="flex h-8 w-8 items-center justify-center text-neutral opacity-0 transition-all hover:text-accent group-hover:opacity-100 focus:opacity-100"
            >
              <CalendarDays
                size={14}
                strokeWidth={1.7}
              />
            </button>

            <button
              type="button"
              onClick={() =>
                startEdit(task)
              }
              aria-label={`Edit ${task.title}`}
              className="flex h-8 w-8 items-center justify-center text-neutral opacity-0 transition-all hover:text-accent group-hover:opacity-100 focus:opacity-100"
            >
              <Pencil
                size={14}
                strokeWidth={1.7}
              />
            </button>

            <button
              type="button"
              onClick={() => {
                if (
                  window.confirm(
                    `Delete "${task.title}"?`,
                  )
                ) {
                  void handleDelete(
                    task.id,
                  )
                }
              }}
              aria-label={`Delete ${task.title}`}
              className="flex h-8 w-8 items-center justify-center text-neutral opacity-0 transition-all hover:text-red-500 group-hover:opacity-100 focus:opacity-100"
            >
              <Trash2
                size={14}
                strokeWidth={1.7}
              />
            </button>
          </div>
        </div>

        {isMoving && (
          <motion.div
            initial={{
              opacity: 0,
              height: 0,
            }}
            animate={{
              opacity: 1,
              height: 'auto',
            }}
            className="ml-10 mt-4 flex flex-wrap items-end gap-3 border-l border-accent pl-4"
          >
            <label className="grid gap-1">
              <span className="text-[10px] uppercase tracking-[0.18em] text-neutral">
                Move to
              </span>

              <input
                type="date"
                value={moveDate}
                onChange={(e) =>
                  setMoveDate(
                    e.target.value,
                  )
                }
                className="border-b border-line bg-transparent px-0 py-2 text-sm text-ink focus:border-accent"
              />
            </label>

            <button
              type="button"
              onClick={() =>
                void handleMove(
                  task,
                )
              }
              disabled={
                !moveDate ||
                moveDate ===
                  task.date
              }
              className="border border-accent bg-accent px-4 py-2 text-xs text-white transition-colors hover:bg-accent-deep disabled:cursor-not-allowed disabled:opacity-40"
            >
              Move
            </button>

            <button
              type="button"
              onClick={
                cancelMove
              }
              className="px-3 py-2 text-xs text-neutral hover:text-ink"
            >
              Cancel
            </button>
          </motion.div>
        )}
      </motion.div>
    )
  }

  function renderDateGroups() {
    return (
      <div className="grid">
        {tasksByDate.map(
          (
            [dateKey, dateTasks],
            groupIndex,
          ) => (
            <div
              key={dateKey}
              className="grid"
            >
              <div className="border-b border-line bg-paper py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-accent">
                      {formatDayName(
                        dateKey,
                      )}
                    </p>

                    <p className="mt-1 text-sm text-neutral">
                      {formatTaskDate(
                        dateKey,
                      )}
                    </p>
                  </div>

                  <span className="text-[10px] uppercase tracking-[0.16em] text-neutral">
                    {
                      dateTasks.length
                    }{' '}
                    {dateTasks.length ===
                    1
                      ? 'session'
                      : 'sessions'}
                  </span>
                </div>
              </div>

              {dateTasks.map(
                (
                  task,
                  taskIndex,
                ) =>
                  renderTask(
                    task,
                    groupIndex *
                      10 +
                      taskIndex,
                  ),
              )}
            </div>
          ),
        )}
      </div>
    )
  }

  function renderSubjectGroups() {
    return (
      <div className="grid">
        {tasksBySubject.map(
          (
            [
              subjectName,
              subjectTasks,
            ],
            groupIndex,
          ) => (
            <div
              key={subjectName}
              className="grid"
            >
              <div className="border-b border-line bg-paper py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-accent">
                      Subject
                    </p>

                    <p className="mt-1 text-sm">
                      {subjectName}
                    </p>
                  </div>

                  <span className="text-[10px] uppercase tracking-[0.16em] text-neutral">
                    {
                      subjectTasks.length
                    }{' '}
                    {subjectTasks.length ===
                    1
                      ? 'session'
                      : 'sessions'}
                  </span>
                </div>
              </div>

              {subjectTasks.map(
                (
                  task,
                  taskIndex,
                ) =>
                  renderTask(
                    task,
                    groupIndex *
                      10 +
                      taskIndex,
                  ),
              )}
            </div>
          ),
        )}
      </div>
    )
  }

  return (
    <div className="px-6 py-10 md:px-12 md:py-16">
      <div className="grid gap-12 md:gap-16">

        {/* Header */}
        <motion.section
          className="grid gap-3"
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <p className="text-[11px] uppercase tracking-[0.22em] text-neutral">
            Study planning
          </p>

          <h1 className="text-5xl font-semibold leading-[0.9] tracking-[-0.04em] md:text-7xl">
            PLAN
            <br />
            YOUR
            <br />
            DAY.
          </h1>

          <p className="max-w-md pt-3 text-sm leading-6 text-neutral">
            A quiet place to organise
            your study sessions, one
            day at a time.
          </p>
        </motion.section>

        <div className="h-px bg-line" />

        {/* Planner form */}
        <motion.section
          className="grid gap-6 md:max-w-2xl"
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <div className="grid gap-1">
            <p className="text-[11px] uppercase tracking-[0.22em] text-accent">
              {editingId
                ? 'Edit session'
                : 'New session'}
            </p>

            <p className="text-sm text-neutral">
              {editingId
                ? 'Make a small adjustment to your study plan.'
                : 'Add something you want to accomplish.'}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid gap-4"
          >
            <input
              type="text"
              placeholder="What are you studying?"
              value={title}
              onChange={(e) =>
                setTitle(
                  e.target.value,
                )
              }
              className="w-full border-b border-line bg-transparent px-0 py-3 text-base text-ink placeholder:text-neutral/60 transition-colors focus:border-accent"
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <label className="grid gap-1">
                <span className="text-[10px] uppercase tracking-[0.18em] text-neutral">
                  Date
                </span>

                <input
                  type="date"
                  value={date}
                  onChange={(e) =>
                    setDate(
                      e.target.value,
                    )
                  }
                  className="border-b border-line bg-transparent px-0 py-3 text-sm text-ink transition-colors focus:border-accent"
                />
              </label>

              <label className="grid gap-1">
                <span className="text-[10px] uppercase tracking-[0.18em] text-neutral">
                  Subject
                </span>

                <select
                  value={subject}
                  onChange={(e) =>
                    setSubject(
                      e.target
                        .value as
                        | Subject
                        | '',
                    )
                  }
                  className="border-b border-line bg-transparent px-0 py-3 text-sm text-ink transition-colors focus:border-accent"
                >
                  <option value="">
                    General
                  </option>

                  {subjects.map(
                    (s) => (
                      <option
                        key={s}
                        value={s}
                      >
                        {s}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label className="grid gap-1">
                <span className="text-[10px] uppercase tracking-[0.18em] text-neutral">
                  Priority
                </span>

                <select
                  value={
                    priority
                  }
                  onChange={(e) =>
                    setPriority(
                      e.target
                        .value as TaskPriority,
                    )
                  }
                  className="border-b border-line bg-transparent px-0 py-3 text-sm text-ink transition-colors focus:border-accent"
                >
                  {priorities.map(
                    (p) => (
                      <option
                        key={p}
                        value={p}
                      >
                        {p
                          .charAt(
                            0,
                          )
                          .toUpperCase() +
                          p.slice(1)}
                      </option>
                    ),
                  )}
                </select>
              </label>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="submit"
                className="border border-accent bg-accent px-5 py-3 text-sm text-white transition-all duration-200 hover:border-accent-deep hover:bg-accent-deep"
              >
                {editingId
                  ? 'Save changes'
                  : 'Add session'}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={
                    resetForm
                  }
                  className="px-4 py-3 text-sm text-neutral transition-colors hover:text-ink"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </motion.section>

        <div className="h-px bg-line" />

        {/* Planner controls */}
        <motion.section
          className="grid gap-5"
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="grid gap-1">
              <p className="text-[11px] uppercase tracking-[0.22em] text-neutral">
                Schedule
              </p>

              <p className="text-sm text-neutral">
                {plannerView ===
                'today'
                  ? 'Everything planned for today.'
                  : plannerView ===
                      'week'
                    ? formatWeekRange(
                        currentWeekStart,
                      )
                    : formatMonthLabel(
                        currentMonthStart,
                      )}
              </p>
            </div>

            {/* View switcher */}
            <div className="flex flex-wrap border border-line">
              {(
                [
                  'today',
                  'week',
                  'month',
                ] as PlannerView[]
              ).map(
                (view) => (
                  <button
                    key={view}
                    type="button"
                    onClick={() =>
                      setPlannerView(
                        view,
                      )
                    }
                    className={`px-4 py-2.5 text-[10px] uppercase tracking-[0.16em] transition-colors ${
                      plannerView ===
                      view
                        ? 'bg-accent text-white'
                        : 'text-neutral hover:text-ink'
                    }`}
                  >
                    {view}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Group switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 text-[10px] uppercase tracking-[0.16em] text-neutral">
              Group by
            </span>

            {(
              [
                'date',
                'subject',
              ] as GroupMode[]
            ).map(
              (mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() =>
                    setGroupMode(
                      mode,
                    )
                  }
                  className={`border px-3 py-2 text-[10px] uppercase tracking-[0.16em] transition-colors ${
                    groupMode ===
                    mode
                      ? 'border-accent bg-accent text-white'
                      : 'border-line text-neutral hover:border-accent hover:text-accent'
                  }`}
                >
                  {mode}
                </button>
              ),
            )}
          </div>
        </motion.section>

        <div className="h-px bg-line" />

        {/* Tasks */}
        <motion.section
          className="grid gap-6"
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-end justify-between gap-4">
            <div className="grid gap-1">
              <p className="text-[11px] uppercase tracking-[0.22em] text-neutral">
                Your sessions
              </p>

              <p className="text-sm text-neutral">
                {filteredTasks.length ===
                0
                  ? 'Nothing planned for this view.'
                  : `${filteredTasks.length} ${
                      filteredTasks.length ===
                      1
                        ? 'session'
                        : 'sessions'
                    }`}
              </p>
            </div>

            {tasks.length >
              0 && (
              <p className="text-[11px] uppercase tracking-[0.18em] text-neutral">
                {completedCount}/
                {tasks.length}{' '}
                complete
              </p>
            )}
          </div>

          {tasks.length ===
          0 ? (
            <div className="border border-dashed border-line px-6 py-10">
              <p className="text-lg">
                Your study plan is
                waiting.
              </p>

              <p className="mt-2 text-sm text-neutral">
                Add your first
                session above.
              </p>
            </div>
          ) : filteredTasks.length ===
            0 ? (
            <div className="border border-dashed border-line px-6 py-10">
              <p className="text-lg">
                Nothing here yet.
              </p>

              <p className="mt-2 text-sm text-neutral">
                Try another view or
                add a new session.
              </p>
            </div>
          ) : groupMode ===
            'date' ? (
            renderDateGroups()
          ) : (
            renderSubjectGroups()
          )}
        </motion.section>
      </div>
    </div>
  )
}

export default Planner
