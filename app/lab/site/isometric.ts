/*
 * Isometric sketches
 * ==================================================
 * Solids in isometric projection, for the service illustrations in
 * `./scenes.ts`: a scene is drawn in world units (z up) through a `Pen`,
 * which turns each solid into faces (shaded by how they meet the light),
 * outlines, shadows, and ground, back to front, on a `Surface`. Each
 * direction renders the surface its own way (Stipple dithers it into dots,
 * Gridline draws it as linework), so the illustrations stay the same.
 */

export const clamp = (value: number) => Math.min(1, Math.max(0, value));

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
  /** A patch of ground on the floor, drawn as each renderer likes */
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

export const dot = (a: Vec3, b: Vec3) =>
  a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const sub = (a: Vec3, b: Vec3): Vec3 => [
  a[0] - b[0],
  a[1] - b[1],
  a[2] - b[2]
];
export const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0]
];
export const normalize = (v: Vec3): Vec3 => {
  const length = Math.hypot(...v) || 1;
  return [v[0] / length, v[1] / length, v[2] / length];
};
/** Toward the viewer: the projection looks down this axis */
export const VIEW: Vec3 = normalize([1, 1, 1]);
/** Toward the light: above, in front, a little to the left */
const LIGHT: Vec3 = normalize([0.15, 0.55, 0.82]);

/** A point in the world on the screen: the isometric projection */
export const project = ([x, y, z]: Vec3): Vec2 => [
  (x - y) * 0.866,
  (x + y) * 0.5 - z
];

/** Ink coverage for a face: tops are pale, the right-hand faces darkest */
export const shade = (normal: Vec3) => clamp(0.78 - 0.72 * dot(normal, LIGHT));

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

/* Surfaces
   ========================================================================== */

/** The few 2D operations every solid comes down to */
export interface Surface {
  fill(polygon: Vec2[], tone: number): void;
  stroke(points: Vec2[], dashed?: boolean): void;
  /** A shaded ball, lit from the upper left */
  ball(center: Vec2, radius: number, darken: number, outline: boolean): void;
  /** Shadow on the floor; it only shows on ground and paper */
  shade(polygon: Vec2[]): void;
  ground(center: Vec2, radiusX: number, radiusY: number): void;
}

/** Collects the extent of a scene, to fit it to the frame */
export class Measure implements Surface {
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

/* Pen: solids in world units
   ========================================================================== */

export function penFor(surface: Surface): Pen {
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

/* Drawing helpers
   ========================================================================== */

/** A rectangle on a wall facing +y (the left-hand faces) */
export const onLeft = (
  y: number,
  x0: number,
  x1: number,
  z0: number,
  z1: number
): Vec3[] => [
  [x0, y, z0],
  [x1, y, z0],
  [x1, y, z1],
  [x0, y, z1]
];

/** A rectangle on a wall facing +x (the right-hand faces) */
export const onRight = (
  x: number,
  y0: number,
  y1: number,
  z0: number,
  z1: number
): Vec3[] => [
  [x, y0, z0],
  [x, y1, z0],
  [x, y1, z1],
  [x, y0, z1]
];

/** A rectangle facing up, at height z */
export const onTop = (
  z: number,
  x0: number,
  x1: number,
  y0: number,
  y1: number
): Vec3[] => [
  [x0, y0, z],
  [x1, y0, z],
  [x1, y1, z],
  [x0, y1, z]
];

/** A grid of dark windows on a wall */
export function windows(
  pen: Pen,
  wall: "left" | "right",
  at: number,
  [from, to]: [number, number],
  [bottom, top]: [number, number],
  columns: number,
  rows: number
) {
  const width = (to - from) / columns;
  const height = (top - bottom) / rows;
  for (let column = 0; column < columns; column++) {
    for (let row = 0; row < rows; row++) {
      const a = from + width * (column + 0.25);
      const b = from + width * (column + 0.75);
      const z0 = bottom + height * (row + 0.25);
      const z1 = bottom + height * (row + 0.7);
      pen.face(
        wall === "left" ? onLeft(at, a, b, z0, z1) : onRight(at, a, b, z0, z1),
        {
          tone: 0.95,
          outline: false
        }
      );
    }
  }
}

/** A point on a quadratic curve */
export const bend = (a: Vec3, control: Vec3, b: Vec3, t: number): Vec3 =>
  [0, 1, 2].map(
    (axis) =>
      (1 - t) ** 2 * a[axis] +
      2 * (1 - t) * t * control[axis] +
      t ** 2 * b[axis]
  ) as Vec3;

/**
 * The end of an arrowhead's wing: from the tip, back toward a point on the
 * shaft, turned by `spread` radians as seen on screen
 */
export function flare(
  tip: Vec3,
  toward: Vec3,
  spread: number,
  length: number
): Vec3 {
  // Screen right is (1, -1, 0) / 1.732 in the world, screen up is +z
  const [tx, ty] = project(tip);
  const [bx, by] = project(toward);
  const angle = Math.atan2(by - ty, bx - tx) + spread;
  const sx = Math.cos(angle) * length;
  const sy = Math.sin(angle) * length;
  return [tip[0] + sx / 1.732, tip[1] - sx / 1.732, tip[2] - sy];
}
