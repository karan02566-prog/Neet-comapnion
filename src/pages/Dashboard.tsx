import { useEffect, useMemo, useState } from 'react'
import { motion, type Variants } from 'motion/react'
import Text from '../components/ui/Text'
import Rule from '../components/ui/Rule'
import { taskRepository } from '../services/taskRepository'
import type { Task } from '../types/task'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delay: i * 0.08,
      ease: 'easeOut',
    },
  }),
}

const EXAM_YEAR = 2027

const subjects = ['Physics', 'Chemistry', 'Biology'] as const

function getTodayDate(): string {
  const now = new Date()

  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getDaysUntilExam(examYear: number): number {
  const today = new Date()
  const examDate = new Date(`${examYear}-05-03T00:00:00`)

  const difference = examDate.getTime() - today.getTime()

  return Math.max(
    0,
    Math.ceil(difference / (1000 * 60 * 60 * 24)),
  )
}

function formatStudyDate(date: string): string {
  const parsedDate = new Date(`${date}T00:00:00`)

  return parsedDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadTasks() {
      setIsLoading(true)
      setLoadError(false)

      try {
        const storedTasks = await taskRepository.getAll()

        if (isMounted) {
          setTasks(storedTasks)
          setIsLoading(false)
        }
      } catch {
        if (isMounted) {
          setTasks([])
          setLoadError(true)
          setIsLoading(false)
        }
      }
    }

    void loadTasks()

    return () => {
      isMounted = false
    }
  }, [])

  const today = getTodayDate()

  const todayTasks = useMemo(
    () =>
      tasks
        .filter((task) => task.date === today)
        .slice()
        .sort((a, b) =>
          (a.startTime ?? '99:99').localeCompare(
            b.startTime ?? '99:99',
          ),
        ),
    [tasks, today],
  )

  const completedToday = useMemo(
    () =>
      todayTasks.filter(
        (task) => task.status === 'completed',
      ).length,
    [todayTasks],
  )

  const nextTask = useMemo(() => {
    return todayTasks.find(
      (task) => task.status !== 'completed',
    )
  }, [todayTasks])

  const subjectTaskCounts = useMemo(() => {
    return subjects.map((subject) => {
      const subjectTasks = tasks.filter(
        (task) => task.subject === subject,
      )

      const completed = subjectTasks.filter(
        (task) => task.status === 'completed',
      ).length

      const progress =
        subjectTasks.length === 0
          ? 0
          : Math.round(
              (completed / subjectTasks.length) * 100,
            )

      return {
        name: subject,
        progress,
      }
    })
  }, [tasks])

  const completionText = isLoading
    ? 'LOADING'
    : loadError
      ? 'ERROR'
      : `${completedToday} / ${todayTasks.length}`

  return (
    <div className="px-6 py-10 md:px-12 md:py-16 grid gap-12 md:gap-16">
      {/* Header block */}
      <motion.section
        className="grid gap-2"
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <Text variant="meta">
          NEET / {EXAM_YEAR} — {getDaysUntilExam(EXAM_YEAR)} DAYS
        </Text>

        <Text variant="display">
          YOUR
          <br />
          NEXT
          <br />
          LEVEL.
        </Text>
      </motion.section>

      <Rule />

      {/* Metrics row */}
      <motion.section
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8"
        custom={1}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <div>
          <Text variant="meta">Today</Text>
          <Text variant="heading">{completionText}</Text>
          <Text variant="caption">
            {formatStudyDate(today)}
          </Text>
        </div>

        <div>
          <Text variant="meta">Tasks remaining</Text>
          <Text variant="heading">
            {isLoading || loadError
              ? '—'
              : todayTasks.length - completedToday}
          </Text>
        </div>

        <div>
          <Text variant="meta">Next session</Text>

          {nextTask && !loadError ? (
            <>
              <Text variant="heading">
                {nextTask.startTime ?? 'OPEN'}
              </Text>
              <Text variant="caption">
                {nextTask.title}
              </Text>
            </>
          ) : (
            <Text variant="heading">
              {loadError ? 'ERROR' : 'NONE'}
            </Text>
          )}
        </div>

        <div>
          <Text variant="meta">Focus mode</Text>
          <Text variant="heading">Enter →</Text>
        </div>
      </motion.section>

      <Rule />

      {/* Subject progress */}
      <motion.section
        className="grid gap-4"
        custom={2}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <Text variant="meta">Task completion by subject</Text>

        {loadError ? (
          <Text variant="caption">
            Task data could not be loaded.
          </Text>
        ) : (
          <div className="grid gap-3">
            {subjectTaskCounts.map((subject) => (
              <div
                key={subject.name}
                className="grid grid-cols-[70px_1fr_40px] items-center gap-3 sm:grid-cols-[100px_1fr_50px] sm:gap-4"
              >
                <Text variant="caption">
                  {subject.name}
                </Text>

                <div className="h-[2px] bg-line relative">
                  <div
                    className="h-[2px] bg-ink absolute left-0 top-0 transition-all"
                    style={{
                      width: `${subject.progress}%`,
                    }}
                  />
                </div>

                <Text variant="caption">
                  {subject.progress}%
                </Text>
              </div>
            ))}
          </div>
        )}
      </motion.section>

      <Rule />

      {/* Today preview */}
      <motion.section
        className="grid gap-4"
        custom={3}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <Text variant="meta">Today's plan</Text>

        {isLoading ? (
          <div className="grid gap-1">
            <Text variant="subheading">
              Loading today's plan...
            </Text>

            <Text variant="caption">
              Getting your latest study schedule.
            </Text>
          </div>
        ) : loadError ? (
          <div className="grid gap-1">
            <Text variant="subheading">
              Unable to load your tasks.
            </Text>

            <Text variant="caption">
              Something went wrong while reading your study schedule.
              Please try again.
            </Text>
          </div>
        ) : todayTasks.length === 0 ? (
          <div className="grid gap-1">
            <Text variant="subheading">
              No tasks today.
            </Text>

            <Text variant="caption">
              Your schedule is clear. Add your next study session in Planner.
            </Text>
          </div>
        ) : (
          <div className="grid gap-3">
            {todayTasks.map((task) => (
              <div
                key={task.id}
                className="grid grid-cols-[70px_1fr_auto] items-start gap-4 border-b border-line pb-3"
              >
                <Text variant="caption">
                  {task.startTime ?? '—'}
                </Text>

                <div>
                  <Text variant="body">
                    {task.title}
                  </Text>

                  <Text variant="caption">
                    {task.subject ?? 'General'}
                  </Text>
                </div>

                <Text variant="caption">
                  {task.status === 'completed'
                    ? 'DONE'
                    : task.priority.toUpperCase()}
                </Text>
              </div>
            ))}
          </div>
        )}
      </motion.section>
    </div>
  )
}

export default Dashboard