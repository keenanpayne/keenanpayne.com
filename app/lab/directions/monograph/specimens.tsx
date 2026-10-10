import { useId, useState, type ReactNode } from "react";

import { HtmlContent } from "../../../components/HtmlContent";
import type { LabContent, PortfolioGridSection } from "../../../lib/types";
import {
  formFields,
  Html,
  postsByYear,
  postTypes,
  useTo,
  type FormField as Field,
  type SpecimenProps,
  type Specimens
} from "../../site";
import {
  Note,
  samplePostNav,
  Specimen,
  SpecimenGrid,
  TypeSample
} from "../../styleguide/kit";

import { PostCards } from "./pages/Archive";
import { Gallery } from "./pages/CaseStudy";
import { FormField } from "./pages/Contact";
import { NotFound } from "./pages/NotFound";
import {
  ArrowCircle,
  Banner,
  Icon,
  icons,
  KindWords,
  MoreLink,
  Newsletter,
  PageHeader,
  PostNav,
  Quote,
  Section,
  SectionLabel,
  ServicesLedger,
  WorkCard,
  WorkGrid,
  type IconName
} from "./parts";

type Work = LabContent["work"][number];

/** A post type's archive, e.g. `/type/essays/` */
const typePath = (type: string) => `/type/${type.toLowerCase()}s/`;

/** The handle the masthead hangs from its rule, from the first profile */
function handleOf(socials: LabContent["socials"]) {
  const name = socials[0]?.url.split("/").filter(Boolean).at(-1);
  return name && `@${name.replace(/^@/, "")}`;
}

/** Term and detail pairs, as About, Contact, posts, and case studies set them */
const Facts = ({
  rows,
  stacked
}: {
  rows: [string, ReactNode][];
  stacked?: boolean;
}) => (
  <dl className={stacked ? "mg-facts mg-facts--stacked" : "mg-facts"}>
    {rows.map(([term, detail]) => (
      <div key={term}>
        <dt>{term}</dt>
        <dd>{detail}</dd>
      </div>
    ))}
  </dl>
);

/** The Shell's dithered edge, with a filter of its own */
function Dither() {
  const filter = useId();

  return (
    <svg className="mg-dither" aria-hidden="true">
      <filter id={filter} x="0" y="0" width="100%" height="100%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.85"
          numOctaves="1"
          seed="7"
        />
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncR type="discrete" tableValues="0 1" />
          <feFuncG type="discrete" tableValues="0 1" />
          <feFuncB type="discrete" tableValues="0 1" />
        </feComponentTransfer>
      </filter>
      <rect width="100%" height="100%" filter={`url(#${filter})`} />
    </svg>
  );
}

/** One of WorkGrid's rows of three, with the wide card first or centered */
const WorkRow = ({ items, center }: { items: Work[]; center?: boolean }) => (
  <div className={`mg-row mg-row--${center ? "center" : "lead"}`}>
    {items.map((item, column) => (
      <WorkCard
        key={item.url}
        item={item}
        wide={items.length === 3 && column === (center ? 1 : 0)}
      />
    ))}
  </div>
);

interface Heading {
  id: string;
  text: string;
  children: Heading[];
}

/** A post's contents: its second- and third-level headings, nested */
function contentsOf(html: string) {
  const headings: Heading[] = [];
  const pattern = /<h([23]) id="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g;
  for (const [, level, id, inner] of html.matchAll(pattern)) {
    const heading = {
      id,
      text: inner.replace(/<[^>]+>/g, "").trim(),
      children: []
    };
    const parent = headings.at(-1);
    if (level === "3" && parent) parent.children.push(heading);
    else headings.push(heading);
  }
  return headings;
}

const ContentsList = ({ headings }: { headings: Heading[] }) => (
  <ol>
    {headings.map((heading) => (
      <li key={heading.id}>
        <a href={`#${heading.id}`}>{heading.text}</a>
        {heading.children.length > 0 && (
          <ContentsList headings={heading.children} />
        )}
      </li>
    ))}
  </ol>
);

/** The table of contents that opens a post's body */
const Contents = ({ html, open }: { html: string; open?: boolean }) => (
  <div className="mg-prose mg-post__body">
    <details className="toc" open={open}>
      <summary className="toc-summary _label-sans">Table of Contents</summary>
      <nav className="toc-nav">
        <ContentsList headings={contentsOf(html)} />
      </nav>
    </details>
  </div>
);

/* Sections
   ========================================================================== */

