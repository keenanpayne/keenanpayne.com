/*
 * Stipple rendering
 * ==================================================
 * Photos and generated terrain are drawn as dots in the direction's inks:
 * error diffusion (Atkinson) for photos, ordered dither with grain for
 * terrain. Each dot is one canvas pixel, scaled up without smoothing, so
 * the dots stay crisp at any size. The inks come from CSS custom properties,
 * so the art follows the light and dark tokens like everything else.
 */

/** Dot levels, one per cell: 0 is paper, then each ink in the palette */
export type Levels = Uint8Array;

export interface Inks {
  dark: boolean;
  /** RGBA for levels 1 and up */
  colors: [number, number, number, number][];
}

/** Cloudinary and this site send images the canvas may read back */
export const canDither = (src: string) =>
  src.startsWith("/") || src.startsWith("https://res.cloudinary.com/");

/* Inks
   ========================================================================== */

let probe: CanvasRenderingContext2D | null = null;

/** Any CSS color as RGBA, via the canvas's own color parser */
function toRgba(color: string): [number, number, number, number] {
  probe ??= document.createElement("canvas").getContext("2d");
  if (!probe) return [0, 0, 0, 255];
  probe.fillStyle = "#000";
  probe.fillStyle = color;
  const value = String(probe.fillStyle);
  if (value.startsWith("#")) {
    const hex = Number.parseInt(value.slice(1), 16);
    return [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255, 255];
  }
  const [r = 0, g = 0, b = 0, a = 1] = value
    .replace(/[^\d.,]/g, "")
    .split(",")
    .map(Number);
  return [r, g, b, Math.round(a * 255)];
}

/** Reads a palette of custom properties (e.g. `--st-ink`) off an element */
export function readInks(element: Element, palette: string[]): Inks {
  const style = getComputedStyle(element);
  return {
    dark: style.getPropertyValue("--st-scheme").trim() === "dark",
    colors: palette.map((name) => toRgba(style.getPropertyValue(name).trim()))
  };
}

/** Calls back when the color scheme may have changed */
export function subscribeToScheme(onChange: () => void) {
  const query = matchMedia("(prefers-color-scheme: dark)");
  const observer = new MutationObserver(onChange);
  query.addEventListener("change", onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"]
  });
  return () => {
    query.removeEventListener("change", onChange);
    observer.disconnect();
  };
}

/* Noise
   ========================================================================== */

/** A stable 32-bit seed for a string, e.g. a page path */
export function seedOf(text: string) {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index++) {
    hash = Math.imul(hash ^ text.charCodeAt(index), 16777619);
  }
  return hash >>> 0;
}

/** Deterministic noise in [0, 1) for a lattice point */
export function hash(x: number, y: number, seed: number) {
  let h =
    Math.imul(x, 374761393) +
    Math.imul(y, 668265263) +
    Math.imul(seed, 2246822519);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

function valueNoise(x: number, y: number, seed: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi, seed);
  const b = hash(xi + 1, yi, seed);
  const c = hash(xi, yi + 1, seed);
  const d = hash(xi + 1, yi + 1, seed);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

export function fbm(x: number, y: number, seed: number, octaves = 5) {
  let sum = 0;
  let amplitude = 0.5;
  let frequency = 1;
  let total = 0;
  for (let octave = 0; octave < octaves; octave++) {
    sum += amplitude * valueNoise(x * frequency, y * frequency, seed + octave);
    total += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }
  return sum / total;
}

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

// 8×8 Bayer matrix, as thresholds in (0, 1)
const BAYER = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36,
  14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41,
  51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23,
  61, 29, 53, 21
].map((value) => (value + 0.5) / 64);

/**
 * Where a cell's dot switches on, in (0, 1): an ordered pattern roughened
 * with grain, so stipple reads as hand-set rather than printed
 */
export const grain = (x: number, y: number, seed: number) =>
  BAYER[(y % 8) * 8 + (x % 8)] * 0.55 + hash(x, y, seed + 7) * 0.45;

/* Terrain
   ========================================================================== */

/**
 * Where the land sits in the frame:
 * - `drift`: a cloud banked against the top right, thinning to the left
 * - `field`: ground across the whole frame
 * - `isle`: a mass in the middle, dissolving at the edges
 */
export type TerrainShape = "drift" | "field" | "isle";

/**
 * Generated terrain as dot levels: 1 for the field, 2 for its densest
 * ground. `scale` is the size of its largest features, in cells.
 */
export function terrain(
  width: number,
  height: number,
  seed: number,
  shape: TerrainShape,
  scale: number
): Levels {
  const levels = new Uint8Array(width * height);

  // Level the land where the shape is anchored, so every seed grows a
  // mass of about the same size there
  const [anchorU, anchorV] = shape === "drift" ? [0.9, 0.15] : [0.5, 0.48];
  let anchor = 0;
  for (let index = 0; index < 9; index++) {
    const u = anchorU + ((index % 3) - 1) * 0.12;
    const v = anchorV + (Math.floor(index / 3) - 1) * 0.12;
    anchor += fbm((u * width) / scale, (v * height) / scale, seed) / 9;
  }
  const level = shape === "field" ? 0 : 0.5 - anchor;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const u = x / width;
      const v = y / height;
      const land = fbm(x / scale, y / scale, seed) + level;
      // Warped a little by a second field, so edges fray instead of blur
      const fray = fbm(x / (scale * 0.18), y / (scale * 0.18), seed + 97, 3);

      // How much the shape lifts or sinks the land at this point, so its
      // edges stay fractal instead of fading out radially
      let bias = 0;
      // Isles are lit from the upper left, with their far side in shadow
      let shade = -1;
      if (shape === "drift") {
        bias = 0.6 - Math.hypot((1 - u) / 0.7, v / 0.9) * 0.75;
      } else if (shape === "isle") {
        bias = 0.42 - Math.hypot((u - 0.5) / 0.5, (v - 0.48) / 0.46) * 0.78;
        shade = (u - 0.5) * 0.9 + (v - 0.5) * 1.3 + (land - 0.5);
      }

      const density =
        smoothstep(0.38, 0.66, land + bias + (fray - 0.5) * 0.3) * 0.9;
      const threshold = grain(x, y, seed);

      if (density > threshold) {
        const deep =
          shade * 2.4 > hash(x, y, seed + 13) ||
          (density > 0.8 && threshold < 0.3);
        levels[y * width + x] = deep ? 2 : 1;
      }
    }
  }

  return levels;
}

