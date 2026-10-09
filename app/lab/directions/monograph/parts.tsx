import type { ReactNode } from "react";

import type {
  LabContent,
  LinkModel,
  PostNavModel,
  TestimonialModel
} from "../../../lib/types";
import { Html, useTo } from "../../site";

//
// Icons
// -----

export const ArrowCircle = ({ back }: { back?: boolean }) => (
  <svg
    className="mg-arrow"
    viewBox="0 0 16 16"
    aria-hidden="true"
    style={back ? { transform: "rotate(180deg)" } : undefined}
  >
    <circle cx="8" cy="8" r="8" fill="currentColor" />
    <path
      d="M5.75 10.25 10.25 5.75M6.5 5.75h3.75V9.5"
      fill="none"
      stroke="var(--mg-paper)"
      strokeWidth="1.5"
    />
  </svg>
);

const icons = {
  pin: (
    <path d="M8 14.5s4.5-4.2 4.5-7.7a4.5 4.5 0 0 0-9 0c0 3.5 4.5 7.7 4.5 7.7Zm0-5.9a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Z" />
  ),
  pen: (
    <path d="m2.5 13.5 1-4L10 3l3 3-6.5 6.5-4 1Zm7-9.5 2.5 2.5M2.5 13.5l3-3" />
  ),
  grid: (
    <path d="M2.5 2.5h4.5V7H2.5zM9 2.5h4.5V7H9zM2.5 9h4.5v4.5H2.5zM9 9h4.5v4.5H9z" />
  ),
  list: <path d="M5.5 4h8M5.5 8h8M5.5 12h8M2.5 4h.5M2.5 8h.5M2.5 12h.5" />,
  quote: (
    <path d="M3 12.5V9c0-2.5 1.2-4.3 3.5-5M9.5 12.5V9c0-2.5 1.2-4.3 3.5-5M3 9h3.5v3.5H3zM9.5 9H13v3.5H9.5z" />
  ),
  user: (
    <path d="M8 8a2.75 2.75 0 1 0 0-5.5A2.75 2.75 0 0 0 8 8Zm-5 5.5c.5-2.6 2.5-4 5-4s4.5 1.4 5 4" />
  ),
  mail: <path d="M2 4h12v8H2zM2 4.5l6 4.5 6-4.5" />,
  file: <path d="M4 1.5h5.5L12.5 4.5v10H4zM9.5 1.5v3h3M6 8h4.5M6 10.5h4.5" />,
  camera: (
    <path d="M2 5h2.5l1.25-2h4.5L11.5 5H14v8H2zM8 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
  ),
  spark: <path d="M8 1.5v13M1.5 8h13M3.5 3.5l9 9M12.5 3.5l-9 9" />
};

export type IconName = keyof typeof icons;

export const Icon = ({ name }: { name: IconName }) => (
  <svg
    className="mg-icon"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.25"
    aria-hidden="true"
  >
    {icons[name]}
  </svg>
);

//
// Building blocks
// ---------------

export const SectionLabel = ({
  icon,
  children
}: {
  icon: IconName;
  children: ReactNode;
}) => (
  <h2 className="mg-label">
    <Icon name={icon} />
    {children}
  </h2>
);

export const MoreLink = ({
  href,
  back,
  children
}: {
  href: string;
  back?: boolean;
  children: ReactNode;
}) => (
  <a className="mg-more" href={href}>
    <ArrowCircle back={back} />
    <span>{children}</span>
  </a>
);

export function Section({
  icon,
  label,
  children,
  className
}: {
  icon: IconName;
  label: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={["mg-section", className].filter(Boolean).join(" ")}>
      <SectionLabel icon={icon}>{label}</SectionLabel>
      {children}
    </section>
  );
}

/** Title block that opens every inner page */
export function PageHeader({
  icon,
  eyebrow,
  title,
  lede,
  children
}: {
  icon: IconName;
  eyebrow: ReactNode;
  /** HTML */
  title: string;
  /** HTML */
  lede?: string;
  children?: ReactNode;
}) {
  return (
    <header className="mg-pageHeader">
      <p className="mg-label mg-pageHeader__eyebrow">
        <Icon name={icon} />
        {eyebrow}
      </p>
      <Html as="h1" className="mg-pageHeader__title" html={title} />
      {lede && <Html as="p" className="mg-pageHeader__lede" html={lede} />}
      {children}
    </header>
  );
}

//
// Work
// ----

type Work = LabContent["work"][number];

export function WorkCard({ item, wide }: { item: Work; wide?: boolean }) {
  return (
    <article className="mg-card">
      <a className="mg-figure" href={item.url} tabIndex={-1}>
        <img src={wide ? item.cover : item.coverSquare} alt="" loading="lazy" />
      </a>
      <h3 className="mg-card__title">
        <a href={item.url}>{item.name}</a>
      </h3>
      <p className="mg-meta">
        {[item.year, item.role].filter(Boolean).join(" · ")}
      </p>
      {item.lede && <Html as="p" className="mg-copy" html={item.lede} />}
      {wide && item.technologies.length > 0 && (
        <ul className="mg-bullets mg-bullets--columns">
          {item.technologies.slice(0, 8).map((technology) => (
            <li key={technology}>{technology}</li>
          ))}
        </ul>
      )}
      <MoreLink href={item.url}>View case study</MoreLink>
    </article>
  );
}

