/*
 * Sky
 * ==================================================
 * The sky over Denver in moving stipple, for the weather popover: a sun
 * with turning rays, a moon among twinkling stars, drifting cloud, fog
 * banks, slanting rain, falling snow, or a storm with lightning. Each frame
 * is a grid of dot levels for `paint`: 1 sage, 2 midtone, 3 ink. The left
 * of the frame stays clear for the reading laid over it.
 */

import type { Condition } from "../../site";

import { fbm, grain, hash, type Levels } from "./dither";

export type Sky = Condition | "unknown";

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

/** One frame of the sky, `time` seconds in */
export function skyFrame(
  width: number,
  height: number,
  sky: Sky,
  night: boolean,
  time: number
): Levels {
  const levels = new Uint8Array(width * height);
  const H = height;
  // Clear on the left, where the reading sits
  const clearing = (x: number) => smoothstep(0.3, 0.62, x / width);

  /** A small cross of dots: a star or a flake */
  const spark = (x: number, y: number, level: number) => {
    put(x, y, level);
    put(x - 1, y, level);
    put(x + 1, y, level);
    put(x, y - 1, level);
    put(x, y + 1, level);
  };

  /** Sets a dot, keeping the darker of what's there */
  const put = (x: number, y: number, level: number) => {
    const column = Math.round(x);
    const row = Math.round(y);
    if (column < 0 || row < 0 || column >= width || row >= height) return;
    const index = row * width + column;
    if (level > levels[index]) levels[index] = level;
  };

  /** Puffy cloud, drifting right by `drift` cells */
  const cloud = (
    x: number,
    y: number,
    drift: number,
    scale: number,
    seed: number
  ) => fbm((x - drift) / scale, y / (scale * 0.6), seed, 4);

  /** Cloud banks: a far, pale layer and a near, darker one */
  const banks = (low: number, heavy: boolean) => {
    for (let y = 0; y < height; y++) {
      const v = y / H;
      const ceiling = 1 - smoothstep(low - 0.2, low, v);
      for (let x = 0; x < width; x++) {
        const open = clearing(x) * ceiling;
        if (!open) continue;
        const far = smoothstep(
          0.44,
          0.66,
          cloud(x, y, time * 1.6, H * 0.42, 11)
        );
        const near = smoothstep(
          heavy ? 0.4 : 0.52,
          heavy ? 0.64 : 0.72,
          cloud(x, y, time * 3.6, H * 0.3, 23)
        );
        const threshold = grain(x, y, 3);
        if (near * open > threshold) {
          put(x, y, heavy && near > 0.75 && threshold < 0.45 ? 3 : 2);
        } else if (far * open * (heavy ? 0.95 : 0.8) > threshold) {
          put(x, y, 1);
        }
      }
    }
  };

  /** Rain slanting down from the cloud base */
  const rain = (share: number, speed: number, top: number) => {
    const slant = 0.35;
    const period = H * (1.2 - top);
    const length = H * 0.1;
    for (let y = Math.floor(top * H); y < height; y++) {
      for (let x = 0; x < width; x++) {
        const column = Math.round(x + y * slant);
        if (hash(column, 0, 51) > share || hash(column, 2, 51) > clearing(x)) {
          continue;
        }
        for (const offset of [0, 0.5]) {
          const phase = (hash(column, 1, 51) + offset) % 1;
          const fall = (phase * period + time * speed * H) % period;
          const head = top * H + fall;
          if (y <= head && y > head - length) put(x, y, 2);
        }
      }
    }
  };

  switch (sky) {
    case "clear": {
      const [cx, cy, radius] = [width * 0.8, H * 0.5, H * 0.21];
      if (night) {
        // Moon, shaded in halftone, lit from the upper left
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const dx = (x - cx) / radius;
            const dy = (y - cy) / radius;
            const d = Math.hypot(dx, dy);
            if (d > 1.06) continue;
            if (d > 0.92) {
              put(x, y, 3);
              continue;
            }
            const lit = Math.max(
              0,
              -0.55 * dx - 0.6 * dy + 0.58 * Math.sqrt(1 - d * d)
            );
            const shadow = (1 - lit) * 0.95;
            if (shadow > grain(x, y, 9)) put(x, y, shadow > 0.7 ? 3 : 2);
          }
        }
        // Stars, twinkling at their own pace
        for (let star = 0; star < 60; star++) {
          const x = hash(star, 1, 61) * width;
          const y = hash(star, 2, 61) * H * 0.92;
          if (hash(star, 3, 61) > clearing(x)) continue;
          if (Math.hypot(x - cx, y - cy) < radius * 1.5) continue;
          const pace = 1 + hash(star, 4, 61) * 2;
          if (Math.sin(time * pace + hash(star, 5, 61) * 6.3) < -0.35) continue;
          if (hash(star, 6, 61) < 0.3) spark(x, y, 2);
          else put(x, y, 3);
        }
      } else {
        // Sun: a ring, slowly turning rays, and a shimmering glow
        const shimmer = Math.floor(time * 3);
        const turn = time * 0.15;
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const d = Math.hypot(x - cx, y - cy) / radius;
            if (Math.abs(d - 1) < 0.09) {
              put(x, y, 3);
              continue;
            }
            const angle = Math.atan2(y - cy, x - cx) - turn;
            const ray = Math.abs(
              ((((angle / (Math.PI / 6)) % 1) + 1) % 1) - 0.5
            );
            if (d > 1.35 && d < 1.85 && ray > 0.38) {
              put(x, y, 2);
              continue;
            }
            const glow = d < 1 ? 0.12 : 0.55 * (1 - smoothstep(1, 3.2, d));
            if (glow * clearing(x) > grain(x, y, shimmer)) put(x, y, 1);
          }
        }
      }
      break;
    }

    case "cloudy":
      banks(1.2, false);
      break;

    case "fog":
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const open = clearing(x);
          const bank = fbm((x - time * 1.0) / (H * 0.9), y / (H * 0.12), 31, 3);
          const wisp = fbm((x + time * 0.7) / (H * 0.7), y / (H * 0.1), 37, 3);
          const threshold = grain(x, y, 4);
          if (smoothstep(0.55, 0.7, wisp) * 0.55 * open > threshold)
            put(x, y, 2);
          else if (smoothstep(0.4, 0.62, bank) * 0.75 * open > threshold)
            put(x, y, 1);
        }
      }
      break;

    case "rain":
      banks(0.5, false);
      rain(0.3, 1.3, 0.3);
      break;

    case "snow": {
      banks(0.42, false);
      for (let flake = 0; flake < 64; flake++) {
        const fall = H * (0.1 + hash(flake, 2, 71) * 0.1);
        const span = H * 1.2;
        const y = ((hash(flake, 3, 71) * span + time * fall) % span) - H * 0.1;
        const x =
          hash(flake, 1, 71) * width +
          Math.sin(time * 1.3 + hash(flake, 4, 71) * 6.3) * H * 0.05;
        if (hash(flake, 6, 71) > clearing(x)) continue;
        if (hash(flake, 5, 71) < 0.65) spark(x, y, 2);
        else put(x, y, 3);
      }
      break;
    }

    case "storm": {
      banks(0.62, true);
      rain(0.4, 1.9, 0.4);
      // Lightning: a bolt and a flash, then a flicker, every few seconds
      const cycle = 4.8;
      const strike = Math.floor(time / cycle);
      const since = time - strike * cycle;
      if (since < 0.18 || (since > 0.26 && since < 0.36)) {
        let x = width * (0.58 + hash(strike, 1, 81) * 0.3);
        let y = H * 0.38;
        while (y < H * 0.96) {
          const nextX = x + (hash(strike, Math.round(y), 81) - 0.5) * H * 0.22;
          const nextY = y + H * 0.12;
          const steps = Math.ceil(Math.max(Math.abs(nextX - x), nextY - y));
          for (let step = 0; step <= steps; step++) {
            const px = x + ((nextX - x) * step) / steps;
            const py = y + ((nextY - y) * step) / steps;
            put(px, py, 3);
            put(px + 1, py, 3);
          }
          [x, y] = [nextX, nextY];
        }
        for (let index = 0; index < levels.length; index++) {
          const column = index % width;
          if (
            !levels[index] &&
            0.3 * clearing(column) >
              grain(column, Math.floor(index / width), strike)
          ) {
            levels[index] = 1;
          }
        }
      }
      break;
    }

    default:
      // No reading yet: a faint haze, drifting
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const haze = smoothstep(
            0.5,
            0.7,
            cloud(x, y, time * 1.2, H * 0.5, 5)
          );
          if (haze * 0.5 * clearing(x) > grain(x, y, 5)) put(x, y, 1);
        }
      }
  }

  return levels;
}
