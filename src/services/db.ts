import {
  openDB,
  type DBSchema,
  type IDBPDatabase,
} from 'idb'

import type { Task } from '../types/task'
import type { Session } from '../types/session'
import type { Question } from '../types/question'
import type { Chapter } from '../types/chapter'
import type { Revision } from '../types/revision'
import type { Flashcard } from '../types/flashcard'
import type { Note } from '../types/note'

interface NeetDB extends DBSchema {
  tasks: {
    key: string
    value: Task
    indexes: {
      'by-date': string
    }
  }

  sessions: {
    key: string
    value: Session
    indexes: {
      'by-status': string
      'by-started-at': string
    }
  }

  questions: {
    key: string
    value: Question
    indexes: {
      'by-subject': string
      'by-chapter': string
      'by-year': number
      'by-source': string
    }
  }

  chapters: {
    key: string
    value: Chapter
    indexes: {
      'by-subject': string
    }
  }

  revisions: {
    key: string
    value: Revision
    indexes: {
      'by-subject': string
      'by-chapter': string
      'by-stage': string
      'by-next-due': string
    }
  }

  flashcards: {
    key: string
    value: Flashcard
    indexes: {
      'by-subject': string
      'by-chapter': string
      'by-box': number
      'by-next-review': string
    }
  }

  notes: {
    key: string
    value: Note
    indexes: {
      'by-subject': string
      'by-chapter': string
      'by-favorite': number
    }
  }
}

let dbInstance:
  Promise<IDBPDatabase<NeetDB>> | null = null

export function getDB() {
  if (!dbInstance) {
    dbInstance = openDB<NeetDB>(
      'neet-study-companion',
      7,
      {
        upgrade(db, oldVersion) {
          if (oldVersion < 1) {
            const taskStore = db.createObjectStore('tasks', { keyPath: 'id' })
            taskStore.createIndex('by-date', 'date')
          }

          if (oldVersion < 2) {
            const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' })
            sessionStore.createIndex('by-status', 'status')
            sessionStore.createIndex('by-started-at', 'startedAt')
          }

          if (oldVersion < 3) {
            const questionStore = db.createObjectStore('questions', { keyPath: 'id' })
            questionStore.createIndex('by-subject', 'subject')
            questionStore.createIndex('by-chapter', 'chapter')
            questionStore.createIndex('by-year', 'year')
            questionStore.createIndex('by-source', 'sourceType')
          }

          if (oldVersion < 4) {
            const chapterStore = db.createObjectStore('chapters', { keyPath: 'id' })
            chapterStore.createIndex('by-subject', 'subject')
          }

          if (oldVersion < 5) {
            const revisionStore = db.createObjectStore('revisions', { keyPath: 'id' })
            revisionStore.createIndex('by-subject', 'subject')
            revisionStore.createIndex('by-chapter', 'chapter')
            revisionStore.createIndex('by-stage', 'stage')
            revisionStore.createIndex('by-next-due', 'nextDueAt')
          }

          if (oldVersion < 6) {
            const flashcardStore = db.createObjectStore('flashcards', { keyPath: 'id' })
            flashcardStore.createIndex('by-subject', 'subject')
            flashcardStore.createIndex('by-chapter', 'chapter')
            flashcardStore.createIndex('by-box', 'leitnerBox')
            flashcardStore.createIndex('by-next-review', 'nextReviewAt')
          }

          if (oldVersion < 7) {
            const noteStore = db.createObjectStore('notes', { keyPath: 'id' })
            noteStore.createIndex('by-subject', 'subject')
            noteStore.createIndex('by-chapter', 'chapter')
            noteStore.createIndex('by-favorite', 'favorite')
          }
        },
      },
    )
  }

  return dbInstance
}
