import type { ReactNode } from "react";

import type {
  EntriesSection,
  LabContent,
  PostNavModel,
  TestimonialModel
} from "../../../lib/types";
import { Html, type FormField as Field } from "../../site";

type Posts = LabContent["posts"];

/** Eyebrow, title, and lede at the top of a page; title and lede are HTML */
export function PageHeader({
  eyebrow,
  title,
  lede,
  children
}: {
  eyebrow: ReactNode;
  title: string;
  lede?: string;
  children?: ReactNode;
}) {
  return (
    <header className="wireframe-pageHeader">
      <p className="wireframe-eyebrow">{eyebrow}</p>
      <Html as="h1" html={title} />
      {lede && <Html as="p" className="wireframe-lede" html={lede} />}
      {children}
    </header>
  );
}

export function Section({
  title,
  children
}: {
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="wireframe-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

/** Term and detail pairs */
export function Facts({ rows }: { rows: [ReactNode, ReactNode][] }) {
  return (
    <dl className="wireframe-facts">
      {rows.map(([term, detail], index) => (
        <div key={index}>
          <dt>{term}</dt>
          <dd>{detail}</dd>
        </div>
      ))}
    </dl>
  );
}

export function PostList({ posts }: { posts: Posts }) {
  return (
    <ol className="wireframe-list">
      {posts.map((post) => (
        <li key={post.url}>
          <a href={post.url}>{post.title}</a>
          <span className="wireframe-meta">
            <time dateTime={post.iso}>{post.date}</time>
            {post.type && ` · ${post.type}`}
          </span>
          {post.lede && <p>{post.lede}</p>}
        </li>
      ))}
    </ol>
  );
}

export function WorkGrid({ work }: { work: LabContent["work"] }) {
  return (
    <ul className="wireframe-grid">
      {work.map((item) => (
        <li key={item.url} className="wireframe-card">
          <a href={item.url} tabIndex={-1}>
            <img src={item.cover} alt="" loading="lazy" />
          </a>
          <h3>
            <a href={item.url}>{item.name}</a>
          </h3>
          {item.lede && <Html as="p" html={item.lede} />}
          <p className="wireframe-meta">
            {[item.industry, item.year].filter(Boolean).join(" · ")}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function ServiceList({
  services
}: {
  services: LabContent["services"];
}) {
  return (
    <ul className="wireframe-list">
      {services.map((service) => (
        <li key={service.url}>
          <a href={service.url}>{service.title}</a>
          {service.lede && <p>{service.lede}</p>}
        </li>
      ))}
    </ul>
  );
}

/** Links listed by an `entries` section (type and tag archives, …) */
export function Entries({ section }: { section: EntriesSection }) {
  if (section.entries.length === 0) return null;

  return (
    <Section title={section.heading ?? "Entries"}>
      <ul className="wireframe-list">
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

export function Quote({ testimonial }: { testimonial: TestimonialModel }) {
  const { person } = testimonial;

  return (
    <figure className="wireframe-quote">
      <Html as="blockquote" html={testimonial.content} />
      {person && (
        <figcaption>
          {person.image && <img src={person.image} alt="" loading="lazy" />}
          <span>
            {person.name}
            {person.position && (
              <span className="wireframe-meta">{person.position}</span>
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
  return (
    <Section title="Kind words">
      <div className="wireframe-grid">
        {testimonials.map((testimonial) => (
          <Quote key={testimonial.id} testimonial={testimonial} />
        ))}
      </div>
    </Section>
  );
}

export function PostNav({ nav }: { nav: PostNavModel | null }) {
  if (!nav || (!nav.previous && !nav.next)) return null;

  return (
    <nav className="wireframe-postNav" aria-label="More">
      {nav.previous && <a href={nav.previous.url}>← {nav.previous.text}</a>}
      {nav.next && <a href={nav.next.url}>{nav.next.text} →</a>}
    </nav>
  );
}

export function FormField({ field }: { field: Field }) {
  const className = field.wide
    ? "wireframe-field wireframe-field--wide"
    : "wireframe-field";

  if (field.kind === "choices") {
    return (
      <fieldset className={className}>
        <legend>{field.label}</legend>
        {field.options.map((option) => (
          <label key={option}>
            <input type={field.type} name={field.name} value={option} />
            {option}
          </label>
        ))}
      </fieldset>
    );
  }

  return (
    <label className={className}>
      {field.label}
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
