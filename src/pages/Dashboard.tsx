import { motion, type Variants } from 'motion/react'
import Text from '../components/ui/Text'
import Rule from '../components/ui/Rule'

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

const mock = {
  examYear: 2027,
  dayCount: 214,
  streak: 12,
  studyTimeToday: '03H 42M',
  subjects: [
    { name: 'Physics', progress: 62 },
    { name: 'Chemistry', progress: 48 },
    { name: 'Biology', progress: 71 },
  ],
  nextSession: {
    time: '05:00 PM',
    topic: 'Organic Chemistry — Reactions',
  },
  motivation: 'Small steps, repeated daily, outrun sudden bursts.',
}

function Dashboard() {
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
          NEET / {mock.examYear} — DAY {mock.dayCount}
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
          <Text variant="meta">Study time today</Text>
          <Text variant="heading">{mock.studyTimeToday}</Text>
        </div>

        <div>
          <Text variant="meta">Current streak</Text>
          <Text variant="heading">{mock.streak} days</Text>
        </div>

        <div>
          <Text variant="meta">Next session</Text>
          <Text variant="heading">{mock.nextSession.time}</Text>
          <Text variant="caption">{mock.nextSession.topic}</Text>
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
        <Text variant="meta">Subject progress</Text>

        <div className="grid gap-3">
          {mock.subjects.map((s) => (
            <div
              key={s.name}
              className="grid grid-cols-[70px_1fr_40px] items-center gap-3 sm:grid-cols-[100px_1fr_50px] sm:gap-4"
            >
              <Text variant="caption">{s.name}</Text>

              <div className="h-[2px] bg-line relative">
                <div
                  className="h-[2px] bg-ink absolute left-0 top-0"
                  style={{ width: `${s.progress}%` }}
                />
              </div>

              <Text variant="caption">{s.progress}%</Text>
            </div>
          ))}
        </div>
      </motion.section>

      <Rule />

      {/* Motivation */}
      <motion.section
        custom={3}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <Text variant="subheading">{mock.motivation}</Text>
      </motion.section>
    </div>
  )
}

export default Dashboard