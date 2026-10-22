import { describe, expect, it } from "vitest";

import {
  boundsOf,
  clear,
  fill,
  lifeStep,
  reflect,
  scatter,
  squareAt,
  type Bounds,
  type Paint
} from "./blueprint";

const violet = (column: number, row: number): Paint => ({
  column,
  row,
  brush: "violet"
});

const BOUNDS: Bounds = { left: -5, right: 5, top: -5, bottom: 5 };

/** The live squares, as sorted "column row" keys */
const live = (paints: Paint[]) =>
  paints
    .filter((paint) => !paint.leaving)
    .map(({ column, row }) => `${column} ${row}`)
    .sort();

describe("squares", () => {
  it("counts from the one centered in the panel", () => {
    const box = { width: 480, height: 240 };
    expect(squareAt(240, 120, box, 48)).toEqual({ column: 0, row: 0 });
    expect(squareAt(215, 95, box, 48)).toEqual({ column: -1, row: -1 });
    expect(boundsOf(box, 48)).toEqual({
      left: -5,
      right: 5,
      top: -2,
      bottom: 2
    });
  });

  it("reflects across the middle, without repeats", () => {
    expect(reflect({ column: 2, row: 1 }, "off")).toHaveLength(1);
    expect(reflect({ column: 2, row: 1 }, "mirror")).toEqual([
      { column: 2, row: 1 },
      { column: -2, row: 1 }
    ]);
    expect(reflect({ column: 2, row: 1 }, "kaleidoscope")).toHaveLength(8);
    expect(reflect({ column: 0, row: 0 }, "kaleidoscope")).toHaveLength(1);
    expect(reflect({ column: 1, row: 1 }, "kaleidoscope")).toHaveLength(4);
  });

  it("fills empty squares, revives fading ones, and recolors others", () => {
    const paints = [
      violet(0, 0),
      { ...violet(1, 0), leaving: true },
      { ...violet(2, 0), brush: "mint" } as const
    ];
    const next = fill(
      paints,
      [0, 1, 2, 3].map((column) => ({ column, row: 0 })),
      "violet"
    );
    expect(next[0]).toBe(paints[0]);
    expect(next).toEqual([0, 1, 2, 3].map((column) => violet(column, 0)));
  });

  it("clears with a fade, or at once", () => {
    const paints = [violet(0, 0), violet(1, 0)];
    expect(clear(paints, [{ column: 0, row: 0 }], true)).toEqual([
      { ...violet(0, 0), leaving: true },
      violet(1, 0)
    ]);
    expect(clear(paints, [{ column: 0, row: 0 }], false)).toEqual([
      violet(1, 0)
    ]);
    expect(clear(paints, [{ column: 4, row: 4 }], true)).toBe(paints);
  });

  it("scatters only within the bounds", () => {
    const squares = scatter(BOUNDS, 1);
    expect(squares).toHaveLength(121);
    expect(scatter(BOUNDS, 0.5, () => 0.9)).toHaveLength(0);
  });
});

describe("the Game of Life", () => {
  it("turns a blinker", () => {
    const blinker = [violet(-1, 0), violet(0, 0), violet(1, 0)];
    const { paints, changed } = lifeStep(blinker, BOUNDS, false);
    expect(changed).toBe(true);
    expect(live(paints)).toEqual(["0 -1", "0 0", "0 1"]);
    expect(live(lifeStep(paints, BOUNDS, false).paints)).toEqual(live(blinker));
  });

  it("fades out the dead when asked", () => {
    const { paints } = lifeStep([violet(0, 0)], BOUNDS, true);
    expect(paints).toEqual([{ ...violet(0, 0), leaving: true }]);
  });

  it("leaves a block be", () => {
    const block = [violet(0, 0), violet(1, 0), violet(0, 1), violet(1, 1)];
    const step = lifeStep(block, BOUNDS, true);
    expect(step.changed).toBe(false);
    expect(step.paints).toBe(block);
  });

  it("gives a newborn its neighbors' most common color", () => {
    const parents: Paint[] = [
      { column: -1, row: 0, brush: "coral" },
      { column: 0, row: 0, brush: "coral" },
      { column: 1, row: 0, brush: "sky" }
    ];
    const { paints } = lifeStep(parents, BOUNDS, false);
    expect(paints.find((paint) => paint.row === -1)?.brush).toBe("coral");
  });

  it("wraps around the panel's edges", () => {
    const edge = [violet(5, -1), violet(5, 0), violet(5, 1)];
    const { paints } = lifeStep(edge, BOUNDS, false);
    expect(live(paints)).toEqual(["-5 0", "4 0", "5 0"]);
  });
});
