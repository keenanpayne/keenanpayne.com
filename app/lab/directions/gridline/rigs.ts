/*
 * Animated service illustrations
 * ==================================================
 * Gridline's versions of Stipple's isometric scenes, rigged to move: each
 * draws its scene through the shared pen, wrapping what moves in a named
 * `part`, and choreographs those parts over one loop. A part's keys are
 * poses in world units, relative to where it was drawn: moved by a vector,
 * stretched along an axis from an anchor (a cable, a flame, a post, a line
 * of writing drawn on), turned in a plane about an anchor (a needle), or
 * faded. Every loop starts and ends at rest, which is the still drawing.
 */

import {
  bend,
  flare,
  onLeft,
  onRight,
  onTop,
  windows,
  type Pen,
  type Vec3
} from "../../site/isometric";

/** Wraps the shapes `draw` makes in a named part */
export type Part = (name: string, draw: () => void) => void;

export type Ease = "linear" | "in" | "out" | "in-out";

/** A pose at a point in the loop (0 to 1); `ease` shapes the way to the next */
export interface Key {
  at: number;
  move?: Vec3;
  opacity?: number;
  /** Length along the motion's axis, as a share of the drawn length */
  stretch?: number;
  /** Degrees, in the motion's plane, about the anchor */
  turn?: number;
  ease?: Ease;
}

export interface Motion {
  keys: Key[];
  /** The point stretches and turns are made about */
  anchor?: Vec3;
  /** The direction a stretch runs in (upright, unless given) */
  axis?: Vec3;
  /** The plane a turn happens in: `xz` faces +y, `yz` faces +x */
  plane?: "xz" | "yz";
}

export interface Rig {
  name: string;
  /** What the loop shows, in a sentence */
  story: string;
  seconds: number;
  draw: (pen: Pen, part: Part) => void;
  motions: Record<string, Motion>;
  /** Points beyond the still drawing that moving parts reach */
  reach?: Vec3[];
}

const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

/* Web development: the crane lifts a block onto the tower
   ========================================================================== */

// The trolley runs along the jib from over the tower to over the yard
const OVER_TOWER = 4.2;
const OVER_YARD = 6.65;
const TRAVEL = OVER_YARD - OVER_TOWER;
// Eight truss bays out from the mast
const JIB_END = 0.55 + 0.8 * 8;
// The load hangs with its foot here, and is set down on the frame's top
const HANG = 6.3;
const FRAME_TOP = 5.6;
const SLAB = 0.35;
// The cable runs from under the trolley to the load's top
const TROLLEY_FOOT = 7.55;
const cableAt = (top: number) =>
  (TROLLEY_FOOT - top) / (TROLLEY_FOOT - (HANG + 0.6));

