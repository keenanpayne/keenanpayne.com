/*
 * Isometric sketches, in dots
 * ==================================================
 * Draws the shared isometric scenes (`../../site/isometric.ts`) into cells,
 * each face shaded by how it meets the light and outlined in ink, then
 * dithered like the photos. A scene is fitted to whatever frame it's given,
 * so the same scene works as a plate or a wide cover.
 */

import {
  dot,
  Measure,
  normalize,
  penFor,
  type Scene,
  type Surface,
  type Vec2,
  type Vec3
} from "../../site/isometric";

import { atkinson, clamp, fbm, grain, hash, type Levels } from "./dither";

/* Drawing surfaces
   ========================================================================== */

// What each cell holds
const EMPTY = 0;
const FILL = 1;
const INK = 2;
const GROUND = 3;

/** Rasterizes into cells, after mapping scene units to cells */
class Raster implements Surface {
  kind: Uint8Array;
  tone: Float32Array;
  shadow: Uint8Array;
  width: number;
  height: number;
  scale: number;
  offsetX: number;
  offsetY: number;
  seed: number;

  constructor(
    width: number,
    height: number,
    scale: number,
    offsetX: number,
    offsetY: number,
    seed: number
  ) {
    this.width = width;
    this.height = height;
    this.scale = scale;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.seed = seed;
    this.kind = new Uint8Array(width * height);
    this.tone = new Float32Array(width * height);
    this.shadow = new Uint8Array(width * height);
  }

  toCell = ([x, y]: Vec2): Vec2 => [
    x * this.scale + this.offsetX,
    y * this.scale + this.offsetY
  ];

  /** Calls back with every cell whose center is inside a polygon */
  scan(polygon: Vec2[], each: (index: number) => void) {
    const cells = polygon.map(this.toCell);
    const top = Math.max(0, Math.floor(Math.min(...cells.map((p) => p[1]))));
    const bottom = Math.min(
      this.height - 1,
      Math.ceil(Math.max(...cells.map((p) => p[1])))
    );
    for (let row = top; row <= bottom; row++) {
      const y = row + 0.5;
      const crossings: number[] = [];
      for (let index = 0; index < cells.length; index++) {
        const [x0, y0] = cells[index];
        const [x1, y1] = cells[(index + 1) % cells.length];
        if (y0 <= y !== y1 <= y) {
          crossings.push(x0 + ((y - y0) / (y1 - y0)) * (x1 - x0));
        }
      }
      crossings.sort((a, b) => a - b);
      for (let pair = 0; pair + 1 < crossings.length; pair += 2) {
        const from = Math.max(0, Math.ceil(crossings[pair] - 0.5));
        const to = Math.min(
          this.width - 1,
          Math.floor(crossings[pair + 1] - 0.5)
        );
        for (let column = from; column <= to; column++) {
          each(row * this.width + column);
        }
      }
    }
  }

  fill(polygon: Vec2[], tone: number) {
    this.scan(polygon, (index) => {
      this.kind[index] = FILL;
      this.tone[index] = tone;
    });
  }