/** One large feature followed by rows of three that alternate the wide card */
export function WorkGrid({ work }: { work: Work[] }) {
  const [featured, ...rest] = work;
  if (!featured) return null;

  const rows: Work[][] = [];
  for (let i = 0; i < rest.length; i += 3) rows.push(rest.slice(i, i + 3));

  return (
    <>
      <div className="mg-feature">
        <div className="mg-feature__text">
          <h3 className="mg-card__title mg-card__title--large">
            <a href={featured.url}>{featured.name}</a>
          </h3>
          {featured.lede && (
            <Html as="p" className="mg-copy" html={featured.lede} />
          )}
          <ul className="mg-bullets">
            {featured.role && <li>Role: {featured.role}</li>}
            {featured.year && <li>Years: {featured.year}</li>}
            {featured.industry && <li>{featured.industry}</li>}
            {featured.services.map((service) => (
              <li key={service}>{service}</li>
            ))}
          </ul>
          <MoreLink
            href={featured.url}
          >{`${featured.name} case study`}</MoreLink>
        </div>
        <a
          className="mg-figure mg-feature__figure"
          href={featured.url}
          tabIndex={-1}
        >
          <img src={featured.cover} alt="" />
        </a>
      </div>

      {rows.map((row, index) => (
        <div
          key={row[0].url}
          className={`mg-row mg-row--${index % 2 ? "center" : "lead"}`}
        >
          {row.map((item, column) => (
            <WorkCard
              key={item.url}
              item={item}
              wide={row.length === 3 && column === (index % 2 ? 1 : 0)}
            />
          ))}
        </div>
      ))}
    </>
  );
}

//
// Services
// --------

export function ServicesLedger({
  services
}: {
  services: LabContent["services"];
}) {
  return (
    <ol className="mg-ledger">
      {services.map((service, index) => (
        <li key={service.url}>
          <a href={service.url}>
            <span className="mg-ledger__number">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="mg-ledger__title">{service.title}</span>
            <span className="mg-ledger__lede">{service.lede}</span>
            <ArrowCircle />
          </a>
        </li>
      ))}
    </ol>
  );
}

//
// Testimonials
// ------------

export function Quote({ testimonial }: { testimonial: TestimonialModel }) {
  return (
    <figure className="mg-card mg-quote">
      <Html
        as="blockquote"
        className="mg-quote__text"
        html={testimonial.content}
      />
      {testimonial.person && (
        <figcaption className="mg-quote__person">
          {testimonial.person.image && (
            <img src={testimonial.person.image} alt="" loading="lazy" />
          )}
          <span>
            {testimonial.person.name}
            {testimonial.person.position && (
              <span className="mg-meta">{testimonial.person.position}</span>
            )}
          </span>
        </figcaption>
      )}
    </figure>
  );
}

export function KindWords({
  testimonials
}: {
  testimonials: TestimonialModel[];
}) {
  const to = useTo();
  return (
    <Section icon="quote" label="Kind words">
      <div className="mg-row mg-row--thirds">
        {testimonials.slice(0, 3).map((testimonial) => (
          <Quote key={testimonial.id} testimonial={testimonial} />
        ))}
      </div>
      <MoreLink href={to("/testimonials/")}>All testimonials</MoreLink>
    </Section>
  );
}

//
// Calls to action
// ---------------

// Scattered across the call-to-action banner
const GLYPHS =
  "{ } </> ; # * => ( ) [ ] && :: // ~ % $ ?? || @ !== ++ ...".split(" ");

export function Banner({
  heading = "Have a project in mind?",
  cta = "Start a project inquiry",
  href
}: {
  heading?: string;
  cta?: string;
  href?: string;
}) {
  const to = useTo();
  return (
    <section className="mg-banner" aria-label={heading}>
      <div className="mg-banner__glyphs" aria-hidden="true">
        {Array.from({ length: 60 }, (_, index) => (
          <span key={index}>{GLYPHS[(index * 7 + 3) % GLYPHS.length]}</span>
        ))}
      </div>
      <div className="mg-banner__content">
        <p className="mg-banner__heading">{heading}</p>
        <a className="mg-pill" href={href ?? to("/project-inquiry/")}>
          {cta}
        </a>
      </div>
    </section>
  );
}

/** Mock newsletter sign-up; the lab never submits anything */
export function Newsletter() {
  return (
    <section className="mg-newsletter">
      <div>
        <p className="mg-newsletter__heading">Letters, occasionally</p>
        <p className="mg-copy">
          New essays and tutorials, sent to your inbox when they’re published.
          No spam, unsubscribe anytime.
        </p>
      </div>
      <form className="mg-inline-form" onSubmit={(e) => e.preventDefault()}>
        <label className="mg-visually-hidden" htmlFor="mg-newsletter-email">
          Email address
        </label>
        <input
          id="mg-newsletter-email"
          className="mg-input"
          type="email"
          placeholder="you@example.com"
        />
        <button className="mg-pill" type="submit">
          Subscribe
        </button>
      </form>
    </section>
  );
}

//
// Previous / next
// ---------------

export function PostNav({ nav }: { nav: PostNavModel | null }) {
  if (!nav || (!nav.previous && !nav.next)) return null;

  const item = (link: LinkModel | undefined, label: string, back?: boolean) =>
    link ? (
      <a className="mg-postNav__item" href={link.url}>
        <span className="mg-label">
          <ArrowCircle back={back} />
          {label}
        </span>
        <span className="mg-postNav__title">{link.text}</span>
      </a>
    ) : (
      <span />
    );

  return (
    <nav className="mg-postNav" aria-label="More">
      {item(nav.previous, "Previous", true)}
      {item(nav.next, "Next")}
    </nav>
  );
}
