import { useState, type ReactNode } from "react";

import type {
  LabContent,
  LinkModel,
  PostNavModel,
  TestimonialModel
} from "../../../lib/types";
import { Html, pad, usePreview, useTo } from "../../site";

import {
  DIE,
  FACE,
  GO,
  ICONS,
  ITEMS,
  mascot,
  MONITOR,
  mosaic,
  PIXEL_COLORS,
  type Art,
  type IconName,
  type Item
} from "./sprites";

//
// Content helpers
// ---------------

export const cx = (...names: (string | false | undefined)[]) =>
  names.filter(Boolean).join(" ");

export type Post = LabContent["posts"][number];
export type Work = LabContent["work"][number];

/** Every post type gets a rating from the (entirely made up) KPRB */
const RATINGS: Record<string, { letter: string; item: Item }> = {
  Article: { letter: "A", item: "paper" },
  Essay: { letter: "E", item: "pencil" },
  Reflection: { letter: "R", item: "star" },
  Tutorial: { letter: "T", item: "wrench" }
};

export const ratingOf = (type?: string) =>
  RATINGS[type ?? ""] ?? { letter: "RP", item: "question" as Item };

export const RATING_TYPES = Object.keys(RATINGS);

/** Site path of a post type's archive, e.g. `/type/essays/` */
export const typePath = (type: string) => `/type/${type.toLowerCase()}s/`;

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

/** Reads a readable post date, e.g. "Oct 09, 2022" */
export function parseDate(date: string) {
  const match = /^(\w{3}) (\d{1,2}), (\d{4})$/.exec(date);
  if (!match) return undefined;
  return {
    year: Number(match[3]),
    month: MONTHS.indexOf(match[1]),
    day: Number(match[2])
  };
}

/** Short date in brackets, the way news items were stamped: `[Oct 09, 2022]` */
export const stamp = (date: string) => `[${date}]`;

//
// Pixels
// ------

/** Pixel art as crisp SVG rectangles; `gap` leaves a seam between pixels */
export function Sprite({
  art,
  scale = 1,
  gap = 0,
  className,
  label
}: {
  art: Art;
  scale?: number;
  gap?: number;
  className?: string;
  label?: string;
}) {
  const width = Math.max(...art.map((row) => row.length));
  const height = art.length;
  const rects: ReactNode[] = [];

  art.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const pixel = row[x];
      let end = x + 1;
      if (pixel === ".") {
        x = end;
        continue;
      }
      // Merge runs of one color, unless every pixel needs its own seam
      if (!gap) while (row[end] === pixel) end++;
      rects.push(
        <rect
          key={`${x}.${y}`}
          x={x + gap / 2}
          y={y + gap / 2}
          width={end - x - gap}
          height={1 - gap}
          fill={pixel === "C" ? "currentColor" : PIXEL_COLORS[pixel]}
        />
      );
      x = end;
    }
  });

  return (
    <svg
      className={cx("pt-sprite", className)}
      viewBox={`0 0 ${width} ${height}`}
      width={width * scale}
      height={height * scale}
      shapeRendering="crispEdges"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {rects}
    </svg>
  );
}

export const Icon = ({
  name,
  className
}: {
  name: IconName;
  className?: string;
}) => <Sprite art={ICONS[name]} className={cx("pt-icon", className)} />;

export const ItemIcon = ({
  item,
  className
}: {
  item: Item;
  className?: string;
}) => <Sprite art={ITEMS[item]} className={cx("pt-item", className)} />;

export const GoDot = () => <Sprite art={GO} className="pt-goDot" />;

export const Mascot = ({
  item,
  className
}: {
  item?: Item;
  className?: string;
}) => (
  <Sprite art={mascot(item)} scale={3} className={cx("pt-mascot", className)} />
);

/** Pastel mosaic used behind the e-mail news ad */
export const Mosaic = ({ seed }: { seed: number }) => (
  <Sprite art={mosaic(12, 22, seed)} className="pt-mosaic" />
);

//
// Building blocks
// ---------------

/** Section heading with a triple-bar mark, e.g. `≡ NEWS ARCHIVES` */
export function Heading({
  as: Tag = "h2",
  id,
  more,
  children
}: {
  as?: "h1" | "h2" | "h3";
  id?: string;
  more?: { href: string; text: string };
  children: ReactNode;
}) {
  return (
    <div className="pt-heading" id={id}>
      <span className="pt-heading__bars" aria-hidden="true" />
      <Tag className="pt-heading__text">{children}</Tag>
      {more && (
        <a className="pt-heading__more" href={more.href}>
          {more.text}
          <Icon name="arrowRight" />
        </a>
      )}
    </div>
  );
}

