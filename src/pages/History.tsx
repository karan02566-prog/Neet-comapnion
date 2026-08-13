import { useEffect, useMemo, useState } from 'react'
import { motion, type Variants } from 'motion/react'
import { Trash2 } from 'lucide-react'
import Text from '../components/ui/Text'
import Rule from '../components/ui/Rule'
import { sessionRepository } from '../services/sessionRepository'
import type { Session } from '../types/session'

const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delay: i * 0.05,
      ease: 'easeOut',
    },
  }),
}

type Filter = 'all' | 'Physics' | 'Chemistry' | 'Biology'

function formatDuration(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds))
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }

  if (minutes > 0) {
    return `${minutes}m`
  }

  return `${safeSeconds}s`
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatTime(date: string): string {
  return new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function History() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  async function loadSessions() {
    setIsLoading(true)
    setError(false)

    try {
      const storedSessions = await sessionRepository.getAll()

      const completedSessions = storedSessions
        .filter((session) => session.status === 'completed')
        .sort(
          (a, b) =>
            new Date(b.startedAt).getTime() -
            new Date(a.startedAt).getTime(),
        )

      setSessions(completedSessions)
    } catch {
      setError(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadSessions()
  }, [])

  const filteredSessions = useMemo(() => {
    if (filter === 'all') {
      return sessions
    }

    return sessions.filter(
      (session) => session.subject === filter,
    )
  }, [sessions, filter])

  const totalSeconds = useMemo(
    () =>
      filteredSessions.reduce(
        (total, session) =>
          total + session.durationSeconds,
        0,
      ),
    [filteredSessions],
  )

  const totalHours = Math.floor(totalSeconds / 3600)
  const totalMinutes = Math.floor(
    (totalSeconds % 3600) / 60,
  )

  const averageMinutes =
    filteredSessions.length === 0
      ? 0
      : Math.round(
          totalSeconds /
            filteredSessions.length /
            60,
        )

  async function deleteSession(id: string) {
    await sessionRepository.remove(id)

    setSessions((current) =>
      current.filter(
        (session) => session.id !== id,
      ),
    )
  }

  return (
    <div className="grid gap-12 px-6 py-10 md:px-12 md:py-16">
      <motion.section
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="grid gap-5 md:max-w-3xl"
      >
        <Text variant="meta">
          Your study record
        </Text>

        <Text
          variant="display"
          className="text-6xl font-semibold tracking-[-0.055em] md:text-8xl"
        >
          STUDY
          <br />
          HISTORY.
        </Text>

        <Text variant="caption">
          Every focused session counts.
          Keep building the record.
        </Text>
      </motion.section>

      <Rule />

      <motion.section
        custom={1}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="grid gap-8"
      >
        <div className="grid gap-1">
          <Text variant="meta">
            Overview
          </Text>

          <Text variant="subheading">
            {filteredSessions.length === 0
              ? 'No completed sessions yet.'
              : 'Your focused work, collected.'}
          </Text>
        </div>

        <div className="grid grid-cols-1 border-t border-line sm:grid-cols-3">
          <div className="py-5 sm:pr-6 sm:border-r sm:border-line">
            <Text variant="meta">
              Sessions
            </Text>

            <Text variant="heading" className="mt-2">
              {filteredSessions.length}
            </Text>
          </div>

          <div className="py-5 sm:px-6 sm:border-r sm:border-line">
            <Text variant="meta">
              Focus time
            </Text>

            <Text variant="heading" className="mt-2">
              {totalHours > 0
                ? `${totalHours}h ${totalMinutes}m`
                : `${totalMinutes}m`}
            </Text>
          </div>

          <div className="py-5 sm:pl-6">
            <Text variant="meta">
              Average session
            </Text>

            <Text variant="heading" className="mt-2">
              {averageMinutes}m
            </Text>
          </div>
        </div>
      </motion.section>

      <Rule />

      <motion.section
        custom={2}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="grid gap-6"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="grid gap-1">
            <Text variant="meta">
              Sessions
            </Text>

            <Text variant="subheading">
              Completed focus blocks.
            </Text>
          </div>

          <div className="flex flex-wrap gap-2">
            {(
              [
                'all',
                'Physics',
                'Chemistry',
                'Biology',
              ] as Filter[]
            ).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() =>
                  setFilter(item)
                }
                className={`border px-3 py-2 text-xs transition-colors ${
                  filter === item
                    ? 'border-ink bg-ink text-paper'
                    : 'border-line text-neutral hover:border-ink hover:text-ink'
                }`}
              >
                {item === 'all'
                  ? 'All'
                  : item}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="border border-dashed border-line px-6 py-8">
            <Text variant="body">
              Loading your study history...
            </Text>
          </div>
        ) : error ? (
          <div className="border border-dashed border-line px-6 py-8">
            <Text variant="body">
              Unable to load study history.
            </Text>

            <Text variant="caption">
              Refresh the page and try again.
            </Text>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="border border-dashed border-line px-6 py-10">
            <Text variant="body">
              Nothing here yet.
            </Text>

            <Text variant="caption">
              Complete a Focus session and
              it will appear here.
            </Text>
          </div>
        ) : (
          <div className="grid">
            {filteredSessions.map(
              (session, index) => (
                <motion.div
                  key={session.id}
                  custom={index + 3}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="grid gap-4 border-b border-line py-5 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-8"
                >
                  <div className="grid min-w-0 gap-1">
                    <Text variant="body">
                      {session.chapter ??
                        session.subject ??
                        'General study'}
                    </Text>

                    <Text variant="caption">
                      {formatDate(
                        session.startedAt,
                      )}{' '}
                      ·{' '}
                      {formatTime(
                        session.startedAt,
                      )}
                    </Text>
                  </div>

                  <div className="grid gap-1 sm:text-right">
                    <Text variant="meta">
                      Duration
                    </Text>

                    <Text variant="body">
                      {formatDuration(
                        session.durationSeconds,
                      )}
                    </Text>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      void deleteSession(
                        session.id,
                      )
                    }
                    aria-label="Delete session"
                    className="flex h-9 w-9 items-center justify-center border border-line text-neutral transition-colors hover:border-ink hover:text-ink sm:justify-self-end"
                  >
                    <Trash2
                      size={15}
                      strokeWidth={1.5}
                    />
                  </button>
                </motion.div>
              ),
            )}
          </div>
        )}
      </motion.section>

      <Rule />

      <motion.section
        custom={3}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="pb-4"
      >
        <Text variant="caption">
          Your history is stored locally
          in this browser.
        </Text>
      </motion.section>
    </div>
  )
}

export default History