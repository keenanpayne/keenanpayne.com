import { SAMPLE_PAGES } from "../../registry";
import {
  formOf,
  Html,
  pad,
  postTypes,
  useSubmission,
  useTo,
  type SpecimenProps,
  type Specimens
} from "../../site";
import {
  SAMPLE_SKIES,
  samplePostNav,
  Specimen,
  SpecimenGrid,
  TypeSample
} from "../../styleguide/kit";

import { Billboard } from "./Billboard";
import { SKY } from "./Denver";
import { DOMES, Emblem, EMBLEMS } from "./emblems";
import {
  Chip,
  Discussion,
  Facts,
  floorOf,
  FormField,
  KANA,
  ledDate,
  LinkList,
  More,
  Newsletter,
  PageHeader,
  PageTable,
  PostList,
  PostNav,
  Quote,
  Section,
  ServiceList,
  Submit,
  Ticker,
  TONES,
  toneFor,
  WorkGrid
} from "./parts";
import { Skyline, Wires } from "./scene";

function TypeScale({ content }: SpecimenProps) {
  const { profile, posts, work } = content;
  const post = posts[1];

  return (
    <>
      <TypeSample label="Marquee">
        <p className="neon-hero__name" style={{ margin: 0 }}>
          {profile.name}
        </p>
      </TypeSample>
      <TypeSample label="Page title">
        <h1 className="neon-title">{post.title}</h1>
      </TypeSample>
      <TypeSample label="Lede">
        <Html as="p" className="neon-lede" html={profile.bio} />
      </TypeSample>
      <TypeSample label="Section sign">
        <h2 className="neon-section__title">Writing</h2>
      </TypeSample>
      <TypeSample label="Card title">
        <h3 className="neon-work__name neon-tone--cyan">
          <span style={{ color: "var(--neon-tone)" }}>{work[0].name}</span>
        </h3>
      </TypeSample>
      <TypeSample label="List title">
        <span className="neon-post__title">{post.title}</span>
      </TypeSample>
      <TypeSample label="Body">
        <p style={{ margin: 0 }}>{post.lede}</p>
      </TypeSample>
      <TypeSample label="Eyebrow">
        <p className="neon-eyebrow">{profile.role}</p>
      </TypeSample>
      <TypeSample label="Meta">
        <span className="neon-meta">{`${post.date} · ${post.type}`}</span>
      </TypeSample>
      <TypeSample label="LED">
        <time className="neon-post__date" dateTime={post.iso}>
          {ledDate(post.iso)}
        </time>
      </TypeSample>
      <TypeSample label="Shop sign">
        <span className="neon-vsign" style={{ writingMode: "horizontal-tb" }}>
          {KANA.writing}
        </span>
      </TypeSample>
    </>
  );
}

function Motifs({ content }: SpecimenProps) {
  return (
    <SpecimenGrid min={260}>
      <Specimen
        label="Emblems"
        note="Line art in the cyan-to-magenta gradient: services, page headers, the weather"
        wide
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))",
            gap: 24
          }}
        >
          {EMBLEMS.map((kind) => (
            <Emblem key={kind} kind={kind} label={kind} />
          ))}
        </div>
      </Specimen>
      <Specimen label="Domes" note="The footer’s horizon, reflected" wide>
        <div className="neon-footer__horizon" style={{ padding: 0 }}>
          {DOMES.map((kind) => (
            <Emblem key={kind} kind={kind} label={kind} />
          ))}
        </div>
      </Specimen>
      <Specimen
        label="Weather"
        note="An emblem for each sky in the readout"
        wide
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
            gap: 20
          }}
        >
          {SAMPLE_SKIES.filter((sky) => !sky.night).map((sky) => (
            <figure key={sky.label} style={{ textAlign: "center" }}>
              <Emblem kind={sky.condition ? SKY[sky.condition] : "rings"} />
              <figcaption className="neon-meta" style={{ marginTop: 8 }}>
                {sky.label}
              </figcaption>
            </figure>
          ))}
        </div>
      </Specimen>
      <Specimen
        label="Skyline"
        note="Drawn from a seed: Home’s, with rings and a light trail"
        wide
      >
        <div
          style={{
            height: 260,
            borderRadius: 8,
            overflow: "hidden",
            background: "var(--neon-dusk)"
          }}
        >
          <Skyline seed={1} trail rings />
        </div>
      </Specimen>
      <Specimen
        label="Shop signs"
        note="Section signs, lit in each tone, with floors"
      >
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          {TONES.slice(0, 3).map((tone, index) => (
            <div
              key={tone}
              className={`neon-section__sign neon-tone--${tone}`}
              style={{
                position: "static",
                flexDirection: "column",
                flexWrap: "nowrap",
                alignItems: "stretch",
                gap: 0,
                width: 72,
                overflow: "hidden",
                border: "2px solid var(--neon-tone)",
                borderRadius: 5,
                boxShadow: "var(--neon-tube-glow)"
              }}
            >
              <span className="neon-floor" style={{ borderRadius: 0 }}>
                {floorOf(index, 3)}
              </span>
              <span
                className="neon-section__title"
                style={{
                  writingMode: "vertical-rl",
                  margin: "0 auto",
                  padding: "18px 0",
                  fontSize: 30
                }}
              >
                {["Work", "Writing", "Services"][index]}
              </span>
            </div>
          ))}
          <span className="neon-vsign">{KANA.open}</span>
        </div>
      </Specimen>
      <Specimen label="Tones" note="Every sign is lit in one">
        <ul className="neon-chips" style={{ marginTop: 0 }}>
          {TONES.map((tone) => (
            <li key={tone}>
              <Chip tone={tone}>{tone}</Chip>
            </li>
          ))}
        </ul>
      </Specimen>
      <Specimen label="Ticker" note="Home’s latest titles, scrolling past" wide>
        <Ticker items={content.posts.slice(0, 6).map((post) => post.title)} />
      </Specimen>
      <Specimen label="Wires" note="Sagging over the header">
        <div style={{ position: "relative", height: 56 }}>
          <Wires />
        </div>
      </Specimen>
    </SpecimenGrid>
  );
}

