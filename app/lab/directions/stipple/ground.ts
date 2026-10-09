/*
 * Groundwork
 * ==================================================
 * The home hero's terrain, built on. Every fourteen seconds a survey grid
 * rules the land, a site sweeps in out of the same dots, a pointer presses
 * its button, and the site weathers back to land: designing and building,
 * told in the art. Each frame is a grid of dot levels for `paint`: 1 sage
 * and 2 deep sage (the terrain's own), 3 midtone, 4 ink.
 */

import { grain, hash, terrain, type Levels } from "./dither";

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Ground {
  width: number;
  height: number;
  /** The terrain on its own */
  land: Levels;
  /** Where the site goes, or null when there's no room for one */
  plot: Rect | null;
  /** The site, one level per cell of the plot */
  site: Levels;
  /** Noise per cell of the plot, so the build front frays */
  fray: Float32Array;
  button: Rect;
  caret: Rect;
  /** The frame being drawn, reused from frame to frame */
  frame: Levels;
}

/** Seconds in a cycle */
export const CYCLE = 14;
/** A moment with the site built and its button about to be pressed */
export const BUILT = 9.2;

/** The pointer: `X` ink, `o` paper, space left alone */
const ARROW = [
  "X",
  "XX",
  "XoX",
  "XooX",
  "XoooX",
  "XooooX",
  "XoooooX",
  "XooooooX",
  "XoooooooX",
  "XooooXXXXX",
  "XooXooX",
  "XoX XooX",
  "XX  XooX",
  "X    XooX",
  "     XooX",
  "      XX"
];

