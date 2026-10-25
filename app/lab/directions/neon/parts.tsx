import type { ReactNode } from "react";

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
  Html,
  newsletterForm,
  useSubmission,
  type FormField as Field
} from "../../site";

import { Emblem, emblemAt, type EmblemKind } from "./emblems";
import { Skyline, type Tone } from "./scene";

type Posts = LabContent["posts"];

/* Signage
   ========================================================================== */

/** The colors a sign can be lit in, in the order neighbors take them */
export const TONES: Tone[] = ["pink", "cyan", "amber", "violet", "lime"];

export const toneAt = (index: number) => TONES[index % TONES.length];

const hash = (text: string) => {
  let value = 0;
  for (const char of text) value = (value * 31 + char.charCodeAt(0)) | 0;
  return Math.abs(value);
};

/** A tone for some text, so the same label is always lit the same way */
export const toneFor = (text: string) => TONES[hash(text) % TONES.length];

/** A seed for a page's skyline, so each page has its own */
export const seedFor = (text: string) => (hash(text) % 997) + 2;

/**
 * Shop-sign Japanese for the site's places and sections: flavor beside the
 * English names, never instead of them, and hidden from assistive tech
 */
export const KANA = {
  home: "ホーム",
  work: "作品",
  writing: "文章",
  about: "自己紹介",
  services: "サービス",
  contact: "連絡",
  inquiry: "ご依頼",
  testimonials: "お客様の声",
  caseStudy: "事例",
  post: "記事",
  process: "流れ",
  photos: "写真",
  glance: "概要",
  newsletter: "ニュースレター",
  comments: "コメント",
  gallery: "ギャラリー",
  other: "その他",
  index: "一覧",
  tags: "タグ",
  types: "種類",
  pages: "案内",
  lost: "迷子",
  open: "営業中",
  weather: "天気",
  client: "依頼主",
  challenge: "課題",
  solution: "解決",
  /** Counts things: three posts are `3件` */
  count: "件"
} as const;

const NAV_KANA: [path: string, kana: string][] = [
  ["/portfolio/", KANA.work],
  ["/archive/", KANA.writing],
  ["/about/", KANA.about],
  ["/services/", KANA.services],
  ["/contact/", KANA.contact]
];

/** A navigation item's sign, by the path it leads to */
export const kanaOf = (url: string) =>
  NAV_KANA.find(([path]) => url.endsWith(path))?.[1];

/** A floor, counted down from the top: of four sections, the first is 4F */
export const floorOf = (index: number, count: number) =>
  index < count ? `${count - index}F` : `B${index - count + 1}`;

/** `2024-10-20` as an LED date, `2024.10.20` */
export const ledDate = (iso: string) => iso.replaceAll("-", ".");

/** A small lit tag: post types, tags, qualities */
export function Chip({
  tone,
  href,
  children
}: {
  tone: Tone;
  href?: string;
  children: ReactNode;
}) {
  const className = cx("neon-chip", `neon-tone--${tone}`);
  return href ? (
    <a className={className} href={href}>
      {children}
    </a>
  ) : (
    <span className={className}>{children}</span>
  );
}

/* Page structure
   ========================================================================== */

/** Eyebrow, title, and lede at the top of a page; title and lede are HTML */
export function PageHeader({
  eyebrow,
  title,
  lede,
  kana,
  emblem,
  children
}: {
  eyebrow: ReactNode;
  title: string;
  lede?: string;
  /** A sign hung beside the title */
  kana?: string;
  emblem?: EmblemKind;
  children?: ReactNode;
}) {
  return (
    <header className="neon-pageHeader">
      <Skyline seed={seedFor(title)} className="neon-pageHeader__city" />
      <div className="neon-pageHeader__copy">
        <p className="neon-eyebrow">{eyebrow}</p>
        <Html as="h1" className="neon-title" html={title} />
        {lede && <Html as="p" className="neon-lede" html={lede} />}
        {children}
      </div>
      {(kana || emblem) && (
        <div className="neon-pageHeader__sign" aria-hidden="true">
          {emblem && <Emblem kind={emblem} />}
          {kana && <span className="neon-vsign">{kana}</span>}
        </div>
      )}
    </header>
  );
}

/**
 * A section of a page, under a vertical shop sign: its floor, its heading
 * set sideways, and its kana. The sign rides along as the section scrolls.
 */
export function Section({
  title,
  kana,
  floor,
  tone = "pink",
  className,
  children
}: {
  title: ReactNode;
  kana?: string;
  floor?: string;
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cx("neon-section", `neon-tone--${tone}`, className)}>
      <header className="neon-section__sign">
        {floor && (
          <span className="neon-floor" aria-hidden="true">
            {floor}
          </span>
        )}
        <h2 className="neon-section__title">{title}</h2>
        {kana && (
          <span className="neon-section__kana" aria-hidden="true">
            {kana}
          </span>
        )}
      </header>
      <div className="neon-section__body">{children}</div>
    </section>
  );
}

