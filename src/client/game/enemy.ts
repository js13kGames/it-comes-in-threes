import { size } from "rocket/browser/attr"
import { canvas } from "rocket/browser/elt"
import { tab } from "rocket/data/array"
import { Danvas, outline, pixelCircle, rect, withCtx } from "rocket/game/danvas"
import { float, int, pick } from "rocket/math/random"
import { eq, len, minus, plus, plus_, round_, scaleComponents, scale_, unitOfAng, V } from "rocket/math/v"

import { GameAudio } from "../audio/game-audio"

import { Particle } from "./particle"
import { Player } from "./player"
import { TILE_SIZE } from "./tile"


export type Enemy = {
  boosts: number
  pos: V
  sprite: HTMLCanvasElement
  state: {
      t: "idle"
      prog: number
    }
    | {
      t: "transition"
      from: V
      prog: number
      to: V
    }
  tile: V
  waitSec: number
}


export const
  ENEMY_WAIT_SEC = 2,

  Enemy = (player: Player): Enemy => {
    const tile = plus_(round_(scale_(unitOfAng(float(0, 2 * Math.PI)), 20)), player.tile)

    return {
      boosts: 0,
      pos: scaleComponents(tile, TILE_SIZE),
      sprite: Danvas(TILE_SIZE.x, TILE_SIZE.y, withCtx(
        ctx => { ctx.fillStyle = "#111" },
        pixelCircle(TILE_SIZE.x / 2, TILE_SIZE.y / 2 - 2, 3),
        ctx => {
          ctx.fillStyle = "#333"
          ctx.fillRect(TILE_SIZE.x / 2 - 2, TILE_SIZE.y / 2 + 2, 4, 1)
          ctx.fillRect(TILE_SIZE.x / 2 - 3, TILE_SIZE.y / 2 + 3, 6, 2)
          ctx.fillStyle = "#000"
          ctx.fillRect(TILE_SIZE.x / 2 - 2, TILE_SIZE.y / 2 + 1, 4, 1)
        },
        outline(1),
      )),
      state: {
        t: "idle",
        prog: 0,
      },
      tile,
      waitSec: ENEMY_WAIT_SEC,
    }
  },

  /**
   * @returns true if the enemy reached the player and the game is over
   */
  stepEnemy = (audio: GameAudio, enemy: Enemy, player: Player, noTTL: boolean, dt: number): boolean => {
    if (enemy.state.t !== "idle") { return false }
    if (noTTL) {
      return chasePlayer(audio, enemy, player)
    }
    if (enemy.boosts > 0) {
      --enemy.boosts
      return chasePlayer(audio, enemy, player)
    }
    enemy.state.prog += dt
    if (enemy.state.prog >= enemy.waitSec) {
      return chasePlayer(audio, enemy, player)
    }
    return false
  },

  SmokeParticle = (enemy: Enemy) =>
    Particle(
      plus_(V(int(0, TILE_SIZE.x - SMOKE_SIZE.x), int(0, TILE_SIZE.y - SMOKE_SIZE.y)), enemy.pos),
      PARTICLE_VEL,
      pick(PARTICLE_SPRITES),
      1
    ),

  SwallowParticles = (pos: V) => [
    Particle(pos, VEL_SE, PART_SPRITE, PART_LIFE_SEC),
    Particle(plus(pos, V(TILE_SIZE.x / 2, 0)), VEL_SW, PART_SPRITE, PART_LIFE_SEC),
    Particle(plus(pos, V(0, TILE_SIZE.y / 2)), VEL_NE, PART_SPRITE, PART_LIFE_SEC),
    Particle(plus(pos, V(TILE_SIZE.x / 2, TILE_SIZE.y / 2)), VEL_NW, PART_SPRITE, PART_LIFE_SEC),
  ]



const
  // SWALLOW PARTICLES
  PART_SPEED = 16,
  VEL_NW = V(-PART_SPEED, -PART_SPEED),
  VEL_NE = V(PART_SPEED, -PART_SPEED),
  VEL_SW = V(-PART_SPEED, PART_SPEED),
  VEL_SE = V(PART_SPEED, PART_SPEED),
  PART_LIFE_SEC = .25,
  PART_SPRITE = Danvas(TILE_SIZE.x / 2, TILE_SIZE.y / 2, withCtx(
    rect(0, 0, TILE_SIZE.x / 2, TILE_SIZE.y / 2)
  )),

  // SMOKE PARTICLES
  PARTICLE_VEL = V(0, -10),
  SMOKE_SIZE = V(3, 3),

  PARTICLE_SPRITES = tab(5, i =>
    canvas(size(SMOKE_SIZE.x, SMOKE_SIZE.y), withCtx(ctx => {
      ctx.fillStyle = `#${i}${i}${i}`
      ctx.fillRect(0, 0, SMOKE_SIZE.x, SMOKE_SIZE.y)
    }))
  ),

  chasePlayer = (audio: GameAudio, enemy: Enemy, player: Player): boolean => {
    const d = minus(player.tile, enemy.tile)
    enemy.tile = int(0, Math.abs(d.x) + Math.abs(d.y) - 1) < Math.abs(d.x) ?
        plus(enemy.tile, V(d.x > 0 ? 1 : -1, 0))
      :
        plus(enemy.tile, V(0, d.y > 0 ? 1 : -1))
    enemy.state = {
      t: "transition",
      from: enemy.pos,
      prog: 0,
      to: scaleComponents(enemy.tile, TILE_SIZE)
    }
    const dLen = 20 - len(d)
    if (dLen > 0) {
      audio.slide(dLen / 20)
    }
    return eq(enemy.tile, player.tile)
  }
