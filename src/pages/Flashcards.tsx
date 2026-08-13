import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence, type Variants } from 'motion/react'

import Text from '../components/ui/Text'
import Rule from '../components/ui/Rule'
import {
  getAllFlashcards,
  addFlashcard,
  reviewFlashcard,
  computeNextReview,
} from '../services/flashcardRepository'
import { getAllChapters } from '../services/chapterRepository'

import type { Flashcard } from '../types/flashcard'
import type { ChapterSubject } from '../types/chapter'

const subjects: ChapterSubject[] = ['Physics', 'Chemistry', 'Biology']

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
}

function Flashcards() {
  const [cards, setCards] = useState<Flashcard[]>([])
  const [chapterNames, setChapterNames] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [subject, setSubject] = useState<ChapterSubject>('Physics')

  const [reviewIndex, setReviewIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const [showForm, setShowForm] = useState(false)
  const [chapter, setChapter] = useState('')
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [tagsInput, setTagsInput] = useState('')

  async function loadData() {
    try {
      const [loadedCards, loadedChapters] = await Promise.all([
        getAllFlashcards(),
        getAllChapters(),
      ])
      setCards(loadedCards)
      setChapterNames(
        loadedChapters.filter((c) => c.subject === subject).map((c) => c.name),
      )
    } catch {
      setCards([])
      setChapterNames([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject])

  const now = new Date()

  const dueQueue = useMemo(() => {
    return cards
      .filter((c) => c.subject === subject && new Date(c.nextReviewAt) <= now)
      .sort((a, b) => a.nextReviewAt.localeCompare(b.nextReviewAt))
  }, [cards, subject]) // eslint-disable-line react-hooks/exhaustive-deps

  const subjectCards = cards.filter((c) => c.subject === subject)
  const currentCard = dueQueue[reviewIndex]

  async function handleAddCard() {
    if (!chapter.trim() || !front.trim() || !back.trim()) return

    const nowIso = new Date().toISOString()
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const newCard: Flashcard = {
      id: crypto.randomUUID(),
      subject,
      chapter: chapter.trim(),
      front: front.trim(),
      back: back.trim(),
      tags,
      leitnerBox: 1,
      nextReviewAt: computeNextReview(1, new Date()),
      createdAt: nowIso,
      updatedAt: nowIso,
    }

    await addFlashcard(newCard)
    setChapter('')
    setFront('')
    setBack('')
    setTagsInput('')
    setShowForm(false)
    await loadData()
  }

  async function handleReview(correct: boolean) {
    if (!currentCard) return
    await reviewFlashcard(currentCard.id, correct)
    setFlipped(false)
    await loadData()
    setReviewIndex(0)
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] px-6 py-8 md:px-12 md:py-10">
      <motion.section
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="grid gap-2"
      >
        <Text variant="meta">Spaced repetition</Text>
        <Text variant="display">
          FLIP.
          <br />
          RECALL.
        </Text>
        <Text variant="caption">
          Review what's due, add new cards as you go.
        </Text>
      </motion.section>

      <Rule />

      <section className="mt-8 grid grid-cols-3 gap-2 max-w-xl">
        {subjects.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setSubject(item)
              setReviewIndex(0)
              setFlipped(false)
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
      </section>

      {loading && (
        <Text variant="caption" className="mt-8 block">
          Loading flashcards…
        </Text>
      )}

      {!loading && (
        <>
          <Rule />

          <section className="mt-8 grid max-w-xl gap-4">
            <Text variant="meta">
              Due for review ({dueQueue.length})
            </Text>

            {!currentCard && (
              <Text variant="caption">
                Nothing due right now — add a card below or check back later.
              </Text>
            )}

            {currentCard && (
              <div className="grid gap-3">
                <AnimatePresence mode="wait">
                  <motion.button
                    key={currentCard.id + String(flipped)}
                    type="button"
                    onClick={() => setFlipped((f) => !f)}
                    initial={{ opacity: 0, rotateX: -8 }}
                    animate={{ opacity: 1, rotateX: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="flex min-h-[220px] w-full flex-col items-center justify-center border border-ink px-6 py-8 text-center"
                  >
                    <Text variant="caption" className="mb-3 block">
                      {flipped ? 'Back' : 'Front'} · Box {currentCard.leitnerBox} ·{' '}
                      {currentCard.chapter}
                    </Text>
                    <Text variant="display" className="text-2xl">
                      {flipped ? currentCard.back : currentCard.front}
                    </Text>
                    <Text variant="caption" className="mt-4 block">
                      Tap to flip
                    </Text>
                  </motion.button>
                </AnimatePresence>

                {flipped && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => void handleReview(false)}
                      className="border border-ink px-3 py-3 text-sm transition-colors hover:bg-ink hover:text-paper"
                    >
                      Got it wrong
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleReview(true)}
                      className="border border-ink bg-ink px-3 py-3 text-sm text-paper transition-opacity hover:opacity-80"
                    >
                      Got it right
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>

          <Rule />

          <section className="mt-8 grid max-w-xl gap-3">
            <div className="flex items-center justify-between">
              <Text variant="meta">All cards ({subjectCards.length})</Text>
              <button
                type="button"
                onClick={() => setShowForm((s) => !s)}
                className="border border-ink px-3 py-2 text-xs transition-colors hover:bg-ink hover:text-paper"
              >
                {showForm ? 'Cancel' : '+ New card'}
              </button>
            </div>

            {showForm && (
              <div className="grid gap-2 border border-line p-4">
                <input
                  list="chapter-options"
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                  placeholder="Chapter"
                  className="border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-ink"
                />
                <datalist id="chapter-options">
                  {chapterNames.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>

                <textarea
                  value={front}
                  onChange={(e) => setFront(e.target.value)}
                  placeholder="Front (question / term)"
                  rows={2}
                  className="border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-ink"
                />

                <textarea
                  value={back}
                  onChange={(e) => setBack(e.target.value)}
                  placeholder="Back (answer / definition)"
                  rows={2}
                  className="border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-ink"
                />

                <input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Tags (comma separated)"
                  className="border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-ink"
                />

                <button
                  type="button"
                  onClick={() => void handleAddCard()}
                  className="border border-ink bg-ink px-3 py-2 text-sm text-paper transition-opacity hover:opacity-80"
                >
                  Add card
                </button>
              </div>
            )}

            <div className="grid gap-2">
              {subjectCards.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between border border-line px-4 py-3 text-sm text-neutral"
                >
                  <span>{c.front}</span>
                  <span className="text-xs">
                    Box {c.leitnerBox} · {c.chapter}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}

export default Flashcards