/** Term and detail pairs, as a spec sheet */
export function Facts({ rows }: { rows: [ReactNode, ReactNode][] }) {
  return (
    <dl className="neon-facts">
      {rows.map(([term, detail], index) => (
        <div key={index}>
          <dt>{term}</dt>
          <dd>{detail}</dd>
        </div>
      ))}
    </dl>
  );
}

/** A link onward, after a list: `More writing →` */
export const More = ({
  href,
  children
}: {
  href: string;
  children: ReactNode;
}) => (
  <p className="neon-more">
    <a href={href}>
      {children}
      <span aria-hidden="true"> →</span>
    </a>
  </p>
);

/** A decorative LED ticker, scrolling a list of lines past */
export function Ticker({ items }: { items: string[] }) {
  const run = items.map((item, index) => (
    <span key={index} className="neon-ticker__item">
      {item}
    </span>
  ));
  return (
    <div className="neon-ticker" aria-hidden="true">
      <div className="neon-ticker__track">
        <div className="neon-ticker__run">{run}</div>
        <div className="neon-ticker__run">{run}</div>
      </div>
    </div>
  );
}

/* Lists and cards
   ========================================================================== */

/** Posts as rows of a departure board: LED date, type, title, and lede */
export function PostList({ posts }: { posts: Posts }) {
  return (
    <ol className="neon-posts">
      {posts.map((post) => (
        <li key={post.url} className="neon-post">
          <time className="neon-post__date" dateTime={post.iso}>
            {ledDate(post.iso)}
          </time>
          <div className="neon-post__body">
            <a className="neon-post__title" href={post.url}>
              {post.title}
            </a>
            {post.lede && <p className="neon-post__lede">{post.lede}</p>}
          </div>
          {post.type && (
            <span className="neon-post__type">
              <Chip tone={toneFor(post.type)}>{post.type}</Chip>
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

/** Case studies as lit billboards: the cover on an LED screen, then a plate */
export function WorkGrid({
  work,
  pairs = false
}: {
  work: LabContent["work"];
  /** Two to a row, for a short list like Home's */
  pairs?: boolean;
}) {
  return (
    <ul className={cx("neon-works", pairs && "neon-works--pairs")}>
      {work.map((item, index) => (
        <li
          key={item.url}
          className={cx("neon-work", `neon-tone--${toneAt(index + 1)}`)}
        >
          {/* The screen repeats the name's link for the pointer alone, so
              it's out of the tab order and hidden from screen readers */}
          <a
            className="neon-work__screen"
            href={item.url}
            tabIndex={-1}
            aria-hidden="true"
          >
            <img src={item.cover} alt="" loading="lazy" />
          </a>
          <div className="neon-work__plate">
            <h3 className="neon-work__name">
              <a href={item.url}>{item.name}</a>
            </h3>
            {item.lede && (
              <Html as="p" className="neon-work__lede" html={item.lede} />
            )}
            <p className="neon-meta">
              {[item.industry, item.year].filter(Boolean).join(" · ")}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Services, each under its emblem */
export function ServiceList({
  services,
  offset = 0
}: {
  services: LabContent["services"];
  /** Where in the emblems to start, so a page's lists don't repeat */
  offset?: number;
}) {
  return (
    <ul className="neon-services">
      {services.map((service, index) => (
        <li
          key={service.url}
          className={cx("neon-service", `neon-tone--${toneAt(index + offset)}`)}
        >
          <Emblem
            kind={emblemAt(index + offset)}
            className="neon-service__emblem"
          />
          <h3 className="neon-service__title">
            <a href={service.url}>{service.title}</a>
          </h3>
          {service.lede && <p className="neon-service__lede">{service.lede}</p>}
        </li>
      ))}
    </ul>
  );
}

/** Links listed by an `entries` section (type and tag archives, …) */
export function Entries({
  section,
  floor
}: {
  section: EntriesSection;
  floor?: string;
}) {
  if (section.entries.length === 0) return null;

  return (
    <Section
      title={section.heading ?? "Entries"}
      kana={KANA.index}
      floor={floor}
      tone="cyan"
    >
      <ul className="neon-entries">
        {section.entries.map((entry) => (
          <li key={entry.url}>
            <a href={entry.url}>{entry.heading}</a>
            {entry.lede && <Html as="p" html={entry.lede} />}
          </li>
        ))}
      </ul>
    </Section>
  );
}

/** A testimonial, as a holographic screen */
export function Quote({
  testimonial,
  tone = "cyan"
}: {
  testimonial: TestimonialModel;
  tone?: Tone;
}) {
  const { person } = testimonial;

  return (
    <figure className={cx("neon-quote", `neon-tone--${tone}`)}>
      <Html as="blockquote" html={testimonial.content} />
      {person && (
        <figcaption>
          {person.image && <img src={person.image} alt="" loading="lazy" />}
          <span>
            <span className="neon-quote__name">{person.name}</span>
            {person.position && (
              <span className="neon-meta">{person.position}</span>
            )}
          </span>
        </figcaption>
      )}
    </figure>
  );
}

export function Quotes({ testimonials }: { testimonials: TestimonialModel[] }) {
  return (
    <div className="neon-quotes">
      {testimonials.map((testimonial, index) => (
        <Quote
          key={testimonial.id}
          testimonial={testimonial}
          tone={toneAt(index + 1)}
        />
      ))}
    </div>
  );
}

export function KindWords({
  testimonials,
  floor
}: {
  testimonials: TestimonialModel[];
  floor?: string;
}) {
  if (testimonials.length === 0) return null;

  return (
    <Section
      title="Kind words"
      kana={KANA.testimonials}
      floor={floor}
      tone="violet"
    >
      <Quotes testimonials={testimonials} />
    </Section>
  );
}

/** Tags or post types, as a row of lit chips */
export function LinkList({
  links,
  label
}: {
  links: LinkModel[];
  label: string;
}) {
  return (
    <ul className="neon-chips" aria-label={label}>
      {links.map((link) => (
        <li key={link.url}>
          <Chip tone={toneFor(link.text)} href={link.url}>
            {link.text}
          </Chip>
        </li>
      ))}
    </ul>
  );
}

/** Every page on the site, as a building directory */
export function PageTable({ pages }: { pages: PageListSection["pages"] }) {
  return (
    <table className="neon-table">
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
              <a href={page.url}>
                <code>{page.url}</code>
              </a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* Forms and wayfinding
   ========================================================================== */

/** A form's status line, beside its button */
const Status = ({ status }: { status?: string }) =>
  status ? (
    <span className="neon-status" role="status">
      {status}
    </span>
  ) : null;

/** A form's submit button and its status */
export const Submit = ({
  label,
  status
}: {
  label: string;
  status?: string;
}) => (
  <p className="neon-form__submit">
    <button className="neon-button" type="submit">
      {label}
    </button>
    <Status status={status} />
  </p>
);

/** The newsletter sign-up: one field and its button, under a lightbox sign */
export function Newsletter({ floor }: { floor?: string }) {
  const { title, text, submit, field } = newsletterForm;
  const { props, hidden, status } = useSubmission("newsletter");

  return (
    <Section
      title={title}
      kana={KANA.newsletter}
      floor={floor}
      tone="amber"
      className="neon-newsletter"
    >
      <p>{text}</p>
      <form className="neon-form neon-form--inline" {...props}>
        {hidden}
        <label className="neon-field">
          <span className="neon-field__label">{field.label}</span>
          <input
            type={field.type}
            name={field.name}
            placeholder={field.placeholder}
            required
          />
        </label>
        <Submit label={submit} status={status} />
      </form>
    </Section>
  );
}

/** A post's or case study's comments, under a sign */
export const Discussion = ({ url, floor }: { url: string; floor?: string }) => (
  <Section title="Comments" kana={KANA.comments} floor={floor} tone="lime">
    <Comments url={url} className="neon-comments" />
  </Section>
);

/** Previous and next, as street signs pointing either way */
export function PostNav({ nav }: { nav: PostNavModel | null }) {
  if (!nav || (!nav.previous && !nav.next)) return null;

  return (
    <nav className="neon-postNav" aria-label="More">
      {nav.previous && (
        <a className="neon-postNav__link" href={nav.previous.url} rel="prev">
          <span className="neon-postNav__dir">← Previous</span>
          <span className="neon-postNav__title">{nav.previous.text}</span>
        </a>
      )}
      {nav.next && (
        <a
          className="neon-postNav__link neon-postNav__link--next"
          href={nav.next.url}
          rel="next"
        >
          <span className="neon-postNav__dir">Next →</span>
          <span className="neon-postNav__title">{nav.next.text}</span>
        </a>
      )}
    </nav>
  );
}

export function FormField({ field }: { field: Field }) {
  const className = cx("neon-field", field.wide && "neon-field--wide");
  const label = (
    <span className="neon-field__label">
      {field.label}
      {field.required && (
        <span className="neon-field__required" aria-hidden="true">
          {" "}
          *
        </span>
      )}
    </span>
  );

  if (field.kind === "choices") {
    return (
      <fieldset className={cx(className, "neon-choices")}>
        <legend className="neon-field__label">{field.label}</legend>
        {field.options.map((option) => (
          <label key={option} className="neon-choice">
            <input type={field.type} name={field.name} value={option} />
            <span>{option}</span>
          </label>
        ))}
      </fieldset>
    );
  }

  return (
    <label className={className}>
      {label}
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