const construction: Rig = {
  name: "Web development",
  story:
    "The crane sets its block on the frame, then fetches the next one from the yard",
  seconds: 9,
  draw: (pen, part) => {
    pen.ground([4.3, 4.4], 5.2, 4.2);

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
    pen.box([1.6, 1.6, 0], [5.8, 5.6, SLAB], { shadow: true });
    pen.box([2.6, 2.6, SLAB], [3.2, 3.2, 3.6], { shadow: true });
    windows(pen, "right", 5.8, [2.6, 5.8], [SLAB, 3.95], 3, 3);
    windows(pen, "left", 5.8, [2.6, 5.8], [SLAB, 3.95], 3, 3);

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
        [x, y, FRAME_TOP]
      ]);
    }
    pen.line([...corners, corners[0]].map(([x, y]): Vec3 => [x, y, FRAME_TOP]));
    pen.line([
      [2.6, 5.8, 4.8],
      [5.8, 5.8, 4.8],
      [5.8, 2.6, 4.8]
    ]);

    // The block, once it's set down
    part("placed", () =>
      pen.box([3.8, 3.8, FRAME_TOP], [0.8, 0.8, 0.6], { darken: 0.1 })
    );

    // The jib, long enough to reach the yard
    for (const z of [7.8, 8.2]) {
      pen.line([
        [0.55, 4.2, z],
        [JIB_END, 4.2, z]
      ]);
    }
    for (let x = 0.55; x < JIB_END - 0.1; x += 0.8) {
      pen.line([
        [x, 4.2, 7.8],
        [x + 0.4, 4.2, 8.2],
        [x + 0.8, 4.2, 7.8]
      ]);
    }

    part("trolley", () =>
      pen.box([3.95, 4.05, TROLLEY_FOOT], [0.5, 0.3, 0.25], { darken: 0.2 })
    );
    part("cable", () =>
      pen.line([
        [OVER_TOWER, 4.2, TROLLEY_FOOT],
        [OVER_TOWER, 4.2, HANG + 0.6]
      ])
    );
    part("load", () =>
      pen.box([3.8, 3.8, HANG], [0.8, 0.8, 0.6], { darken: 0.1 })
    );

    // Materials waiting on the slab, and the next block, under the jib
    pen.box([2.0, 6.3, SLAB], [0.8, 0.8, 0.8]);
    pen.box([5.0, 6.2, SLAB], [2.0, 0.3, 0.3]);
    pen.box([5.0, 6.6, SLAB], [2.0, 0.3, 0.3]);
    pen.box([5.0, 6.4, 0.65], [2.0, 0.3, 0.3]);
    part("next", () =>
      pen.box([OVER_YARD - 0.4, 3.8, SLAB], [0.8, 0.8, 0.6], { darken: 0.1 })
    );
  },
  motions: {
    load: {
      keys: [
        { at: 0 },
        { at: 0.06, ease: "in-out" },
        { at: 0.2, move: [0, 0, FRAME_TOP - HANG] },
        { at: 0.23, opacity: 1 },
        { at: 0.235, opacity: 0, move: [0, 0, FRAME_TOP - HANG] },
        { at: 0.6, move: [TRAVEL, 0, SLAB - HANG], opacity: 0 },
        { at: 0.64, opacity: 0 },
        { at: 0.645, opacity: 1, ease: "in-out" },
        { at: 0.8, move: [TRAVEL, 0, 0], ease: "in-out" },
        { at: 0.94, move: [0, 0, 0] },
        { at: 1 }
      ]
    },
    placed: {
      keys: [
        { at: 0, opacity: 0 },
        { at: 0.23, opacity: 0 },
        { at: 0.235, opacity: 1 },
        { at: 0.9, opacity: 1 },
        { at: 0.98, opacity: 0 },
        { at: 1, opacity: 0 }
      ]
    },
    next: {
      keys: [
        { at: 0, opacity: 1 },
        { at: 0.64, opacity: 1 },
        { at: 0.645, opacity: 0 },
        { at: 0.9, opacity: 0 },
        { at: 1, opacity: 1 }
      ]
    },
    trolley: {
      keys: [
        { at: 0 },
        { at: 0.32, ease: "in-out" },
        { at: 0.46, move: [TRAVEL, 0, 0] },
        { at: 0.8, move: [TRAVEL, 0, 0], ease: "in-out" },
        { at: 0.94, move: [0, 0, 0] },
        { at: 1 }
      ]
    },
    cable: {
      anchor: [OVER_TOWER, 4.2, TROLLEY_FOOT],
      keys: [
        { at: 0, stretch: 1 },
        { at: 0.06, stretch: 1, ease: "in-out" },
        { at: 0.2, stretch: cableAt(FRAME_TOP + 0.6) },
        { at: 0.235, stretch: cableAt(FRAME_TOP + 0.6), ease: "in-out" },
        { at: 0.32, stretch: 1, ease: "in-out" },
        { at: 0.46, move: [TRAVEL, 0, 0], stretch: 1, ease: "in-out" },
        { at: 0.6, move: [TRAVEL, 0, 0], stretch: cableAt(SLAB + 0.6) },
        { at: 0.645, stretch: cableAt(SLAB + 0.6), ease: "in-out" },
        { at: 0.8, stretch: 1, ease: "in-out" },
        { at: 0.94, move: [0, 0, 0], stretch: 1 },
        { at: 1 }
      ]
    }
  }
};

/* User interface design: the pointer rearranges the layout, then clicks
   ========================================================================== */

// The board's face, and how far the image and the text swap
const BOARD = 3.9;
const SWAP = 2.5;
// The pointer's tip at rest, by the button
const TIP: Vec3 = [4.95, BOARD, 1.95];
const pointTo = (x: number, z: number): Vec3 => [x - TIP[0], 0, z - TIP[2]];

const interfaceBoard: Rig = {
  name: "User interface design",
  story:
    "The pointer drags the image across, swaps it back with the text, and presses the button",
  seconds: 8,
  draw: (pen, part) => {
    pen.ground([3.8, 4.4], 4.6, 3.2);

    pen.box([1.6, 3.6, 0], [0.3, 0.3, 0.7]);
    pen.box([5.8, 3.6, 0], [0.3, 0.3, 0.7]);
    pen.box([1.0, 3.5, 0.7], [5.6, 0.4, 4.0], { shadow: true });

    const y = BOARD;
    pen.face(onLeft(y, 1.25, 6.35, 4.15, 4.45), { tone: 0.7 });
    for (const x of [1.45, 1.7, 1.95]) {
      pen.face(onLeft(y, x, x + 0.13, 4.24, 4.36), { tone: 0, outline: false });
    }

    // The text column: a heading and lines, and the button under them
    part("text", () => {
      pen.face(onLeft(y, 3.85, 6.0, 3.6, 3.85), { tone: 1, outline: false });
      [2.3, 2.05, 2.3, 1.4].forEach((length, index) => {
        const z = 3.3 - index * 0.3;
        pen.line([
          [3.85, y, z],
          [3.85 + length, y, z]
        ]);
      });
    });
    part("button", () =>
      pen.face(onLeft(y, 3.85, 5.15, 1.75, 2.15), { tone: 0.95 })
    );

    // An image, with its mountain and sun, over the rest while it's dragged
    part("image", () => {
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
          return [
            3.05 + 0.2 * Math.cos(angle),
            y,
            3.45 + 0.2 * Math.sin(angle)
          ];
        }),
        { tone: 0.05 }
      );
    });

    part("pointer", () =>
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
      )
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
  },
  motions: {
    pointer: {
      keys: [
        { at: 0, ease: "in-out" },
        { at: 0.06, ease: "in-out" },
        { at: 0.16, move: pointTo(2.45, 2.8) },
        { at: 0.2, move: pointTo(2.45, 2.8), ease: "in-out" },
        { at: 0.38, move: pointTo(2.45 + SWAP, 2.8), ease: "in-out" },
        { at: 0.48, move: pointTo(1.9, 3.72) },
        { at: 0.52, move: pointTo(1.9, 3.72), ease: "in-out" },
        { at: 0.7, move: pointTo(1.9 + SWAP, 3.72), ease: "in-out" },
        { at: 0.8, move: pointTo(4.6, 2.0) },
        { at: 0.88, move: pointTo(4.6, 2.0), ease: "in-out" },
        { at: 1, move: [0, 0, 0] }
      ]
    },
    image: {
      keys: [
        { at: 0 },
        { at: 0.2, ease: "in-out" },
        { at: 0.38, move: [SWAP, 0, 0] },
        { at: 0.52, move: [SWAP, 0, 0], ease: "in-out" },
        { at: 0.7, move: [0, 0, 0] },
        { at: 1 }
      ]
    },
    text: {
      keys: [
        { at: 0 },
        { at: 0.2, ease: "in-out" },
        { at: 0.38, move: [-SWAP, 0, 0] },
        { at: 0.52, move: [-SWAP, 0, 0], ease: "in-out" },
        { at: 0.7, move: [0, 0, 0] },
        { at: 1 }
      ]
    },
    button: {
      keys: [
        { at: 0, opacity: 1 },
        { at: 0.2, ease: "in-out" },
        { at: 0.38, move: [-SWAP, 0, 0] },
        { at: 0.52, move: [-SWAP, 0, 0], ease: "in-out" },
        { at: 0.7, move: [0, 0, 0] },
        { at: 0.82, opacity: 1 },
        { at: 0.84, opacity: 0.35 },
        { at: 0.86, opacity: 1 },
        { at: 1, opacity: 1 }
      ]
    }
  }
};

