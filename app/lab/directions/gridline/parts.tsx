import {
  lazy,
  Suspense,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode
} from "react";

import type {
  EntriesSection,
  LabContent,
  LinkModel,
  PageListSection,
  PostNavModel,
  TestimonialModel
} from "../../../lib/types";
import {
  Comments,
  cx,
  type FormField as Field,
  formOf,
  homeWork,
  Html,
  LocalTime,
  newsletterForm,
  pad,
  prefersReducedMotion,
  relabel,
  useMounted,
  useReducedMotion,
  useSubmission,
  useTo,
  yearsOf
} from "../../site";

import {
  boundsOf,
  clear,
  fill,
  lifeStep,
  reflect,
  sameSquare,
  scatter,
  squareAt,
  useGridSettings,
  type Paint,
  type Square
} from "./blueprint";
import { GridTools } from "./GridTools";

type Posts = LabContent["posts"];

/* Illustration
   ========================================================================== */

// The illustration machinery (the rigs, the isometric pen, the animation)
// is a chunk of its own, so the pages without a drawing don't carry it
const Art = lazy(() =>
  import("./ServiceArt").then((module) => ({ default: module.ServiceArt }))
);

/**
 * A service's illustration (`./ServiceArt`), loaded after the page. The
 * server draws it into the page; in the browser the drawing stays in place
 * until its chunk arrives, then plays as `playback` says.
 */
export function ServiceArt(props: ComponentProps<typeof Art>) {
  return (
    <Suspense fallback={null}>
      <Art {...props} />
    </Suspense>
  );
}

/* Structure
   ========================================================================== */

/** A full-width row of the grid, between hairlines; `invert` flips its scheme */
export function Band({
  invert,
  className,
  label,
  style,
  children
}: {
  invert?: boolean;
  className?: string;
  /** Names a band that has no heading of its own */
  label?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <section
      className={cx("gl-band", invert && "gl-invert", className)}
      aria-label={label}
      style={style}
    >
      {children}
    </section>
  );
}

/**
 * Items that share their hairlines, in up to `cols` columns. Render
 * `<li className="gl-cell">` children (or `<div>`s with `as="div"`).
 */
export function Cells({
  cols = 3,
  as: Tag = "ul",
  className,
  label,
  children
}: {
  cols?: 1 | 2 | 3 | 4;
  as?: "ul" | "ol" | "div";
  className?: string;
  label?: string;
  children: ReactNode;
}) {
  return (
    <div className={cx("gl-cells", className)}>
      <Tag
        className={`gl-cells__grid gl-cells__grid--${cols}`}
        aria-label={label}
      >
        {children}
      </Tag>
    </div>
  );
}

/** A mono label over a heading, with the section's number when it has one */
export function Eyebrow({
  index,
  className,
  children
}: {
  index?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <p className={cx("gl-eyebrow", className)}>
      {index !== undefined && (
        <>
          <span className="gl-eyebrow__index">{pad(index)}</span>
          <span className="gl-eyebrow__sep" aria-hidden="true">
            /
          </span>
        </>
      )}
      {children}
    </p>
  );
}

/** A band's opening row: eyebrow and heading, with a note and a link across */
export function SectionHead({
  index,
  eyebrow,
  title,
  description,
  more
}: {
  index?: number;
  eyebrow: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  more?: LinkModel;
}) {
  return (
    <header className="gl-head">
      <div>
        <Eyebrow index={index}>{eyebrow}</Eyebrow>
        <h2 className="gl-heading">{title}</h2>
      </div>
      {(description || more) && (
        <div className="gl-head__end">
          {description && <p>{description}</p>}
          {more && <More href={more.url}>{more.text}</More>}
        </div>
      )}
    </header>
  );
}

/**
 * Breadcrumb trail for an eyebrow: links up to the current page, which is
 * plain text
 */
export function Trail({
  links,
  current
}: {
  links: LinkModel[];
  current?: string;
}) {
  return (
    <>
      {links.map((link, index) => (
        <span key={link.url}>
          <a href={link.url}>{link.text}</a>
          {(current || index < links.length - 1) && (
            <span className="gl-eyebrow__sep" aria-hidden="true">
              {" "}
              /
            </span>
          )}
        </span>
      ))}
      {current && <span>{current}</span>}
    </>
  );
}

/** Eyebrow, title, and lede at the top of a page, with an aside of facts */
export function PageHeader({
  eyebrow,
  title,
  lede,
  aside,
  children
}: {
  eyebrow: ReactNode;
  /** HTML */
  title: string;
  /** HTML */
  lede?: string;
  aside?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header
      className={cx(
        "gl-band gl-page-header",
        aside ? "gl-page-header--aside" : undefined
      )}
    >
      <div className="gl-page-header__main">
        <Eyebrow>{eyebrow}</Eyebrow>
        <Html as="h1" className="gl-title" html={title} />
        {lede && <Html as="p" className="gl-lede" html={lede} />}
        {children}
      </div>
      {aside && <div className="gl-page-header__aside">{aside}</div>}
    </header>
  );
}

