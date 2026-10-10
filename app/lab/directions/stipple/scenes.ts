/*
 * Service illustrations
 * ==================================================
 * One isometric scene for each service, keyed by the last segment of its
 * URL. A service without a scene here gets generated terrain instead.
 * Solids are drawn back to front: the farther from the viewer (the smaller
 * x + y), the earlier.
 */

import type { Pen, Scene, Vec3 } from "./iso";

/** A rectangle on a wall facing +y (the left-hand faces) */
const onLeft = (
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
const onRight = (
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
const onTop = (
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
function windows(
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
const bend = (a: Vec3, control: Vec3, b: Vec3, t: number): Vec3 =>
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
function flare(tip: Vec3, toward: Vec3, spread: number, length: number): Vec3 {
  // Screen right is (1, -1, 0) / 1.732 in the world, screen up is +z
  const screen = ([x, y, z]: Vec3) => [(x - y) * 0.866, (x + y) * 0.5 - z];
  const [tx, ty] = screen(tip);
  const [bx, by] = screen(toward);
  const angle = Math.atan2(by - ty, bx - tx) + spread;
  const sx = Math.cos(angle) * length;
  const sy = Math.sin(angle) * length;
  return [tip[0] + sx / 1.732, tip[1] - sx / 1.732, tip[2] - sy];
}

/* Web development: a tower going up, floor by floor
   ========================================================================== */

const construction: Scene = (pen) => {
  pen.ground([4, 4.4], 5, 4.2);

  // Crane: counterweight, mast, braced
  pen.box([-2.0, 3.85, 7.6], [0.8, 0.7, 0.6], { darken: 0.2 });
  pen.line([
    [0.55, 4.2, 8.2],
    [-1.6, 4.2, 8.2]
  ]);
  pen.box([0.3, 3.95, 0], [0.5, 0.5, 8.2], { shadow: true });
  for (let z = 0.4; z < 7.8; z += 0.9) {
    pen.line([
      [0.3, 4.45, z],
      [0.8, 4.45, z + 0.9]
    ]);
    pen.line([
      [0.8, 3.95, z],
      [0.8, 4.45, z + 0.9]
    ]);
  }

  // Site slab, then the finished floors
  pen.box([1.6, 1.6, 0], [5.6, 5.6, 0.35], { shadow: true });
  pen.box([2.6, 2.6, 0.35], [3.2, 3.2, 3.6], { shadow: true });
  windows(pen, "right", 5.8, [2.6, 5.8], [0.35, 3.95], 3, 3);
  windows(pen, "left", 5.8, [2.6, 5.8], [0.35, 3.95], 3, 3);

  // The floor going up: bare frame
  const corners: [number, number][] = [
    [2.6, 2.6],
    [5.8, 2.6],
    [5.8, 5.8],
    [2.6, 5.8]
  ];
  for (const [x, y] of corners) {
    pen.line([
      [x, y, 3.95],
      [x, y, 5.6]
    ]);
  }
  pen.line([...corners, corners[0]].map(([x, y]): Vec3 => [x, y, 5.6]));
  pen.line([
    [2.6, 5.8, 4.8],
    [5.8, 5.8, 4.8],
    [5.8, 2.6, 4.8]
  ]);

  // A block on its way down, from the jib
  pen.box([3.7, 3.7, 6.3], [1, 1, 0.6], { darken: 0.1 });
  pen.line([
    [4.2, 4.2, 6.9],
    [4.2, 4.2, 7.8]
  ]);
  for (const z of [7.8, 8.2]) {
    pen.line([
      [0.55, 4.2, z],
      [6.2, 4.2, z]
    ]);
  }
  for (let x = 0.55; x < 6.2; x += 0.8) {
    pen.line([
      [x, 4.2, 7.8],
      [x + 0.4, 4.2, 8.2],
      [x + 0.8, 4.2, 7.8]
    ]);
  }

  // Materials waiting on the slab
  pen.box([2.0, 6.3, 0.35], [0.8, 0.8, 0.8]);
  pen.box([5.0, 6.2, 0.35], [2.0, 0.3, 0.3]);
  pen.box([5.0, 6.6, 0.35], [2.0, 0.3, 0.3]);
  pen.box([5.0, 6.4, 0.65], [2.0, 0.3, 0.3]);
};

/* User interface design: a board with an interface sketched on it
   ========================================================================== */

const interfaceBoard: Scene = (pen) => {
  pen.ground([3.8, 4.4], 4.6, 3.2);

  pen.box([1.6, 3.6, 0], [0.3, 0.3, 0.7]);
  pen.box([5.8, 3.6, 0], [0.3, 0.3, 0.7]);
  pen.box([1.0, 3.5, 0.7], [5.6, 0.4, 4.0], { shadow: true });

  // The interface, on the board's face
  const y = 3.9;
  pen.face(onLeft(y, 1.25, 6.35, 4.15, 4.45), { tone: 0.7 });
  for (const x of [1.45, 1.7, 1.95]) {
    pen.face(onLeft(y, x, x + 0.13, 4.24, 4.36), { tone: 0, outline: false });
  }
  // An image, with its mountain and sun
  pen.face(onLeft(y, 1.35, 3.55, 1.75, 3.85), { tone: 0.3 });
  pen.face(
    [
      [1.35, y, 1.75],
      [2.25, y, 2.95],
      [2.75, y, 2.4],
      [3.55, y, 3.3],
      [3.55, y, 1.75]
    ],
    { tone: 0.75 }
  );
  pen.face(
    Array.from({ length: 12 }, (_, index): Vec3 => {
      const angle = (index / 12) * Math.PI * 2;
      return [3.05 + 0.2 * Math.cos(angle), y, 3.45 + 0.2 * Math.sin(angle)];
    }),
    { tone: 0.05 }
  );
  // A heading and text
  pen.face(onLeft(y, 3.85, 6.0, 3.6, 3.85), { tone: 1, outline: false });
  [2.3, 2.05, 2.3, 1.4].forEach((length, index) => {
    const z = 3.3 - index * 0.3;
    pen.line([
      [3.85, y, z],
      [3.85 + length, y, z]
    ]);
  });
  // A button, and the pointer about to press it
  pen.face(onLeft(y, 3.85, 5.15, 1.75, 2.15), { tone: 0.95 });
  pen.face(
    [
      [4.95, y, 1.95],
      [4.95, y, 1.2],
      [5.12, y, 1.37],
      [5.27, y, 1.07],
      [5.39, y, 1.13],
      [5.25, y, 1.43],
      [5.5, y, 1.43]
    ],
    { tone: 0.02 }
  );

  // A pencil on the floor
  pen.box([1.2, 5.4, 0], [0.5, 0.32, 0.32], { darken: 0.3 });
  pen.box([1.7, 5.4, 0], [3.2, 0.32, 0.32]);
  pen.face(
    [
      [4.9, 5.4, 0.32],
      [4.9, 5.72, 0.32],
      [5.6, 5.56, 0.16]
    ],
    { tone: 0.1 }
  );
  pen.face(
    [
      [4.9, 5.72, 0],
      [4.9, 5.72, 0.32],
      [5.6, 5.56, 0.16]
    ],
    { tone: 0.35 }
  );
};

/* CMS implementation: a filing cabinet, a drawer open on its folders
   ========================================================================== */

const filingCabinet: Scene = (pen) => {
  pen.ground([3.6, 3.8], 4.2, 3.4);

  pen.box([1.4, 0.8, 0], [2.8, 2.6, 5.2], { shadow: true });
  const front = 3.4;
  for (const [bottom, top] of [
    [3.6, 5.0],
    [0.2, 1.6]
  ]) {
    pen.face(onLeft(front, 1.6, 4.0, bottom, top), { tone: 0.42 });
    pen.face(onLeft(front, 2.4, 3.2, top - 0.45, top - 0.3), {
      tone: 1,
      outline: false
    });
  }

  // The open drawer: its side, its dark inside, its folders, its front
  pen.face(onRight(4.0, front, 5.6, 1.9, 3.4));
  pen.face(onTop(3.4, 1.6, 4.0, front, 5.6), { tone: 0.9 });
  for (let index = 0; index < 5; index++) {
    const y = 3.6 + index * 0.4;
    pen.box([1.75, y, 2.2], [2.1, 0.08, 1.45], { darken: -0.3, top: 0.05 });
    pen.box([1.85 + (index % 3) * 0.6, y, 3.65], [0.55, 0.08, 0.22], {
      darken: -0.3,
      top: 0.05
    });
  }
  pen.face(onLeft(5.6, 1.6, 4.0, 1.9, 3.4));
  pen.face(onLeft(5.6, 2.4, 3.2, 2.85, 3.0), { tone: 1, outline: false });

  // Documents waiting to be filed
  const paper = { darken: -0.35, top: 0.03 };
  pen.turnedBox([5.0, 3.6, 0], [1.6, 1.2, 0.12], 0.1, paper);
  pen.turnedBox([5.05, 3.65, 0.12], [1.6, 1.2, 0.12], -0.12, paper);
  pen.turnedBox([5.0, 3.6, 0.24], [1.6, 1.2, 0.12], 0.05, paper);
};

/* Rapid prototyping: a small rocket, just off the pad
   ========================================================================== */

const rocket: Scene = (pen) => {
  pen.ground([3, 3], 4.4, 4.4);

  // Gantry, behind the pad
  pen.box([-0.4, 1.4, 0], [0.55, 0.55, 5.2], { shadow: true });
  for (let z = 0.3; z < 5; z += 0.8) {
    pen.line([
      [-0.4, 1.95, z],
      [0.15, 1.95, z + 0.8]
    ]);
    pen.line([
      [0.15, 1.4, z],
      [0.15, 1.95, z + 0.8]
    ]);
  }
  pen.box([0.15, 1.55, 4.4], [1.6, 0.25, 0.2]);

  pen.cylinder([3, 3, 0], 2.1, 0.45, { shadow: true });
  // Exhaust, in soft puffs that run together
  const puff = (x: number, y: number, radius: number) =>
    pen.sphere([x, y, 0.45 + radius * 0.5], radius, {
      darken: -0.45,
      outline: false
    });
  puff(1.5, 2.9, 0.45);
  puff(1.7, 2.1, 0.55);
  puff(2.5, 1.5, 0.5);
  puff(3.4, 1.4, 0.4);

  const fin = (angle: number) => {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    pen.face(
      [
        [3 + 0.7 * c, 3 + 0.7 * s, 3.3],
        [3 + 0.7 * c, 3 + 0.7 * s, 2.2],
        [3 + 1.45 * c, 3 + 1.45 * s, 1.75],
        [3 + 1.45 * c, 3 + 1.45 * s, 2.4]
      ],
      { tone: 0.8 }
    );
  };
  fin((240 * Math.PI) / 180);

  // Flame, flat to the viewer, under the nozzle
  const flame = (points: [number, number][]) =>
    points.map(([u, z]): Vec3 => [3 + 0.707 * u, 3 - 0.707 * u, z]);
  pen.face(
    flame([
      [0, 2.2],
      [0.42, 1.95],
      [0.3, 1.35],
      [0, 0.6],
      [-0.3, 1.35],
      [-0.42, 1.95]
    ]),
    { tone: 0.04 }
  );
  pen.face(
    flame([
      [0, 2.1],
      [0.18, 1.7],
      [0, 1.1],
      [-0.18, 1.7]
    ]),
    { tone: 0.45, outline: false }
  );

  pen.cylinder([3, 3, 2.2], 0.7, 2.8);
  pen.cylinder([3, 3, 4.3], 0.71, 0.3, { darken: 0.3 });
  pen.cone([3, 3, 5.0], 0.7, 1.4);
  // Porthole, facing the viewer
  pen.face(
    Array.from({ length: 14 }, (_, index): Vec3 => {
      const angle = (index / 14) * Math.PI * 2;
      const u = 0.24 * Math.cos(angle);
      return [3.5 - u * 0.707, 3.5 + u * 0.707, 3.6 + 0.24 * Math.sin(angle)];
    }),
    { tone: 0.95 }
  );
  fin(0);
  fin((120 * Math.PI) / 180);

  puff(4.3, 2.4, 0.45);
  puff(4.6, 3.3, 0.55);
  puff(1.8, 3.8, 0.5);
  puff(2.4, 4.4, 0.45);
  puff(4.2, 4.1, 0.6);
  puff(3.2, 4.6, 0.65);
};

/* Design systems: a tray of matching parts, one going into place
   ========================================================================== */

const partsTray: Scene = (pen) => {
  pen.ground([3.6, 2.7], 5.2, 4);

  pen.box([0, 0, 0], [7.2, 5.4, 0.35], { shadow: true });
  for (const x of [1.8, 3.6, 5.4]) {
    pen.line([
      [x, 0, 0.35],
      [x, 5.4, 0.35]
    ]);
  }
  for (const y of [1.8, 3.6]) {
    pen.line([
      [0, y, 0.35],
      [7.2, y, 0.35]
    ]);
  }

  // One kind of part per row, back to front
  const slots = Array.from({ length: 12 }, (_, index) => ({
    column: index % 4,
    row: Math.floor(index / 4)
  })).sort((a, b) => a.column + a.row - (b.column + b.row));
  for (const { column, row } of slots) {
    const x = 0.9 + column * 1.8;
    const y = 0.9 + row * 1.8;
    if (row === 2 && column === 0) {
      // The empty slot, outlined where the last part will land
      pen.line(
        [
          [x - 0.55, y - 0.55, 0.36],
          [x + 0.55, y - 0.55, 0.36],
          [x + 0.55, y + 0.55, 0.36],
          [x - 0.55, y + 0.55, 0.36],
          [x - 0.55, y - 0.55, 0.36]
        ],
        { dashed: true }
      );
      continue;
    }
    if (row === 0) pen.box([x - 0.5, y - 0.5, 0.35], [1, 1, 1]);
    if (row === 1) pen.cylinder([x, y, 0.35], 0.55, 1);
    if (row === 2) pen.sphere([x, y, 0.92], 0.55);
  }

  pen.line(
    [
      [0.9, 4.5, 0.4],
      [0.9, 4.5, 2.2]
    ],
    { dashed: true }
  );
  pen.sphere([0.9, 4.5, 2.85], 0.55);
};

/* Copywriting: a manuscript, an inkwell, and a quill
   ========================================================================== */

const manuscript: Scene = (pen) => {
  pen.ground([3.2, 3.2], 4.4, 3.4);

  // The stack, its sheets, and writing on the top one
  pen.box([0.6, 1.8, 0], [3.8, 2.8, 0.55], { top: 0.03, shadow: true });
  for (const z of [0.18, 0.36]) {
    pen.line([
      [0.6, 4.6, z],
      [4.4, 4.6, z],
      [4.4, 1.8, z]
    ]);
  }
  pen.face(onTop(0.55, 1.0, 3.0, 2.15, 2.35), { tone: 1, outline: false });
  [3.2, 3.0, 3.3, 2.6, 3.1, 1.8].forEach((length, index) => {
    const y = 2.75 + index * 0.3;
    pen.line([
      [1.0, y, 0.55],
      [1.0 + length, y, 0.55]
    ]);
  });

  // A loose page, half written
  const turn = (x: number, y: number): Vec3 => {
    const angle = -0.25;
    return [
      3.0 + x * Math.cos(angle) - y * Math.sin(angle),
      4.9 + x * Math.sin(angle) + y * Math.cos(angle),
      0.01
    ];
  };
  pen.face([turn(0, 0), turn(2.6, 0), turn(2.6, 1.9), turn(0, 1.9)], {
    tone: 0.03
  });
  [2.0, 1.7, 2.1].forEach((length, index) => {
    const y = 0.4 + index * 0.3;
    pen.line([turn(0.3, y), turn(0.3 + length, y)]);
  });

  // Inkwell
  pen.cylinder([5.6, 1.2, 0], 0.85, 0.9, { darken: 0.25, shadow: true });
  pen.cylinder([5.6, 1.2, 0.9], 0.42, 0.35, { darken: 0.25 });

  // Quill, from the well, leaning back over the stack
  const base: Vec3 = [5.55, 1.25, 1.1];
  const tip: Vec3 = [3.1, 0.9, 5.4];
  const along = (t: number): Vec3 => [
    base[0] + (tip[0] - base[0]) * t,
    base[1] + (tip[1] - base[1]) * t,
    base[2] + (tip[2] - base[2]) * t
  ];
  const side: Vec3 = [0.6, -0.6, 0.35];
  const offset = (point: Vec3, width: number): Vec3 => [
    point[0] + side[0] * width,
    point[1] + side[1] * width,
    point[2] + side[2] * width
  ];
  const vane = (t: number) =>
    0.75 * Math.sin((Math.PI * (t - 0.25)) / 0.75) ** 0.8;
  const steps = Array.from(
    { length: 13 },
    (_, index) => 0.25 + (index / 12) * 0.75
  );
  pen.face(
    [
      ...steps.map((t) => offset(along(t), vane(t))),
      ...[...steps].reverse().map((t) => offset(along(t), -vane(t) * 0.55))
    ],
    { tone: 0.12 }
  );
  pen.line([base, tip]);
  for (const t of [0.4, 0.55, 0.7, 0.85]) {
    pen.line([along(t), offset(along(t + 0.08), vane(t + 0.08) * 0.95)]);
  }
};

/* Web performance: a gauge, needle near the top of the dial
   ========================================================================== */

const gauge: Scene = (pen) => {
  pen.ground([3.6, 3.2], 4.6, 3.2);

  pen.box([1.6, 2.0, 0], [4.0, 2.0, 0.8], { shadow: true });
  pen.box([3.3, 2.85, 0.8], [0.6, 0.4, 0.45]);

  const [cx, cz, radius] = [3.6, 3.1, 2.1];
  const onDial = (r: number, angle: number, y = 3.26): Vec3 => [
    cx + r * Math.cos(angle),
    y,
    cz + r * Math.sin(angle)
  ];
  const ring = (r: number, y: number) =>
    Array.from({ length: 48 }, (_, index) =>
      onDial(r, (index / 48) * Math.PI * 2, y)
    );
  const degrees = (value: number) => (value * Math.PI) / 180;

  // Rim, then face
  pen.face(ring(radius, 2.95), { tone: 0.75 });
  pen.face(ring(radius, 3.25), { tone: 0.04 });

  // The red line, from 0° down to -45°
  const arc = Array.from({ length: 9 }, (_, index) =>
    degrees(-45 + index * 5.6)
  );
  pen.face(
    [
      ...arc.map((angle) => onDial(radius * 0.93, angle)),
      ...[...arc].reverse().map((angle) => onDial(radius * 0.74, angle))
    ],
    { tone: 0.75, outline: false }
  );

  // Ticks from 225° round to -45°
  for (let index = 0; index <= 10; index++) {
    const angle = degrees(225 - index * 27);
    const inner = index % 2 ? 0.84 : 0.74;
    pen.line([onDial(radius * inner, angle), onDial(radius * 0.93, angle)]);
  }

  // Needle and hub
  const needle = degrees(-22);
  const across = needle + Math.PI / 2;
  pen.face(
    [
      onDial(0.1, across),
      onDial(radius * 0.82, needle),
      onDial(0.1, across + Math.PI),
      onDial(0.3, needle + Math.PI)
    ],
    { tone: 1 }
  );
  pen.face(ring(0.2, 3.27), { tone: 0.9 });
};

/* Web accessibility: a doorway reached by stairs or by ramp
   ========================================================================== */

const ramp: Scene = (pen) => {
  pen.ground([5.2, 3.2], 6.2, 3.8);

  pen.box([2.4, 0.4, 0], [3.4, 3.4, 2.0], { shadow: true });

  // A small house on the platform, door facing the ramp
  pen.box([3.0, 0.8, 2.0], [2.2, 2.0, 2.0], { shadow: true });
  pen.face(
    [
      [3.0, 2.8, 4.0],
      [5.2, 2.8, 4.0],
      [5.2, 1.8, 4.8],
      [3.0, 1.8, 4.8]
    ],
    { tone: 0.3 }
  );
  pen.face([
    [5.2, 0.8, 4.0],
    [5.2, 2.8, 4.0],
    [5.2, 1.8, 4.8]
  ]);
  pen.face(onRight(5.2, 1.45, 2.15, 2.0, 3.4), { tone: 0.95 });
  pen.face(onLeft(2.8, 3.5, 4.5, 2.7, 3.4), { tone: 0.9, outline: false });

  // Stairs down the front
  for (let step = 0; step < 3; step++) {
    pen.box([2.8, 3.8 + step * 0.55, 0], [1.6, 0.55, 1.5 - step * 0.5]);
  }

  // The ramp down the side, with a rail either side
  const [from, to] = [5.8, 11];
  const surface = (x: number) => 2 * (1 - (x - from) / (to - from));
  const rail = (y: number) => {
    const posts = [0, 1, 2, 3, 4].map(
      (index) => from + ((to - from) * index) / 4
    );
    for (const x of posts) {
      pen.line([
        [x, y, surface(x)],
        [x, y, surface(x) + 0.9]
      ]);
    }
    pen.line(posts.map((x): Vec3 => [x, y, surface(x) + 0.9]));
  };
  rail(1.05);
  pen.face([
    [from, 2.6, 0],
    [to, 2.6, 0],
    [from, 2.6, 2]
  ]);
  pen.face([
    [from, 1.0, 2],
    [from, 2.6, 2],
    [to, 2.6, 0],
    [to, 1.0, 0]
  ]);
  rail(2.55);

  // A tree by the way up
  pen.cylinder([9.0, 4.6, 0], 0.15, 0.9);
  pen.sphere([9.0, 4.6, 1.75], 0.95, { shadow: true });
};

/* Refactoring and re-platforming: from a tumbled pile to a tidy build
   ========================================================================== */

const replatform: Scene = (pen) => {
  pen.ground([1.7, 5.3], 2.8, 2.6);
  pen.ground([6.7, 1.9], 3.2, 2.8);

  // The old platform, cracked, and what's piled on it
  pen.box([0.2, 3.8, 0], [3.0, 3.0, 0.4], { darken: 0.05 });
  pen.line([
    [0.2, 4.4, 0.4],
    [1.1, 5.0, 0.4],
    [1.8, 4.8, 0.4],
    [2.6, 5.6, 0.4],
    [3.2, 5.5, 0.4]
  ]);
  pen.turnedBox([1.9, 4.1, 0.4], [0.8, 1.3, 0.55], -0.5);
  pen.turnedBox([0.6, 4.3, 0.4], [1.0, 1.0, 0.9], 0.35);
  pen.turnedBox([1.9, 5.5, 0.4], [0.7, 0.7, 0.7], -0.25);
  pen.turnedBox([0.7, 5.6, 0.4], [1.5, 0.6, 0.45], 0.9);

  // The new platform and the same parts, squared away
  pen.box([5.0, 0.2, 0], [3.4, 3.4, 0.5], { shadow: true });
  pen.box([5.4, 0.6, 0.5], [1.2, 1.2, 1.2]);
  pen.box([6.8, 0.6, 0.5], [1.2, 1.2, 1.2]);
  pen.box([5.4, 2.0, 0.5], [1.2, 1.2, 1.2]);
  pen.box([6.8, 2.0, 0.5], [1.2, 1.2, 1.2]);
  pen.box([6.1, 1.3, 1.7], [1.2, 1.2, 1.2]);
  windows(pen, "right", 8.0, [0.6, 1.8], [0.5, 1.7], 1, 1);
  windows(pen, "right", 8.0, [2.0, 3.2], [0.5, 1.7], 1, 1);
  windows(pen, "left", 3.2, [5.4, 6.6], [0.5, 1.7], 1, 1);

  // The move between them, with its arrowhead
  const from: Vec3 = [1.6, 5.0, 2.2];
  const to: Vec3 = [6.1, 1.6, 3.4];
  const control: Vec3 = [3.6, 3.6, 6.4];
  pen.line(
    Array.from({ length: 25 }, (_, index) =>
      bend(from, control, to, index / 24)
    ),
    { dashed: true }
  );
  const back = bend(from, control, to, 0.9);
  for (const spread of [0.5, -0.5]) {
    pen.line([to, flare(to, back, spread, 0.55)]);
  }
};

const SCENES: Record<string, Scene> = {
  "web-development": construction,
  "user-interface-design": interfaceBoard,
  "cms-implementation": filingCabinet,
  "rapid-prototyping": rocket,
  "design-systems": partsTray,
  copywriting: manuscript,
  "web-performance": gauge,
  "web-accessibility-a11y": ramp,
  "web-refactoring": replatform
};

/** The illustration for a service, by its URL */
export const sceneFor = (url: string): Scene | undefined =>
  SCENES[url.split("/").filter(Boolean).at(-1) ?? ""];
