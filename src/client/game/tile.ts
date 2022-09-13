import { Danvas, fills, rect, withCtx } from "rocket/game/danvas"
import { coin, int } from "rocket/math/random"
import { divide, plus, scaleComponents, V } from "rocket/math/v"

import { Particle } from "./particle"


export type Tile = {
  fill: string
  pos: V
  sprite: HTMLCanvasElement
  state: { t: "idle" }
    | {
      t: "transition"
      from: V
      prog: number
      to: V
    }
    | {
      t: "dying"
      prog: number
    }
  tile: V
}


export const
  TILE_FLASH_SEC = 1,
  TILE_FLASH_COUNT = 10,
  TILE_SIZE = V(16, 16),
  HALF_TILE = divide(TILE_SIZE, 2),

  interpolateFlash = (prog: number) =>
    Math.floor(prog / TILE_FLASH_SEC * TILE_FLASH_COUNT) % 2 === 0,

  Tile = (tile: V): Tile => {
    const fill = `hsl(${60 * int(0, 5)}, 90%, 60%)`

    return {
      fill,
      pos: scaleComponents(tile, TILE_SIZE),
      sprite: TileSprite(fill),
      state: { t: "idle" },
      tile,
    }
  },

  TileParticles = (tile: Tile) => [
    Particle(tile.pos, VEL_SE, PART_SPRITE, PART_LIFE_SEC),
    Particle(plus(tile.pos, V(TILE_SIZE.x / 2, 0)), VEL_SW, PART_SPRITE, PART_LIFE_SEC),
    Particle(plus(tile.pos, V(0, TILE_SIZE.y / 2)), VEL_NE, PART_SPRITE, PART_LIFE_SEC),
    Particle(plus(tile.pos, V(TILE_SIZE.x / 2, TILE_SIZE.y / 2)), VEL_NW, PART_SPRITE, PART_LIFE_SEC),
  ]


const
  PART_SPEED = 16,
  VEL_NW = V(-PART_SPEED, -PART_SPEED),
  VEL_NE = V(PART_SPEED, -PART_SPEED),
  VEL_SW = V(-PART_SPEED, PART_SPEED),
  VEL_SE = V(PART_SPEED, PART_SPEED),
  PART_LIFE_SEC = .25,
  PART_SPRITE = Danvas(TILE_SIZE.x / 2, TILE_SIZE.y / 2, withCtx(
    fills("#fff"),
    rect(0, 0, TILE_SIZE.x / 2, TILE_SIZE.y / 2)
  )),

  cache: Record<string, HTMLCanvasElement> = {},
  TileSprite = (fill: string) =>
    cache[fill] || (cache[fill] = Danvas(2 * TILE_SIZE.x, TILE_SIZE.y, withCtx(ctx => {
      ctx.fillStyle = fill
      ctx.fillRect(0, 0, TILE_SIZE.x, TILE_SIZE.y)
      ctx.fillStyle = "#fff"
      ctx.fillRect(TILE_SIZE.x, 0, TILE_SIZE.x, TILE_SIZE.y)
      ctx.fillStyle = "rgba(0, 0, 0, .125)"
      const size = V((TILE_SIZE.x - 4) / 4, (TILE_SIZE.y - 4) / 2)
      ctx.translate(2, 2)
      for (let y = 0; y < size.y; ++y) {
        for (let x = 0; x < size.x; ++x) {
          if (coin()) {
            ctx.fillRect(2*x, 2*y, 2, 2)
            ctx.fillRect(TILE_SIZE.x - 6 - 2*x, 2*y, 2, 2)
            ctx.fillRect(TILE_SIZE.x + 2*x, 2*y, 2, 2)
            ctx.fillRect(2 * TILE_SIZE.x - 6 - 2*x, 2*y, 2, 2)
          }
        }
      }
    })))