function Imagery({ content }: SpecimenProps) {
  const { profile, work, testimonials } = content;
  const person = testimonials.find(
    (testimonial) => testimonial.person?.image
  )?.person;
  const photo = profile.photos[0];

  return (
    <SpecimenGrid min={240}>
      <Specimen
        label="LED billboard"
        note="The portrait as a mosaic of LEDs; hover to see the photo"
      >
        <Billboard src={profile.avatar} alt={profile.name}>
          <span className="neon-billboard__tag" aria-hidden="true">
            Live
          </span>
        </Billboard>
      </Specimen>
      <Specimen
        label="Cover"
        note="Work cards: a duotone LED screen, clear on hover"
      >
        <ul className="neon-works" style={{ gridTemplateColumns: "1fr" }}>
          <li className="neon-work neon-tone--cyan">
            <span className="neon-work__screen">
              <img src={work[0].cover} alt="" loading="lazy" />
            </span>
          </li>
        </ul>
      </Specimen>
      <Specimen label="Photo" note="About, with its caption">
        <figure className="neon-photo">
          <div className="neon-photo__screen">
            <img src={photo.src} alt={photo.alt} loading="lazy" />
          </div>
          <figcaption>{photo.alt}</figcaption>
        </figure>
      </Specimen>
      {person?.image && (
        <Specimen
          label="Avatar"
          note="Testimonials, ringed in the quote’s tone"
        >
          <div className="neon-quote neon-tone--pink">
            <figcaption style={{ marginTop: 0, paddingTop: 0, border: 0 }}>
              <img src={person.image} alt="" loading="lazy" />
              <span className="neon-quote__name">{person.name}</span>
            </figcaption>
          </div>
        </Specimen>
      )}
    </SpecimenGrid>
  );
}

function PageHeaders({ content }: SpecimenProps) {
  const to = useTo();
  const { posts } = content;
  const post = posts[1];

  return (
    <SpecimenGrid min={420}>
      <Specimen
        label="Article"
        note="Breadcrumb eyebrow, tube title, lede, facts, and its own skyline"
        wide
      >
        <PageHeader
          eyebrow={
            <>
              <a href={to("/archive/")}>Writing</a>
              {post.type && ` / ${post.type}`}
            </>
          }
          title={post.title}
          lede={post.lede}
          kana={KANA.post}
          emblem="mesh"
        >
          <Facts
            rows={[["Published", <time dateTime={post.iso}>{post.date}</time>]]}
          />
        </PageHeader>
      </Specimen>
    </SpecimenGrid>
  );
}

