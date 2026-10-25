/**
 * The Blueprint's squares
 * ==================================================
 * The Blueprint panel (behind the home page's terminal, and the closing call
 * to action) fills the squares of its grid where it's clicked or dragged.
 * Filling one is also how its easter egg is found: grid tools for the
 * brush's color, the tile size, an eraser, symmetry, and the Game of Life.
 * This is their state and arithmetic; `parts.tsx` draws the panel and
 * `GridTools.tsx` the toolbar.
 */

import { useCallback, useSyncExternalStore } from "react";

/** A square of the grid, counted in squares from the middle one */
export type Square = { column: number; row: number };

/**
 * A filled square, in a brush's color; `leaving` while it fades out. `step`
 * is its place among squares filled together (a lettering's), which fill in
 * one after another.
 */
export type Paint = Square & {
  brush: BrushId;
  leaving?: boolean;
  step?: number;
};

/** The squares a panel shows, at their edges (inclusive) */
export type Bounds = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

/* Settings
   ========================================================================== */

/**
 * The brushes, in order; the stylesheet colors each `[data-brush]`. Spectrum
 * colors a square by where it is, so a drawing in it comes out a rainbow.
 */
export const BRUSHES = {
  violet: "Violet",
  coral: "Coral",
  amber: "Amber",
  mint: "Mint",
  sky: "Sky",
  ink: "Ink",
  spectrum: "Spectrum"
} satisfies Record<string, string>;

export type BrushId = keyof typeof BRUSHES;

/** The tile sizes, in pixels */
export const SIZES = [16, 24, 32, 48, 64, 96] as const;

export type Size = (typeof SIZES)[number];

/** How a stroke is reflected about the middle square */
export const SYMMETRIES = {
  off: "Off",
  mirror: "Mirror",
  kaleidoscope: "Kaleidoscope"
} satisfies Record<string, string>;

export type SymmetryId = keyof typeof SYMMETRIES;

export type GridSettings = {
  brush: BrushId;
  size: Size;
  erase: boolean;
  symmetry: SymmetryId;
};

export const DEFAULT_SETTINGS: GridSettings = {
  brush: "violet",
  size: 48,
  erase: false,
  symmetry: "off"
};

/*
 * The settings are the page's, not one panel's: both panels on Home are one
 * grid, so a color or size picked at the terminal reaches the closing panel
 * too, and the next page's. The server always renders the defaults.
 */
let settings = DEFAULT_SETTINGS;
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** The grid tools' settings, and a function that changes some of them */
export function useGridSettings() {
  const current = useSyncExternalStore(
    subscribe,
    () => settings,
    () => DEFAULT_SETTINGS
  );
  const update = useCallback((change: Partial<GridSettings>) => {
    settings = { ...settings, ...change };
    listeners.forEach((listener) => listener());
  }, []);

  return [current, update] as const;
}

/* Squares
   ========================================================================== */

export const sameSquare = (a: Square, b: Square) =>
  a.column === b.column && a.row === b.row;

const keyOf = ({ column, row }: Square) => `${column} ${row}`;

/**
 * The square at a point in a panel of a size, for squares of `grid` pixels.
 * They're counted from the one centered in the panel (the grid is centered),
 * so filled squares stay on the grid when the panel resizes.
 */
export const squareAt = (
  x: number,
  y: number,
  { width, height }: { width: number; height: number },
  grid: number
): Square => ({
  column: Math.floor((x - (width / 2 - grid / 2)) / grid),
  row: Math.floor((y - (height / 2 - grid / 2)) / grid)
});

/** The squares a panel of a size shows, partly or wholly */
export const boundsOf = (
  box: { width: number; height: number },
  grid: number
): Bounds => {
  const first = squareAt(0, 0, box, grid);
  const last = squareAt(box.width - 1, box.height - 1, box, grid);
  return {
    left: first.column,
    right: last.column,
    top: first.row,
    bottom: last.row
  };
};

