/**
 * In-page checks
 * ==================================================
 * The WCAG 2.2 criteria axe doesn't measure, measured in the browser the
 * way a visitor meets them. Each function runs inside the page
 * (`page.evaluate`), so it's self-contained: no imports, and nothing from
 * outside its own body.
 */

/** Every WCAG rule axe has, at every level */
export const AXE_TAGS = [
  "wcag2a",
  "wcag2aa",
  "wcag2aaa",
  "wcag21a",
  "wcag21aa",
  "wcag22aa"
];

/** `color-contrast-enhanced` (7:1) fails everything AA's 4.5:1 rule does */
export const SUPERSEDED = ["color-contrast"];

/** One element that falls short, as the audit reports it */
export interface Finding {
  /** A CSS path to the element */
  target: string;
  /** What's wrong, with the measurement, e.g. `36×20px` */
  message: string;
}

export interface CheckOutcome {
  id: string;
  findings: Finding[];
}

/** Custom checks, by id: what they hold to, for the report */
export const CUSTOM_CHECKS = {
  "target-size-enhanced": {
    criterion: "2.5.5 Target Size (Enhanced), AAA",
    help: "Every target is at least 44 by 44 CSS pixels, unless it's a link inside a sentence or block of text"
  },
  "line-spacing": {
    criterion: "1.4.8 Visual Presentation, AAA",
    help: "Blocks of text have a line height of at least 1.5"
  },
  "line-length": {
    criterion: "1.4.8 Visual Presentation, AAA",
    help: "Lines in blocks of text are no longer than 80 characters"
  },
  "text-justified": {
    criterion: "1.4.8 Visual Presentation, AAA",
    help: "Blocks of text aren't justified"
  },
  reflow: {
    criterion: "1.4.10 Reflow, AA",
    help: "At 320 CSS pixels wide, nothing but code, tables, and images scrolls sideways"
  },
  "focus-appearance": {
    criterion: "2.4.13 Focus Appearance, AAA",
    help: "A focused element draws a ring (on it, or around what holds it) at least 2px thick, at 3:1 against what's behind it"
  },
  "focus-not-obscured-enhanced": {
    criterion: "2.4.12 Focus Not Obscured (Enhanced), AAA",
    help: "No part of a focused element is hidden by anything fixed or sticky the author drew (a header, a banner)"
  }
} as const;

export type CustomCheckId = keyof typeof CUSTOM_CHECKS;

export interface PageCheckOptions {
  /** Elements to leave out (the lab bar), as a selector */
  exclude: string;
  /** Whether to check reflow: at a 320px-wide viewport only */
  reflow: boolean;
}

/**
 * Target size, line spacing and length, justification, and reflow, on the
 * page as it stands
 */
