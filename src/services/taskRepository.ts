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
}
