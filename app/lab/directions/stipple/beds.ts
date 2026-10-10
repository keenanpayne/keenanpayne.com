/*
 * Strata
 * ==================================================
 * The About page's opener: the years on the web as land cut in section, one
 * bed a year from the first to now. A year's bed is as thick as what it
 * left behind: portfolio projects lie in it as pebbles, and each post is a
 * fine line through it. The beds settle from the bottom up, then grains
 * keep falling on the top one. Each frame is a grid of dot levels for
 * `paint`: 1 sage, 2 deep sage, 3 midtone, 4 ink.
 */

import { fbm, hash, grain, levelFor, type Levels } from "./dither";

export interface Bed {
  year: number;
  /** Portfolio projects that ran that year */
  work: string[];
  posts: number;
}

export interface Section {
  width: number;
  height: number;
  seed: number;
  beds: Bed[];
  /** The ground's surface, by column */
  top: Float32Array;
  /** Where each bed starts, as a fraction of the depth from the bottom */
  cuts: number[];
  /** Which bed a cell is in, or -1 */
  bed: Int16Array;
  ink: Float32Array;
  threshold: Float32Array;
  grains: { x: number; y: number; speed: number }[];
  /** When the last frame was, for moving the grains */
  last: number;
  /** The frame being drawn, reused from frame to frame */
  frame: Levels;
}

/** `2014–2019`, `2019`, or `2019-2020` as the first and last years */
function yearsOf(text?: string): [number, number] | null {
  const years = text?.match(/\d{4}/g)?.map(Number);
  return years?.length ? [years[0], years[years.length - 1]] : null;
}

/** A bed for every year from `since` to `until`, with what it holds */
export function bedsOf(
  work: { name: string; year?: string }[],
  posts: { year: string }[],
  since: number,
  until: number
): Bed[] {
  return Array.from({ length: until - since + 1 }, (_, index) => {
    const year = since + index;
    return {
      year,
      work: work
        .filter((item) => {
          const span = yearsOf(item.year);
          return span && span[0] <= year && year <= span[1];
        })
        .map((item) => item.name),
      posts: posts.filter((post) => Number(post.year) === year).length
    };
  });
}

/** How much a year laid down: a little for being there, more for the work */
const weightOf = (bed: Bed) =>
  1 + 0.35 * Math.sqrt(bed.posts) + 0.35 * Math.min(bed.work.length, 4);

const clamp = (value: number) => Math.min(1, Math.max(0, value));

/** Seconds until every bed has settled */
export const settledAt = (beds: number) => 0.3 + beds * 0.2 + 0.55;