/* CMS implementation: the papers are filed, and the folder tabs ordered
   ========================================================================== */

const FRONT = 3.4;
// The papers' pile, and the spot over the open drawer they drop into
const PILE: Vec3 = [5.8, 4.2, 0];
const DRAWER: Vec3 = [2.8, 4.4, 0];
const OVER = 3.85;
const INSIDE = 2.4;
const PAPERS = [0, 0.12, 0.24];
// The folders' tabs, now and filed in order
const TABS = [0, 1, 2, 3, 4].map((index) => ({
  from: 1.85 + (index % 3) * 0.6,
  to: 1.85 + index * 0.375
}));

/** A paper's trip from the pile into the drawer, starting at `start` */
function filing(base: number, start: number): Key[] {
  const across: Vec3 = [DRAWER[0] - PILE[0], DRAWER[1] - PILE[1], 0];
  return [
    { at: 0, opacity: 1 },
    { at: start, ease: "out" },
    { at: start + 0.06, move: [0, 0, OVER - base], ease: "in-out" },
    { at: start + 0.14, move: add(across, [0, 0, OVER - base]), ease: "in" },
    { at: start + 0.17, opacity: 1 },
    { at: start + 0.2, move: add(across, [0, 0, INSIDE - base]), opacity: 0 },
    { at: 0.88, move: add(across, [0, 0, INSIDE - base]), opacity: 0 },
    { at: 0.885, move: [0, 0, 0], opacity: 0 },
    { at: 1, opacity: 1 }
  ];
}

const filingCabinet: Rig = {
  name: "CMS implementation",
  story:
    "Papers lift off the pile into the open drawer, and the folders' tabs fall into order",
  seconds: 9,
  draw: (pen, part) => {
    pen.ground([3.6, 3.8], 4.2, 3.4);

    pen.box([1.4, 0.8, 0], [2.8, 2.6, 5.2], { shadow: true });
    for (const [bottom, top] of [
      [3.6, 5.0],
      [0.2, 1.6]
    ]) {
      pen.face(onLeft(FRONT, 1.6, 4.0, bottom, top), { tone: 0.42 });
      pen.face(onLeft(FRONT, 2.4, 3.2, top - 0.45, top - 0.3), {
        tone: 1,
        outline: false
      });
    }

    // The open drawer: its side, its dark inside, its folders, its front
    pen.face(onRight(4.0, FRONT, 5.6, 1.9, 3.4));
    pen.face(onTop(3.4, 1.6, 4.0, FRONT, 5.6), { tone: 0.9 });
    for (let index = 0; index < 5; index++) {
      const y = 3.6 + index * 0.4;
      pen.box([1.75, y, 2.2], [2.1, 0.08, 1.45], { darken: -0.3, top: 0.05 });
      part(`tab-${index}`, () =>
        pen.box([TABS[index].from, y, 3.65], [0.55, 0.08, 0.22], {
          darken: -0.3,
          top: 0.05
        })
      );
    }
    pen.face(onLeft(5.6, 1.6, 4.0, 1.9, 3.4));
    pen.face(onLeft(5.6, 2.4, 3.2, 2.85, 3.0), { tone: 1, outline: false });

    // Papers waiting to be filed
    const paper = { darken: -0.35, top: 0.03 };
    const turns = [0.1, -0.12, 0.05];
    PAPERS.forEach((z, index) =>
      part(`paper-${index}`, () =>
        pen.turnedBox(
          [5.0 + (index === 1 ? 0.05 : 0), 3.6 + (index === 1 ? 0.05 : 0), z],
          [1.6, 1.2, 0.12],
          turns[index],
          paper
        )
      )
    );
  },
  motions: {
    "paper-2": { keys: filing(PAPERS[2], 0.04) },
    "paper-1": { keys: filing(PAPERS[1], 0.26) },
    "paper-0": { keys: filing(PAPERS[0], 0.48) },
    ...Object.fromEntries(
      TABS.map(({ from, to }, index) => [
        `tab-${index}`,
        {
          keys: [
            { at: 0 },
            { at: 0.7 + index * 0.025, ease: "in-out" },
            { at: 0.78 + index * 0.025, move: [to - from, 0, 0] },
            { at: 0.9, move: [to - from, 0, 0], ease: "in-out" },
            { at: 1, move: [0, 0, 0] }
          ]
        } satisfies Motion
      ])
    )
  }
};

