import {
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode
} from "react";

import { HtmlContent } from "../../../components/HtmlContent";
import type { LabContent, ProfileModel } from "../../../lib/types";
import {
  coordinates,
  formFields,
  Html,
  NAVIGATION,
  pad,
  postsByYear,
  postTypes,
  relabel,
  SAMPLE_PAGES,
  useLocalTime,
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

import { DenverClock, DenverNotes } from "./Denver";
import { FrontRange } from "./FrontRange";
import { Groundwork } from "./Groundwork";
import {
  Arrow,
  Button,
  Chips,
  Clients,
  Contents,
  Entries,
  Facts,
  FormField,
  Ledger,
  Mark,
  mockStatus,
  More,
  PageHeader,
  PageTable,
  PostNav,
  postItems,
  Quote,
  Quotes,
  Section,
  ServiceArt,
  ServiceCards,
  Signup,
  Stipple,
  Terrain,
  ViewSwitch,
  WorkCard
} from "./parts";
import { MenuDots } from "./Shell";
import { Strata } from "./Strata";

type Location = ProfileModel["location"];

type WorkView = "index" | "plates";

// As on the Work page
const WORK_VIEWS: { value: WorkView; label: string }[] = [
  { value: "index", label: "Index" },
  { value: "plates", label: "Plates" }
];

/* Context
   ==========================================================================
   Several parts change with the layout around them. These give a specimen
   that context without the page around it. */

/** The wide layout (Home, Work, Services), without its page padding */
const Wide = ({ children }: { children: ReactNode }) => (
  <div className="st-layout--wide" style={{ paddingRight: 0 }}>
    {children}
  </div>
);

/** The reading column, as wide as it is beside the rail */
const Column = ({ children }: { children: ReactNode }) => (
  <div className="st-column" style={{ maxWidth: 640 }}>
    {children}
  </div>
);

/** A sized frame for dot art, which fills whatever holds it */
const Frame = ({ ratio, children }: { ratio: string; children: ReactNode }) => (
  <div style={{ display: "grid", aspectRatio: ratio, overflow: "hidden" }}>
    {children}
  </div>
);

/** Small parts side by side */
const Row = ({
  align = "center",
  children
}: {
  align?: CSSProperties["alignItems"];
  children: ReactNode;
}) => (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      alignItems: align,
      gap: "12px 20px"
    }}
  >
    {children}
  </div>
);

// Field notes hang from the `--st-clock` anchor, which the Shell gives its
// header clock. Scoped to a specimen, they hang from the specimen instead.
const notesScope: CSSProperties = { anchorScope: "--st-clock" };
const notesAnchor: CSSProperties = { anchorName: "--st-clock" };

/** Stands in for the phone menu's reset of its lists and paragraphs */
const bare: CSSProperties = { margin: 0, padding: 0, listStyle: "none" };

const typeUrl = (type: string) => `/type/${type.toLowerCase()}s/`;

/* Type
   ========================================================================== */

function TypeScale({ content }: SpecimenProps) {
  const to = useTo();
  const time = useLocalTime({ seconds: true });
  const { profile, posts, work, services, testimonials } = content;
  const post = posts[1];
  const [client] = work;
  const [service] = services;
  const [quote] = testimonials;
  const [clock, period] = time?.split(" ") ?? [];

  return (
    <>
      <TypeSample label="Hero title">
        <span className="st-hero__title">{profile.role}</span>
      </TypeSample>
      <TypeSample label="Wordmark">
        <span className="st-hero__brand">
          <Mark />
          <span>{profile.name}</span>
        </span>
      </TypeSample>
      <TypeSample label="Page title">
        <Html as="h1" className="st-title" html={post.title} />
      </TypeSample>
      <TypeSample label="Lede">
        <p className="st-lede">{post.lede}</p>
      </TypeSample>
      <TypeSample label="Opening heading">
        <div className="st-intro">
          <header className="st-section__head">
            <h2>{profile.experience.text}</h2>
          </header>
        </div>
      </TypeSample>
      <TypeSample label="Section heading">
        <header className="st-section__head">
          <h2>Selected work</h2>
        </header>
      </TypeSample>
      <TypeSample label="Menu item">
        <span className="st-menu__text">Writing</span>
      </TypeSample>
      <TypeSample label="Client" measure=".st-clients__name">
        <Clients work={[client]} />
      </TypeSample>
      <TypeSample label="Index title">
        <Entries items={[{ url: post.url, title: post.title }]} />
      </TypeSample>
      <TypeSample label="Index title, medium">
        <Entries
          size="medium"
          items={[{ url: posts[0].url, title: posts[0].title }]}
        />
      </TypeSample>
      <TypeSample label="Card title">
        <h3 className="st-card__title">
          <a href={client.url}>{client.name}</a>
        </h3>
      </TypeSample>
      <TypeSample label="Plate title">
        <h3 className="st-plate__title">
          <a href={service.url}>{service.title}</a>
        </h3>
      </TypeSample>
      <TypeSample label="Rail title">
        <a className="st-reading__title" href={posts[2].url}>
          {posts[2].title}
        </a>
      </TypeSample>
      <TypeSample label="Article heading 3">
        <div className="st-prose">
          <h3>{posts[3].title}</h3>
        </div>
      </TypeSample>
      <TypeSample label="Article heading 4">
        <div className="st-prose">
          <h4>{posts[4].title}</h4>
        </div>
      </TypeSample>
      <TypeSample label="Pull quote">
        <div className="st-prose">
          <Html as="blockquote" html={quote.content} />
        </div>
      </TypeSample>
      <TypeSample label="Clock">
        <div className="st-den__clock">
          <time>{clock ?? "--:--:--"}</time>
          {period && <span>{period}</span>}
        </div>
      </TypeSample>
      <TypeSample label="Opening copy">
        <div className="st-intro">
          <Html className="st-copy" html={profile.bio} />
        </div>
      </TypeSample>
      <TypeSample label="Body">
        <Html className="st-copy" html={client.lede ?? ""} />
      </TypeSample>
      <TypeSample label="Article body">
        <div className="st-prose">
          <p>{post.lede}</p>
        </div>
      </TypeSample>
      <TypeSample label="Small copy">
        <p className="st-plate__text">{service.lede}</p>
      </TypeSample>
      <TypeSample label="Name">
        <span className="st-quote__name">{quote.person?.name}</span>
      </TypeSample>
      <TypeSample label="Crumbs">
        <p className="st-crumbs">
          <a href={to("/archive/")}>Writing</a>
          <span aria-hidden="true">/</span>
          <span>{post.type}</span>
        </p>
      </TypeSample>
      <TypeSample label="Notes">
        <p className="st-card__meta">
          <span>{client.industry}</span>
          <span>{client.year}</span>
        </p>
      </TypeSample>
    </>
  );
}

