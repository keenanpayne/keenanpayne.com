import {
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type Ref
} from "react";
import { Link, useViewTransitionState } from "react-router";

import type {
  LabContent,
  LinkModel,
  PostNavModel,
  TestimonialModel
} from "../../../lib/types";
import {
  Html,
  pad,
  prefersReducedMotion,
  samePath,
  useReducedMotion,
  useTo
} from "../../site";

//
// Designations
// ------------

/** Designation for a case study, e.g. `UNIT-01` (the featured project) */
export const unitCode = (index: number) =>
  index < 0 ? "UNIT-XX" : `UNIT-${pad(index + 1)}`;

/** Designation for an article, numbered oldest first, e.g. `REC-041` */
export const recordCode = (posts: LabContent["posts"], url: string) => {
  const index = posts.findIndex((post) => samePath(post.url, url));
  return index < 0 ? "REC-XXX" : `REC-${pad(posts.length - index, 3)}`;
};

//
// Icons
// -----

/** Solid triangle, pointing right unless told otherwise */
export const Tri = ({
  dir = "right"
}: {
  dir?: "right" | "left" | "up" | "down";
}) => (
  <svg
    className={`mc-tri mc-tri--${dir}`}
    viewBox="0 0 10 10"
    aria-hidden="true"
  >
    <path d="M1.5 1 9 5l-7.5 4Z" fill="currentColor" />
  </svg>
);

/** Flat-topped hexagon outline, used for badges and frames */
export const HexOutline = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 116 100"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <path
      d="M29 1.5h58L114.5 50 87 98.5H29L1.5 50Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      vectorEffect="non-scaling-stroke"
    />
  </svg>
);

//
// Building blocks
// ---------------

/** Pair of hairline ticks that close a HUD label strip */
export const Ticks = () => (
  <span className="mc-ticks" aria-hidden="true">
    <span />
    <span />
  </span>
);

/** Bordered HUD panel with a label strip and corner brackets */
export function Panel({
  label,
  code,
  as: Tag = "section",
  className,
  children
}: {
  label?: ReactNode;
  code?: ReactNode;
  as?: "section" | "div" | "article" | "aside" | "figure" | "li";
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag className={["mc-panel", className].filter(Boolean).join(" ")}>
      {label && (
        <div className="mc-panel__head">
          <span className="mc-panel__label">{label}</span>
          {code && <span className="mc-panel__code">{code}</span>}
          <Ticks />
        </div>
      )}
      {children}
    </Tag>
  );
}

/** Full-width strip that opens a section: label, Japanese gloss, rule, link */
export function SectionBar({
  label,
  jp,
  code,
  more,
  as: Tag = "h2"
}: {
  label: ReactNode;
  jp?: string;
  code?: ReactNode;
  more?: { href: string; text: string };
  as?: "h2" | "h3" | "p";
}) {
  return (
    <div className="mc-bar">
      <Tag className="mc-bar__label">{label}</Tag>
      {jp && (
        <span className="mc-bar__jp" lang="ja">
          {jp}
        </span>
      )}
      <span className="mc-bar__rule" aria-hidden="true" />
      {code && <span className="mc-bar__code">{code}</span>}
      {more && (
        <a className="mc-bar__more" href={more.href}>
          {more.text}
          <Tri />
        </a>
      )}
    </div>
  );
}

export function Section({
  className,
  children,
  ...bar
}: Parameters<typeof SectionBar>[0] & {
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={["mc-section", className].filter(Boolean).join(" ")}>
      <SectionBar {...bar} />
      {children}
    </section>
  );
}

/** Small boxed metric: a label over a large value */
export const Readout = ({
  label,
  value,
  unit,
  tone
}: {
  label: ReactNode;
  value: ReactNode;
  unit?: ReactNode;
  tone?: "green" | "amber";
}) => (
  <div className={`mc-readout${tone ? ` mc-readout--${tone}` : ""}`}>
    <dt>{label}</dt>
    <dd>
      {value}
      {unit && <small>{unit}</small>}
    </dd>
  </div>
);

