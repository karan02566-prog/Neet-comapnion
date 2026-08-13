import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, type Variants } from 'motion/react'
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react'

import Text from '../components/ui/Text'
import Rule from '../components/ui/Rule'
import { taskRepository } from '../services/taskRepository'
import { sessionRepository } from '../services/sessionRepository'

import type { Task, Subject } from '../types/task'
import type { Session } from '../types/session'

const subjects: Subject[] = [
  'Physics',
  'Chemistry',
  'Biology',
]

const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
}

type FocusState =
  | 'idle'
  | 'running'
  | 'paused'
  | 'completed'

type TimerMode =
  | 'open'
  | 'pomodoro'
  | 'deep-work'
  | 'custom'

type TimerPhase =
  | 'work'
  | 'break'

interface TimerPreset {
  id: TimerMode
  label: string
  workMinutes: number
  breakMinutes: number
  description: string
}

const timerPresets: TimerPreset[] = [
  {
    id: 'open',
    label: 'Open',
    workMinutes: 0,
    breakMinutes: 0,
    description: 'Study without a countdown.',
  },
  {
    id: 'pomodoro',
    label: '25 / 5',
    workMinutes: 25,
    breakMinutes: 5,
    description: 'Short focused sessions.',
  },
  {
    id: 'deep-work',
    label: '50 / 10',
    workMinutes: 50,
    breakMinutes: 10,
    description: 'Longer deep-work blocks.',
  },
]

const MUSIC_URL =
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'

function formatTime(seconds: number): string {
  const safeSeconds = Math.max(
    0,
    Math.floor(seconds),
  )

  const hours = Math.floor(
    safeSeconds / 3600,
  )

  const minutes = Math.floor(
    (safeSeconds % 3600) / 60,
  )

  const remainingSeconds =
    safeSeconds % 60

  if (hours > 0) {
    return `${String(hours).padStart(
      2,
      '0',
    )}:${String(minutes).padStart(
      2,
      '0',
    )}:${String(
      remainingSeconds,
    ).padStart(2, '0')}`
  }

  return `${String(minutes).padStart(
    2,
    '0',
  )}:${String(
    remainingSeconds,
  ).padStart(2, '0')}`
}

function getNow(): string {
  return new Date().toISOString()
}

