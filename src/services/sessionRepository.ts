import { getDB } from './db'
import type { Session, SessionStatus } from '../types/session'

export const sessionRepository = {
  async getAll(): Promise<Session[]> {
    const db = await getDB()
    return db.getAll('sessions')
  },

  async getById(id: string): Promise<Session | undefined> {
    const db = await getDB()
    return db.get('sessions', id)
  },

  async getByStatus(
    status: SessionStatus,
  ): Promise<Session[]> {
    const db = await getDB()
    return db.getAllFromIndex(
      'sessions',
      'by-status',
      status,
    )
  },

  async save(session: Session): Promise<void> {
    const db = await getDB()
    await db.put('sessions', session)
  },

  async remove(id: string): Promise<void> {
    const db = await getDB()
    await db.delete('sessions', id)
  },
}
