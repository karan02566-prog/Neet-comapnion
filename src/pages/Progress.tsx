import { useEffect, useState } from 'react'
import {
  BarChart3,
  BookOpen,
  Clock3,
  Target,
  CheckCircle2,
  Brain,
  TrendingUp,
} from 'lucide-react'
import Text from '../components/ui/Text'
import Rule from '../components/ui/Rule'
import {
  getAnalytics,
  type AnalyticsData,
} from '../services/analyticsService'

function formatHours(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`

  return `${hours}h ${mins}m`
}

function formatCategory(category: string) {
  return category
    .split('-')
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(' ')
}

function Stat({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string
  value: string
  detail?: string
  icon: typeof Clock3
}) {
  return (
    <div className="border border-stone-200 bg-white/50 p-5">
      <div className="mb-4 flex items-center justify-between">
        <Text variant="meta" className="text-stone-500">
          {label}
        </Text>

        <Icon
          size={17}
          strokeWidth={1.5}
          className="text-stone-400"
        />
      </div>

      <div className="font-serif text-3xl text-stone-900">
        {value}
      </div>

      {detail && (
        <p className="mt-2 text-xs text-stone-500">
          {detail}
        </p>
      )}
    </div>
  )
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden bg-stone-200">
      <div
        className="h-full bg-stone-800 transition-all duration-500"
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
        }}
      />
    </div>
  )
}

function StudyChart({
  data,
}: {
  data: AnalyticsData['dailyStudy']
}) {
  const last14 = data.slice(-14)

  if (last14.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center border border-dashed border-stone-300 text-sm text-stone-500">
        Complete a focus session to see your study rhythm.
      </div>
    )
  }

  const maxMinutes = Math.max(
    ...last14.map((item) => item.minutes),
    1,
  )

  return (
    <div className="border border-stone-200 bg-white/40 p-5">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <Text variant="meta" className="text-stone-500">
            STUDY RHYTHM
          </Text>

          <h3 className="mt-1 font-serif text-xl text-stone-900">
            Hours by day
          </h3>
        </div>

        <BarChart3
          size={18}
          strokeWidth={1.5}
          className="text-stone-400"
        />
      </div>

      <div className="flex h-48 items-end gap-2">
        {last14.map((item) => {
          const height = Math.max(
            4,
            (item.minutes / maxMinutes) * 100,
          )

          return (
            <div
              key={item.date}
              className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2"
            >
              <div className="text-[9px] text-stone-500">
                {item.minutes >= 60
                  ? `${Math.round(item.minutes / 60)}h`
                  : `${item.minutes}m`}
              </div>

              <div
                className="w-full max-w-8 bg-stone-800 transition-all duration-500"
                style={{ height: `${height}%` }}
                title={`${item.minutes} minutes`}
              />

              <div className="text-[9px] text-stone-400">
                {item.date.slice(5)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MockChart({
  data,
}: {
  data: AnalyticsData['mocks']['progression']
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center border border-dashed border-stone-300 text-sm text-stone-500">
        Add mock tests to see your score progression.
      </div>
    )
  }

  const max = Math.max(
    ...data.map((item) => item.score),
    1,
  )

  const min = Math.min(
    ...data.map((item) => item.score),
  )

  const range = Math.max(max - min, 1)

  return (
    <div className="border border-stone-200 bg-white/40 p-5">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <Text variant="meta" className="text-stone-500">
            MOCK TESTS
          </Text>

          <h3 className="mt-1 font-serif text-xl text-stone-900">
            Score progression
          </h3>
        </div>

        <TrendingUp
          size={18}
          strokeWidth={1.5}
          className="text-stone-400"
        />
      </div>

      <div className="relative h-48">
        <div className="absolute inset-x-0 top-0 border-t border-stone-200" />
        <div className="absolute inset-x-0 top-1/2 border-t border-stone-200" />
        <div className="absolute inset-x-0 bottom-0 border-t border-stone-200" />

        <div className="absolute inset-0 flex items-end gap-3 px-2">
          {data.map((item, index) => {
            const height =
              12 + ((item.score - min) / range) * 75

            return (
              <div
                key={`${item.date}-${index}`}
                className="flex min-w-0 flex-1 flex-col items-center justify-end"
              >
                <span className="mb-2 text-xs text-stone-600">
                  {item.score}
                </span>

                <div
                  className="w-full max-w-10 bg-stone-700"
                  style={{
                    height: `${height}%`,
                  }}
                />

                <span className="mt-2 text-[9px] text-stone-400">
                  {item.date.slice(5)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function Progress() {
  const [analytics, setAnalytics] =
    useState<AnalyticsData | null>(null)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const data = await getAnalytics()

        if (mounted) {
          setAnalytics(data)
          setLoading(false)
        }
      } catch (error) {
        console.error('Failed to load analytics:', error)

        if (mounted) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [])

  if (loading || !analytics) {
    return (
      <main className="mx-auto max-w-6xl px-5 py-10">
        <Text variant="meta" className="text-stone-500">
          PROGRESS
        </Text>

        <h1 className="mt-2 font-serif text-4xl text-stone-900">
          Your study record
        </h1>

        <p className="mt-4 text-sm text-stone-500">
          Gathering your study data…
        </p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 pb-20">
      <header className="mb-10">
        <Text variant="meta" className="text-stone-500">
          PROGRESS
        </Text>

        <h1 className="mt-2 font-serif text-4xl text-stone-900 md:text-5xl">
          Your study record
        </h1>

        <p className="mt-3 max-w-xl text-sm leading-6 text-stone-500">
          A quiet look at the work you've actually put in.
          No scores to chase. Just a record of your progress.
        </p>
      </header>

      <Rule />

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="TOTAL STUDY"
          value={formatHours(analytics.totalStudyMinutes)}
          detail={`${analytics.completedSessions} completed sessions`}
          icon={Clock3}
        />

        <Stat
          label="THIS WEEK"
          value={formatHours(analytics.weeklyStudyMinutes)}
          detail={`${formatHours(analytics.monthlyStudyMinutes)} this month`}
          icon={BarChart3}
        />

        <Stat
          label="TASKS"
          value={`${analytics.completedTasks}/${analytics.totalTasks}`}
          detail={`${analytics.taskCompletionPercent}% completed`}
          icon={CheckCircle2}
        />

        <Stat
          label="STREAK"
          value={`${analytics.currentStreak} days`}
          detail={`Longest: ${analytics.longestStreak} days`}
          icon={Target}
        />
      </section>

      <section className="mt-10">
        <StudyChart data={analytics.dailyStudy} />
      </section>

      <section className="mt-10">
        <div className="mb-5">
          <Text variant="meta" className="text-stone-500">
            SUBJECTS
          </Text>

          <h2 className="mt-1 font-serif text-2xl text-stone-900">
            Where your time is going
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {analytics.subjects.map((subject) => (
            <div
              key={subject.subject}
              className="border border-stone-200 bg-white/40 p-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl text-stone-900">
                  {subject.subject}
                </h3>

                <span className="text-xs text-stone-500">
                  {formatHours(subject.minutes)}
                </span>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex justify-between text-xs text-stone-500">
                  <span>Syllabus</span>
                  <span>{subject.syllabusPercent}%</span>
                </div>

                <ProgressBar value={subject.syllabusPercent} />
              </div>

              <div className="mt-5 flex justify-between text-xs text-stone-500">
                <span>
                  {subject.syllabusCompleted}/
                  {subject.syllabusTotal} chapters
                </span>

                <span>{subject.completedTasks} tasks</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-4 lg:grid-cols-2">
        <MockChart data={analytics.mocks.progression} />

        <div className="border border-stone-200 bg-white/40 p-5">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <Text variant="meta" className="text-stone-500">
                SYLLABUS
              </Text>

              <h3 className="mt-1 font-serif text-xl text-stone-900">
                Overall completion
              </h3>
            </div>

            <BookOpen
              size={18}
              strokeWidth={1.5}
              className="text-stone-400"
            />
          </div>

          <div className="flex items-end gap-4">
            <span className="font-serif text-5xl text-stone-900">
              {analytics.syllabusPercent}%
            </span>

            <span className="mb-2 text-xs text-stone-500">
              {analytics.syllabusCompleted} of{' '}
              {analytics.syllabusTotal} chapters
            </span>
          </div>

          <div className="mt-6">
            <ProgressBar value={analytics.syllabusPercent} />
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-4 lg:grid-cols-2">
        <div className="border border-stone-200 bg-white/40 p-5">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <Text variant="meta" className="text-stone-500">
                MISTAKES
              </Text>

              <h3 className="mt-1 font-serif text-xl text-stone-900">
                Error notebook
              </h3>
            </div>

            <Brain
              size={18}
              strokeWidth={1.5}
              className="text-stone-400"
            />
          </div>

          <div className="font-serif text-4xl text-stone-900">
            {analytics.mistakes.total}
          </div>

          <p className="mt-1 text-xs text-stone-500">
            recorded mistakes
          </p>

          <div className="mt-6 space-y-4">
            {analytics.mistakes.byCategory
              .slice(0, 5)
              .map((item) => (
                <div key={item.category}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-stone-600">
                      {formatCategory(item.category)}
                    </span>

                    <span className="text-stone-400">
                      {item.count} · {item.percentage}%
                    </span>
                  </div>

                  <ProgressBar value={item.percentage} />
                </div>
              ))}

            {analytics.mistakes.total === 0 && (
              <p className="text-sm text-stone-500">
                Your mistake notebook is empty for now.
              </p>
            )}
          </div>
        </div>

        <div className="border border-stone-200 bg-white/40 p-5">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <Text variant="meta" className="text-stone-500">
                MOCK TESTS
              </Text>

              <h3 className="mt-1 font-serif text-xl text-stone-900">
                Testing record
              </h3>
            </div>

            <TrendingUp
              size={18}
              strokeWidth={1.5}
              className="text-stone-400"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-stone-500">Tests</p>

              <p className="mt-1 font-serif text-2xl text-stone-900">
                {analytics.mocks.count}
              </p>
            </div>

            <div>
              <p className="text-xs text-stone-500">Latest</p>

              <p className="mt-1 font-serif text-2xl text-stone-900">
                {analytics.mocks.latestScore}
              </p>
            </div>

            <div>
              <p className="text-xs text-stone-500">Best</p>

              <p className="mt-1 font-serif text-2xl text-stone-900">
                {analytics.mocks.bestScore}
              </p>
            </div>
          </div>

          {analytics.mocks.count === 0 && (
            <p className="mt-8 text-sm text-stone-500">
              Your mock-test history will appear here.
            </p>
          )}
        </div>
      </section>

      <section className="mt-10 border border-stone-200 bg-stone-100/40 p-6">
        <div className="flex items-start gap-4">
          <Target
            size={19}
            strokeWidth={1.5}
            className="mt-1 shrink-0 text-stone-500"
          />

          <div>
            <Text variant="meta" className="text-stone-500">
              A SMALL RECORD
            </Text>

            <p className="mt-2 max-w-2xl font-serif text-lg leading-7 text-stone-800">
              {analytics.completedTasks === 0
                ? 'The page is ready. Your study record will begin filling itself as you work.'
                : `You've completed ${analytics.completedTasks} task${
                    analytics.completedTasks === 1 ? '' : 's'
                  } and ${analytics.completedSessions} study session${
                    analytics.completedSessions === 1 ? '' : 's'
                  }. Keep going quietly.`}
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}