export function checkPage({ exclude, reflow }: PageCheckOptions) {
  const outcomes: Record<string, Finding[]> = {
    "target-size-enhanced": [],
    "line-spacing": [],
    "line-length": [],
    "text-justified": []
  };
  if (reflow) outcomes.reflow = [];

  const pathOf = (element: Element) => {
    const parts: string[] = [];
    let node: Element | null = element;
    while (node && node !== document.body && parts.length < 4) {
      let part = node.localName;
      if (node.id) {
        parts.unshift(`${part}#${CSS.escape(node.id)}`);
        break;
      }
      const classes = [...node.classList].slice(0, 2);
      if (classes.length)
        part += classes.map((name) => `.${CSS.escape(name)}`).join("");
      const parent: Element | null = node.parentElement;
      if (parent) {
        const twins = [...parent.children].filter(
          (child) => child.localName === node!.localName
        );
        if (twins.length > 1)
          part += `:nth-of-type(${twins.indexOf(node) + 1})`;
      }
      parts.unshift(part);
      node = parent;
    }
    return parts.join(" > ");
  };

  const excluded = (element: Element) =>
    Boolean(exclude && element.closest(exclude));

  const shown = (element: Element) => {
    const style = getComputedStyle(element);
    if (style.visibility !== "visible" || style.display === "none")
      return false;
    if (element.closest("[inert], [hidden], [aria-hidden='true']"))
      return false;
    // Visually hidden: clipped away, or a pixel square
    if (style.clip !== "auto" && style.position === "absolute") return false;
    if (/inset\(\s*50%/.test(style.clipPath)) return false;
    const rect = element.getBoundingClientRect();
    if (rect.width <= 1 || rect.height <= 1) return false;
    // Off the page, like a skip link until it's focused
    const left = rect.right + scrollX;
    const top = rect.bottom + scrollY;
    return left > 0 && top > 0;
  };

  const blockOf = (element: Element) => {
    let node: Element | null = element.parentElement;
    while (node && getComputedStyle(node).display.startsWith("inline")) {
      node = node.parentElement;
    }
    return node;
  };

  // Target size: 2.5.5, AAA
  const TARGETS = [
    "a[href]",
    "button",
    "input:not([type='hidden'])",
    "select",
    "textarea",
    "summary",
    "[role='button']",
    "[role='link']",
    "[role='tab']",
    "[role='checkbox']",
    "[role='radio']",
    "[role='switch']",
    "[role='menuitem']",
    "[role='option']",
    "[tabindex]:not([tabindex='-1'])"
  ].join(", ");
  for (const element of document.querySelectorAll(TARGETS)) {
    if (excluded(element) || !shown(element)) continue;
    if (element.matches(":disabled")) continue;

    // In a sentence or block of text: exempt. That's words in the block it
    // flows in, not in a block of their own inside it (a date or a summary
    // set under a title is not a sentence the title sits in), and not in
    // another target (a row of links isn't one either)
    const style = getComputedStyle(element);
    const block = blockOf(element);
    if (style.display === "inline" && block) {
      const ownBlock = (node: Element | null) => {
        while (node && getComputedStyle(node).display.startsWith("inline")) {
          node = node.parentElement;
        }
        return node;
      };
      const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
      const range = document.createRange();
      let inText = false;
      for (
        let node = walker.nextNode();
        node && !inText;
        node = walker.nextNode()
      ) {
        if (
          element.contains(node) ||
          !/[\p{L}\p{N}]/u.test(node.textContent ?? "") ||
          node.parentElement?.closest(TARGETS) ||
          ownBlock(node.parentElement) !== block
        ) {
          continue;
        }
        range.selectNodeContents(node);
        inText = [...range.getClientRects()].some((rect) => rect.width > 0);
      }
      if (inText) continue;
    }

    // Its target is everything that takes the click: it and what's in it
    let [left, top, right, bottom] = [Infinity, Infinity, -Infinity, -Infinity];
    for (const part of [element, ...element.querySelectorAll("*")]) {
      for (const rect of part.getClientRects()) {
        if (rect.width === 0 && rect.height === 0) continue;
        left = Math.min(left, rect.left);
        top = Math.min(top, rect.top);
        right = Math.max(right, rect.right);
        bottom = Math.max(bottom, rect.bottom);
      }
    }
    let [width, height] = [right - left, bottom - top];
    // A checkbox or radio button's label is part of its target
    const labels = (element as HTMLInputElement).labels;
    if (labels) {
      for (const label of labels) {
        const rect = label.getBoundingClientRect();
        if (rect.width * rect.height > width * height) {
          [width, height] = [rect.width, rect.height];
        }
      }
    }
    if (width < 43.5 || height < 43.5) {
      outcomes["target-size-enhanced"].push({
        target: pathOf(element),
        message: `${Math.round(width)}×${Math.round(height)}px, needs 44×44`
      });
    }
  }

  // Blocks of text: 1.4.8, AAA
  const BLOCKS = "p, li, dd, blockquote, figcaption";
  for (const block of document.querySelectorAll(BLOCKS)) {
    if (excluded(block) || !shown(block)) continue;
    if (block.closest("pre, code, nav, table")) continue;

    // Its own lines: the text in it, but not in a block of its own inside
    const ownerOf = (node: Element | null) => {
      while (
        node &&
        node !== block &&
        getComputedStyle(node).display.startsWith("inline")
      ) {
        node = node.parentElement;
      }
      return node;
    };
    const lines = new Map<number, string>();
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (ownerOf(node.parentElement) !== block) continue;
      const text = node.textContent ?? "";
      for (let at = 0; at < text.length; at++) {
        range.setStart(node, at);
        range.setEnd(node, at + 1);
        const rect = range.getClientRects()[0];
        // Collapsed white space takes no room
        if (!rect || rect.width === 0) continue;
        const middle = Math.round(rect.top + rect.height / 2);
        // Characters on the same line share their middle, give or take
        let line = [...lines.keys()].find((key) => Math.abs(key - middle) < 4);
        if (line === undefined) {
          line = middle;
          lines.set(line, "");
        }
        lines.set(line, lines.get(line)! + text[at]);
      }
    }
    if (lines.size < 2) continue;

    const style = getComputedStyle(block);
    const size = parseFloat(style.fontSize);
    const leading =
      style.lineHeight === "normal" ? 1.2 : parseFloat(style.lineHeight) / size;
    if (leading < 1.495) {
      outcomes["line-spacing"].push({
        target: pathOf(block),
        message: `line height ${Math.round(leading * 100) / 100}, needs 1.5`
      });
    }

    // Characters, spaces included, on the longest line
    const longest = Math.max(
      ...[...lines.values()].map(
        (line) => line.replace(/\s+/g, " ").trim().length
      )
    );
    if (longest > 80) {
      outcomes["line-length"].push({
        target: pathOf(block),
        message: `${longest} characters a line, needs 80 or fewer`
      });
    }

    if (style.textAlign === "justify") {
      outcomes["text-justified"].push({
        target: pathOf(block),
        message: "justified"
      });
    }
  }

  // Reflow: 1.4.10, AA
  if (reflow) {
    const width = document.documentElement.clientWidth;
    if (document.documentElement.scrollWidth > width + 1) {
      const SCROLLS = /auto|scroll|hidden|clip/;
      const culprits = [...document.body.querySelectorAll("*")].filter(
        (element) => {
          if (excluded(element) || !shown(element)) return false;
          if (element.getBoundingClientRect().right <= width + 1) return false;
          // Inside something that scrolls or clips it, it doesn't count
          for (
            let node = element.parentElement;
            node && node !== document.body;
            node = node.parentElement
          ) {
            if (SCROLLS.test(getComputedStyle(node).overflowX)) return false;
          }
          return true;
        }
      );
      // The outermost ones: their children overflow with them
      for (const element of culprits) {
        if (
          culprits.some((other) => other !== element && other.contains(element))
        )
          continue;
        outcomes.reflow.push({
          target: pathOf(element),
          message: `reaches ${Math.round(element.getBoundingClientRect().right)}px on a ${width}px-wide screen`
        });
      }
    }
  }

  return Object.entries(outcomes).map(([id, findings]) => ({ id, findings }));
}