function TypeScale({ content }: SpecimenProps) {
  const to = useTo();
  const { profile, posts, work, services, testimonials } = content;
  const post = posts[1];
  const [featured] = work;
  const [service] = services;
  const quote = [...testimonials].sort(
    (a, b) => a.content.length - b.content.length
  )[0];

  return (
    <>
      <TypeSample label="Not found numeral">
        <p className="mg-notFound__code" aria-hidden="true">
          404
        </p>
      </TypeSample>
      <TypeSample label="Case study title">
        <h1 className="mg-case__title">{featured.name}</h1>
      </TypeSample>
      <TypeSample label="Post title">
        <h1 className="mg-post__title">{post.title}</h1>
      </TypeSample>
      <TypeSample label="Page title">
        <Html as="h1" className="mg-pageHeader__title" html={service.title} />
      </TypeSample>
      <TypeSample label="Year and step numerals">
        <h3 className="mg-year__label">{post.year}</h3>
      </TypeSample>
      <TypeSample label="Banner heading">
        <p className="mg-banner__heading">Have a project in mind?</p>
      </TypeSample>
      <TypeSample label="Prose heading 2">
        <div className="mg-prose">
          <h2>{posts[0].title}</h2>
        </div>
      </TypeSample>
      <TypeSample label="Pull quote">
        <div className="mg-prose">
          <blockquote>
            <p>{posts[2].lede}</p>
          </blockquote>
        </div>
      </TypeSample>
      <TypeSample label="Hero lede">
        <Html as="p" className="mg-hero__lede" html={profile.bio} />
      </TypeSample>
      <TypeSample label="Newsletter heading">
        <p className="mg-newsletter__heading">Letters, occasionally</p>
      </TypeSample>
      <TypeSample label="Large card title">
        <h3 className="mg-card__title mg-card__title--large">
          <a href={featured.url}>{featured.name}</a>
        </h3>
      </TypeSample>
      {featured.lede && (
        <TypeSample label="Page lede">
          <Html as="p" className="mg-pageHeader__lede" html={featured.lede} />
        </TypeSample>
      )}
      <TypeSample label="Prose heading 3">
        <div className="mg-prose">
          <h3>{posts[2].title}</h3>
        </div>
      </TypeSample>
      <TypeSample label="Previous and next title">
        <span className="mg-postNav__title">{posts[0].title}</span>
      </TypeSample>
      <TypeSample label="Masthead name">
        <a className="mg-mast__name" href={to("/")}>
          {profile.name}
        </a>
      </TypeSample>
      <TypeSample label="Card title">
        <h3 className="mg-card__title">
          <a href={post.url}>{post.title}</a>
        </h3>
      </TypeSample>
      <TypeSample label="Ledger title">
        <span className="mg-ledger__title">{service.title}</span>
      </TypeSample>
      <TypeSample label="Prose body">
        <div className="mg-prose">
          <p>{post.lede}</p>
        </div>
      </TypeSample>
      <TypeSample label="Testimonial">
        <Html as="blockquote" className="mg-quote__text" html={quote.content} />
      </TypeSample>
      <TypeSample label="Index title">
        <span className="mg-index__title">{posts[3].title}</span>
      </TypeSample>
      {featured.industry && (
        <TypeSample label="Spec value" measure="dd">
          <dl className="mg-specs">
            <div>
              <dt>Industry</dt>
              <dd>{featured.industry}</dd>
            </div>
          </dl>
        </TypeSample>
      )}
      <TypeSample label="Post lede">
        <p className="mg-post__lede">{post.lede}</p>
      </TypeSample>
      {featured.lede && (
        <TypeSample label="Body copy">
          <Html as="p" className="mg-copy" html={featured.lede} />
        </TypeSample>
      )}
      <TypeSample label="Prose heading 4">
        <div className="mg-prose">
          <h4>{services[1].title}</h4>
        </div>
      </TypeSample>
      <TypeSample label="Label">
        <p className="mg-label">
          <Icon name="pen" />
          Writing
        </p>
      </TypeSample>
      <TypeSample label="Meta">
        <p className="mg-meta">
          {[featured.year, featured.role].filter(Boolean).join(" · ")}
        </p>
      </TypeSample>
    </>
  );
}

