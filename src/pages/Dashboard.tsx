import { useEffect, useMemo, useState } from 'react'
import { motion, type Variants } from 'motion/react'
import { ArrowRight, Check } from 'lucide-react'
import Text from '../components/ui/Text'
import Rule from '../components/ui/Rule'
import { taskRepository } from '../services/taskRepository'
import type { Task } from '../types/task'

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
      delay: i * 0.07,
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
    weekday: 'long',
    day: '2-digit',
    month: 'long',
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

    const unsubscribe = taskRepository.subscribeToChanges(() => {
      void loadTasks()
    })

    return () => {
      isMounted = false
      unsubscribe()
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

  const nextTask = useMemo(
    () =>
      todayTasks.find(
        (task) => task.status !== 'completed',
      ),
    [todayTasks],
  )

  const subjectProgress = useMemo(
    () =>
      subjects.map((subject) => {
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
          total: subjectTasks.length,
          completed,
          progress,
        }
      }),
    [tasks],
  )

  const completionPercent =
    todayTasks.length === 0
      ? 0
      : Math.round(
          (completedToday / todayTasks.length) * 100,
        )

  return (
    <div className="px-6 py-10 md:px-12 md:py-16">
      <div className="grid gap-12 md:gap-16">

        {/* Hero */}
        <motion.section
          className="grid gap-5 md:max-w-3xl"
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center justify-between gap-4">
            <Text variant="meta">
              NEET / {EXAM_YEAR}
            </Text>

            <span className="text-[11px] uppercase tracking-[0.18em] text-accent">
              {getDaysUntilExam(EXAM_YEAR)} days to go
            </span>
          </div>

          <Text
            variant="display"
            className="text-6xl md:text-8xl font-semibold tracking-[-0.055em]"
          >
            YOUR
            <br />
            NEXT
            <br />
            LEVEL.
          </Text>

          <div className="grid gap-1 pt-2">
            <Text variant="body">
              {formatStudyDate(today)}
            </Text>

            <Text variant="caption">
              Small progress every day becomes something bigger.
            </Text>
          </div>
        </motion.section>

        <Rule />

        {/* Today's overview */}
        <motion.section
          className="grid gap-8"
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <div className="grid gap-1">
            <Text variant="meta">Today</Text>

            <Text variant="subheading">
              {isLoading
                ? 'Loading your day...'
                : loadError
                  ? 'Something went wrong.'
                  : todayTasks.length === 0
                    ? 'A quiet day.'
                    : `${completedToday} of ${todayTasks.length} sessions complete.`}
            </Text>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 border-t border-line">
            <div className="py-5 sm:pr-6 sm:border-r sm:border-line">
              <Text variant="meta">Progress</Text>

              <div className="mt-2 flex items-baseline gap-2">
                <Text variant="heading">
                  {isLoading || loadError
                    ? '—'
                    : `${completionPercent}%`}
                </Text>
              </div>
            </div>

            <div className="py-5 sm:px-6 sm:border-r sm:border-line">
              <Text variant="meta">Remaining</Text>

              <Text variant="heading" className="mt-2">
                {isLoading || loadError
                  ? '—'
                  : todayTasks.length - completedToday}
              </Text>
            </div>

            <div className="py-5 sm:pl-6">
              <Text variant="meta">Next session</Text>

              {nextTask && !loadError ? (
                <div className="mt-2">
                  <Text variant="heading">
                    {nextTask.startTime ?? 'OPEN'}
                  </Text>

                  <Text variant="caption">
                    {nextTask.title}
                  </Text>
                </div>
              ) : (
                <Text variant="heading" className="mt-2">
                  {loadError ? 'ERROR' : 'NONE'}
                </Text>
              )}
            </div>
          </div>
        </motion.section>

        <Rule />

        {/* Subject progress */}
        <motion.section
          className="grid gap-7"
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <div className="grid gap-1">
            <Text variant="meta">Subjects</Text>

            <Text variant="subheading">
              Your progress, at a glance.
            </Text>
          </div>

          {loadError ? (
            <Text variant="caption">
              Task data could not be loaded.
            </Text>
          ) : (
            <div className="grid gap-5">
              {subjectProgress.map((subject) => (
                <div
                  key={subject.name}
                  className="grid gap-2"
                >
                  <div className="flex items-end justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {subject.name}
                      </span>

                      <span className="text-[10px] text-neutral">
                        {subject.completed}/{subject.total}
                      </span>
                    </div>

                    <span className="text-[11px] text-neutral">
                      {subject.progress}%
                    </span>
                  </div>

                  <div className="h-[3px] w-full bg-accent-soft">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${subject.progress}%`,
                      }}
                      transition={{
                        duration: 0.7,
                        delay: 0.25,
                        ease: 'easeOut',
                      }}
                      className="h-full bg-accent"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.section>

        <Rule />

        {/* Today's plan */}
        <motion.section
          className="grid gap-6"
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-end justify-between gap-4">
            <div className="grid gap-1">
              <Text variant="meta">Today's plan</Text>

              <Text variant="subheading">
                One session at a time.
              </Text>
            </div>

            <span className="hidden sm:block text-[11px] uppercase tracking-[0.18em] text-neutral">
              {todayTasks.length} sessions
            </span>
          </div>

          {isLoading ? (
            <div className="border border-dashed border-line px-6 py-8">
              <Text variant="body">
                Preparing your study plan...
              </Text>
            </div>
          ) : loadError ? (
            <div className="border border-dashed border-line px-6 py-8">
              <Text variant="body">
                Unable to load your study plan.
              </Text>

              <Text variant="caption">
                Please refresh and try again.
              </Text>
            </div>
          ) : todayTasks.length === 0 ? (
            <div className="border border-dashed border-line px-6 py-8">
              <Text variant="body">
                Nothing scheduled for today.
              </Text>

              <Text variant="caption">
                Your schedule is clear. Add your next session in Planner.
              </Text>
            </div>
          ) : (
            <div className="grid">
              {todayTasks.map((task, index) => {
                const isCompleted =
                  task.status === 'completed'

                return (
                  <motion.div
                    key={task.id}
                    custom={index + 4}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    className={`grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-line py-5 ${
                      isCompleted
                        ? 'opacity-50'
                        : ''
                    }`}
                  >
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full border ${
                        isCompleted
                          ? 'border-accent bg-accent text-white'
                          : 'border-line'
                      }`}
                    >
                      {isCompleted && (
                        <Check
                          size={14}
                          strokeWidth={2}
                        />
                      )}
                    </div>

                    <div className="min-w-0">
                      <Text
                        variant="body"
                        className={
                          isCompleted
                            ? 'line-through'
                            : ''
                        }
                      >
                        {task.title}
                      </Text>

                      <Text variant="caption">
                        {task.subject ?? 'General'}
                      </Text>
                    </div>

                    <div className="text-right">
                      <Text variant="caption">
                        {task.startTime ?? 'OPEN'}
                      </Text>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.section>

        <Rule />

        {/* Closing note */}
        <motion.section
          className="flex items-center justify-between gap-6 pb-4"
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <div className="grid gap-1">
            <Text variant="meta">Keep going</Text>

            <Text variant="body">
              You don't need a perfect day.
              <br />
              Just the next good one.
            </Text>
          </div>

          <ArrowRight
            size={20}
            strokeWidth={1.5}
            className="shrink-0 text-accent"
          />
        </motion.section>
      </div>
    </div>
  )
}

export default Dashboard