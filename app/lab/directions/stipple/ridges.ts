/*
 * Front Range
 * ==================================================
 * The view west from Denver, in moving stipple, for the contact page: four
 * ranges in aerial perspective with snow on the high peaks, downtown in
 * front of the foothills, and the sky as it is there right now. The sun
 * crosses between the day's sunrise and sunset; at night the moon shows
 * its real phase over lit windows. Clouds drift and shade the foothills,
 * and rain, snow, fog, or a storm come in with the weather. Each frame is
 * a grid of dot levels for `paint`: 1 sage, 2 deep sage, 3 midtone, 4 ink.
 */

import type { Condition } from "../../site";

import { fbm, grain, hash, levelFor, type Levels } from "./dither";

export type Sky = Condition | "unknown";

export interface View {
  width: number;
  height: number;
  seed: number;
  /** Ridgeline of each range, far to near, by column */
  tops: Float32Array[];
  /** Ink coverage of the land, or -1 for sky */
  land: Float32Array;
  /** Which range (0–3) or the city (4) a cell is in, or -1 for sky */
  layer: Int8Array;
  /** How far below its ridgeline a cell is */
  depth: Float32Array;
  /** Windows in the city's towers */
  windows: Uint8Array;
  /** A cloud field that tiles across the width, so it can drift forever */
  clouds: Float32Array;
  threshold: Float32Array;
  /** The frame being drawn, reused from frame to frame */
  frame: Levels;
}

/** Where the sun or moon is, and how the light is */
export interface Moment {
  night: boolean;
  /** How far across the sky the sun (or, at night, the moon) is, 0–1 */
  arc: number;
  /** 1 at sunrise and sunset, fading to 0 an hour either side */
  twilight: number;
  /** The moon's phase: 0 new, 0.5 full */
  phase: number;
}

// Far to near: base height and relief as fractions of the frame, how
// often the ridgeline turns, whether it's jagged, and the ink it takes
const RANGES = [
  { base: 0.5, relief: 0.36, turns: 3.4, jagged: true, ink: 0.26 },
  { base: 0.62, relief: 0.22, turns: 4.6, jagged: true, ink: 0.4 },
  { base: 0.75, relief: 0.13, turns: 2.8, jagged: false, ink: 0.55 },
  { base: 0.87, relief: 0.08, turns: 2.1, jagged: false, ink: 0.7 }
];

const WEATHER: Record<
  Sky,
  {
    /** Cloud: where it starts, how dense it gets, how low it comes */
    cover: number;
    density: number;
    low: number;
    /** Sun or moon, stars, and twilight glow show through */
    open: boolean;
  }
> = {
  clear: { cover: 0.64, density: 0.36, low: 0.3, open: true },
  unknown: { cover: 0.64, density: 0.36, low: 0.3, open: true },
  cloudy: { cover: 0.5, density: 0.5, low: 0.45, open: true },
  fog: { cover: 0.52, density: 0.4, low: 0.4, open: false },
  rain: { cover: 0.44, density: 0.58, low: 0.55, open: false },
  snow: { cover: 0.46, density: 0.5, low: 0.55, open: false },
  storm: { cover: 0.4, density: 0.7, low: 0.6, open: false }
};

const SYNODIC_DAYS = 29.530588853;
const NEW_MOON = Date.UTC(2000, 0, 6, 18, 14);

/** The moon's phase on a date: 0 new, 0.25 first quarter, 0.5 full */
export const moonPhase = (date: Date) =>
  (((((date.getTime() - NEW_MOON) / 86_400_000) % SYNODIC_DAYS) +
    SYNODIC_DAYS) %
    SYNODIC_DAYS) /
  SYNODIC_DAYS;

const PHASES = [
  "New moon",
  "Waxing crescent",
  "First quarter moon",
  "Waxing gibbous moon",
  "Full moon",
  "Waning gibbous moon",
  "Last quarter moon",
  "Waning crescent"
];

/** A phase by name, e.g. `Waxing gibbous moon` */
export const phaseName = (phase: number) => PHASES[Math.round(phase * 8) % 8];