/** Bracketed text button, e.g. `[ ▸ VIEW CASE STUDY ]` */
export const MoreLink = ({
  href,
  back,
  children
}: {
  href: string;
  back?: boolean;
  children: ReactNode;
}) => (
  <a className="mc-more" href={href}>
    <Tri dir={back ? "left" : "right"} />
    <span>{children}</span>
  </a>
);

// Half-width katakana, digits, and symbols cycled through while decoding
const NOISE = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉ0123456789#%&*+=/<>";
const DECODE_MS = 420;

/**
 * Scrambles a label, then resolves it left to right like a readout decoding.
 * Writes to the overlay span directly so a hover doesn't re-render.
 */
function useDecode(text: string) {
  const noise = useRef<HTMLSpanElement>(null);
  const frame = useRef(0);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const decode = () => {
    const node = noise.current;
    const label = node?.parentElement;
    if (!node || !label) return;
    if (prefersReducedMotion()) return;

    cancelAnimationFrame(frame.current);
    const start = performance.now();
    label.dataset.decoding = "";

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / DECODE_MS);
      const settled = Math.floor(progress * text.length);
      node.textContent =
        text.slice(0, settled) +
        Array.from(text.slice(settled), (char) =>
          char === " " ? " " : NOISE[Math.floor(Math.random() * NOISE.length)]
        ).join("");

      if (progress < 1) frame.current = requestAnimationFrame(tick);
      else delete label.dataset.decoding;
    };
    frame.current = requestAnimationFrame(tick);
  };

  return [noise, decode] as const;
}

/**
 * Solid chamfered button. On hover or focus the primary tones charge with
 * green from the left, lock on with a targeting reticle, decode their label,
 * and feed the arrow forward.
 */
export function Button({
  href,
  type = "button",
  tone,
  children
}: {
  /** Renders a link; otherwise a `<button>` */
  href?: string;
  type?: "button" | "submit";
  tone?: "ghost" | "invert";
  /** Plain text, so it can be decoded on hover */
  children: string;
}) {
  const [noise, decode] = useDecode(children);
  const primary = tone !== "ghost";
  const props = {
    className: `mc-btn${tone ? ` mc-btn--${tone}` : ""}`,
    onPointerEnter: primary ? decode : undefined,
    onFocus: primary ? decode : undefined
  };
  const content = (
    <>
      {primary && (
        <>
          <span className="mc-btn__glow" aria-hidden="true" />
          <span className="mc-btn__charge" aria-hidden="true">
            <span />
          </span>
          <span className="mc-btn__lock" aria-hidden="true" />
        </>
      )}
      <span className="mc-btn__label">
        <span className="mc-btn__text">{children}</span>
        {primary && (
          // Starts with every glyph the decode can use, hidden, so the
          // fallback font for the katakana loads with the page rather than
          // on the first hover
          <span className="mc-btn__noise" ref={noise} aria-hidden="true">
            {NOISE}
          </span>
        )}
      </span>
      <Tri />
    </>
  );

  return href ? (
    <a {...props} href={href}>
      {content}
    </a>
  ) : (
    <button {...props} type={type}>
      {content}
    </button>
  );
}

/** Points of a noisy line in a 100×20 box, the same for the same seed */
function tracePoints(seed: number) {
  let state = seed * 7919 + 13;
  const points: [number, number][] = [];
  for (let i = 0; i < 64; i++) {
    state = (state * 9301 + 49297) % 233280;
    const swell = 0.25 + 0.6 * Math.abs(Math.sin(i / 7 + seed));
    points.push([i * (100 / 63), 10 + (state / 233280 - 0.5) * 16 * swell]);
  }
  return points;
}

// Time for the head to cross one trace, the trail's length (as a share of
// the width), and the pauses before the next row and before starting over
const CROSS_MS = 4000;
const TRAIL = 0.3;
const ROW_MS = 250;
const REST_MS = 900;

/** Plays one sweep after a delay; resolves when the head leaves the trace */
type Sweep = (delay: number) => Promise<void>;

/**
 * Passes a single sweep from trace to trace across the transmissions on
 * screen, in reading order, so it reads as one signal running through the
 * cards. It crosses the gap between neighbours at the same pace, and starts
 * over from the first card after a short rest.
 */