function Motifs({ content }: SpecimenProps) {
  const handle = handleOf(content.socials);

  return (
    <SpecimenGrid min={240}>
      <Specimen
        label="Icons"
        note="14px line icons, beside every section label"
        wide
      >
        <div style={{ display: "flex", flexWrap: "wrap", columnGap: 28 }}>
          {(Object.keys(icons) as IconName[]).map((name) => (
            <p key={name} className="mg-label">
              <Icon name={name} />
              {name}
            </p>
          ))}
        </div>
      </Specimen>
      <Specimen label="Arrow circle" note="Ends links and rows">
        <ArrowCircle />
      </Specimen>
      <Specimen label="Arrow circle, back" note="Previous links">
        <ArrowCircle back />
      </Specimen>
      {handle && (
        <Specimen label="Masthead rule" note="3px, with the handle hung below">
          <div className="mg-mast__rule">
            <span className="mg-tag">{handle}</span>
          </div>
        </Specimen>
      )}
      <Specimen label="Double rule" note="4px double, opening every section">
        <section className="mg-section">
          <SectionLabel icon="pen">Writing</SectionLabel>
        </section>
      </Specimen>
      <Specimen label="Prose rule" note="Two hairlines between parts of a post">
        <div className="mg-prose">
          <hr />
        </div>
      </Specimen>
      <Specimen
        label="Column dividers"
        note="Hairlines between cards in a row; across them on phones"
        wide
      >
        <div className="mg-row mg-row--thirds">
          {content.posts.slice(0, 3).map((post) => (
            <div className="mg-card" key={post.url}>
              <p className="mg-meta">
                <time dateTime={post.iso}>{post.date}</time>
              </p>
              <h3 className="mg-card__title">
                <a href={post.url}>{post.title}</a>
              </h3>
            </div>
          ))}
        </div>
      </Specimen>
      <Specimen
        label="Glyph banner"
        note="Code glyphs fade in around a call to action between sections; the heading varies by page"
        wide
      >
        <Banner />
      </Specimen>
      <Specimen
        label="Dithered edge"
        note="Under the footer of every page, fading in"
        wide
      >
        <Dither />
      </Specimen>
    </SpecimenGrid>
  );
}

function Imagery({ content }: SpecimenProps) {
  const { profile, posts, work, testimonials } = content;
  const [featured, item] = work;
  const person = testimonials.find(
    (testimonial) => testimonial.person?.image
  )?.person;

  // Two posts with art, then two set as the stand-in a post without art gets
  const withArt = posts.filter((post) => post.image).slice(0, 2);
  const withoutArt = posts.filter((post) => !post.image);
  const standIns = (withoutArt.length ? withoutArt : posts.slice(2)).slice(
    0,
    2
  );

  const gallery: PortfolioGridSection = {
    type: "portfolioGrid",
    items: work.slice(1, 4).map((project) => ({
      image: project.cover,
      title: project.name,
      link: project.url,
      caption: project.industry,
      enlargeHref: project.cover
    }))
  };

  return (
    <>
      <SpecimenGrid min={220}>
        <Specimen label="Portrait" note="Home hero: round, ringed, grayscale">
          <img
            className="mg-hero__avatar"
            src={profile.avatar}
            alt={profile.name}
          />
        </Specimen>
        <Specimen label="Cover" note="Work cards, 200px; color on hover">
          <a className="mg-figure" href={item.url} tabIndex={-1}>
            <img src={item.coverSquare} alt="" loading="lazy" />
          </a>
        </Specimen>
        <Specimen label="Wide cover" note="The wide card in each row">
          <a className="mg-figure" href={item.url} tabIndex={-1}>
            <img src={item.cover} alt="" loading="lazy" />
          </a>
        </Specimen>
        {person?.image && (
          <Specimen label="Avatar" note="Testimonials, 28px">
            <figure className="mg-card mg-quote">
              <figcaption className="mg-quote__person">
                <img src={person.image} alt="" loading="lazy" />
                <span>
                  {person.name}
                  {person.position && (
                    <span className="mg-meta">{person.position}</span>
                  )}
                </span>
              </figcaption>
            </figure>
          </Specimen>
        )}
      </SpecimenGrid>

      <SpecimenGrid min={420}>
        <Specimen
          label="Post art"
          note="Writing cards, 16:9; a post without art gets its type and year, typeset"
          wide
        >
          <div className="mg-row mg-row--quarters">
            {[
              ...withArt.map((post) => ({ post, art: true })),
              ...standIns.map((post) => ({ post, art: false }))
            ].map(({ post, art }) => (
              <article className="mg-card" key={post.url}>
                <a className="mg-figure" href={post.url} tabIndex={-1}>
                  {art ? (
                    <img src={post.image} alt="" loading="lazy" />
                  ) : (
                    <span className="mg-figure__placeholder" aria-hidden="true">
                      <span>{post.type ?? "Essay"}</span>
                      <span>{post.year}</span>
                    </span>
                  )}
                </a>
              </article>
            ))}
          </div>
        </Specimen>
        <Specimen label="Case study cover" note="Full width, under the specs">
          <div className="mg-figure mg-case__cover">
            <img src={featured.cover} alt="" loading="lazy" />
          </div>
        </Specimen>
        <Specimen
          label="Feature cover"
          note="Beside the first project; 16:9 on phones"
        >
          <a
            className="mg-figure mg-feature__figure"
            href={featured.url}
            tabIndex={-1}
          >
            <img src={featured.cover} alt="" loading="lazy" />
          </a>
        </Specimen>
        <Specimen label="Photos" note="About: 4:5, captioned in meta" wide>
          <div className="mg-row mg-row--thirds mg-photos">
            {profile.photos.map((photo) => (
              <figure className="mg-card" key={photo.src}>
                <div className="mg-figure mg-figure--portrait">
                  <img src={photo.src} alt={photo.alt} loading="lazy" />
                </div>
                <figcaption className="mg-meta">{photo.alt}</figcaption>
              </figure>
            ))}
          </div>
        </Specimen>
        <Specimen
          label="Gallery"
          note="Case-study screenshots, one to three across, each titled under a hairline; shown with covers"
          wide
        >
          <Gallery section={gallery} />
        </Specimen>
      </SpecimenGrid>
    </>
  );
}

