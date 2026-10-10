/**
 * Specimen kit
 * ==================================================
 * What a direction's `specimens.tsx` lays its parts out with. The kit only
 * labels and arranges: its captions are set small in the lab's own type and
 * take the direction's ink, so the parts between them stay the direction's.
 * Class names start with `sg-` so no direction's styles reach them.
 */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode
} from "react";

import type { LabContent, PostNavModel } from "../../lib/types";

/* Samples
   ==========================================================================
   Stand-ins for page data a specimen needs but `content` doesn't carry,
   built from the content so every direction shows the same thing. */

/** Previous and next around the second-newest post, as a post page has */
export const samplePostNav = (posts: LabContent["posts"]): PostNavModel => ({
  previous: posts[2] && { url: posts[2].url, text: posts[2].title },
  next: posts[0] && { url: posts[0].url, text: posts[0].title }
});

/* Layout
   ========================================================================== */

/** Specimens in columns at least `min` pixels wide */
export function SpecimenGrid({
  min = 280,
  children
}: {
  min?: number;
  children: ReactNode;
}) {
  return (
    <div
      className="sg-grid"
      style={{ "--sg-min": `${min}px` } as CSSProperties}
    >
      {children}
    </div>
  );
}

/** One labeled example; `wide` spans every column of its grid */
export function Specimen({
  label,
  note,
  wide,
  children
}: {
  label: ReactNode;
  /** A short line on when or how it's used */
  note?: ReactNode;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={wide ? "sg-specimen sg-specimen--wide" : "sg-specimen"}>
      <div className="sg-caption">
        <span className="sg-caption__label">{label}</span>
        {note && <span className="sg-caption__note">{note}</span>}
      </div>
      <div className="sg-specimen__body">{children}</div>
    </div>
  );
}

/** A remark in the lab's voice, e.g. why a direction has no such part */
export const Note = ({ children }: { children: ReactNode }) => (
  <div className="sg-note">{children}</div>
);

/** The element that holds the text, past any wrappers */
function textElement(root: Element) {
  let element = root;
  const ownText = (node: Element) =>
    [...node.childNodes].some(
      (child) => child.nodeType === Node.TEXT_NODE && child.textContent?.trim()
    );
  while (element.children.length === 1 && !ownText(element)) {
    element = element.children[0];
  }
  return element;
}

const round = (value: number, places = 1) =>
  Number(value.toFixed(places)).toString();

/** e.g. `Newsreader · 300 · 64/64 · −0.02em · uppercase` */
function describe(style: CSSStyleDeclaration) {
  const size = parseFloat(style.fontSize);
  const family = style.fontFamily.split(",")[0].replace(/["']/g, "").trim();
  const leading =
    style.lineHeight === "normal"
      ? "normal"
      : round(parseFloat(style.lineHeight));
  const tracking = parseFloat(style.letterSpacing);

  return [
    family,
    `${style.fontWeight}${style.fontStyle === "italic" ? " italic" : ""}`,
    `${round(size)}/${leading}px`,
    tracking
      ? `${tracking < 0 ? "−" : "+"}${round(Math.abs(tracking / size), 3)}em`
      : undefined,
    style.textTransform !== "none" ? style.textTransform : undefined,
    style.fontVariantCaps !== "normal" ? style.fontVariantCaps : undefined
  ]
    .filter(Boolean)
    .join(" · ");
}

/**
 * A style of type with its specs, measured from the rendered text (the
 * first element in `children`, or the one `measure` selects), so they stay
 * true to the stylesheet at every width.
 */
export function TypeSample({
  label,
  measure,
  children
}: {
  label: ReactNode;
  /** Selector for the element to measure, when it isn't the first */
  measure?: string;
  children: ReactNode;
}) {
  const sample = useRef<HTMLDivElement>(null);
  const [spec, setSpec] = useState("");

  useEffect(() => {
    const element = sample.current;
    const target = measure
      ? element?.querySelector(measure)
      : element?.firstElementChild;
    if (!element || !target) return;

    const update = () =>
      setSpec(describe(getComputedStyle(textElement(target))));
    update();
    let active = true;
    document.fonts?.ready.then(() => active && update());
    const resize = new ResizeObserver(update);
    resize.observe(element);
    return () => {
      active = false;
      resize.disconnect();
    };
  }, [measure]);

  return (
    <div className="sg-type">
      <div className="sg-caption">
        <span className="sg-caption__label">{label}</span>
        <span className="sg-caption__note sg-type__spec">{spec || " "}</span>
      </div>
      <div ref={sample} className="sg-type__sample">
        {children}
      </div>
    </div>
  );
}