/** Rounded pill button with a round icon well, e.g. `◉ TAKE OUR SURVEY` */
export function Pill({
  href,
  icon = "power",
  tone,
  type = "button",
  onClick,
  children
}: {
  href?: string;
  icon?: IconName;
  tone?: "orange" | "dark";
  type?: "button" | "submit";
  onClick?: () => void;
  children: ReactNode;
}) {
  const className = cx("pt-pill", tone && `pt-pill--${tone}`);
  const inner = (
    <>
      <span className="pt-pill__well">
        <Icon name={icon} />
      </span>
      <span className="pt-pill__text">{children}</span>
    </>
  );

  return href ? (
    <a className={className} href={href}>
      {inner}
    </a>
  ) : (
    <button className={className} type={type} onClick={onClick}>
      {inner}
    </button>
  );
}

/** Small dark button with an arrow end, e.g. `GO ▸` */
export const Go = ({
  label = "Go",
  type = "submit"
}: {
  label?: string;
  type?: "submit" | "button";
}) => (
  <button className="pt-go" type={type}>
    <span>{label}</span>
    <Icon name="arrowRight" />
  </button>
);

/** A rating box, after the ones printed on every game box */
export const Badge = ({
  big,
  small = "KPRB",
  title
}: {
  big: ReactNode;
  small?: ReactNode;
  title?: string;
}) => (
  <span className="pt-badge" title={title}>
    <span className="pt-badge__big">{big}</span>
    <span className="pt-badge__small">{small}</span>
  </span>
);

export const Rating = ({ type }: { type?: string }) => {
  const { letter } = ratingOf(type);
  return (
    <Badge
      big={letter}
      title={type ? `Rated ${letter} for ${type}` : "Rating pending"}
    />
  );
};

type StripCell =
  { label: string; art: Art; href?: string } | { badge: ReactNode };

/** Orange strip of little labeled boxes beside a picture */
export function TagStrip({ cells }: { cells: StripCell[] }) {
  return (
    <ul className="pt-strip" aria-hidden="true">
      {cells.map((cell, index) =>
        "badge" in cell ? (
          <li key={index} className="pt-strip__badge">
            {cell.badge}
          </li>
        ) : (
          <li key={index}>
            <span className="pt-strip__label">{cell.label}</span>
            {cell.href ? (
              <a href={cell.href} tabIndex={-1}>
                <Sprite art={cell.art} className="pt-strip__art" />
              </a>
            ) : (
              <Sprite art={cell.art} className="pt-strip__art" />
            )}
          </li>
        )
      )}
    </ul>
  );
}

/** Picture with a tag strip over a title line, like a featured game */
export function GameCard({
  href,
  image,
  title,
  copy,
  cells,
  fallback = "question"
}: {
  href: string;
  image?: string;
  title: string;
  copy?: string;
  cells: StripCell[];
  fallback?: Item;
}) {
  return (
    <article className="pt-game">
      <div className="pt-game__media">
        <a className="pt-game__img" href={href} tabIndex={-1}>
          {image ? (
            <img src={image} alt="" loading="lazy" />
          ) : (
            <span className="pt-game__none">
              <Sprite art={ITEMS[fallback]} scale={6} />
            </span>
          )}
        </a>
        <TagStrip cells={cells} />
      </div>
      <div className="pt-game__foot">
        <GoDot />
        <div>
          <h3 className="pt-game__title">
            <a href={href}>{title}</a>
          </h3>
          {copy && <p className="pt-game__copy">{copy}</p>}
        </div>
      </div>
    </article>
  );
}

export function PostCard({ post }: { post: Post }) {
  const rating = ratingOf(post.type);
  return (
    <GameCard
      href={post.url}
      image={post.image}
      title={post.title}
      copy={post.lede}
      fallback={rating.item}
      cells={[
        { label: "Post type", art: ITEMS[rating.item] },
        { label: "Read post", art: FACE, href: post.url },
        { badge: <Rating type={post.type} /> }
      ]}
    />
  );
}