/* Rapid prototyping: the rocket is put together, lit, and launched
   ========================================================================== */

const LIFTOFF = 7;
const FINS = [240, 0, 120].map((degrees) => (degrees * Math.PI) / 180);
/** Out from the body, along a fin */
const outward = (angle: number, by: number): Vec3 => [
  Math.cos(angle) * by,
  Math.sin(angle) * by,
  0
];

/** Launch, then put together again from `from`, between `start` and `end` */
function assembly(from: Key, start: number, end: number): Key[] {
  return [
    { at: 0, opacity: 1 },
    { at: 0.05, ease: "in" },
    { at: 0.2, move: [0, 0, LIFTOFF * 0.6], opacity: 1, ease: "in" },
    { at: 0.26, move: [0, 0, LIFTOFF], opacity: 0 },
    { ...from, at: 0.27, opacity: 0 },
    { ...from, at: start, opacity: 0, ease: "out" },
    { at: end, move: [0, 0, 0], opacity: 1 },
    { at: 1, opacity: 1 }
  ];
}

const rocket: Rig = {
  name: "Rapid prototyping",
  story:
    "The rocket lifts off; a new one is stacked on the pad, piece by piece, and lit",
  seconds: 9,
  draw: (pen, part) => {
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
    const puff = (x: number, y: number, radius: number) =>
      pen.sphere([x, y, 0.45 + radius * 0.5], radius, {
        darken: -0.45,
        outline: false
      });
    part("smoke-back", () => {
      puff(1.5, 2.9, 0.45);
      puff(1.7, 2.1, 0.55);
      puff(2.5, 1.5, 0.5);
      puff(3.4, 1.4, 0.4);
    });

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
    part("fin-0", () => fin(FINS[0]));

    const flame = (points: [number, number][]) =>
      points.map(([u, z]): Vec3 => [3 + 0.707 * u, 3 - 0.707 * u, z]);
    part("flame", () => {
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
    });

    part("body", () => pen.cylinder([3, 3, 2.2], 0.7, 2.8));
    part("band", () => pen.cylinder([3, 3, 4.3], 0.71, 0.3, { darken: 0.3 }));
    part("cone", () => pen.cone([3, 3, 5.0], 0.7, 1.4));
    part("porthole", () =>
      pen.face(
        Array.from({ length: 14 }, (_, index): Vec3 => {
          const angle = (index / 14) * Math.PI * 2;
          const u = 0.24 * Math.cos(angle);
          return [
            3.5 - u * 0.707,
            3.5 + u * 0.707,
            3.6 + 0.24 * Math.sin(angle)
          ];
        }),
        { tone: 0.95 }
      )
    );
    part("fin-1", () => fin(FINS[1]));
    part("fin-2", () => fin(FINS[2]));

    part("smoke-front", () => {
      puff(4.3, 2.4, 0.45);
      puff(4.6, 3.3, 0.55);
      puff(1.8, 3.8, 0.5);
      puff(2.4, 4.4, 0.45);
      puff(4.2, 4.1, 0.6);
      puff(3.2, 4.6, 0.65);
    });
  },
  motions: {
    body: { keys: assembly({ at: 0, move: [0, 0, 2.6] }, 0.34, 0.46) },
    ...Object.fromEntries(
      FINS.map((angle, index) => [
        `fin-${index}`,
        {
          keys: assembly(
            { at: 0, move: outward(angle, 1.2) },
            0.48 + index * 0.03,
            0.56 + index * 0.03
          )
        } satisfies Motion
      ])
    ),
    band: { keys: assembly({ at: 0, move: [0, 0, 1.6] }, 0.6, 0.67) },
    cone: { keys: assembly({ at: 0, move: [0, 0, 2.2] }, 0.66, 0.75) },
    porthole: { keys: assembly({ at: 0, move: [0, 0, 0] }, 0.75, 0.79) },
    flame: {
      anchor: [3, 3, 2.2],
      keys: [
        { at: 0, stretch: 1, opacity: 1 },
        { at: 0.05, stretch: 1.25, ease: "in" },
        { at: 0.2, move: [0, 0, LIFTOFF * 0.6], stretch: 1.4, ease: "in" },
        { at: 0.26, move: [0, 0, LIFTOFF], opacity: 0 },
        { at: 0.27, move: [0, 0, 0], stretch: 0.05, opacity: 0 },
        { at: 0.82, stretch: 0.05, opacity: 0, ease: "out" },
        { at: 0.9, stretch: 1, opacity: 1 },
        { at: 1, stretch: 1, opacity: 1 }
      ]
    },
    ...Object.fromEntries(
      ["smoke-back", "smoke-front"].map((name) => [
        name,
        {
          keys: [
            { at: 0, opacity: 1 },
            { at: 0.06, ease: "out" },
            { at: 0.34, move: [0, 0, 0.9], opacity: 0 },
            { at: 0.35, move: [0, 0, -0.3], opacity: 0 },
            { at: 0.84, opacity: 0, ease: "out" },
            { at: 0.96, move: [0, 0, 0], opacity: 1 },
            { at: 1, opacity: 1 }
          ]
        } satisfies Motion
      ])
    )
  }
};

