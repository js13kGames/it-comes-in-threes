import { onKeydown, onKeyup } from "rocket/browser/on"
import { captureOff } from "rocket/capture"


export type GameKeys = {
  Key(key: number | string): Key
  step(): void
}

export type Key = {
  down(): boolean
  justDown(): boolean
}


export const
  GameKeys = (el: Element): GameKeys => {
    const Keys: { [key: string]: number } = {}

    captureOff(
      onKeydown((_, ev) => {
        if (Keys[ev.key] === 0) { Keys[ev.key] = 1 }
      })(el)
    )
    captureOff(
      onKeyup((_, ev) => {
        if (Keys[ev.key] === 3) { Keys[ev.key] = 4 }
      })(el)
    )

    return {
      Key: (key: string) => {
        Keys[key] = 0
        return {
          down: () => Keys[key] === 2 || Keys[key] === 3,
          justDown: () => Keys[key] === 2,
        }
      },

      step() {
        for (const key in Keys) {
          if (Keys[key] % 3 === 0) { continue }
          Keys[key] = (Keys[key] + 1) % 6
        }
      },
    }
  },

  KC_DOWN = "ArrowDown",
  KC_LEFT = "ArrowLeft",
  KC_RIGHT = "ArrowRight",
  KC_SPACE = " ",
  KC_UP = "ArrowUp"
