import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from "react";

import type {
  IntroSection,
  LabContent,
  LinkModel,
  PostNavModel,
  SectionModel,
  TestimonialModel
} from "../../../lib/types";

//
// Links and content helpers
// -------------------------

/** Lab URL prefix (e.g. `/lab/mech`) so hard-coded links stay in the lab */
export const BaseContext = createContext("");

export function useTo() {
  const base = useContext(BaseContext);
  return (path: string) => `${base}${path}`;
}

export const introOf = (page: { sections: SectionModel[] }) =>
  page.sections.find(
    (section): section is IntroSection => section.type === "intro"
  );

export const sectionOf = <T extends SectionModel["type"]>(
  page: { sections: SectionModel[] },
  type: T
) =>
  page.sections.find(
    (section): section is Extract<SectionModel, { type: T }> =>
      section.type === type
  );

/** Compares site paths, ignoring a trailing slash */
export const samePath = (a: string, b: string) =>
  a.replace(/\/$/, "") === b.replace(/\/$/, "");

export const pad = (value: number, length = 2) =>
  String(value).padStart(length, "0");

/** Designation for a case study, e.g. `UNIT-01` (the featured project) */
export const unitCode = (index: number) =>
  index < 0 ? "UNIT-XX" : `UNIT-${pad(index + 1)}`;

/** Designation for an article, numbered oldest first, e.g. `REC-041` */
export const recordCode = (posts: LabContent["posts"], url: string) => {
  const index = posts.findIndex((post) => samePath(post.url, url));
  return index < 0 ? "REC-XXX" : `REC-${pad(posts.length - index, 3)}`;
};

/** Ticking clock in Denver, blank until hydrated so SSR markup matches */
export function useDenverTime(seconds = true) {
  const [time, setTime] = useState<string>();

  useEffect(() => {
    const format = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: seconds ? "2-digit" : undefined,
      timeZone: "America/Denver"
    });
    const tick = () => setTime(format.format(new Date()));
    tick();
    const timer = setInterval(tick, seconds ? 1000 : 15_000);
    return () => clearInterval(timer);
  }, [seconds]);

  return time;
}

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

export const Html = ({
  as: Tag = "div",
  className,
  html
}: {
  as?: "div" | "p" | "span" | "h1" | "h2" | "blockquote";
  className?: string;
  html: string;
}) => <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />;

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

/** Solid chamfered button */
export const Button = ({
  href,
  tone,
  children
}: {
  href: string;
  tone?: "ghost" | "alert";
  children: ReactNode;
}) => (
  <a className={`mc-btn${tone ? ` mc-btn--${tone}` : ""}`} href={href}>
    <span>{children}</span>
    <Tri />
  </a>
);

/** Points of a noisy line in a 100×20 box, the same for the same seed */
function tracePoints(seed: number) {
  let state = seed * 7919 + 13;
  const points: string[] = [];
  for (let i = 0; i < 64; i++) {
    state = (state * 9301 + 49297) % 233280;
    const swell = 0.25 + 0.6 * Math.abs(Math.sin(i / 7 + seed));
    const y = 10 + (state / 233280 - 0.5) * 16 * swell;
    points.push(`${(i * (100 / 63)).toFixed(2)},${y.toFixed(2)}`);
  }
  return points.join(" ");
}

/** Deterministic noisy line, like a CPU trace, seeded per item */
export function Waveform({
  seed,
  className
}: {
  seed: number;
  className?: string;
}) {
  const line = tracePoints(seed);

  return (
    <svg
      className={["mc-wave", className].filter(Boolean).join(" ")}
      viewBox="0 0 100 20"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polygon points={`0,20 ${line} 100,20`} className="mc-wave__fill" />
      <polyline points={line} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** Title block that opens every inner page, set like an episode title card */
export function PageHeader({
  episode,
  eyebrow,
  jp,
  title,
  lede,
  aside,
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
          <Html as="h1" className="mc-titlecard__title" html={title} />
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
  eager
}: {
  src?: string;
  alt?: string;
  href?: string;
  label?: ReactNode;
  className?: string;
  eager?: boolean;
}) => {
  const Tag = href ? "a" : "div";
  return (
    <Tag
      className={["mc-feed", className].filter(Boolean).join(" ")}
      href={href}
      tabIndex={href ? -1 : undefined}
    >
      {src ? (
        <img src={src} alt={alt} loading={eager ? undefined : "lazy"} />
      ) : (
        <span className="mc-feed__none" aria-hidden="true">
          <span>No visual feed</span>
        </span>
      )}
      {label && <span className="mc-feed__label">{label}</span>}
    </Tag>
  );
};

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
        <span className="mc-dot" aria-hidden="true" />
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

/** Services as a cluster of hexagons, after the MAGI supercomputers */
export function Magi({ services }: { services: LabContent["services"] }) {
  return (
    <ol className="mc-magi">
      {services.map((service, index) => (
        <li key={service.url} className="mc-magi__cell">
          <a className="mc-hex" href={service.url}>
            <span className="mc-hex__mode">Sys-{pad(index + 1)}</span>
            <span className="mc-hex__title">{service.title}</span>
            <span className="mc-hex__number" aria-hidden="true">
              {index + 1}
            </span>
          </a>
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
        <a
          className="mc-btn mc-btn--invert"
          href={href ?? to("/project-inquiry/")}
        >
          <span>{cta}</span>
          <Tri />
        </a>
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
          <button className="mc-btn" type="submit">
            <span>Subscribe</span>
            <Tri />
          </button>
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
