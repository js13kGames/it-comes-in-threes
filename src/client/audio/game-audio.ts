import { Visible } from "rocket/browser/visible"
import { Prop } from "rocket/prop/prop"
import { Tuple } from "rocket/prop/tuple"

import { getButtonBuffer } from "./sfx/button"
import { getBuzzBuffer } from "./sfx/buzz"
import { getCoinBuffer } from "./sfx/coin"
import { getNoiseBuffer } from "./sfx/noise"
import { getSlideBuffer } from "./sfx/slide"


export type GameAudio = {
  muted: Prop<boolean>
  noiseLevel: Prop<number>

  button(): void
  buzz(gain: number): void
  coin(): void
  slide(gain: number): void
}

type NoiseState = { t: "idle" }
  | { t: "playing", gain: GainNode, source: AudioBufferSourceNode }


export const
  GameAudio = (visible: Visible): GameAudio => {
    const
      playSFX = (buffer: AudioBuffer, _gain = 1) =>
        (__gain: number = 1) => {
          if (muted.get()) { return }

          const source = ctx.createBufferSource()
          source.buffer = buffer

          const gain = ctx.createGain()
          gain.gain.value = _gain * __gain * .0625

          source.connect(gain).connect(ctx.destination)
          source.start()
        },

      ctx = new AudioContext(),
      muted = Prop(true),
      noiseBuffer = getNoiseBuffer(ctx),
      noiseLevel = Prop(0),
      audio: GameAudio = {
        muted,
        noiseLevel,

        button: playSFX(getButtonBuffer(ctx), 3),
        buzz: playSFX(getBuzzBuffer(ctx), 2),
        coin: playSFX(getCoinBuffer(ctx)),
        slide: playSFX(getSlideBuffer(ctx), .5),
      },

      noiseState = Prop<NoiseState>({ t: "idle" })

    let oldNoiseState = noiseState.get()

    Tuple(muted, noiseLevel, visible.visible).listen(([muted, noiseLevel, visible]) => {
      if (muted || noiseLevel === 0 || !visible) {
        if (oldNoiseState.t === "playing") {
          oldNoiseState.source.stop()
          noiseState.set({ t: "idle" })
        }
      } else {
        if (oldNoiseState.t === "playing") {
          oldNoiseState.gain.gain.value = .04 * noiseLevel
        } else {
          const source = ctx.createBufferSource()
          source.buffer = noiseBuffer
          source.loop = true

          const gain = ctx.createGain()
          gain.gain.value = .04 * noiseLevel

          source.connect(gain).connect(ctx.destination)
          source.start()

          noiseState.set({ t: "playing", gain, source })
        }
      }
      oldNoiseState = noiseState.get()
    })

    return audio
  }
