import { size as sizeAttr } from "rocket/browser/attr"
import { apd } from "rocket/browser/core"
import { canvas, div } from "rocket/browser/elt"
import { match, matchIf } from "rocket/browser/match"
import { mount } from "rocket/browser/mount"
import { $ } from "rocket/browser/prop"
import { size as sizeStyle, transform, transformOrigin } from "rocket/browser/style"
import { Visible } from "rocket/browser/visible"
import { WindowSize } from "rocket/browser/window"
import { float } from "rocket/math/random"
import { divide, eq, floor_, interpolateLinear, len, minus, plus_, round_, scale, scaleComponents, scale_, unitOfAng, V, VE, VN, VS, VW } from "rocket/math/v"
import { mix } from "rocket/mix"
import { derive } from "rocket/prop/derive"
import { Prop } from "rocket/prop/prop"

import { GameAudio } from "./audio/game-audio"
import { withDrawer } from "./game/drawer"
import { Enemy, ENEMY_WAIT_SEC, SmokeParticle, stepEnemy, SwallowParticles } from "./game/enemy"
import { GameSize } from "./game/game-size"
import { GoalParticle } from "./game/goal"
import { GameKeys, KC_DOWN, KC_LEFT, KC_RIGHT, KC_UP } from "./game/keys"
import { Player, PLAYER_TRANSITION_SEC } from "./game/player"
import { PreGameFade } from "./game/pre-game-fade"
import { Round } from "./game/round"
import { ScoreParticle } from "./game/score"
import { State } from "./game/state"
import { Tile, TileParticles, TILE_FLASH_SEC, TILE_SIZE } from "./game/tile"
import { World } from "./game/world"
import { $relative } from "./style/threes.gen"
import { HUD } from "./ui/hud"
import { Title } from "./ui/title"
import { YouDied } from "./ui/you-died"


