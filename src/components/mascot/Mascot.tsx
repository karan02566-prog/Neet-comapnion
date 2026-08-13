import { useEffect, useState } from 'react'
import Bob from './Bob'
import {
  behaviorDurations,
  getRandomBehavior,
  type MascotBehavior,
} from './mascotBehavior'
import { getRandomPhrase } from './mascotPhrases'
import './mascot.css'

function speakBob(text: string) {
  if (!('speechSynthesis' in window)) {
    return
  }

  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)

  // Cartoon-like voice settings.
  // This uses the user's browser/device voice engine.
  utterance.pitch = 1.65
  utterance.rate = 0.9
  utterance.volume = 1

  const voices = window.speechSynthesis.getVoices()

  const preferredVoice =
    voices.find((voice) =>
      /en.*(US|GB|AU|IN)/i.test(voice.lang),
    ) ?? voices.find((voice) =>
      voice.lang.startsWith('en'),
    )

  if (preferredVoice) {
    utterance.voice = preferredVoice
  }

  window.speechSynthesis.speak(utterance)
}

export default function Mascot() {
  const [behavior, setBehavior] =
    useState<MascotBehavior>('walk')

  const [phrase, setPhrase] =
    useState<string | null>(null)

  const [position, setPosition] = useState(10)

  useEffect(() => {
    let timeout: number

    const chooseBehavior = () => {
      const next = getRandomBehavior()

      setBehavior(next)

      const phraseType =
        next === 'walk'
          ? 'idle'
          : next === 'funny'
            ? 'funny'
            : next === 'interact'
              ? 'interact'
              : next === 'react'
                ? 'react'
                : 'stupid'

      setPhrase(getRandomPhrase(phraseType))

      if (next === 'walk') {
        setPosition((current) => {
          const movement =
            Math.random() * 30 - 15

          return Math.max(
            5,
            Math.min(90, current + movement),
          )
        })
      }

      timeout = window.setTimeout(
        chooseBehavior,
        behaviorDurations[next],
      )
    }

    chooseBehavior()

    return () => {
      window.clearTimeout(timeout)
    }
  }, [])

  const handleClick = () => {
    const clickedPhrase =
      getRandomPhrase('clicked')

    setBehavior('react')
    setPhrase(clickedPhrase)

    speakBob(clickedPhrase)
  }

  return (
    <div
      className="mascot-container fixed bottom-4 z-50 select-none"
      style={{
        left: `${position}%`,
        transition: 'left 2.5s ease-in-out',
      }}
    >
      {phrase && (
        <div className="mascot-speech">
          {phrase}
        </div>
      )}

      <button
        type="button"
        onClick={handleClick}
        aria-label="Bob, your study companion"
        className="mascot-button"
      >
        <Bob behavior={behavior} />
      </button>
    </div>
  )
}