import {
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
  type ReactNode,
  type RefObject
} from "react";

import type {
  LabContent,
  LinkModel,
  PageListSection,
  PostNavModel,
  TestimonialModel
} from "../../../lib/types";
import {
  Html,
  prefersReducedMotion,
  type FormField as Field
} from "../../site";

import {
  atkinson,
  canDither,
  paint,
  photoCoverage,
  readInks,
  seedOf,
  subscribeToScheme,
  terrain,
  type Levels,
  type TerrainShape
} from "./dither";
import { sketch } from "./iso";
import { sceneFor } from "./scenes";

type Posts = LabContent["posts"];
type Work = LabContent["work"];

export const cx = (...names: (string | false | null | undefined)[]) =>
  names.filter(Boolean).join(" ") || undefined;

/* Dot art
   ========================================================================== */

// Photo inks: midtones, then shadows (or highlights, on dark)
const PHOTO_INKS = ["--st-dot-mid", "--st-dot-ink"];
// Terrain inks: the field, then its densest ground
const TERRAIN_INKS = ["--st-sage", "--st-sage-deep"];
// Illustration inks: sage ground, then midtones, then full ink
const SKETCH_INKS = ["--st-sage", "--st-dot-mid", "--st-dot-ink"];

/**
 * Draws dot art into a canvas that fills `frame`, one cell per `dot` CSS
 * pixels: once it nears the viewport (dissolving in), then again whenever
 * its size or the color scheme changes. `draw` returns null until it has
 * something to draw, e.g. while a photo loads.
 */
function useDots({
  frame,
  canvas,
  image,
  dot,
  inks: palette,
  draw,
  source
}: {
  frame: RefObject<HTMLElement | null>;
  canvas: RefObject<HTMLCanvasElement | null>;
  /** A photo to wait for */
  image?: RefObject<HTMLImageElement | null>;
  dot: number;
  inks: string[];
  draw: (columns: number, rows: number, dark: boolean) => Levels | null;
  /** What's drawn; a new source starts over */
  source: string;
}) {
  const [ready, setReady] = useState(false);
  const levelsFor = useEffectEvent(draw);
  const paletteKey = palette.join(" ");

  useEffect(() => {
    const element = frame.current;
    const target = canvas.current;
    if (!element || !target) return;

    let visible = false;
    let drawn = "";
    let animation = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const render = (develop: boolean) => {
      if (!visible) return;
      const { width, height } = element.getBoundingClientRect();
      const columns = Math.ceil(width / dot);
      const rows = Math.ceil(height / dot);
      if (!columns || !rows) return;

      const inks = readInks(element, paletteKey.split(" "));
      const state = `${columns}×${rows} ${inks.colors.join(" ")}`;
      if (state === drawn) return;

      let levels: Levels | null;
      try {
        levels = levelsFor(columns, rows, inks.dark);
      } catch {
        // A photo the canvas can't read stays a photo
        return;
      }
      if (!levels) return;
      const ready = levels;

      target.width = columns;
      target.height = rows;
      target.style.width = `${columns * dot}px`;
      target.style.height = `${rows * dot}px`;
      cancelAnimationFrame(animation);

      if (develop && !drawn && !prefersReducedMotion()) {
        const start = performance.now();
        const step = (now: number) => {
          const progress = Math.min(1, (now - start) / 900);
          paint(target, ready, columns, rows, inks, progress ** 0.7);
          if (progress < 1) animation = requestAnimationFrame(step);
        };
        animation = requestAnimationFrame(step);
      } else {
        paint(target, ready, columns, rows, inks);
      }

      drawn = state;
      setReady(true);
    };

    const photo = image?.current;
    const onLoad = () => render(true);
    photo?.addEventListener("load", onLoad);

    const intersection = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || visible) return;
        visible = true;
        intersection.disconnect();
        render(true);
      },
      { rootMargin: "400px 0px" }
    );
    intersection.observe(element);

    const resize = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(() => render(false), 150);
    });
    resize.observe(element);

    const unsubscribe = subscribeToScheme(() => render(false));

    return () => {
      photo?.removeEventListener("load", onLoad);
      intersection.disconnect();
      resize.disconnect();
      unsubscribe();
      clearTimeout(timer);
      cancelAnimationFrame(animation);
    };
  }, [frame, canvas, image, dot, paletteKey, source]);

  return ready;
}

