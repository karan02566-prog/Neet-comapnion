import { useEffect, useState } from 'react'
import { taskRepository } from '../services/taskRepository'
import type { Task, Subject, TaskPriority } from '../types/task'

const subjects: Subject[] = ['Physics', 'Chemistry', 'Biology']
const priorities: TaskPriority[] = ['low', 'medium', 'high']

function Planner() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [subject, setSubject] = useState<Subject | ''>('')
  const [priority, setPriority] = useState<TaskPriority>('medium')

  useEffect(() => {
    taskRepository.getAll().then(setTasks)
  }, [])

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
    setTasks((prev) => prev.filter((task) => task.id !== id))

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

    if (editingId === id) {
      resetForm()
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!title.trim() || !date) {
      return
    }

    const now = new Date().toISOString()

    if (editingId) {
      const existing = tasks.find((task) => task.id === editingId)

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

  return (
    <div className="px-6 py-10 md:px-10">
      <h1 className="text-2xl font-bold mb-6">Planner</h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 max-w-md mb-10"
      >
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border border-line px-3 py-2 bg-paper"
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-line px-3 py-2 bg-paper"
        />

        <select
          value={subject}
          onChange={(e) =>
            setSubject(e.target.value as Subject | '')
          }
          className="border border-line px-3 py-2 bg-paper"
        >
          <option value="">No subject</option>

          {subjects.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={priority}
          onChange={(e) =>
            setPriority(e.target.value as TaskPriority)
          }
          className="border border-line px-3 py-2 bg-paper"
        >
          {priorities.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <div className="flex gap-3">
          <button
            type="submit"
            className="border border-ink px-4 py-2 hover:bg-ink hover:text-paper"
          >
            {editingId ? 'Update task' : 'Add task'}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="border border-line px-4 py-2 text-neutral hover:text-ink"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="flex flex-col gap-3">
        {tasks.length === 0 && (
          <p className="text-neutral text-sm">No tasks yet.</p>
        )}

        {tasks.map((task) => {
          const isCompleted = task.status === 'completed'

          return (
            <div
              key={task.id}
              className="flex items-center justify-between gap-4 border-b border-line pb-3"
            >
              <div className="flex items-center gap-3 min-w-0">
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
                  className={`flex h-5 w-5 shrink-0 items-center justify-center border border-ink text-xs transition ${
                    isCompleted
                      ? 'bg-ink text-paper'
                      : 'bg-paper'
                  }`}
                >
                  {isCompleted ? '✓' : ''}
                </button>

                <button
                  type="button"
                  onClick={() => startEdit(task)}
                  className="min-w-0 text-left hover:opacity-70"
                >
                  <p
                    className={`font-medium ${
                      isCompleted
                        ? 'line-through opacity-50'
                        : ''
                    }`}
                  >
                    {task.title}
                  </p>

                  <p className="text-sm text-neutral">
                    {task.date}{' '}
                    {task.subject ? `— ${task.subject}` : ''} —{' '}
                    {task.priority}
                  </p>
                </button>
              </div>

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
                className="shrink-0 text-sm text-neutral hover:text-red-600"
              >
                Delete
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Planner