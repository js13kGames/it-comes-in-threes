import { apd } from "rocket/browser/core"
import { button, div, h2 } from "rocket/browser/elt"
import { onClick } from "rocket/browser/on"
import { $ } from "rocket/browser/prop"
import { opacity } from "rocket/browser/style"
import { mix } from "rocket/mix"
import { Prop } from "rocket/prop/prop"

import { GameAudio } from "../audio/game-audio"
import { Round } from "../game/round"
import { TextPicker } from "../game/text-picker"
import { $fade, $menu, $mt1, $peNoneIf, $transitionOpacity } from "../style/threes.gen"


export const
  YouDied = (audio: GameAudio, round: Round, { menu, retry }: { menu(): void, retry(): void }) => {
    const
      incrEnterState = () => {
        enterState.set(enterState.get() + 1)
        if (enterState.get() < 5) {
          setTimeout(incrEnterState, 1000)
        }
      },
      enterState = Prop(0),
      exiting = Prop(false),

      MEANINGLESS = getMeaningless(),
      YOU = getYou()

    setTimeout(incrEnterState, 2000)

    return div($menu, apd(
      div($transitionOpacity, $(enterState, es => opacity(es >= 1 ? 1 : 0)), apd(
        !round.moved ?
          `${YOU} didn't move.`
        :
          `${YOU} ${getWandered()} around for ${round.time.get().toFixed(1)} ${MEANINGLESS} seconds.`
      )),
      div($transitionOpacity, $(enterState, es => opacity(es >= 2 ? 1 : 0)), apd(
        round.score.get() === 0 ?
          `${YOU} didn't score any points.`
        :
          `${YOU} scored ${round.score.get()} ${MEANINGLESS} points.`
      )),
      h2($transitionOpacity, $(enterState, es => opacity(es >= 3 ? 1 : 0)), apd(
        `${YOU} Died.`
      )),
      div($transitionOpacity, $(enterState, es => opacity(es >= 4 ? 1 : 0)), $mt1, apd(
        button(apd("Retry"), onClick(() => {
          if (exiting.get()) { return }
          exiting.set(true)
          setTimeout(() => { retry() }, 2000)
          audio.button()
        })),
        " ",
        button(apd("Menu"), onClick(() => {
          if (exiting.get()) { return }
          exiting.set(true)
          setTimeout(() => { menu() }, 2000)
          audio.button()
        })),
      )),

      div($fade, $(exiting, exiting => mix<HTMLDivElement>(
        opacity(exiting ? 1 : 0),
        $peNoneIf(!exiting)
      )))
    ))
  }


const
  getMeaningless = TextPicker(
    "", "meaningless", "pointless", "useless", "worthless",
  ),
  getWandered = TextPicker(
    "wandered", "meandered", "circumlocuted", "ambled", "drifted", "strutted", "roved"
  ),
  getYou = TextPicker("You", "Ya")
