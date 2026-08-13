import { getDB } from './db'
import { taskRepository } from './taskRepository'
import type { Revision, RevisionStage } from '../types/revision'
import type { ChapterSubject } from '../types/chapter'
import type { Task } from '../types/task'

const stageIntervalDays: Record<RevisionStage, number> = {
  learned: 1,
  rev1: 3,
  rev2: 7,
  rev3: 16,
  mastered: 30,
}

const stageOrder: RevisionStage[] = [
  'learned',
  'rev1',
  'rev2',
  'rev3',
  'mastered',
]

export function nextRevisionStage(stage: RevisionStage): RevisionStage {
  const i = stageOrder.indexOf(stage)
  return stageOrder[Math.min(i + 1, stageOrder.length - 1)]
}

export function computeNextDue(stage: RevisionStage, from: Date): string {
  const days = stageIntervalDays[stage]
  const due = new Date(from)
  due.setDate(due.getDate() + days)
  return due.toISOString()
}

export async function addRevision(revision: Revision): Promise<void> {
  const db = await getDB()
  await db.add('revisions', revision)
  await syncRevisionTasksToPlanner()
}

export async function updateRevision(revision: Revision): Promise<void> {
  const db = await getDB()
  await db.put('revisions', revision)
  await syncRevisionTasksToPlanner()
}

export async function deleteRevision(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('revisions', id)
  await taskRepository.remove(`revision-${id}`)
}

export async function getAllRevisions(): Promise<Revision[]> {
  const db = await getDB()
  return db.getAll('revisions')
}

export async function getRevisionsBySubject(subject: ChapterSubject): Promise<Revision[]> {
  const db = await getDB()
  return db.getAllFromIndex('revisions', 'by-subject', subject)
}

export async function advanceRevision(id: string): Promise<void> {
  const db = await getDB()
  const revision = await db.get('revisions', id)
  if (!revision) return

  const now = new Date()
  const newStage = nextRevisionStage(revision.stage)

  const updated: Revision = {
    ...revision,
    stage: newStage,
    lastRevisedAt: now.toISOString(),
    nextDueAt: computeNextDue(newStage, now),
    updatedAt: now.toISOString(),
  }

  await db.put('revisions', updated)

  if (newStage === 'mastered') {
    await taskRepository.remove(`revision-${id}`)
  } else {
    await syncRevisionTasksToPlanner()
  }
}

// 11.3 — Planner integration.
// One Planner task per active (non-mastered) revision, linked via a
// deterministic id (`revision-<revisionId>`) so re-running this is safe:
// existing tasks get their date/title refreshed, no duplicates are created,
// and a user's completed/skipped status on that task is left alone.
export async function syncRevisionTasksToPlanner(): Promise<void> {
  const db = await getDB()
  const revisions = await db.getAll('revisions')
  const existingTasks = await taskRepository.getAll()
  const existingById = new Map(existingTasks.map((t) => [t.id, t]))

  const active = revisions.filter((r) => r.stage !== 'mastered')
  const activeTaskIds = new Set(active.map((r) => `revision-${r.id}`))

  for (const revision of active) {
    const taskId = `revision-${revision.id}`
    const existing = existingById.get(taskId)
    const dueDate = revision.nextDueAt.slice(0, 10)
    const nowIso = new Date().toISOString()

    const task: Task = existing
      ? {
          ...existing,
          date: dueDate,
          title: `Revise: ${revision.chapter}`,
          subject: revision.subject,
          chapter: revision.chapter,
          updatedAt: nowIso,
        }
      : {
          id: taskId,
          title: `Revise: ${revision.chapter}`,
          date: dueDate,
          subject: revision.subject,
          chapter: revision.chapter,
          priority: 'medium',
          status: 'pending',
          notes: 'Auto-generated from Revision tracker',
          createdAt: nowIso,
          updatedAt: nowIso,
        }

    await taskRepository.save(task)
  }

  // Clean up tasks for revisions that were deleted or mastered elsewhere
  // (e.g. mastered via a path that didn't call advanceRevision directly).
  for (const t of existingTasks) {
    if (t.id.startsWith('revision-') && !activeTaskIds.has(t.id)) {
      await taskRepository.remove(t.id)
    }
  }
}