/** Intro copy: HTML with its own paragraphs, or plain text split by lines */
export function Copy({
  html,
  className
}: {
  html: string;
  className?: string;
}) {
  const blocks = /<(p|ul|ol|h\d|div|figure|blockquote)\b/i.test(html);
  return (
    <Html
      className={cx("gl-prose", !blocks && "gl-copy", className)}
      html={html}
    />
  );
}

/* Actions
   ========================================================================== */

export function Button({
  href,
  variant,
  size,
  type = "button",
  children
}: {
  href?: string;
  variant?: "ghost";
  size?: "small";
  type?: "button" | "submit";
  children: ReactNode;
}) {
  const className = cx(
    "gl-button",
    variant && `gl-button--${variant}`,
    size && `gl-button--${size}`
  );

  return href ? (
    <a className={className} href={href}>
      {children}
    </a>
  ) : (
    <button className={className} type={type}>
      {children}
    </button>
  );
}

export const Arrow = () => <span aria-hidden="true">→</span>;

/** A mono "see all" link in a bordered tab */
export const More = ({
  href,
  children
}: {
  href: string;
  children: ReactNode;
}) => (
  <a className="gl-more" href={href}>
    {children}
    <Arrow />
  </a>
);

/* Labels
   ========================================================================== */

/** Post types, tags, or qualities, as a row of chips */
export function Chips({
  links,
  label
}: {
  links: (LinkModel & { count?: number })[];
  label: string;
}) {
  return (
    <ul className="gl-chips" aria-label={label}>
      {links.map((link) => {
        const chip = (
          <>
            {link.text}
            {link.count !== undefined && (
              <span className="gl-chip__count">{link.count}</span>
            )}
          </>
        );
        return (
          <li key={link.url || link.text}>
            {link.url ? (
              <a className="gl-chip" href={link.url}>
                {chip}
              </a>
            ) : (
              <span className="gl-chip">{chip}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** Term and detail pairs, under hairlines */
export function Facts({ rows }: { rows: [ReactNode, ReactNode][] }) {
  return (
    <dl className="gl-facts">
      {rows.map(([term, detail], index) => (
        <div key={index}>
          <dt>{term}</dt>
          <dd>{detail}</dd>
        </div>
      ))}
    </dl>
  );
}

/** A big figure over a mono label */
export const Stat = ({
  value,
  label
}: {
  value: ReactNode;
  label: ReactNode;
}) => (
  <li className="gl-cell gl-stat">
    <span className="gl-stat__value">{value}</span>
    <span className="gl-stat__label">{label}</span>
  </li>
);

/* Lists
   ========================================================================== */

/** Posts one to a row: date, title and lede, type */
export function PostRows({ posts }: { posts: Posts }) {
  return (
    <ol className="gl-rows">
      {posts.map((post) => (
        <li key={post.url} className="gl-row">
          <a href={post.url}>
            <time dateTime={post.iso}>{post.date}</time>
            <span>
              <h3 className="gl-row__title">{post.title}</h3>
              {post.lede && <p className="gl-row__lede">{post.lede}</p>}
            </span>
            {post.type ? <span className="gl-tag">{post.type}</span> : <span />}
            <span className="gl-row__arrow" aria-hidden="true">
              →
            </span>
          </a>
        </li>
      ))}
    </ol>
  );
}

/** A numbered row: index, title and lede */
function CompactRow({
  index,
  url,
  title,
  lede
}: {
  index: number;
  url?: string;
  title?: string;
  lede?: ReactNode;
}) {
  return (
    <li className="gl-row gl-row--compact">
      <a href={url}>
        <span className="gl-meta">{pad(index + 1)}</span>
        <span>
          <h3 className="gl-row__title">{title}</h3>
          {lede}
        </span>
        <span />
        <span className="gl-row__arrow" aria-hidden="true">
          →
        </span>
      </a>
    </li>
  );
}

/** Links listed by an `entries` section (type and tag archives, …) */
export function EntryRows({ section }: { section: EntriesSection }) {
  if (section.entries.length === 0) return null;

  return (
    <Band>
      <SectionHead
        eyebrow="Index"
        title={section.heading ?? "Entries"}
        more={section.readMore}
      />
      <ol className="gl-rows">
        {section.entries.map((entry, index) => (
          <CompactRow
            key={entry.url ?? index}
            index={index}
            url={entry.url}
            title={entry.heading}
            lede={
              entry.lede && (
                <Html as="p" className="gl-row__lede" html={entry.lede} />
              )
            }
          />
        ))}
      </ol>
    </Band>
  );
}

/** Ledes are HTML that may carry links, which can't sit inside a card's */
const textOf = (html: string) => html.replace(/<[^>]+>/g, "");

export function WorkCards({
  work,
  cols = 2
}: {
  work: LabContent["work"];
  cols?: 2 | 3;
}) {
  return (
    <Cells cols={cols}>
      {work.map((item) => (
        <li key={item.url} className="gl-cell gl-work">
          <a href={item.url}>
            <span className="gl-work__media">
              <img src={item.cover} alt="" loading="lazy" />
            </span>
            <span className="gl-work__body">
              <span className="gl-meta">
                {[item.industry, item.year].filter(Boolean).join(" · ")}
              </span>
              <h3>
                {item.name}
                <span className="gl-work__arrow" aria-hidden="true">
                  →
                </span>
              </h3>
              {item.lede && <p>{textOf(item.lede)}</p>}
            </span>
          </a>
        </li>
      ))}
    </Cells>
  );
}

export function ServiceCells({
  services
}: {
  services: LabContent["services"];
}) {
  // The tiles' drawings only move on hover, so they're drawn in the browser
  // once the page has mounted (into a space the page keeps for them),
  // rather than in every page's HTML
  const mounted = useMounted();

  return (
    <Cells cols={3}>
      {services.map((service, index) => (
        <li key={service.url} className="gl-cell gl-service">
          <a href={service.url}>
            <span className="gl-service__index">{pad(index + 1)}</span>
            <span className="gl-service__art">
              {mounted && <ServiceArt url={service.url} playback="hover" />}
            </span>
            <h3>{service.title}</h3>
            {service.lede && <p>{service.lede}</p>}
            <span className="gl-service__go">
              Learn more <Arrow />
            </span>
          </a>
        </li>
      ))}
    </Cells>
  );
}

/** Services one to a row: number, title and lede */
export function ServiceRows({
  services
}: {
  services: LabContent["services"];
}) {
  return (
    <ol className="gl-rows">
      {services.map((service, index) => (
        <CompactRow
          key={service.url}
          index={index}
          url={service.url}
          title={service.title}
          lede={service.lede && <p className="gl-row__lede">{service.lede}</p>}
        />
      ))}
    </ol>
  );
}

/** How a project runs, numbered across a row */
export function ProcessSteps({
  steps,
  cols = 4
}: {
  steps: LabContent["profile"]["process"];
  cols?: 2 | 4;
}) {
  return (
    <Cells cols={cols} as="ol">
      {steps.map((step, index) => (
        <li key={step.title} className="gl-cell gl-cell--pad gl-step">
          <span className="gl-step__index">{`Step ${pad(index + 1)}`}</span>
          <h3>{step.title}</h3>
          <p>{step.text}</p>
        </li>
      ))}
    </Cells>
  );
}

/** Every page on the site, by title and URL */
export function PageTable({ pages }: { pages: PageListSection["pages"] }) {
  return (
    <div className="gl-table-wrap">
      <table className="gl-table">
        <thead>
          <tr>
            <th scope="col">Page</th>
            <th scope="col">Path</th>
          </tr>
        </thead>
        <tbody>
          {pages.map((page) => (
            <tr key={page.url}>
              <th scope="row">
                <a href={page.url}>{page.title ?? page.url}</a>
              </th>
              <td>
                <code>{page.url}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* Testimonials
   ========================================================================== */

/** A quote and who said it; long ones open from their shortened form */
export function Quote({
  testimonial,
  large
}: {
  testimonial: TestimonialModel;
  large?: boolean;
}) {
  const { person, truncated } = testimonial;
  const [open, setOpen] = useState(false);

  return (
    <figure className={cx("gl-quote", large && "gl-quote--large")}>
      <Html
        as="blockquote"
        html={truncated && !open ? truncated : testimonial.content}
      />
      {truncated && (
        <button
          className="gl-quote__toggle"
          type="button"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? "Show less" : "Read the rest"}
        </button>
      )}
      {person && (
        <figcaption>
          {person.image && <img src={person.image} alt="" loading="lazy" />}
          <span>
            <span className="gl-quote__name">{person.name}</span>
            {person.position && (
              <span className="gl-quote__role">{person.position}</span>
            )}
          </span>
        </figcaption>
      )}
    </figure>
  );
}

export function QuoteCells({
  testimonials
}: {
  testimonials: TestimonialModel[];
}) {
  // Two across for an even count, so no row is left with a gap
  const cols = testimonials.length % 2 === 0 ? 2 : 3;

  return (
    <Cells cols={cols}>
      {testimonials.map((testimonial) => (
        <li key={testimonial.id} className="gl-cell gl-cell--pad">
          <Quote testimonial={testimonial} />
        </li>
      ))}
    </Cells>
  );
}

export function KindWords({
  testimonials,
  index,
  invert
}: {
  testimonials: TestimonialModel[];
  index?: number;
  invert?: boolean;
}) {
  const to = useTo();
  if (testimonials.length === 0) return null;

  return (
    <Band invert={invert}>
      <SectionHead
        index={index}
        eyebrow="Kind words"
        title="From clients and colleagues"
        more={{ text: "All testimonials", url: to("/testimonials/") }}
      />
      <QuoteCells testimonials={testimonials} />
    </Band>
  );
}

/* Light rays and windows
   ========================================================================== */

/** The violet light-ray panel; `tint` recolors its rays */
export function Rays({
  tint,
  className,
  children
}: {
  tint?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cx("gl-rays", className)}
      style={tint ? ({ "--gl-ray": tint } as CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}

/** A dark pane with a title bar, over the rays */
export function Window({
  title,
  address,
  status,
  children
}: {
  title?: ReactNode;
  /** A browser's address bar, in place of a title */
  address?: ReactNode;
  status?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="gl-window">
      <div className="gl-window__bar">
        <span className="gl-window__dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        {address ? (
          <span className="gl-window__address">{address}</span>
        ) : (
          title && <span>{title}</span>
        )}
        {status && <span className="gl-window__status">{status}</span>}
      </div>
      {children}
    </div>
  );
}

type TerminalTab = {
  id: string;
  label: string;
  command: string;
  lines: { key: string; term: ReactNode; detail: ReactNode; url?: string }[];
};

/**
 * The home page's terminal: the profile and the latest of each section as
 * commands and their output, one tab each
 */
export function Terminal({ content }: { content: LabContent }) {
  const { profile, posts, services } = content;
  const handle = profile.name.split(" ")[0].toLowerCase();
  const id = useId();
  const tabList = useRef<HTMLDivElement>(null);

  const facts = relabel(profile.facts, {
    role: "role",
    location: "based in",
    experience: "experience",
    previously: "previously",
    shows: "shows/year",
    offDuty: "off the clock"
  });

  const tabs: TerminalTab[] = [
    {
      id: "whois",
      label: "whois",
      command: `whois ${handle}`,
      lines: [
        { key: "name", term: "name", detail: profile.name },
        ...facts.map((fact) => ({
          key: fact.id,
          term: fact.label.toLowerCase(),
          url: fact.url,
          detail:
            fact.id === "location" ? (
              <>
                {fact.text} · <LocalTime />
              </>
            ) : (
              fact.text
            )
        }))
      ]
    },
    {
      id: "writing",
      label: "writing",
      command: "ls writing --latest",
      lines: posts.slice(0, 7).map((post) => ({
        key: post.url,
        term: post.iso,
        detail: post.title,
        url: post.url
      }))
    },
    {
      id: "work",
      label: "work",
      command: "ls work",
      lines: homeWork(content).map((item) => ({
        key: item.url,
        term: yearsOf(item.year)?.[0] ?? "",
        detail: item.name,
        url: item.url
      }))
    },
    {
      id: "services",
      label: "services",
      command: "ls services",
      lines: services.map((service, index) => ({
        key: service.url,
        term: pad(index + 1),
        detail: service.title,
        url: service.url
      }))
    }
  ];

  const [active, setActive] = useState(tabs[0].id);
  const tab = tabs.find((item) => item.id === active) ?? tabs[0];

  // Arrow keys move between tabs, as a tab list should
  const onKeyDown = (event: KeyboardEvent) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const index = tabs.findIndex((item) => item.id === active);
    const next = tabs[(index + step + tabs.length) % tabs.length];
    setActive(next.id);
    tabList.current
      ?.querySelector<HTMLButtonElement>(`[data-tab="${next.id}"]`)
      ?.focus();
  };

  return (
    <Window
      title={`${handle}@${profile.location.city.toLowerCase()} — zsh`}
      status={profile.location.short}
    >
      <div
        className="gl-terminal__body"
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-${tab.id}`}
      >
        <div>
          <p className="gl-terminal__prompt">
            <span>~ $</span> {tab.command}
          </p>
          <ul className="gl-terminal__lines">
            {tab.lines.map((line) => (
              <li key={line.key}>
                <span>{line.term}</span>
                <span>
                  {line.url ? (
                    <a href={line.url}>{line.detail}</a>
                  ) : (
                    line.detail
                  )}
                </span>
              </li>
            ))}
          </ul>
          <span className="gl-terminal__cursor" aria-hidden="true" />
        </div>
        {tab.id === "whois" && (
          <img
            className="gl-terminal__portrait"
            src={profile.avatar}
            alt={profile.name}
          />
        )}
      </div>
      <div
        ref={tabList}
        className="gl-terminal__tabs"
        role="tablist"
        aria-label="Commands"
        onKeyDown={onKeyDown}
      >
        {tabs.map((item) => (
          <button
            key={item.id}
            id={`${id}-${item.id}`}
            data-tab={item.id}
            type="button"
            role="tab"
            aria-selected={item.id === active}
            aria-controls={`${id}-panel`}
            tabIndex={item.id === active ? 0 : -1}
            onClick={() => setActive(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </Window>
  );
}

/* Wayfinding
   ========================================================================== */

/** A post's or case study's comments, as a band of their own */
export const Discussion = ({ url }: { url: string }) => (
  <Band label="Comments">
    <SectionHead eyebrow="Comments" title="Join the conversation" />
    <div className="gl-pad">
      <Comments url={url} className="gl-comments" />
    </div>
  </Band>
);

export function PostNav({ nav }: { nav: PostNavModel | null }) {
  if (!nav || (!nav.previous && !nav.next)) return null;

  return (
    <nav className="gl-band gl-post-nav" aria-label="More writing">
      <Cells cols={2} as="div">
        {nav.previous ? (
          <div className="gl-cell">
            <a href={nav.previous.url} rel="prev">
              <span className="gl-label">← Previous</span>
              <strong>{nav.previous.text}</strong>
            </a>
          </div>
        ) : (
          <div className="gl-cell" />
        )}
        {nav.next && (
          <div className="gl-cell gl-post-nav__next">
            <a href={nav.next.url} rel="next">
              <span className="gl-label">Next →</span>
              <strong>{nav.next.text}</strong>
            </a>
          </div>
        )}
      </Cells>
    </nav>
  );
}

/* Forms
   ========================================================================== */

/** One question, as a cell of the form's grid */
export function FormField({ field }: { field: Field }) {
  const className = cx("gl-cell gl-field", field.wide && "gl-field--wide");

  if (field.kind === "choices") {
    return (
      <fieldset className={className}>
        <legend>{field.label}</legend>
        <div className="gl-options">
          {field.options.map((option) => (
            <label key={option} className="gl-option">
              <input type={field.type} name={field.name} value={option} />
              {option}
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  return (
    <label className={className}>
      <span className="gl-field__label">{field.label}</span>
      {field.kind === "textarea" ? (
        <textarea
          name={field.name}
          rows={field.rows}
          placeholder={field.placeholder}
          required={field.required}
        />
      ) : (
        <input
          type={field.type}
          name={field.name}
          placeholder={field.placeholder}
          required={field.required}
        />
      )}
    </label>
  );
}

/** The contact or project inquiry form, as a grid of cells */
export function Form({ kind }: { kind: "contact" | "inquiry" }) {
  const { fields, submit } = formOf(kind);
  const { props, hidden, status } = useSubmission(kind);

  return (
    <form className="gl-form" {...props}>
      {hidden}
      <Cells cols={2} as="div">
        {fields.map((field) => (
          <FormField key={field.name} field={field} />
        ))}
        <div className="gl-cell gl-field--wide gl-form__submit">
          {status && (
            <span className="gl-meta" role="status">
              {status}
            </span>
          )}
          <Button type="submit">
            {submit} <Arrow />
          </Button>
        </div>
      </Cells>
    </form>
  );
}

/** The newsletter sign-up: one field and its button */
export function Newsletter({ invert }: { invert?: boolean }) {
  const { field, submit } = newsletterForm;
  const { props, hidden, status } = useSubmission("newsletter");

  return (
    <Band invert={invert}>
      <div className="gl-pad gl-signup">
        <div>
          <Eyebrow>Newsletter</Eyebrow>
          <h2 className="gl-heading">New writing, by email</h2>
          <p>Articles and tutorials, sent when they’re published.</p>
        </div>
        <form className="gl-signup__form" {...props}>
          {hidden}
          <label>
            <span className="gl-sr">{field.label}</span>
            <input
              type={field.type}
              name={field.name}
              placeholder={field.placeholder}
              required
            />
          </label>
          <Button type="submit">{submit}</Button>
          {status && (
            <span className="gl-meta" role="status">
              {status}
            </span>
          )}
        </form>
      </div>
    </Band>
  );
}

/* Chrome
   ========================================================================== */

/* Marks: explorations for a logo, each drawn on a 24px grid in ink with
   one violet part. The Shell wears none; the style guide shows them all. */

const ink = { fill: "none", stroke: "currentColor", strokeWidth: 1.5 } as const;

/** The K of the pixel mark, by column and row on a 5×5 grid */
const PIXEL_K = [
  [0, 0],
  [0, 1],
  [0, 2],
  [0, 3],
  [0, 4],
  [2, 1],
  [2, 3],
  [3, 0],
  [3, 4]
];

export const MARKS = {
  stack: {
    name: "Stack",
    note: "Three plates, the top one lit: full-stack",
    draw: (
      <>
        <path className="gl-mark__fill" d="M12 2.5 21 7l-9 4.5L3 7z" />
        <path {...ink} strokeLinejoin="round" d="M12 2.5 21 7l-9 4.5L3 7z" />
        <path
          {...ink}
          strokeLinejoin="round"
          d="m3 11.5 9 4.5 9-4.5M3 16l9 4.5 9-4.5"
        />
      </>
    )
  },
  tile: {
    name: "Tile",
    note: "One cell of the grid, lifted",
    draw: (
      <>
        <path className="gl-mark__fill" d="M12 3.5 21 8l-9 4.5L3 8z" />
        <path fill="currentColor" d="M3 8l9 4.5V20l-9-4.5z" />
        <path fill="currentColor" opacity="0.55" d="M21 8l-9 4.5V20l9-4.5z" />
      </>
    )
  },
  pixel: {
    name: "Pixel K",
    note: "The initial, set in cells; the joint lit",
    draw: (
      <>
        {PIXEL_K.map(([column, row]) => (
          <rect
            key={`${column}${row}`}
            x={4.375 + column * 4}
            y={2.5 + row * 4}
            width="3.25"
            height="3.25"
            fill="currentColor"
          />
        ))}
        <rect
          className="gl-mark__fill"
          x="8.375"
          y="10.5"
          width="3.25"
          height="3.25"
        />
      </>
    )
  },
  selection: {
    name: "Selection",
    note: "A cell picked out, as in a design tool",
    draw: (
      <>
        <path
          {...ink}
          d="M2.75 8V2.75H8M16 2.75h5.25V8M21.25 16v5.25H16M8 21.25H2.75V16"
        />
        <rect className="gl-mark__fill" x="8" y="8" width="8" height="8" />
      </>
    )
  },
  crosshair: {
    name: "Crosshair",
    note: "The cross where a band meets the rails",
    draw: (
      <>
        <circle {...ink} cx="12" cy="12" r="6.25" />
        <path {...ink} d="M12 1v6.5M12 16.5V23M1 12h6.5M16.5 12H23" />
        <circle className="gl-mark__fill" cx="12" cy="12" r="2.25" />
      </>
    )
  },
  peak: {
    name: "Peak",
    note: (city: string) => `The Front Range from ${city}, at sunrise`,
    draw: (
      <>
        <circle className="gl-mark__fill" cx="17.5" cy="6" r="2.75" />
        <path
          {...ink}
          strokeLinejoin="round"
          d="M1.5 20h21M2.5 20l6-9 3.5 4.5L15 11l6.5 9"
        />
      </>
    )
  },
  initial: {
    name: "Initial",
    note: "A K in its cell, the corner lit",
    draw: (
      <>
        <rect
          className="gl-mark__fill"
          x="15.5"
          y="2"
          width="6.5"
          height="6.5"
        />
        <path {...ink} d="M2.75 2.75h18.5v18.5H2.75z" />
        <path {...ink} d="M8 6.5v11M8 13l6-6.5M10.25 10.6 15 17.5" />
      </>
    )
  }
} satisfies Record<
  string,
  {
    name: string;
    /** Given the owner's city, for a mark drawn from there */
    note: string | ((city: string) => string);
    draw: ReactNode;
  }
>;

export type MarkId = keyof typeof MARKS;

/** One of the mark explorations */
export const Mark = ({ variant }: { variant: MarkId }) => (
  <svg className="gl-mark" viewBox="0 0 24 24" aria-hidden="true">
    {MARKS[variant].draw}
  </svg>
);

/* Calls to action: options for the panel that closes each page.
   `?cta=<id>` previews one in the Shell. */

export const CTAS = {
  blueprint: {
    name: "Blueprint",
    note: "The page’s grid, drawn out, with a violet glow; follows the scheme"
  },
  horizon: {
    name: "Horizon",
    note: "The grid running out to a lit horizon"
  },
  rays: { name: "Rays", note: "Violet light rays, as on the home page" },
  halftone: {
    name: "Halftone",
    note: "A violet dot screen rising from the bottom; follows the scheme"
  },
  cells: {
    name: "Cells",
    note: "No imagery: the heading beside three ways in, as cells"
  }
} satisfies Record<string, { name: string; note: string }>;

export type CtaId = keyof typeof CTAS;

/** The panel the Shell closes with unless `?cta=` asks for another */
export const DEFAULT_CTA: CtaId = "blueprint";

export const isCta = (id: string): id is CtaId => Object.hasOwn(CTAS, id);

/** Clicks and drags on these do their own thing, so they never fill squares */
const NOT_PAINTABLE =
  "a, button, input, textarea, select, label, .gl-window, .gl-blueprint__tools";

/** How long a generation of the Game of Life lasts, in milliseconds */
const LIFE_TICK = 140;

/** The share of squares scattering fills */
const SCATTER = 0.18;

/**
 * The Blueprint panel: the closing call to action, and behind the home
 * page's terminal. Under a mouse or pen, its glow and a spotlight on the
 * grid drift after the pointer, and the square beneath it lights up;
 * leaving sends the glow back to the middle. A click fills the square it
 * lands on, and another click clears it; dragging fills every square the
 * pointer crosses.
 *
 * Filling a square brings out its grid tools (`GridTools`): the brush's
 * color, the tile size, an eraser, symmetry about the middle, the Game of
 * Life over the filled squares, scattering squares, and clearing them. They
 * can also grow the panel to fill the screen below the header, without its
 * contents, for a bigger canvas; touch paints there too, as nothing scrolls.
 */
export function Blueprint({
  className,
  tools: startWithTools = false,
  children
}: {
  className?: string;
  /** Starts with the grid tools out, as if a square had been filled */
  tools?: boolean;
  children: ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  // Where a drag last reached, and whether it has left its first square
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  // The click that ends a drag mustn't also toggle a square
  const dragged = useRef(false);
  const [paints, setPaints] = useState<Paint[]>([]);
  // The squares as last drawn, for the Game of Life's clock to read
  const latest = useRef(paints);
  const [{ brush, size: grid, erase, symmetry }] = useGridSettings();
  const [tools, setTools] = useState(startWithTools);
  // Just found: the tools say so for a moment
  const [found, setFound] = useState(false);
  const [running, setRunning] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const reducedMotion = useReducedMotion();
  const playing = running && !reducedMotion;

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  useEffect(() => {
    latest.current = paints;
  });

  useEffect(() => {
    if (!found) return;
    const timer = setTimeout(() => setFound(false), 2800);
    return () => clearTimeout(timer);
  }, [found]);

  // A generation at a time, until nothing is born or dies
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      const box = panel.current?.getBoundingClientRect();
      if (!box) return;
      const bounds = boundsOf(box, grid);
      const next = lifeStep(latest.current, bounds, true);
      if (!next.changed) {
        setRunning(false);
        return;
      }
      // Reused unless a stroke landed since the last render
      setPaints((current) =>
        current === latest.current
          ? next.paints
          : lifeStep(current, bounds, true).paints
      );
    }, LIFE_TICK);
    return () => clearInterval(timer);
  }, [playing, grid]);

  /** The pointer's position in the panel, and the panel's size */
  const locate = (clientX: number, clientY: number) => {
    const box = panel.current!.getBoundingClientRect();
    return { x: clientX - box.left, y: clientY - box.top, box };
  };

  /** The squares the panel shows now */
  const bounds = () => boundsOf(panel.current!.getBoundingClientRect(), grid);

  /**
   * Squares fill with the brush, or clear under the eraser, reflected. The
   * first stroke brings the tools out either way: the settings are shared
   * between panels, so one may start with the eraser on, and the tools are
   * where it's turned off.
   */
  const brushOver = (squares: Square[]) => {
    const reached = squares.flatMap((square) => reflect(square, symmetry));
    if (!tools) {
      setTools(true);
      setFound(true);
    }
    if (erase) {
      setPaints((current) => clear(current, reached, !prefersReducedMotion()));
      return;
    }
    setPaints((current) => fill(current, reached, brush));
  };

  const onClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (dragged.current) {
      dragged.current = false;
      return;
    }
    if ((event.target as Element).closest(NOT_PAINTABLE)) return;
    const { x, y, box } = locate(event.clientX, event.clientY);
    const square = squareAt(x, y, box, grid);
    const found = paints.find((paint) => sameSquare(paint, square));

    // Clicked again in the same color: it clears (fading out, or simply
    // going when motion is reduced); in another color, it takes this one
    if (!erase && found && !found.leaving && found.brush === brush) {
      setPaints((current) =>
        clear(current, reflect(square, symmetry), !prefersReducedMotion())
      );
    } else brushOver([square]);
  };

  // A square that has faded out is gone
  const onPaintEnd = (square: Square) =>
    setPaints((current) =>
      current.filter((paint) => !(paint.leaving && sameSquare(paint, square)))
    );

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    // Touch scrolls the page instead, unless the grid fills the screen; taps
    // still fill squares as clicks
    if ((event.pointerType === "touch" && !expanded) || event.button !== 0)
      return;
    if ((event.target as Element).closest(NOT_PAINTABLE)) return;
    const { x, y } = locate(event.clientX, event.clientY);
    drag.current = { x, y, moved: false };
    dragged.current = false;
    // Keeps the drag when it strays past the panel's edge, and stops it
    // selecting text on the way
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  };

  const onPointerUp = () => {
    if (!drag.current) return;
    dragged.current = drag.current.moved;
    drag.current = null;
  };

  /** Brushes every square between where the drag was and where it is now */
  const paintAlong = (clientX: number, clientY: number) => {
    const from = drag.current;
    if (!from) return;
    const { x, y, box } = locate(clientX, clientY);
    // Nothing until the drag leaves the square it started in, which leaves a
    // click there to toggle it
    if (
      !from.moved &&
      sameSquare(squareAt(from.x, from.y, box, grid), squareAt(x, y, box, grid))
    ) {
      return;
    }
    // Sampled a quarter square apart, so a quick drag skips nothing
    const steps = Math.max(
      1,
      Math.ceil(Math.hypot(x - from.x, y - from.y) / (grid / 4))
    );
    const squares = Array.from({ length: steps + 1 }, (_, step) =>
      squareAt(
        from.x + ((x - from.x) * step) / steps,
        from.y + ((y - from.y) * step) / steps,
        box,
        grid
      )
    );
    brushOver(squares);
    drag.current = { x, y, moved: true };
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch" && !expanded) return;
    const { clientX, clientY } = event;
    if (drag.current && event.buttons & 1) paintAlong(clientX, clientY);

    // The glow, spotlight, and lit square, at most once a frame
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const element = panel.current;
      if (!element) return;
      const { x, y, box } = locate(clientX, clientY);
      // The grid is centered, so its lines sit half a square off the middle
      const snap = (at: number, size: number) => {
        const origin = (size / 2 - grid / 2) % grid;
        return origin + Math.floor((at - origin) / grid) * grid;
      };
      const { column, row } = squareAt(x, y, box, grid);

      element.style.setProperty("--gl-pointer-x", `${x}px`);
      element.style.setProperty("--gl-pointer-y", `${y}px`);
      element.style.setProperty("--gl-cell-x", `${snap(x, box.width)}px`);
      element.style.setProperty("--gl-cell-y", `${snap(y, box.height)}px`);
      // Which square, for a brush that colors squares by where they are
      element.style.setProperty("--gl-column", `${column}`);
      element.style.setProperty("--gl-row", `${row}`);
      // Shown a frame after the square first lands, so it fades in where the
      // pointer is rather than gliding over from a corner
      if (!element.hasAttribute("data-pointer")) {
        frame.current = requestAnimationFrame(() =>
          element.setAttribute("data-pointer", "")
        );
      }
    });
  };

  const onPointerLeave = () => {
    cancelAnimationFrame(frame.current);
    const element = panel.current;
    if (!element) return;
    element.style.removeProperty("--gl-pointer-x");
    element.style.removeProperty("--gl-pointer-y");
    element.removeAttribute("data-pointer");
  };

  /** Plays or pauses the Game of Life; with reduced motion, steps it once */
  const onLife = () => {
    if (!reducedMotion) {
      setRunning((on) => !on);
      return;
    }
    const at = bounds();
    setPaints((current) => lifeStep(current, at, false).paints);
  };

  const onScatter = () => brushOver(scatter(bounds(), SCATTER));

  const onClear = () => {
    setRunning(false);
    setPaints((current) =>
      prefersReducedMotion()
        ? []
        : current.map((paint) => ({ ...paint, leaving: true }))
    );
  };

  return (
    <div
      ref={panel}
      className={cx("gl-blueprint", className)}
      style={{ "--gl-grid": `${grid}px` } as CSSProperties}
      data-brush={brush}
      data-erase={erase || undefined}
      data-life={playing || undefined}
      data-expanded={expanded || undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={onPointerLeave}
      onClick={onClick}
    >
      <span className="gl-blueprint__spot" aria-hidden="true" />
      {symmetry !== "off" && (
        <span
          className="gl-blueprint__axes"
          data-symmetry={symmetry}
          aria-hidden="true"
        >
          <i />
          <i />
          <i />
          <i />
        </span>
      )}
      <span className="gl-blueprint__cell" aria-hidden="true" />
      {paints.map(({ column, row, brush: color, leaving }) => (
        <span
          key={`${column} ${row}`}
          className="gl-blueprint__paint"
          data-brush={color}
          data-leaving={leaving || undefined}
          style={{ "--gl-column": column, "--gl-row": row } as CSSProperties}
          onAnimationEnd={() => leaving && onPaintEnd({ column, row })}
          aria-hidden="true"
        />
      ))}
      {children}
      {tools && (
        <GridTools
          playing={playing}
          onLife={onLife}
          onScatter={onScatter}
          onClear={onClear}
          empty={paints.every((paint) => paint.leaving)}
          found={found}
          expanded={expanded}
          onExpand={setExpanded}
        />
      )}
    </div>
  );
}

const CTA_COPY = {
  eyebrow: "Work together",
  title: "Have a project in mind?",
  lede: "Tell me what you’re building, and let’s find out how I can help."
};

/** The closing call to action */
export function Cta({
  email,
  variant = DEFAULT_CTA
}: {
  email: string;
  variant?: CtaId;
}) {
  const to = useTo();
  const heading = (
    <>
      <Eyebrow>{CTA_COPY.eyebrow}</Eyebrow>
      <h2>{CTA_COPY.title}</h2>
      <p>{CTA_COPY.lede}</p>
    </>
  );

  if (variant === "cells") {
    const ways = [
      {
        label: "Project inquiry",
        text: "Start a project",
        url: to("/project-inquiry/")
      },
      { label: "Contact", text: "Say hello", url: to("/contact/") },
      { label: "Email", text: email, url: `mailto:${email}` }
    ];

    return (
      <Band className="gl-cta gl-cta--cells" invert label={CTA_COPY.eyebrow}>
        <div className="gl-cta-cells">
          <div className="gl-cta-cells__main">{heading}</div>
          <ul className="gl-cta-cells__ways">
            {ways.map((way) => (
              <li key={way.url}>
                <a href={way.url}>
                  <span className="gl-label">{way.label}</span>
                  <strong>{way.text}</strong>
                  <span className="gl-cta-cells__arrow" aria-hidden="true">
                    →
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Band>
    );
  }

  const panel = (
    <>
      {heading}
      <div className="gl-actions">
        <Button href={to("/project-inquiry/")}>
          Start a project <Arrow />
        </Button>
        <Button variant="ghost" href={`mailto:${email}`}>
          {email}
        </Button>
      </div>
    </>
  );

  return (
    <Band className={`gl-cta gl-cta--${variant}`} label={CTA_COPY.eyebrow}>
      {variant === "rays" ? (
        <Rays className="gl-cta__panel">{panel}</Rays>
      ) : variant === "blueprint" ? (
        <Blueprint className="gl-cta__panel">{panel}</Blueprint>
      ) : (
        <div className={`gl-cta__panel gl-${variant}`}>{panel}</div>
      )}
    </Band>
  );
}
