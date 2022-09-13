import { div } from "rocket/browser/elt"
import { $ } from "rocket/browser/prop"
import { opacity } from "rocket/browser/style"
import { Prop } from "rocket/prop/prop"

import { $fade, $transitionOpacity } from "../style/threes.gen"


export const
  PreGameFade = ({ play }: { play(): void }) => {
    const exiting = Prop(false)

    setTimeout(() => {
      exiting.set(true)
      setTimeout(play, 1500)
    })

    return div($fade, $transitionOpacity, $(exiting, exiting =>
      opacity(exiting ? 0 : 1)
    ))
  }