/* Motifs
   ========================================================================== */

/** One step of the frame's edge, as the Shell draws it */
const Step = ({ edge }: { edge: "top" | "bottom" }) => (
  <span className={`st-step st-step--${edge}`} aria-hidden="true">
    {edge === "top" ? (
      <>
        <span className="st-step__out" />
        <span className="st-step__line" />
        <span className="st-step__in" />
      </>
    ) : (
      <>
        <span className="st-step__in" />
        <span className="st-step__line" />
        <span className="st-step__out" />
      </>
    )}
  </span>
);

/**
 * The window in miniature: the Shell's tab, steps, and notches around an
 * empty page, with only Contact out in the notch, as on a phone
 */
function Window({ content }: { content: LabContent }) {
  const to = useTo();
  const { profile } = content;

  return (
    // Holds the frame's fixed parts, as the viewport would
    <div style={{ position: "relative", height: 220, contain: "layout" }}>
      <div className="st-top">
        <div className="st-top__tab">
          <a className="st-brand" href={to("/")}>
            <Mark />
            <span>{profile.name}</span>
          </a>
        </div>
        <Step edge="top" />
        <div className="st-nav">
          <ul>
            <li className="st-nav__ctaItem">
              <a className="st-nav__cta" href={to("/contact/")}>
                Contact
                <Arrow />
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="st-window" aria-hidden="true" />
      <div className="st-bottom">
        <div className="st-bottom__tab">
          <p>{`© ${new Date().getFullYear()}`}</p>
        </div>
        <Step edge="bottom" />
        <div className="st-bottom__content">
          <a className="st-bottom__name" href={to("/")}>
            {profile.name}
          </a>
        </div>
      </div>
    </div>
  );
}

/** The phone menu's toggle, which here only shows its two states */
function MenuToggle() {
  const [open, setOpen] = useState(false);

  return (
    <button
      type="button"
      className="st-nav__toggle"
      // Shown at every width, where the page only shows it on a phone
      style={{ display: "inline-flex" }}
      aria-expanded={open}
      onClick={() => setOpen(!open)}
    >
      <MenuDots />
      Menu
    </button>
  );
}

/** A clock that opens field notes of its own */
function Clock({ location }: { location: Location }) {
  const notes = useId();

  return (
    <div style={notesScope}>
      <div style={notesAnchor}>
        <DenverClock notes={notes} location={location} />
      </div>
      <DenverNotes id={notes} location={location} />
    </div>
  );
}