/**
 * A photo redrawn in stippled ink. The photo itself stays underneath, for
 * its alt text, its layout, and a glimpse on hover; it shows on its own
 * until the dots are drawn, or for good if they can't be.
 */
export function Stipple({
  src,
  alt = "",
  dot = 2,
  className,
  eager,
  toggle
}: {
  src: string;
  alt?: string;
  /** CSS pixels per dot */
  dot?: number;
  className?: string;
  /** Load right away, for photos at the top of a page */
  eager?: boolean;
  /** Offer a switch to the original, for work worth seeing as it is */
  toggle?: boolean;
}) {
  const [original, setOriginal] = useState(false);
  const frame = useRef<HTMLSpanElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const ditherable = canDither(src);

  const ready = useDots({
    frame,
    canvas,
    image,
    dot,
    inks: PHOTO_INKS,
    source: src,
    draw: (columns, rows, dark) => {
      const photo = image.current;
      if (!photo?.complete || !photo.naturalWidth) return null;
      const coverage = photoCoverage(photo, columns, rows, dark);
      return coverage && atkinson(coverage, columns, rows);
    }
  });

  return (
    <span
      ref={frame}
      className={cx(
        "st-stipple",
        ready && "is-ready",
        original && "is-original",
        className
      )}
    >
      <img
        ref={image}
        src={src}
        alt={alt}
        loading={eager ? undefined : "lazy"}
        decoding="async"
        crossOrigin={ditherable ? "anonymous" : undefined}
      />
      {ditherable && <canvas ref={canvas} aria-hidden="true" />}
      {toggle && ready && (
        <button
          type="button"
          className="st-stipple__toggle"
          aria-pressed={original}
          onClick={() => setOriginal(!original)}
        >
          Original
        </button>
      )}
    </span>
  );
}

/** Generated land in stippled sage, the same for a seed every time */
export function Terrain({
  seed,
  shape = "field",
  dot = 2,
  scale = 260,
  className
}: {
  seed: string;
  shape?: TerrainShape;
  dot?: number;
  /** Size of the largest features, in CSS pixels */
  scale?: number;
  className?: string;
}) {
  const frame = useRef<HTMLSpanElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useDots({
    frame,
    canvas,
    dot,
    inks: TERRAIN_INKS,
    source: `${seed} ${shape} ${scale}`,
    draw: (columns, rows) =>
      terrain(columns, rows, seedOf(seed), shape, scale / dot)
  });

  return (
    <span
      ref={frame}
      className={cx("st-terrain", `st-terrain--${shape}`, className)}
      aria-hidden="true"
    >
      <canvas ref={canvas} />
    </span>
  );
}

/**
 * What a service is, drawn as a small isometric scene (see `./scenes.ts`),
 * or terrain of its own for a service that doesn't have one yet
 */
export function ServiceArt({
  url,
  className
}: {
  url: string;
  className?: string;
}) {
  const frame = useRef<HTMLSpanElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const scene = sceneFor(url);

  useDots({
    frame,
    canvas,
    dot: 2,
    inks: SKETCH_INKS,
    source: url,
    draw: (columns, rows, dark) =>
      scene ? sketch(scene, columns, rows, dark, seedOf(url)) : null
  });

  if (!scene) {
    return (
      <Terrain className={className} seed={url} shape="isle" scale={180} />
    );
  }

  return (
    <span ref={frame} className={cx("st-sketch", className)} aria-hidden="true">
      <canvas ref={canvas} />
    </span>
  );
}

/* Marks and icons
   ========================================================================== */

/**
 * A halftone moon: dots that swell toward the shadow side of a sphere lit
 * from `angle` (radians, clockwise from the right; default upper left)
 */