/* Design systems: each part is set into its place on the tray, in order
   ========================================================================== */

const SLOTS = Array.from({ length: 12 }, (_, index) => ({
  column: index % 4,
  row: Math.floor(index / 4)
}))
  .sort((a, b) => a.column + a.row - (b.column + b.row))
  .filter(({ row, column }) => !(row === 2 && column === 0));
// The last part hovers this high over its slot
const HOVER = 2.85 - 0.92;

const partsTray: Rig = {
  name: "Design system creation",
  story:
    "The last part drops in; the tray empties and is filled again, one part at a time",
  seconds: 10,
  draw: (pen, part) => {
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

    // The empty slot, outlined where the last part lands
    part("slot", () =>
      pen.line(
        [
          [0.35, 3.95, 0.36],
          [1.45, 3.95, 0.36],
          [1.45, 5.05, 0.36],
          [0.35, 5.05, 0.36],
          [0.35, 3.95, 0.36]
        ],
        { dashed: true }
      )
    );

    SLOTS.forEach(({ column, row }, index) => {
      const x = 0.9 + column * 1.8;
      const y = 0.9 + row * 1.8;
      part(`part-${index}`, () => {
        if (row === 0) pen.box([x - 0.5, y - 0.5, 0.35], [1, 1, 1]);
        if (row === 1) pen.cylinder([x, y, 0.35], 0.55, 1);
        if (row === 2) pen.sphere([x, y, 0.92], 0.55);
      });
    });

    part("guide", () =>
      pen.line(
        [
          [0.9, 4.5, 0.4],
          [0.9, 4.5, 2.2]
        ],
        { dashed: true }
      )
    );
    part("last", () => pen.sphere([0.9, 4.5, 2.85], 0.55));
  },
  motions: {
    last: {
      keys: [
        { at: 0, opacity: 1 },
        { at: 0.04, ease: "in" },
        { at: 0.12, move: [0, 0, -HOVER] },
        { at: 0.3, move: [0, 0, -HOVER], opacity: 1, ease: "in" },
        { at: 0.36, move: [0, 0, 0.6 - HOVER], opacity: 0 },
        { at: 0.37, move: [0, 0, 0.8], opacity: 0 },
        { at: 0.86, move: [0, 0, 0.8], opacity: 0, ease: "out" },
        { at: 0.94, move: [0, 0, 0], opacity: 1 },
        { at: 1, opacity: 1 }
      ]
    },
    guide: {
      keys: [
        { at: 0, opacity: 1 },
        { at: 0.04 },
        { at: 0.1, opacity: 0 },
        { at: 0.88, opacity: 0 },
        { at: 0.96, opacity: 1 },
        { at: 1, opacity: 1 }
      ]
    },
    slot: {
      keys: [
        { at: 0, opacity: 1 },
        { at: 0.1 },
        { at: 0.12, opacity: 0 },
        { at: 0.34, opacity: 0 },
        { at: 0.38, opacity: 1 },
        { at: 1, opacity: 1 }
      ]
    },
    ...Object.fromEntries(
      SLOTS.map((_, index) => {
        const start = 0.4 + index * 0.04;
        return [
          `part-${index}`,
          {
            keys: [
              { at: 0, opacity: 1 },
              { at: 0.3, ease: "in" },
              { at: 0.36, move: [0, 0, 0.6], opacity: 0 },
              { at: 0.37, move: [0, 0, 1.6], opacity: 0 },
              { at: start, move: [0, 0, 1.6], opacity: 0, ease: "out" },
              { at: start + 0.06, move: [0, 0, 0], opacity: 1 },
              { at: 1, opacity: 1 }
            ]
          } satisfies Motion
        ];
      })
    )
  }
};

/* Copywriting: the quill writes the page, line by line
   ========================================================================== */

const LINES = [3.2, 3.0, 3.3, 2.6, 3.1, 1.8].map((length, index) => ({
  length,
  y: 2.75 + index * 0.3
}));
const PAGE = 0.55;
// The quill's nib, in the well at rest, and its lean
const NIB: Vec3 = [5.55, 1.25, 1.1];
const LEAN: Vec3 = [-0.35, -1.9, 4.1];
const toLine = (x: number, y: number, lift = 0): Vec3 => [
  x - NIB[0],
  y - NIB[1],
  PAGE + lift - NIB[2]
];

