/**
 * Contrast
 * ==================================================
 * WCAG 2's contrast ratio between two CSS colors, in any syntax a
 * stylesheet can use (hex, `rgb()`, `oklch()`, named colors, …). A
 * translucent color is laid over the one beneath it first, the way the
 * page paints it. The token check (`../conformance/foundations.ts`) and
 * `npm run a11y:contrast` both measure with it. Free of Vite, so the
 * scripts can import it.
 */

import Color from "colorjs.io";

/** WCAG 2.2's minimums, by success criterion */
export const MINIMUM = {
  /** 1.4.6 Contrast (Enhanced), AAA: body text */
  text: 7,
  /** 1.4.6 Contrast (Enhanced), AAA: large text (24px, or 18.66px bold) */
  largeText: 4.5,
  /** 1.4.11 Non-text Contrast, and 2.4.13 Focus Appearance: borders, icons, focus rings */
  nonText: 3
} as const;

/**
 * The role pairs a skin paints one on the other (`--<root>-<role>`, see
 * `ROLES` in `../conformance/foundations.ts`), and the contrast WCAG 2.2
 * AAA asks of them: text at 7:1 (1.4.6), and the focus ring and the
 * accent, which marks things, at 3:1 (1.4.11, 2.4.13). The `css.contrast`
 * foundation holds every direction to them in both schemes; the browser
 * audit (`npm run a11y`) then measures every color as it's actually
 * painted.
 */
export const CONTRAST_PAIRS: readonly [
  foreground: string,
  background: string,
  minimum: number
][] = [
  ["ink", "paper", MINIMUM.text],
  ["ink", "surface", MINIMUM.text],
  ["muted", "paper", MINIMUM.text],
  ["muted", "surface", MINIMUM.text],
  ["selection-ink", "selection", MINIMUM.text],
  ["accent", "paper", MINIMUM.nonText],
  ["accent", "surface", MINIMUM.nonText],
  ["focus", "paper", MINIMUM.nonText],
  ["focus", "surface", MINIMUM.nonText]
];

/** A color, or `undefined` when it can't be read (a system color like `Highlight`) */
export function parseColor(value: string) {
  try {
    return new Color(value.trim()).to("srgb");
  } catch {
    return undefined;
  }
}

/** `top` painted over `bottom`, which is made opaque over white first */
function over(top: Color, bottom: Color): Color {
  const base: Color =
    Number(bottom.alpha) < 1 ? over(bottom, new Color("white")) : bottom;
  const alpha = Number(top.alpha);
  const [r, g, b] = [0, 1, 2].map(
    (at) =>
      Number(top.coords[at]) * alpha + Number(base.coords[at]) * (1 - alpha)
  );
  return new Color("srgb", [r, g, b]);
}

/**
 * The contrast ratio of `foreground` on `background`, from 1 to 21, or
 * `undefined` when either can't be read. A translucent `background` sits
 * on `beneath` (the page), or on white.
 */
export function contrast(
  foreground: string,
  background: string,
  beneath?: string
) {
  const fg = parseColor(foreground);
  const parsed = parseColor(background);
  if (!fg || !parsed) return undefined;
  const page = beneath ? parseColor(beneath) : undefined;
  const bg =
    Number(parsed.alpha) < 1
      ? over(parsed, page ?? new Color("white"))
      : parsed;
  return over(fg, bg).contrast(bg, "WCAG21");
}

/** A ratio as WCAG writes it, e.g. `6.8:1`, rounded down so it never flatters */
export const formatRatio = (ratio: number) =>
  `${Math.floor(ratio * 100) / 100}:1`;