function moonDots(angle: number) {
  const dots: { x: number; y: number; r: number }[] = [];
  const lightX = Math.cos(angle) * 0.8;
  const lightY = Math.sin(angle) * 0.8;
  const step = 3.4;
  for (let y = 2 + step / 2; y < 38; y += step) {
    for (let x = 2 + step / 2; x < 38; x += step) {
      const dx = (x - 20) / 16;
      const dy = (y - 20) / 16;
      const inside = 1 - dx * dx - dy * dy;
      if (inside <= 0.02) continue;
      const light = Math.max(
        0,
        lightX * dx + lightY * dy + 0.58 * Math.sqrt(inside)
      );
      const radius = (1 - light) * 1.55;
      if (radius > 0.25) dots.push({ x, y, r: Number(radius.toFixed(2)) });
    }
  }
  return dots;
}

const UPPER_LEFT = Math.atan2(-0.6, -0.55);
const MARK_DOTS = moonDots(UPPER_LEFT);

/** The halftone moon; with a `seed`, lit from its own direction */
export function Mark({
  seed,
  className
}: {
  seed?: string;
  className?: string;
}) {
  const dots = seed
    ? moonDots((seedOf(seed) % 360) * (Math.PI / 180))
    : MARK_DOTS;

  return (
    <svg
      className={cx("st-mark", className)}
      viewBox="0 0 40 40"
      aria-hidden="true"
    >
      <circle cx="20" cy="20" r="19" fill="none" stroke="currentColor" />
      {dots.map((dot) => (
        <circle key={`${dot.x} ${dot.y}`} cx={dot.x} cy={dot.y} r={dot.r} />
      ))}
    </svg>
  );
}

/** A small circled arrow, for buttons that lead somewhere */
export const Arrow = ({ down }: { down?: boolean }) => (
  <svg className="st-arrow" viewBox="0 0 16 16" aria-hidden="true">
    <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" />
    <path
      d={down ? "M8 5v6M5.5 8.5 8 11l2.5-2.5" : "M5 8h6M8.5 5.5 11 8l-2.5 2.5"}
      fill="none"
      stroke="currentColor"
    />
  </svg>
);

/* Layout
   ========================================================================== */

/** Crumbs, title, and lede at the top of a page; title and lede are HTML */
export function PageHeader({
  crumbs,
  title,
  lede,
  children
}: {
  crumbs?: ReactNode;
  title: string;
  lede?: string;
  children?: ReactNode;
}) {
  return (
    <header className="st-pageHeader">
      {crumbs && <p className="st-crumbs">{crumbs}</p>}
      <Html as="h1" className="st-title" html={title} />
      {lede && <Html as="p" className="st-lede" html={lede} />}
      {children}
    </header>
  );
}

/** The reading column, with a rail beside it on wide screens */
export function Layout({
  rail,
  children
}: {
  rail?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="st-layout">
      <div className="st-column">{children}</div>
      {rail && <aside className="st-rail">{rail}</aside>}
    </div>
  );
}

export interface Chapter {
  id: string;
  label: string;
}