/** The quill's keys, and each line's, timed by how long the line is */
function writing() {
  const quill: Key[] = [
    { at: 0 },
    { at: 0.05, ease: "out" },
    { at: 0.09, move: [0, 0, 1.4], ease: "in-out" },
    { at: 0.15, move: toLine(1.0, LINES[0].y, 0.3), ease: "out" }
  ];
  const lines: Record<string, Key[]> = {};
  let at = 0.17;
  LINES.forEach(({ length, y }, index) => {
    const duration = 0.085 * (length / 3.2);
    quill.push(
      { at, move: toLine(1.0, y), ease: "linear" },
      { at: at + duration, move: toLine(1.0 + length, y) }
    );
    // Hidden while unwritten, as a line of no length still shows its caps
    lines[`line-${index}`] = [
      { at: 0, stretch: 1, opacity: 1 },
      { at: 0.04, ease: "in" },
      { at: 0.1, stretch: 0.001, opacity: 0 },
      { at: at - 0.004, stretch: 0.001, opacity: 0 },
      { at, stretch: 0.001, opacity: 1, ease: "linear" },
      { at: at + duration, stretch: 1 },
      { at: 1, stretch: 1, opacity: 1 }
    ];
    at += duration;
    const next = LINES[index + 1];
    if (next) {
      quill.push({
        at: at + 0.012,
        move: toLine(1.0 + length * 0.5, (y + next.y) / 2, 0.35),
        ease: "in-out"
      });
      at += 0.025;
    }
  });
  quill.push(
    { at: at + 0.02, move: toLine(2.5, 3.6, 1.2), ease: "in-out" },
    { at: at + 0.1, move: [0, 0, 1.4], ease: "in" },
    { at: at + 0.13, move: [0, 0, 0] },
    { at: 1 }
  );
  return { quill, lines };
}

const WRITING = writing();

const manuscript: Rig = {
  name: "Copywriting",
  story: "The quill leaves the well, writes the page line by line, and returns",
  seconds: 10,
  reach: LINES.flatMap(({ y }) => [add([1.0, y, PAGE], LEAN), [1.0, y, PAGE]]),
  draw: (pen, part) => {
    pen.ground([3.2, 3.2], 4.4, 3.4);

    // The stack, its sheets, and writing on the top one
    pen.box([0.6, 1.8, 0], [3.8, 2.8, PAGE], { top: 0.03, shadow: true });
    for (const z of [0.18, 0.36]) {
      pen.line([
        [0.6, 4.6, z],
        [4.4, 4.6, z],
        [4.4, 1.8, z]
      ]);
    }
    pen.face(onTop(PAGE, 1.0, 3.0, 2.15, 2.35), { tone: 1, outline: false });
    LINES.forEach(({ length, y }, index) =>
      part(`line-${index}`, () =>
        pen.line([
          [1.0, y, PAGE],
          [1.0 + length, y, PAGE]
        ])
      )
    );

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

    // Quill, nib in the well, leaning back
    part("quill", () => {
      const tip = add(NIB, LEAN);
      const along = (t: number): Vec3 => [
        NIB[0] + LEAN[0] * t,
        NIB[1] + LEAN[1] * t,
        NIB[2] + LEAN[2] * t
      ];
      const side: Vec3 = [0.6, -0.15, 0.1];
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
      pen.line([NIB, tip]);
      for (const t of [0.4, 0.55, 0.7, 0.85]) {
        pen.line([along(t), offset(along(t + 0.08), vane(t + 0.08) * 0.95)]);
      }
    });
  },
  motions: {
    quill: { keys: WRITING.quill },
    ...Object.fromEntries(
      Object.entries(WRITING.lines).map(([name, keys], index) => [
        name,
        { keys, anchor: [1.0, LINES[index].y, PAGE], axis: [1, 0, 0] }
      ])
    )
  }
};

/* Web performance: the needle sweeps the dial like a speedometer
   ========================================================================== */

const DIAL: Vec3 = [3.6, 3.26, 3.1];
const REST = -22;
/** A turn of the needle to an angle on the dial, from where it rests */
const toAngle = (degrees: number) => degrees - REST;

const gauge: Rig = {
  name: "Web performance",
  story:
    "The needle drops to idle, then sweeps up through the dial, overshoots, and settles",
  seconds: 7,
  draw: (pen, part) => {
    pen.ground([3.6, 3.2], 4.6, 3.2);

    pen.box([1.6, 2.0, 0], [4.0, 2.0, 0.8], { shadow: true });
    pen.box([3.3, 2.85, 0.8], [0.6, 0.4, 0.45]);

    const [cx, , cz] = DIAL;
    const radius = 2.1;
    const onDial = (r: number, angle: number, y = DIAL[1]): Vec3 => [
      cx + r * Math.cos(angle),
      y,
      cz + r * Math.sin(angle)
    ];
    const ring = (r: number, y: number) =>
      Array.from({ length: 48 }, (_, index) =>
        onDial(r, (index / 48) * Math.PI * 2, y)
      );
    const radians = (value: number) => (value * Math.PI) / 180;

    pen.face(ring(radius, 2.95), { tone: 0.75 });
    pen.face(ring(radius, 3.25), { tone: 0.04 });

    const arc = Array.from({ length: 9 }, (_, index) =>
      radians(-45 + index * 5.6)
    );
    pen.face(
      [
        ...arc.map((angle) => onDial(radius * 0.93, angle)),
        ...[...arc].reverse().map((angle) => onDial(radius * 0.74, angle))
      ],
      { tone: 0.75, outline: false }
    );

    for (let index = 0; index <= 10; index++) {
      const angle = radians(225 - index * 27);
      const inner = index % 2 ? 0.84 : 0.74;
      pen.line([onDial(radius * inner, angle), onDial(radius * 0.93, angle)]);
    }

    part("needle", () => {
      const needle = radians(REST);
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
    });
    pen.face(ring(0.2, 3.27), { tone: 0.9 });
  },
  motions: {
    needle: {
      anchor: DIAL,
      plane: "xz",
      keys: [
        { at: 0, turn: 0 },
        { at: 0.1, turn: 0, ease: "in-out" },
        { at: 0.3, turn: toAngle(212) },
        { at: 0.34, turn: toAngle(216), ease: "in-out" },
        { at: 0.38, turn: toAngle(211), ease: "in-out" },
        { at: 0.42, turn: toAngle(215), ease: "in" },
        { at: 0.62, turn: toAngle(-32), ease: "in-out" },
        { at: 0.68, turn: toAngle(-12), ease: "in-out" },
        { at: 0.74, turn: toAngle(-26), ease: "in-out" },
        { at: 0.8, turn: toAngle(-19), ease: "in-out" },
        { at: 0.86, turn: 0 },
        { at: 0.9, turn: toAngle(-24), ease: "in-out" },
        { at: 0.94, turn: 0 },
        { at: 1, turn: 0 }
      ]
    }
  }
};

