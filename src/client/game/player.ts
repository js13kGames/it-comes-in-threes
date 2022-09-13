import { Danvas, outline, pixelCircle, withCtx } from "rocket/game/danvas"
import { V, VZ } from "rocket/math/v"

import { TILE_SIZE } from "./tile"


export type Player = {
  facing: {
    x: "left" | "right"
    y: "down" | "middle" | "up"
  }
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
    facing: { x: "right", y: "down" },
    pos: VZ,
    sprite: Danvas(TILE_SIZE.x * 3, TILE_SIZE.y, withCtx(ctx => {
      const body = Danvas(TILE_SIZE.x, TILE_SIZE.y, withCtx(
        ctx => { ctx.fillStyle = "#fff" },
        pixelCircle(TILE_SIZE.x / 2, TILE_SIZE.y / 2 - 2, 3),
        ctx => {
          ctx.fillStyle = "#f00"
          ctx.fillRect(TILE_SIZE.x / 2 - 2, TILE_SIZE.y / 2 + 2, 4, 3)
          ctx.fillStyle = "#000"
          ctx.fillRect(TILE_SIZE.x / 2 - 2, TILE_SIZE.y / 2 + 1, 4, 1)
        },
        outline(1),
      ))
      ctx.drawImage(body, 0, 0)
      ctx.fillRect(5, 5, 6, 1)
      ctx.fillRect(6, 6, 2, 1)
      ctx.fillRect(9, 6, 2, 1)
      ctx.drawImage(body, TILE_SIZE.x, 0)
      ctx.fillRect(TILE_SIZE.x + 7, 5, 4, 1)
      ctx.fillRect(TILE_SIZE.x + 9, 6, 2, 1)
      ctx.drawImage(body, 2 * TILE_SIZE.x, 0)
    })),
    state: { t: "idle" },
    tile: VZ,
  })
