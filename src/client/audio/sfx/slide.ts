import { generateSFXBuffer } from "../../../../../src/client/models/sfx"
import { NoiseWave } from "../../../../../src/client/sound/models/wave"


export const
  getSlideBuffer = (ctx: AudioContext) =>
    generateSFXBuffer(
      ctx,
      .07, // attack time
      .06, // decay time
      58, // pitch index
      0, // pitch slide
      .09,  // release time
      .19, // sustain power
      .014, // sustain time
      NoiseWave(), // wave
    )
