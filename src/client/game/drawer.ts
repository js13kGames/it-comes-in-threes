import { size as sizeAttr } from "rocket/browser/attr"
import { canvas } from "rocket/browser/elt"
import { tab } from "rocket/data/array"
import { pixelCircle, withCtx } from "rocket/game/danvas"
import { divideComponents, divideComponents_, floor_, iter, minus, plus, plus_, VZ } from "rocket/math/v"
import { derive } from "rocket/prop/derive"
import { PropView } from "rocket/prop/prop"

import { Chunk, CHUNK_BG, CHUNK_SIZE } from "./chunk"
import { Enemy } from "./enemy"
import { GameSize } from "./game-size"
import { Goal } from "./goal"
import { Particle } from "./particle"
import { Player } from "./player"
import { HALF_TILE, interpolateFlash, TILE_SIZE } from "./tile"
import { World } from "./world"


export type Drawer = {
  clear(): void
  darkness(level: number): void
  particles(particles: Particle[]): void
  player(player: Player): void
  thing(thing: Enemy | Goal): void
  track(player: Player, cb: () => void): void
  world(world: World): void
}


export const
  withDrawer = (gameSize: PropView<GameSize>, cb: (drawer: Drawer) => void) =>
    withCtx(ctx => {
      const
        chunk = (chunk: Chunk) => {
          chunk.data.forEach(row => {
            row.forEach(tile => {
              if (tile == null) { return }
              ctx.drawImage(tile.sprite,
                tile.state.t !== "dying" || !interpolateFlash(tile.state.prog) ? 0 : TILE_SIZE.x, 0,
                TILE_SIZE.x, TILE_SIZE.y,
                tile.pos.x, tile.pos.y,
                TILE_SIZE.x, TILE_SIZE.y
              )
            })
          })
        },

        darknesses = derive(gameSize, ({ center, size }) =>
          tab(11, i =>
            canvas(sizeAttr(size.x, size.y), withCtx(ctx => {
              ctx.globalAlpha = .125
              for (let j = Math.max((i - 5) + 1, 1); j <= (i - 5) + 6; ++j) {
                pixelCircle(center.x, center.y, j * 16)(ctx)
              }
              ctx.globalAlpha = .75
              ctx.globalCompositeOperation = "source-out"
              ctx.fillRect(0, 0, size.x, size.y)
            }))
          )
        ),

        drawer: Drawer = {
          clear() {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
          },

          darkness(level) {
            if (level <= 0) { return }
            ctx.globalAlpha = level
            const _darknesses = darknesses.get()
            ctx.drawImage(_darknesses[Math.floor((1 - level) * _darknesses.length)], 0, 0)
            ctx.globalAlpha = 1
          },

          particles(particles) {
            particles.forEach(part => {
              ctx.drawImage(part.sprite, part.pos.x, part.pos.y)
            })
          },

          player(player) {
            ctx.save()
              ctx.translate(player.pos.x + (player.facing.x === "left" ? TILE_SIZE.x : 0), player.pos.y)
              ctx.scale(player.facing.x === "left" ? -1 : 1, 1)
              ctx.drawImage(player.sprite,
                (player.facing.y === "down" ? 0 : player.facing.y === "middle" ? 1 : 2) * TILE_SIZE.x, 0,
                TILE_SIZE.x, TILE_SIZE.y,
                0, 0,
                TILE_SIZE.x, TILE_SIZE.y
              )
            ctx.restore()
          },

          thing(thing) {
            ctx.drawImage(thing.sprite, thing.pos.x, thing.pos.y)
          },

          track(player, cb) {
            const { center } = gameSize.get()
            ctx.save()
              topLeft = plus_(minus(player.pos, center), HALF_TILE)
              ctx.translate(-topLeft.x, -topLeft.y)
              cb()
              topLeft = VZ
            ctx.restore()
          },

          world(world) {
            const
              min = floor_(divideComponents(topLeft, CHUNK_SIZE)),
              max = floor_(divideComponents_(plus(topLeft, gameSize.get().size), CHUNK_SIZE))
            iter(min, max, v => {
              ctx.drawImage(CHUNK_BG, v.x * CHUNK_SIZE.x, v.y * CHUNK_SIZE.y)
            })
            iter(min, max, v => {
              chunk(world.ensureChunk(v))
            })
          }
        }

      let topLeft = VZ

      cb(drawer)
    })