/** Each square once, in order */
const unique = (squares: Square[]) => {
  const seen = new Set<string>();
  return squares.filter((square) => {
    const key = keyOf(square);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

/**
 * A square and its reflections: across the middle column for a mirror, and
 * across both middle lines and both diagonals for a kaleidoscope
 */
export function reflect(square: Square, symmetry: SymmetryId): Square[] {
  const { column: c, row: r } = square;
  if (symmetry === "off") return [square];
  if (symmetry === "mirror") return unique([square, { column: -c, row: r }]);
  return unique(
    [
      [c, r],
      [-c, r],
      [c, -r],
      [-c, -r],
      [r, c],
      [-r, c],
      [r, -c],
      [-r, -c]
    ].map(([column, row]) => ({ column, row }))
  );
}

/**
 * Fills squares with a brush: an empty one fills, a fading one comes back,
 * and one filled in another color takes this one
 */
export function fill(
  paints: Paint[],
  squares: Square[],
  brush: BrushId
): Paint[] {
  let next = paints;
  for (const square of squares) {
    const paint = { column: square.column, row: square.row, brush };
    const found = next.find((item) => sameSquare(item, square));
    if (!found) next = [...next, paint];
    else if (found.leaving || found.brush !== brush) {
      next = next.map((item) => (item === found ? paint : item));
    }
  }
  return next;
}

/** Clears squares: they fade out, or simply go when `fade` is off */
export function clear(
  paints: Paint[],
  squares: Square[],
  fade: boolean
): Paint[] {
  const keys = new Set(squares.map(keyOf));
  if (!paints.some((paint) => !paint.leaving && keys.has(keyOf(paint)))) {
    return paints;
  }
  return fade
    ? paints.map((paint) =>
        !paint.leaving && keys.has(keyOf(paint))
          ? { ...paint, leaving: true }
          : paint
      )
    : paints.filter((paint) => !keys.has(keyOf(paint)));
}

/** Every square in the bounds, each picked by `random` one time in `1 / density` */
export function scatter(
  bounds: Bounds,
  density: number,
  random = Math.random
): Square[] {
  const squares: Square[] = [];
  for (let row = bounds.top; row <= bounds.bottom; row++) {
    for (let column = bounds.left; column <= bounds.right; column++) {
      if (random() < density) squares.push({ column, row });
    }
  }
  return squares;
}

/* Lettering
   ========================================================================== */

/** A face three squares wide and five tall, with only what the site writes */
const FACE: Record<string, string[]> = {
  "0": ["###", "#.#", "#.#", "#.#", "###"],
  "4": ["#.#", "#.#", "###", "..#", "..#"]
};

/**
 * Text written in filled squares, its characters a square apart: centered on
 * the middle column, its last row the one above the middle square (so copy
 * can start a square below the middle). Its squares fill in from the left.
 */
export function lettering(text: string, brush: BrushId): Paint[] {
  const glyphs = [...text].map((character) => FACE[character]);
  const width = glyphs.length * 4 - 1;
  const height = FACE["0"].length;
  const squares = glyphs.flatMap((glyph, index) =>
    glyph.flatMap((line, row) =>
      [...line].flatMap((mark, column) =>
        mark === "#" ? [{ column: index * 4 + column, row }] : []
      )
    )
  );

  return squares
    .sort((a, b) => a.column - b.column || a.row - b.row)
    .map(({ column, row }, step) => ({
      column: column - (width - 1) / 2,
      row: row - height,
      brush,
      step
    }));
}

/* The Game of Life
   ========================================================================== */

/** The brush most of a newborn square's three neighbors are in */
const majority = (brushes: BrushId[]) => {
  const counts = new Map<BrushId, number>();
  for (const brush of brushes) counts.set(brush, (counts.get(brush) ?? 0) + 1);
  return [...counts].reduce((best, entry) =>
    entry[1] > best[1] ? entry : best
  )[0];
};

/**
 * One generation of Conway's Game of Life over the filled squares the panel
 * shows, its edges wrapping around (a glider that leaves on the right comes
 * back on the left). A square with two or three filled neighbors stays; an
 * empty one with three is born, in its neighbors' most common color; the
 * rest die, fading out when `fade` is on. Squares out of view sit it out.
 * `changed` is false once nothing is born or dies.
 */
export function lifeStep(
  paints: Paint[],
  bounds: Bounds,
  fade: boolean
): { paints: Paint[]; changed: boolean } {
  const width = bounds.right - bounds.left + 1;
  const height = bounds.bottom - bounds.top + 1;
  const wrap = (at: number, from: number, size: number) =>
    from + ((((at - from) % size) + size) % size);
  const inView = ({ column, row }: Square) =>
    column >= bounds.left &&
    column <= bounds.right &&
    row >= bounds.top &&
    row <= bounds.bottom;

  const alive = new Map<string, Paint>();
  for (const paint of paints) {
    if (!paint.leaving && inView(paint)) alive.set(keyOf(paint), paint);
  }

  // Each square next to a filled one, with its filled neighbors' brushes
  const around = new Map<string, Square & { brushes: BrushId[] }>();
  for (const paint of alive.values()) {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (!dc && !dr) continue;
        const square = {
          column: wrap(paint.column + dc, bounds.left, width),
          row: wrap(paint.row + dr, bounds.top, height)
        };
        const key = keyOf(square);
        const entry = around.get(key) ?? { ...square, brushes: [] };
        entry.brushes.push(paint.brush);
        around.set(key, entry);
      }
    }
  }

  const dying = new Set<string>();
  for (const key of alive.keys()) {
    const neighbors = around.get(key)?.brushes.length ?? 0;
    if (neighbors < 2 || neighbors > 3) dying.add(key);
  }
  const born = new Map<string, Paint>();
  for (const [key, { column, row, brushes }] of around) {
    if (!alive.has(key) && brushes.length === 3) {
      born.set(key, { column, row, brush: majority(brushes) });
    }
  }
  if (!dying.size && !born.size) return { paints, changed: false };

  const next: Paint[] = [];
  for (const paint of paints) {
    const key = keyOf(paint);
    const newborn = born.get(key);
    // A square still fading out is born again where it is
    if (newborn) {
      next.push(newborn);
      born.delete(key);
    } else if (!dying.has(key)) next.push(paint);
    else if (fade) next.push({ ...paint, leaving: true });
  }
  return { paints: [...next, ...born.values()], changed: true };
}
