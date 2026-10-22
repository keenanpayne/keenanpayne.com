import { describe, expect, it } from "vitest";

import { flatten } from "./foundations";
import { hiddenAt, mediaMatches, type Target } from "./viewport";

describe("mediaMatches", () => {
  const at390 = (params: string) => mediaMatches(params, 390);

  it("reads width conditions in every syntax", () => {
    expect(at390("(width >= 1180px)")).toBe(false);
    expect(at390("(width < 420px)")).toBe(true);
    expect(at390("(min-width: 760px)")).toBe(false);
    expect(at390("(max-width: 59.99em)")).toBe(true);
    expect(at390("(420px <= width < 960px)")).toBe(false);
    expect(at390("(300px <= width)")).toBe(true);
    expect(at390("screen and (min-width: 960px)")).toBe(false);
    expect(at390("not (width >= 720px)")).toBe(true);
    expect(at390("((width >= 720px) and (hover: hover))")).toBe(false);
  });

  it("takes a phone's side on everything else", () => {
    expect(at390("print")).toBe(false);
    expect(at390("(hover: hover)")).toBe(false);
    expect(at390("(hover: none)")).toBe(true);
    expect(at390("(pointer: fine)")).toBe(false);
    expect(at390("(prefers-reduced-motion: reduce)")).toBe(true);
    expect(at390("(prefers-color-scheme: dark)")).toBe(true);
  });

  it("matches a list when any query does", () => {
    expect(at390("(width >= 1180px), (orientation: portrait)")).toBe(true);
    expect(at390("(width >= 1180px), print")).toBe(false);
  });
});

describe("hiddenAt", () => {
  const clock: Target = {
    tag: "button",
    classes: ["x-clock"],
    attributes: { popovertarget: "readout", class: "x-clock" }
  };
  const end: Target = { tag: "div", classes: ["x-end"], attributes: {} };
  const root: Target = { tag: "div", classes: ["x"], attributes: {} };
  const chain = [clock, end, root];
  const hiddenBy = (css: string) => hiddenAt(flatten(css), 390, chain);

  it("finds a clock shown only on wide screens", () => {
    expect(
      hiddenBy(
        `.x-clock { display: none; @media (width >= 1180px) { display: flex; } }`
      )
    ).toBe(".x-clock");
    expect(
      hiddenBy(
        `.x .x-clock { display: flex; } @media (max-width: 719px) { .x .x-clock { visibility: hidden; } }`
      )
    ).toBe(".x .x-clock");
  });

  it("finds a clock whose surroundings are hidden", () => {
    expect(hiddenBy(`.x-end { display: none; }`)).toBe(".x-end");
  });

  it("leaves a clock that stays on screen alone", () => {
    expect(hiddenBy(`.x-clock { display: flex; }`)).toBeUndefined();
    expect(
      hiddenBy(
        `.x-clock { display: flex; } @media (width >= 720px) { .x-clock { display: none; } }`
      )
    ).toBeUndefined();
    expect(
      hiddenBy(
        `.x-clock { display: flex; } .x-nav--open .x-clock { display: none; }`
      )
    ).toBeUndefined();
    expect(
      hiddenBy(
        `.x-clock { display: flex; } .x-clock:hover { display: none; } body:has(.x-den:popover-open) .x-clock { display: none; }`
      )
    ).toBeUndefined();
    expect(
      hiddenBy(
        `.x-clock { display: flex; } .x-other { display: none; } nav .x-clock { display: none; }`
      )
    ).toBeUndefined();
  });

  it("reads attribute and tag selectors", () => {
    expect(hiddenBy(`.x button[popovertarget] { display: none; }`)).toBe(
      ".x button[popovertarget]"
    );
    expect(hiddenBy(`.x a[popovertarget] { display: none; }`)).toBeUndefined();
  });
});