const relay = (() => {
  const sweeps = new Map<Element, Sweep>();
  const visible = new Set<Element>();
  let current: Element | undefined;
  let running = false;
  let observer: IntersectionObserver | undefined;

  // Top to bottom (rows within 40px of each other count as one), then left
  // to right
  const inReadingOrder = () =>
    [...visible]
      .map((element) => ({ element, rect: element.getBoundingClientRect() }))
      .sort(
        (a, b) =>
          Math.round(a.rect.top / 40) - Math.round(b.rect.top / 40) ||
          a.rect.left - b.rect.left
      );

  const advance = async () => {
    if (running) return;
    const order = inReadingOrder();
    if (order.length === 0) return;

    const from = order.findIndex((item) => item.element === current);
    const to = (from + 1) % order.length;
    let delay = 0;
    if (from !== -1 && to <= from) delay = REST_MS;
    else if (from !== -1) {
      const [a, b] = [order[from].rect, order[to].rect];
      const sameRow = Math.abs(a.top - b.top) < 40;
      const gap = (b.left - a.right) / (a.width / CROSS_MS);
      delay = sameRow ? Math.min(Math.max(gap, 0), 400) : ROW_MS;
    }

    running = true;
    current = order[to].element;
    try {
      await sweeps.get(current)?.(delay);
    } catch {
      // Cancelled because the trace unmounted; move on
    }
    running = false;
    advance();
  };

  return {
    join(element: Element, sweep: Sweep) {
      observer ??= new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        }
        advance();
      });
      sweeps.set(element, sweep);
      observer.observe(element);

      return () => {
        sweeps.delete(element);
        visible.delete(element);
        observer?.unobserve(element);
      };
    }
  };
})();

/**
 * Lets a trace take part in the relay: a glowing head rides the line with a
 * fading trail behind it, which drains off the right edge after the head
 * moves on to the next card.
 *
 * Everything moves by transform, so it runs on the compositor: the trail is
 * a lens (as wide as `TRAIL`, faded by a fixed mask) sliding across the
 * trace, with a bright copy of the trace inside it sliding the opposite way
 * to stay in place.
 */
function useSweep(points: [number, number][]) {
  const root = useRef<HTMLDivElement>(null);
  const lens = useRef<HTMLSpanElement>(null);
  const trail = useRef<SVGSVGElement>(null);
  const head = useRef<HTMLSpanElement>(null);
  // Leaves the relay (stopping any sweep in progress) if the visitor turns
  // on reduced motion, and rejoins if they turn it off
  const reduced = useReducedMotion();

  useEffect(() => {
    const [node, lensNode, trailNode, headNode] = [
      root.current,
      lens.current,
      trail.current,
      head.current
    ];
    if (!node || !lensNode || !trailNode || !headNode || reduced) return;

    const headFrames = points.map(([x, y], i) => ({
      offset: i / (points.length - 1),
      transform: `translate(${x}%, ${y * 5}%)`,
      opacity: i === 0 ? 0 : 1
    }));
    // The lens's right edge follows the head, then keeps going at the same
    // speed so the tail slides off the right edge. Its offsets are in its
    // own widths; the copy inside counters them in the trace's widths.
    const crossed = 1 / (1 + TRAIL);
    const lensFrames = [
      { transform: "translateX(-100%)" },
      { offset: crossed, transform: `translateX(${(1 / TRAIL - 1) * 100}%)` },
      { transform: `translateX(${100 / TRAIL}%)` }
    ];
    const trailFrames = [
      { transform: `translateX(${TRAIL * 100}%)` },
      { offset: crossed, transform: `translateX(${(TRAIL - 1) * 100}%)` },
      { transform: "translateX(-100%)" }
    ];
    let animations: Animation[] = [];

    const sweep: Sweep = (delay) => {
      const timing = { duration: CROSS_MS * (1 + TRAIL), delay };
      animations = [
        headNode.animate(headFrames, { duration: CROSS_MS, delay }),
        lensNode.animate(lensFrames, timing),
        trailNode.animate(trailFrames, timing)
      ];
      return animations[0].finished.then(() => undefined);
    };

    node.classList.add("is-live");
    const leave = relay.join(node, sweep);

    return () => {
      leave();
      animations.forEach((animation) => animation.cancel());
      node.classList.remove("is-live");
    };
  }, [points, reduced]);

  return { root, lens, trail, head };
}

