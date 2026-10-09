/*
 * Isometric sketches
 * ==================================================
 * A small painter's-algorithm renderer for illustrations: solids in
 * isometric projection, drawn back to front, each face shaded by how it
 * meets the light and outlined in ink, then dithered like the photos. A
 * scene is drawn in world units (z up) and fitted to whatever frame it's
 * given, so the same scene works as a plate or a wide cover.
 */

import { atkinson, fbm, grain, hash, type Levels } from "./dither";

export type Vec2 = [x: number, y: number];
export type Vec3 = [x: number, y: number, z: number];

export interface SolidOptions {
  /** Ink coverage for every face, in place of shading by the light */
  tone?: number;
  /** Added to each face's shaded tone, for darker (or, below 0, paler) stuff */
  darken?: number;
  /** Ink coverage for the top face only */
  top?: number;
  /** Casts a shadow on the ground */
  shadow?: boolean;
  /** Outlined in ink (the default); off for soft things like smoke */
  outline?: boolean;
}

export interface FaceOptions {
  /** Ink coverage; shaded by the light when left out */
  tone?: number;
  /** Outlined in ink (the default) */
  outline?: boolean;
}

export interface Pen {
  /** A patch of stippled sage ground on the floor */
  ground(center: Vec2, radiusX: number, radiusY: number): void;
  /** A solid rising from a convex base, given counterclockwise from above */
  prism(base: Vec2[], z: number, height: number, options?: SolidOptions): void;
  box(at: Vec3, size: Vec3, options?: SolidOptions): void;
  /** A box turned by `angle` radians about its center */
  turnedBox(at: Vec3, size: Vec3, angle: number, options?: SolidOptions): void;
  cylinder(
    at: Vec3,
    radius: number,
    height: number,
    options?: SolidOptions
  ): void;
  cone(at: Vec3, radius: number, height: number, options?: SolidOptions): void;
  sphere(center: Vec3, radius: number, options?: SolidOptions): void;
  /** A flat polygon anywhere in space */
  face(points: Vec3[], options?: FaceOptions): void;
  line(points: Vec3[], options?: { dashed?: boolean }): void;
}

export type Scene = (pen: Pen) => void;

/* Geometry
   ========================================================================== */

const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0]
];
const normalize = (v: Vec3): Vec3 => {
  const length = Math.hypot(...v) || 1;
  return [v[0] / length, v[1] / length, v[2] / length];
};
const clamp = (value: number) => Math.min(1, Math.max(0, value));

/** Toward the viewer: the projection looks down this axis */
const VIEW: Vec3 = normalize([1, 1, 1]);
/** Toward the light: above, in front, a little to the left */
const LIGHT: Vec3 = normalize([0.15, 0.55, 0.82]);

const project = ([x, y, z]: Vec3): Vec2 => [(x - y) * 0.866, (x + y) * 0.5 - z];

/** Ink coverage for a face: tops are pale, the right-hand faces darkest */
const shade = (normal: Vec3) => clamp(0.78 - 0.72 * dot(normal, LIGHT));

/** Where a point's shadow falls on the floor */
const shadowOf = ([x, y, z]: Vec3): Vec3 => [
  x - (LIGHT[0] / LIGHT[2]) * z,
  y - (LIGHT[1] / LIGHT[2]) * z,
  0
];

/** The convex hull of some points on the floor (monotone chain) */
function hull(points: Vec2[]) {
  const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const turn = (o: Vec2, a: Vec2, b: Vec2) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (list: Vec2[]) => {
    const chain: Vec2[] = [];
    for (const point of list) {
      while (
        chain.length >= 2 &&
        turn(chain[chain.length - 2], chain[chain.length - 1], point) <= 0
      ) {
        chain.pop();
      }
      chain.push(point);
    }
    chain.pop();
    return chain;
  };
  return [...half(sorted), ...half([...sorted].reverse())];
}

export const rect = (
  x: number,
  y: number,
  width: number,
  depth: number
): Vec2[] => [
  [x, y],
  [x + width, y],
  [x + width, y + depth],
  [x, y + depth]
];

export const circle = (
  cx: number,
  cy: number,
  radius: number,
  sides = 40
): Vec2[] =>
  Array.from({ length: sides }, (_, index) => {
    const angle = (index / sides) * Math.PI * 2;
    return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
  });

/* Drawing surfaces
   ========================================================================== */

// What each cell holds
const EMPTY = 0;
const FILL = 1;
const INK = 2;
const GROUND = 3;

/** The few 2D operations every solid comes down to */
interface Surface {
  fill(polygon: Vec2[], tone: number): void;
  stroke(points: Vec2[], dashed?: boolean): void;
  /** A shaded ball, lit from the upper left */
  ball(center: Vec2, radius: number, darken: number, outline: boolean): void;
  /** Shadow on the floor; it only shows on ground and paper */
  shade(polygon: Vec2[]): void;
  ground(center: Vec2, radiusX: number, radiusY: number): void;
}

/** Collects the extent of a scene, to fit it to the frame */
class Measure implements Surface {
  left = Infinity;
  right = -Infinity;
  top = Infinity;
  bottom = -Infinity;

  add([x, y]: Vec2) {
    this.left = Math.min(this.left, x);
    this.right = Math.max(this.right, x);
    this.top = Math.min(this.top, y);
    this.bottom = Math.max(this.bottom, y);
  }

