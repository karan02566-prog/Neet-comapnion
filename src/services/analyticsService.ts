import { getDB } from './db'
import type { Subject } from '../types/task'
import type { MistakeCategory } from '../types/mistake'

export interface AnalyticsData {
  totalStudyMinutes: number
  weeklyStudyMinutes: number
  monthlyStudyMinutes: number
  completedSessions: number

  totalTasks: number
  completedTasks: number
  taskCompletionPercent: number

  currentStreak: number
  longestStreak: number

  syllabusTotal: number
  syllabusCompleted: number
  syllabusPercent: number

  dailyStudy: {
    date: string
    minutes: number
  }[]

  subjects: {
    subject: Subject
    minutes: number
    completedTasks: number
    syllabusTotal: number
    syllabusCompleted: number
    syllabusPercent: number
  }[]

  mistakes: {
    total: number
    byCategory: {
      category: MistakeCategory
      count: number
      percentage: number
    }[]
  }

  mocks: {
    count: number
    latestScore: number
    bestScore: number
    progression: {
      date: string
      score: number
    }[]
  }
}

const SUBJECTS: Subject[] = [
  'Physics',
  'Chemistry',
  'Biology',
]

function dateOnly(date: Date) {
  return date.toISOString().slice(0, 10)
}

function daysAgo(days: number) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return dateOnly(date)
}