/** The page's sections, with the one being read marked as you scroll */
export function Contents({ chapters }: { chapters: Chapter[] }) {
  const [active, setActive] = useState<string | undefined>(chapters[0]?.id);
  const ids = chapters.map((chapter) => chapter.id).join(" ");

  useEffect(() => {
    const sections = ids
      .split(" ")
      .map((id) => document.getElementById(id))
      .filter((section) => section !== null);
    let frame = 0;

    const update = () => {
      frame = 0;
      let current: string | undefined = sections[0]?.id;
      for (const section of sections) {
        if (section.getBoundingClientRect().top < innerHeight * 0.35) {
          current = section.id;
        }
      }
      // The last section may be too short to reach the line
      if (innerHeight + scrollY >= document.body.scrollHeight - 4) {
        current = sections.at(-1)?.id;
      }
      setActive(current);
    };
    const schedule = () => {
      frame ||= requestAnimationFrame(update);
    };

    schedule();
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    return () => {
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, [ids]);

  if (chapters.length < 2) return null;

  return (
    <nav className="st-contents" aria-label="On this page">
      <ul>
        {chapters.map((chapter) => (
          <li key={chapter.id}>
            <a
              href={`#${chapter.id}`}
              aria-current={chapter.id === active ? "location" : undefined}
            >
              {chapter.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Section({
  id,
  title,
  action,
  children
}: {
  id: string;
  title: ReactNode;
  /** A link beside the title */
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="st-section" aria-labelledby={`${id}-title`}>
      <header className="st-section__head">
        <h2 id={`${id}-title`}>{title}</h2>
        {action}
      </header>
      {children}
    </section>
  );
}

export function Button({
  href,
  ghost,
  small,
  arrow,
  children
}: {
  href: string;
  ghost?: boolean;
  small?: boolean;
  arrow?: boolean;
  children: ReactNode;
}) {
  return (
    <a
      className={cx(
        "st-button",
        ghost && "st-button--ghost",
        small && "st-button--small"
      )}
      href={href}
    >
      {children}
      {arrow && <Arrow />}
    </a>
  );
}

/** A quiet text link with a circled arrow, e.g. beside a section title */
export const More = ({
  href,
  children
}: {
  href: string;
  children: ReactNode;
}) => (
  <a className="st-more" href={href}>
    {children}
    <Arrow />
  </a>
);

/** Term and detail pairs, terms in monospace */
export function Facts({ rows }: { rows: [ReactNode, ReactNode][] }) {
  return (
    <dl className="st-facts">
      {rows.map(([term, detail], index) => (
        <div key={index}>
          <dt>{term}</dt>
          <dd>{detail}</dd>
        </div>
      ))}
    </dl>
  );
}

/* Lists
   ========================================================================== */

export interface EntryItem {
  url: string;
  title: string;
  /** A line beneath the title */
  sub?: ReactNode;
  /** Monospace notes on the right, one per line */
  meta?: ReactNode[];
}

/** Titles set large in the display serif, with notes on the right */
export function Entries({
  items,
  size = "large"
}: {
  items: EntryItem[];
  size?: "large" | "medium";
}) {
  return (
    <ol className={cx("st-entries", `st-entries--${size}`)}>
      {items.map((item) => (
        <li key={item.url} className="st-entry">
          <a className="st-entry__title" href={item.url}>
            {item.title}
          </a>
          {item.sub && <div className="st-entry__sub">{item.sub}</div>}
          {item.meta && (
            <p className="st-entry__meta">
              {item.meta.map((note, index) => (
                <span key={index}>{note}</span>
              ))}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}

export const postItems = (posts: Posts): EntryItem[] =>
  posts.map((post) => ({
    url: post.url,
    title: post.title,
    sub: post.lede,
    meta: [
      post.type,
      <time key="date" dateTime={post.iso}>
        {post.iso}
      </time>
    ].filter(Boolean)
  }));

/** Clients as a roll of names, each beside a moon in its own phase */
export function Clients({ work }: { work: Work }) {
  return (
    <ul className="st-clients">
      {work.map((item) => (
        <li key={item.url}>
          <a href={item.url}>
            <Mark className="st-clients__mark" seed={item.name} />
            <span className="st-clients__name">{item.name}</span>
          </a>
          <p className="st-clients__meta">
            <span>{item.role}</span>
            <span>{item.year}</span>
          </p>
        </li>
      ))}
    </ul>
  );
}

/** A case study as a plate: stippled cover, name, notes, and a way in */
export function WorkCard({ item }: { item: Work[number] }) {
  return (
    <article className="st-card">
      <a
        className="st-card__art"
        href={item.url}
        tabIndex={-1}
        aria-hidden="true"
      >
        <Stipple src={item.cover} />
      </a>
      <h3 className="st-card__title">
        <a href={item.url}>{item.name}</a>
      </h3>
      <p className="st-card__meta">
        <span>{item.industry}</span>
        <span>{item.year}</span>
      </p>
      {item.lede && <Html as="p" className="st-card__text" html={item.lede} />}
      <p className="st-card__actions">
        <Button href={item.url} small>
          View case study
        </Button>
        {item.role && <span>{item.role}</span>}
      </p>
    </article>
  );
}

/** Services as plates, each with a scene of its own */
export function ServiceCards({
  services
}: {
  services: LabContent["services"];
}) {
  return (
    <div className="st-plates">
      {services.map((service) => (
        <article key={service.url} className="st-plate">
          <a
            className="st-plate__art"
            href={service.url}
            tabIndex={-1}
            aria-hidden="true"
          >
            <ServiceArt url={service.url} />
          </a>
          <h3 className="st-plate__title">
            <a href={service.url}>{service.title}</a>
          </h3>
          {service.lede && <p className="st-plate__text">{service.lede}</p>}
        </article>
      ))}
    </div>
  );
}

export function Quote({ testimonial }: { testimonial: TestimonialModel }) {
  const { person } = testimonial;

  return (
    <figure className="st-quote">
      <Html as="blockquote" html={testimonial.content} />
      {person && (
        <figcaption>
          {person.image && (
            <Stipple className="st-quote__face" src={person.image} dot={1} />
          )}
          <span>
            <span className="st-quote__name">{person.name}</span>
            {person.position && (
              <span className="st-quote__role">{person.position}</span>
            )}
          </span>
        </figcaption>
      )}
    </figure>
  );
}

export function Quotes({ testimonials }: { testimonials: TestimonialModel[] }) {
  return (
    <div className="st-quotes">
      {testimonials.map((testimonial) => (
        <Quote key={testimonial.id} testimonial={testimonial} />
      ))}
    </div>
  );
}

/** Tags, post types, or qualities, as a row of small pills */
export function Chips({
  links,
  label
}: {
  links: (LinkModel | { text: string; url?: undefined })[];
  label: string;
}) {
  return (
    <ul className="st-chips" aria-label={label}>
      {links.map((link) => (
        <li key={link.text}>
          {link.url ? (
            <a href={link.url}>{link.text}</a>
          ) : (
            <span>{link.text}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

/** Every page on the site, by title and URL */
export function PageTable({ pages }: { pages: PageListSection["pages"] }) {
  return (
    <table className="st-table">
      <thead>
        <tr>
          <th scope="col">Page</th>
          <th scope="col">URL</th>
        </tr>
      </thead>
      <tbody>
        {pages.map((page) => (
          <tr key={page.url}>
            <td>{page.title}</td>
            <td>
              <a href={page.url}>{page.url}</a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function PostNav({ nav }: { nav: PostNavModel | null }) {
  if (!nav || (!nav.previous && !nav.next)) return null;

  return (
    <nav className="st-postNav" aria-label="More">
      {nav.previous && (
        <a href={nav.previous.url} rel="prev">
          <span>Previous</span>
          {nav.previous.text}
        </a>
      )}
      {nav.next && (
        <a href={nav.next.url} rel="next">
          <span>Next</span>
          {nav.next.text}
        </a>
      )}
    </nav>
  );
}

/* Forms (mockups: the lab never submits anything)
   ========================================================================== */

export const mockStatus = (sent: boolean) =>
  sent
    ? "Mockup only — nothing was sent."
    : "Mockup only — this form doesn’t send anything.";

/** Email sign-up for new writing, as a single field with its button */
export function Signup({ compact }: { compact?: boolean }) {
  const [sent, setSent] = useState(false);
  const id = useId();

  return (
    <form
      className={cx("st-signup", compact && "st-signup--compact")}
      onSubmit={(event) => {
        event.preventDefault();
        setSent(true);
      }}
    >
      <label className="st-visuallyHidden" htmlFor={id}>
        Email
      </label>
      <span className="st-signup__field">
        <input
          id={id}
          type="email"
          name="email"
          placeholder="Get email updates"
          required
        />
        <button type="submit" aria-label="Subscribe">
          <Arrow />
        </button>
      </span>
      <span className="st-signup__status" role="status">
        {compact ? (sent ? mockStatus(true) : "") : mockStatus(sent)}
      </span>
    </form>
  );
}

export function FormField({ field }: { field: Field }) {
  const className = cx("st-field", field.wide && "st-field--wide");

  if (field.kind === "choices") {
    return (
      <fieldset className={className}>
        <legend>{field.label}</legend>
        <span className="st-field__choices">
          {field.options.map((option) => (
            <label key={option} className="st-choice">
              <input type={field.type} name={field.name} value={option} />
              <span>{option}</span>
            </label>
          ))}
        </span>
      </fieldset>
    );
  }

  return (
    <label className={className}>
      <span>{field.label}</span>
      {field.kind === "textarea" ? (
        <textarea
          name={field.name}
          rows={field.rows}
          placeholder={field.placeholder}
        />
      ) : (
        <input
          type={field.type}
          name={field.name}
          placeholder={field.placeholder}
        />
      )}
    </label>
  );
}
