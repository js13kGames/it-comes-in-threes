import { disabled } from "rocket/browser/attr"
import { apd, text } from "rocket/browser/core"
import { button, div, h1, i } from "rocket/browser/elt"
import { onClick } from "rocket/browser/on"
import { $ } from "rocket/browser/prop"
import { bottom, left, opacity } from "rocket/browser/style"
import { mix } from "rocket/mix"
import { Prop } from "rocket/prop/prop"

import { GameAudio } from "../audio/game-audio"
import { TextPicker } from "../game/text-picker"
import { $absolute, $fade, $menu, $mt1, $peNoneIf, $relative, $transitionOpacity } from "../style/threes.gen"


export const
  Title = (audio: GameAudio, { play }: { play(): void }) => {
    const
      incrEnterState = () => {
        enterState.set(enterState.get() + 1)
        if (enterState.get() < 4) {
          setTimeout(incrEnterState, 2000)
        }
      },
      enterState = Prop(0),
      exiting = Prop(false),

      IT_COMES = getItComes(),
      MORON = getMoron()

    setTimeout(incrEnterState, 1000)

    return div($menu, apd(
      h1($transitionOpacity, $(enterState, es => opacity(es >= 1 ? 1 : 0)), apd(
        `"${IT_COMES} in Threes"`
      )),
      div($transitionOpacity, $(enterState, es => opacity(es >= 2 ? 1 : 0)), $relative, left("96px"), apd(
        i(apd(`- Some ${MORON}`))
      )),
      div($transitionOpacity, $(enterState, es => opacity(es >= 3 ? 1 : 0)), $mt1, apd(
        button(apd("Play"), $(exiting, disabled), onClick(() => {
          if (exiting.get()) { return }
          exiting.set(true)
          setTimeout(() => { play() }, 2000)
          audio.button()
        })),
        " ",
        button(
          $(audio.muted, muted => text(muted ? "Unmute" : "Mute")),
          $(exiting, disabled),
          onClick(() => {
            audio.muted.set(!audio.muted.get())
            audio.button()
          })
        )
      )),
      div($absolute, bottom(0), left(".5em"), $transitionOpacity, $(enterState, es => opacity(es >= 4 ? 1 : 0)), apd(
        i(apd("Arrow Keys to Move"))
      )),

      div($fade, $(exiting, exiting => mix<HTMLDivElement>(
        opacity(exiting ? 1 : 0),
        $peNoneIf(!exiting),
      )))
    ))
  }


const
  getItComes = TextPicker(
    "It Comes", "Death Comes", "Bad Things Come", "Good Things Leave",
    "Movies in Trilogies Come", "Triplets Come", "Things Divisible By Three Come"
  ),

  getMoron = TextPicker(
    "Moron", "Simpleton", "Boob", "Dimwit", "Dope", "Mental Defective",
    "Ignoramus", "Dunce", "Imbecile", "Dingbat", "Dolt", "Halfwit"
  )