function calculateStreak(dates: string[]) {
  const uniqueDates = [
    ...new Set(dates),
  ].sort((a, b) => b.localeCompare(a))

  if (uniqueDates.length === 0) {
    return {
      current: 0,
      longest: 0,
    }
  }

  const dateSet = new Set(uniqueDates)
  const today = dateOnly(new Date())

  let current = 0
  let cursor = new Date(today)

  if (!dateSet.has(today)) {
    cursor.setDate(cursor.getDate() - 1)

    if (!dateSet.has(dateOnly(cursor))) {
      return {
        current: 0,
        longest: calculateLongestStreak(uniqueDates),
      }
    }
  }

  while (dateSet.has(dateOnly(cursor))) {
    current += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return {
    current,
    longest: calculateLongestStreak(uniqueDates),
  }
}

function calculateLongestStreak(
  dates: string[],
) {
  const dateSet = new Set(dates)

  let longest = 0

  for (const date of dates) {
    const previous = new Date(`${date}T00:00:00`)
    previous.setDate(previous.getDate() - 1)

    if (dateSet.has(dateOnly(previous))) {
      continue
    }

    let length = 1
    const cursor = new Date(`${date}T00:00:00`)

    while (true) {
      cursor.setDate(cursor.getDate() + 1)

      if (!dateSet.has(dateOnly(cursor))) {
        break
      }

      length += 1
    }

    longest = Math.max(longest, length)
  }

  return longest
}

export async function getAnalytics(): Promise<AnalyticsData> {
  const db = await getDB()

  const [
    tasks,
    sessions,
    chapters,
    mistakes,
    mockTests,
  ] = await Promise.all([
    db.getAll('tasks'),
    db.getAll('sessions'),
    db.getAll('chapters'),
    db.getAll('mistakes'),
    db.getAll('mockTests'),
  ])

  const completedSessions = sessions.filter(
    (session) =>
      session.status === 'completed',
  )

  const totalStudyMinutes = Math.round(
    completedSessions.reduce(
      (sum, session) =>
        sum + session.durationSeconds / 60,
      0,
    ),
  )

  const weekStart = daysAgo(6)
  const monthStart = daysAgo(29)

  const weeklyStudyMinutes = Math.round(
    completedSessions
      .filter(
        (session) =>
          dateOnly(
            new Date(session.startedAt),
          ) >= weekStart,
      )
      .reduce(
        (sum, session) =>
          sum + session.durationSeconds / 60,
        0,
      ),
  )

  const monthlyStudyMinutes = Math.round(
    completedSessions
      .filter(
        (session) =>
          dateOnly(
            new Date(session.startedAt),
          ) >= monthStart,
      )
      .reduce(
        (sum, session) =>
          sum + session.durationSeconds / 60,
        0,
      ),
  )

  const completedTasks = tasks.filter(
    (task) => task.status === 'completed',
  )

  const taskCompletionPercent =
    tasks.length === 0
      ? 0
      : Math.round(
          (completedTasks.length /
            tasks.length) *
            100,
        )

  const studyDates = completedSessions.map(
    (session) =>
      dateOnly(new Date(session.startedAt)),
  )

  const streak = calculateStreak(
    studyDates,
  )

  const syllabusTotal = chapters.length

  const syllabusCompleted =
    chapters.filter(
      (chapter) =>
        chapter.status === 'completed',
    ).length

  const syllabusPercent =
    syllabusTotal === 0
      ? 0
      : Math.round(
          (syllabusCompleted /
            syllabusTotal) *
            100,
        )

  const dailyStudy = Array.from(
    { length: 14 },
    (_, index) => {
      const date = daysAgo(
        13 - index,
      )

      const minutes = Math.round(
        completedSessions
          .filter(
            (session) =>
              dateOnly(
                new Date(session.startedAt),
              ) === date,
          )
          .reduce(
            (sum, session) =>
              sum +
              session.durationSeconds / 60,
            0,
          ),
      )

      return {
        date,
        minutes,
      }
    },
  )

  const subjects = SUBJECTS.map(
    (subject) => {
      const subjectSessions =
        completedSessions.filter(
          (session) =>
            session.subject === subject,
        )

      const subjectTasks =
        completedTasks.filter(
          (task) =>
            task.subject === subject,
        )

      const subjectChapters =
        chapters.filter(
          (chapter) =>
            chapter.subject === subject,
        )

      const subjectCompleted =
        subjectChapters.filter(
          (chapter) =>
            chapter.status ===
            'completed',
        ).length

      return {
        subject,

        minutes: Math.round(
          subjectSessions.reduce(
            (sum, session) =>
              sum +
              session.durationSeconds / 60,
            0,
          ),
        ),

        completedTasks:
          subjectTasks.length,

        syllabusTotal:
          subjectChapters.length,

        syllabusCompleted:
          subjectCompleted,

        syllabusPercent:
          subjectChapters.length === 0
            ? 0
            : Math.round(
                (subjectCompleted /
                  subjectChapters.length) *
                  100,
              ),
      }
    },
  )

  const mistakeCounts =
    new Map<MistakeCategory, number>()

  for (const mistake of mistakes) {
    mistakeCounts.set(
      mistake.category,
      (mistakeCounts.get(
        mistake.category,
      ) ?? 0) + 1,
    )
  }

  const mistakeBreakdown = Array.from(
    mistakeCounts.entries(),
  )
    .map(
      ([category, count]) => ({
        category,
        count,
        percentage:
          mistakes.length === 0
            ? 0
            : Math.round(
                (count /
                  mistakes.length) *
                  100,
              ),
      }),
    )
    .sort(
      (a, b) =>
        b.count - a.count,
    )

  const sortedMocks = mockTests
    .slice()
    .sort((a, b) =>
      a.date.localeCompare(b.date),
    )

  const mockProgression =
    sortedMocks.map((test) => ({
      date: test.date,
      score: test.total,
    }))

  return {
    totalStudyMinutes,

    weeklyStudyMinutes,

    monthlyStudyMinutes,

    completedSessions:
      completedSessions.length,

    totalTasks: tasks.length,

    completedTasks:
      completedTasks.length,

    taskCompletionPercent,

    currentStreak:
      streak.current,

    longestStreak:
      streak.longest,

    syllabusTotal,

    syllabusCompleted,

    syllabusPercent,

    dailyStudy,

    subjects,

    mistakes: {
      total: mistakes.length,
      byCategory:
        mistakeBreakdown,
    },

    mocks: {
      count: sortedMocks.length,

      latestScore:
        sortedMocks.length === 0
          ? 0
          : sortedMocks[
              sortedMocks.length - 1
            ].total,

      bestScore:
        sortedMocks.length === 0
          ? 0
          : Math.max(
              ...sortedMocks.map(
                (test) => test.total,
              ),
            ),

      progression:
        mockProgression,
    },
  }
}