/**
 * The light at `hour` (decimal hours, local), given the day's sunrise and
 * sunset in the same terms
 */
export function momentAt(
  hour: number,
  sunrise: number,
  sunset: number,
  phase: number
): Moment {
  const night = hour < sunrise || hour >= sunset;
  const day = sunset - sunrise;
  const arc = night
    ? ((hour - sunset + 24) % 24) / (24 - day)
    : (hour - sunrise) / day;
  const twilight = Math.max(
    0,
    1 - Math.abs(hour - sunrise) / 1,
    1 - Math.abs(hour - sunset) / 1
  );
  return { night, arc, twilight, phase };
}

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Value noise that repeats every `period` lattice cells across */
function tiledNoise(x: number, y: number, seed: number, period: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const u = (x - xi) ** 2 * (3 - 2 * (x - xi));
  const v = (y - yi) ** 2 * (3 - 2 * (y - yi));
  const x0 = ((xi % period) + period) % period;
  const x1 = (x0 + 1) % period;
  const a = hash(x0, yi, seed);
  const b = hash(x1, yi, seed);
  const c = hash(x0, yi + 1, seed);
  const d = hash(x1, yi + 1, seed);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

function tiledFbm(x: number, y: number, seed: number, period: number) {
  let sum = 0;
  let amplitude = 0.5;
  let frequency = 1;
  let total = 0;
  for (let octave = 0; octave < 4; octave++) {
    sum +=
      amplitude *
      tiledNoise(
        x * frequency,
        y * frequency,
        seed + octave,
        period * frequency
      );
    total += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }
  return sum / total;
}

/** The land and the cloud field for a frame, the same for a seed every time */
export function frontRange(width: number, height: number, seed: number): View {
  const size = width * height;
  // A frame wider than 21:9 gets more peaks, not wider ones
  const stretch = Math.max(1, width / height / (21 / 9));

  const tops = RANGES.map((range, index) => {
    const top = new Float32Array(width);
    for (let x = 0; x < width; x++) {
      let n = fbm(
        (x / width) * range.turns * stretch + 10,
        index * 3.1,
        seed + index * 11
      );
      n = range.jagged
        ? (1 - Math.abs(2 * n - 1)) ** 1.6
        : clamp((n - 0.3) / 0.4);
      top[x] = height * (range.base + range.relief * (0.4 - n));
    }
    return top;
  });

  const land = new Float32Array(size).fill(-1);
  const layer = new Int8Array(size).fill(-1);
  const depth = new Float32Array(size);
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let range = -1;
      for (let index = RANGES.length - 1; index >= 0; index--) {
        if (y >= tops[index][x]) {
          range = index;
          break;
        }
      }
      if (range < 0) continue;
      const index = y * width + x;
      const below = y - tops[range][x];
      // Valleys fade into haze, so each range stands off the next
      land[index] =
        below < 1
          ? range === 0
            ? 0.62
            : 0.86
          : RANGES[range].ink *
            (1 - 0.42 * smoothstep(0, height * 0.13, below));
      layer[index] = range;
      depth[index] = below;
    }
  }

  // Downtown, in front of the foothills, tallest in the middle, and no
  // wider than its height allows
  const windows = new Uint8Array(size);
  const city = Math.min(width * 0.26, height * 1.25);
  const [from, to] = [
    Math.round(width * 0.67 - city / 2),
    Math.round(width * 0.67 + city / 2)
  ];
  for (let x = from; x < to;) {
    const span = 3 + Math.floor(hash(x, 1, seed) * 6);
    const middle = 1 - Math.abs((x - (from + to) / 2) / ((to - from) / 2));
    const tall = Math.round(
      height * (0.03 + hash(x, 2, seed) ** 2 * 0.07 + middle * 0.09)
    );
    for (let y = height - tall; y < height; y++) {
      for (let column = x; column < Math.min(x + span, to); column++) {
        const index = y * width + column;
        land[index] = 0.9;
        layer[index] = 4;
        const inside = column > x && column < x + span - 1;
        if (inside && (column - x) % 2 === 1 && (y - height + tall) % 3 === 2) {
          windows[index] = 1;
        }
      }
    }
    x += span + 1;
  }

  const period = Math.max(2, Math.round(width / 110));
  const scale = width / period;
  const clouds = new Float32Array(size);
  const threshold = new Float32Array(size);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      clouds[index] = tiledFbm(x / scale, y / (scale * 0.55), seed + 5, period);
      threshold[index] = grain(x, y, seed);
    }
  }

  return {
    width,
    height,
    seed,
    tops,
    land,
    layer,
    depth,
    windows,
    clouds,
    threshold,
    frame: new Uint8Array(size)
  };
}