export function WorkCard({ item, index }: { item: Work; index: number }) {
  return (
    <GameCard
      href={item.url}
      image={item.cover}
      title={item.name}
      copy={[item.industry, item.year].filter(Boolean).join(" · ")}
      cells={[
        { label: "Plat form", art: MONITOR },
        { label: "Case page", art: FACE, href: item.url },
        { badge: <Badge big={pad(index + 1)} small="Case" /> }
      ]}
    />
  );
}

/** Category tile: a labeled header bar over a cropped screenshot */
export function Tile({
  title,
  href,
  icon,
  image,
  children
}: {
  title: string;
  href?: string;
  icon: IconName;
  image?: string;
  children?: ReactNode;
}) {
  const head = (
    <>
      <Icon name={icon} />
      <span>{title}</span>
    </>
  );

  return (
    <li className="pt-tile">
      {href ? (
        <a className="pt-tile__head" href={href}>
          {head}
        </a>
      ) : (
        <p className="pt-tile__head">{head}</p>
      )}
      {image && href && (
        <a className="pt-tile__img" href={href} tabIndex={-1}>
          <img src={image} alt="" loading="lazy" />
        </a>
      )}
      {children && <div className="pt-tile__body">{children}</div>}
    </li>
  );
}

/**
 * Select that jumps to the chosen URL, like the old "Sub Categories" menus.
 * In the style guide it only shows the choice.
 */
export function JumpMenu({
  label,
  options
}: {
  label: string;
  options: { href: string; text: string }[];
}) {
  const preview = usePreview();

  return (
    <select
      className="pt-select"
      aria-label={label}
      defaultValue=""
      onChange={(event) => {
        if (event.target.value && !preview) {
          window.location.href = event.target.value;
        }
      }}
    >
      <option value="" disabled>
        {label}
      </option>
      {options.map((option) => (
        <option key={option.href} value={option.href}>
          {option.text}
        </option>
      ))}
    </select>
  );
}

/** Headlines with an icon, a bracketed date, and an orange arrow tab */
export function NewsList({
  items
}: {
  items: { href: string; title: string; date?: string; item: Item }[];
}) {
  return (
    <ul className="pt-news">
      {items.map((entry) => (
        <li key={entry.href}>
          <ItemIcon item={entry.item} className="pt-news__icon" />
          <p className="pt-news__text">
            <a href={entry.href}>{entry.title}</a>
            {entry.date && (
              <span className="pt-news__date"> {stamp(entry.date)}</span>
            )}
          </p>
          <a
            className="pt-news__go"
            href={entry.href}
            tabIndex={-1}
            aria-hidden="true"
          >
            <Icon name="arrowRight" />
          </a>
        </li>
      ))}
    </ul>
  );
}

export const postNews = (posts: Post[]) =>
  posts.map((post) => ({
    href: post.url,
    title: post.title,
    date: post.date,
    item: ratingOf(post.type).item
  }));

/** Dark headline box with a picture, for the top story */
export function Feature({
  href,
  image,
  title,
  date,
  sub,
  more = "Read More…"
}: {
  href: string;
  image?: string;
  title: string;
  date?: string;
  sub?: string;
  more?: string;
}) {
  return (
    <article className="pt-feature">
      <a className="pt-feature__img" href={href} tabIndex={-1}>
        {image ? (
          <img src={image} alt="" />
        ) : (
          <Sprite art={MONITOR} scale={10} />
        )}
      </a>
      <div className="pt-feature__body">
        <h2 className="pt-feature__title">
          <a href={href}>{title}</a>
        </h2>
        {date && <p className="pt-feature__date">{date}</p>}
        {sub && <p className="pt-feature__sub">{sub}</p>}
        <a className="pt-feature__more" href={href}>
          {more}
        </a>
      </div>
    </article>
  );
}

/** Magazine-style promo box: a picture, a masthead, copy, and a button */
export function Promo({
  id,
  visual,
  masthead,
  children,
  cta
}: {
  id?: string;
  visual: ReactNode;
  masthead: ReactNode;
  children: ReactNode;
  cta?: { href: string; text: string };
}) {
  return (
    <section className="pt-promo" id={id}>
      <div className="pt-promo__inner">
        <div className="pt-promo__visual">{visual}</div>
        <div className="pt-promo__body">
          <p className="pt-promo__masthead">{masthead}</p>
          <div className="pt-promo__copy">{children}</div>
        </div>
      </div>
      {cta && (
        <a className="pt-promo__cta" href={cta.href}>
          <Icon name="arrowRight" />
          {cta.text}
        </a>
      )}
    </section>
  );
}

