import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, type Variants } from 'motion/react'
import { Check, Pencil, Trash2 } from 'lucide-react'
import { taskRepository } from '../services/taskRepository'
import type { Task, Subject, TaskPriority } from '../types/task'

const subjects: Subject[] = ['Physics', 'Chemistry', 'Biology']
const priorities: TaskPriority[] = ['low', 'medium', 'high']

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

function formatTaskDate(date: string): string {
  const parsedDate = new Date(`${date}T00:00:00`)

  return parsedDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function Planner() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [tasks, setTasks] = useState<Task[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [subject, setSubject] = useState<Subject | ''>('')
  const [priority, setPriority] = useState<TaskPriority>('medium')

  useEffect(() => {
    let isMounted = true

    async function loadTasks() {
      const storedTasks = await taskRepository.getAll()

      if (isMounted) {
        setTasks(storedTasks)
      }
    }

    void loadTasks()

    const unsubscribe = taskRepository.subscribeToChanges(() => {
      void loadTasks()
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    const requestedId = searchParams.get('edit')

    if (!requestedId || tasks.length === 0) {
      return
    }

    const requestedTask = tasks.find(
      (task) => task.id === requestedId,
    )

    if (requestedTask) {
      startEdit(requestedTask)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams, tasks])

  function resetForm() {
    setEditingId(null)
    setTitle('')
    setDate('')
    setSubject('')
    setPriority('medium')
  }

  function startEdit(task: Task) {
    setEditingId(task.id)
    setTitle(task.title)
    setDate(task.date)
    setSubject(task.subject ?? '')
    setPriority(task.priority)
  }

  async function handleDelete(id: string) {
    await taskRepository.remove(id)

    setTasks((prev) =>
      prev.filter((task) => task.id !== id),
    )

    if (editingId === id) {
      resetForm()
    }
  }

  async function handleToggleComplete(id: string) {
    const updatedTask = await taskRepository.toggleComplete(id)

    if (!updatedTask) {
      return
    }

    setTasks((prev) =>
      prev.map((task) =>
        task.id === updatedTask.id ? updatedTask : task,
      ),
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!title.trim() || !date) {
      return
    }

    const now = new Date().toISOString()

    if (editingId) {
      const existing = tasks.find(
        (task) => task.id === editingId,
      )

      if (!existing) {
        return
      }

      const updatedTask: Task = {
        ...existing,
        title: title.trim(),
        date,
        subject: subject || undefined,
        priority,
        updatedAt: now,
      }

      await taskRepository.save(updatedTask)

      setTasks((prev) =>
        prev.map((task) =>
          task.id === editingId ? updatedTask : task,
        ),
      )
    } else {
      const newTask: Task = {
        id: crypto.randomUUID(),
        title: title.trim(),
        date,
        subject: subject || undefined,
        priority,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      }

      await taskRepository.save(newTask)

      setTasks((prev) => [...prev, newTask])
    }

    resetForm()
  }

  const sortedTasks = useMemo(
    () =>
      tasks
        .slice()
        .sort((a, b) => {
          const dateCompare = a.date.localeCompare(b.date)

          if (dateCompare !== 0) {
            return dateCompare
          }

          return (a.startTime ?? '99:99').localeCompare(
            b.startTime ?? '99:99',
          )
        }),
    [tasks],
  )

  const completedCount = useMemo(
    () =>
      tasks.filter(
        (task) => task.status === 'completed',
      ).length,
    [tasks],
  )

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

          <h1 className="text-5xl md:text-7xl font-semibold tracking-[-0.04em] leading-[0.9]">
            PLAN
            <br />
            YOUR
            <br />
            DAY.
          </h1>

          <p className="max-w-md pt-3 text-sm leading-6 text-neutral">
            A quiet place to organise your study sessions,
            one day at a time.
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
              {editingId ? 'Edit session' : 'New session'}
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
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border-b border-line bg-transparent px-0 py-3 text-base text-ink placeholder:text-neutral/60 focus:border-accent transition-colors"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="grid gap-1">
                <span className="text-[10px] uppercase tracking-[0.18em] text-neutral">
                  Date
                </span>

                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="border-b border-line bg-transparent px-0 py-3 text-sm text-ink focus:border-accent transition-colors"
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
                      e.target.value as Subject | '',
                    )
                  }
                  className="border-b border-line bg-transparent px-0 py-3 text-sm text-ink focus:border-accent transition-colors"
                >
                  <option value="">General</option>

                  {subjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1">
                <span className="text-[10px] uppercase tracking-[0.18em] text-neutral">
                  Priority
                </span>

                <select
                  value={priority}
                  onChange={(e) =>
                    setPriority(
                      e.target.value as TaskPriority,
                    )
                  }
                  className="border-b border-line bg-transparent px-0 py-3 text-sm text-ink focus:border-accent transition-colors"
                >
                  {priorities.map((p) => (
                    <option key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="submit"
                className="border border-accent bg-accent px-5 py-3 text-sm text-white transition-all duration-200 hover:bg-accent-deep hover:border-accent-deep"
              >
                {editingId ? 'Save changes' : 'Add session'}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-3 text-sm text-neutral transition-colors hover:text-ink"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </motion.section>

        <div className="h-px bg-line" />

        {/* Tasks */}
        <motion.section
          className="grid gap-6"
          custom={2}
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
                {tasks.length === 0
                  ? 'Nothing planned yet.'
                  : `${tasks.length} ${
                      tasks.length === 1
                        ? 'session'
                        : 'sessions'
                    }`}
              </p>
            </div>

            {tasks.length > 0 && (
              <p className="text-[11px] uppercase tracking-[0.18em] text-neutral">
                {completedCount}/{tasks.length} complete
              </p>
            )}
          </div>

          {tasks.length === 0 ? (
            <div className="border border-dashed border-line px-6 py-10">
              <p className="text-lg">
                Your study plan is waiting.
              </p>

              <p className="mt-2 text-sm text-neutral">
                Add your first session above.
              </p>
            </div>
          ) : (
            <div className="grid">
              {sortedTasks.map((task, index) => {
                const isCompleted =
                  task.status === 'completed'

                const isEditing =
                  editingId === task.id

                return (
                  <motion.div
                    key={task.id}
                    custom={index + 3}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    className={`group grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-line py-5 transition-opacity ${
                      isCompleted
                        ? 'opacity-55'
                        : ''
                    } ${
                      isEditing
                        ? 'bg-accent-soft/40'
                        : ''
                    }`}
                  >
                    {/* Completion */}
                    <button
                      type="button"
                      onClick={() =>
                        void handleToggleComplete(task.id)
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

                    {/* Task information */}
                    <button
                      type="button"
                      onClick={() => startEdit(task)}
                      className="min-w-0 text-left"
                    >
                      <p
                        className={`text-sm md:text-base transition-colors ${
                          isCompleted
                            ? 'line-through'
                            : 'group-hover:text-accent'
                        }`}
                      >
                        {task.title}
                      </p>

                      <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-[11px] text-neutral">
                        <span>
                          {formatTaskDate(task.date)}
                        </span>

                        <span>·</span>

                        <span>
                          {task.subject ?? 'General'}
                        </span>

                        <span>·</span>

                        <span>
                          {task.priority}
                        </span>
                      </div>
                    </button>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => startEdit(task)}
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
                            void handleDelete(task.id)
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
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.section>
      </div>
    </div>
  )
}

export default Planner