/** Radius of the lens that looks under the surface, in cells */
const LENS = 46;

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};
const ease = (value: number) => {
  const t = clamp(value);
  return t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Ink coverage to a level: off below the cell's threshold, denser is darker */
const levelFor = (coverage: number, threshold: number) => {
  if (coverage <= threshold) return 0;
  if (coverage > 0.8) return 4;
  if (coverage > 0.56) return 3;
  return coverage > 0.32 ? 2 : 1;
};

/**
 * A plot for the site in the open ground between `top` and `bottom` (rows
 * clear of the chrome and the hero's copy), against the right-hand edge.
 * Null when the ground is too cramped to build on.
 */
export function fitPlot(
  columns: number,
  top: number,
  bottom: number
): Rect | null {
  const margin = Math.max(10, Math.round(columns * 0.05));
  const room = bottom - top;
  const width = Math.min(columns - margin * 2, 380, Math.round(room * 2.4));
  const height = Math.min(room, Math.round(width / 1.45));
  if (width < 110 || height < 60) return null;
  return {
    x: columns - margin - width,
    y: top + Math.round((room - height) / 2),
    width,
    height
  };
}

/**
 * A wireframe of a site, filling `plot`: a browser window, a nav, a
 * headline beside an image of mountains, a button, and cards when there's
 * room for them
 */
function drawSite(plot: Rect, seed: number) {
  const { width: W, height: H } = plot;
  const coverage = new Float32Array(W * H);
  const R = Math.round;

  const fill = (x: number, y: number, w: number, h: number, ink: number) => {
    const x0 = Math.max(0, R(x));
    const y0 = Math.max(0, R(y));
    const x1 = Math.min(W, R(x) + Math.max(1, R(w)));
    const y1 = Math.min(H, R(y) + Math.max(1, R(h)));
    for (let row = y0; row < y1; row++) {
      coverage.fill(ink, row * W + x0, row * W + x1);
    }
  };
  const outline = (x: number, y: number, w: number, h: number) => {
    fill(x, y, w, 1, 1);
    fill(x, y + R(h) - 1, w, 1, 1);
    fill(x, y, 1, h, 1);
    fill(x + R(w) - 1, y, 1, h, 1);
  };
  const disc = (cx: number, cy: number, r: number, ink: number) => {
    for (let y = Math.floor(cy - r); y <= cy + r; y++) {
      for (let x = Math.floor(cx - r); x <= cx + r; x++) {
        if (x >= 0 && y >= 0 && x < W && y < H) {
          if ((x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2 <= r * r) {
            coverage[y * W + x] = ink;
          }
        }
      }
    }
  };
  /** Ground under a ridge of [across, down] points, fractions of the box */
  const ridge = (
    x: number,
    y: number,
    w: number,
    h: number,
    points: [number, number][],
    ink: number
  ) => {
    for (let column = R(x); column < R(x + w); column++) {
      const u = (column - x) / w;
      const next = points.findIndex(([across]) => across >= u);
      const [u0, v0] = points[Math.max(0, next - 1)];
      const [u1, v1] = points[Math.max(0, next)];
      const v = u1 === u0 ? v1 : lerp(v0, v1, (u - u0) / (u1 - u0));
      fill(column, y + v * h, 1, h - v * h, ink);
    }
  };

  // The window and its title bar
  outline(0, 0, W, H);
  const bar = Math.max(7, R(H * 0.07));
  fill(0, bar, W, 1, 1);
  for (let dot = 0; dot < 3; dot++) {
    fill(4 + dot * 5, R((bar - 2) / 2), 2, 2, 1);
  }
  fill(R(W * 0.3), 2, R(W * 0.4), bar - 4, 0.22);

  // Nav
  // Spacing across follows the width, down the height
  const pad = Math.max(6, R(W * 0.06));
  const padY = Math.max(5, R(H * 0.07));
  const left = pad;
  const inner = W - pad * 2;
  const navY = bar + R(padY * 0.7);
  disc(left + 3, navY + 3, 3, 1);
  for (let item = 0; item < 3; item++) {
    fill(
      left + inner - (item + 1) * R(inner * 0.1),
      navY + 2,
      R(inner * 0.07),
      2,
      0.75
    );
  }

  // Headline, copy, and button
  const heroY = navY + 8 + R(padY * 0.9);
  const column = inner * 0.5;
  const line = Math.max(4, R(H * 0.06));
  fill(left, heroY, column * 0.92, line, 0.72);
  const second = { x: left, y: heroY + line + 3, width: R(column * 0.6) };
  fill(second.x, second.y, second.width, line, 0.72);
  let textY = second.y + line + R(line * 0.9);
  for (const length of [0.95, 0.86, 0.58]) {
    fill(left, textY, column * length, 2, 0.55);
    textY += 5;
  }
  const button = {
    x: left,
    y: textY + 4,
    width: R(column * 0.34),
    height: line + 4
  };
  fill(button.x, button.y, button.width, button.height, 1);
  const heroBottom = button.y + button.height;

  // An image of mountains under a sun
  const ix = left + R(inner * 0.56);
  const iw = R(inner * 0.44);
  const ih = heroBottom - heroY;
  fill(ix, heroY, iw, ih, 0.22);
  ridge(
    ix,
    heroY,
    iw,
    ih,
    [
      [0, 1],
      [0.32, 0.42],
      [0.5, 0.62],
      [0.72, 0.3],
      [1, 0.66]
    ],
    0.62
  );
  disc(ix + iw * 0.24, heroY + ih * 0.28, Math.max(2, ih * 0.1), 0.95);
  outline(ix, heroY, iw, ih);

  // Cards
  const cardsY = heroBottom + R(padY * 0.8);
  const cardsH = H - R(padY * 0.7) - cardsY;
  if (cardsH > 16) {
    const gap = R(pad * 0.5);
    const cardW = (inner - gap * 2) / 3;
    const split = R(cardsH * 0.55);
    for (let card = 0; card < 3; card++) {
      const x = left + card * (cardW + gap);
      fill(x, cardsY, cardW, split, 0.3);
      outline(x, cardsY, cardW, cardsH);
      fill(x, cardsY + split, cardW, 1, 1);
      fill(x + 4, cardsY + split + 5, cardW * 0.7, 2, 0.6);
      if (cardsH > 30) fill(x + 4, cardsY + split + 10, cardW * 0.45, 2, 0.45);
    }
  }

  const site = new Uint8Array(W * H);
  const fray = new Float32Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const index = y * W + x;
      site[index] = levelFor(
        coverage[index],
        grain(plot.x + x, plot.y + y, seed)
      );
      fray[index] = hash(x, y, seed + 5);
    }
  }

  const at = (rect: Rect): Rect => ({
    ...rect,
    x: plot.x + rect.x,
    y: plot.y + rect.y
  });
  return {
    site,
    fray,
    button: at(button),
    caret: at({
      x: second.x + second.width + 2,
      y: second.y,
      width: 1,
      height: line
    })
  };
}

