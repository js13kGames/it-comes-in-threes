import { pick } from "rocket/math/random"


export const
  TextPicker = (...options: string[]) => {
    let index = 0
    return () =>
      index >= options.length ? pick(options) : options[index++]
  }
