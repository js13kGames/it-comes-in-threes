import { Danvas, outline, pixelCircle, withCtx } from "rocket/game/danvas"
import { V, VZ } from "rocket/math/v"

import { TILE_SIZE } from "./tile"


export type Player = {
  pos: V
  sprite: HTMLCanvasElement
  state: { t: "idle" }
    | {
      t: "transition"
      from: V
      prog: number
      to: V
    }
  tile: V
}


export const
  PLAYER_TRANSITION_SEC = .175,

  Player = (): Player => ({
    pos: VZ,
    sprite: Danvas(TILE_SIZE.x, TILE_SIZE.y, withCtx(
      ctx => { ctx.fillStyle = "#fff" },
      pixelCircle(TILE_SIZE.x / 2, TILE_SIZE.y / 2 - 2, 3),
      ctx => {
        ctx.fillStyle = "#f00"
        ctx.fillRect(TILE_SIZE.x / 2 - 2, TILE_SIZE.y / 2 + 2, 4, 3)
        ctx.fillStyle = "#000"
        ctx.fillRect(TILE_SIZE.x / 2 - 2, TILE_SIZE.y / 2 + 1, 4, 1)
      },
      outline(1),
    )),
    state: { t: "idle" },
    tile: VZ,
  })
