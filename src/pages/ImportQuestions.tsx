import { useState } from 'react'
import { motion, type Variants } from 'motion/react'

import Text from '../components/ui/Text'
import Rule from '../components/ui/Rule'
import { addQuestion } from '../services/questionRepository'

import type { QuestionSubject, SourceType } from '../types/question'

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

interface DraftQuestion {
  subject: QuestionSubject
  chapter: string
  year?: number
  sourceType: SourceType
  questionText: string
  options: string[]
  correctAnswer: number
  explanation?: string
}

const templateJson = `[
  {
    "subject": "Physics",
    "chapter": "Laws of Motion",
    "year": 2023,
    "sourceType": "PYQ",
    "questionText": "State Newton's second law in terms of momentum.",
    "options": [
      "F = ma",
      "F = dp/dt",
      "F = mv",
      "F = m/a"
    ],
    "correctAnswer": 1,
    "explanation": "Newton's second law states force equals the rate of change of momentum, F = dp/dt, which reduces to F = ma for constant mass."
  }
]`

function validateQuestions(raw: unknown): {
  valid: DraftQuestion[]
  errors: string[]
} {
  const errors: string[] = []
  const valid: DraftQuestion[] = []

  if (!Array.isArray(raw)) {
    return { valid: [], errors: ['Input must be a JSON array of questions.'] }
  }

  raw.forEach((item, i) => {
    const prefix = `Question ${i + 1}:`

    if (typeof item !== 'object' || item === null) {
      errors.push(`${prefix} not a valid object.`)
      return
    }

    const q = item as Record<string, unknown>

    if (!subjects.includes(q.subject as QuestionSubject)) {
      errors.push(`${prefix} subject must be one of ${subjects.join(', ')}.`)
      return
    }

    if (typeof q.chapter !== 'string' || q.chapter.trim() === '') {
      errors.push(`${prefix} chapter is required.`)
      return
    }

    if (!sourceTypes.includes(q.sourceType as SourceType)) {
      errors.push(`${prefix} sourceType must be one of ${sourceTypes.join(', ')}.`)
      return
    }

    if (
      typeof q.questionText !== 'string' ||
      q.questionText.trim() === ''
    ) {
      errors.push(`${prefix} questionText is required.`)
      return
    }

    if (
      !Array.isArray(q.options) ||
      q.options.length < 2 ||
      q.options.some((opt) => typeof opt !== 'string' || opt.trim() === '')
    ) {
      errors.push(`${prefix} options must be an array of at least 2 non-empty strings.`)
      return
    }

    if (
      typeof q.correctAnswer !== 'number' ||
      q.correctAnswer < 0 ||
      q.correctAnswer >= q.options.length
    ) {
      errors.push(`${prefix} correctAnswer must be a valid index into options.`)
      return
    }

    if (q.year !== undefined && typeof q.year !== 'number') {
      errors.push(`${prefix} year must be a number if provided.`)
      return
    }

    if (q.explanation !== undefined && typeof q.explanation !== 'string') {
      errors.push(`${prefix} explanation must be a string if provided.`)
      return
    }

    valid.push({
      subject: q.subject as QuestionSubject,
      chapter: q.chapter as string,
      year: q.year as number | undefined,
      sourceType: q.sourceType as SourceType,
      questionText: q.questionText as string,
      options: q.options as string[],
      correctAnswer: q.correctAnswer as number,
      explanation: q.explanation as string | undefined,
    })
  })

  return { valid, errors }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function ImportQuestions() {
  const [jsonInput, setJsonInput] = useState('')
  const [validated, setValidated] = useState<DraftQuestion[] | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [images, setImages] = useState<Record<number, string>>({})
  const [inserting, setInserting] = useState(false)
  const [insertedCount, setInsertedCount] = useState<number | null>(null)

  function handleValidate() {
    setInsertedCount(null)
    setImages({})

    let parsed: unknown

    try {
      parsed = JSON.parse(jsonInput)
    } catch {
      setValidated(null)
      setErrors(['Invalid JSON — check for missing commas or brackets.'])
      return
    }

    const result = validateQuestions(parsed)

    setErrors(result.errors)
    setValidated(result.errors.length === 0 ? result.valid : null)
  }

  async function handleImageAttach(index: number, file: File | null) {
    if (!file) return

    try {
      const dataUrl = await fileToDataUrl(file)
      setImages((prev) => ({ ...prev, [index]: dataUrl }))
    } catch {
      setErrors((prev) => [...prev, `Could not read image for question ${index + 1}.`])
    }
  }

  async function handleInsert() {
    if (!validated) return

    setInserting(true)
    const now = new Date().toISOString()

    for (let i = 0; i < validated.length; i++) {
      const draft = validated[i]

      await addQuestion({
        id: crypto.randomUUID(),
        subject: draft.subject,
        chapter: draft.chapter,
        year: draft.year,
        sourceType: draft.sourceType,
        questionText: draft.questionText,
        options: draft.options,
        correctAnswer: draft.correctAnswer,
        explanation: draft.explanation,
        imageUrl: images[i],
        createdAt: now,
      })
    }

    setInsertedCount(validated.length)
    setValidated(null)
    setJsonInput('')
    setImages({})
    setInserting(false)
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] px-6 py-8 md:px-12 md:py-10">
      <motion.section
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="grid gap-2"
      >
        <Text variant="meta">Question authoring</Text>
        <Text variant="display">
          IMPORT
          <br />
          QUESTIONS.
        </Text>
        <Text variant="caption">
          Paste structured questions as JSON. Write explanations in your own
          words and attach your own diagram images — nothing is scraped.
        </Text>
      </motion.section>

      <Rule />

      <section className="mt-8 grid max-w-2xl gap-4">
        <div className="grid gap-1">
          <Text variant="meta">Format example</Text>
          <pre className="overflow-x-auto border border-line bg-paper p-4 text-xs text-neutral">
            {templateJson}
          </pre>
        </div>

        <label className="grid gap-2">
          <span className="text-xs uppercase tracking-widest text-neutral">
            Paste your questions (JSON array)
          </span>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            rows={10}
            placeholder="Paste a JSON array of questions here..."
            className="border border-line bg-paper px-3 py-3 font-mono text-xs outline-none focus:border-ink"
          />
        </label>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleValidate}
            disabled={jsonInput.trim() === ''}
            className="border border-ink px-5 py-3 text-sm transition-colors hover:bg-ink hover:text-paper disabled:opacity-40"
          >
            Validate
          </button>

          {validated && (
            <button
              type="button"
              onClick={() => void handleInsert()}
              disabled={inserting}
              className="border border-ink bg-ink px-5 py-3 text-sm text-paper transition-colors hover:opacity-80 disabled:opacity-40"
            >
              {inserting
                ? 'Inserting…'
                : `Insert ${validated.length} question${validated.length === 1 ? '' : 's'}`}
            </button>
          )}
        </div>

        {insertedCount !== null && (
          <Text variant="caption">
            Inserted {insertedCount} question{insertedCount === 1 ? '' : 's'} successfully.
          </Text>
        )}

        {errors.length > 0 && (
          <div className="grid gap-1 border border-line p-4">
            <Text variant="meta">Fix these before importing</Text>
            {errors.map((err, i) => (
              <Text key={i} variant="caption" className="text-red-700">
                {err}
              </Text>
            ))}
          </div>
        )}

        {validated && validated.length > 0 && (
          <div className="grid gap-3">
            <Text variant="meta">
              {validated.length} question{validated.length === 1 ? '' : 's'} validated — optionally attach diagrams
            </Text>

            {validated.map((q, i) => (
              <div
                key={i}
                className="grid gap-2 border border-line p-4 text-sm"
              >
                <Text variant="caption">
                  {q.subject} / {q.chapter}
                  {q.year ? ` / ${q.year}` : ''}
                </Text>
                <span>{q.questionText}</span>

                <label className="grid gap-1">
                  <span className="text-xs uppercase tracking-widest text-neutral">
                    Diagram (optional)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      void handleImageAttach(i, e.target.files?.[0] ?? null)
                    }
                    className="text-xs"
                  />
                </label>

                {images[i] && (
                  <img
                    src={images[i]}
                    alt="Attached diagram"
                    className="max-w-xs border border-line"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default ImportQuestions