  stroke(points: Vec2[], dashed = false) {
    const cells = points.map(this.toCell);
    let step = 0;
    for (let index = 0; index + 1 < cells.length; index++) {
      const [x0, y0] = cells[index];
      const [x1, y1] = cells[index + 1];
      const count = Math.max(
        1,
        Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 2)
      );
      for (let at = 0; at <= count; at++, step++) {
        // Dashes: three cells on, two off (two steps a cell)
        if (dashed && step % 10 >= 6) continue;
        const column = Math.floor(x0 + ((x1 - x0) * at) / count);
        const row = Math.floor(y0 + ((y1 - y0) * at) / count);
        if (
          column < 0 ||
          row < 0 ||
          column >= this.width ||
          row >= this.height
        ) {
          continue;
        }
        this.kind[row * this.width + column] = INK;
      }
    }
  }

  ball(center: Vec2, radius: number, darken: number, outline: boolean) {
    const [cx, cy] = this.toCell(center);
    const r = radius * this.scale;
    const light: Vec3 = normalize([-0.45, -0.55, 0.7]);
    for (let row = Math.floor(cy - r); row <= Math.ceil(cy + r); row++) {
      for (
        let column = Math.floor(cx - r);
        column <= Math.ceil(cx + r);
        column++
      ) {
        if (
          column < 0 ||
          row < 0 ||
          column >= this.width ||
          row >= this.height
        ) {
          continue;
        }
        const dx = (column + 0.5 - cx) / r;
        const dy = (row + 0.5 - cy) / r;
        const inside = 1 - dx * dx - dy * dy;
        if (inside < 0) continue;
        const index = row * this.width + column;
        // A ring of ink at the rim
        if (outline && inside < 2.4 / r) {
          this.kind[index] = INK;
          continue;
        }
        const lit = Math.max(0, dot([dx, dy, Math.sqrt(inside)], light));
        this.kind[index] = FILL;
        this.tone[index] = clamp(0.8 - 0.75 * lit + darken);
      }
    }
  }

  shade(polygon: Vec2[]) {
    this.scan(polygon, (index) => {
      this.shadow[index] = 1;
    });
  }

  ground(center: Vec2, radiusX: number, radiusY: number) {
    // Back from cells to the floor, to measure against the ellipse there
    for (let row = 0; row < this.height; row++) {
      for (let column = 0; column < this.width; column++) {
        const screenX = (column + 0.5 - this.offsetX) / this.scale;
        const screenY = (row + 0.5 - this.offsetY) / this.scale;
        const across = screenX / 0.866;
        const x = (across + 2 * screenY) / 2;
        const y = (2 * screenY - across) / 2;
        const distance = Math.hypot(
          (x - center[0]) / radiusX,
          (y - center[1]) / radiusY
        );
        if (distance > 1.4) continue;
        const ragged =
          distance + (fbm(column / 14, row / 14, this.seed) - 0.5) * 0.7;
        const density = clamp((1 - ragged) * 1.6) * 0.72;
        const index = row * this.width + column;
        if (
          density > grain(column, row, this.seed) &&
          this.kind[index] === EMPTY
        ) {
          this.kind[index] = GROUND;
        }
      }
    }
  }
}

/* Rendering
   ========================================================================== */

/**
 * Draws a scene into a grid of dot levels: 1 for sage ground, 2 for the
 * midtone ink, and 3 for full ink. On a dark scheme the ink is light and
 * the drawing reads as a negative, like chalk on a blackboard: pale things
 * go dark and ink marks stay legible on them.
 */
export function sketch(
  scene: Scene,
  width: number,
  height: number,
  dark: boolean,
  seed: number
): Levels {
  const measure = new Measure();
  scene(penFor(measure));

  const margin = Math.min(width, height) * 0.08;
  const scale = Math.min(
    (width - margin * 2) / (measure.right - measure.left),
    (height - margin * 2) / (measure.bottom - measure.top)
  );
  const raster = new Raster(
    width,
    height,
    scale,
    width / 2 - ((measure.left + measure.right) / 2) * scale,
    height / 2 - ((measure.top + measure.bottom) / 2) * scale,
    seed
  );
  scene(penFor(raster));

  const { kind, tone, shadow } = raster;
  const coverage = new Float32Array(width * height);
  for (let index = 0; index < coverage.length; index++) {
    if (kind[index] === FILL) {
      coverage[index] = dark ? tone[index] * 0.85 : tone[index];
    } else if (shadow[index] && kind[index] !== INK) {
      coverage[index] = dark ? 0.2 : 0.3;
    }
  }

  const tones = atkinson(coverage, width, height);
  const levels = new Uint8Array(width * height);
  for (let index = 0; index < levels.length; index++) {
    if (kind[index] === INK) {
      levels[index] = 3;
    } else if (kind[index] === FILL || shadow[index]) {
      levels[index] = tones[index] && tones[index] + 1;
    } else if (kind[index] === GROUND) {
      levels[index] = 1;
    }
  }

  // A little stray grain off the edges, so shapes don't look cut out
  for (let index = 0; index < levels.length; index++) {
    if (!levels[index] && hash(index, 5, seed) < 0.0012) levels[index] = 2;
  }

  return levels;
}
