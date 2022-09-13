import { size } from "rocket/browser/attr"
import { canvas } from "rocket/browser/elt"
import { maxBy, minBy } from "rocket/data/array"
import { outline, solidify, withCtx } from "rocket/game/danvas"
import { V } from "rocket/math/v"

import { Particle } from "./particle"
import { Tile, TILE_SIZE } from "./tile"


export const
  ScoreParticle = (chunk: Tile[], score: number) => {
    const
      pos = V(
        (maxBy(chunk, tile => tile.pos.x) + minBy(chunk, tile => tile.pos.x) + TILE_SIZE.x) / 2 - TILE_SIZE.x,
        minBy(chunk, tile => tile.pos.y) - 10
      )

    return Particle(pos, PART_VEL, getPartSprite(score), 1)
  }


const
  PART_VEL = V(0, -16),

  spriteCache: Record<number, HTMLCanvasElement> = {},
  getPartSprite = (score: number) =>
    spriteCache[score] || (spriteCache[score] = canvas(size(100, 20), withCtx(
      ctx => {
        ctx.fillStyle = "#fff"
        ctx.font = "12pt cursive"
        ctx.textBaseline = "top"
        ctx.fillText(`+${score}!`, 1, 1)
      },
      solidify(150),
      ctx => { ctx.fillStyle = "#000" },
      outline(1)
    )))