function Mascot({
  state,
  phase,
}: {
  state: FocusState
  phase: TimerPhase
}) {
  const isBreak = phase === 'break'

  return (
    <motion.div
      className="relative flex h-40 w-40 items-end justify-center"
      animate={
        state === 'running'
          ? isBreak
            ? {
                y: [0, -8, 0],
                rotate: [-5, 5, -5],
              }
            : {
                y: [0, -4, 0],
                rotate: [-2, 2, -2],
              }
          : state === 'paused'
            ? {
                rotate: [-3, 3, -3],
              }
            : state === 'completed'
              ? {
                  y: [0, -12, 0],
                  rotate: [-8, 8, -8],
                }
              : undefined
      }
      transition={{
        duration:
          state === 'completed'
            ? 0.8
            : isBreak
              ? 1.5
              : 2.2,
        repeat:
          state === 'completed'
            ? 2
            : Infinity,
        ease: 'easeInOut',
      }}
      aria-hidden="true"
    >
      <motion.div
        className="absolute bottom-1 h-2 w-20 rounded-full bg-ink/10"
        animate={
          state === 'running'
            ? {
                scaleX: [1, 0.8, 1],
              }
            : undefined
        }
        transition={{
          duration: 1.5,
          repeat: Infinity,
        }}
      />

      <div className="relative h-24 w-20 rounded-[45%] border-2 border-ink bg-paper">
        <div className="absolute -top-10 left-1/2 h-16 w-16 -translate-x-1/2 rounded-full border-2 border-ink bg-paper">
          <motion.div
            className="absolute left-3 top-5 h-4 w-4 rounded-full border border-ink bg-paper"
            animate={
              state === 'running'
                ? {
                    scaleY: [1, 0.15, 1],
                  }
                : undefined
            }
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 1.5,
            }}
          >
            <div className="absolute left-1 top-1 h-1.5 w-1.5 rounded-full bg-ink" />
          </motion.div>

          <motion.div
            className="absolute right-3 top-5 h-4 w-4 rounded-full border border-ink bg-paper"
            animate={
              state === 'running'
                ? {
                    scaleY: [1, 0.15, 1],
                  }
                : undefined
            }
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 1.5,
            }}
          >
            <div className="absolute left-1 top-1 h-1.5 w-1.5 rounded-full bg-ink" />
          </motion.div>

          <motion.div
            className="absolute bottom-3 left-1/2 h-2 w-5 -translate-x-1/2 rounded-full border-b-2 border-ink"
            animate={
              state === 'running'
                ? isBreak
                  ? {
                      scaleX: [
                        1,
                        1.5,
                        0.8,
                        1,
                      ],
                    }
                  : {
                      scaleX: [
                        1,
                        1.25,
                        1,
                      ],
                    }
                : state === 'completed'
                  ? {
                      scaleX: [
                        1,
                        1.8,
                        1,
                      ],
                    }
                  : undefined
            }
            transition={{
              duration: isBreak
                ? 1
                : 1.8,
              repeat: Infinity,
            }}
          />
        </div>

        <motion.div
          className="absolute -left-5 top-8 h-2 w-7 origin-right rounded-full bg-ink"
          animate={
            state === 'running'
              ? isBreak
                ? {
                    rotate: [
                      -35,
                      35,
                      -35,
                    ],
                  }
                : {
                    rotate: [
                      -15,
                      15,
                      -15,
                    ],
                  }
              : state === 'completed'
                ? {
                    rotate: [
                      -50,
                      50,
                      -50,
                    ],
                  }
                : {
                    rotate: 10,
                  }
          }
          transition={{
            duration: isBreak
              ? 0.8
              : 1.5,
            repeat: Infinity,
          }}
        />

        <motion.div
          className="absolute -right-5 top-8 h-2 w-7 origin-left rounded-full bg-ink"
          animate={
            state === 'running'
              ? isBreak
                ? {
                    rotate: [
                      35,
                      -35,
                      35,
                    ],
                  }
                : {
                    rotate: [
                      15,
                      -15,
                      15,
                    ],
                  }
              : state === 'completed'
                ? {
                    rotate: [
                      50,
                      -50,
                      50,
                    ],
                  }
                : {
                    rotate: -10,
                  }
          }
          transition={{
            duration: isBreak
              ? 0.8
              : 1.5,
            repeat: Infinity,
          }}
        />

        <motion.div
          className="absolute bottom-3 left-1/2 h-7 w-12 -translate-x-1/2 border border-ink bg-paper"
          animate={
            state === 'running'
              ? {
                  rotate: [
                    -4,
                    4,
                    -4,
                  ],
                }
              : undefined
          }
          transition={{
            duration: 1.7,
            repeat: Infinity,
          }}
        >
          <div className="absolute left-1/2 top-0 h-full w-px bg-ink" />
        </motion.div>
      </div>

      {isBreak &&
        state === 'running' && (
          <motion.div
            className="absolute -right-1 top-1 text-xs text-neutral"
            animate={{
              y: [0, -5, 0],
              opacity: [
                0.5,
                1,
                0.5,
              ],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
          >
            zzz
          </motion.div>
        )}
    </motion.div>
  )
}