function PageHeaders({ content }: SpecimenProps) {
  const to = useTo();
  const { profile, posts, work, services } = content;
  const post = posts[1];
  const [featured] = work;
  const [service] = services;
  const years = postsByYear(posts);
  const types = postTypes(posts);

  return (
    <SpecimenGrid min={420}>
      <Specimen label="Home hero" note="The portrait beside the bio" wide>
        <section className="mg-hero">
          <img
            className="mg-hero__avatar"
            src={profile.avatar}
            alt={profile.name}
          />
          <Html as="p" className="mg-hero__lede" html={profile.bio} />
        </section>
      </Specimen>
      <Specimen
        label="Page header"
        note="Icon and eyebrow, title, lede; here a service"
        wide
      >
        <PageHeader
          icon="list"
          eyebrow="Service"
          title={service.title}
          lede={service.lede}
        />
      </Specimen>
      <Specimen
        label="Page header, with stats"
        note="The writing archive counts its posts"
        wide
      >
        <PageHeader icon="pen" eyebrow="Writing" title="Writing">
          <p className="mg-pageHeader__stats">
            {posts.length} articles · {years.length} years · {types.join(", ")}
          </p>
        </PageHeader>
      </Specimen>
      <Specimen
        label="Post header"
        note="A breadcrumb, a larger title, and a monospace lede"
        wide
      >
        <header className="mg-post__header">
          <p className="mg-label">
            <Icon name="pen" />
            <a href={to("/archive/")}>Writing</a>
            {post.type && (
              <>
                <span aria-hidden="true">/</span>
                <a href={to(typePath(post.type))}>{post.type}</a>
              </>
            )}
          </p>
          <h1 className="mg-post__title">{post.title}</h1>
          {post.lede && <p className="mg-post__lede">{post.lede}</p>}
        </header>
      </Specimen>
      <Specimen
        label="Case study header"
        note="The client’s name, as large as the page allows"
        wide
      >
        <header className="mg-pageHeader mg-case__header">
          <p className="mg-label">
            <Icon name="grid" />
            <a href={to("/portfolio/")}>Work</a>
            <span aria-hidden="true">/</span>
            Case study
          </p>
          <h1 className="mg-case__title">{featured.name}</h1>
          {featured.lede && (
            <Html as="p" className="mg-pageHeader__lede" html={featured.lede} />
          )}
        </header>
      </Specimen>
      <Specimen
        label="Not found"
        note="404 in italic, beside the ways back"
        wide
      >
        <NotFound />
      </Specimen>
    </SpecimenGrid>
  );
}

function Actions({ content }: SpecimenProps) {
  const to = useTo();
  const [featured] = content.work;

  return (
    <SpecimenGrid min={220}>
      <Specimen label="Pill" note="The banner’s call to action; lifts on hover">
        <a className="mg-pill" href={to("/project-inquiry/")}>
          Start a project inquiry
        </a>
      </Specimen>
      <Specimen label="Pill button" note="Sends forms and subscribes">
        <button className="mg-pill" type="button">
          Send message
        </button>
      </Specimen>
      <Specimen
        label="More link"
        note="Closes cards and sections; the underline thickens on hover"
      >
        <MoreLink href={to("/services/")}>All services</MoreLink>
      </Specimen>
      <Specimen label="More link, back" note="The arrow turned around">
        <MoreLink href={to("/archive/")} back>
          Writing archive
        </MoreLink>
      </Specimen>
      <Specimen label="Text link" note="Takes the ink, underlined">
        <p className="mg-copy">
          Thanks for reading. Questions or thoughts?{" "}
          <a href={to("/contact/")}>Get in touch</a>.
        </p>
      </Specimen>
      <Specimen label="Title link" note="Underlined only on hover">
        <h3 className="mg-card__title">
          <a href={featured.url}>{featured.name}</a>
        </h3>
      </Specimen>
    </SpecimenGrid>
  );
}

