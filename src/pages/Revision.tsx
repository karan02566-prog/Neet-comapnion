import { useEffect, useMemo, useState } from 'react'
import { motion, type Variants } from 'motion/react'

import Text from '../components/ui/Text'
import Rule from '../components/ui/Rule'
import {
  getAllRevisions,
  addRevision,
  advanceRevision,
  computeNextDue,
} from '../services/revisionRepository'
import { getAllChapters } from '../services/chapterRepository'

import type { Revision as RevisionRecord, RevisionStage } from '../types/revision'
import type { ChapterSubject } from '../types/chapter'

interface ChapterRef {
  subject: ChapterSubject
  name: string
}

const subjects: ChapterSubject[] = ['Physics', 'Chemistry', 'Biology']

const stageLabels: Record<RevisionStage, string> = {
  learned: 'Learned',
  rev1: 'Revision 1',
  rev2: 'Revision 2',
  rev3: 'Revision 3',
  mastered: 'Mastered',
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
}

function RevisionPage() {
  const [revisions, setRevisions] = useState<RevisionRecord[]>([])
  const [chapterNames, setChapterNames] = useState<ChapterRef[]>([])
  const [loading, setLoading] = useState(true)
  const [subject, setSubject] = useState<ChapterSubject>('Physics')

  async function loadData() {
    try {
      const [loadedRevisions, loadedChapters] = await Promise.all([
        getAllRevisions(),
        getAllChapters(),
      ])
      setRevisions(loadedRevisions)
      setChapterNames(
        loadedChapters.map((c) => ({ subject: c.subject, name: c.name })),
      )
    } catch {
      setRevisions([])
      setChapterNames([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const chaptersWithoutRevision = useMemo(() => {
    const existingKeys = new Set(
      revisions.map((r) => `${r.subject}::${r.chapter}`),
    )
    return chapterNames.filter(
      (c: ChapterRef) =>
        c.subject === subject && !existingKeys.has(`${c.subject}::${c.name}`),
    )
  }, [chapterNames, revisions, subject])

  const revisionsForSubject = useMemo(() => {
    return revisions
      .filter((r) => r.subject === subject)
      .sort((a, b) => a.nextDueAt.localeCompare(b.nextDueAt))
  }, [revisions, subject])

  const now = new Date()

  const due = revisionsForSubject.filter(
    (r) => new Date(r.nextDueAt) <= now && r.stage !== 'mastered',
  )

  const upcoming = revisionsForSubject.filter(
    (r) => new Date(r.nextDueAt) > now && r.stage !== 'mastered',
  )

  const mastered = revisionsForSubject.filter((r) => r.stage === 'mastered')

  async function startRevisionFor(chapterName: string) {
    const nowIso = new Date().toISOString()

    const newRevision: RevisionRecord = {
      id: crypto.randomUUID(),
      subject,
      chapter: chapterName,
      stage: 'learned',
      lastRevisedAt: nowIso,
      nextDueAt: computeNextDue('learned', new Date()),
      createdAt: nowIso,
      updatedAt: nowIso,
    }

    await addRevision(newRevision)
    await loadData()
  }

  async function handleAdvance(id: string) {
    await advanceRevision(id)
    await loadData()
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    })
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] px-6 py-8 md:px-12 md:py-10">
      <motion.section
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="grid gap-2"
      >
        <Text variant="meta">Spaced revision</Text>
        <Text variant="display">
          REVISE
          <br />
          ON TIME.
        </Text>
        <Text variant="caption">
          Track what's due, what's upcoming, and what you've mastered.
        </Text>
      </motion.section>

      <Rule />

      <section className="mt-8 grid grid-cols-3 gap-2 max-w-xl">
        {subjects.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setSubject(item)}
            className={`border px-3 py-3 text-sm transition-colors ${
              subject === item
                ? 'border-ink bg-ink text-paper'
                : 'border-line hover:border-ink'
            }`}
          >
            {item}
          </button>
        ))}
      </section>

      {loading && (
        <Text variant="caption" className="mt-8 block">
          Loading revisions…
        </Text>
      )}

      {!loading && (
        <>
          <Rule />

          <section className="mt-8 grid max-w-xl gap-3">
            <Text variant="meta">Due now ({due.length})</Text>

            {due.length === 0 && (
              <Text variant="caption">Nothing due right now.</Text>
            )}

            {due.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between border border-ink px-4 py-3 text-sm"
              >
                <div className="grid gap-0.5">
                  <span>{r.chapter}</span>
                  <span className="text-xs text-neutral">
                    {stageLabels[r.stage]} · due {formatDate(r.nextDueAt)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => void handleAdvance(r.id)}
                  className="border border-ink px-3 py-2 text-xs transition-colors hover:bg-ink hover:text-paper"
                >
                  Mark revised →
                </button>
              </div>
            ))}
          </section>

          <Rule />

          <section className="mt-8 grid max-w-xl gap-3">
            <Text variant="meta">Upcoming ({upcoming.length})</Text>

            {upcoming.length === 0 && (
              <Text variant="caption">No upcoming revisions scheduled.</Text>
            )}

            {upcoming.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between border border-line px-4 py-3 text-sm text-neutral"
              >
                <span>{r.chapter}</span>
                <span className="text-xs">
                  {stageLabels[r.stage]} · due {formatDate(r.nextDueAt)}
                </span>
              </div>
            ))}
          </section>

          {mastered.length > 0 && (
            <>
              <Rule />
              <section className="mt-8 grid max-w-xl gap-3">
                <Text variant="meta">Mastered ({mastered.length})</Text>
                {mastered.map((r) => (
                  <div
                    key={r.id}
                    className="border border-line px-4 py-3 text-sm text-neutral"
                  >
                    {r.chapter}
                  </div>
                ))}
              </section>
            </>
          )}

          {chaptersWithoutRevision.length > 0 && (
            <>
              <Rule />
              <section className="mt-8 grid max-w-xl gap-3">
                <Text variant="meta">
                  Start tracking a chapter ({chaptersWithoutRevision.length})
                </Text>

                <div className="grid gap-2">
                  {chaptersWithoutRevision.map((c: ChapterRef) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => void startRevisionFor(c.name)}
                      className="flex items-center justify-between border border-line px-4 py-3 text-left text-sm text-neutral transition-colors hover:border-ink hover:text-ink"
                    >
                      <span>{c.name}</span>
                      <span className="text-xs">Start revision →</span>
                    </button>
                  ))}
                </div>
              </section>
            </>
          )}
        </>
      )}
    </div>
  )
}

export default RevisionPage