/** Mock newsletter sign-up; the lab never submits anything */
export function Newsletter() {
  const [sent, setSent] = useState(false);

  return (
    <Promo
      id="newsletter"
      visual={
        <span className="pt-promo__mosaic">
          <Mosaic seed={4} />
          <span className="pt-promo__mosaicText">
            E-mail
            <br />
            news
          </span>
        </span>
      }
      masthead={
        <>
          <span className="pt-masthead">KP</span> E-mail News
        </>
      }
    >
      <p>
        New essays and tutorials, sent to your inbox when they’re published. No
        spam, unsubscribe anytime.
      </p>
      <form
        className="pt-inline"
        onSubmit={(event) => {
          event.preventDefault();
          setSent(true);
        }}
      >
        <label className="pt-visually-hidden" htmlFor="pt-newsletter-email">
          Email address
        </label>
        <input
          id="pt-newsletter-email"
          className="pt-input"
          type="email"
          placeholder="you@example.com"
        />
        <Go label="Sign up" />
      </form>
      <p className="pt-note" role="status">
        {sent
          ? "Thanks! (Mockup only — nothing was sent.)"
          : "Mockup only — this form doesn’t send anything."}
      </p>
    </Promo>
  );
}

//
// Page furniture
// --------------

/** Heading and lede pulled from a page's intro, set on the open field */
export const Intro = ({
  heading,
  lede
}: {
  /** HTML */
  heading?: string;
  /** HTML */
  lede?: string;
}) =>
  heading || lede ? (
    <div className="pt-intro">
      {heading && <Html as="h2" className="pt-intro__heading" html={heading} />}
      {lede && <Html as="p" className="pt-intro__lede" html={lede} />}
    </div>
  ) : null;