function Labels({ content }: SpecimenProps) {
  const { posts, work, socials } = content;
  const [featured] = work;
  const handle = handleOf(socials);
  const types = postTypes(posts).map((type) => ({
    type,
    count: posts.filter((post) => post.type === type).length
  }));

  return (
    <SpecimenGrid min={240}>
      <Specimen label="Section label" note="An icon and a name, over sections">
        <SectionLabel icon="grid">Work</SectionLabel>
      </Specimen>
      <Specimen label="Eyebrow" note="The same label, over a page’s title">
        <p className="mg-label mg-pageHeader__eyebrow">
          <Icon name="user" />
          About
        </p>
      </Specimen>
      <Specimen label="Label" note="Without an icon: a case’s challenge">
        <p className="mg-label">The challenge</p>
      </Specimen>
      <Specimen label="Meta" note="Years and role under a title">
        <p className="mg-meta">
          {[featured.year, featured.role].filter(Boolean).join(" · ")}
        </p>
      </Specimen>
      <Specimen label="Stats" note="Under the writing archive’s title">
        <p className="mg-pageHeader__stats">
          {posts.length} articles · {postsByYear(posts).length} years ·{" "}
          {types.map(({ type }) => type).join(", ")}
        </p>
      </Specimen>
      {handle && (
        <Specimen label="Tag" note="The masthead’s handle">
          <span className="mg-tag">{handle}</span>
        </Specimen>
      )}
      <Specimen label="Tags" note="Post tags and case-study technologies" wide>
        <ul className="mg-tags">
          {featured.technologies.map((technology) => (
            <li key={technology}>{technology}</li>
          ))}
        </ul>
      </Specimen>
      <Specimen
        label="Chips"
        note="Counts, as the testimonials’ most-mentioned qualities; here, post types"
        wide
      >
        <ul className="mg-chips" aria-label="Post types">
          {types.map(({ type, count }) => (
            <li key={type}>
              {type} <span>{count}</span>
            </li>
          ))}
        </ul>
      </Specimen>
    </SpecimenGrid>
  );
}

function Surfaces({ content }: SpecimenProps) {
  const to = useTo();
  const { profile, posts, services, socials } = content;
  const post = posts[1];

  return (
    <SpecimenGrid min={320}>
      <Specimen
        label="Section"
        note="A double rule and a label open it; a more link can close it"
        wide
      >
        <Section icon="list" label="Services">
          <ServicesLedger services={services.slice(0, 3)} />
          <div className="mg-section__more">
            <MoreLink href={to("/services/")}>All services</MoreLink>
          </div>
        </Section>
      </Specimen>
      <Specimen
        label="Split"
        note="About: copy beside an aside, ruled off from 760px"
        wide
      >
        <section className="mg-section mg-about">
          <div className="mg-about__body">
            <p className="mg-label">
              <Icon name="pen" />
              In brief
            </p>
            <Html className="mg-prose" html={`<p>${profile.bio}</p>`} />
          </div>
          <aside className="mg-about__aside">
            <p className="mg-label">
              <Icon name="list" />
              At a glance
            </p>
            <Facts
              rows={[
                ...profile.facts.map((fact): [string, ReactNode] => [
                  fact.label,
                  fact.url ? <a href={fact.url}>{fact.text}</a> : fact.text
                ]),
                [
                  "Elsewhere",
                  socials.map((social, index) => (
                    <span key={social.url}>
                      {index > 0 && " – "}
                      <a href={social.url} rel={social.rel}>
                        {social.text}
                      </a>
                    </span>
                  ))
                ]
              ]}
            />
          </aside>
        </section>
      </Specimen>
      <Specimen
        label="Halves"
        note="A case study’s challenge and solution; shown with two steps"
        wide
      >
        <section className="mg-section">
          <div className="mg-row mg-row--halves">
            {profile.process.slice(0, 2).map((step) => (
              <div className="mg-card" key={step.title}>
                <p className="mg-label">{step.title}</p>
                <Html as="p" className="mg-case__pillar" html={step.text} />
              </div>
            ))}
          </div>
        </section>
      </Specimen>
      <Specimen
        label="Post layout"
        note="A rail of facts beside the body, side by side from 960px"
        wide
      >
        <div className="mg-post__layout">
          <aside className="mg-post__rail">
            <Facts
              stacked
              rows={[
                ["Published", <time dateTime={post.iso}>{post.date}</time>],
                ...(post.type
                  ? [
                      [
                        "Filed under",
                        <a href={to(typePath(post.type))}>{post.type}</a>
                      ] as [string, ReactNode]
                    ]
                  : [])
              ]}
            />
          </aside>
          <div className="mg-prose mg-post__body">
            <p>{post.lede}</p>
          </div>
        </div>
      </Specimen>
    </SpecimenGrid>
  );
}