function Motifs({ content }: SpecimenProps) {
  const to = useTo();
  const { profile, work, services } = content;

  return (
    <>
      <SpecimenGrid>
        <Specimen
          label="Window"
          note="A hairline frame fixed over the page: its top edge steps down around the navigation, its bottom edge up around the footer"
          wide
        >
          <Window content={content} />
        </Specimen>
      </SpecimenGrid>

      <SpecimenGrid min={200}>
        <Specimen label="Wordmark" note="Header and footer">
          <Row>
            <a className="st-brand" href={to("/")}>
              <Mark />
              <span>{profile.name}</span>
            </a>
            <a className="st-bottom__name" href={to("/")}>
              {profile.name}
            </a>
          </Row>
        </Specimen>
        <Specimen label="Mark" note="A halftone moon, lit from the upper left">
          <Row>
            <Mark />
            <Mark className="st-clients__mark" />
          </Row>
        </Specimen>
        <Specimen
          label="Phases"
          note="Seeded by a name, each lit from its own side"
        >
          <Row>
            {work.slice(0, 6).map((item) => (
              <Mark
                key={item.url}
                className="st-clients__mark"
                seed={item.name}
              />
            ))}
          </Row>
        </Specimen>
        <Specimen label="Arrows" note="Circled, beside a way somewhere">
          <Row>
            <Arrow />
            <Arrow down />
          </Row>
        </Specimen>
        <Specimen label="Menu dots" note="Phone only; open, they keep a cross">
          <MenuToggle />
        </Specimen>
        <Specimen
          label="Clock"
          note="Denver time; opens field notes with the sky there now"
        >
          <Clock location={profile.location} />
        </Specimen>
      </SpecimenGrid>

      <SpecimenGrid min={240}>
        <Specimen
          label="Terrain · field"
          note="Even ground: a rail’s art, a post without an image"
        >
          <Frame ratio="4 / 3">
            <Terrain seed={to("/project-inquiry/")} scale={120} />
          </Frame>
        </Specimen>
        <Specimen
          label="Terrain · isle"
          note="Frays at its edges: the phone menu’s floor, the 404"
        >
          <Frame ratio="4 / 3">
            <Terrain seed={profile.name} shape="isle" scale={180} />
          </Frame>
        </Specimen>
        <Specimen
          label="Terrain · drift"
          note="Banked to the upper right: the hero’s ground"
        >
          <Frame ratio="4 / 3">
            <Terrain seed={profile.name} shape="drift" scale={340} />
          </Frame>
        </Specimen>
      </SpecimenGrid>

      <SpecimenGrid min={220}>
        {services.slice(0, 3).map((service) => (
          <Specimen
            key={service.url}
            label="Service scene"
            note={service.title}
          >
            <Frame ratio="4 / 3">
              <ServiceArt url={service.url} />
            </Frame>
          </Specimen>
        ))}
        <Specimen label="No scene yet" note="An isle of its own">
          <Frame ratio="4 / 3">
            <ServiceArt url={to("/services/")} />
          </Frame>
        </Specimen>
      </SpecimenGrid>

      <SpecimenGrid min={420}>
        <Specimen
          label="Groundwork"
          note="Home: drift ground, surveyed and built on in a loop; a mouse looks beneath it"
          wide
        >
          <Frame ratio="21 / 9">
            <Groundwork seed={profile.name} scale={340} />
          </Frame>
        </Specimen>
        <Specimen
          label="Front Range"
          note="Contact: the view west from Denver, as it is now"
        >
          <FrontRange location={profile.location} />
        </Specimen>
        <Specimen
          label="Strata"
          note="About: a bed a year; point at one for what it holds"
        >
          <Strata content={content} />
        </Specimen>
      </SpecimenGrid>
    </>
  );
}

/* Imagery
   ========================================================================== */

function Imagery({ content }: SpecimenProps) {
  const { profile, work, testimonials } = content;
  const [client, second, third] = work;
  const face = testimonials.find(
    (testimonial) => testimonial.person?.image
  )?.person;
  const photo = profile.photos[1] ?? profile.photos[0];

  return (
    <SpecimenGrid min={260}>
      <Specimen
        label="Photographs"
        note="About: every photo stippled, 4:5, captioned in mono"
        wide
      >
        <Column>
          <div className="st-photos">
            {profile.photos.map((photo) => (
              <figure key={photo.src}>
                <Stipple src={photo.src} alt={photo.alt} />
                <figcaption>{photo.alt}</figcaption>
              </figure>
            ))}
          </div>
        </Column>
      </Specimen>
      <Specimen
        label="Cover"
        note="A case study’s cover; hover for the Original switch"
        wide
      >
        <Column>
          <Stipple className="st-cover" src={client.cover} toggle />
        </Column>
      </Specimen>
      <Specimen label="Linked" note="Under a link, in color on hover">
        <a className="st-card__art" href={second.url} tabIndex={-1}>
          <Stipple src={second.cover} alt={second.name} />
        </a>
      </Specimen>
      <Specimen label="Gallery" note="A case study’s figures, with Original">
        <div className="st-gallery">
          <figure>
            <Stipple src={third.cover} alt={third.name} toggle />
            <figcaption>
              <span>{third.name}</span>
              {third.lede && <Html as="span" html={third.lede} />}
            </figcaption>
          </figure>
        </div>
      </Specimen>
      <Specimen label="Dot 2" note="Photos, covers, and plates">
        <Frame ratio="1">
          <Stipple src={profile.avatar} alt={profile.name} />
        </Frame>
      </Specimen>
      <Specimen label="Dot 1" note="Thumbnails and faces">
        <Frame ratio="1">
          <Stipple src={profile.avatar} alt={profile.name} dot={1} />
        </Frame>
      </Specimen>
      {face?.image && (
        <Specimen label="Face" note="Testimonials, 40px round">
          <Stipple className="st-quote__face" src={face.image} dot={1} />
        </Specimen>
      )}
      <Specimen
        label="In an article"
        note="Not stippled: olive duotone, in color on hover"
      >
        <div className="st-prose">
          <figure>
            <img src={photo.src} alt={photo.alt} loading="lazy" />
            <figcaption>{photo.alt}</figcaption>
          </figure>
        </div>
      </Specimen>
    </SpecimenGrid>
  );
}