/** Dark title tab that opens inner pages, with a strip of framed pictures */
export function TitleBar({
  title,
  images = []
}: {
  title: ReactNode;
  images?: (string | undefined)[];
}) {
  const shown = images.filter(Boolean).slice(0, 4) as string[];

  return (
    <header className="pt-title">
      <div className="pt-title__tab">
        <span className="pt-title__dots" aria-hidden="true" />
        <h1 className="pt-title__text">{title}</h1>
      </div>
      {shown.length > 0 && (
        <ul className="pt-title__strip" aria-hidden="true">
          {shown.map((src) => (
            <li key={src}>
              <img src={src} alt="" />
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}

/** Colored banner that opens a system page: a logo block and a picture */
export function Banner({
  color,
  logo,
  logoIsTitle,
  title,
  lede,
  image,
  tab
}: {
  color?: string;
  logo: ReactNode;
  /** Set the logo as the page's `<h1>` */
  logoIsTitle?: boolean;
  title?: ReactNode;
  lede?: ReactNode;
  image?: ReactNode;
  tab: string;
}) {
  const valid = color && /^#[0-9a-f]{3,8}$/i.test(color) ? color : undefined;
  const Logo = logoIsTitle ? "h1" : "p";

  return (
    <header
      className={cx("pt-banner", valid && isLight(valid) && "pt-banner--light")}
      style={valid ? ({ "--banner": valid } as React.CSSProperties) : undefined}
    >
      <div className="pt-banner__main">
        <Logo className="pt-banner__logo">{logo}</Logo>
        {title}
        {lede && <div className="pt-banner__lede">{lede}</div>}
      </div>
      <div className="pt-banner__side">
        <p className="pt-banner__tab">{tab}</p>
        <div className="pt-banner__img">{image}</div>
      </div>
    </header>
  );
}

/** Rough relative luminance check for a hex color */
function isLight(hex: string) {
  const full =
    hex.length === 4 ? `#${[...hex.slice(1)].map((c) => c + c).join("")}` : hex;
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(full.slice(i, i + 2), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 150;
}

/** Bar with a topic menu that jumps down the page */
export function ContentKey({
  topics
}: {
  topics: { id: string; title: string }[];
}) {
  if (topics.length < 2) return null;

  return (
    <nav className="pt-key" id="content-key" aria-label="Content key">
      <span className="pt-key__arrow" aria-hidden="true">
        <Icon name="arrowDown" />
      </span>
      <span className="pt-key__label">Content key</span>
      <select
        className="pt-select"
        aria-label="Jump to a topic"
        defaultValue=""
        onChange={(event) => {
          const target = document.getElementById(event.target.value);
          target?.scrollIntoView({ block: "start" });
          event.target.value = "";
        }}
      >
        <option value="" disabled>
          Select a topic here
        </option>
        {topics.map((topic) => (
          <option key={topic.id} value={topic.id}>
            {topic.title}
          </option>
        ))}
      </select>
    </nav>
  );
}

/** Light content box with a dark title bar and a "to key" tab back up */
export function KeySection({
  id,
  title,
  html,
  toKey = true,
  className,
  children
}: {
  id?: string;
  title?: ReactNode;
  /** HTML title, e.g. a heading pulled from post content */
  html?: string;
  toKey?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cx("pt-keysec", className)} id={id}>
      {(title || html) && (
        <div className="pt-keysec__head">
          {html ? (
            <Html as="h2" className="pt-keysec__title" html={html} />
          ) : (
            <h2 className="pt-keysec__title">{title}</h2>
          )}
          {toKey && (
            <a className="pt-keysec__up" href="#content-key">
              To key
              <span>
                <Icon name="arrowUp" />
              </span>
            </a>
          )}
        </div>
      )}
      <div className="pt-keysec__body">{children}</div>
    </section>
  );
}

/** Numbered "Features" list with little square numerals */
export const Features = ({ items }: { items: ReactNode[] }) => (
  <ol className="pt-features">
    {items.map((item, index) => (
      <li key={index}>
        <span className="pt-features__num" aria-hidden="true">
          {index + 1}
        </span>
        {item}
      </li>
    ))}
  </ol>
);

/** Side column group with a triple-bar heading */
export const SideGroup = ({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}) => (
  <section className="pt-acc">
    <h2 className="pt-acc__title">
      <span className="pt-heading__bars" aria-hidden="true" />
      {title}
    </h2>
    {children}
  </section>
);

/** Dark side column panel with arrow-tab rows */
export function SideList({
  title,
  items
}: {
  title: string;
  items: { href?: string; text: ReactNode; small?: ReactNode }[];
}) {
  return (
    <SideGroup title={title}>
      <ul className="pt-acc__list">
        {items.map((item, index) => (
          <li key={index}>
            {item.href ? (
              <a href={item.href}>
                <span>
                  {item.text}
                  {item.small && <small>{item.small}</small>}
                </span>
                <span className="pt-acc__go" aria-hidden="true">
                  <Icon name="arrowRight" />
                </span>
              </a>
            ) : (
              <span className="pt-acc__static">
                <span>
                  {item.text}
                  {item.small && <small>{item.small}</small>}
                </span>
              </span>
            )}
          </li>
        ))}
      </ul>
    </SideGroup>
  );
}

/** Small link card with a picture, e.g. "Technical help" */
export const LinkCard = ({
  href,
  label,
  art,
  children
}: {
  href: string;
  label: string;
  art: Art;
  children: ReactNode;
}) => (
  <a className="pt-linkcard" href={href}>
    <span className="pt-linkcard__label">
      {label}
      <span className="pt-acc__go" aria-hidden="true">
        <Icon name="arrowRight" />
      </span>
    </span>
    <span className="pt-linkcard__body">
      <Sprite art={art} scale={3} className="pt-linkcard__art" />
      <span>{children}</span>
    </span>
  </a>
);

export const BackLink = ({
  href,
  children
}: {
  href: string;
  children: ReactNode;
}) => (
  <a className="pt-back" href={href}>
    <Icon name="arrowRight" className="pt-back__icon" />
    {children}
  </a>
);

/** Two-column directory table, with a star tab for a header */
export function Directory({
  title,
  rows
}: {
  title: string;
  rows: [ReactNode, ReactNode][];
}) {
  return (
    <section className="pt-dir">
      <h2 className="pt-dir__title">
        <Sprite art={ITEMS.star} scale={4} className="pt-dir__star" />
        <span>{title}</span>
      </h2>
      <dl className="pt-dir__rows">
        {rows.map(([term, detail], index) => (
          <div key={index}>
            <dt>{term}</dt>
            <dd>{detail}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** Link with a small triangle, as in directory listings */
export const Tri = ({
  href,
  children
}: {
  href: string;
  children: ReactNode;
}) => (
  <a className="pt-tri" href={href}>
    {children}
  </a>
);

/** Light card shaped like a speech bubble, with an orange label tab */
export function BubbleCard({
  label,
  art = DIE,
  className,
  children
}: {
  label: string;
  art?: Art;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cx("pt-bubbleCard", className)}>
      <p className="pt-bubbleCard__label">
        <Sprite art={art} scale={3} className="pt-bubbleCard__art" />
        {label}
      </p>
      <div className="pt-bubbleCard__body">{children}</div>
    </div>
  );
}

//
// Testimonials
// ------------

export function Quote({
  testimonial,
  index
}: {
  testimonial: TestimonialModel;
  index: number;
}) {
  return (
    <figure className="pt-quote">
      <BubbleCard label={`Player review ${pad(index + 1)}`} art={ITEMS.heart}>
        <Html
          as="blockquote"
          className="pt-quote__text"
          html={testimonial.content}
        />
      </BubbleCard>
      {testimonial.person && (
        <figcaption className="pt-quote__person">
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
    </figure>
  );
}

/** One testimonial set like a magazine promo */
export function QuotePromo({
  testimonial
}: {
  testimonial?: TestimonialModel;
}) {
  const to = useTo();
  if (!testimonial) return null;

  return (
    <Promo
      visual={
        testimonial.person?.image ? (
          <img
            className="pt-promo__photo"
            src={testimonial.person.image}
            alt=""
            loading="lazy"
          />
        ) : (
          <Sprite art={ITEMS.heart} scale={8} />
        )
      }
      masthead={
        <>
          <span className="pt-masthead">Clients’</span> Choice
        </>
      }
      cta={{
        href: to("/testimonials/"),
        text: "Click to read more kind words"
      }}
    >
      <Html
        as="blockquote"
        className="pt-promo__quote"
        html={testimonial.truncated ?? testimonial.content}
      />
      {testimonial.person && (
        <p className="pt-promo__by">
          <strong>{testimonial.person.name}</strong>
          {testimonial.person.position && `, ${testimonial.person.position}`}
        </p>
      )}
    </Promo>
  );
}

//
// Banner ads
// ----------

export type AdName = "first" | "news" | "suck";

/** Skyscraper ads for the side column, after the ones in the screenshots */
export function Ad({ name }: { name: AdName }) {
  const to = useTo();

  if (name === "first") {
    return (
      <a className="pt-ad pt-ad--first" href={to("/project-inquiry/")}>
        <span className="pt-ad__paid" aria-hidden="true">
          Paid ad
        </span>
        <span className="pt-ad__stack">
          <span>The first</span>
          <span>The best</span>
          <span>The few</span>
        </span>
        <span className="pt-ad__big">18 years</span>
        <span className="pt-ad__on">on the web</span>
        <span className="pt-ad__foot">Free consult</span>
      </a>
    );
  }

  if (name === "news") {
    return (
      <a className="pt-ad pt-ad--news" href={to("/archive/#newsletter")}>
        <Mosaic seed={7} />
        <span className="pt-ad__pill">KP</span>
        <span className="pt-ad__news">
          E-mail
          <br />
          news
        </span>
        <span className="pt-ad__click">
          Click to
          <br />
          sign-up!
        </span>
      </a>
    );
  }

  return (
    <a className="pt-ad pt-ad--suck" href={to("/services/")}>
      <span className="pt-ad__suck">
        Websites
        <br />
        shouldn’t
        <strong>suck</strong>
      </span>
      <span className="pt-ad__sticker">
        <span>Hire</span>
        Keenan
      </span>
    </a>
  );
}

//
// Previous / next
// ---------------

export function PostNav({
  nav,
  noun = "article"
}: {
  nav: PostNavModel | null;
  noun?: string;
}) {
  if (!nav || (!nav.previous && !nav.next)) return null;

  const item = (link: LinkModel | undefined, label: string, next?: boolean) =>
    link ? (
      <a
        className={cx("pt-postNav__item", next && "pt-postNav__item--next")}
        href={link.url}
      >
        <span className="pt-postNav__label">{label}</span>
        <span className="pt-postNav__title">{link.text}</span>
      </a>
    ) : (
      <span />
    );

  return (
    <nav className="pt-postNav" aria-label="More">
      {item(nav.previous, `Previous ${noun}`)}
      {item(nav.next, `Next ${noun}`, true)}
    </nav>
  );
}