/** One frame of the view under `sky` at `moment`, `time` seconds in */
export function frontRangeFrame(
  view: View,
  sky: Sky,
  moment: Moment,
  time: number
): Levels {
  const { width, height, seed, tops, land, layer, depth, windows, clouds } =
    view;
  const { threshold, frame } = view;
  const weather = WEATHER[sky];
  const { night, arc, twilight, phase } = moment;

  // The sun or moon, low at either end of its arc
  const bx = width * (0.12 + 0.76 * arc);
  const by = height * (0.62 - 0.5 * Math.sin(Math.PI * arc));
  const radius = height * 0.08;
  const reach = (radius + 14) ** 2;
  // On the moon, light comes from the side the phase puts it on
  const lightX = Math.sin(phase * Math.PI * 2);
  const lightZ = -Math.cos(phase * Math.PI * 2);
  const turn = time * 0.08;

  const drift = Math.floor(time * 1.6);
  const snowLine = height * (sky === "snow" ? 0.6 : 0.36);
  const fog = sky === "fog";

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      const ground = land[index];
      const cloudAt = clouds[y * width + ((x + drift) % width)];
      let ink: number;

      if (ground < 0) {
        let cloud =
          smoothstep(weather.cover, weather.cover + 0.16, cloudAt) *
          weather.density *
          (1 -
            smoothstep(height * weather.low, height * (weather.low + 0.25), y));
        if (night) cloud *= 0.6;
        ink = cloud;

        if (weather.open) {
          ink = Math.max(
            ink,
            twilight * smoothstep(height * 0.22, height * 0.62, y) * 0.34
          );
          if (
            night &&
            cloud < 0.1 &&
            hash(x, y, seed + 3) < 0.0022 &&
            hash(x, y, seed + Math.floor(time * 2.5)) > 0.22
          ) {
            ink = 0.95;
          }

          const dx = x - bx;
          const dy = y - by;
          const r2 = dx * dx + dy * dy;
          if (r2 < reach) {
            const r = Math.sqrt(r2);
            let disc = 0;
            if (night && r < radius) {
              const nx = dx / radius;
              const ny = dy / radius;
              const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
              const light = smoothstep(-0.05, 0.25, nx * lightX + nz * lightZ);
              disc = 0.08 + (1 - light) * 0.38;
            } else if (!night) {
              if (r < radius) disc = 0.42;
              if (r > radius + 3 && r < radius + 12) {
                const ray = (Math.atan2(dy, dx) / (Math.PI * 2) + turn) * 12;
                if (Math.abs(ray - Math.round(ray)) < 0.09) disc = 0.7;
              }
            }
            if (Math.abs(r - radius) < 0.7) disc = 0.95;
            ink = Math.max(disc, cloud);
          }
        } else if (fog) {
          ink = Math.max(ink, smoothstep(height * 0.25, height * 0.7, y) * 0.3);
        }
      } else {
        ink = ground;
        const range = layer[index];
        const below = depth[index];

        // Snow on the high peaks, lower when it's snowing
        if (range <= (sky === "snow" ? 1 : 0) && below >= 1) {
          const top = tops[range][x];
          const jitter = (hash(x, 3, seed) - 0.5) * 3;
          if (top < snowLine && below < (snowLine - top) * 0.7 + jitter) {
            ink = 0.04;
          }
        }

        if (range >= 2 && range < 4 && weather.open) {
          // Cloud shadow, from the cloud field a little upwind
          const shade =
            clouds[
              Math.max(0, y - Math.round(height * 0.4)) * width +
                ((x + drift + 30) % width)
            ];
          ink += smoothstep(0.58, 0.74, shade) * 0.14;
        }
        if (range < 4 && !night && weather.open) {
          // Slopes facing the sun are lit
          const slope =
            (tops[range][Math.min(width - 1, x + 2)] -
              tops[range][Math.max(0, x - 2)]) /
            4;
          ink -= Math.max(-1, Math.min(1, slope * Math.sign(bx - x))) * 0.06;
        }
        // Shade never darkens land to full ink, which is kept for ridgelines
        // and the city
        if (range < 4 && below >= 1) ink = Math.min(ink, 0.78);
        if (fog && range < 4) {
          const bank = 0.35 + 0.5 * smoothstep(0.4, 0.75, cloudAt);
          ink = lerp(ink, 0.16, bank * (1 - range * 0.15));
        }
        if (night) ink = range === 0 && ink < 0.1 ? 0.14 : ink * 0.85 + 0.12;

        if (windows[index]) {
          // Lit windows at night, switching on and off now and then
          const lit =
            night &&
            hash(x, y, seed + Math.floor(time * 0.4 + hash(x, y, 9) * 7)) > 0.3;
          frame[index] = lit
            ? 0
            : levelFor(night ? 0.9 : 0.55, threshold[index]);
          continue;
        }
      }

      frame[index] = levelFor(ink, threshold[index]);
    }
  }

  if (sky === "rain" || sky === "storm") rain(view, time, sky === "storm");
  if (sky === "snow") snow(view, time);
  if (sky === "storm") lightning(view, time);

  return frame;
}

