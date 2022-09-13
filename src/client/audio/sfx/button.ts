import { generateSFXBuffer } from "../../../../../src/client/models/sfx"
import { SineWave } from "../../../../../src/client/sound/models/wave"


export const
  getButtonBuffer = (ctx: AudioContext) =>
    generateSFXBuffer(
      ctx,
      0.022099770605564117, // attack time
      0.07424317002296447, // decay time
      37, // pitch index
      0, // pitch slide
      0.057468581199646, // release time
      0.20582507848739623, // sustain power
      0.05865459561347962, // sustain time
      SineWave(), // wave
    )
