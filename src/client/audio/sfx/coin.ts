import { generateSFXBuffer } from "../../../../../src/client/models/sfx"
import { TriangleWave } from "../../../../../src/client/sound/models/wave"


export const
  getCoinBuffer = (ctx: AudioContext) =>
    generateSFXBuffer(
      ctx,
      0.05133342146873474, // attack time
      0.0687593698501587, // decay time
      64, // pitch index
      0.0007100033760070801, // pitch slide
      0.02126429080963135, // release time
      0.25635467767715453, // sustain power
      0.06709707379341125, // sustain time
      TriangleWave(),
    )
