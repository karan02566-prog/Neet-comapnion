import { useEffect, useMemo, useState } from 'react'
import { motion, type Variants } from 'motion/react'

import Text from '../components/ui/Text'
import Rule from '../components/ui/Rule'
import {
  getAllMistakes,
  addMistake,
  updateMistake,
  deleteMistake,
  computeCategoryBreakdown,
} from '../services/mistakeRepository'
import { getAllChapters } from '../services/chapterRepository'

import type { Mistake, MistakeCategory, MistakeReviewStatus } from '../types/mistake'
import type { ChapterSubject } from '../types/chapter'

const subjects: ChapterSubject[] = ['Physics', 'Chemistry', 'Biology']

const categories: MistakeCategory[] = [
  'conceptual',
  'silly',
  'time-pressure',
  'calculation',
  'unknown',
]

const categoryLabels: Record<MistakeCategory, string> = {
  conceptual: 'Conceptual',
  silly: 'Silly mistake',
  'time-pressure': 'Time pressure',
  calculation: 'Calculation',
  unknown: 'Unknown',
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

function Mistakes() {
  const [mistakes, setMistakes] = useState<Mistake[]>([])
  const [chapterNames, setChapterNames] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const [subjectFilter, setSubjectFilter] = useState<ChapterSubject | 'All'>('All')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [subject, setSubject] = useState<ChapterSubject>('Physics')
  const [chapter, setChapter] = useState('')
  const [question, setQuestion] = useState('')
  const [herAnswer, setHerAnswer] = useState('')
  const [correctAnswer, setCorrectAnswer] = useState('')
  const [whyWrong, setWhyWrong] = useState('')
  const [category, setCategory] = useState<MistakeCategory>('conceptual')

  async function loadData() {
    try {
      const [loadedMistakes, loadedChapters] = await Promise.all([
        getAllMistakes(),
        getAllChapters(),
      ])
      setMistakes(loadedMistakes)
      setChapterNames(
        loadedChapters.filter((c) => c.subject === subject).map((c) => c.name),
      )
    } catch {
      setMistakes([])
      setChapterNames([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject])

  const filtered = useMemo(() => {
    const base =
      subjectFilter === 'All'
        ? mistakes
        : mistakes.filter((m) => m.subject === subjectFilter)
    return base.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [mistakes, subjectFilter])

  const breakdown = useMemo(
    () => computeCategoryBreakdown(subjectFilter === 'All' ? mistakes : filtered),
    [mistakes, filtered, subjectFilter],
  )

  const topCategory = breakdown[0]

  function resetForm() {
    setEditingId(null)
    setChapter('')
    setQuestion('')
    setHerAnswer('')
    setCorrectAnswer('')
    setWhyWrong('')
    setCategory('conceptual')
    setShowForm(false)
  }

  function loadIntoForm(m: Mistake) {
    setEditingId(m.id)
    setSubject(m.subject)
    setChapter(m.chapter)
    setQuestion(m.question)
    setHerAnswer(m.herAnswer)
    setCorrectAnswer(m.correctAnswer)
    setWhyWrong(m.whyWrong)
    setCategory(m.category)
    setShowForm(true)
  }

  async function handleSave() {
    if (!question.trim() || !chapter.trim()) return

    const nowIso = new Date().toISOString()
    const existing = mistakes.find((m) => m.id === editingId)

    if (existing) {
      const updated: Mistake = {
        ...existing,
        subject,
        chapter: chapter.trim(),
        question: question.trim(),
        herAnswer: herAnswer.trim(),
        correctAnswer: correctAnswer.trim(),
        whyWrong: whyWrong.trim(),
        category,
        updatedAt: nowIso,
      }
      await updateMistake(updated)
    } else {
      const newMistake: Mistake = {
        id: crypto.randomUUID(),
        subject,
        chapter: chapter.trim(),
        question: question.trim(),
        herAnswer: herAnswer.trim(),
        correctAnswer: correctAnswer.trim(),
        whyWrong: whyWrong.trim(),
        category,
        reviewStatus: 'unreviewed',
        createdAt: nowIso,
        updatedAt: nowIso,
      }
      await addMistake(newMistake)
    }

    resetForm()
    await loadData()
  }

  async function handleDelete(id: string) {
    await deleteMistake(id)
    if (editingId === id) resetForm()
    await loadData()
  }

  async function cycleStatus(m: Mistake) {
    const order: MistakeReviewStatus[] = ['unreviewed', 'reviewing', 'resolved']
    const next = order[(order.indexOf(m.reviewStatus) + 1) % order.length]
    await updateMistake({ ...m, reviewStatus: next, updatedAt: new Date().toISOString() })
    await loadData()
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] px-6 py-8 md:px-12 md:py-10">
      <motion.section variants={fadeUp} initial="hidden" animate="visible" className="grid gap-2">
        <Text variant="meta">Error notebook</Text>
        <Text variant="display">
          LEARN
          <br />
          FROM IT.
        </Text>
        <Text variant="caption">Log mistakes, spot patterns, close the gaps.</Text>
      </motion.section>

      <Rule />

      <section className="mt-8 grid grid-cols-4 gap-2 max-w-2xl">
        {(['All', ...subjects] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setSubjectFilter(item)}
            className={`border px-3 py-3 text-sm transition-colors ${
              subjectFilter === item
                ? 'border-ink bg-ink text-paper'
                : 'border-line hover:border-ink'
            }`}
          >
            {item}
          </button>
        ))}
      </section>

      {loading && <Text variant="caption" className="mt-8 block">Loading mistakes…</Text>}

      {!loading && (
        <>
          <Rule />

          {topCategory && (
            <section className="mt-8 max-w-xl border border-ink px-4 py-3">
              <Text variant="caption">
                Your most common mistake: {categoryLabels[topCategory.category]} (
                {topCategory.percentage}%)
              </Text>
            </section>
          )}

          {breakdown.length > 0 && (
            <section className="mt-4 grid max-w-xl gap-1.5">
              {breakdown.map((b) => (
                <div key={b.category} className="flex items-center justify-between text-xs text-neutral">
                  <span>{categoryLabels[b.category]}</span>
                  <span>{b.count} · {b.percentage}%</span>
                </div>
              ))}
            </section>
          )}

          <Rule />

          <section className="mt-8 grid max-w-2xl gap-3">
            <div className="flex items-center justify-between">
              <Text variant="meta">Mistakes ({filtered.length})</Text>
              <button
                type="button"
                onClick={() => (showForm ? resetForm() : setShowForm(true))}
                className="border border-ink px-3 py-2 text-xs transition-colors hover:bg-ink hover:text-paper"
              >
                {showForm ? 'Cancel' : '+ Log mistake'}
              </button>
            </div>

            {showForm && (
              <div className="grid gap-2 border border-line p-4">
                <div className="grid grid-cols-3 gap-2">
                  {subjects.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setSubject(item)}
                      className={`border px-2 py-2 text-xs transition-colors ${
                        subject === item
                          ? 'border-ink bg-ink text-paper'
                          : 'border-line hover:border-ink'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>

                <input
                  list="mistake-chapter-options"
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                  placeholder="Chapter"
                  className="border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-ink"
                />
                <datalist id="mistake-chapter-options">
                  {chapterNames.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>

                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Question"
                  rows={2}
                  className="border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-ink"
                />

                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={herAnswer}
                    onChange={(e) => setHerAnswer(e.target.value)}
                    placeholder="Her answer"
                    className="border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-ink"
                  />
                  <input
                    value={correctAnswer}
                    onChange={(e) => setCorrectAnswer(e.target.value)}
                    placeholder="Correct answer"
                    className="border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-ink"
                  />
                </div>

                <textarea
                  value={whyWrong}
                  onChange={(e) => setWhyWrong(e.target.value)}
                  placeholder="Why it went wrong"
                  rows={2}
                  className="border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-ink"
                />

                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {categories.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(c)}
                      className={`border px-2 py-2 text-xs transition-colors ${
                        category === c
                          ? 'border-ink bg-ink text-paper'
                          : 'border-line hover:border-ink'
                      }`}
                    >
                      {categoryLabels[c]}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => void handleSave()}
                  className="border border-ink bg-ink px-3 py-2 text-sm text-paper transition-opacity hover:opacity-80"
                >
                  {editingId ? 'Save changes' : 'Add mistake'}
                </button>
              </div>
            )}

            <div className="grid gap-2">
              {filtered.map((m) => (
                <div key={m.id} className="border border-line px-4 py-3 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <button type="button" onClick={() => loadIntoForm(m)} className="flex-1 text-left">
                      <div>{m.question}</div>
                      <div className="mt-1 text-xs text-neutral">
                        {m.subject} · {m.chapter} · {categoryLabels[m.category]}
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => void cycleStatus(m)}
                      className="whitespace-nowrap border border-line px-2 py-1 text-[10px] uppercase tracking-wide text-neutral transition-colors hover:border-ink hover:text-ink"
                    >
                      {m.reviewStatus}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(m.id)}
                      className="text-xs text-neutral hover:text-ink"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <Text variant="caption">No mistakes logged yet.</Text>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  )
}

export default Mistakes