/* Page headers
   ========================================================================== */

function PageHeaders({ content }: SpecimenProps) {
  const to = useTo();
  const copy = useRef<HTMLDivElement>(null);
  const lost = useId();
  const [view, setView] = useState<WorkView>("index");
  const { profile, posts, work, services } = content;
  const post = posts[1];
  const [client] = work;
  const [service] = services;
  const industries = new Set(work.map((item) => item.industry).filter(Boolean));

  return (
    <SpecimenGrid>
      <Specimen
        label="Hero"
        note="Home: ground built on above the name, the role, and two ways in"
        wide
      >
        {/* Clips the ground, which reaches up behind the window's tab */}
        <div style={{ overflow: "hidden" }}>
          {/* As tall as a short window, where the page fills the window */}
          <header className="st-hero" style={{ minHeight: 600 }}>
            <Groundwork
              className="st-hero__terrain"
              seed={profile.name}
              scale={340}
              avoid={copy}
            />
            <div ref={copy} className="st-hero__copy">
              <h1>
                <span className="st-hero__brand">
                  <Mark />
                  <span>{profile.name}</span>
                </span>
                <span className="st-hero__title">{profile.role}</span>
              </h1>
              <p className="st-hero__actions">
                <Button href={to("/project-inquiry/")}>Start a project</Button>
                <Button href={to("/portfolio/")} ghost>
                  See the work
                </Button>
              </p>
            </div>
          </header>
        </div>
      </Specimen>

      <Specimen
        label="Article"
        note="A post: crumbs, title, lede, and notes over a rule, in the reading column"
        wide
      >
        <Column>
          <PageHeader
            crumbs={
              <>
                <a href={to("/archive/")}>Writing</a>
                {post.type && (
                  <>
                    <span aria-hidden="true">/</span>
                    <a href={to(typeUrl(post.type))}>{post.type}</a>
                  </>
                )}
              </>
            }
            title={post.title}
            lede={post.lede}
          >
            <p className="st-pageMeta">
              <time dateTime={post.iso}>{post.date}</time>
            </p>
          </PageHeader>
        </Column>
      </Specimen>

      <Specimen label="Case study" note="Its industry and years as notes" wide>
        <Column>
          <PageHeader
            crumbs={
              <>
                <a href={to("/portfolio/")}>Work</a>
                <span aria-hidden="true">/</span>
                <span>Case study</span>
              </>
            }
            title={client.name}
            lede={client.lede}
          >
            <p className="st-pageMeta">
              <span>{client.industry}</span>
              <span>{client.year}</span>
            </p>
          </PageHeader>
        </Column>
      </Specimen>

      <Specimen
        label="Across the window"
        note="A service: on wide screens, the title on the left and the lede and a call on the right, over its scene"
        wide
      >
        <Wide>
          <PageHeader
            crumbs={
              <>
                <a href={to("/services/")}>Services</a>
                <span aria-hidden="true">/</span>
                <span>Service</span>
              </>
            }
            title={service.title}
            lede={service.lede}
          >
            <p className="st-actions">
              <Button href={to("/project-inquiry/")} arrow>
                Start a project
              </Button>
            </p>
          </PageHeader>
          <ServiceArt className="st-cover" url={service.url} />
        </Wide>
      </Specimen>

      <Specimen
        label="With a view switch"
        note="Work: counts in its notes, and how to show them"
        wide
      >
        <Wide>
          <PageHeader title="Work">
            <p className="st-pageMeta">
              <span>{`${work.length} case studies`}</span>
              <span>{`${industries.size} industries`}</span>
              <ViewSwitch
                label="Show the work as"
                views={WORK_VIEWS}
                value={view}
                onChange={setView}
              />
            </p>
          </PageHeader>
        </Wide>
      </Specimen>

      <Specimen
        label="Vista"
        note="About and Contact open across the window, reaching up behind its tab; About’s is Strata, Contact’s the Front Range"
        wide
      >
        {/* Clips the view where it reaches up behind the tab */}
        <div style={{ overflow: "hidden" }}>
          <Strata className="st-vista" content={content} />
        </div>
      </Specimen>

      <Specimen
        label="Not found"
        note="An isle, then the title in italic and three ways back"
        wide
      >
        {/* Its own height, where the page fills the window */}
        <section
          className="st-lost"
          style={{ minHeight: 0 }}
          aria-labelledby={lost}
        >
          <Terrain
            className="st-lost__terrain"
            seed="404"
            shape="isle"
            scale={240}
          />
          <div className="st-lost__copy">
            <p className="st-crumbs">Error 404</p>
            <h1 id={lost} className="st-lost__title">
              Uncharted ground
            </h1>
            <p className="st-lede">
              This page may have moved, or never existed.
            </p>
            <p className="st-actions">
              <Button href={to("/")}>Home</Button>
              <Button href={to("/archive/")} ghost>
                Writing
              </Button>
              <Button href={to("/portfolio/")} ghost>
                Work
              </Button>
            </p>
          </div>
        </section>
      </Specimen>
    </SpecimenGrid>
  );
}

/* Buttons and links
   ========================================================================== */