  fill(polygon: Vec2[]) {
    polygon.forEach((point) => this.add(point));
  }
  stroke(points: Vec2[]) {
    points.forEach((point) => this.add(point));
  }
  ball([x, y]: Vec2, radius: number) {
    this.add([x - radius, y - radius]);
    this.add([x + radius, y + radius]);
  }
  shade() {}
  ground() {}
}

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

/* Pen: solids in world units
   ========================================================================== */

function penFor(surface: Surface): Pen {
  const prism: Pen["prism"] = (base, z, height, options = {}) => {
    const { tone, darken = 0, shadow } = options;
    const bottom = base.map(([x, y]): Vec3 => [x, y, z]);
    const top = base.map(([x, y]): Vec3 => [x, y, z + height]);

    if (shadow) {
      surface.shade(
        hull([...bottom, ...top].map(shadowOf).map((p) => project(p)))
      );
    }

    const count = base.length;
    const normals = base.map(([x0, y0], index): Vec3 => {
      const [x1, y1] = base[(index + 1) % count];
      return normalize([y1 - y0, -(x1 - x0), 0]);
    });
    const visible = normals.map((normal) => dot(normal, VIEW) > 1e-6);

    for (let index = 0; index < count; index++) {
      if (!visible[index]) continue;
      const next = (index + 1) % count;
      surface.fill(
        [bottom[index], bottom[next], top[next], top[index]].map(project),
        tone ?? clamp(shade(normals[index]) + darken)
      );
    }
    surface.fill(
      top.map(project),
      options.top ?? tone ?? clamp(shade([0, 0, 1]) + darken)
    );

    // Outline: the top, the foot of each visible side, and each corner
    // that is a silhouette or a sharp turn
    surface.stroke([...top, top[0]].map(project));
    for (let index = 0; index < count; index++) {
      const next = (index + 1) % count;
      if (visible[index])
        surface.stroke([bottom[index], bottom[next]].map(project));
      const previous = (index - 1 + count) % count;
      const silhouette = visible[index] !== visible[previous];
      const sharp =
        visible[index] &&
        visible[previous] &&
        dot(normals[index], normals[previous]) < 0.9;
      if (silhouette || sharp) {
        surface.stroke([bottom[index], top[index]].map(project));
      }
    }
  };

  const face: Pen["face"] = (points, { tone, outline = true } = {}) => {
    let normal = normalize(
      cross(sub(points[1], points[0]), sub(points[2], points[0]))
    );
    if (dot(normal, VIEW) < 0) normal = [-normal[0], -normal[1], -normal[2]];
    const polygon = points.map(project);
    surface.fill(polygon, tone ?? shade(normal));
    if (outline) surface.stroke([...polygon, polygon[0]]);
  };

  return {
    ground: (center, radiusX, radiusY) =>
      surface.ground(center, radiusX, radiusY),
    prism,
    box: ([x, y, z], [width, depth, height], options) =>
      prism(rect(x, y, width, depth), z, height, options),
    turnedBox: ([x, y, z], [width, depth, height], angle, options) => {
      const cx = x + width / 2;
      const cy = y + depth / 2;
      const turn = ([px, py]: Vec2): Vec2 => [
        cx + (px - cx) * Math.cos(angle) - (py - cy) * Math.sin(angle),
        cy + (px - cx) * Math.sin(angle) + (py - cy) * Math.cos(angle)
      ];
      prism(rect(x, y, width, depth).map(turn), z, height, options);
    },
    cylinder: ([x, y, z], radius, height, options) =>
      prism(circle(x, y, radius), z, height, options),
    cone: ([x, y, z], radius, height, { tone, darken = 0, shadow } = {}) => {
      const base = circle(x, y, radius, 32);
      const apex: Vec3 = [x, y, z + height];
      if (shadow) {
        surface.shade(
          hull(
            [...base.map(([bx, by]): Vec3 => [bx, by, z]), apex]
              .map(shadowOf)
              .map(project)
          )
        );
      }
      const sides = base.map(([x0, y0], index) => {
        const [x1, y1] = base[(index + 1) % base.length];
        const a: Vec3 = [x0, y0, z];
        const b: Vec3 = [x1, y1, z];
        const normal = normalize(cross(sub(b, a), sub(apex, a)));
        return { a, b, normal, visible: dot(normal, VIEW) > 0 };
      });
      for (const side of sides) {
        if (!side.visible) continue;
        surface.fill(
          [side.a, side.b, apex].map(project),
          tone ?? clamp(shade(side.normal) + darken)
        );
        surface.stroke([side.a, side.b].map(project));
      }
      sides.forEach((side, index) => {
        const previous = sides[(index - 1 + sides.length) % sides.length];
        if (side.visible !== previous.visible) {
          surface.stroke([side.a, apex].map(project));
        }
      });
    },
    sphere: (center, radius, { darken = 0, shadow, outline = true } = {}) => {
      if (shadow) {
        surface.shade(
          hull(
            circle(center[0], center[1], radius, 24).map(([x, y]) =>
              project(shadowOf([x, y, center[2]]))
            )
          )
        );
      }
      // An orthographic sphere is a circle 1.2247× its radius
      surface.ball(project(center), radius * 1.2247, darken, outline);
    },
    face,
    line: (points, { dashed } = {}) =>
      surface.stroke(points.map(project), dashed)
  };
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
