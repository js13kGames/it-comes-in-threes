import { generateSFXBuffer } from "../../../../../src/client/models/sfx"
import { NoiseWave } from "../../../../../src/client/sound/models/wave"


export const
  getNoiseBuffer = (ctx: AudioContext) =>
    generateSFXBuffer(
      ctx,
      0, // attack time
      0, // decay time
      12, // pitch index
      0, // pitch slide
      0, // release time
      1, // sustain power
      4, // sustain time
      NoiseWave(), // wave
    )