function Actions({ content }: SpecimenProps) {
  const to = useTo();

  return (
    <SpecimenGrid min={200}>
      <Specimen label="Button" note="The page’s first call; olive on hover">
        <Button href={to("/project-inquiry/")}>Start a project</Button>
      </Specimen>
      <Specimen label="Ghost" note="A second way, beside it">
        <Button href={to("/portfolio/")} ghost>
          See the work
        </Button>
      </Specimen>
      <Specimen label="With an arrow" note="Services and a service">
        <Button href={to("/project-inquiry/")} arrow>
          Start a project
        </Button>
      </Specimen>
      <Specimen label="Small" note="In sections and cards">
        <Button href={to("/about/")} small>
          More about me
        </Button>
      </Specimen>
      <Specimen label="Submit" note="A form’s button">
        <button className="st-button" type="button">
          Send message
        </button>
      </Specimen>
      <Specimen label="More" note="Beside a section’s title, or a lede">
        <Row>
          <More href={to("/portfolio/")}>All work</More>
          <More href={to("/project-inquiry/")}>
            Start a project inquiry instead
          </More>
        </Row>
      </Specimen>
      <Specimen label="Actions" note="A row of them: the 404" wide>
        <p className="st-actions">
          <Button href={to("/")}>Home</Button>
          <Button href={to("/archive/")} ghost>
            Writing
          </Button>
          <Button href={to("/portfolio/")} ghost>
            Work
          </Button>
        </p>
      </Specimen>
      <Specimen
        label="Text link"
        note="In copy: a faint underline that darkens on hover"
        wide
      >
        <Html className="st-copy" html={content.profile.bio} />
      </Specimen>
    </SpecimenGrid>
  );
}

/* Labels
   ========================================================================== */

function Labels({ content }: SpecimenProps) {
  const to = useTo();
  const { posts, work, testimonials } = content;
  const post = posts[1];
  const [client] = work;
  const person = testimonials.find(
    (testimonial) => testimonial.person?.position
  )?.person;
  const types = postTypes(posts).map((type) => ({
    text: type,
    url: to(typeUrl(type))
  }));

  return (
    <SpecimenGrid min={220}>
      <Specimen label="Crumbs" note="The eyebrow over a page’s title">
        <p className="st-crumbs">
          <a href={to("/archive/")}>Writing</a>
          {post.type && (
            <>
              <span aria-hidden="true">/</span>
              <a href={to(typeUrl(post.type))}>{post.type}</a>
            </>
          )}
        </p>
      </Specimen>
      <Specimen label="Page notes" note="Under a lede, over a rule">
        <p className="st-pageMeta">
          <span>{client.industry}</span>
          <span>{client.year}</span>
        </p>
      </Specimen>
      <Specimen label="Card notes" note="A plate’s industry and years">
        <p className="st-card__meta">
          <span>{client.industry}</span>
          <span>{client.year}</span>
        </p>
      </Specimen>
      <Specimen label="Entry notes" note="Type and date, beside a title">
        <p className="st-entry__meta">
          <span>{post.type}</span>
          <time dateTime={post.iso}>{post.iso}</time>
        </p>
      </Specimen>
      <Specimen label="Rail notes" note="Recommended reading">
        <p className="st-reading__meta">
          <time dateTime={post.iso}>{post.date}</time>
          <span>{post.type}</span>
        </p>
      </Specimen>
      <Specimen label="Counts" note="A step, and the ledger’s plate">
        <Row align="baseline">
          <span className="st-steps__count">{pad(1)}</span>
          <span className="st-ledger__count">
            {`${pad(1)} / ${pad(work.length)}`}
          </span>
        </Row>
      </Specimen>
      {person && (
        <Specimen label="Byline" note="Under a quote">
          <span className="st-quote__name">{person.name}</span>
          <span className="st-quote__role">{person.position}</span>
        </Specimen>
      )}
      <Specimen label="Chips" note="Post types and tags, as links" wide>
        <Chips label="Post types" links={types} />
      </Specimen>
      <Specimen
        label="Chips, plain"
        note="Without links, e.g. the qualities clients mention most"
        wide
      >
        <Chips
          label="Technologies"
          links={client.technologies.map((text) => ({ text }))}
        />
      </Specimen>
    </SpecimenGrid>
  );
}

/* Sections and panels
   ========================================================================== */

/** The note in Contact's rail; Project inquiry's has ground over it */
function DirectLine({
  profile,
  art
}: {
  profile: ProfileModel;
  art?: boolean;
}) {
  const to = useTo();
  const id = useId();
  const time = useLocalTime();
  const { email, location } = profile;

  return (
    <section className="st-railNote" aria-labelledby={id}>
      {art && (
        <Terrain
          className="st-railNote__art"
          seed={to("/project-inquiry/")}
          scale={120}
        />
      )}
      <h2 id={id}>Direct line</h2>
      <Facts
        rows={[
          ["Email", <a href={`mailto:${email}`}>{email}</a>],
          ["Based in", location.name],
          ["Local time", time ? `${time} (${location.timeZoneName})` : "—"]
        ]}
      />
    </section>
  );
}