mount(document.body, () => {
  const
    findNeighbors = (world: World, fill: string, at: V, neighbors: Tile[]): Tile[] => {
      const tile = world.tileGet(at)
      if (
        tile == null
        || tile.fill !== fill
        /** NOTE: include "transition" as a viable state to handle case where tile slides along a same-colored chunk */
        || tile.state.t === "dying"
        || neighbors.includes(tile)
      ) {
        return neighbors
      }
      neighbors.push(tile)
      findNeighbors(world, fill, VN(at), neighbors)
      findNeighbors(world, fill, VW(at), neighbors)
      findNeighbors(world, fill, VE(at), neighbors)
      findNeighbors(world, fill, VS(at), neighbors)
      return neighbors
    },

    getDarkness = (enemy: Enemy, player: Player) =>
      Math.min(Math.max(0, (11 * TILE_SIZE.x - len(minus(enemy.pos, player.pos))) / (11 * TILE_SIZE.x)), 1),

    getNoiseLevel = (state: State) => {
      if (state.t !== "play") { return 0 }
      const { enemy, player } = state.round
      if (enemy == null) { return 0 }
      const diff = minus(player.tile, enemy.tile)
      return Math.min(Math.max(0, (10 -  (Math.abs(diff.x) + Math.abs(diff.y))) / 10), 1)
    },

    step = (dt: number, round: Round) => {
      const
        addChunk = (fill: string, at: V) => {
          if (changeChunks.some(list => list.some(tile => eq(tile.pos, at)))) { return }
          changeChunks.push(findNeighbors(world, fill, at, []))
        },

        endGame = (round: Round) => {
          state.set({ t: "end", round })
        },

        stepPlayer = (d: V) => {
          if ((d.x && d.y) || (!d.x && !d.y)) { return }
          const
            oldPos = player.tile,
            newPos = plus_(d, player.tile),
            tile = world.tileGet(newPos)
          if (tile != null && tile.state.t === "dying") { return }

          const oldChunk = tile != null ? findNeighbors(world, tile.fill, tile.tile, []) : []
          transitioningTiles.push(...world.tileSwap(player.tile, newPos))
          const sameChunk = tile != null ?
            findNeighbors(world, tile.fill, tile.tile, [])
              .some(nu => oldChunk.some(old => eq(old.tile, nu.tile)))
          : false
          player.tile = newPos
          player.state = {
            t: "transition",
            from: player.pos,
            prog: 0,
            to: scaleComponents(player.tile, TILE_SIZE),
          }
          round.moved = true

          if (tile != null) {
            [VN(newPos), VE(newPos), VW(newPos), VS(newPos)].forEach(at => {
              if (eq(at, oldPos)) { return }
              if (changeChunks.some(list => list.some(tile => eq(tile.pos, at)))) { return }
              const neighbors = findNeighbors(world, tile.fill, at, [])
              // moving tile is part of the same chunk before and after
              // so punt on processing till it lands
              if (sameChunk && neighbors.includes(tile)) { return }
              changeChunks.push(neighbors)
              addChunk(tile.fill, at)
            })
          }

          if (eq(player.tile, goal.tile)) {
            particles.push(GoalParticle(goal))
            goal.tile = plus_(round_(scale_(unitOfAng(float(0, 2 * Math.PI)), 8)), player.tile)
            goal.pos = scaleComponents(goal.tile, TILE_SIZE)
            world.tileSet(goal.tile, undefined)
            round.score.set(round.score.get() + 100)
            round.ttl.set(round.ttl.get() + 10)
            audio.coin()
          } else if (round.enemy != null && eq(player.tile, round.enemy.tile)) {
            endGame(round)
          } else {
            audio.slide(1)
          }
        },

        changeChunks: Tile[][] = [],

        _state = state.get(),
        // don't pull out enemy because it might get set during this function!
        { goal, particles, player, world } = round

      if (_state.t === "play" && player.state.t === "idle" && dyingTiles.length === 0) {
        stepPlayer(V(+KEY_RIGHT.down() - +KEY_LEFT.down(), +KEY_DOWN.down() - +KEY_UP.down()))
      }

      if (_state.t === "play") {
        round.time.set(round.time.get() + dt)
        round.ttl.set(Math.max(round.ttl.get() - dt, 0))
        if (round.enemy == null && round.ttl.get() <= 0) {
          round.enemy = Enemy(player)
        }
        if (round.enemy != null && stepEnemy(audio, round.enemy, player, round.ttl.get() <= 0, dt)) {
          endGame(round)
        }
      }
      if (round.enemy != null) {
        particles.push(SmokeParticle(round.enemy))
      }

      /**
       * Update Transitions
       **/
      if (stepTransition(player, dt, PLAYER_TRANSITION_SEC)) {
        player.state = { t: "idle" }
      }

      if (round.enemy != null && stepTransition(round.enemy, dt, (PLAYER_TRANSITION_SEC * round.enemy.waitSec / ENEMY_WAIT_SEC))) {
        if (_state.t !== "play") { // final transition to capture the player, so we out
          round.enemy = undefined
          particles.push(...SwallowParticles(round.player.pos))
        } else {
          round.enemy.state = { t: "idle", prog: 0 }
        }
      }

      transitioningTiles.forEach(tile => {
        if (!stepTransition(tile, dt, PLAYER_TRANSITION_SEC)) { return }
        tile.state = { t: "idle" }
        addChunk(tile.fill, tile.tile)
      })
      transitioningTiles = transitioningTiles.filter(tile => tile.state.t === "transition")

      changeChunks.forEach(changes => {
        if (changes.length === 0 || changes.length % 3 !== 0) { return }
        const score = Math.pow(changes.length / 3, 2) * 10
        round.score.set(round.score.get() + score)
        particles.push(ScoreParticle(changes, score))
        changes.forEach(tile => {
          tile.state = { t: "dying", prog: 0 }
          dyingTiles.push(tile)
        })
        if (round.enemy == null) {
          round.enemy = Enemy(player)
        } else {
          round.enemy.boosts += changes.length * 2
          round.enemy.waitSec = .99 * round.enemy.waitSec
        }
        audio.buzz(changes.length / 3)
      })

      dyingTiles.forEach(tile => {
        if (tile.state.t !== "dying") { return } // for TS. this should never actually be true
        tile.state.prog += dt
        if (tile.state.prog >= TILE_FLASH_SEC) {
          world.tileSet(tile.tile, undefined)
          tile.state = { t: "idle" }
          particles.push(...TileParticles(tile))
        }
      })
      dyingTiles = dyingTiles.filter(tile => tile.state.t === "dying")

      particles.forEach(part => {
        part.life -= dt
        part.pos = plus_(scale(part.vel, dt), part.pos)
      })
      round.particles = particles.filter(part => part.life > 0)
    },

    /**
     * @returns true when the thing has finished transitioning
     */
    stepTransition = (thing: Enemy | Player | Tile, dt: number, transitionSec: number): boolean => {
      if (thing.state.t !== "transition") { return false }
      thing.state.prog += dt
      const frac = thing.state.prog / transitionSec
      if (frac > 1) {
        thing.pos = thing.state.to
        return true
      }
      thing.pos = interpolateLinear(thing.state.from, thing.state.to, frac)
      return false
    },

    visible = Visible(),

    audio = GameAudio(visible),

    gameKeys = GameKeys(document.body),
    KEY_DOWN = gameKeys.Key(KC_DOWN),
    KEY_LEFT = gameKeys.Key(KC_LEFT),
    KEY_RIGHT = gameKeys.Key(KC_RIGHT),
    KEY_UP = gameKeys.Key(KC_UP),

    windowSize = WindowSize(),
    gameSize = derive(windowSize, (windowSize): GameSize => {
      const
        zoom = Math.max(1, Math.min(Math.floor(windowSize.x / 256), Math.floor(windowSize.y / 256))),
        size = divide(windowSize, zoom)

      return {
        center: floor_(divide(size, 2)),
        size,
        zoom,
      }
    }),

    state = Prop<State>({ t: "title" }),
    round = derive(state, state => state.t === "title" ? undefined : state.round)

  let
    dyingTiles: Tile[] = [],
    transitioningTiles: Tile[] = []

  visible.visible.listen(visible => {
    const _state = state.get()
    if (_state.t === "play" && !visible) {
      _state.paused.set(true)
    }
  })

  return apd(
    div($relative, transformOrigin("top left"), $(gameSize, ({ size, zoom }) => mix<HTMLDivElement>(
      sizeStyle(`${size.x}px`, `${size.y}px`),
      transform(`scale(${zoom})`)
    )), apd(
      matchIf(round, round =>
        div($relative, apd(
          canvas($(gameSize, ({ size }) => mix<HTMLCanvasElement>(
            sizeAttr(size.x, size.y),
          )), withDrawer(gameSize, drawer => {
            visible.raf(() => {
              const _state = state.get()
              if (_state.t === "play" && _state.paused.get()) {
                audio.noiseLevel.set(0)
                return
              }

              gameKeys.step()

              step(1 / 60, round)

              // pull out enemy after step so that if it gets added during step, we catch it
              const { enemy, goal, particles, player, world } = round

              drawer.clear()
              drawer.track(player, () => {
                drawer.world(world)
                drawer.player(goal)
                // NOTE: if _state !== "play", it's game over.
                // if the enemy is null, player has been eaten and should not be drawn
                if (_state.t !== "end" || enemy != null) { drawer.player(player) }
                if (_state.t === "play" && enemy != null) { drawer.player(enemy) }
                drawer.particles(particles)
              })
              if (_state.t === "play" && enemy != null) {
                drawer.darkness(getDarkness(enemy, player))
              }
              audio.noiseLevel.set(getNoiseLevel(_state))
            })
          }))
        ))
      ),
      match(state, _state =>
        _state.t === "end" ?
          YouDied(audio, _state.round, {
            menu() {
              state.set({ t: "title" })
            },
            retry() {
              state.set({ t: "prePlay", round: Round() })
            },
          })
        : _state.t === "title" ?
          Title(audio, {
            play() {
              state.set({ t: "prePlay", round: Round() })
            }
          })
        : _state.t === "play" ?
          HUD(audio, _state.paused, _state.round)
        :
          PreGameFade({
            play() {
              state.set({ t: "play", paused: Prop(false), round: _state.round })
            }
          })
      )
    ))
  )
})
