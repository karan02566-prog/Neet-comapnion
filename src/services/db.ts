import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Task } from '../types/task'

interface NeetDB extends DBSchema {
  tasks: {
    key: string
    value: Task
    indexes: { 'by-date': string }
  }
}

let dbInstance: Promise<IDBPDatabase<NeetDB>> | null = null

export function getDB() {
  if (!dbInstance) {
    dbInstance = openDB<NeetDB>('neet-study-companion', 1, {
      upgrade(db) {
        const store = db.createObjectStore('tasks', { keyPath: 'id' })
        store.createIndex('by-date', 'date')
      },
    })
  }
  return dbInstance
}