function Surfaces({ content }: SpecimenProps) {
  const to = useTo();
  const id = useId();
  const { profile, posts } = content;

  return (
    <>
      <Note>
        The window itself is under Motifs, and its one floating panel, Denver’s
        field notes, opens from the clock there.
      </Note>
      <SpecimenGrid min={220}>
        <Specimen
          label="Section"
          note="A hairline over each, 80px apart; a quiet link beside the title"
          wide
        >
          <Column>
            <Section
              id={`${id}writing`}
              title="Writing"
              action={<More href={to("/archive/")}>Archive</More>}
            >
              <Entries items={postItems(posts.slice(0, 3))} size="medium" />
            </Section>
          </Column>
        </Specimen>
        <Specimen
          label="Split"
          note="Home’s opening: on wide screens, the heading on the left and its copy on the right, set larger"
          wide
        >
          <Wide>
            <Section
              id={`${id}hello`}
              className="st-split st-intro"
              title={profile.experience.text}
            >
              <Html className="st-copy" html={profile.bio} />
              <p className="st-actions">
                <Button href={to("/about/")} small>
                  More about me
                </Button>
              </p>
            </Section>
          </Wide>
        </Specimen>
        <Specimen label="Rail note" note="Contact, beside the form">
          <DirectLine profile={profile} />
        </Specimen>
        <Specimen label="Rail note, with ground" note="Project inquiry">
          <DirectLine profile={profile} art />
        </Specimen>
      </SpecimenGrid>
    </>
  );
}

/* Cards
   ========================================================================== */

function Cards({ content }: SpecimenProps) {
  const id = useId();
  const { posts, work, services } = content;
  // Two with images, then one without, which gets ground instead
  const reading = [
    ...posts.filter((post) => post.image).slice(0, 2),
    ...posts.filter((post) => !post.image).slice(0, 1)
  ];

  return (
    <SpecimenGrid min={220}>
      <Specimen
        label="Work cards"
        note="Home: three across, their ways in lined up along the bottom"
        wide
      >
        <Wide>
          <div className="st-cards">
            {work.slice(0, 3).map((item) => (
              <WorkCard key={item.url} item={item} />
            ))}
          </div>
        </Wide>
      </Specimen>
      <Specimen
        label="Work card"
        note="Work, as plates: one to a row in the reading column"
        wide
      >
        <Column>
          <div className="st-cards">
            <WorkCard item={work[3] ?? work[0]} />
          </div>
        </Column>
      </Specimen>
      <Specimen
        label="Service plates"
        note="Services and Home: a scene, a title, and a line"
        wide
      >
        <Wide>
          <ServiceCards services={services} />
        </Wide>
      </Specimen>
      <Specimen
        label="Recommended reading"
        note="Beside a post; ground where a post has no image"
      >
        <section className="st-reading" aria-labelledby={id}>
          <h2 id={id}>Recommended reading</h2>
          <ul>
            {reading.map((post) => (
              <li key={post.url}>
                <a
                  className="st-reading__art"
                  href={post.url}
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  {post.image ? (
                    <Stipple src={post.image} />
                  ) : (
                    <Terrain seed={post.url} scale={120} />
                  )}
                </a>
                <a className="st-reading__title" href={post.url}>
                  {post.title}
                </a>
                <p className="st-reading__meta">
                  <time dateTime={post.iso}>{post.date}</time>
                  {post.type && <span>{post.type}</span>}
                </p>
                {post.lede && <p className="st-reading__lede">{post.lede}</p>}
              </li>
            ))}
          </ul>
        </section>
      </Specimen>
    </SpecimenGrid>
  );
}

/* Lists and tables
   ========================================================================== */

