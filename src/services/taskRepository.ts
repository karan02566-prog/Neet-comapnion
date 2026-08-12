import { getDB } from './db'
import type { Task } from '../types/task'

export const taskRepository = {
  async getAll(): Promise<Task[]> {
    const db = await getDB()
    return db.getAll('tasks')
  },

  async getByDate(date: string): Promise<Task[]> {
    const db = await getDB()
    return db.getAllFromIndex('tasks', 'by-date', date)
  },

  async save(task: Task): Promise<void> {
    const db = await getDB()
    await db.put('tasks', task)
  },

  async remove(id: string): Promise<void> {
    const db = await getDB()
    await db.delete('tasks', id)
  },

  async toggleComplete(id: string): Promise<Task | null> {
    const db = await getDB()
    const task = await db.get('tasks', id)

    if (!task) {
      return null
    }

    const now = new Date().toISOString()

    const updatedTask: Task = {
      ...task,
      status:
        task.status === 'completed'
          ? 'pending'
          : 'completed',
      completedAt:
        task.status === 'completed'
          ? undefined
          : now,
      updatedAt: now,
    }

    await db.put('tasks', updatedTask)

    return updatedTask
  },
}