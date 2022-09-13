import { generateSFXBuffer } from "../../../../../src/client/models/sfx"
import { SawtoothWave } from "../../../../../src/client/sound/models/wave"


export const
  getBuzzBuffer = (ctx: AudioContext) =>
    generateSFXBuffer(
      ctx,
      0.02781418561935425, // attack time
      0.05821746587753296, // decay time
      21, // pitch index
      -0.0001, // pitch slide
      0.07508152723312378, // release time
      0.09908761382102967, // sustain power
      0.771031414270401, // sustain time
      SawtoothWave(1), // wave
    )
