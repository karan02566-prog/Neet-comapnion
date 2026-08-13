import { useEffect, useMemo, useState } from 'react'
import { motion, type Variants } from 'motion/react'

import Text from '../components/ui/Text'
import Rule from '../components/ui/Rule'
import {
  getAllChapters,
  addChapter,
  updateChapterStatus,
} from '../services/chapterRepository'
import { neetChapters } from '../data/neetChapters'

import type { Chapter, ChapterStatus, ChapterSubject } from '../types/chapter'

const subjects: ChapterSubject[] = ['Physics', 'Chemistry', 'Biology']

const statusOrder: ChapterStatus[] = [
  'not-started',
  'in-progress',
  'completed',
]

const statusLabels: Record<ChapterStatus, string> = {
  'not-started': 'Not started',
  'in-progress': 'In progress',
  completed: 'Completed',
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
}

function nextStatus(status: ChapterStatus): ChapterStatus {
  const currentIndex = statusOrder.indexOf(status)
  return statusOrder[(currentIndex + 1) % statusOrder.length]
}

function Syllabus() {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [subject, setSubject] = useState<ChapterSubject>('Physics')

  async function loadChapters() {
    try {
      const loaded = await getAllChapters()
      setChapters(loaded)
    } catch {
      setChapters([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadChapters()
  }, [])

  async function handleSeedSyllabus() {
    setSeeding(true)

    const existingKeys = new Set(
      chapters.map((c) => `${c.subject}::${c.name}`),
    )

    const now = new Date().toISOString()

    const toAdd = neetChapters.filter(
      (item) => !existingKeys.has(`${item.subject}::${item.name}`),
    )

    for (const item of toAdd) {
      await addChapter({
        id: crypto.randomUUID(),
        subject: item.subject,
        name: item.name,
        status: 'not-started',
        updatedAt: now,
      })
    }

    await loadChapters()
    setSeeding(false)
  }

  const chaptersForSubject = useMemo(() => {
    return chapters
      .filter((c) => c.subject === subject)
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [chapters, subject])

  const progress = useMemo(() => {
    const total = chapters.length
    const completed = chapters.filter((c) => c.status === 'completed').length
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100)
    return { total, completed, percent }
  }, [chapters])

  async function cycleStatus(chapterItem: Chapter) {
    const updated = nextStatus(chapterItem.status)

    setChapters((prev) =>
      prev.map((c) =>
        c.id === chapterItem.id ? { ...c, status: updated } : c,
      ),
    )

    try {
      await updateChapterStatus(chapterItem.id, updated)
    } catch {
      setChapters((prev) =>
        prev.map((c) =>
          c.id === chapterItem.id
            ? { ...c, status: chapterItem.status }
            : c,
        ),
      )
    }
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] px-6 py-8 md:px-12 md:py-10">
      <motion.section
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="grid gap-2"
      >
        <Text variant="meta">Syllabus tracker</Text>
        <Text variant="display">
          TRACK
          <br />
          THE
          <br />
          SYLLABUS.
        </Text>
        <Text variant="caption">
          Mark chapters as you move through them.
        </Text>
      </motion.section>

      {!loading && (
        <button
          type="button"
          onClick={() => void handleSeedSyllabus()}
          disabled={seeding}
          className="mt-4 border border-line px-4 py-2 text-xs text-neutral transition-colors hover:border-ink hover:text-ink disabled:opacity-40"
        >
          {seeding
            ? 'Adding chapters…'
            : 'Load full NEET syllabus (95 chapters)'}
        </button>
      )}

      <Rule />

      <section className="mt-8 grid max-w-xl gap-3">
        <Text variant="meta">Overall progress</Text>

        <div className="h-2 w-full border border-line">
          <div
            className="h-full bg-ink transition-all"
            style={{ width: `${progress.percent}%` }}
          />
        </div>

        <Text variant="caption">
          {progress.completed} / {progress.total} chapters completed (
          {progress.percent}%)
        </Text>
      </section>

      <Rule />

      <section className="mt-8 grid gap-6">
        <div className="grid grid-cols-3 gap-2 max-w-xl">
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
        </div>

        {loading && <Text variant="caption">Loading chapters…</Text>}

        {!loading && chaptersForSubject.length === 0 && (
          <Text variant="caption">
            No chapters added for {subject} yet.
          </Text>
        )}

        {!loading && chaptersForSubject.length > 0 && (
          <div className="grid max-w-xl gap-2">
            {chaptersForSubject.map((chapterItem) => (
              <button
                key={chapterItem.id}
                type="button"
                onClick={() => void cycleStatus(chapterItem)}
                className={`flex items-center justify-between border px-4 py-3 text-left text-sm transition-colors ${
                  chapterItem.status === 'completed'
                    ? 'border-ink bg-ink text-paper'
                    : chapterItem.status === 'in-progress'
                      ? 'border-ink text-ink'
                      : 'border-line text-neutral hover:border-ink hover:text-ink'
                }`}
              >
                <span>{chapterItem.name}</span>
                <span className="text-xs uppercase tracking-widest">
                  {statusLabels[chapterItem.status]}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Syllabus
