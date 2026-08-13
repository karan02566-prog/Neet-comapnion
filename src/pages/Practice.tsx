import { useEffect, useMemo, useState } from 'react'
import { motion, type Variants } from 'motion/react'

import Text from '../components/ui/Text'
import Rule from '../components/ui/Rule'
import { getAllQuestions, addQuestion } from '../services/questionRepository'
import { addChapter } from '../services/chapterRepository'

import type { Question, QuestionSubject, SourceType } from '../types/question'

const subjects: QuestionSubject[] = ['Physics', 'Chemistry', 'Biology']
const sourceTypes: SourceType[] = ['PYQ', 'Mock Test', 'Module', 'Custom']

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
}

async function seedSampleData() {
  const now = new Date().toISOString()

  const chapters = [
    { id: crypto.randomUUID(), subject: 'Physics' as const, name: 'Kinematics', status: 'completed' as const, updatedAt: now },
    { id: crypto.randomUUID(), subject: 'Physics' as const, name: 'Laws of Motion', status: 'in-progress' as const, updatedAt: now },
    { id: crypto.randomUUID(), subject: 'Chemistry' as const, name: 'Chemical Bonding', status: 'not-started' as const, updatedAt: now },
    { id: crypto.randomUUID(), subject: 'Biology' as const, name: 'Cell Structure', status: 'in-progress' as const, updatedAt: now },
  ]

  const questions = [
    {
      id: crypto.randomUUID(),
      subject: 'Physics' as const,
      chapter: 'Kinematics',
      year: 2023,
      sourceType: 'PYQ' as const,
      questionText: 'A body starts from rest and moves with constant acceleration. Which quantity varies linearly with time?',
      options: ['Displacement', 'Velocity', 'Acceleration', 'Kinetic energy'],
      correctAnswer: 1,
      explanation: 'With constant acceleration, v = u + at, so velocity increases linearly with time.',
      createdAt: now,
    },
    {
      id: crypto.randomUUID(),
      subject: 'Chemistry' as const,
      chapter: 'Chemical Bonding',
      year: 2022,
      sourceType: 'PYQ' as const,
      questionText: 'Which of the following molecules has zero dipole moment?',
      options: ['H2O', 'NH3', 'CO2', 'HCl'],
      correctAnswer: 2,
      explanation: 'CO2 is linear and symmetric, so bond dipoles cancel out.',
      createdAt: now,
    },
  ]

  for (const chapter of chapters) {
    await addChapter(chapter)
  }

  for (const question of questions) {
    await addQuestion(question)
  }
}