function Actions({ content }: SpecimenProps) {
  const to = useTo();
  const [type] = postTypes(content.posts);

  return (
    <SpecimenGrid min={220}>
      <Specimen label="Button" note="A lit tube; fills on hover">
        <button className="neon-button" type="button">
          {formOf("contact").submit}
        </button>
      </Specimen>
      <Specimen label="Ghost button" note="The second action, in cyan">
        <a className="neon-button neon-button--ghost" href={to("/contact/")}>
          Get in touch
        </a>
      </Specimen>
      <Specimen label="Text link" note="Magenta, glowing on hover">
        <p className="neon-lede" style={{ fontSize: 17 }}>
          A link to <a href={to("/about/")}>About</a> within a sentence.
        </p>
      </Specimen>
      <Specimen label="More link">
        <More href={type.url}>{`More ${type.text.toLowerCase()}s`}</More>
      </Specimen>
      <Specimen label="Chip link" note="Tags and post types">
        <Chip tone={toneFor(type.text)} href={type.url}>
          {type.text}
        </Chip>
      </Specimen>
      <Specimen label="Section link" note="A sign that links">
        <h2 className="neon-section__title neon-tone--cyan">
          <a href={to("/archive/")}>Writing</a>
        </h2>
      </Specimen>
    </SpecimenGrid>
  );
}

function Labels({ content }: SpecimenProps) {
  const post = content.posts[1];
  const types = postTypes(content.posts);

  return (
    <SpecimenGrid min={240}>
      <Specimen label="Eyebrow" note="With a blinking cursor">
        <p className="neon-eyebrow">{content.profile.role}</p>
      </Specimen>
      <Specimen label="Meta">
        <span className="neon-meta">
          <time dateTime={post.iso}>{post.date}</time>
          {post.type && ` · ${post.type}`}
        </span>
      </Specimen>
      <Specimen label="Floors" note="On every section’s sign, from the top">
        <div style={{ display: "flex", gap: 8 }}>
          {[0, 1, 2, 3, 4].map((index) => (
            <span
              key={index}
              className={`neon-floor neon-tone--${TONES[index]}`}
            >
              {floorOf(index, 4)}
            </span>
          ))}
        </div>
      </Specimen>
      <Specimen label="Counters" note="The writing archive’s header">
        <ul className="neon-counters" style={{ marginTop: 0 }}>
          <li>
            <span className="neon-counter">{content.posts.length}</span>{" "}
            articles
          </li>
        </ul>
      </Specimen>
      <Specimen
        label="Tags"
        note="Post types and tags, each in its own tone"
        wide
      >
        <LinkList links={types} label="Post types" />
      </Specimen>
    </SpecimenGrid>
  );
}

function Surfaces({ content }: SpecimenProps) {
  const post = content.posts[1];

  return (
    <SpecimenGrid min={320}>
      <Specimen
        label="Section"
        note="Under a vertical shop sign that rides along as it scrolls"
        wide
      >
        <Section title="Writing" kana={KANA.writing} floor="4F">
          <p>{post.lede}</p>
        </Section>
      </Specimen>
      <Specimen label="Lightbox" note="Pillars and the newsletter: a lit panel">
        <section className="neon-pillar neon-tone--amber">
          <h3 className="neon-pillar__title">
            <span className="neon-pillar__kana">{KANA.challenge}</span>
            The challenge
          </h3>
          <p>{post.lede}</p>
        </section>
      </Specimen>
      <Specimen label="Console" note="The contact forms’ panel">
        <div className="neon-console" style={{ marginTop: 0 }}>
          <p className="neon-console__head">
            <span>{formOf("contact").title}</span>
            <span>{KANA.contact}</span>
          </p>
          <p style={{ marginBottom: 0 }}>{post.lede}</p>
        </div>
      </Specimen>
    </SpecimenGrid>
  );
}

const Cards = ({ content }: SpecimenProps) => (
  <SpecimenGrid min={320}>
    <Specimen
      label="Work billboard"
      note="Cover on an LED screen, name in its tube, lede, industry and years"
      wide
    >
      <WorkGrid work={content.work.slice(0, 3)} />
    </Specimen>
    <Specimen
      label="Service"
      note="Each under its emblem; the card is the link"
      wide
    >
      <ServiceList services={content.services.slice(0, 4)} />
    </Specimen>
  </SpecimenGrid>
);