function Cards({ content }: SpecimenProps) {
  const { posts, work, profile } = content;
  const [featured, ...rest] = work;
  const [lead, center] = [rest.slice(0, 3), rest.slice(3, 6)];

  return (
    <SpecimenGrid min={320}>
      <Specimen
        label="Writing cards"
        note="Four across: art, title, lede, and a link named for the type"
        wide
      >
        <PostCards posts={posts.slice(0, 4)} />
      </Specimen>
      <Specimen
        label="Feature"
        note="The first project: its summary and services beside a large cover"
        wide
      >
        <WorkGrid work={[featured]} />
      </Specimen>
      {lead.length > 0 && (
        <Specimen
          label="Work cards, wide first"
          note="Rows of three alternate the wide card, which lists technologies"
          wide
        >
          <WorkRow items={lead} />
        </Specimen>
      )}
      {center.length > 0 && (
        <Specimen label="Work cards, wide centered" wide>
          <WorkRow items={center} center />
        </Specimen>
      )}
      <Specimen
        label="Steps"
        note="Services: the process, numbered in italic"
        wide
      >
        <ol className="mg-row mg-row--quarters mg-steps">
          {profile.process.map((step, index) => (
            <li className="mg-card" key={step.title}>
              <span className="mg-steps__number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mg-card__title">{step.title}</h3>
              <p className="mg-copy">{step.text}</p>
            </li>
          ))}
        </ol>
      </Specimen>
    </SpecimenGrid>
  );
}

