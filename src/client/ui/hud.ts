import { apd, text } from "rocket/browser/core"
import { button, div } from "rocket/browser/elt"
import { matchIf } from "rocket/browser/match"
import { onClick } from "rocket/browser/on"
import { $ } from "rocket/browser/prop"
import { backgroundColor, bottom, left, right, size, top, transform, transformOrigin } from "rocket/browser/style"
import { Danvas, fills, rect, withCtx } from "rocket/game/danvas"
import { mix } from "rocket/mix"
import { Prop } from "rocket/prop/prop"

import { GameAudio } from "../audio/game-audio"
import { Round } from "../game/round"
import { $absolute, $fillParent, $flashRedIf, $flexCenter, $hud, $hudPill } from "../style/threes.gen"


export const
  HUD = (audio: GameAudio, paused: Prop<boolean>, round: Round) =>
    div($absolute, left(0), size("100%"), top(0), apd(
      matchIf(paused, () =>
        div(backgroundColor("#fff"), $fillParent, $flexCenter, apd(
          Danvas(90, 90, withCtx(
            fills("rgba(0, 0, 0, .125)"),
            rect(0, 0, 30, 90),
            rect(60, 0, 30, 90),
          ))
        ))
      ),

      div($absolute, $hudPill, left("10px"), transformOrigin("top left"), top("10px"), $(round.ttl, ttl => {
        const prog = ttl < 5 ? (5 - Math.floor(ttl)) / 5 : 0
        return mix<HTMLDivElement>(
          backgroundColor(ttl > 0 ? `hsl(0, ${100 * prog}%, ${40 * prog}%)` : ""),
          $flashRedIf(ttl === 0),
          text(`${ttl.toFixed(1)}s`),
          transform(`scale(${1 + prog})`)
        )
      })),
      div($absolute, $hudPill, right("10px"), top("10px"), $(round.score, score => text(score))),
      div($absolute, left("10px"), bottom("10px"), apd(
        button($hud, $(audio.muted, muted => text(muted ? "Unmute" : "Mute")), onClick(() => {
          audio.muted.set(!audio.muted.get())
          audio.button()
        }))
      )),
      div($absolute, right("10px"), bottom("10px"), apd(
        button($hud, $(paused, paused => text(paused ? "Unpause" : "Pause")), onClick(() => {
          paused.set(!paused.get())
          audio.button()
        }))
      )),
    ))