function Lists({ content }: SpecimenProps) {
  const to = useTo();
  const { profile, posts, work } = content;

  return (
    <SpecimenGrid min={340}>
      <Specimen
        label="Posts"
        note="A departure board: LED date, title, lede, type"
        wide
      >
        <PostList posts={posts.slice(0, 3)} />
      </Specimen>
      <Specimen label="Facts" note="A spec sheet">
        <Facts
          rows={profile.facts.map((fact) => [
            fact.label,
            fact.url ? <a href={fact.url}>{fact.text}</a> : fact.text
          ])}
        />
      </Specimen>
      <Specimen label="Directory" note="The portfolio’s index, by tenant">
        <table className="neon-table neon-directory">
          <thead>
            <tr>
              <th scope="col">Client</th>
              <th scope="col">Years</th>
            </tr>
          </thead>
          <tbody>
            {work.slice(0, 4).map((item, index) => (
              <tr
                key={item.url}
                className={`neon-tone--${TONES[(index + 1) % TONES.length]}`}
              >
                <th scope="row">
                  <a href={item.url}>{item.name}</a>
                </th>
                <td className="neon-directory__years">{item.year}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Specimen>
      <Specimen
        label="Metro line"
        note="How we’ll work together, stop by stop"
        wide
      >
        <ol className="neon-line">
          {profile.process.slice(0, 3).map((step, index) => (
            <li key={step.title} className="neon-line__stop">
              <span className="neon-line__number" aria-hidden="true">
                {pad(index + 1)}
              </span>
              <strong className="neon-line__title">{step.title}</strong>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </Specimen>
      <Specimen label="Table" note="Every page, by title and URL" wide>
        <PageTable
          pages={SAMPLE_PAGES.slice(0, 4).map((page) => ({
            title: page.label,
            url: to(page.path)
          }))}
        />
      </Specimen>
    </SpecimenGrid>
  );
}

function Quotes({ content }: SpecimenProps) {
  const [first, second] = content.testimonials.filter(
    (testimonial) => testimonial.person?.image
  );

  return (
    <SpecimenGrid min={320}>
      <Specimen label="Quote" note="A holographic screen, with a portrait">
        <Quote testimonial={first} tone="cyan" />
      </Specimen>
      {second && (
        <Specimen label="Quote" note="In the next tone">
          <Quote testimonial={second} tone="amber" />
        </Specimen>
      )}
    </SpecimenGrid>
  );
}

function Forms() {
  const contact = formOf("contact");
  const { props, hidden, status } = useSubmission("contact");

  return (
    <SpecimenGrid min={320}>
      <Specimen
        label="Contact form"
        note="formOf(“contact”), in its console"
        wide
      >
        <form
          className="neon-form neon-console"
          style={{ marginTop: 0 }}
          {...props}
        >
          {hidden}
          {contact.fields.map((field) => (
            <FormField key={field.name} field={field} />
          ))}
          <Submit label={contact.submit} status={status} />
        </form>
      </Specimen>
      <Specimen
        label="Choices"
        note="From the project inquiry: lit when picked"
      >
        <form className="neon-form">
          {formOf("inquiry")
            .fields.filter((field) => field.kind === "choices")
            .slice(0, 2)
            .map((field) => (
              <FormField key={field.name} field={field} />
            ))}
        </form>
      </Specimen>
      <Specimen label="Newsletter" note="A lightbox sign" wide>
        <Newsletter floor="B1" />
      </Specimen>
    </SpecimenGrid>
  );
}

function Wayfinding({ content }: SpecimenProps) {
  const to = useTo();
  const post = content.posts[1];

  return (
    <SpecimenGrid min={320}>
      <Specimen label="Breadcrumb" note="A page’s eyebrow">
        <p className="neon-eyebrow">
          <a href={to("/archive/")}>Writing</a>
          {post.type && ` / ${post.type}`}
        </p>
      </Specimen>
      <Specimen label="Ways out" note="Not found’s signs home">
        <ul
          className="neon-lost__ways"
          style={{ justifyContent: "start", marginTop: 0 }}
        >
          <li>
            <a href={to("/")}>
              <Emblem kind="arches" />
              Home
            </a>
          </li>
          <li>
            <a href={to("/archive/")}>
              <Emblem kind="comb" />
              Writing
            </a>
          </li>
        </ul>
      </Specimen>
      <Specimen
        label="Previous and next"
        note="Street signs at the end of a post"
        wide
      >
        <PostNav nav={samplePostNav(content.posts)} />
      </Specimen>
      <Specimen
        label="Comments"
        note="After a post that asks for them; the lab marks the thread’s place"
        wide
      >
        <Discussion url={post.url} floor="1F" />
      </Specimen>
    </SpecimenGrid>
  );
}

const Prose = ({ prose }: SpecimenProps) => (
  <Html className="neon-prose" html={prose} />
);

export default {
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
} satisfies Specimens;