/** The terrain and the site for a frame, the same for a seed every time */
export function groundwork(
  width: number,
  height: number,
  seed: number,
  scale: number,
  plot: Rect | null
): Ground {
  const land = terrain(width, height, seed, "drift", scale);
  const empty: Rect = { x: 0, y: 0, width: 0, height: 0 };
  const built = plot
    ? drawSite(plot, seed)
    : {
        site: new Uint8Array(),
        fray: new Float32Array(),
        button: empty,
        caret: empty
      };
  return {
    width,
    height,
    land,
    plot,
    ...built,
    frame: new Uint8Array(width * height)
  };
}

/**
 * One frame, `time` seconds in. Under `lens` (a cell), the site shows
 * through the land, or the land through the site.
 */
export function groundworkFrame(
  ground: Ground,
  time: number,
  lens: { x: number; y: number } | null
): Levels {
  const { width, height, land, plot, site, fray, button, caret, frame } =
    ground;
  frame.set(land);
  if (!plot) return frame;

  const u = time % CYCLE;
  // How far the site has been built: up from 3.2s, down from 11s
  const built =
    u < 3.2
      ? 0
      : u < 7.2
        ? ease((u - 3.2) / 4)
        : u < 11
          ? 1
          : u < 13.4
            ? 1 - ease((u - 11) / 2.4)
            : 0;
  const front = built * 1.2 - 0.1;
  const moving = (u > 3.2 && u < 7.2) || (u > 11 && u < 13.4);
  const survey = smoothstep(1.2, 2.4, u) * (1 - smoothstep(6.2, 7.2, u));

  for (let y = 0; y < plot.height; y++) {
    for (let x = 0; x < plot.width; x++) {
      const local = y * plot.width + x;
      const column = plot.x + x;
      const row = plot.y + y;
      const index = row * width + column;
      // A diagonal front, from the top left, frayed by noise
      const reach =
        (x / plot.width) * 0.65 +
        (y / plot.height) * 0.35 +
        (fray[local] - 0.5) * 0.1;
      let shown = reach < front;
      if (lens && (column - lens.x) ** 2 + (row - lens.y) ** 2 < LENS ** 2) {
        shown = !shown;
      }
      if (shown) {
        frame[index] = site[local];
        continue;
      }
      if (survey > 0) {
        // Grid lines every twelve cells, and the plot staked out
        if ((x % 12 === 0 || y % 12 === 0) && fray[local] < survey * 0.55) {
          frame[index] = 3;
        }
        const edge =
          x === 0 || y === 0 || x === plot.width - 1 || y === plot.height - 1;
        if (edge && (x + y) % 4 < 2 && fray[local] < survey) frame[index] = 4;
      }
      if (moving && Math.abs(reach - front) < 0.008) frame[index] = 4;
    }
  }

  // The finished site: a blinking caret, then a pointer that presses the button
  if (built > 0.97) {
    if (Math.floor(u * 2) % 2 === 0) {
      for (let row = caret.y; row < caret.y + caret.height; row++) {
        frame[row * width + caret.x] = 4;
      }
    }

    if (u > 9.5 && u < 9.9) {
      for (let row = button.y; row < button.y + button.height; row++) {
        for (
          let column = button.x;
          column < button.x + button.width;
          column++
        ) {
          const index = row * width + column;
          frame[index] = frame[index] ? 2 : 0;
        }
      }
    }

    const travel = ease((u - 7.6) / 1.6);
    const ax = Math.round(
      lerp(plot.x + plot.width * 0.92, button.x + button.width * 0.6, travel)
    );
    const ay = Math.round(
      lerp(plot.y + plot.height * 0.92, button.y + button.height * 0.55, travel)
    );
    ARROW.forEach((line, dy) => {
      for (let dx = 0; dx < line.length; dx++) {
        const x = ax + dx;
        const y = ay + dy;
        if (line[dx] === " " || x < 0 || y < 0 || x >= width || y >= height) {
          continue;
        }
        frame[y * width + x] = line[dx] === "X" ? 4 : 0;
      }
    });
  }

  // The lens's dashed rim
  if (lens) {
    for (let degree = 0; degree < 360; degree += 2) {
      if (degree % 8 > 4) continue;
      const angle = (degree * Math.PI) / 180;
      const x = Math.round(lens.x + Math.cos(angle) * LENS);
      const y = Math.round(lens.y + Math.sin(angle) * LENS);
      if (x >= 0 && y >= 0 && x < width && y < height) {
        frame[y * width + x] = 3;
      }
    }
  }

  return frame;
}