/* Photos
   ========================================================================== */

/**
 * How much ink each cell of a photo takes, cropped to cover the frame like
 * `object-fit: cover`. On a dark scheme the ink is light, so it follows
 * the photo's highlights instead of its shadows.
 */
export function photoCoverage(
  image: HTMLImageElement,
  width: number,
  height: number,
  dark: boolean
) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;

  const { naturalWidth, naturalHeight } = image;
  const scale = Math.max(width / naturalWidth, height / naturalHeight);
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  context.imageSmoothingQuality = "high";
  context.drawImage(
    image,
    (naturalWidth - sourceWidth) / 2,
    (naturalHeight - sourceHeight) / 2,
    sourceWidth,
    sourceHeight,
    0,
    0,
    width,
    height
  );

  // Throws on an image without CORS headers; the caller keeps the photo
  return inkOf(context.getImageData(0, 0, width, height).data, dark);
}

/**
 * Ink coverage for RGBA pixels, in [0, 1]. Contrast is stretched a little,
 * so flat photos still have range, and capped short of solid ink, so dark
 * areas read as dense stipple. A little grain keeps flat color from
 * landing exactly on one ink and printing solid.
 */
export function inkOf(data: ArrayLike<number>, dark: boolean) {
  const coverage = new Float32Array(data.length / 4);
  const histogram = new Uint32Array(256);

  for (let index = 0; index < coverage.length; index++) {
    const offset = index * 4;
    const alpha = data[offset + 3] / 255;
    const luminance =
      (0.2126 * data[offset] +
        0.7152 * data[offset + 1] +
        0.0722 * data[offset + 2]) /
      255;
    // Transparent pixels read as paper
    const value = alpha * luminance + (1 - alpha) * (dark ? 0 : 1);
    coverage[index] = dark ? value : 1 - value;
    histogram[Math.round(coverage[index] * 255)]++;
  }

  const percentile = (fraction: number) => {
    let count = 0;
    for (let bin = 0; bin < 256; bin++) {
      count += histogram[bin];
      if (count >= coverage.length * fraction) return bin / 255;
    }
    return 1;
  };
  const low = percentile(0.02);
  const high = Math.max(percentile(0.98), low + 0.2);

  for (let index = 0; index < coverage.length; index++) {
    const value = coverage[index];
    const stretched = Math.min(1, Math.max(0, (value - low) / (high - low)));
    const toned = (value * 0.65 + stretched * 0.35) ** 1.1 * 0.84;
    coverage[index] = toned + (hash(index, 1, 3) - 0.5) * 0.08;
  }

  return coverage;
}

/**
 * Atkinson dithering to a few levels of ink: 0 for paper, then one level
 * per step. It diffuses only three quarters of the error, which keeps
 * highlights open and shadows solid.
 */
export function atkinson(
  coverage: Float32Array,
  width: number,
  height: number,
  steps = [0, 0.42, 1]
): Levels {
  const buffer = Float32Array.from(coverage);
  const levels = new Uint8Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      const value = buffer[index];
      let level = 0;
      for (let step = 1; step < steps.length; step++) {
        if (Math.abs(value - steps[step]) < Math.abs(value - steps[level])) {
          level = step;
        }
      }
      levels[index] = level;

      const error = (value - steps[level]) / 8;
      if (x + 1 < width) buffer[index + 1] += error;
      if (x + 2 < width) buffer[index + 2] += error;
      if (y + 1 < height) {
        if (x > 0) buffer[index + width - 1] += error;
        buffer[index + width] += error;
        if (x + 1 < width) buffer[index + width + 1] += error;
      }
      if (y + 2 < height) buffer[index + width * 2] += error;
    }
  }

  return levels;
}

/* Painting
   ========================================================================== */

/**
 * Paints dot levels into a canvas. Below a `progress` of 1, only some dots
 * show, chosen at random, for the dissolve as the art develops.
 */
export function paint(
  canvas: HTMLCanvasElement,
  levels: Levels,
  width: number,
  height: number,
  inks: Inks,
  progress = 1
) {
  const context = canvas.getContext("2d");
  if (!context) return;
  const image = context.createImageData(width, height);
  const { data } = image;

  for (let index = 0; index < levels.length; index++) {
    const level = levels[index];
    if (!level) continue;
    if (progress < 1 && hash(index, 0, 31) > progress) continue;
    const color = inks.colors[level - 1];
    const offset = index * 4;
    data[offset] = color[0];
    data[offset + 1] = color[1];
    data[offset + 2] = color[2];
    data[offset + 3] = color[3];
  }

  context.putImageData(image, 0, 0);
}
