import { filterNotNil } from "rocket/data/array"
import { divideComponents, floor_, minus, scaleComponents, V } from "rocket/math/v"

import { Chunk, chunkKey, CHUNK_TILES } from "./chunk"
import { Tile, TILE_SIZE } from "./tile"


export type World = {
  chunks: Record<string, Chunk>
  ensureChunk(v: V): Chunk
  /**
   * @param at the position of the Tile in tile coordinates
   */
  tileGet(at: V): Tile | undefined
  tileSet(at: V, tile: Tile | undefined): void
  /**
   * @param a position of first Tile to be swapped
   * @param b position of second Tile to be swapped
   * @returns a list of transitioning Tiles
   */
  tileSwap(a: V, b: V): Tile[]
}


export const
  World = (): World => {
    const
      moveTile = (tile: Tile | undefined, to: V): Tile | undefined => {
        world.tileSet(to, tile)
        if (tile == null) { return undefined }
        tile.tile = to
        tile.state = {
          t: "transition",
          from: tile.pos,
          prog: 0,
          to: scaleComponents(to, TILE_SIZE),
        }
        return tile
      },

      chunks: Record<string, Chunk> = {},
      world: World = {
        chunks,
        ensureChunk(v) {
          const key = chunkKey(v)
          return chunks[key] || (chunks[key] = Chunk(V(v.x, v.y)))
        },
        tileGet(at) {
          const
            chunkPos = floor_(divideComponents(at, CHUNK_TILES)),
            chunk = chunks[chunkKey(chunkPos)]
          if (chunk == null) { return undefined }
          const dataIndex = minus(at, scaleComponents(chunk.pos, CHUNK_TILES))
          return chunk.data[dataIndex.y][dataIndex.x]
        },
        tileSet(at, tile) {
          const
            chunkPos = floor_(divideComponents(at, CHUNK_TILES)),
            key = chunkKey(chunkPos),
            chunk = chunks[key] ?? (chunks[key] = Chunk(chunkPos)),
            dataIndex = minus(at, scaleComponents(chunk.pos, CHUNK_TILES))
          chunk.data[dataIndex.y][dataIndex.x] = tile
        },
        tileSwap(a, b) {
          const tmp = world.tileGet(a)
          return filterNotNil([
            moveTile(world.tileGet(b), a),
            moveTile(tmp, b),
          ])
        },
      }

    return world
  }