/** The ground and its beds for a frame, the same for a seed every time */
export function section(
  width: number,
  height: number,
  seed: number,
  beds: Bed[]
): Section {
  const size = width * height;
  // A frame wider than 21:9 gets more hills, not wider ones
  const stretch = Math.max(1, width / height / (21 / 9));

  const weights = beds.map(weightOf);
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  const cuts = [0];
  for (const weight of weights)
    cuts.push(cuts[cuts.length - 1] + weight / total);

  const top = new Float32Array(width);
  for (let x = 0; x < width; x++) {
    const u = x / width;
    top[x] =
      height * (0.18 + 0.36 * fbm(u * 2.2 * stretch + 3, 1.3, seed, 4)) -
      height * 0.06 * Math.sin(Math.PI * u);
  }

  const bed = new Int16Array(size).fill(-1);
  const ink = new Float32Array(size);
  const threshold = new Float32Array(size);
  const last = beds.length - 1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      threshold[index] = grain(x, y, seed);
      const surface = top[x];

      if (y < surface) {
        // Grass on the top bed
        if (y >= surface - 2.5 && hash(x, 4, seed) < 0.28) {
          bed[index] = last;
          ink[index] = 0.8;
        }
        continue;
      }

      // How far up the section the cell is, warped a little so the
      // beds undulate
      const thick = height - surface;
      const rise = (height - y) / thick;
      const q = Math.min(
        0.9999,
        clamp(
          rise +
            (fbm((x / width) * 3 * stretch, rise * 2, seed + 9, 3) - 0.5) * 0.03
        )
      );
      let j = 0;
      while (j < last && cuts[j + 1] <= q) j++;
      const cells = (cuts[j + 1] - cuts[j]) * thick;
      const sub = ((q - cuts[j]) / (cuts[j + 1] - cuts[j])) * cells;
      const { work, posts } = beds[j];

      // Alternate beds of finer and coarser ground
      let value = (j % 2 ? 0.34 : 0.22) + (hash(x, y, seed) - 0.5) * 0.06;

      // A fine line for each post, spread through the bed
      const lines = Math.min(posts, Math.floor(cells / 2));
      if (lines > 0) {
        const spacing = cells / (lines + 1);
        const nearest = Math.round(sub / spacing);
        if (
          nearest >= 1 &&
          nearest <= lines &&
          Math.abs(sub - spacing * nearest) < 0.5
        ) {
          value = 0.7;
        }
      }

      // Pebbles for the year's projects, more of them for more projects
      if (work.length && cells >= 5) {
        const gx = Math.floor(x / 8);
        const gy = Math.floor(sub / 6);
        const cell = gy * 31 + j;
        if (hash(gx, cell, seed + 5) < Math.min(0.85, 0.3 * work.length)) {
          const cx = gx * 8 + 2 + hash(gx, cell, seed) * 4;
          const cy = gy * 6 + 1.5 + hash(gx, cell, seed + 1) * 3;
          const radius = 1.2 + hash(gx, cell, seed + 2) * 1.6;
          const distance = Math.hypot((x - cx) * 0.8, sub - cy);
          if (distance < radius) value = 0.55;
          else if (distance < radius + 0.7) value = 0.82;
        }
      }

      // Each bed's top, and the ground's surface
      if (cells - sub < 1) value = Math.max(value, 0.62);
      if (y - surface < 1.2) value = 0.95;

      bed[index] = j;
      ink[index] = value;
    }
  }

  return {
    width,
    height,
    seed,
    beds,
    top,
    cuts,
    bed,
    ink,
    threshold,
    grains: [],
    last: 0,
    frame: new Uint8Array(size)
  };
}

/** The middle of a bed near the right-hand edge, as a fraction of the height */
export function bedMiddle(section: Section, index: number) {
  const { height, top, cuts, width } = section;
  // Measured where the tick sits, a little in from the edge
  const thick = height - top[Math.max(0, width - 20)];
  const rise = (cuts[index] + cuts[index + 1]) / 2;
  return (height - rise * thick) / height;
}

/**
 * One frame, `time` seconds in: the beds settled so far, with `hover`
 * (a bed) brought forward, and grains falling when `falling`
 */
export function sectionFrame(
  section: Section,
  time: number,
  hover: number,
  falling: boolean
): Levels {
  const { width, height, seed, beds, top, bed, ink, threshold, frame } =
    section;
  frame.fill(0);

  for (let index = 0; index < frame.length; index++) {
    const j = bed[index];
    if (j < 0) continue;
    // Each bed settles in after the one beneath it
    const settled = clamp((time - 0.3 - j * 0.2) / 0.55);
    if (settled < 1 && hash(index, 5, seed) > settled) continue;
    let value = ink[index];
    if (hover >= 0) value = j === hover ? value + 0.12 : value * 0.55;
    frame[index] = levelFor(value, threshold[index]);
  }

  // Grains: a stream while the beds settle, then a sprinkle
  const elapsed = time - section.last;
  section.last = time;
  if (elapsed < 0 || elapsed > 0.5 || !falling) {
    if (!falling) section.grains = [];
  } else {
    const rate =
      (time < settledAt(beds.length) ? 60 : 5) * Math.max(1, width / 400);
    for (let due = rate * elapsed; due > 0; due--) {
      if (due < 1 && Math.random() > due) break;
      const x = Math.floor(width * (0.02 + Math.random() * 0.96));
      section.grains.push({
        x,
        y: Math.max(1, top[x] - 20 - Math.random() * height * 0.25),
        speed: 22 + Math.random() * 16
      });
    }
    section.grains = section.grains.filter(
      (grain) => (grain.y += grain.speed * elapsed) < top[grain.x] - 1
    );
  }
  for (const { x, y } of section.grains) {
    const row = Math.floor(y);
    if (row >= 0 && row < height) frame[row * width + x] = 3;
  }

  return frame;
}