function Practice() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)

  const [subject, setSubject] = useState<QuestionSubject | ''>('')
  const [chapter, setChapter] = useState('')
  const [year, setYear] = useState<number | ''>('')
  const [sourceType, setSourceType] = useState<SourceType | ''>('')

  const [index, setIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)

  async function loadQuestions() {
    try {
      const loaded = await getAllQuestions()
      setQuestions(loaded)
    } catch {
      setQuestions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadQuestions()
  }, [])

  async function handleSeed() {
    setLoading(true)
    await seedSampleData()
    await loadQuestions()
  }

  const availableChapters = useMemo(() => {
    const chapters = questions
      .filter((q) => !subject || q.subject === subject)
      .map((q) => q.chapter)

    return Array.from(new Set(chapters)).sort()
  }, [questions, subject])

  const availableYears = useMemo(() => {
    const years = questions
      .filter((q) => !subject || q.subject === subject)
      .map((q) => q.year)
      .filter((y): y is number => typeof y === 'number')

    return Array.from(new Set(years)).sort((a, b) => b - a)
  }, [questions, subject])

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (subject && q.subject !== subject) return false
      if (chapter && q.chapter !== chapter) return false
      if (year !== '' && q.year !== year) return false
      if (sourceType && q.sourceType !== sourceType) return false
      return true
    })
  }, [questions, subject, chapter, year, sourceType])

  useEffect(() => {
    setIndex(0)
    setSelectedOption(null)
    setShowAnswer(false)
  }, [subject, chapter, year, sourceType])

  const currentQuestion = filteredQuestions[index]

  function goNext() {
    if (index < filteredQuestions.length - 1) {
      setIndex((i) => i + 1)
      setSelectedOption(null)
      setShowAnswer(false)
    }
  }

  function goPrev() {
    if (index > 0) {
      setIndex((i) => i - 1)
      setSelectedOption(null)
      setShowAnswer(false)
    }
  }

  function selectOption(optionIndex: number) {
    if (showAnswer) return
    setSelectedOption(optionIndex)
    setShowAnswer(true)
  }

  function clearFilters() {
    setSubject('')
    setChapter('')
    setYear('')
    setSourceType('')
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] px-6 py-8 md:px-12 md:py-10">
      <motion.section
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="grid gap-2"
      >
        <Text variant="meta">Practice questions</Text>
        <Text variant="display">
          PRACTICE
          <br />
          PYQs.
        </Text>
        <Text variant="caption">
          One question at a time. Filter by subject, chapter, year or source.
        </Text>
      </motion.section>

      {questions.length === 0 && !loading && (
        <button
          type="button"
          onClick={() => void handleSeed()}
          className="mt-4 border border-line px-4 py-2 text-xs text-neutral transition-colors hover:border-ink hover:text-ink"
        >
          Seed sample data (dev only)
        </button>
      )}

      <Rule />

      <section className="mt-8 grid max-w-xl gap-4">
        <div className="grid grid-cols-3 gap-2">
          {subjects.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setSubject(item === subject ? '' : item)
                setChapter('')
                setYear('')
              }}
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

        <div className="grid gap-2 sm:grid-cols-3">
          <select
            value={chapter}
            onChange={(e) => setChapter(e.target.value)}
            className="border border-line bg-paper px-3 py-3 text-sm outline-none focus:border-ink"
          >
            <option value="">All chapters</option>
            {availableChapters.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) =>
              setYear(e.target.value === '' ? '' : Number(e.target.value))
            }
            className="border border-line bg-paper px-3 py-3 text-sm outline-none focus:border-ink"
          >
            <option value="">All years</option>
            {availableYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <select
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value as SourceType | '')}
            className="border border-line bg-paper px-3 py-3 text-sm outline-none focus:border-ink"
          >
            <option value="">All sources</option>
            {sourceTypes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {(subject || chapter || year !== '' || sourceType) && (
          <button
            type="button"
            onClick={clearFilters}
            className="justify-self-start border border-line px-4 py-2 text-xs text-neutral transition-colors hover:text-ink"
          >
            Clear filters
          </button>
        )}
      </section>

      <Rule />

      <section className="mt-8">
        {loading && <Text variant="caption">Loading questions…</Text>}

        {!loading && filteredQuestions.length === 0 && (
          <Text variant="caption">
            No questions match these filters yet.
          </Text>
        )}

        {!loading && currentQuestion && (
          <motion.div
            key={currentQuestion.id}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="grid max-w-2xl gap-6"
          >
            <div className="flex items-center justify-between">
              <Text variant="meta">
                {currentQuestion.subject} / {currentQuestion.chapter}
                {currentQuestion.year ? ` / ${currentQuestion.year}` : ''}
              </Text>
              <Text variant="caption">
                {index + 1} / {filteredQuestions.length}
              </Text>
            </div>

            <Text variant="subheading">{currentQuestion.questionText}</Text>

            {currentQuestion.imageUrl && (
              <img
                src={currentQuestion.imageUrl}
                alt="Question diagram"
                className="max-w-full border border-line"
              />
            )}

            <div className="grid gap-2">
              {currentQuestion.options.map((option, i) => {
                const isCorrect = i === currentQuestion.correctAnswer
                const isSelected = i === selectedOption

                let stateClass = 'border-line hover:border-ink'
                if (showAnswer && isCorrect) {
                  stateClass = 'border-ink bg-ink text-paper'
                } else if (showAnswer && isSelected && !isCorrect) {
                  stateClass = 'border-ink text-neutral line-through'
                }

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => selectOption(i)}
                    className={`border px-4 py-3 text-left text-sm transition-colors ${stateClass}`}
                  >
                    {option}
                  </button>
                )
              })}
            </div>

            {showAnswer && currentQuestion.explanation && (
              <div className="border-t border-line pt-4">
                <Text variant="meta">Explanation</Text>
                <Text variant="body" className="mt-1">
                  {currentQuestion.explanation}
                </Text>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={goPrev}
                disabled={index === 0}
                className="border border-line px-5 py-3 text-sm transition-colors hover:border-ink disabled:opacity-40"
              >
                ← Previous
              </button>

              <button
                type="button"
                onClick={goNext}
                disabled={index === filteredQuestions.length - 1}
                className="border border-ink px-5 py-3 text-sm transition-colors hover:bg-ink hover:text-paper disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </motion.div>
        )}
      </section>
    </div>
  )
}

export default Practice
