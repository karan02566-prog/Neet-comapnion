import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Task } from '../types/task'
import type { Session } from '../types/session'

interface NeetDB extends DBSchema {
  tasks: {
    key: string
    value: Task
    indexes: { 'by-date': string }
  }

  sessions: {
    key: string
    value: Session
    indexes: {
      'by-status': string
      'by-started-at': string
    }
  }
}

let dbInstance: Promise<IDBPDatabase<NeetDB>> | null = null

export function getDB() {
  if (!dbInstance) {
    dbInstance = openDB<NeetDB>('neet-study-companion', 2, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const taskStore = db.createObjectStore('tasks', {
            keyPath: 'id',
          })

          taskStore.createIndex('by-date', 'date')
        }

        if (oldVersion < 2) {
          const sessionStore = db.createObjectStore('sessions', {
            keyPath: 'id',
          })

          sessionStore.createIndex('by-status', 'status')
          sessionStore.createIndex('by-started-at', 'startedAt')
        }
      },
    })
  }

  return dbInstance
}
