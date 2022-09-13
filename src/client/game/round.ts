import { float } from "rocket/math/random"
import { round_, scale, unitOfAng } from "rocket/math/v"
import { Prop } from "rocket/prop/prop"

import { Enemy } from "./enemy"
import { Goal } from "./goal"
import { Particle } from "./particle"
import { Player } from "./player"
import { World } from "./world"


export type Round = {
  enemy: Enemy | undefined
  goal: Goal
  moved: boolean
  particles: Particle[]
  player: Player
  score: Prop<number>
  time: Prop<number>
  ttl: Prop<number>
  world: World
}


export const
  Round = (): Round => {
    const
      start = unitOfAng(float(0, 2 * Math.PI)),
      round: Round = {
        enemy: undefined,
        goal: Goal(round_(scale(start, -8))),
        moved: false,
        particles: [],
        player: Player(),
        score: Prop(0),
        time: Prop(0),
        ttl: Prop(10),
        world: World(),
      }

    round.world.tileSet(round.goal.tile, undefined)
    round.world.tileSet(round.player.tile, undefined)
    return round
  }