/* Web accessibility: a ramp is laid to the door, plank by plank
   ========================================================================== */

const RAMP = { from: 5.8, to: 11, near: 2.6, far: 1.0 };
const surface = (x: number) =>
  2 * (1 - (x - RAMP.from) / (RAMP.to - RAMP.from));
const PLANKS = [0, 1, 2, 3].map((index) => {
  const step = (RAMP.to - RAMP.from) / 4;
  return [RAMP.from + step * index, RAMP.from + step * (index + 1)];
});
const POSTS = [0, 1, 2, 3, 4].map(
  (index) => RAMP.from + ((RAMP.to - RAMP.from) * index) / 4
);
/** Out of sight, then built between `start` and `end`, then kept */
const built = (start: number, end: number, from: Key): Key[] => [
  { at: 0, opacity: 1 },
  { at: 0.06, ease: "in" },
  { at: 0.12, opacity: 0 },
  { ...from, at: 0.13, opacity: 0 },
  { ...from, at: start, opacity: 0, ease: "out" },
  { at: end, opacity: 1, move: [0, 0, 0], stretch: 1 },
  { at: 1, opacity: 1 }
];

const ramp: Rig = {
  name: "Web accessibility",
  story:
    "A ramp is laid down from the door, plank by plank, then given its rails",
  seconds: 9,
  draw: (pen, part) => {
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

    const rail = (side: "back" | "front", y: number) => {
      POSTS.forEach((x, index) =>
        part(`${side}-post-${index}`, () =>
          pen.line([
            [x, y, surface(x)],
            [x, y, surface(x) + 0.9]
          ])
        )
      );
      part(`${side}-rail`, () =>
        pen.line(POSTS.map((x): Vec3 => [x, y, surface(x) + 0.9]))
      );
    };
    rail("back", 1.05);
    PLANKS.forEach(([a, b], index) =>
      part(`plank-${index}`, () => {
        pen.face([
          [a, RAMP.near, 0],
          [b, RAMP.near, 0],
          [b, RAMP.near, surface(b)],
          [a, RAMP.near, surface(a)]
        ]);
        pen.face([
          [a, RAMP.far, surface(a)],
          [a, RAMP.near, surface(a)],
          [b, RAMP.near, surface(b)],
          [b, RAMP.far, surface(b)]
        ]);
      })
    );
    rail("front", 2.55);

    // A tree by the way up
    pen.cylinder([9.0, 4.6, 0], 0.15, 0.9);
    pen.sphere([9.0, 4.6, 1.75], 0.95, { shadow: true });
  },
  motions: {
    ...Object.fromEntries(
      PLANKS.map((_, index) => [
        `plank-${index}`,
        {
          keys: built(0.18 + index * 0.09, 0.26 + index * 0.09, {
            at: 0,
            move: [0, 0, 1.4]
          })
        } satisfies Motion
      ])
    ),
    ...Object.fromEntries(
      (["back", "front"] as const).flatMap((side, sideIndex) =>
        POSTS.map((x, index) => {
          const start = 0.56 + index * 0.035 + sideIndex * 0.015;
          return [
            `${side}-post-${index}`,
            {
              anchor: [x, side === "back" ? 1.05 : 2.55, surface(x)],
              keys: built(start, start + 0.05, { at: 0, stretch: 0.02 })
            } satisfies Motion
          ];
        })
      )
    ),
    ...Object.fromEntries(
      (["back", "front"] as const).map((side, sideIndex) => [
        `${side}-rail`,
        {
          anchor: [
            RAMP.from,
            side === "back" ? 1.05 : 2.55,
            surface(RAMP.from) + 0.9
          ],
          axis: [RAMP.to - RAMP.from, 0, surface(RAMP.to) - surface(RAMP.from)],
          keys: built(0.76 + sideIndex * 0.03, 0.86 + sideIndex * 0.03, {
            at: 0,
            stretch: 0.001
          })
        } satisfies Motion
      ])
    )
  }
};

/* Refactoring: the tumbled parts fly over and are set square
   ========================================================================== */

