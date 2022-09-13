import { tab2d } from "rocket/data/array"
import { Danvas, withCtx } from "rocket/game/danvas"
import { plus_, scaleComponents, V, VB } from "rocket/math/v"

import { Tile, TILE_SIZE } from "./tile"


export type Chunk = {
  data: (Tile | undefined)[][]
  pos: V
}


export const
  CHUNK_TILES = VB(16),
  CHUNK_SIZE = scaleComponents(CHUNK_TILES, TILE_SIZE),

  Chunk = (pos: V): Chunk => {
    const
      scaled = scaleComponents(pos, CHUNK_TILES),
      data = tab2d(CHUNK_TILES.y, CHUNK_TILES.x, (y, x) =>
        Tile(plus_(V(x, y), scaled))
      )

    return { data, pos }
  },

  chunkKey = (v: V) =>
    `${v.x},${v.y}`,

  CHUNK_BG = Danvas(CHUNK_SIZE.x, CHUNK_SIZE.y, withCtx(ctx => {
    ctx.fillStyle = "#666"
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.fillStyle = "rgba(0, 0, 0, .125)"
    for (let y = 0; y < Math.ceil(ctx.canvas.height / TILE_SIZE.y); ++y) {
      for (let x = 0; x < Math.ceil(ctx.canvas.width / TILE_SIZE.x); ++x) {
        if ((x + y) % 2) {
          ctx.fillRect(x * TILE_SIZE.x, y * TILE_SIZE.y, TILE_SIZE.x, TILE_SIZE.y)
        }
      }
    }
  }))
