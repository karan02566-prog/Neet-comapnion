import type { MascotBehavior } from './mascotBehavior'
import './bob.css'

type BobProps = {
  behavior: MascotBehavior
}

export default function Bob({ behavior }: BobProps) {
  return (
    <div className={`bob bob-${behavior}`}>
      <div className="bob-character">
        <img
          src="/mascot/bob.png"
          alt=""
          className="bob-base"
          draggable={false}
        />

        <div className="bob-arm bob-arm-left" />
        <div className="bob-arm bob-arm-right" />

        <div className="bob-eye bob-eye-left">
          <span />
        </div>

        <div className="bob-eye bob-eye-right">
          <span />
        </div>

        <div className="bob-mouth" />

        <div className="bob-foot bob-foot-left" />
        <div className="bob-foot bob-foot-right" />

        {behavior === 'funny' && (
          <div className="bob-laugh">HAHA!</div>
        )}

        {behavior === 'stupid' && (
          <div className="bob-dizzy">★</div>
        )}

        {behavior === 'react' && (
          <div className="bob-heart">♥</div>
        )}
      </div>
    </div>
  )
}