/**
 * Focus appearance and obscuring, for the element focus is on now. Run it
 * after each Tab: `undefined` when focus has left the page, and `repeat`
 * once it comes back around to an element it's checked.
 */
export async function checkFocus({ exclude }: { exclude: string }) {
  const element = document.activeElement;
  if (!element || element === document.body) return undefined;

  const pathOf = (node: Element) => {
    const parts: string[] = [];
    for (
      let at: Element | null = node;
      at && at !== document.body && parts.length < 4;
      at = at.parentElement
    ) {
      if (at.id) {
        parts.unshift(`${at.localName}#${CSS.escape(at.id)}`);
        break;
      }
      const classes = [...at.classList].slice(0, 2);
      parts.unshift(
        at.localName + classes.map((name) => `.${CSS.escape(name)}`).join("")
      );
    }
    return parts.join(" > ");
  };
  const target = pathOf(element);

  // Back at an element it's been on: the page is done
  const global = window as unknown as { a11yFocused?: WeakSet<Element> };
  const focused = (global.a11yFocused ??= new WeakSet());
  if (focused.has(element)) return { target, repeat: true, problems: [] };
  focused.add(element);

  // The lab's chrome, and embeds from other sites (their own to keep)
  if ((exclude && element.closest(exclude)) || element.localName === "iframe") {
    return { target, repeat: false, problems: [] };
  }

  // Any CSS color as sRGB, through a canvas, which reads every syntax
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const context = canvas.getContext("2d", { willReadFrequently: true })!;
  const rgba = (color: string) => {
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = "#000";
    context.fillStyle = color;
    context.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
    return [r, g, b, a / 255];
  };
  const luminance = ([r, g, b]: number[]) => {
    const [R, G, B] = [r, g, b].map((channel) => {
      const c = channel / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
  };
  const ratio = (a: number[], b: number[]) => {
    const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (light + 0.05) / (dark + 0.05);
  };
  /** What's painted behind `node`: the nearest background with color in it */
  const behind = (node: Element | null) => {
    const layers: number[][] = [];
    for (let at = node; at; at = at.parentElement) {
      const color = rgba(getComputedStyle(at).backgroundColor);
      if (color[3] > 0) layers.push(color);
      if (color[3] >= 1) break;
    }
    let base = [255, 255, 255];
    for (const [r, g, b, a] of layers.reverse()) {
      base = [r, g, b].map((channel, at) => channel * a + base[at] * (1 - a));
    }
    return base;
  };

  const problems: { id: string; message: string }[] = [];

  // The ring: an outline on it or around what holds it (a field's cell), or
  // a border on a pseudo-element of either, laid over it. A box shadow on
  // the element itself counts too, though it can't be measured here.
  interface Ring {
    color: string;
    width: number;
    /** What it's drawn on: outside it, the ground is what's behind it */
    on: Element;
    outside: boolean;
  }
  let ring: Ring | undefined;
  let browserRing = false;
  let thin = 0;
  const holders = [element];
  for (
    let at = element.parentElement;
    at && holders.length < 4;
    at = at.parentElement
  ) {
    holders.push(at);
  }
  // A field's label, and what's drawn inside it (a choice's pill), can
  // carry the ring too
  for (const label of (element as HTMLInputElement).labels ?? []) {
    for (const part of [label, ...label.querySelectorAll("*")]) {
      if (part !== element && !holders.includes(part)) holders.push(part);
    }
  }
  // A ring on something see-through (a styled checkbox's hidden input)
  // isn't seen, however it's drawn
  const opacityOf = (node: Element, pseudo: string | null) => {
    let opacity = parseFloat(getComputedStyle(node, pseudo).opacity);
    for (let at = node.parentElement; at; at = at.parentElement) {
      opacity *= parseFloat(getComputedStyle(at).opacity);
    }
    return opacity;
  };
  search: for (const holder of holders) {
    for (const pseudo of [null, "::before", "::after"]) {
      const style = getComputedStyle(holder, pseudo);
      if (pseudo && style.content === "none") continue;
      if (opacityOf(holder, pseudo) < 0.5) continue;
      if (style.outlineStyle === "auto") browserRing = true;
      const outline = parseFloat(style.outlineWidth) || 0;
      if (!/none|auto/.test(style.outlineStyle) && outline > 0) {
        if (outline < 1.95) {
          thin = outline;
          continue;
        }
        ring = {
          color: style.outlineColor,
          width: outline,
          on: holder,
          outside: (parseFloat(style.outlineOffset) || 0) >= 0
        };
        break search;
      }
      const border = parseFloat(style.borderTopWidth) || 0;
      if (
        pseudo &&
        style.borderTopStyle !== "none" &&
        border >= 1.95 &&
        parseFloat(style.opacity) > 0.99
      ) {
        ring = {
          color: style.borderTopColor,
          width: border,
          on: holder,
          outside: false
        };
        break search;
      }
    }
  }
  const shadow = getComputedStyle(element).boxShadow !== "none";

  if (ring) {
    const ground = behind(ring.outside ? ring.on.parentElement : ring.on);
    const measured = ratio(rgba(ring.color), ground);
    if (measured < 3) {
      problems.push({
        id: "focus-appearance",
        message: `ring at ${Math.floor(measured * 100) / 100}:1 against what's behind it, needs 3:1`
      });
    }
  } else if (!shadow) {
    problems.push({
      id: "focus-appearance",
      message: browserRing
        ? "the browser's default ring; draw one of at least 2px in the skin's focus color"
        : thin
          ? `a ${thin}px ring, needs 2px`
          : "no focus ring"
    });
  }

  // Obscured: something fixed or sticky (a header, a banner) over any part
  // of it, once the browser has scrolled it into view
  const pinned = (node: Element) => {
    for (let at: Element | null = node; at; at = at.parentElement) {
      if (/fixed|sticky/.test(getComputedStyle(at).position)) return true;
    }
    return false;
  };
  const obscured = () => {
    const rect = element.getClientRects()[0] ?? element.getBoundingClientRect();
    const inset = 4;
    const points = [
      [rect.left + rect.width / 2, rect.top + rect.height / 2],
      [rect.left + inset, rect.top + inset],
      [rect.right - inset, rect.top + inset],
      [rect.left + inset, rect.bottom - inset],
      [rect.right - inset, rect.bottom - inset]
    ].filter(
      ([x, y]) => x >= 0 && y >= 0 && x <= innerWidth && y <= innerHeight
    );
    // An element taller than half the screen can't fit beside a header, so
    // only its middle has to show
    const checked = rect.height > innerHeight / 2 ? points.slice(0, 1) : points;
    const cover = checked
      .map(([x, y]) => document.elementFromPoint(x, y))
      .find(
        (hit): hit is Element =>
          Boolean(hit) &&
          hit !== element &&
          !element.contains(hit) &&
          !hit!.contains(element) &&
          pinned(hit!) &&
          !pinned(element) &&
          !(exclude && hit!.closest(exclude))
      );
    if (rect.bottom < 0 || rect.top > innerHeight) {
      return "off screen when focused";
    }
    return cover ? `covered by ${pathOf(cover)}` : undefined;
  };
  // A smooth scroll may still be bringing it into view: give it a moment
  let hidden = obscured();
  for (let waits = 0; hidden && waits < 20; waits++) {
    await new Promise((done) => setTimeout(done, 50));
    hidden = obscured();
  }
  if (hidden) {
    problems.push({ id: "focus-not-obscured-enhanced", message: hidden });
  }

  return { target, repeat: false, problems };
}
