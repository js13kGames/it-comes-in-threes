import { V } from "rocket/math/v"


export type Particle = {
  life: number
  pos: V
  sprite: HTMLCanvasElement
  vel: V
}


export const
  Particle = (pos: V, vel: V, sprite: HTMLCanvasElement, life: number): Particle => ({
    life,
    pos,
    sprite,
    vel,
  })
