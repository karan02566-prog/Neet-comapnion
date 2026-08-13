import { useEffect, useMemo, useState } from 'react'
import { motion, type Variants } from 'motion/react'

import Text from '../components/ui/Text'
import Rule from '../components/ui/Rule'
import {
  getAllMockTests,
  addMockTest,
  deleteMockTest,
  getScoreProgression,
} from '../services/mockTestRepository'

import type { MockTest, SubjectScore } from '../types/mockTest'
import type { ChapterSubject } from '../types/chapter'

const subjects: ChapterSubject[] = ['Physics', 'Chemistry', 'Biology']

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

function MockTests() {
  const [tests, setTests] = useState<MockTest[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [scores, setScores] = useState<Record<ChapterSubject, string>>({
    Physics: '',
    Chemistry: '',
    Biology: '',
  })
  const [maxScores, setMaxScores] = useState<Record<ChapterSubject, string>>({
    Physics: '180',
    Chemistry: '180',
    Biology: '360',
  })
  const [attempted, setAttempted] = useState('')
  const [incorrect, setIncorrect] = useState('')
  const [timeTaken, setTimeTaken] = useState('')

  async function loadData() {
    try {
      setTests(await getAllMockTests())
    } catch {
      setTests([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const progression = useMemo(() => getScoreProgression(tests), [tests])

  function resetForm() {
    setName('')
    setDate('')
    setScores({ Physics: '', Chemistry: '', Biology: '' })
    setAttempted('')
    setIncorrect('')
    setTimeTaken('')
    setShowForm(false)
  }

  async function handleSave() {
    if (!name.trim() || !date) return

    const subjectScores: SubjectScore[] = subjects.map((s) => ({
      subject: s,
      score: Number(scores[s]) || 0,
      maxScore: Number(maxScores[s]) || 0,
    }))

    const total = subjectScores.reduce((sum, s) => sum + s.score, 0)
    const maxTotal = subjectScores.reduce((sum, s) => sum + s.maxScore, 0)
    const attemptedNum = Number(attempted) || 0
    const incorrectNum = Number(incorrect) || 0
    const accuracy =
      attemptedNum > 0
        ? Math.round(((attemptedNum - incorrectNum) / attemptedNum) * 100)
        : 0

    const nowIso = new Date().toISOString()
    const newTest: MockTest = {
      id: crypto.randomUUID(),
      name: name.trim(),
      date,
      subjectScores,
      total,
      maxTotal,
      accuracy,
      attempted: attemptedNum,
      incorrect: incorrectNum,
      timeTakenMinutes: Number(timeTaken) || 0,
      createdAt: nowIso,
      updatedAt: nowIso,
    }

    await addMockTest(newTest)
    resetForm()
    await loadData()
  }

  async function handleDelete(id: string) {
    await deleteMockTest(id)
    await loadData()
  }

  function formatDate(iso: string): string {
    return new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] px-6 py-8 md:px-12 md:py-10">
      <motion.section variants={fadeUp} initial="hidden" animate="visible" className="grid gap-2">
        <Text variant="meta">Mock tests</Text>
        <Text variant="display">
          TRACK
          <br />
          THE CLIMB.
        </Text>
        <Text variant="caption">Log every attempt, watch the score move.</Text>
      </motion.section>

      <Rule />

      {loading && <Text variant="caption" className="mt-8 block">Loading tests…</Text>}

      {!loading && (
        <>
          {progression.length > 0 && (
            <section className="mt-8 max-w-2xl">
              <Text variant="meta">Score progression</Text>
              <Text variant="caption" className="mt-2 block">
                {progression.join(' → ')}
              </Text>
            </section>
          )}

          <Rule />

          <section className="mt-8 grid max-w-2xl gap-3">
            <div className="flex items-center justify-between">
              <Text variant="meta">History ({tests.length})</Text>
              <button
                type="button"
                onClick={() => (showForm ? resetForm() : setShowForm(true))}
                className="border border-ink px-3 py-2 text-xs transition-colors hover:bg-ink hover:text-paper"
              >
                {showForm ? 'Cancel' : '+ Log test'}
              </button>
            </div>

            {showForm && (
              <div className="grid gap-2 border border-line p-4">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Test name (e.g. AITS Full Test 3)"
                  className="border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-ink"
                />

                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-ink"
                />

                <div className="grid grid-cols-3 gap-2">
                  {subjects.map((s) => (
                    <div key={s} className="grid gap-1">
                      <Text variant="caption">{s}</Text>
                      <input
                        type="number"
                        value={scores[s]}
                        onChange={(e) =>
                          setScores((prev) => ({ ...prev, [s]: e.target.value }))
                        }
                        placeholder="Score"
                        className="border border-line bg-transparent px-2 py-2 text-sm outline-none focus:border-ink"
                      />
                      <input
                        type="number"
                        value={maxScores[s]}
                        onChange={(e) =>
                          setMaxScores((prev) => ({ ...prev, [s]: e.target.value }))
                        }
                        placeholder="Max"
                        className="border border-line bg-transparent px-2 py-2 text-xs outline-none focus:border-ink"
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    value={attempted}
                    onChange={(e) => setAttempted(e.target.value)}
                    placeholder="Attempted"
                    className="border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-ink"
                  />
                  <input
                    type="number"
                    value={incorrect}
                    onChange={(e) => setIncorrect(e.target.value)}
                    placeholder="Incorrect"
                    className="border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-ink"
                  />
                  <input
                    type="number"
                    value={timeTaken}
                    onChange={(e) => setTimeTaken(e.target.value)}
                    placeholder="Time (min)"
                    className="border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-ink"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => void handleSave()}
                  className="border border-ink bg-ink px-3 py-2 text-sm text-paper transition-opacity hover:opacity-80"
                >
                  Add test
                </button>
              </div>
            )}

            <div className="grid gap-2">
              {tests
                .slice()
                .reverse()
                .map((t) => (
                  <div key={t.id} className="border border-line px-4 py-3 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div>{t.name}</div>
                        <div className="mt-1 text-xs text-neutral">
                          {formatDate(t.date)} · {t.total}/{t.maxTotal} · {t.accuracy}%
                          accuracy
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleDelete(t.id)}
                        className="text-xs text-neutral hover:text-ink"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              {tests.length === 0 && (
                <Text variant="caption">No mock tests logged yet.</Text>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  )
}

export default MockTests