/** Slanting streaks, four cells long */
function rain(
  { width, height, seed, frame }: View,
  time: number,
  heavy: boolean
) {
  const drops = Math.round(((width * height) / 160) * (heavy ? 1.4 : 1));
  const fall = height * 1.3;
  for (let drop = 0; drop < drops; drop++) {
    const y = ((hash(drop, 2, seed) * fall + time * 70) % fall) - height * 0.15;
    const x = hash(drop, 1, seed) * width * 1.2 - y * 0.3;
    for (let step = 0; step < 4; step++) {
      const column = Math.round(x - step * 0.3);
      const row = Math.round(y - step);
      if (column >= 0 && row >= 0 && column < width && row < height) {
        frame[row * width + column] = 3;
      }
    }
  }
}

/** Flakes drifting down, swaying; paper-white where they cross dark land */
function snow({ width, height, seed, frame }: View, time: number) {
  const flakes = Math.round((width * height) / 200);
  for (let flake = 0; flake < flakes; flake++) {
    const speed = 10 + hash(flake, 3, seed) * 8;
    const y = Math.round(
      (hash(flake, 2, seed) * height + time * speed) % height
    );
    const sway = Math.sin(time * 0.9 + flake) * 3;
    const x = Math.round(
      (((hash(flake, 1, seed) * width + sway + time * 2) % width) + width) %
        width
    );
    const big = hash(flake, 4, seed) < 0.3;
    for (const [dx, dy] of big
      ? [
          [0, 0],
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1]
        ]
      : [[0, 0]]) {
      const column = x + dx;
      const row = y + dy;
      if (column < 0 || row < 0 || column >= width || row >= height) continue;
      const index = row * width + column;
      frame[index] = frame[index] >= 3 ? 0 : 3;
    }
  }
}

/** Now and then, a bolt from the cloud to the far range */
function lightning({ width, height, seed, tops, frame }: View, time: number) {
  const strike = Math.floor(time / 5.5);
  if (time - strike * 5.5 > 0.25 || hash(strike, 9, seed) < 0.3) return;
  let x = (0.15 + 0.7 * hash(strike, 7, seed)) * width;
  let y = Math.round(height * 0.08);
  const ground = tops[0][Math.round(x)];
  while (y < ground) {
    const next = x + (hash(strike, Math.round(y), seed) - 0.5) * 4;
    for (let step = 0; step < 3; step++) {
      const column = Math.round(lerp(x, next, step / 3));
      const row = Math.round(y + step);
      if (column >= 0 && column < width) frame[row * width + column] = 4;
    }
    x = next;
    y += 3;
  }
}
