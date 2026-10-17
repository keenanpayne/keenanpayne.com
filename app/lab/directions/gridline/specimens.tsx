import { getDirection, SAMPLE_PAGES } from "../../registry";
import type { Condition } from "../../site";
import {
  formOf,
  Html,
  postTypes,
  useTo,
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

import { SkySketch } from "./Denver";
import {
  DEFAULT_TREATMENT,
  ServiceArt,
  TREATMENTS,
  type TreatmentId
} from "./ServiceArt";
import {
  Arrow,
  Band,
  Blueprint,
  Button,
  Cells,
  Chips,
  Cta,
  CTAS,
  DEFAULT_CTA,
  Eyebrow,
  Facts,
  Form,
  FormField,
  Mark,
  MARKS,
  More,
  Newsletter,
  PageHeader,
  PageTable,
  PostNav,
  PostRows,
  ProcessSteps,
  Quote,
  Rays,
  SectionHead,
  ServiceCells,
  Stat,
  Terminal,
  Trail,
  Window,
  WorkCards,
  type CtaId,
  type MarkId
} from "./parts";

// The direction's name, read from the registry rather than written into
// the copy
const NAME = getDirection("gridline")!.name;

function TypeScale({ content }: SpecimenProps) {
  const { profile, posts } = content;
  const post = posts[1];

  return (
    <>
      <TypeSample label="Display" measure="h1">
        <h1 className="gl-display" style={{ marginInline: 0 }}>
          {profile.role}
        </h1>
      </TypeSample>
      <TypeSample label="Page title">
        <h1 className="gl-title">{post.title}</h1>
      </TypeSample>
      <TypeSample label="Lede">
        <Html as="p" className="gl-lede" html={profile.bio} />
      </TypeSample>
      <TypeSample label="Section heading">
        <h2 className="gl-heading">Recent writing</h2>
      </TypeSample>
      <TypeSample label="Item heading">
        <h3 className="gl-row__title">{post.title}</h3>
      </TypeSample>
      <TypeSample label="Body">
        <p className="gl-prose" style={{ margin: 0 }}>
          {post.lede}
        </p>
      </TypeSample>
      <TypeSample label="Eyebrow" measure="span">
        <p className="gl-eyebrow">
          <span>{profile.role}</span>
        </p>
      </TypeSample>
      <TypeSample label="Label">
        <p className="gl-label">Published</p>
      </TypeSample>
      <TypeSample label="Meta">
        <span className="gl-meta">{`${post.date} · ${post.type}`}</span>
      </TypeSample>
      <TypeSample label="Figure">
        <span className="gl-stat__value">{profile.experience.years}</span>
      </TypeSample>
    </>
  );
}

/** Every sky the Denver readout can sketch */
const SKIES: { condition?: Condition; night: boolean; label: string }[] = [
  { condition: "clear", night: false, label: "Clear" },
  { condition: "clear", night: true, label: "Clear night" },
  { condition: "cloudy", night: false, label: "Cloudy" },
  { condition: "cloudy", night: true, label: "Cloudy night" },
  { condition: "fog", night: false, label: "Fog" },
  { condition: "rain", night: false, label: "Rain" },
  { condition: "snow", night: false, label: "Snow" },
  { condition: "storm", night: false, label: "Thunderstorm" },
  { night: false, label: "Reading the sky" }
];

function Motifs({ content }: SpecimenProps) {
  return (
    <SpecimenGrid min={300}>
      <Specimen
        label="Rails and crosses"
        note="Bands between hairlines; a cross where each meets a rail"
        wide
      >
        <div className="gl-frame" style={{ minHeight: 0 }}>
          <Band label="Band">
            <p className="gl-pad gl-meta" style={{ margin: 0 }}>
              A band
            </p>
          </Band>
          <Band label="Band">
            <p className="gl-pad gl-meta" style={{ margin: 0 }}>
              The next band
            </p>
          </Band>
        </div>
      </Specimen>
      <Specimen label="Cells" note="Items share their hairlines" wide>
        <Cells cols={4}>
          {["One", "Two", "Three", "Four", "Five"].map((label) => (
            <li key={label} className="gl-cell gl-cell--pad gl-meta">
              {label}
            </li>
          ))}
        </Cells>
      </Specimen>
      <Specimen label="Light rays" note="Case study covers and the 404">
        <Rays>
          <div style={{ height: 220 }} />
        </Rays>
      </Specimen>
      <Specimen label="Tinted rays" note="A case study’s own color">
        <Rays tint="#f06a6a">
          <div style={{ height: 220 }} />
        </Rays>
      </Specimen>
      <Specimen
        label="Terminal"
        note="Home: the profile, then each section, on the Blueprint grid"
        wide
      >
        <Blueprint className="gl-hero__panel">
          <Terminal content={content} />
        </Blueprint>
      </Specimen>
      {Object.entries(MARKS).map(([id, mark]) => (
        <Specimen
          key={id}
          label={`Mark exploration: ${mark.name}`}
          note={`${mark.note}; not in use`}
        >
          <div className="gl-mark-sample">
            <span className="gl-brand">
              <Mark variant={id as MarkId} />
              {content.profile.name}
            </span>
            <span className="gl-mark-sample__large">
              <Mark variant={id as MarkId} />
            </span>
          </div>
        </Specimen>
      ))}
      {SKIES.map(({ condition, night, label }) => (
        <Specimen
          key={`${condition}${night}`}
          label={`Sky: ${label}`}
          note="The Denver readout, opened from the header clock"
        >
          <div className="gl-den__sky" data-night={night || undefined}>
            <SkySketch condition={condition} night={night} />
            <p className="gl-den__condition">{label}</p>
          </div>
        </Specimen>
      ))}
      <Specimen label="Wordmark" note="The footer’s last line" wide>
        <p className="gl-wordmark" aria-hidden="true">
          {content.profile.name}
        </p>
      </Specimen>
    </SpecimenGrid>
  );
}

function Imagery({ content }: SpecimenProps) {
  const { profile, work, testimonials, services } = content;
  const person = testimonials.find(
    (testimonial) => testimonial.person?.image
  )?.person;
  const photo = profile.photos[1] ?? profile.photos[0];

  return (
    <SpecimenGrid min={260}>
      <Specimen label="Portrait" note="Terminal and About, grayscale">
        <img
          className="gl-about__portrait"
          src={profile.avatar}
          alt={profile.name}
        />
      </Specimen>
      <Specimen label="Cover" note="Inset in a work card, 16:9">
        <Cells cols={2}>
          <li className="gl-cell gl-work">
            <span className="gl-work__media" style={{ paddingBottom: 20 }}>
              <img src={work[0].cover} alt="" loading="lazy" />
            </span>
          </li>
        </Cells>
      </Specimen>
      <Specimen
        label="Browser window"
        note="A case study’s cover, on its rays"
        wide
      >
        <Rays className="gl-case-cover">
          <Window address={work[0].name.toLowerCase()}>
            <img className="gl-window__media" src={work[0].cover} alt="" />
          </Window>
        </Rays>
      </Specimen>
      <Specimen label="Photo" note="About, captioned in mono">
        <figure className="gl-photo">
          <img src={photo.src} alt={photo.alt} loading="lazy" />
          <figcaption>{photo.alt}</figcaption>
        </figure>
      </Specimen>
      {person?.image && (
        <Specimen label="Avatar" note="Testimonials, 40px round">
          <div className="gl-quote">
            <figcaption>
              <img src={person.image} alt="" loading="lazy" />
              <span>
                <span className="gl-quote__name">{person.name}</span>
              </span>
            </figcaption>
          </div>
        </Specimen>
      )}
      {Object.entries(TREATMENTS).map(([id, treatment]) => (
        <Specimen
          key={id}
          label={`Service illustrations: ${treatment.name}${id === DEFAULT_TREATMENT ? " (in use)" : ""}`}
          note={`${treatment.note} · ?illo=${id}`}
          wide
        >
          <ul className="gl-illos">
            {services.map((service) => (
              <li key={service.url}>
                <ServiceArt url={service.url} treatment={id as TreatmentId} />
                <span className="gl-meta">{service.title}</span>
              </li>
            ))}
          </ul>
        </Specimen>
      ))}
    </SpecimenGrid>
  );
}

function PageHeaders({ content }: SpecimenProps) {
  const to = useTo();
  const { profile, posts } = content;
  const post = posts[1];

  return (
    <SpecimenGrid min={420}>
      <Specimen
        label="Home"
        note="Centered eyebrow, display, lede, actions"
        wide
      >
        <header className="gl-band gl-hero">
          <Eyebrow>
            {profile.name}
            <span className="gl-eyebrow__sep" aria-hidden="true">
              /
            </span>
            {profile.location.name}
          </Eyebrow>
          <h1 className="gl-display">{profile.role}</h1>
          <Html as="p" className="gl-lede" html={profile.bio} />
          <div className="gl-actions">
            <Button>
              Start a project <Arrow />
            </Button>
            <Button variant="ghost">See the work</Button>
          </div>
        </header>
      </Specimen>
      <Specimen
        label="Article"
        note="Breadcrumb, title, lede, and an aside of facts"
        wide
      >
        <PageHeader
          eyebrow={
            <Trail
              links={[
                { text: "Writing", url: to("/archive/") },
                ...(post.type && post.typeUrl
                  ? [{ text: post.type, url: post.typeUrl }]
                  : [])
              ]}
            />
          }
          title={post.title}
          lede={post.lede}
          aside={
            <Facts
              rows={[
                ["Published", <time dateTime={post.iso}>{post.date}</time>],
                ["Reading", "6 min"]
              ]}
            />
          }
        />
      </Specimen>
    </SpecimenGrid>
  );
}

function Actions({ content }: SpecimenProps) {
  const to = useTo();
  const [type] = postTypes(content.posts);

  return (
    <SpecimenGrid min={220}>
      <Specimen label="Button" note="Ink fill">
        <Button>
          {formOf("contact").submit} <Arrow />
        </Button>
      </Specimen>
      <Specimen label="Ghost button" note="Hairline outline">
        <Button variant="ghost">See the work</Button>
      </Specimen>
      <Specimen label="Small button" note="The header’s call to action">
        <Button size="small">Start a project</Button>
      </Specimen>
      <Specimen label="On the rays" note="Light in either scheme">
        <Rays>
          <div className="gl-actions" style={{ margin: 0, padding: 24 }}>
            <Button>Start a project</Button>
            <Button variant="ghost">Email</Button>
          </div>
        </Rays>
      </Specimen>
      <Specimen label="More link" note="Mono, in a bordered tab">
        <More href={type.url}>{`More ${type.text.toLowerCase()}s`}</More>
      </Specimen>
      <Specimen label="Text link" note="Violet underline, thicker on hover">
        <p className="gl-prose" style={{ margin: 0 }}>
          A link to <a href={to("/about/")}>About</a> within a sentence.
        </p>
      </Specimen>
    </SpecimenGrid>
  );
}

function Labels({ content }: SpecimenProps) {
  const post = content.posts[1];
  const types = postTypes(content.posts);

  return (
    <SpecimenGrid min={240}>
      <Specimen label="Eyebrow" note="Violet square, mono capitals">
        <Eyebrow>{content.profile.role}</Eyebrow>
      </Specimen>
      <Specimen label="Numbered eyebrow" note="A home page section">
        <Eyebrow index={1}>Writing</Eyebrow>
      </Specimen>
      <Specimen label="Meta">
        <span className="gl-meta">
          <time dateTime={post.iso}>{post.date}</time>
          {post.type && ` · ${post.type}`}
        </span>
      </Specimen>
      <Specimen label="Tag" note="A post’s type, in a row">
        <span className="gl-tag">{post.type}</span>
      </Specimen>
      <Specimen label="Chips" note="Post types, with counts" wide>
        <Chips
          label="Post types"
          links={types.map((type) => ({
            ...type,
            count: content.posts.filter((item) => item.type === type.text)
              .length
          }))}
        />
      </Specimen>
    </SpecimenGrid>
  );
}

function Surfaces({ content }: SpecimenProps) {
  const to = useTo();
  const post = content.posts[1];

  return (
    <SpecimenGrid min={320}>
      <Specimen
        label="Section head"
        note="Eyebrow and heading, note and link"
        wide
      >
        <SectionHead
          index={1}
          eyebrow="Writing"
          title="Recent writing"
          description="Essays on craft and career, and tutorials from the work."
          more={{ text: "All writing", url: to("/archive/") }}
        />
      </Specimen>
      <Specimen label="Inverted band" note="The page’s other scheme" wide>
        <Band invert label="Inverted">
          <div className="gl-pad">
            <Eyebrow>Inverted</Eyebrow>
            <p style={{ margin: 0 }}>{post.lede}</p>
          </div>
        </Band>
      </Specimen>
      <Specimen label="Figures" note="Big numerals over mono labels" wide>
        <Cells cols={4}>
          <Stat
            value={content.profile.experience.years}
            label="Years on the web"
          />
          <Stat value={content.work.length} label="Case studies" />
          <Stat value={content.posts.length} label="Articles" />
          <Stat value="5,280" label="Feet up" />
        </Cells>
      </Specimen>
      {Object.entries(CTAS).map(([id, cta]) => (
        <Specimen
          key={id}
          label={`Call to action: ${cta.name}${id === DEFAULT_CTA ? " (in use)" : ""}`}
          note={`${cta.note} · ?cta=${id}`}
          wide
        >
          <Cta email={content.profile.email} variant={id as CtaId} />
        </Specimen>
      ))}
    </SpecimenGrid>
  );
}

const Cards = ({ content }: SpecimenProps) => (
  <SpecimenGrid min={320}>
    <Specimen
      label="Work card"
      note="Inset cover, industry and years, name, lede"
      wide
    >
      <WorkCards work={content.work.slice(0, 2)} />
    </Specimen>
    <Specimen label="Service cell" note="Number, title, lede, link" wide>
      <ServiceCells services={content.services.slice(0, 3)} />
    </Specimen>
    <Specimen label="Process" note="Services: the steps in a row" wide>
      <ProcessSteps steps={content.profile.process} />
    </Specimen>
  </SpecimenGrid>
);

function Lists({ content }: SpecimenProps) {
  const to = useTo();
  const { profile, posts } = content;

  return (
    <SpecimenGrid min={340}>
      <Specimen label="Post rows" note="Date, title and lede, type" wide>
        <PostRows posts={posts.slice(0, 3)} />
      </Specimen>
      <Specimen
        label="Year"
        note="The writing archive: a year beside its posts"
        wide
      >
        <div className="gl-year__grid">
          <h2 className="gl-year__label">
            <span>{posts[0].year}</span>
            <span className="gl-meta">2 posts</span>
          </h2>
          <PostRows
            posts={posts
              .filter((post) => post.year === posts[0].year)
              .slice(0, 2)}
          />
        </div>
      </Specimen>
      <Specimen label="Facts" note="Mono terms over hairlines" wide>
        <Facts
          rows={profile.facts.map((fact) => [
            fact.label,
            fact.url ? <a href={fact.url}>{fact.text}</a> : fact.text
          ])}
        />
      </Specimen>
      <Specimen label="Table" note="Every page, by title and path" wide>
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
      <Specimen label="Quote" note="Serif, with a portrait">
        <Quote testimonial={first} />
      </Specimen>
      {second && (
        <Specimen label="Quote">
          <Quote testimonial={second} />
        </Specimen>
      )}
      <Specimen label="Pull quote" note="A case study’s testimonial" wide>
        <Band invert label="Testimonial">
          <div className="gl-pad">
            <Quote testimonial={first} large />
          </div>
        </Band>
      </Specimen>
    </SpecimenGrid>
  );
}

function Forms() {
  const contact = formOf("contact");

  return (
    <SpecimenGrid min={320}>
      <Specimen
        label="Contact form"
        note="formOf(“contact”): fields as cells"
        wide
      >
        <Form fields={contact.fields} submit={contact.submit} />
      </Specimen>
      <Specimen label="Choices" note="From the project inquiry" wide>
        <form className="gl-form">
          <Cells cols={2} as="div">
            {formOf("inquiry")
              .fields.filter((field) => field.kind === "choices")
              .slice(0, 2)
              .map((field) => (
                <FormField key={field.name} field={{ ...field, wide: true }} />
              ))}
          </Cells>
        </form>
      </Specimen>
      <Specimen label="Newsletter" wide>
        <Newsletter />
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
        <Eyebrow>
          <Trail
            links={[{ text: "Writing", url: to("/archive/") }]}
            current={post.type}
          />
        </Eyebrow>
      </Specimen>
      <Specimen
        label="Contents"
        note="A post’s left rail; the current section in ink"
      >
        <nav className="gl-contents" aria-label="On this page">
          <p className="gl-label">On this page</p>
          <ol>
            <li>
              <a href="#gl-sample" aria-current="true">
                Getting started
              </a>
              <ol>
                <li>
                  <a href="#gl-sample">Markup</a>
                </li>
              </ol>
            </li>
            <li>
              <a href="#gl-sample">Conclusion</a>
            </li>
          </ol>
        </nav>
      </Specimen>
      <Specimen label="Previous and next" note="The end of a post" wide>
        <PostNav nav={samplePostNav(content.posts)} />
      </Specimen>
    </SpecimenGrid>
  );
}

const Prose = ({ prose }: SpecimenProps) => (
  <>
    <Note>
      {NAME} sets articles in Instrument Sans at 18px, between outlined margins;
      second-level headings draw a rule across the column.
    </Note>
    <Html className="gl-prose" html={prose} />
  </>
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
