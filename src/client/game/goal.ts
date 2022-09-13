import { size } from "rocket/browser/attr"
import { canvas } from "rocket/browser/elt"
import { Danvas, outline, pixelCircle, solidify, withCtx } from "rocket/game/danvas"
import { plus, scaleComponents, V } from "rocket/math/v"

import { Particle } from "./particle"
import { TILE_SIZE } from "./tile"


export type Goal = {
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
  Goal = (tile: V): Goal => ({
    pos: scaleComponents(tile, TILE_SIZE),
    sprite: Danvas(TILE_SIZE.x, TILE_SIZE.y, withCtx(
      ctx => { ctx.fillStyle = "#fff" },
      pixelCircle(TILE_SIZE.x / 2, TILE_SIZE.y / 2, TILE_SIZE.x / 2 - 2, TILE_SIZE.y / 2 - 2),
      //ctx => { ctx.fillStyle = "rgba(0, 0, 0, .125)" },
      //pixelCircle(TILE_SIZE.x / 2, TILE_SIZE.y / 2, TILE_SIZE.x / 2 - 4, TILE_SIZE.y / 2 - 4),
      ctx => {
        const now = new Date()
        ctx.save()
          ctx.translate(TILE_SIZE.x / 2, TILE_SIZE.y / 2)

          ctx.fillStyle = "#000"
          ctx.save()
            for (let i = 0; i < 4; ++i) {
              ctx.fillRect(3, -1, 2, 2)
              ctx.rotate(Math.PI / 2)
            }
          ctx.restore()
        ctx.restore()
        ctx.drawImage(
          Danvas(TILE_SIZE.x, TILE_SIZE.y, withCtx(
            ctx => {
              ctx.fillStyle = "#f00"
              ctx.save()
                ctx.translate(TILE_SIZE.x / 2, TILE_SIZE.y / 2)
                ctx.save()
                  ctx.rotate(2 * Math.PI * (now.getHours() % 12) / 12 - Math.PI / 2)
                  ctx.fillRect(-.5, -.5, TILE_SIZE.x / 2 - 4, 1)
                ctx.restore()
                ctx.save()
                  ctx.rotate(2 * Math.PI * now.getMinutes() / 60 - Math.PI / 2)
                  ctx.fillRect(-.5, -.5, TILE_SIZE.x / 2 - 2, 1)
                ctx.restore()
              ctx.restore()
            },
            solidify(100)
          )),
          0,
          0
        )
        ctx.fillStyle = "#000"
      },
      outline(1),
    )),
    state: { t: "idle" },
    tile,
  }),

  GoalParticle = (goal: Goal) =>
    Particle(plus(goal.pos, PART_OFFSET), PART_VEL, PART_SPRITE, 1)


const
  PART_OFFSET = V(-8, -10),
  PART_VEL = V(0, -18),
  PART_SPRITE = canvas(size(100, 20), withCtx(
    ctx => {
      ctx.fillStyle = "#fff"
      ctx.font = "12pt cursive"
      ctx.textBaseline = "top"
      ctx.fillText("+10s", 1, 1)
    },
    solidify(150),
    ctx => { ctx.fillStyle = "#000" },
    outline(1)
  ))