function Lists({ content }: SpecimenProps) {
  const to = useTo();
  const time = useLocalTime();
  const { profile, posts, work, services, socials } = content;
  const [client] = work;

  return (
    <SpecimenGrid min={400}>
      <Specimen
        label="Ledger"
        note="Work, as an index: point at a name and its plate is held beside the roll; narrow, each name has a thumbnail and lede"
        wide
      >
        <Wide>
          <Ledger work={work} />
        </Wide>
      </Specimen>
      <Specimen
        label="Index"
        note="The writing archive: titles large, notes on the right"
        wide
      >
        <Column>
          <Entries items={postItems(posts.slice(0, 4))} />
        </Column>
      </Specimen>
      <Specimen
        label="Index, across the window"
        note="Home: on wide screens, title, lede, and notes in a row between rules"
        wide
      >
        <Wide>
          <Entries items={postItems(posts.slice(0, 4))} size="medium" />
        </Wide>
      </Specimen>
      <Specimen
        label="Index without notes"
        note="A service’s other services: title and lede side by side"
        wide
      >
        <Wide>
          <Entries
            size="medium"
            items={services.slice(1, 4).map((service) => ({
              url: service.url,
              title: service.title,
              sub: service.lede
            }))}
          />
        </Wide>
      </Specimen>
      <Specimen label="Elsewhere" note="About: each profile with its host">
        <Entries
          size="medium"
          items={socials.map((social) => ({
            url: social.url,
            title: social.text,
            meta: [new URL(social.url).hostname.replace(/^www\./, "")]
          }))}
        />
      </Specimen>
      <Specimen label="Clients" note="Work, as plates: a moon for each name">
        <Clients work={work.slice(0, 5)} />
      </Specimen>
      <Specimen label="Facts" note="About: terms in mono">
        <Facts
          rows={[
            ...relabel(profile.facts, { location: "Home base" }).map(
              (fact): [string, ReactNode] => [
                fact.label,
                fact.url ? <a href={fact.url}>{fact.text}</a> : fact.text
              ]
            ),
            ["Coordinates", coordinates(profile.location)],
            ["Local time", time ?? "—"]
          ]}
        />
      </Specimen>
      <Specimen label="Details" note="The end of a case study">
        <Facts
          rows={[
            ["Industry", client.industry],
            ["Years", client.year],
            ["Services", client.services.join(", ")],
            ["Technologies", client.technologies.join(", ")]
          ]}
        />
      </Specimen>
      <Specimen
        label="Steps"
        note="Services: numbered, over an inked rule; four across on wide screens"
        wide
      >
        <Wide>
          <ol className="st-steps">
            {profile.process.map((step, index) => (
              <li key={step.title}>
                <span className="st-steps__count">{pad(index + 1)}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </Wide>
      </Specimen>
      <Specimen label="Table" note="Every page, by title and URL" wide>
        <Column>
          <PageTable
            pages={SAMPLE_PAGES.slice(0, 5).map((page) => ({
              title: page.label,
              url: to(page.path)
            }))}
          />
        </Column>
      </Specimen>
    </SpecimenGrid>
  );
}

/* Testimonials
   ========================================================================== */

function KindWords({ content }: SpecimenProps) {
  const { testimonials } = content;
  const [first] = testimonials;
  // The same words without a photo, as some testimonials come
  const faceless = {
    ...first,
    person: first.person && { ...first.person, image: undefined }
  };

  return (
    <SpecimenGrid min={300}>
      <Specimen
        label="Quote"
        note="An olive mark over the words, a face by the name"
      >
        <Quote testimonial={first} />
      </Specimen>
      <Specimen label="Quote, no face" note="When there’s no photo">
        <Quote testimonial={faceless} />
      </Specimen>
      <Specimen
        label="Kind words"
        note="Testimonials: two columns in the reading column"
        wide
      >
        <Column>
          <Quotes testimonials={testimonials} />
        </Column>
      </Specimen>
      <Specimen
        label="Kind words, across the window"
        note="Home, Work, and Services: up to three columns"
        wide
      >
        <Wide>
          <Quotes testimonials={testimonials} />
        </Wide>
      </Specimen>
    </SpecimenGrid>
  );
}

/* Forms
   ========================================================================== */

function Forms() {
  const [sent, setSent] = useState<"contact" | "inquiry">();
  const picked = useId();
  const budget = formFields("inquiry").find(
    (field) => field.kind === "choices" && field.type === "radio" && field.wide
  );

  return (
    <SpecimenGrid min={300}>
      {(["contact", "inquiry"] as const).map((kind) => (
        <Specimen
          key={kind}
          label={kind === "contact" ? "Contact form" : "Project inquiry"}
          note={
            kind === "contact"
              ? "Two columns, the message across both"
              : "Choices as pills; pick any or one"
          }
          wide
        >
          <Column>
            <form
              className="st-form"
              onSubmit={(event) => {
                event.preventDefault();
                setSent(kind);
              }}
            >
              {formFields(kind).map((field) => (
                <FormField key={field.name} field={field} />
              ))}
              <p className="st-form__submit">
                <button className="st-button" type="submit">
                  {kind === "contact" ? "Send message" : "Send inquiry"}
                </button>
                <span role="status">{mockStatus(sent === kind)}</span>
              </p>
            </form>
          </Column>
        </Specimen>
      ))}
      {budget?.kind === "choices" && (
        <Specimen label="Choices, picked" note="Filled with ink">
          <fieldset className="st-field">
            <legend>{budget.label}</legend>
            <span className="st-field__choices">
              {budget.options.map((option, index) => (
                <label key={option} className="st-choice">
                  <input
                    type="radio"
                    name={picked}
                    value={option}
                    defaultChecked={index === 1}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </span>
          </fieldset>
        </Specimen>
      )}
      <Specimen label="Sign-up" note="New writing, by email: a post’s end">
        <p className="st-copy">
          Articles and tutorials, sent when they’re published.
        </p>
        <Signup />
      </Specimen>
      <Specimen
        label="Sign-up, compact"
        note="Footer and phone menu; sending says so above it"
      >
        {/* Room for that note */}
        <div style={{ paddingTop: 36 }}>
          <Signup compact />
        </div>
      </Specimen>
    </SpecimenGrid>
  );
}

/* Wayfinding
   ========================================================================== */

/** The writing archive in brief: years down the column, Contents beside */
function Archive({ content }: { content: LabContent }) {
  const id = useId();
  const years = postsByYear(content.posts);
  const shown = years.slice(0, 3);
  const chapters = shown.map(([year]) => ({ id: `${id}${year}`, label: year }));

  return (
    // The layout's column and rail, side by side where there's room
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-start",
        gap: "0 64px"
      }}
    >
      <div className="st-column" style={{ flex: "1 1 360px", maxWidth: 640 }}>
        <PageHeader title="Writing">
          <p className="st-pageMeta">
            <span>{`${content.posts.length} articles · ${years.length} years`}</span>
            <span>{postTypes(content.posts).join(", ")}</span>
          </p>
        </PageHeader>
        {shown.map(([year, posts], index) => (
          <Section key={year} id={chapters[index].id} title={year}>
            <Entries items={postItems(posts.slice(0, 2))} />
          </Section>
        ))}
      </div>
      <aside className="st-rail" style={{ flex: "0 0 200px" }}>
        <Contents chapters={chapters} />
      </aside>
    </div>
  );
}

/** The phone menu's index, footer, and clock, outside the window it fills */
function MenuIndex({ content }: { content: LabContent }) {
  const to = useTo();
  const notes = useId();
  const { profile, socials } = content;
  const navigation = NAVIGATION.map((item) => ({
    text: item.text,
    url: to(item.path),
    current: item.path === "/about/"
  }));

  return (
    <div style={{ maxWidth: 390, ...notesScope }}>
      <p className="st-menu__label" style={{ margin: 0 }}>
        <span>Index</span>
        <span>{`${navigation.length} pages`}</span>
      </p>
      <ol className="st-menu__list" style={bare}>
        {navigation.map((item, index) => (
          <li key={item.url} style={{ "--st-i": index } as CSSProperties}>
            <a href={item.url} aria-current={item.current ? "page" : undefined}>
              <span className="st-menu__number">{pad(index + 1)}</span>
              <span className="st-menu__text">{item.text}</span>
              {item.current ? (
                <Mark seed={item.url} className="st-menu__here" />
              ) : (
                <Arrow />
              )}
            </a>
          </li>
        ))}
      </ol>
      <div className="st-menu__foot">
        <ul className="st-menu__links" style={bare}>
          {socials.map((social) => (
            <li key={social.url}>
              <a href={social.url} rel={social.rel}>
                {social.text}
              </a>
            </li>
          ))}
          <li>
            <a href="/feed.xml">RSS</a>
          </li>
        </ul>
        <Signup compact />
        <p className="st-menu__meta" style={{ ...bare, ...notesAnchor }}>
          <DenverClock notes={notes} location={profile.location} />
          <span>{`© ${new Date().getFullYear()} ${profile.name}`}</span>
        </p>
      </div>
      <DenverNotes id={notes} location={profile.location} />
    </div>
  );
}

function Wayfinding({ content }: SpecimenProps) {
  const to = useTo();
  const [view, setView] = useState<WorkView>("index");
  const post = content.posts[1];
  const nav = samplePostNav(content.posts);

  return (
    <>
      <SpecimenGrid min={240}>
        <Specimen label="Crumbs" note="A post: the archive, then its type">
          <p className="st-crumbs">
            <a href={to("/archive/")}>Writing</a>
            {post.type && (
              <>
                <span aria-hidden="true">/</span>
                <a href={to(typeUrl(post.type))}>{post.type}</a>
              </>
            )}
          </p>
        </Specimen>
        <Specimen label="Crumbs" note="A case study, under Work">
          <p className="st-crumbs">
            <a href={to("/portfolio/")}>Work</a>
            <span aria-hidden="true">/</span>
            <span>Case study</span>
          </p>
        </Specimen>
        <Specimen label="Crumbs" note="Project inquiry, under Contact">
          <p className="st-crumbs">
            <a href={to("/contact/")}>Contact</a>
            <span aria-hidden="true">/</span>
            <span>Project inquiry</span>
          </p>
        </Specimen>
        <Specimen label="Crumbs, on their own" note="Contact, and the 404">
          <p className="st-crumbs">
            <span>Contact</span>
          </p>
        </Specimen>
        <Specimen label="View switch" note="Work: as an index, or as plates">
          <ViewSwitch
            label="Show the work as"
            views={WORK_VIEWS}
            value={view}
            onChange={setView}
          />
        </Specimen>
        <Specimen
          label="Previous and next"
          note="The end of a post or case study"
          wide
        >
          <PostNav nav={nav} />
        </Specimen>
      </SpecimenGrid>

      <SpecimenGrid min={420}>
        {nav.previous && (
          <Specimen label="Previous only" note="The newest has no next">
            <PostNav nav={{ previous: nav.previous }} />
          </Specimen>
        )}
        {nav.next && (
          <Specimen label="Next only" note="The oldest has no previous">
            <PostNav nav={{ next: nav.next }} />
          </Specimen>
        )}
      </SpecimenGrid>

      <SpecimenGrid>
        <Specimen
          label="Contents"
          note="Wide screens: the rail marks the section being read as you scroll"
          wide
        >
          <Archive content={content} />
        </Specimen>
        <Specimen
          label="Phone menu"
          note="The pages as an index that fills the window, the current one in italic with its moon"
          wide
        >
          <MenuIndex content={content} />
        </Specimen>
      </SpecimenGrid>
    </>
  );
}

/* Prose
   ========================================================================== */

const Prose = ({ prose }: SpecimenProps) => (
  <article className="st-post">
    <HtmlContent className="st-prose" html={prose} />
  </article>
);

export const specimens: Specimens = {
  root: "st",
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
    quotes: KindWords,
    forms: Forms,
    wayfinding: Wayfinding,
    prose: Prose
  }
};