function Lists({ content }: SpecimenProps) {
  const { profile, posts, work, services, testimonials } = content;
  const [featured] = work;
  const people = testimonials.flatMap(({ person }) => person ?? []);

  const specs: [string, ReactNode][] = [];
  if (featured.industry) specs.push(["Industry", featured.industry]);
  if (featured.year) specs.push(["Years", featured.year]);
  if (featured.services.length) {
    specs.push(["Services", featured.services.join(", ")]);
  }

  return (
    <SpecimenGrid min={300}>
      <Specimen
        label="Ledger"
        note="Services: number, name, and lede; an arrow on hover"
        wide
      >
        <ServicesLedger services={services} />
      </Specimen>
      <Specimen
        label="Index"
        note="The writing archive, by year; an arrow on hover"
        wide
      >
        {postsByYear(posts)
          .slice(0, 2)
          .map(([year, entries]) => (
            <div className="mg-year" key={year}>
              <h3 className="mg-year__label">{year}</h3>
              <ol className="mg-index">
                {entries.slice(0, 4).map((post) => (
                  <li key={post.url}>
                    <a href={post.url}>
                      <span className="mg-index__date">
                        {post.date.slice(0, 6)}
                      </span>
                      <span className="mg-index__title">{post.title}</span>
                      <span className="mg-index__type">{post.type}</span>
                      <ArrowCircle />
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          ))}
      </Specimen>
      <Specimen
        label="Entries"
        note="Type archives and other lists of pages, shown with services; with no dates, the titles take the first column"
        wide
      >
        <ol className="mg-index">
          {services.slice(0, 4).map((service) => (
            <li key={service.url}>
              <a href={service.url}>
                <span className="mg-index__title">{service.title}</span>
                {service.lede && (
                  <Html
                    as="span"
                    className="mg-index__type"
                    html={service.lede}
                  />
                )}
                <ArrowCircle />
              </a>
            </li>
          ))}
        </ol>
      </Specimen>
      <Specimen
        label="Table"
        note="Work, by client; an arrow on hover, and industry and role drop on phones"
        wide
      >
        <table className="mg-table">
          <thead>
            <tr>
              <th scope="col">Client</th>
              <th scope="col">Industry</th>
              <th scope="col">Role</th>
              <th scope="col">Years</th>
              <th scope="col">
                <span className="mg-visually-hidden">Link</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {work.map((item) => (
              <tr key={item.url}>
                <th scope="row">
                  <a href={item.url}>{item.name}</a>
                </th>
                <td>{item.industry}</td>
                <td>{item.role}</td>
                <td>{item.year}</td>
                <td>
                  <ArrowCircle />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Specimen>
      {specs.length > 0 && (
        <Specimen
          label="Specs"
          note="A case study’s strip of four; two across on phones"
          wide
        >
          <dl className="mg-specs">
            {specs.map(([term, detail]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{detail}</dd>
              </div>
            ))}
          </dl>
        </Specimen>
      )}
      <Specimen label="Facts" note="Term beside detail: About and Contact">
        <Facts
          rows={[
            ["Email", <a href={`mailto:${profile.email}`}>{profile.email}</a>],
            [
              "Location",
              `${profile.location.name} (${profile.location.timeZoneName})`
            ]
          ]}
        />
      </Specimen>
      <Specimen
        label="Stacked facts"
        note="Case studies and the post rail; people shown from the testimonials"
      >
        <Facts
          stacked
          rows={[
            [
              "Technologies",
              <ul className="mg-tags">
                {featured.technologies.map((technology) => (
                  <li key={technology}>{technology}</li>
                ))}
              </ul>
            ],
            [
              "People",
              <ul className="mg-people">
                {people.slice(0, 3).map((person) => (
                  <li key={person.name}>
                    {person.name}
                    {person.position && (
                      <span className="mg-meta">{person.position}</span>
                    )}
                  </li>
                ))}
              </ul>
            ]
          ]}
        />
      </Specimen>
      <Specimen label="Bullets" note="The feature’s role, years, and services">
        <ul className="mg-bullets">
          {featured.role && <li>Role: {featured.role}</li>}
          {featured.year && <li>Years: {featured.year}</li>}
          {featured.industry && <li>{featured.industry}</li>}
          {featured.services.map((service) => (
            <li key={service}>{service}</li>
          ))}
        </ul>
      </Specimen>
      <Specimen
        label="Bullets, two columns"
        note="Technologies on the wide work card"
      >
        <ul className="mg-bullets mg-bullets--columns">
          {featured.technologies.slice(0, 8).map((technology) => (
            <li key={technology}>{technology}</li>
          ))}
        </ul>
      </Specimen>
    </SpecimenGrid>
  );
}

function Quotes({ content }: SpecimenProps) {
  const { testimonials } = content;
  const [first, second = first] = testimonials;
  if (!first) return null;
  // Without its photo, as the testimonials page shows a person who has none
  const unpictured = second.person && {
    ...second,
    person: { ...second.person, image: undefined }
  };

  return (
    <SpecimenGrid min={320}>
      <Specimen label="Quote" note="Serif, in curly quotes, over a portrait">
        <Quote testimonial={first} />
      </Specimen>
      {unpictured && (
        <Specimen label="Quote, no portrait" note="A person without a photo">
          <Quote testimonial={unpictured} />
        </Specimen>
      )}
      <Specimen label="Kind words" note="Three across, closing most pages" wide>
        <KindWords testimonials={testimonials} />
      </Specimen>
      <Specimen
        label="Masonry"
        note="The testimonials page: columns ruled in ink, one to three across"
        wide
      >
        <div className="mg-masonry">
          {testimonials.map((testimonial) => (
            <Quote key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </Specimen>
    </SpecimenGrid>
  );
}

/** Contact's form beside its details, without the page's lede */
function ContactForm({
  content,
  variant
}: {
  content: LabContent;
  variant: "contact" | "inquiry";
}) {
  const to = useTo();
  const { email, location } = content.profile;
  const [sent, setSent] = useState(false);

  return (
    <section className="mg-section mg-contact">
      <aside className="mg-contact__aside">
        <Facts
          rows={[
            ["Email", <a href={`mailto:${email}`}>{email}</a>],
            ["Location", `${location.name} (${location.timeZoneName})`]
          ]}
        />
        {variant === "contact" ? (
          <MoreLink href={to("/project-inquiry/")}>
            Start a project inquiry instead
          </MoreLink>
        ) : (
          <MoreLink href={to("/contact/")}>Just saying hello?</MoreLink>
        )}
      </aside>

      <form
        className="mg-form"
        onSubmit={(event) => {
          event.preventDefault();
          setSent(true);
        }}
      >
        <p className="mg-label mg-field--wide">
          <Icon name="pen" />
          {variant === "contact" ? "Send a note" : "Tell me about your project"}
        </p>

        {formFields(variant).map((field) => (
          <FormField key={field.name} field={field} />
        ))}

        <div className="mg-form__actions mg-field--wide">
          <button className="mg-pill" type="submit">
            {variant === "contact" ? "Send message" : "Send inquiry"}
          </button>
          <p className="mg-meta" role="status">
            {sent
              ? "Mockup only — nothing was sent."
              : "Mockup only — this form doesn’t send anything."}
          </p>
        </div>
      </form>
    </section>
  );
}

type Choices = Extract<Field, { kind: "choices" }>;

/** A choice field as Contact sets it, with its first option picked */
const Picked = ({ field }: { field: Choices }) => (
  <fieldset className="mg-field">
    <legend className="mg-field__label">{field.label}</legend>
    <div className="mg-toggles">
      {field.options.map((option, index) => (
        <label className="mg-toggle" key={option}>
          <input
            type={field.type}
            name={field.name}
            value={option}
            defaultChecked={index === 0}
          />
          <span>{option}</span>
        </label>
      ))}
    </div>
  </fieldset>
);

function Forms({ content }: SpecimenProps) {
  const [name, email, message] = formFields("contact");
  const choices = formFields("inquiry").filter(
    (field): field is Choices => field.kind === "choices"
  );
  const checkboxes = choices.find((field) => field.type === "checkbox");
  const radios = choices.findLast((field) => field.type === "radio");

  return (
    <SpecimenGrid min={280}>
      <Specimen
        label="Contact"
        note="Details and a switch beside the form, ruled off from 760px"
        wide
      >
        <ContactForm content={content} variant="contact" />
      </Specimen>
      <Specimen
        label="Project inquiry"
        note="Text, links, choices, a date, and a budget"
        wide
      >
        <ContactForm content={content} variant="inquiry" />
      </Specimen>
      <Specimen
        label="Field"
        note="A serif input on a hairline that thickens on focus"
      >
        <form>
          <FormField field={email} />
        </form>
      </Specimen>
      {name.kind === "input" && (
        <Specimen label="Field, filled">
          <form>
            <label className="mg-field">
              <span className="mg-field__label">{name.label}</span>
              <input
                className="mg-input"
                type={name.type}
                name={name.name}
                placeholder={name.placeholder}
                defaultValue={content.profile.name}
              />
            </label>
          </form>
        </Specimen>
      )}
      <Specimen label="Text area" note="Boxed in a hairline">
        <form>
          <FormField field={message} />
        </form>
      </Specimen>
      {checkboxes && (
        <Specimen label="Checkboxes" note="Pills that fill once picked">
          <form>
            <Picked field={checkboxes} />
          </form>
        </Specimen>
      )}
      {radios && (
        <Specimen label="Radios">
          <form>
            <Picked field={radios} />
          </form>
        </Specimen>
      )}
      <Specimen
        label="Newsletter"
        note="Closes the archive and posts that ask for it"
        wide
      >
        <Newsletter />
      </Specimen>
    </SpecimenGrid>
  );
}

function Wayfinding({ content, prose }: SpecimenProps) {
  const to = useTo();
  const nav = samplePostNav(content.posts);
  const post = content.posts[1];

  return (
    <>
      <Note>
        Monograph has no back links: the breadcrumb in each label leads back up,
        and the masthead’s navigation does the rest.
      </Note>
      <SpecimenGrid min={300}>
        <Specimen
          label="Breadcrumb"
          note="A post’s label: Writing, then its type"
        >
          <p className="mg-label">
            <Icon name="pen" />
            <a href={to("/archive/")}>Writing</a>
            {post.type && (
              <>
                <span aria-hidden="true">/</span>
                <a href={to(typePath(post.type))}>{post.type}</a>
              </>
            )}
          </p>
        </Specimen>
        <Specimen label="Breadcrumb, case study">
          <p className="mg-label">
            <Icon name="grid" />
            <a href={to("/portfolio/")}>Work</a>
            <span aria-hidden="true">/</span>
            Case study
          </p>
        </Specimen>
        <Specimen
          label="Previous and next"
          note="After posts and case studies; titles underline on hover"
          wide
        >
          <PostNav nav={nav} />
        </Specimen>
        <Specimen
          label="Next only"
          note="At the oldest post, the other half stays empty"
          wide
        >
          <PostNav nav={{ next: nav.next }} />
        </Specimen>
        {post.type && (
          <Specimen
            label="End of a post"
            note="Thanks, and more of its type; under the body from 960px"
            wide
          >
            <footer className="mg-post__footer">
              <p className="mg-copy">
                Thanks for reading. Questions or thoughts?{" "}
                <a href={to("/contact/")}>Get in touch</a>.
              </p>
              <MoreLink href={to(typePath(post.type))}>
                {`More ${post.type.toLowerCase()}s`}
              </MoreLink>
            </footer>
          </Specimen>
        )}
        <Specimen label="Contents" note="Opens a post, folded">
          <Contents html={prose} />
        </Specimen>
        <Specimen label="Contents, open" note="Its headings, nested">
          <Contents html={prose} open />
        </Specimen>
        <Specimen
          label="Switch"
          note="Contact and the project inquiry point to each other"
        >
          <div style={{ display: "grid", justifyItems: "start", gap: 12 }}>
            <MoreLink href={to("/project-inquiry/")}>
              Start a project inquiry instead
            </MoreLink>
            <MoreLink href={to("/contact/")}>Just saying hello?</MoreLink>
          </div>
        </Specimen>
        <Specimen label="Ways back" note="The 404 page’s links">
          <div className="mg-notFound__links">
            <MoreLink href={to("/")}>Front page</MoreLink>
            <MoreLink href={to("/archive/")}>Writing archive</MoreLink>
            <MoreLink href={to("/portfolio/")}>Case studies</MoreLink>
          </div>
        </Specimen>
      </SpecimenGrid>
    </>
  );
}

const Prose = ({ prose }: SpecimenProps) => (
  <SpecimenGrid>
    <Specimen
      label="Post body"
      note="Case studies and pages center the same column"
      wide
    >
      <HtmlContent className="mg-prose mg-post__body" html={prose} />
    </Specimen>
  </SpecimenGrid>
);

export const specimens: Specimens = {
  root: "mg",
  sections: {
    type: TypeScale,
    motifs: Motifs,
    imagery: Imagery,
    pageHeader: PageHeaders,
    actions: Actions,
    labels: Labels,
    surfaces: Surfaces,
    cards: Cards,
    lists: Lists,
    quotes: Quotes,
    forms: Forms,
    wayfinding: Wayfinding,
    prose: Prose
  }
};