function Focus() {
  const [searchParams] =
    useSearchParams()

  const requestedTaskId =
    searchParams.get('task')

  const [tasks, setTasks] =
    useState<Task[]>([])

  const [subject, setSubject] =
    useState<Subject | ''>('')

  const [taskId, setTaskId] =
    useState('')

  const [state, setState] =
    useState<FocusState>('idle')

  const [session, setSession] =
    useState<Session | null>(null)

  const [
    elapsedSeconds,
    setElapsedSeconds,
  ] = useState(0)

  const [
    completedSession,
    setCompletedSession,
  ] = useState<Session | null>(null)

  const [timerMode, setTimerMode] =
    useState<TimerMode>('open')

  const [timerPhase, setTimerPhase] =
    useState<TimerPhase>('work')

  const [
    customMinutes,
    setCustomMinutes,
  ] = useState(30)

  const [
    remainingSeconds,
    setRemainingSeconds,
  ] = useState(0)

  const [
    cycleNumber,
    setCycleNumber,
  ] = useState(1)

  const audioRef =
    useRef<HTMLAudioElement | null>(
      null,
    )

  const [
    musicEnabled,
    setMusicEnabled,
  ] = useState(false)

  const [
    volume,
    setVolume,
  ] = useState(0.35)

  /*
    Load tasks and automatically
    select the task supplied by Planner.
  */
  useEffect(() => {
    let isMounted = true

    async function loadTasks() {
      try {
        const loadedTasks =
          await taskRepository.getAll()

        if (!isMounted) {
          return
        }

        setTasks(loadedTasks)

        if (requestedTaskId) {
          const requestedTask =
            loadedTasks.find(
              (task) =>
                task.id ===
                requestedTaskId,
            )

          if (
            requestedTask &&
            requestedTask.status !==
              'completed'
          ) {
            setTaskId(
              requestedTask.id,
            )

            setSubject(
              requestedTask.subject ?? '',
            )
          }
        }
      } catch {
        if (isMounted) {
          setTasks([])
        }
      }
    }

    void loadTasks()

    return () => {
      isMounted = false
    }
  }, [requestedTaskId])

  /*
    Create audio once.
  */
  useEffect(() => {
    const audio = new Audio()

    audio.src = MUSIC_URL
    audio.loop = true
    audio.volume = volume
    audio.preload = 'auto'

    const handleError = () => {
      setMusicEnabled(false)
    }

    audio.addEventListener(
      'error',
      handleError,
    )

    audioRef.current = audio

    return () => {
      audio.pause()

      audio.removeEventListener(
        'error',
        handleError,
      )

      audio.removeAttribute('src')
      audio.load()

      audioRef.current = null
    }
  }, [])

  /*
    Keep volume synced.
  */
  useEffect(() => {
    if (!audioRef.current) {
      return
    }

    audioRef.current.volume =
      volume
  }, [volume])

  /*
    Timer engine.
  */
  useEffect(() => {
    if (
      state !== 'running' ||
      !session
    ) {
      return
    }

    let completedTriggered = false

    const updateTimer = () => {
      const elapsed = Math.floor(
        (Date.now() -
          new Date(
            session.startedAt,
          ).getTime()) /
          1000,
      )

      setElapsedSeconds(elapsed)

      if (timerMode === 'open') {
        return
      }

      if (timerPhase === 'work') {
        const workSeconds =
          getWorkDurationSeconds()

        const remaining =
          Math.max(
            0,
            workSeconds - elapsed,
          )

        setRemainingSeconds(
          remaining,
        )

        if (
          remaining <= 0 &&
          !completedTriggered
        ) {
          completedTriggered = true

          void handleWorkComplete()
        }
      }
    }

    updateTimer()

    const interval =
      window.setInterval(
        updateTimer,
        250,
      )

    return () =>
      window.clearInterval(
        interval,
      )
  }, [
    state,
    session,
    timerMode,
    timerPhase,
    customMinutes,
  ])

  /*
    Break timer.
  */
  useEffect(() => {
    if (
      state !== 'running' ||
      !session ||
      timerPhase !== 'break'
    ) {
      return
    }

    const breakDuration =
      getBreakDurationSeconds()

    const breakStartedAt =
      session.updatedAt

    const updateBreak = () => {
      const elapsed =
        Math.floor(
          (Date.now() -
            new Date(
              breakStartedAt,
            ).getTime()) /
            1000,
        )

      const remaining =
        Math.max(
          0,
          breakDuration - elapsed,
        )

      setRemainingSeconds(
        remaining,
      )
    }

    updateBreak()

    const interval =
      window.setInterval(
        updateBreak,
        250,
      )

    return () =>
      window.clearInterval(
        interval,
      )
  }, [
    state,
    session,
    timerPhase,
  ])

  const availableTasks =
    useMemo(() => {
      return tasks
        .filter(
          (task) =>
            !subject ||
            task.subject ===
              subject,
        )
        .filter(
          (task) =>
            task.status !==
            'completed',
        )
        .sort((a, b) =>
          a.date.localeCompare(
            b.date,
          ),
        )
    }, [tasks, subject])

  const selectedPreset =
    useMemo(
      () =>
        timerPresets.find(
          (preset) =>
            preset.id ===
            timerMode,
        ),
      [timerMode],
    )

  function getWorkDurationSeconds(): number {
    if (
      timerMode === 'custom'
    ) {
      return (
        Math.max(
          1,
          customMinutes,
        ) * 60
      )
    }

    return (
      (selectedPreset
        ?.workMinutes ?? 0) *
      60
    )
  }

  function getBreakDurationSeconds(): number {
    if (
      timerMode === 'pomodoro'
    ) {
      return 5 * 60
    }

    if (
      timerMode === 'deep-work'
    ) {
      return 10 * 60
    }

    return 0
  }

  function resetSelection() {
    setSubject('')
    setTaskId('')
  }

  function selectTimerMode(
    mode: TimerMode,
  ) {
    if (state !== 'idle') {
      return
    }

    setTimerMode(mode)
    setTimerPhase('work')

    if (mode === 'open') {
      setRemainingSeconds(0)
      return
    }

    if (mode === 'custom') {
      setRemainingSeconds(
        customMinutes * 60,
      )
      return
    }

    const preset =
      timerPresets.find(
        (item) =>
          item.id === mode,
      )

    setRemainingSeconds(
      (preset
        ?.workMinutes ?? 0) * 60,
    )
  }

  function updateCustomMinutes(
    value: number,
  ) {
    const safeValue =
      Math.min(
        180,
        Math.max(
          1,
          Math.floor(
            value || 1,
          ),
        ),
      )

    setCustomMinutes(
      safeValue,
    )

    if (
      state === 'idle' &&
      timerMode === 'custom'
    ) {
      setRemainingSeconds(
        safeValue * 60,
      )
    }
  }

  async function toggleMusic() {
    const audio =
      audioRef.current

    if (!audio) {
      return
    }

    if (musicEnabled) {
      audio.pause()
      setMusicEnabled(false)
      return
    }

    try {
      if (!audio.src) {
        audio.src = MUSIC_URL
        audio.load()
      }

      audio.volume = volume

      await audio.play()

      setMusicEnabled(true)
    } catch (error) {
      console.error(
        'Unable to play study music:',
        error,
      )

      setMusicEnabled(false)
    }
  }

  function resetMusic() {
    const audio =
      audioRef.current

    if (!audio) {
      return
    }

    audio.currentTime = 0
  }

  async function startSession() {
    const selectedTask =
      tasks.find(
        (task) =>
          task.id === taskId,
      )

    const now = getNow()

    const newSession: Session = {
      id: crypto.randomUUID(),
      taskId:
        selectedTask?.id,
      subject:
        subject ||
        selectedTask?.subject ||
        undefined,
      chapter:
        selectedTask?.chapter,
      startedAt: now,
      durationSeconds: 0,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    }

    await sessionRepository.save(
      newSession,
    )

    /*
      Mark the task as in-progress
      as soon as its focus session starts.
    */
    if (selectedTask) {
      await taskRepository.save({
        ...selectedTask,
        status: 'in-progress',
        updatedAt: now,
      })

      setTasks((prev) =>
        prev.map((task) =>
          task.id ===
          selectedTask.id
            ? {
                ...task,
                status:
                  'in-progress',
                updatedAt: now,
              }
            : task,
        ),
      )
    }

    setSession(
      newSession,
    )

    setCompletedSession(null)
    setElapsedSeconds(0)
    setTimerPhase('work')
    setCycleNumber(1)

    if (
      timerMode === 'open'
    ) {
      setRemainingSeconds(0)
    } else {
      setRemainingSeconds(
        getWorkDurationSeconds(),
      )
    }

    setState('running')
  }

  function pauseSession() {
    setState('paused')
  }

  async function resumeSession() {
    if (!session) {
      return
    }

    const resumedSession: Session = {
      ...session,
      startedAt:
        new Date(
          Date.now() -
            elapsedSeconds *
              1000,
        ).toISOString(),
      updatedAt: getNow(),
    }

    setSession(
      resumedSession,
    )

    setState('running')
  }

  async function handleWorkComplete() {
    if (
      timerMode === 'open' ||
      !session ||
      timerPhase !== 'work'
    ) {
      return
    }

    const breakSeconds =
      getBreakDurationSeconds()

    if (
      breakSeconds <= 0
    ) {
      await completeSession()
      return
    }

    const breakStartedSession: Session =
      {
        ...session,
        updatedAt: getNow(),
      }

    setSession(
      breakStartedSession,
    )

    setTimerPhase('break')
    setRemainingSeconds(
      breakSeconds,
    )
    setState('running')
  }

  function endBreak() {
    if (!session) {
      return
    }

    const now = getNow()

    const restartedSession: Session =
      {
        ...session,
        startedAt: now,
        updatedAt: now,
      }

    setSession(
      restartedSession,
    )

    setTimerPhase('work')
    setRemainingSeconds(
      getWorkDurationSeconds(),
    )

    setElapsedSeconds(0)

    setCycleNumber(
      (value) => value + 1,
    )
  }

  async function completeSession() {
    if (!session) {
      return
    }

    const now = getNow()

    const finishedSession: Session =
      {
        ...session,
        endedAt: now,
        durationSeconds:
          elapsedSeconds,
        status: 'completed',
        updatedAt: now,
      }

    await sessionRepository.save(
      finishedSession,
    )

    /*
      If this session belongs to
      a planned task, mark that task
      as completed.
    */
    if (session.taskId) {
      const allTasks =
        await taskRepository.getAll()

      const linkedTask =
        allTasks.find(
          (task) =>
            task.id ===
            session.taskId,
        )

      if (
        linkedTask &&
        linkedTask.status !==
          'completed'
      ) {
        await taskRepository.save({
          ...linkedTask,
          status: 'completed',
          completedAt: now,
          updatedAt: now,
        })

        setTasks((prev) =>
          prev.map((task) =>
            task.id ===
            linkedTask.id
              ? {
                  ...linkedTask,
                  status:
                    'completed',
                  completedAt:
                    now,
                  updatedAt: now,
                }
              : task,
          ),
        )
      }
    }

    setCompletedSession(
      finishedSession,
    )

    setSession(null)
    setState('completed')
  }

  function startAnotherSession() {
    setCompletedSession(null)
    setElapsedSeconds(0)
    setRemainingSeconds(0)
    setTimerPhase('work')
    setCycleNumber(1)
    setState('idle')
  }

  const displayedTime =
    timerMode === 'open'
      ? elapsedSeconds
      : remainingSeconds

  return (
    <div className="min-h-[calc(100vh-5rem)] px-6 py-8 md:px-12 md:py-10">
      {state === 'idle' && (
        <div className="grid gap-12">
          <motion.section
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="grid gap-2"
          >
            <Text variant="meta">
              Quiet study mode
            </Text>

            <Text variant="display">
              FOCUS
              <br />
              WITH
              <br />
              ME.
            </Text>

            <Text variant="caption">
              One session. One subject.
              One thing at a time.
            </Text>
          </motion.section>

          <Rule />

          <section className="grid max-w-xl gap-8">
            <div className="grid gap-1">
              <Text variant="meta">
                Choose your timer
              </Text>

              <Text variant="caption">
                Pick a rhythm that feels
                right today.
              </Text>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              {timerPresets.map(
                (preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() =>
                      selectTimerMode(
                        preset.id,
                      )
                    }
                    className={`grid gap-1 border p-4 text-left transition-colors ${
                      timerMode ===
                      preset.id
                        ? 'border-ink bg-ink text-paper'
                        : 'border-line hover:border-ink'
                    }`}
                  >
                    <span className="text-sm font-medium">
                      {preset.label}
                    </span>

                    <span
                      className={`text-xs ${
                        timerMode ===
                        preset.id
                          ? 'text-paper/70'
                          : 'text-neutral'
                      }`}
                    >
                      {
                        preset.description
                      }
                    </span>
                  </button>
                ),
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                selectTimerMode(
                  'custom',
                )
              }
              className={`border p-4 text-left transition-colors ${
                timerMode ===
                'custom'
                  ? 'border-ink bg-ink text-paper'
                  : 'border-line hover:border-ink'
              }`}
            >
              <span className="text-sm font-medium">
                Custom
              </span>

              <span
                className={`mt-1 block text-xs ${
                  timerMode ===
                  'custom'
                    ? 'text-paper/70'
                    : 'text-neutral'
                }`}
              >
                Choose your own study
                duration.
              </span>
            </button>

            {timerMode ===
              'custom' && (
              <label className="grid gap-2">
                <span className="text-xs uppercase tracking-widest text-neutral">
                  Minutes
                </span>

                <input
                  type="number"
                  min="1"
                  max="180"
                  value={
                    customMinutes
                  }
                  onChange={(event) =>
                    updateCustomMinutes(
                      Number(
                        event.target
                          .value,
                      ),
                    )
                  }
                  className="border border-line bg-paper px-3 py-3 outline-none focus:border-ink"
                />
              </label>
            )}

            <Rule />

            <div className="grid gap-1">
              <Text variant="meta">
                What are you studying?
              </Text>

              <Text variant="caption">
                Choose a subject, then
                optionally connect it to
                a planned task.
              </Text>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {subjects.map(
                (item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setSubject(item)
                      setTaskId('')
                    }}
                    className={`border px-3 py-3 text-sm transition-colors ${
                      subject ===
                      item
                        ? 'border-ink bg-ink text-paper'
                        : 'border-line hover:border-ink'
                    }`}
                  >
                    {item}
                  </button>
                ),
              )}
            </div>

            <select
              value={taskId}
              onChange={(event) =>
                setTaskId(
                  event.target.value,
                )
              }
              className="border border-line bg-paper px-3 py-3 outline-none focus:border-ink"
            >
              <option value="">
                No specific task
              </option>

              {availableTasks.map(
                (task) => (
                  <option
                    key={task.id}
                    value={task.id}
                  >
                    {task.title}
                  </option>
                ),
              )}
            </select>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  void startSession()
                }
                className="border border-ink px-5 py-3 transition-colors hover:bg-ink hover:text-paper"
              >
                Start session →
              </button>

              {(subject ||
                taskId) && (
                <button
                  type="button"
                  onClick={
                    resetSelection
                  }
                  className="border border-line px-5 py-3 text-neutral transition-colors hover:text-ink"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Study Music */}
            <div className="border-t border-line pt-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <Text variant="meta">
                    Study music
                  </Text>

                  <Text variant="caption">
                    Cozy background music
                    for your focus session.
                  </Text>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      void toggleMusic()
                    }
                    className="flex items-center gap-2 border border-line px-4 py-2 text-sm transition-colors hover:border-ink"
                  >
                    {musicEnabled ? (
                      <>
                        <Pause
                          size={15}
                        />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play
                          size={15}
                        />
                        Play
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={
                      resetMusic
                    }
                    aria-label="Restart music"
                    className="flex h-9 w-9 items-center justify-center border border-line transition-colors hover:border-ink"
                  >
                    <RotateCcw
                      size={15}
                    />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                {musicEnabled ? (
                  <Volume2
                    size={16}
                  />
                ) : (
                  <VolumeX
                    size={16}
                  />
                )}

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(event) =>
                    setVolume(
                      Number(
                        event.target
                          .value,
                      ),
                    )
                  }
                  className="w-full accent-ink"
                  aria-label="Music volume"
                />

                <span className="w-10 text-right text-xs text-neutral">
                  {Math.round(
                    volume * 100,
                  )}
                  %
                </span>
              </div>
            </div>
          </section>
        </div>
      )}

      {(state === 'running' ||
        state === 'paused') &&
        session && (
          <motion.main
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              duration: 0.4,
            }}
            className="mx-auto grid min-h-[calc(100vh-10rem)] max-w-5xl content-center"
          >
            <section className="grid place-items-center gap-8 text-center md:gap-10">
              <div className="grid gap-2">
                <Text variant="meta">
                  Focus /{' '}
                  {session.subject ??
                    'General'}
                </Text>

                <Text variant="subheading">
                  {tasks.find(
                    (task) =>
                      task.id ===
                      session.taskId,
                  )?.title ??
                    'Open study session'}
                </Text>

                {session.chapter && (
                  <Text variant="caption">
                    {session.chapter}
                  </Text>
                )}
              </div>

              <Rule />

              <div className="grid place-items-center gap-6">
                <Text variant="meta">
                  {timerMode ===
                  'open'
                    ? 'Open session'
                    : timerPhase ===
                        'work'
                      ? timerMode ===
                        'pomodoro'
                        ? 'Pomodoro · Focus'
                        : timerMode ===
                            'deep-work'
                          ? 'Deep work · Focus'
                          : 'Custom · Focus'
                      : 'Break time'}
                </Text>

                {timerMode !==
                  'open' && (
                  <Text variant="caption">
                    Cycle{' '}
                    {cycleNumber}
                  </Text>
                )}

                <Mascot
                  state={state}
                  phase={
                    timerPhase
                  }
                />

                <div className="grid gap-2">
                  <Text
                    variant="display"
                    className="text-[clamp(4rem,14vw,9rem)] leading-none tabular-nums"
                  >
                    {formatTime(
                      displayedTime,
                    )}
                  </Text>

                  <Text variant="caption">
                    {state ===
                    'paused'
                      ? 'Paused. Take your time.'
                      : timerPhase ===
                          'break'
                        ? 'Step away. Breathe. Stretch.'
                        : 'Stay here. One thing at a time.'}
                  </Text>
                </div>
              </div>

              {timerPhase ===
                'break' && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 6,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="grid gap-3 text-center"
                >
                  <Text variant="caption">
                    Your focus block
                    is complete.
                  </Text>

                  <button
                    type="button"
                    onClick={
                      endBreak
                    }
                    className="border border-ink px-5 py-3 transition-colors hover:bg-ink hover:text-paper"
                  >
                    Start next focus →
                  </button>
                </motion.div>
              )}

              <div className="flex flex-wrap justify-center gap-3">
                {state ===
                'running' ? (
                  <button
                    type="button"
                    onClick={
                      pauseSession
                    }
                    className="border border-ink px-5 py-3 transition-colors hover:bg-ink hover:text-paper"
                  >
                    Pause
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      void resumeSession()
                    }
                    className="border border-ink px-5 py-3 transition-colors hover:bg-ink hover:text-paper"
                  >
                    Resume
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    void completeSession()
                  }
                  className="border border-line px-5 py-3 text-neutral transition-colors hover:border-ink hover:text-ink"
                >
                  Finish session
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void toggleMusic()
                  }
                  className="flex items-center gap-2 border border-line px-4 py-3 text-neutral transition-colors hover:border-ink hover:text-ink"
                >
                  {musicEnabled ? (
                    <>
                      <Volume2
                        size={15}
                      />
                      Music
                    </>
                  ) : (
                    <>
                      <VolumeX
                        size={15}
                      />
                      Music
                    </>
                  )}
                </button>
              </div>

              {musicEnabled && (
                <div className="flex w-full max-w-xs items-center gap-3">
                  <VolumeX
                    size={14}
                  />

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(event) =>
                      setVolume(
                        Number(
                          event.target
                            .value,
                        ),
                      )
                    }
                    className="w-full accent-ink"
                    aria-label="Music volume"
                  />

                  <Volume2
                    size={14}
                  />
                </div>
              )}
            </section>
          </motion.main>
        )}

      {state ===
        'completed' &&
        completedSession && (
          <motion.main
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mx-auto grid min-h-[calc(100vh-10rem)] max-w-3xl content-center"
          >
            <section className="grid place-items-center gap-7 text-center">
              <div className="grid gap-2">
                <Text variant="meta">
                  Session complete
                </Text>

                <Text variant="display">
                  NICE
                  <br />
                  WORK.
                </Text>
              </div>

              <Rule />

              <Mascot
                state="completed"
                phase="work"
              />

              <div className="grid gap-1">
                <Text
                  variant="heading"
                  className="tabular-nums"
                >
                  {formatTime(
                    completedSession.durationSeconds,
                  )}
                </Text>

                <Text variant="caption">
                  {completedSession.subject ??
                    'General study'}
                </Text>
              </div>

              <Text variant="caption">
                One focused session
                added to your study
                history.
              </Text>

              <div className="flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={
                    startAnotherSession
                  }
                  className="border border-ink px-5 py-3 transition-colors hover:bg-ink hover:text-paper"
                >
                  Start another →
                </button>

                <Link
                  to="/history"
                  className="border border-line px-5 py-3 text-neutral transition-colors hover:border-ink hover:text-ink"
                >
                  View history
                </Link>

                <Link
                  to="/"
                  className="border border-line px-5 py-3 text-neutral transition-colors hover:border-ink hover:text-ink"
                >
                  Dashboard
                </Link>
              </div>
            </section>
          </motion.main>
        )}
    </div>
  )
}

export default Focus