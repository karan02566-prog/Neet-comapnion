import { useEffect, useMemo, useState } from 'react'
import { motion, type Variants } from 'motion/react'

import Text from '../components/ui/Text'
import Rule from '../components/ui/Rule'
import {
  getAllNotes,
  addNote,
  updateNote,
  deleteNote,
  toggleFavorite,
  searchNotes,
} from '../services/noteRepository'
import { getAllChapters } from '../services/chapterRepository'

import type { Note } from '../types/note'
import type { ChapterSubject } from '../types/chapter'

const subjects: ChapterSubject[] = ['Physics', 'Chemistry', 'Biology']
const allFilter = 'All' as const

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
}

function renderPreview(content: string): string {
  const escaped = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br />')
}

function Notes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [chapterNames, setChapterNames] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const [subjectFilter, setSubjectFilter] = useState<ChapterSubject | typeof allFilter>(allFilter)
  const [query, setQuery] = useState('')
  const [favoritesOnly, setFavoritesOnly] = useState(false)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const [subject, setSubject] = useState<ChapterSubject>('Physics')
  const [chapter, setChapter] = useState('')
  const [topic, setTopic] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tagsInput, setTagsInput] = useState('')

  async function loadData() {
    try {
      const [loadedNotes, loadedChapters] = await Promise.all([
        getAllNotes(),
        getAllChapters(),
      ])
      setNotes(loadedNotes)
      setChapterNames(
        loadedChapters
          .filter((c) => c.subject === subject)
          .map((c) => c.name),
      )
    } catch {
      setNotes([])
      setChapterNames([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject])

  const filteredNotes = useMemo(() => {
    let result = notes

    if (subjectFilter !== allFilter) {
      result = result.filter((n) => n.subject === subjectFilter)
    }

    if (favoritesOnly) {
      result = result.filter((n) => n.favorite === 1)
    }

    result = searchNotes(result, query)

    return result.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }, [notes, subjectFilter, favoritesOnly, query])

  const selectedNote = notes.find((n) => n.id === selectedId) ?? null

  function resetForm() {
    setSelectedId(null)
    setChapter('')
    setTopic('')
    setTitle('')
    setContent('')
    setTagsInput('')
    setShowPreview(false)
  }

  function loadIntoForm(note: Note) {
    setSelectedId(note.id)
    setSubject(note.subject)
    setChapter(note.chapter)
    setTopic(note.topic)
    setTitle(note.title)
    setContent(note.content)
    setTagsInput(note.tags.join(', '))
    setShowPreview(false)
  }

  async function handleSave() {
    if (!title.trim() || !content.trim()) return

    const nowIso = new Date().toISOString()
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    if (selectedNote) {
      const updated: Note = {
        ...selectedNote,
        subject,
        chapter: chapter.trim(),
        topic: topic.trim(),
        title: title.trim(),
        content,
        tags,
        updatedAt: nowIso,
      }
      await updateNote(updated)
    } else {
      const newNote: Note = {
        id: crypto.randomUUID(),
        subject,
        chapter: chapter.trim(),
        topic: topic.trim(),
        title: title.trim(),
        content,
        tags,
        favorite: 0,
        createdAt: nowIso,
        updatedAt: nowIso,
      }
      await addNote(newNote)
    }

    resetForm()
    await loadData()
  }

  async function handleDelete(id: string) {
    await deleteNote(id)
    if (selectedId === id) resetForm()
    await loadData()
  }

  async function handleToggleFavorite(id: string) {
    await toggleFavorite(id)
    await loadData()
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] px-6 py-8 md:px-12 md:py-10">
      <motion.section
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="grid gap-2"
      >
        <Text variant="meta">Notes</Text>
        <Text variant="display">
          WRITE IT.
          <br />
          KEEP IT.
        </Text>
        <Text variant="caption">
          Search, filter by subject, star what matters.
        </Text>
      </motion.section>

      <Rule />

      <section className="mt-8 grid gap-3 max-w-3xl">
        <div className="grid grid-cols-4 gap-2">
          {[allFilter, ...subjects].map((item) => (
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
        </div>

        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, content, tags…"
            className="flex-1 border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-ink"
          />
          <button
            type="button"
            onClick={() => setFavoritesOnly((f) => !f)}
            className={`border px-3 py-2 text-sm transition-colors ${
              favoritesOnly
                ? 'border-ink bg-ink text-paper'
                : 'border-line hover:border-ink'
            }`}
          >
            ★ Favorites
          </button>
        </div>
      </section>

      {loading && (
        <Text variant="caption" className="mt-8 block">
          Loading notes…
        </Text>
      )}

      {!loading && (
        <>
          <Rule />

          <section className="mt-8 grid max-w-3xl gap-6 md:grid-cols-2">
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Text variant="meta">Notes ({filteredNotes.length})</Text>
                <button
                  type="button"
                  onClick={resetForm}
                  className="border border-ink px-3 py-2 text-xs transition-colors hover:bg-ink hover:text-paper"
                >
                  + New note
                </button>
              </div>

              {filteredNotes.length === 0 && (
                <Text variant="caption">No notes match.</Text>
              )}

              <div className="grid gap-2">
                {filteredNotes.map((n) => (
                  <div
                    key={n.id}
                    className={`border px-4 py-3 text-sm transition-colors ${
                      selectedId === n.id
                        ? 'border-ink'
                        : 'border-line hover:border-ink'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => loadIntoForm(n)}
                        className="flex-1 text-left"
                      >
                        <div>{n.title}</div>
                        <div className="text-xs text-neutral">
                          {n.subject} · {n.chapter || 'No chapter'}
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleToggleFavorite(n.id)}
                        className="text-xs"
                        aria-label="Toggle favorite"
                      >
                        {n.favorite === 1 ? '★' : '☆'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Text variant="meta">
                  {selectedNote ? 'Edit note' : 'New note'}
                </Text>
                {selectedNote && (
                  <button
                    type="button"
                    onClick={() => void handleDelete(selectedNote.id)}
                    className="border border-line px-3 py-2 text-xs text-neutral transition-colors hover:border-ink hover:text-ink"
                  >
                    Delete
                  </button>
                )}
              </div>

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
                list="note-chapter-options"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                placeholder="Chapter"
                className="border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-ink"
              />
              <datalist id="note-chapter-options">
                {chapterNames.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>

              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Topic (optional)"
                className="border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-ink"
              />

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                className="border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-ink"
              />

              <div className="flex items-center justify-between">
                <Text variant="caption">
                  Content — **bold**, *italic*, `code`
                </Text>
                <button
                  type="button"
                  onClick={() => setShowPreview((p) => !p)}
                  className="text-xs underline"
                >
                  {showPreview ? 'Edit' : 'Preview'}
                </button>
              </div>

              {!showPreview && (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your note…"
                  rows={10}
                  className="border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-ink"
                />
              )}

              {showPreview && (
                <div
                  className="min-h-[220px] border border-line px-3 py-2 text-sm"
                  dangerouslySetInnerHTML={{ __html: renderPreview(content) }}
                />
              )}

              <input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Tags (comma separated)"
                className="border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-ink"
              />

              <button
                type="button"
                onClick={() => void handleSave()}
                className="border border-ink bg-ink px-3 py-2 text-sm text-paper transition-opacity hover:opacity-80"
              >
                {selectedNote ? 'Save changes' : 'Add note'}
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  )
}

export default Notes