const NEW_SLOTS: Vec3[] = [
  [5.4, 0.6, 0.5],
  [6.8, 0.6, 0.5],
  [5.4, 2.0, 0.5],
  [6.8, 2.0, 0.5]
];
// Each tumbled part: where it sits, and the slot it's squared away into
const PILE_PARTS: { at: Vec3; size: Vec3; turn: number; slot: number }[] = [
  { at: [0.6, 4.3, 0.4], size: [1.0, 1.0, 0.9], turn: 0.35, slot: 0 },
  { at: [1.9, 4.1, 0.4], size: [0.8, 1.3, 0.55], turn: -0.5, slot: 1 },
  { at: [0.7, 5.6, 0.4], size: [1.5, 0.6, 0.45], turn: 0.9, slot: 2 },
  { at: [1.9, 5.5, 0.4], size: [0.7, 0.7, 0.7], turn: -0.25, slot: 3 }
];
const FLIGHT = 0.15;
const flightStart = (index: number) => 0.16 + index * 0.16;

/** A tumbled part's flight to its slot, on an arc, landing as it fades */
function flight(index: number): Key[] {
  const { at, size, slot } = PILE_PARTS[index];
  const from: Vec3 = [at[0] + size[0] / 2, at[1] + size[1] / 2, at[2]];
  const to: Vec3 = [NEW_SLOTS[slot][0] + 0.6, NEW_SLOTS[slot][1] + 0.6, 0.5];
  const lift: Vec3 = [0, 0, 0.8];
  const top: Vec3 = [
    (from[0] + to[0]) / 2,
    (from[1] + to[1]) / 2,
    Math.max(from[2], to[2]) + 4.2
  ];
  const start = flightStart(index);
  const path = Array.from({ length: 7 }, (_, step) => {
    const t = step / 6;
    const point = bend(add(from, lift), top, add(to, lift), t);
    return {
      at: start + 0.03 + (FLIGHT - 0.05) * t,
      move: [point[0] - from[0], point[1] - from[1], point[2] - from[2]],
      ease: "linear"
    } satisfies Key;
  });
  const landed: Vec3 = [to[0] - from[0], to[1] - from[1], to[2] - from[2]];
  return [
    { at: 0, opacity: 1 },
    { at: start, ease: "out" },
    { at: start + 0.03, move: lift },
    ...path,
    { at: start + FLIGHT - 0.01, move: landed, opacity: 1 },
    { at: start + FLIGHT, move: landed, opacity: 0 },
    { at: 0.9, move: landed, opacity: 0 },
    { at: 0.905, move: [0, 0, 0], opacity: 0 },
    { at: 1, opacity: 1 }
  ];
}

/** A squared part: gone, then set down as its tumbled part lands */
const settled = (landing: number): Key[] => [
  { at: 0, opacity: 1 },
  { at: 0.06 },
  { at: 0.12, opacity: 0 },
  { at: landing - 0.01, opacity: 0 },
  { at: landing, opacity: 1 },
  { at: 1, opacity: 1 }
];

const replatform: Rig = {
  name: "Refactoring and re-platforming",
  story:
    "The tumbled parts fly over one by one, are set square on the new platform, and it lights up",
  seconds: 10,
  draw: (pen, part) => {
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

    // The new platform and the same parts, squared away
    pen.box([5.0, 0.2, 0], [3.4, 3.4, 0.5], { shadow: true });
    NEW_SLOTS.forEach((slot, index) =>
      part(`square-${index}`, () => pen.box(slot, [1.2, 1.2, 1.2]))
    );
    part("square-top", () => pen.box([6.1, 1.3, 1.7], [1.2, 1.2, 1.2]));
    part("lights", () => {
      windows(pen, "right", 8.0, [0.6, 1.8], [0.5, 1.7], 1, 1);
      windows(pen, "right", 8.0, [2.0, 3.2], [0.5, 1.7], 1, 1);
      windows(pen, "left", 3.2, [5.4, 6.6], [0.5, 1.7], 1, 1);
    });

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

    // The tumbled parts, over everything as they fly
    PILE_PARTS.forEach(({ at, size, turn }, index) =>
      part(`tumbled-${index}`, () => pen.turnedBox(at, size, turn))
    );
  },
  motions: {
    ...Object.fromEntries(
      PILE_PARTS.map((_, index) => [
        `tumbled-${index}`,
        { keys: flight(index) }
      ])
    ),
    ...Object.fromEntries(
      PILE_PARTS.map(({ slot }, index) => [
        `square-${slot}`,
        { keys: settled(flightStart(index) + FLIGHT) }
      ])
    ),
    "square-top": {
      keys: [
        { at: 0, opacity: 1 },
        { at: 0.06 },
        { at: 0.12, opacity: 0 },
        { at: 0.8, move: [0, 0, 1.4], opacity: 0, ease: "out" },
        { at: 0.86, move: [0, 0, 0], opacity: 1 },
        { at: 1, opacity: 1 }
      ]
    },
    lights: {
      keys: [
        { at: 0, opacity: 1 },
        { at: 0.06 },
        { at: 0.12, opacity: 0 },
        { at: 0.88, opacity: 0 },
        { at: 0.9, opacity: 1 },
        { at: 0.92, opacity: 0.3 },
        { at: 0.94, opacity: 1 },
        { at: 1, opacity: 1 }
      ]
    }
  }
};

const RIGS: Record<string, Rig> = {
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

/** The rig for a service, by its URL */
export const rigFor = (url: string): Rig | undefined =>
  RIGS[url.split("/").filter(Boolean).at(-1) ?? ""];