/** Deterministic noisy line, like a CPU trace, seeded per item */
export function Waveform({
  seed,
  className
}: {
  seed: number;
  className?: string;
}) {
  const points = useMemo(() => tracePoints(seed), [seed]);
  const { root, lens, trail, head } = useSweep(points);
  const line = points
    .map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`)
    .join(" ");
  const trace = (
    <>
      <polygon points={`0,20 ${line} 100,20`} className="mc-wave__fill" />
      <polyline points={line} vectorEffect="non-scaling-stroke" />
    </>
  );

  return (
    <div
      className={["mc-wave", className].filter(Boolean).join(" ")}
      ref={root}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 20" preserveAspectRatio="none">
        {trace}
      </svg>
      <span className="mc-wave__lens" ref={lens}>
        <svg
          className="mc-wave__trail"
          ref={trail}
          viewBox="0 0 100 20"
          preserveAspectRatio="none"
        >
          {trace}
        </svg>
      </span>
      <span className="mc-wave__head" ref={head} />
    </div>
  );
}

// Names of the shared elements when a service tile expands into its page
const TILE_TRANSITION = "mc-magi-tile";
const TITLE_TRANSITION = "mc-service-title";

/** Title block that opens every inner page, set like an episode title card */
export function PageHeader({
  episode,
  eyebrow,
  jp,
  title,
  lede,
  aside,
  morphTitle,
  children
}: {
  episode?: string;
  eyebrow: ReactNode;
  jp?: string;
  /** HTML */
  title: string;
  /** HTML */
  lede?: string;
  aside?: ReactNode;
  /** Receives the title of a service tile that expands into this page */
  morphTitle?: boolean;
  children?: ReactNode;
}) {
  return (
    <header className={`mc-pageHeader${aside ? " mc-pageHeader--aside" : ""}`}>
      <div className="mc-pageHeader__main">
        <p className="mc-pageHeader__eyebrow">
          {episode && <span className="mc-pageHeader__episode">{episode}</span>}
          {eyebrow}
        </p>
        <div className="mc-titlecard">
          {morphTitle ? (
            <h1 className="mc-titlecard__title">
              {/* Wraps the words, so the morph lands on the text's own box */}
              <Html
                as="span"
                className="mc-titlecard__morph"
                html={title}
                style={{ viewTransitionName: TITLE_TRANSITION }}
              />
            </h1>
          ) : (
            <Html as="h1" className="mc-titlecard__title" html={title} />
          )}
          {jp && (
            <p className="mc-titlecard__jp" lang="ja">
              {jp}
            </p>
          )}
        </div>
        {lede && <Html as="p" className="mc-pageHeader__lede" html={lede} />}
        {children}
      </div>
      {aside && <div className="mc-pageHeader__aside">{aside}</div>}
    </header>
  );
}

//
// Media
// -----

/** Image tinted to the HUD palette; full color on hover */
export const Feed = ({
  src,
  alt = "",
  href,
  label,
  className,
  eager,
  natural,
  onZoom
}: {
  src?: string;
  alt?: string;
  href?: string;
  label?: ReactNode;
  className?: string;
  eager?: boolean;
  /** Shows the image in its own colors, without the amber tint */
  natural?: boolean;
  /** Makes the image a button that opens a larger view (see `Lightbox`) */
  onZoom?: () => void;
}) => {
  const classes = ["mc-feed", natural && "mc-feed--natural", className]
    .filter(Boolean)
    .join(" ");
  const content = (
    <>
      {src ? (
        <img src={src} alt={alt} loading={eager ? undefined : "lazy"} />
      ) : (
        <span className="mc-feed__none" aria-hidden="true">
          <span>No visual feed</span>
        </span>
      )}
      {label && <span className="mc-feed__label">{label}</span>}
      {onZoom && (
        <span className="mc-feed__zoom" aria-hidden="true">
          Enlarge
        </span>
      )}
    </>
  );

  if (onZoom) {
    return (
      <button
        type="button"
        className={classes}
        onClick={onZoom}
        aria-haspopup="dialog"
        aria-label={`Enlarge photo: ${alt}`}
      >
        {content}
      </button>
    );
  }

  const Tag = href ? "a" : "div";
  return (
    <Tag className={classes} href={href} tabIndex={href ? -1 : undefined}>
      {content}
    </Tag>
  );
};

export interface LightboxImage {
  src: string;
  alt: string;
  caption: ReactNode;
}

/**
 * Larger view of a set of images, as a modal `<dialog>` styled like a HUD
 * panel, with a caption and previous/next controls (or the arrow keys). Esc,
 * the close button, or a click outside the panel closes it, and the browser
 * returns focus to the image that opened it.
 */
export interface LightboxHandle {
  /** Opens the lightbox on the image at `index` */
  open: (index: number) => void;
}

export function Lightbox({
  images,
  ref
}: {
  images: LightboxImage[];
  ref?: Ref<LightboxHandle>;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const captionId = useId();
  // Which image is on show (`null` when closed). Kept here, not in the page,
  // so opening the lightbox re-renders only the lightbox.
  const [index, onChange] = useState<number | null>(null);

  useImperativeHandle(ref, () => ({ open: onChange }), []);

  useEffect(() => {
    const node = dialog.current;
    if (!node) return;
    if (index === null) node.close();
    else if (!node.open) node.showModal();
  }, [index]);

  const current = index ?? 0;
  const image = index === null ? undefined : images[index];
  const step = (by: number) =>
    onChange((current + by + images.length) % images.length);
  const close = () => dialog.current?.close();

  return (
    <dialog
      ref={dialog}
      className="mc-lightbox"
      aria-labelledby={captionId}
      onClose={() => onChange(null)}
      onClick={(event) => event.target === event.currentTarget && close()}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") step(-1);
        if (event.key === "ArrowRight") step(1);
      }}
    >
      {image && (
        <div className="mc-panel mc-lightbox__frame">
          <div className="mc-panel__head">
            <span className="mc-panel__label">Frame {pad(current + 1, 3)}</span>
            <span className="mc-panel__code">
              Rec · {pad(current + 1)} / {pad(images.length)}
            </span>
            {/* First focusable element, so it takes focus on open */}
            <button
              type="button"
              className="mc-lightbox__button"
              onClick={close}
            >
              Close <span aria-hidden="true">×</span>
            </button>
          </div>

          <figure className="mc-lightbox__figure">
            <div className="mc-lightbox__media">
              <img key={image.src} src={image.src} alt={image.alt} />
            </div>
            <figcaption id={captionId} className="mc-lightbox__caption">
              <Tri />
              {image.caption}
            </figcaption>
          </figure>

          {images.length > 1 && (
            <div className="mc-lightbox__controls">
              <button
                type="button"
                className="mc-lightbox__button"
                onClick={() => step(-1)}
              >
                <Tri dir="left" /> Previous
              </button>
              <span className="mc-lightbox__dots" aria-hidden="true">
                {images.map((item, i) => (
                  <span
                    key={item.src}
                    className={i === current ? "is-current" : undefined}
                  />
                ))}
              </span>
              <button
                type="button"
                className="mc-lightbox__button"
                onClick={() => step(1)}
              >
                Next <Tri />
              </button>
            </div>
          )}
        </div>
      )}
    </dialog>
  );
}

//
// Writing
// -------

type Posts = LabContent["posts"];

export function PostCards({ posts, all }: { posts: Posts; all: Posts }) {
  return (
    <div className="mc-grid mc-grid--4">
      {posts.map((post) => (
        <Panel
          as="article"
          key={post.url}
          className="mc-card"
          label={post.type ?? "Essay"}
          code={recordCode(all, post.url)}
        >
          <Feed
            src={post.image}
            href={post.url}
            label={!post.image && post.year}
          />
          <div className="mc-card__body">
            <h3 className="mc-card__title">
              <a href={post.url}>{post.title}</a>
            </h3>
            {post.lede && <p className="mc-card__copy">{post.lede}</p>}
            <p className="mc-card__foot">
              <time>{post.date}</time>
              <a href={post.url} tabIndex={-1} aria-hidden="true">
                Read <Tri />
              </a>
            </p>
          </div>
        </Panel>
      ))}
    </div>
  );
}

/** Scrolling strip of headlines, like a news ticker */
export function Ticker({ posts }: { posts: Posts }) {
  const items = posts.slice(0, 8);
  const run = (hidden?: boolean) => (
    <ul className="mc-ticker__run" aria-hidden={hidden || undefined}>
      {items.map((post) => (
        <li key={post.url}>
          <span className="mc-ticker__date">{post.date}</span>
          <a href={post.url} tabIndex={hidden ? -1 : undefined}>
            {post.title}
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <section className="mc-ticker" aria-label="Latest writing">
      <p className="mc-ticker__label">
        <span className="mc-ticker__rec" aria-hidden="true">
          <span className="mc-dot" />
          Rec
        </span>
        Latest transmissions
      </p>
      <div className="mc-ticker__track">
        {run()}
        {run(true)}
      </div>
    </section>
  );
}

//
// Work
// ----

type Work = LabContent["work"][number];

export function UnitCard({ item, index }: { item: Work; index: number }) {
  return (
    <Panel
      as="article"
      className="mc-card mc-unit"
      label={unitCode(index)}
      code={item.year}
    >
      <Feed src={item.coverSquare} href={item.url} />
      <div className="mc-card__body">
        <h3 className="mc-unit__name">
          <a href={item.url}>{item.name}</a>
        </h3>
        <p className="mc-unit__meta">
          {[item.industry, item.role].filter(Boolean).join(" · ")}
        </p>
        <MoreLink href={item.url}>Access file</MoreLink>
      </div>
    </Panel>
  );
}

/** The featured project as a wide panel, then the rest as a grid of units */
export function UnitGrid({ work }: { work: Work[] }) {
  const [featured, ...rest] = work;
  if (!featured) return null;

  return (
    <>
      <Panel
        as="article"
        className="mc-feature"
        label={`${unitCode(0)} · Test type`}
        code={`Active ${featured.year ?? ""}`}
      >
        <Feed
          className="mc-feature__feed"
          src={featured.cover}
          href={featured.url}
          label="Visual feed · Live"
        />
        <div className="mc-feature__body">
          <h3 className="mc-feature__name">
            <a href={featured.url}>{featured.name}</a>
          </h3>
          {featured.lede && (
            <Html as="p" className="mc-feature__lede" html={featured.lede} />
          )}
          <dl className="mc-readouts">
            {featured.role && <Readout label="Role" value={featured.role} />}
            {featured.year && <Readout label="Years" value={featured.year} />}
          </dl>
          {featured.services.length > 0 && (
            <ul className="mc-chips">
              {featured.services.map((service) => (
                <li key={service}>{service}</li>
              ))}
            </ul>
          )}
          <Button href={featured.url}>{`${featured.name} case study`}</Button>
        </div>
      </Panel>

      <div className="mc-grid mc-grid--3">
        {rest.map((item, index) => (
          <UnitCard key={item.url} item={item} index={index + 1} />
        ))}
      </div>
    </>
  );
}

//
// Services
// --------

/**
 * Sets the geometry of the tile-to-page transition. The service page is cut
 * to a regular hexagon just big enough to cover the screen, and starts
 * shrunk onto the clicked tile; growing it back is a transform, so it runs
 * on the compositor (animating the cut-out itself would not). The tile's
 * snapshot makes the mirror-image move, so the two stay aligned as it
 * fades.
 */
function setIris(tile: Element) {
  const rect = tile.getBoundingClientRect();
  const [w, h] = [innerWidth, innerHeight];

  // Half-width and half-height of a flat-topped regular hexagon, centered
  // on the screen, whose sloped edges clear every corner
  const a = 1.02 * Math.max(w / 2 + h / (2 * Math.sqrt(3)), h / Math.sqrt(3));
  const hh = (a * Math.sqrt(3)) / 2;
  const hexagon = [
    [-a / 2, -hh],
    [a / 2, -hh],
    [a, 0],
    [a / 2, hh],
    [-a / 2, hh],
    [-a, 0]
  ]
    .map(([x, y]) => `${w / 2 + x}px ${h / 2 + y}px`)
    .join(", ");

  // Shrunk onto the tile: matched by width for hexagons, by height for the
  // chamfered bars on narrow screens
  const scale = w >= 640 ? rect.width / 2 / a : rect.height / 2 / hh;
  const dx = rect.left + rect.width / 2 - w / 2;
  const dy = rect.top + rect.height / 2 - h / 2;

  const root = document.documentElement.style;
  root.setProperty("--mc-iris-shape", `polygon(${hexagon})`);
  root.setProperty(
    "--mc-iris-from",
    `translate(${dx}px, ${dy}px) scale(${scale})`
  );
  root.setProperty(
    "--mc-tile-to",
    `translate(${-dx}px, ${-dy}px) scale(${1 / scale})`
  );
}

/**
 * A service tile. Clicking it expands the hexagon to fill the screen,
 * revealing the service page inside, while the title flies up into the
 * page's title card (see `PageHeader`'s `morphTitle`).
 */
function MagiTile({
  service,
  index
}: {
  service: LabContent["services"][number];
  index: number;
}) {
  const expanding = useViewTransitionState(service.url);
  // With reduced motion the tile opens its page like any other link
  const animate = !useReducedMotion();

  return (
    <Link
      className={`mc-hex${expanding ? " is-expanding" : ""}`}
      to={service.url}
      // Loads the page's code and data on hover, so the transition starts
      // without waiting on the network
      prefetch="intent"
      viewTransition={animate}
      onClick={(event) => animate && setIris(event.currentTarget)}
      style={expanding ? { viewTransitionName: TILE_TRANSITION } : undefined}
    >
      <span className="mc-hex__mode">Sys-{pad(index + 1)}</span>
      <span
        className="mc-hex__title"
        style={expanding ? { viewTransitionName: TITLE_TRANSITION } : undefined}
      >
        {service.title}
      </span>
      <span className="mc-hex__number" aria-hidden="true">
        {index + 1}
      </span>
    </Link>
  );
}

/** Services as a cluster of hexagons, after the MAGI supercomputers */
export function Magi({ services }: { services: LabContent["services"] }) {
  return (
    <ol className="mc-magi">
      {services.map((service, index) => (
        <li key={service.url} className="mc-magi__cell">
          <MagiTile service={service} index={index} />
        </li>
      ))}
      <li className="mc-magi__cell" aria-hidden="true">
        <span className="mc-hex mc-hex--status">
          <span className="mc-hex__mode">Magi system</span>
          <span className="mc-hex__title">All systems nominal</span>
          <span className="mc-hex__number">
            <span className="mc-dot" />
          </span>
        </span>
      </li>
    </ol>
  );
}

export function ServicesList({
  services,
  numbered = true
}: {
  services: LabContent["services"];
  numbered?: boolean;
}) {
  return (
    <ol className="mc-list">
      {services.map((service, index) => (
        <li key={service.url}>
          <a href={service.url}>
            {numbered && (
              <span className="mc-list__code">Sys-{pad(index + 1)}</span>
            )}
            <span className="mc-list__title">{service.title}</span>
            {service.lede && (
              <span className="mc-list__copy">{service.lede}</span>
            )}
            <Tri />
          </a>
        </li>
      ))}
    </ol>
  );
}

//
// Testimonials
// ------------

export function Transmission({
  testimonial,
  index
}: {
  testimonial: TestimonialModel;
  index: number;
}) {
  const from = testimonial.person?.position?.split(",").pop()?.trim();
  return (
    <Panel
      as="figure"
      className="mc-quote"
      label={`Transmission ${pad(index + 1)}`}
      code={from && `From: ${from}`}
    >
      <Waveform seed={testimonial.id} />
      <Html
        as="blockquote"
        className="mc-quote__text"
        html={testimonial.content}
      />
      {testimonial.person && (
        <figcaption className="mc-quote__person">
          {testimonial.person.image && (
            <img src={testimonial.person.image} alt="" loading="lazy" />
          )}
          <span>
            <strong>{testimonial.person.name}</strong>
            {testimonial.person.position && (
              <span>{testimonial.person.position}</span>
            )}
          </span>
        </figcaption>
      )}
    </Panel>
  );
}

export function KindWords({
  testimonials
}: {
  testimonials: TestimonialModel[];
}) {
  const to = useTo();
  return (
    <Section
      label="Intercepted transmissions"
      jp="証言"
      more={{ href: to("/testimonials/"), text: "All testimonials" }}
    >
      <div className="mc-grid mc-grid--3">
        {testimonials.slice(0, 3).map((testimonial, index) => (
          <Transmission
            key={testimonial.id}
            testimonial={testimonial}
            index={index}
          />
        ))}
      </div>
    </Section>
  );
}

//
// Calls to action
// ---------------

const AlertSide = () => (
  <div className="mc-alert__side" aria-hidden="true">
    <div className="mc-alert__warning">
      <HexOutline className="mc-alert__hex" />
      <Tri dir="up" />
      <span>Warning</span>
      <Tri dir="down" />
    </div>
    <div className="mc-alert__stamp">
      <span className="mc-hazard" />
      <span className="mc-alert__kanji" lang="ja">
        警報
      </span>
      <span className="mc-alert__box">Alert</span>
      <span className="mc-alert__box" lang="ja">
        第一種戦闘配置
      </span>
      <span className="mc-hazard" />
    </div>
  </div>
);

/** Red alert banner, after the "Battle Stations" screens */
export function Alert({
  heading = "Have a project in mind?",
  cta = "Initiate project inquiry",
  href
}: {
  heading?: string;
  cta?: string;
  href?: string;
}) {
  const to = useTo();
  return (
    <section className="mc-alert" aria-label={heading}>
      <AlertSide />
      <div className="mc-alert__core">
        <span className="mc-alert__frame" aria-hidden="true" />
        <p className="mc-alert__stamps" aria-hidden="true">
          <span lang="ja">警報</span>
          <span lang="ja">警報</span>
        </p>
        <p className="mc-alert__jp" lang="ja">
          第一種戦闘配置
        </p>
        <p className="mc-alert__en">Battle stations · Condition one</p>
        <h2 className="mc-alert__heading">{heading}</h2>
        <Button tone="invert" href={href ?? to("/project-inquiry/")}>
          {cta}
        </Button>
      </div>
      <AlertSide />
    </section>
  );
}

/** Mock newsletter sign-up; the lab never submits anything */
export function Newsletter() {
  return (
    <Panel
      className="mc-newsletter"
      label="Transmission subscription"
      code="Channel open"
    >
      <div className="mc-newsletter__body">
        <div>
          <p className="mc-newsletter__heading">Receive new transmissions</p>
          <p className="mc-card__copy">
            New essays and tutorials, sent to your inbox when they’re published.
            No spam, unsubscribe anytime.
          </p>
        </div>
        <form className="mc-inline-form" onSubmit={(e) => e.preventDefault()}>
          <label className="mc-visually-hidden" htmlFor="mc-newsletter-email">
            Email address
          </label>
          <input
            id="mc-newsletter-email"
            className="mc-input"
            type="email"
            placeholder="you@example.com"
          />
          <Button type="submit">Subscribe</Button>
        </form>
      </div>
    </Panel>
  );
}

//
// Previous / next
// ---------------

export function PostNav({
  nav,
  noun = "record"
}: {
  nav: PostNavModel | null;
  noun?: string;
}) {
  if (!nav || (!nav.previous && !nav.next)) return null;

  const item = (link: LinkModel | undefined, label: string, back?: boolean) =>
    link ? (
      <a
        className={`mc-postNav__item${back ? "" : " mc-postNav__item--next"}`}
        href={link.url}
      >
        <span className="mc-postNav__label">
          {back && <Tri dir="left" />}
          {label}
          {!back && <Tri />}
        </span>
        <span className="mc-postNav__title">{link.text}</span>
      </a>
    ) : (
      <span />
    );

  return (
    <nav className="mc-postNav" aria-label="More">
      {item(nav.previous, `Previous ${noun}`, true)}
      {item(nav.next, `Next ${noun}`)}
    </nav>
  );
}
