import { useId, useState, type CSSProperties, type ReactNode } from "react";

import { HtmlContent } from "../../../components/HtmlContent";
import {
  formFields,
  Html,
  NAVIGATION,
  pad,
  postsByYear,
  readingMinutes,
  relabel,
  useTo,
  type SpecimenProps,
  type Specimens,
  type View,
  type ViewKind
} from "../../site";
import {
  Note,
  samplePostNav,
  Specimen,
  SpecimenGrid,
  TypeSample
} from "../../styleguide/kit";

import { Address, FACT_LABELS } from "./pages/About";
import { Calendar, DESCRIPTIONS } from "./pages/Archive";
import { FormField } from "./pages/Contact";
import { Logotype } from "./pages/Home";
import { splitTopics, TYPE_COLORS } from "./pages/Post";
import { serviceItem, Worlds } from "./pages/Services";
import { Launch } from "./pages/Work";
import {
  Ad,
  BackLink,
  Badge,
  Banner,
  BubbleCard,
  ContentKey,
  Directory,
  Feature,
  Features,
  GameCard,
  Go,
  GoDot,
  Heading,
  Icon,
  ItemIcon,
  JumpMenu,
  KeySection,
  LinkCard,
  Mascot,
  Mosaic,
  NewsList,
  Newsletter,
  Pill,
  PostCard,
  postNews,
  PostNav,
  Quote,
  QuotePromo,
  Rating,
  RATING_TYPES,
  ratingOf,
  SideGroup,
  SideList,
  Sprite,
  TagStrip,
  Tile,
  TitleBar,
  Tri,
  typePath,
  WorkCard,
  type AdName,
  type Post
} from "./parts";
import {
  Chips,
  Elsewhere,
  Hire,
  isCodeBank,
  RAIL,
  sceneFor,
  Search,
  SIDE_BUTTONS,
  ZONE_ITEMS
} from "./Shell";
import {
  DIE,
  FACE,
  GO,
  ICONS,
  INFO,
  ITEMS,
  MONITOR,
  pixelNumber,
  type IconName,
  type Item
} from "./sprites";

//
// Contexts
// --------

/** The play field's width in a full frame, so wide parts keep their size */
const FIELD = 912;

/** The periwinkle play field every page sits on; most parts expect its ink */
const Field = ({
  id,
  width = FIELD,
  children
}: {
  /** Makes it a content key topic, scrolled to clear the guide's toolbar */
  id?: string;
  width?: number;
  children: ReactNode;
}) => (
  <div
    className="pt-main"
    id={id}
    style={{ maxWidth: width, scrollMarginTop: id && 120 }}
  >
    {children}
  </div>
);

/** The side column, at its width beside a post or case study */
const Side = ({ children }: { children: ReactNode }) => (
  <div className="pt-columns__side" style={{ maxWidth: 196 }}>
    {children}
  </div>
);

/** A few small parts side by side */
const Row = ({ children }: { children: ReactNode }) => (
  <div
    style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}
  >
    {children}
  </div>
);

//
// Samples
// -------

/** `sceneFor` only reads a view's kind */
const viewOf = (kind: ViewKind) => ({ kind }) as View;

/** Each part of the site, for the mascot's lines and the side column */
const SCENES: { label: string; kind: ViewKind }[] = [
  { label: "Home", kind: "home" },
  { label: "Work and case studies", kind: "work" },
  { label: "Writing", kind: "writing" },
  { label: "Post", kind: "post" },
  { label: "Services", kind: "services" },
  { label: "Testimonials", kind: "testimonials" },
  { label: "Contact", kind: "contact" },
  { label: "Other pages", kind: "about" },
  { label: "Not found", kind: "notFound" }
];

/** The newest post of each rating, so every badge and banner color shows */
const oneOfEach = (posts: Post[]) =>
  RATING_TYPES.flatMap((type) => {
    const post = posts.find((candidate) => candidate.type === type);
    return post ? [post] : [];
  });

/** The first `<tag>` in some HTML, without its id */
const firstTag = (html: string, tag: string) =>
  new RegExp(`<${tag}[\\s>][\\s\\S]*?</${tag}>`)
    .exec(html)?.[0]
    .replace(/\sid="[^"]*"/g, "");

//
// Inline parts
// ------------
// Markup the Shell and pages compose in place rather than export

/**
 * The site map's zone buttons, as the phone menu lists them, without the
 * open menu around them
 */
function Zones({ current }: { current?: string }) {
  const to = useTo();

  return (
    <ul className="pt-map__zones">
      {NAVIGATION.map((item, index) => {
        const zoneItem = ZONE_ITEMS[item.path];
        const isCurrent = item.path === current;
        return (
          <li key={item.path} style={{ "--pt-i": index } as CSSProperties}>
            <a
              href={to(item.path)}
              aria-current={isCurrent ? "page" : undefined}
            >
              <span className="pt-map__well">
                {zoneItem && <ItemIcon item={zoneItem} />}
              </span>
              <span className="pt-map__text">{item.text}</span>
              {isCurrent && <span className="pt-map__here">You are here</span>}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

/** A post's banner, as Post renders it; `picture` false shows the stand-in */
function PostBanner({
  post,
  picture = true
}: {
  post: Post;
  picture?: boolean;
}) {
  const rating = ratingOf(post.type);

  return (
    <Banner
      color={TYPE_COLORS[post.type ?? ""]}
      logo={post.type ?? "Article"}
      title={<h1 className="pt-banner__title">{post.title}</h1>}
      lede={post.lede && <p>{post.lede}</p>}
      image={
        picture && post.image ? (
          <img src={post.image} alt="" />
        ) : (
          <span className="pt-banner__art">
            <Sprite art={ITEMS[rating.item]} scale={9} />
          </span>
        )
      }
      tab={`${post.type ?? "Article"} overview`}
    />
  );
}

//
// Type
// ----

function TypeScale({ content, prose }: SpecimenProps) {
  const { profile, posts, work } = content;
  const post = posts[1];
  const [year, ofYear] = postsByYear(posts)[0];
  const scene = sceneFor(viewOf("home"), "/", profile);
  const to = useTo();
  // Post sets each h2 as a box title; the rest stay in the prose
  const headings = ["h2", "h3", "h4"].flatMap((tag) => {
    const html = firstTag(prose, tag);
    return html ? [{ tag, html }] : [];
  });

  return (
    <>
      <TypeSample label="Logotype" measure=".pt-logotype">
        <div className="pt-hero">
          <div className="pt-hero__screen" style={{ minHeight: 0 }}>
            <div className="pt-hero__copy">
              <Logotype lines={profile.name.split(" ")} />
            </div>
          </div>
        </div>
      </TypeSample>
      <TypeSample label="Banner logo" measure=".pt-banner__logo">
        <header
          className="pt-banner"
          style={{ "--banner": TYPE_COLORS[post.type ?? ""] } as CSSProperties}
        >
          <div className="pt-banner__main">
            <p className="pt-banner__logo">{post.type ?? "Article"}</p>
          </div>
        </header>
      </TypeSample>
      <TypeSample label="Title bar" measure=".pt-title__text">
        <TitleBar title="Writing" />
      </TypeSample>
      <TypeSample label="Nav link" measure=".pt-nav a">
        <nav className="pt-nav" aria-label="Main" style={{ marginLeft: 0 }}>
          <ul>
            {NAVIGATION.map((item) => (
              <li key={item.path}>
                <a href={to(item.path)}>{item.text}</a>
              </li>
            ))}
          </ul>
        </nav>
      </TypeSample>
      <TypeSample label="Zone button" measure=".pt-map__text">
        <div style={{ maxWidth: 360 }}>
          <Zones />
        </div>
      </TypeSample>
      <TypeSample label="Section heading" measure=".pt-heading__text">
        <Field>
          <Heading>Latest news</Heading>
        </Field>
      </TypeSample>
      <TypeSample label="Directory tab" measure=".pt-dir__title span">
        <h2 className="pt-dir__title">
          <Sprite art={ITEMS.star} scale={4} className="pt-dir__star" />
          <span>Player profile</span>
        </h2>
      </TypeSample>
      <TypeSample label="Side group" measure=".pt-acc__title">
        <Side>
          <SideGroup title="File data">{null}</SideGroup>
        </Side>
      </TypeSample>
      <TypeSample label="Tile head" measure=".pt-tile__head">
        <ul className="pt-tiles">
          <Tile title={work[0].name} icon="case" />
        </ul>
      </TypeSample>
      <TypeSample label="World title" measure=".pt-worlds__title">
        <Worlds steps={profile.process.slice(0, 1)} />
      </TypeSample>
      <TypeSample label="Masthead" measure=".pt-promo__masthead">
        <p className="pt-promo__masthead">
          <span className="pt-masthead">KP</span> E-mail News
        </p>
      </TypeSample>
      <TypeSample label="Archive year" measure=".pt-rows__year">
        <div className="pt-rows">
          <h3 className="pt-rows__year">
            {year}
            <span>
              {ofYear.length} article{ofYear.length === 1 ? "" : "s"}
            </span>
          </h3>
        </div>
      </TypeSample>
      <TypeSample label="Rating letter" measure=".pt-badge__big">
        <Rating type={post.type} />
      </TypeSample>

      <TypeSample label="Page heading" measure=".pt-intro__heading">
        <Field>
          <div className="pt-intro">
            <h2 className="pt-intro__heading">{post.title}</h2>
          </div>
        </Field>
      </TypeSample>
      <TypeSample label="Top story" measure=".pt-feature__title">
        <article className="pt-feature">
          <div className="pt-feature__body">
            <h2 className="pt-feature__title">
              <a href={post.url}>{post.title}</a>
            </h2>
          </div>
        </article>
      </TypeSample>
      <TypeSample label="Box title" measure=".pt-keysec__title">
        <div className="pt-keysec">
          <div className="pt-keysec__head">
            <h2 className="pt-keysec__title">{post.title}</h2>
          </div>
        </div>
      </TypeSample>
      {headings.map(({ tag, html }) => (
        <TypeSample
          key={tag}
          label={`Prose ${tag}`}
          measure={`.pt-prose ${tag}`}
        >
          <KeySection>
            <HtmlContent className="pt-prose" html={html} />
          </KeySection>
        </TypeSample>
      ))}
      <TypeSample label="Body" measure=".pt-prose p">
        <KeySection>
          <div className="pt-prose">
            <p>{post.lede}</p>
          </div>
        </KeySection>
      </TypeSample>
      <TypeSample label="Lede" measure=".pt-intro__lede">
        <Field>
          <Html as="p" className="pt-intro__lede" html={profile.bio} />
        </Field>
      </TypeSample>
      <TypeSample label="Card title" measure=".pt-game__title">
        <article className="pt-game">
          <div className="pt-game__foot">
            <GoDot />
            <h3 className="pt-game__title">
              <a href={post.url}>{post.title}</a>
            </h3>
          </div>
        </article>
      </TypeSample>
      <TypeSample label="Card copy" measure=".pt-game__copy">
        <article className="pt-game">
          <div className="pt-game__foot">
            <p className="pt-game__copy">{post.lede}</p>
          </div>
        </article>
      </TypeSample>
      <TypeSample label="News item" measure=".pt-news__text">
        <NewsList items={postNews(posts.slice(0, 1))} />
      </TypeSample>
      <TypeSample label="Field label" measure=".pt-field__label">
        <div className="pt-form">
          <FormField field={formFields("contact")[0]} />
        </div>
      </TypeSample>
      <TypeSample label="Button" measure=".pt-go">
        <Go type="button" />
      </TypeSample>
      <TypeSample label="Note" measure=".pt-note">
        <p className="pt-note">
          Mockup only — this form doesn’t send anything.
        </p>
      </TypeSample>
      <TypeSample label="Fine print" measure=".pt-fineprint">
        <Field>
          <p className="pt-fineprint">
            Ratings are issued by the KPRB ({profile.name} Rating Board), which
            is entirely made up.
          </p>
        </Field>
      </TypeSample>

      <TypeSample label="Speech bubble" measure=".pt-bubble">
        <p className="pt-bubble">{scene.bubble}</p>
      </TypeSample>
      <TypeSample label="Pixel label" measure=".pt-pill__text">
        <Pill href={to(scene.cta.path)} icon={scene.cta.icon}>
          {scene.cta.text}
        </Pill>
      </TypeSample>
      <TypeSample label="Error word" measure=".pt-404__word">
        <Field>
          <p className="pt-404__word">
            Error
            <span>Page not found</span>
          </p>
        </Field>
      </TypeSample>
    </>
  );
}

//
// Motifs
// ------

const BADGE_SPRITES = [
  { label: "Go dot", art: GO },
  { label: "Info", art: INFO },
  { label: "Face card", art: FACE },
  { label: "Monitor", art: MONITOR },
  { label: "Die", art: DIE }
];

const AD_NOTES: Record<AdName, string> = {
  first: "Links to the project inquiry",
  news: "Links to the newsletter",
  suck: "Links to services"
};

function Motifs({ content }: SpecimenProps) {
  const { profile } = content;

  return (
    <>
      <SpecimenGrid>
        <Specimen
          label="Interface icons"
          note="9×9 in the text color, here at 3×"
          wide
        >
          <SpecimenGrid min={88}>
            {(Object.keys(ICONS) as IconName[]).map((name) => (
              <Specimen key={name} label={name}>
                <Sprite art={ICONS[name]} scale={3} />
              </Specimen>
            ))}
          </SpecimenGrid>
        </Specimen>
        <Specimen
          label="Power-ups"
          note="7×7 items the mascot holds up, in news rows and stand-ins, at 3×"
          wide
        >
          <SpecimenGrid min={88}>
            {(Object.keys(ITEMS) as Item[]).map((item) => (
              <Specimen key={item} label={item}>
                <ItemIcon item={item} />
              </Specimen>
            ))}
          </SpecimenGrid>
        </Specimen>
        <Specimen
          label="Badge sprites"
          note="Colored sprites for go, info, home page, platform, and the bubble card, at 3×"
          wide
        >
          <SpecimenGrid min={88}>
            {BADGE_SPRITES.map(({ label, art }) => (
              <Specimen key={label} label={label}>
                <Sprite art={art} scale={3} />
              </Specimen>
            ))}
          </SpecimenGrid>
        </Specimen>
        <Specimen
          label="Rating boxes"
          note="Every post type’s KPRB rating, and the other boxes"
          wide
        >
          <SpecimenGrid min={88}>
            {RATING_TYPES.map((type) => (
              <Specimen key={type} label={type}>
                <Rating type={type} />
              </Specimen>
            ))}
            <Specimen label="Pending">
              <Rating />
            </Specimen>
            <Specimen label="Everyone" note="Home">
              <Badge big="E" title="Rated E for Everyone" />
            </Specimen>
            <Specimen label="Case" note="Work">
              <Badge big="01" small="Case" />
            </Specimen>
          </SpecimenGrid>
        </Specimen>
        <Specimen label="Marks" wide>
          <SpecimenGrid min={88}>
            <Specimen label="Triple bars" note="Headings">
              <span
                className="pt-heading__bars"
                style={{ display: "block" }}
                aria-hidden="true"
              />
            </Specimen>
            <Specimen label="Triangle" note="Directory links">
              <span className="pt-tri" aria-hidden="true" />
            </Specimen>
            <Specimen label="Go dot" note="Card titles">
              <GoDot />
            </Specimen>
          </SpecimenGrid>
        </Specimen>
      </SpecimenGrid>

      <SpecimenGrid min={250}>
        {SCENES.map(({ label, kind }) => {
          const scene = sceneFor(viewOf(kind), "/", profile);
          return (
            <Specimen
              key={kind}
              label={label === "Home" ? "Mascot" : `Mascot, ${label}`}
              note={
                scene.item
                  ? `Holds up the ${scene.item}`
                  : "Waves, empty-handed"
              }
            >
              <div className="pt-host" style={{ margin: 0 }}>
                <Mascot item={scene.item} />
                <p className="pt-bubble">{scene.bubble}</p>
              </div>
            </Specimen>
          );
        })}
      </SpecimenGrid>

      <SpecimenGrid min={150}>
        {(Object.keys(AD_NOTES) as AdName[]).map((name) => (
          <Specimen
            key={name}
            label={`Skyscraper ad, “${name}”`}
            note={AD_NOTES[name]}
          >
            <Ad name={name} />
          </Specimen>
        ))}
        {[4, 7].map((seed) => (
          <Specimen
            key={seed}
            label={`Mosaic, seed ${seed}`}
            note={seed === 4 ? "Behind the e-mail news promo" : "Behind its ad"}
          >
            <div className="pt-promo__visual" style={{ maxWidth: 120 }}>
              <span className="pt-promo__mosaic">
                <Mosaic seed={seed} />
              </span>
            </div>
          </Specimen>
        ))}
      </SpecimenGrid>

      <SpecimenGrid min={420}>
        <Specimen
          label="Error stage"
          note="Not found: pixel numerals, the mascot, and floating power-ups"
        >
          <Field>
            <div className="pt-404__stage" aria-hidden="true">
              <Sprite
                art={pixelNumber("404")}
                gap={0.12}
                className="pt-404__digits"
              />
              <p className="pt-404__word">
                Error
                <span>Page not found</span>
              </p>
              <Mascot item="question" className="pt-404__mascot" />
              <Sprite
                art={ITEMS.star}
                scale={4}
                className="pt-404__float pt-404__float--1"
              />
              <Sprite
                art={ITEMS.heart}
                scale={4}
                className="pt-404__float pt-404__float--2"
              />
              <Sprite
                art={ITEMS.question}
                scale={4}
                className="pt-404__float pt-404__float--3"
              />
            </div>
          </Field>
        </Specimen>
        <Specimen
          label="Halftone bar"
          note="A dot screen over slate, here the footer with its seal; the nav bar and site map share it"
        >
          <div className="pt-footer__bar">
            <span className="pt-footer__copy" aria-hidden="true">
              ©
            </span>
            <p className="pt-footer__legal">
              © {new Date().getFullYear()} {profile.name}. Case studies are
              property of their respective owners. {profile.name} is
              headquartered in {profile.location.name}.
            </p>
            <a className="pt-seal" href="/feed.xml">
              <span className="pt-seal__top">
                RSS<sup>™</sup>
              </span>
              <span className="pt-seal__mid">Feed Certified</span>
              <span className="pt-seal__low">click to subscribe</span>
            </a>
          </div>
        </Specimen>
      </SpecimenGrid>
    </>
  );
}

//
// Imagery
// -------

function Imagery({ content }: SpecimenProps) {
  const { profile, work, testimonials, services } = content;
  const person = testimonials.find(
    (testimonial) => testimonial.person?.image
  )?.person;
  const photo = profile.photos[0];

  const gallery = (columns: number) => (
    <KeySection>
      <ul className={`pt-gallery pt-gallery--${columns}`}>
        {work.slice(0, columns).map((item) => (
          <li key={item.url}>
            <figure>
              <a className="pt-gallery__media" href={item.url} tabIndex={-1}>
                <img src={item.cover} alt={item.name} loading="lazy" />
              </a>
              <figcaption>
                <a href={item.url}>{item.name}</a>
                {item.industry && <span>{item.industry}</span>}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </KeySection>
  );

  return (
    <>
      <SpecimenGrid min={220}>
        <Specimen label="Player card" note="About: a square photo, 1P">
          <Field>
            <figure className="pt-player">
              <img src={photo.src} alt={photo.alt} />
              <figcaption>
                <span className="pt-player__tag">1P</span>
                {profile.name.split(" ")[0]}
              </figcaption>
            </figure>
          </Field>
        </Specimen>
        <Specimen label="Square cover" note="Case overview, padded to fit">
          <div style={{ maxWidth: 150 }}>
            <img
              className="pt-spec__img"
              src={work[0].coverSquare}
              alt=""
              loading="lazy"
            />
          </div>
        </Specimen>
        {person?.image && (
          <Specimen label="Avatar" note="Reviews, 38px round and outlined">
            <Field>
              <figure className="pt-quote">
                <figcaption className="pt-quote__person">
                  <img src={person.image} alt="" loading="lazy" />
                  <span>
                    <strong>{person.name}</strong>
                    {person.position && <span>{person.position}</span>}
                  </span>
                </figcaption>
              </figure>
            </Field>
          </Specimen>
        )}
        {services.slice(0, 3).map((service, index) => (
          <Specimen
            key={service.url}
            label={index ? `Stand-in, ${service.title}` : "Stand-in"}
            note={
              index
                ? "Each service turns the hue"
                : "No picture: a power-up on a checkered screen"
            }
          >
            <span
              className="pt-banner__art"
              style={{ "--hue": index * 37 } as CSSProperties}
            >
              <Sprite art={ITEMS[serviceItem(index)]} scale={9} />
            </span>
          </Specimen>
        ))}
      </SpecimenGrid>

      <SpecimenGrid min={420}>
        <Specimen
          label="Photo album"
          note="About: framed 4:3 crops, numbered"
          wide
        >
          <Field>
            <ul className="pt-album">
              {profile.photos.map((item, index) => (
                <li key={item.src}>
                  <figure>
                    <img src={item.src} alt={item.alt} loading="lazy" />
                    <figcaption>
                      <span>Pic {pad(index + 1)}</span>
                      {item.alt}
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </Field>
        </Specimen>
        <Specimen
          label="Gallery, three up"
          note="Case studies: screenshots cropped to a 4:3 window from the top"
          wide
        >
          {gallery(3)}
        </Specimen>
        <Specimen label="Gallery, two up">{gallery(2)}</Specimen>
        <Specimen label="Gallery, one up" note="16:9">
          {gallery(1)}
        </Specimen>
      </SpecimenGrid>
    </>
  );
}

//
// Page headers
// ------------

function PageHeaders({ content }: SpecimenProps) {
  const to = useTo();
  const { profile, posts, work, services } = content;
  const rated = oneOfEach(posts);
  const first =
    rated.find((post) => post.image && post.type !== "Tutorial") ?? posts[0];
  // Tutorial orange is light enough to take dark ink
  const tutorial = rated.find((post) => post.type === "Tutorial");
  const plain =
    rated.find((post) => post !== first && post !== tutorial) ?? first;
  const study = work[0];
  const service = services[0];

  return (
    <SpecimenGrid min={420}>
      <Specimen
        label="Home hero"
        note="Logotype, role, and bio on a starfield; covers and the avatar from 700px"
        wide
      >
        <Field>
          <section className="pt-hero">
            <div className="pt-hero__screen">
              <div className="pt-hero__copy">
                <Logotype lines={profile.name.split(" ")} />
                <p className="pt-hero__tag">
                  <GoDot />
                  {profile.role}
                </p>
                <Html as="p" className="pt-hero__lede" html={profile.bio} />
              </div>

              <div className="pt-hero__art" aria-hidden="true">
                {work.slice(0, 3).map((item, index) => (
                  <img
                    key={item.url}
                    className={`pt-hero__shot pt-hero__shot--${index + 1}`}
                    src={item.cover}
                    alt=""
                  />
                ))}
                <span className="pt-hero__player">
                  <img src={profile.avatar} alt="" />
                  <span>1P</span>
                </span>
              </div>

              <TagStrip
                cells={[
                  { label: "Plat form", art: MONITOR },
                  { label: "Home page", art: FACE, href: to("/about/") },
                  {
                    badge: <Badge big="E" title="Rated E for Everyone" />
                  }
                ]}
              />
            </div>

            <div className="pt-hero__bar">
              <Pill href={to("/contact/")} icon="mail" tone="dark">
                Contact
              </Pill>
              <p>E-mail me a question, or start a project inquiry.</p>
              <Pill href={to("/portfolio/")} icon="list" tone="dark">
                Master work list
              </Pill>
            </div>
          </section>
        </Field>
      </Specimen>
      <Specimen
        label="Launch"
        note="Work: the featured case study over its own cover"
        wide
      >
        <Field>
          <Launch item={study} />
        </Field>
      </Specimen>
      <Specimen
        label="Title bar"
        note="Inner pages, with a strip of framed pictures from 560px, then the intro"
        wide
      >
        <Field>
          <TitleBar
            title="About"
            images={profile.photos.map((photo) => photo.src)}
          />
          <div className="pt-intro">
            <h2 className="pt-intro__heading">{profile.role}</h2>
            <Html as="p" className="pt-intro__lede" html={profile.bio} />
          </div>
        </Field>
      </Specimen>
      <Specimen label="Title bar, plain" note="Contact and project inquiry">
        <Field>
          <TitleBar title="Contact" />
        </Field>
      </Specimen>
      <Specimen
        label="Title bar, long title"
        note="Type and tag archives; a long one trails off"
      >
        <Field>
          <TitleBar title={first.title} />
        </Field>
      </Specimen>
      <Specimen
        label="Post banner"
        note="Posts, in the post type’s color, with the picture"
        wide
      >
        <Field>
          <PostBanner post={first} />
        </Field>
      </Specimen>
      {tutorial && (
        <Specimen
          label="Post banner, light"
          note="Tutorials: a light color takes dark ink"
          wide
        >
          <Field>
            <PostBanner post={tutorial} />
          </Field>
        </Specimen>
      )}
      <Specimen
        label="Post banner, no picture"
        note="The rating’s power-up stands in"
        wide
      >
        <Field>
          <PostBanner post={plain} picture={false} />
        </Field>
      </Specimen>
      <Specimen
        label="Case study banner"
        note="The client as the title, in the client’s color when it has one"
        wide
      >
        <Field>
          <Banner
            logo={study.name}
            logoIsTitle
            lede={study.lede && <Html as="p" html={study.lede} />}
            image={<img src={study.cover} alt="" />}
            tab="Case overview"
          />
        </Field>
      </Specimen>
      <Specimen
        label="Service banner"
        note="The service’s power-up on its own hue"
        wide
      >
        <Field>
          <Banner
            color="#4f5fb5"
            logo={service.title}
            logoIsTitle
            lede={service.lede && <p>{service.lede}</p>}
            image={
              <span className="pt-banner__art">
                <Sprite art={ITEMS[serviceItem(0)]} scale={9} />
              </span>
            }
            tab="Service overview"
          />
        </Field>
      </Specimen>
    </SpecimenGrid>
  );
}

//
// Buttons and links
// -----------------

function Actions({ content }: SpecimenProps) {
  const to = useTo();
  const { profile, socials } = content;
  const ctas = [
    ...new Map(
      SCENES.map(({ kind }) => {
        const { cta } = sceneFor(viewOf(kind), "/", profile);
        return [cta.text, cta] as const;
      })
    ).values()
  ];

  return (
    <SpecimenGrid min={240}>
      <Specimen label="Pill" note="Calls to action, as a link or a button">
        <Pill href={to("/project-inquiry/")}>Start a project inquiry</Pill>
      </Specimen>
      <Specimen label="Pill, dark" note="Hero bars">
        <Row>
          <Pill href={to("/contact/")} icon="mail" tone="dark">
            Contact
          </Pill>
          <Pill href={to("/portfolio/")} icon="list" tone="dark">
            Master work list
          </Pill>
        </Row>
      </Specimen>
      <Specimen label="Pill, orange" note="Form submit">
        <Pill icon="mail" tone="orange">
          Send message
        </Pill>
      </Specimen>
      <Specimen label="Go" note="Search and sign-up">
        <Row>
          <Go type="button" />
          <Go label="Sign up" type="button" />
        </Row>
      </Specimen>
      <Specimen label="Chips" note="Header quick links, from 640px">
        <Row>
          <Chips codeBank={socials.find(isCodeBank)} />
        </Row>
      </Specimen>
      <Specimen label="Hire me" note="End of the Elsewhere strip">
        <Hire />
      </Specimen>
      <Specimen
        label="Page call to action"
        note="Under the field; each part of the site has its own"
      >
        <Field>
          {ctas.map((cta) => (
            <p className="pt-cta" key={cta.text}>
              <span className="pt-cta__arrow" aria-hidden="true">
                <Icon name="arrowRight" />
              </span>
              {cta.path ? (
                <Pill href={to(cta.path)} icon={cta.icon}>
                  {cta.text}
                </Pill>
              ) : (
                <Pill icon={cta.icon}>{cta.text}</Pill>
              )}
            </p>
          ))}
        </Field>
      </Specimen>
      <Specimen label="More link" note="Beside a section heading">
        <Field>
          <Heading more={{ href: to("/portfolio/"), text: "All work" }}>
            Case studies
          </Heading>
        </Field>
      </Specimen>
      <Specimen label="Triangle link" note="Directories and error pages">
        <ul className="pt-404__links">
          <li>
            <Tri href={to("/archive/")}>Writing archive</Tri>
          </li>
          <li>
            <Tri href={to("/portfolio/")}>Case studies</Tri>
          </li>
          <li>
            <Tri href={to("/contact/")}>Contact</Tri>
          </li>
        </ul>
      </Specimen>
      <Specimen label="Promo button" note="The foot of a promo box">
        <a className="pt-promo__cta" href={to("/testimonials/")}>
          <Icon name="arrowRight" />
          Click to read more kind words
        </a>
      </Specimen>
      <Specimen label="Text link" note="Body copy in light boxes">
        <KeySection>
          <div className="pt-prose">
            <Html as="p" html={profile.bio} />
          </div>
        </KeySection>
      </Specimen>
      <Specimen label="Text link, on the field" note="Ledes: white and bold">
        <Field>
          <Html as="p" className="pt-intro__lede" html={profile.bio} />
        </Field>
      </Specimen>
    </SpecimenGrid>
  );
}

//
// Labels and tags
// ---------------

function Labels({ content, prose }: SpecimenProps) {
  const to = useTo();
  const { posts, work } = content;
  const post = posts[1];
  const rating = ratingOf(post.type);
  const study = work.find((item) => item.technologies.length) ?? work[0];

  const strips = [
    {
      label: "Tag strip, post",
      note: "Post type, read post, rating",
      cells: [
        { label: "Post type", art: ITEMS[rating.item] },
        { label: "Read post", art: FACE, href: post.url },
        { badge: <Rating type={post.type} /> }
      ]
    },
    {
      label: "Tag strip, work",
      note: "Platform, case page, number",
      cells: [
        { label: "Plat form", art: MONITOR },
        { label: "Case page", art: FACE, href: work[0].url },
        { badge: <Badge big={pad(1)} small="Case" /> }
      ]
    },
    {
      label: "Tag strip, home",
      note: "Rated E for Everyone",
      cells: [
        { label: "Plat form", art: MONITOR },
        { label: "Home page", art: FACE, href: to("/about/") },
        { badge: <Badge big="E" title="Rated E for Everyone" /> }
      ]
    }
  ];

  return (
    <>
      <SpecimenGrid min={150}>
        {strips.map((strip) => (
          <Specimen key={strip.label} label={strip.label} note={strip.note}>
            <div style={{ display: "flex", height: 158 }}>
              <TagStrip cells={strip.cells} />
            </div>
          </Specimen>
        ))}
        <Specimen label="World label" note="Level select">
          <span className="pt-worlds__label">World 1-1</span>
        </Specimen>
        <Specimen
          label="Player tag"
          note="About’s player card, the hero’s avatar"
        >
          <Field>
            <span className="pt-player__tag">1P</span>
          </Field>
        </Specimen>
      </SpecimenGrid>

      <SpecimenGrid min={240}>
        <Specimen
          label="Directory tab"
          note="Over directories and forms, with a star"
        >
          <h2 className="pt-dir__title">
            <Sprite art={ITEMS.star} scale={4} className="pt-dir__star" />
            <span>Player profile</span>
          </h2>
        </Specimen>
        <Specimen label="Masthead" note="Promo boxes: two-tone, italic">
          <p className="pt-promo__masthead">
            <span className="pt-masthead">KP</span> E-mail News
          </p>
        </Specimen>
        <Specimen label="Masthead, reviews">
          <p className="pt-promo__masthead">
            <span className="pt-masthead">Clients’</span> Choice
          </p>
        </Specimen>
      </SpecimenGrid>

      <SpecimenGrid min={240}>
        <Specimen
          label="File data"
          note="A post’s metadata, in its side column"
        >
          <Field>
            <Side>
              <SideList
                title="File data"
                items={[
                  {
                    text: "Published",
                    small: <time dateTime={post.iso}>{post.date}</time>
                  },
                  {
                    text: "Read time",
                    small: `About ${readingMinutes(prose)} min`
                  },
                  {
                    text: `Rated ${rating.letter}`,
                    small: post.type ? `For ${post.type}` : "Rating pending",
                    href: to("/archive/#ratings")
                  }
                ]}
              />
            </Side>
          </Field>
        </Specimen>
        <Specimen label="Accessories" note="A case study’s technologies">
          <Field>
            <Side>
              <SideGroup title="Accessories">
                <ul className="pt-chips">
                  {study.technologies.map((technology) => (
                    <li key={technology}>{technology}</li>
                  ))}
                </ul>
              </SideGroup>
            </Side>
          </Field>
        </Specimen>
        <Specimen label="Count" note="Archive search results">
          <Field>
            <p className="pt-count" role="status">
              Showing {posts.length} of {posts.length} articles
            </p>
          </Field>
        </Specimen>
        <Specimen
          label="Box tag"
          note="A gallery’s eyebrow, in its box’s title"
          wide
        >
          <KeySection
            title={
              <>
                {study.name}
                {study.industry && (
                  <span className="pt-keysec__tag">{study.industry}</span>
                )}
              </>
            }
          >
            {study.lede && (
              <Html
                as="p"
                className="pt-spec__text pt-gallery__intro"
                html={study.lede}
              />
            )}
          </KeySection>
        </Specimen>
      </SpecimenGrid>
    </>
  );
}

//
// Sections and panels
// -------------------

function Surfaces({ content }: SpecimenProps) {
  const to = useTo();
  const { profile, posts, work } = content;
  const post = posts[1];
  const study = work.find((item) => item.services.length) ?? work[0];

  return (
    <SpecimenGrid min={320}>
      <Specimen
        label="Section"
        note="The play field, with a triple-bar heading over each section"
        wide
      >
        <Field>
          <section className="pt-section">
            <Heading more={{ href: to("/archive/"), text: "Archive" }}>
              Latest news
            </Heading>
            <NewsList items={postNews(posts.slice(0, 3))} />
          </section>
        </Field>
      </Specimen>
      <Specimen
        label="Content box"
        note="A topic of a post or case study, with a tab back to the content key"
        wide
      >
        <KeySection title={post.title}>
          <div className="pt-prose">
            <p>{post.lede}</p>
          </div>
        </KeySection>
      </Specimen>
      <Specimen label="Content box, no tab" note="About’s bio, generic pages">
        <KeySection title="Bio" toKey={false}>
          <div className="pt-prose">
            <Html as="p" html={profile.bio} />
          </div>
        </KeySection>
      </Specimen>
      <Specimen
        label="Content box, linked title"
        note="A post heading that names a resource"
      >
        <KeySection title={<a href={post.url}>{post.title}</a>} toKey={false}>
          <div className="pt-prose">
            <p>{post.lede}</p>
          </div>
        </KeySection>
      </Specimen>
      <Specimen
        label="Spec sheet"
        note="Case overview: the square cover, numbered features, the description"
        wide
      >
        <KeySection title="Overview">
          <div className="pt-spec">
            <img
              className="pt-spec__img"
              src={study.coverSquare}
              alt=""
              loading="lazy"
            />
            <div>
              <h3 className="pt-spec__label">Features</h3>
              <Features items={study.services} />
              {study.lede && (
                <>
                  <h3 className="pt-spec__label">Description</h3>
                  <Html as="p" className="pt-spec__text" html={study.lede} />
                </>
              )}
            </div>
          </div>
        </KeySection>
      </Specimen>
      <Specimen
        label="Bubble card"
        note="Not found; reviews use it with a heart"
      >
        <Field>
          <BubbleCard label="Page not found" art={DIE}>
            <p>
              Sorry, the page you requested is either invalid or no longer
              exists on this site. Try finding what you need at the{" "}
              <a href={to("/")}>keenanpayne.com Home Page</a>.
            </p>
            <ul className="pt-404__links">
              <li>
                <a className="pt-tri" href={to("/archive/")}>
                  Writing archive
                </a>
              </li>
              <li>
                <a className="pt-tri" href={to("/portfolio/")}>
                  Case studies
                </a>
              </li>
              <li>
                <a className="pt-tri" href={to("/contact/")}>
                  Contact
                </a>
              </li>
            </ul>
          </BubbleCard>
        </Field>
      </Specimen>
      <Specimen label="Address card" note="About and contact asides">
        <Field>
          <Address profile={profile} />
        </Field>
      </Specimen>
      <Specimen label="Endnote" note="After a post’s last topic">
        <Field>
          <div className="pt-endnote">
            <p>
              Thanks for reading! Questions or thoughts?{" "}
              <a href={to("/contact/")}>Send me a note</a>.
            </p>
          </div>
        </Field>
      </Specimen>
      <Specimen label="Empty state" note="An archive search with no results">
        <Field>
          <p className="pt-empty">No articles match. Try a wider search.</p>
        </Field>
      </Specimen>
    </SpecimenGrid>
  );
}

//
// Cards
// -----

function Cards({ content }: SpecimenProps) {
  const to = useTo();
  const { posts, work, services, socials } = content;
  const rated = oneOfEach(posts);
  const pictureless = posts.find((post) => !post.image) ?? {
    ...posts[1],
    image: undefined
  };
  const tiles = work.slice(0, 3);

  return (
    <SpecimenGrid min={420}>
      <Specimen
        label="Game card, post"
        note="Home: a tag strip with each post type’s power-up and rating"
        wide
      >
        <Field>
          <ul className="pt-games">
            {rated.map((post) => (
              <li key={post.url}>
                <PostCard post={post} />
              </li>
            ))}
          </ul>
        </Field>
      </Specimen>
      <Specimen
        label="Game card, work"
        note="Work and services: numbered like cases"
        wide
      >
        <Field>
          <ul className="pt-games">
            {work.slice(1, 4).map((item, index) => (
              <li key={item.url}>
                <WorkCard item={item} index={index + 1} />
              </li>
            ))}
          </ul>
        </Field>
      </Specimen>
      <Specimen
        label="Game card, no picture"
        note="A starfield and the post type’s power-up"
      >
        <Field>
          <ul className="pt-games">
            <li>
              <PostCard post={pictureless} />
            </li>
          </ul>
        </Field>
      </Specimen>
      <Specimen label="Game card, no copy" note="Title only">
        <Field>
          <ul className="pt-games">
            <li>
              <GameCard
                href={work[0].url}
                image={work[0].cover}
                title={work[0].name}
                cells={[
                  { label: "Plat form", art: MONITOR },
                  { label: "Case page", art: FACE, href: work[0].url },
                  { badge: <Badge big={pad(1)} small="Case" /> }
                ]}
              />
            </li>
          </ul>
        </Field>
      </Specimen>
      <Specimen
        label="Category tile"
        note="Home and work: a header bar over a cropped cover"
        wide
      >
        <Field>
          <ul className="pt-tiles">
            {tiles.map((item) => (
              <Tile
                key={item.url}
                title={item.name}
                href={item.url}
                icon="case"
                image={item.cover}
              />
            ))}
          </ul>
        </Field>
      </Specimen>
      <Specimen
        label="Category tile, sub categories"
        note="Home: a jump menu instead of a picture; Elsewhere has no link"
        wide
      >
        <Field>
          <ul className="pt-tiles">
            <Tile title="Services" href={to("/services/")} icon="wrench">
              <JumpMenu
                label="Sub categories"
                options={services.map((service) => ({
                  href: service.url,
                  text: service.title
                }))}
              />
            </Tile>
            <Tile title="Writing" href={to("/archive/")} icon="pencil">
              <JumpMenu
                label="Sub categories"
                options={RATING_TYPES.map((type) => ({
                  href: to(typePath(type)),
                  text: `${type}s`
                }))}
              />
            </Tile>
            <Tile title="Elsewhere" icon="house">
              <JumpMenu
                label="Sub categories"
                options={socials.map((social) => ({
                  href: social.url,
                  text: social.text
                }))}
              />
            </Tile>
          </ul>
        </Field>
      </Specimen>
      <Specimen
        label="Service tile"
        note="Services: each service’s power-up on a hue of its own, and its lede"
        wide
      >
        <Field>
          <ul className="pt-tiles">
            {services.slice(0, 3).map((service, index) => (
              <li className="pt-tile" key={service.url}>
                <a className="pt-tile__head" href={service.url}>
                  <Icon name="star" />
                  <span>{service.title}</span>
                </a>
                <a
                  className="pt-tile__screen"
                  href={service.url}
                  tabIndex={-1}
                  style={{ "--hue": index * 37 } as CSSProperties}
                >
                  <Sprite art={ITEMS[serviceItem(index)]} scale={5} />
                </a>
                {service.lede && (
                  <p className="pt-tile__copy">{service.lede}</p>
                )}
              </li>
            ))}
          </ul>
        </Field>
      </Specimen>
      <Specimen
        label="Top story"
        note="Writing: the newest post in a dark headline box"
        wide
      >
        <Field>
          <Feature
            href={posts[0].url}
            image={posts[0].image}
            title={posts[0].title}
            date={posts[0].date}
            sub={posts[0].lede}
          />
        </Field>
      </Specimen>
      <Specimen
        label="Top story, no picture"
        note="The mascot’s monitor stands in"
        wide
      >
        <Field>
          <Feature
            href={pictureless.url}
            title={pictureless.title}
            date={pictureless.date}
            sub={pictureless.lede}
          />
        </Field>
      </Specimen>
      <Specimen
        label="Level select"
        note="Services: the process as World 1-1, 1-2, …"
        wide
      >
        <Field>
          <Worlds steps={content.profile.process} />
        </Field>
      </Specimen>
    </SpecimenGrid>
  );
}

//
// Lists and tables
// ----------------

function Lists({ content }: SpecimenProps) {
  const to = useTo();
  const { profile, posts, work, services, socials } = content;
  const years = postsByYear(posts).slice(0, 2);
  const study = work.find((item) => item.services.length) ?? work[0];

  const rows: [ReactNode, ReactNode][] = relabel(
    profile.facts,
    FACT_LABELS
  ).map((fact) => [
    fact.label,
    fact.url ? (
      <a className="pt-tri" href={fact.url}>
        {fact.text}
      </a>
    ) : (
      fact.text
    )
  ]);
  rows.splice(
    profile.facts.findIndex((fact) => fact.id === "previously") + 1,
    0,
    [
      "Case studies:",
      <a className="pt-tri" href={to("/portfolio/")}>
        {pad(work.length)} on file
      </a>
    ],
    [
      "Articles:",
      <a className="pt-tri" href={to("/archive/")}>
        {pad(posts.length)} published
      </a>
    ]
  );
  rows.push([
    "Elsewhere:",
    <span className="pt-dir__links">
      {socials.map((social) => (
        <a
          key={social.url}
          className="pt-tri"
          href={social.url}
          rel={social.rel}
        >
          {social.text}
        </a>
      ))}
    </span>
  ]);

  return (
    <>
      <Note>
        Testimonials also ranks the ten qualities clients mention most, as a bar
        chart; its tallies come from that page, not the shared content, so it
        isn’t drawn here.
      </Note>
      <SpecimenGrid min={420}>
        <Specimen
          label="News list"
          note="Headlines with a power-up, a bracketed date, and an arrow tab"
        >
          <Field>
            <NewsList items={postNews(posts.slice(0, 5))} />
          </Field>
        </Specimen>
        <Specimen
          label="News list, undated"
          note="Service manual, type archives"
        >
          <Field>
            <NewsList
              items={services.map((service, index) => ({
                href: service.url,
                title: service.title,
                item: serviceItem(index)
              }))}
            />
          </Field>
        </Specimen>
        <Specimen
          label="Archive rows"
          note="Writing archives: a year at a time, each post rated"
          wide
        >
          <Field>
            {years.map(([year, ofYear]) => (
              <div className="pt-rows" key={year}>
                <h3 className="pt-rows__year">
                  {year}
                  <span>
                    {ofYear.length} article{ofYear.length === 1 ? "" : "s"}
                  </span>
                </h3>
                <ol>
                  {ofYear.map((post) => (
                    <li key={post.url}>
                      <Rating type={post.type} />
                      <a href={post.url}>{post.title}</a>
                      <span className="pt-rows__date">{post.date}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </Field>
        </Specimen>
        <Specimen
          label="Ratings guide"
          note="Every rating, its count, and what it covers"
          wide
        >
          <Field>
            <ul className="pt-ratings">
              {RATING_TYPES.map((option) => {
                const count = posts.filter(
                  (post) => post.type === option
                ).length;
                return (
                  <li key={option}>
                    <Rating type={option} />
                    <div>
                      <p className="pt-ratings__name">
                        <a href={to(typePath(option))}>
                          {ratingOf(option).letter} – {option}
                        </a>
                        <span>{pad(count)} titles</span>
                      </p>
                      <p>{DESCRIPTIONS[option]}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="pt-fineprint">
              Ratings are issued by the KPRB ({profile.name} Rating Board),
              which is entirely made up.
            </p>
          </Field>
        </Specimen>
        <Specimen
          label="Calendar"
          note="Writing: a month at a time, posting days linked"
          wide
        >
          <Field>
            <Calendar posts={posts} />
          </Field>
        </Specimen>
        <Specimen
          label="Directory"
          note="About and contact: facts in the direction’s words, with triangle links"
          wide
        >
          <Field>
            <Directory title="Player profile" rows={rows} />
          </Field>
        </Specimen>
        <Specimen
          label="Master work list"
          note="Work: every case study in a table, searchable from above"
          wide
        >
          <Field>
            <div className="pt-tableWrap">
              <table className="pt-table">
                <thead>
                  <tr>
                    <th scope="col">
                      <span className="pt-visually-hidden">Type</span>
                    </th>
                    <th scope="col">Client</th>
                    <th scope="col">Sector</th>
                    <th scope="col">Role</th>
                    <th scope="col">Years</th>
                    <th scope="col">
                      <span className="pt-visually-hidden">Link</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {work.slice(0, 5).map((item) => (
                    <tr key={item.url}>
                      <td className="pt-table__icon">
                        <ItemIcon item="case" />
                      </td>
                      <th scope="row">
                        <a href={item.url}>{item.name}</a>
                      </th>
                      <td>{item.industry}</td>
                      <td>{item.role}</td>
                      <td className="pt-table__num">{item.year}</td>
                      <td className="pt-table__go">
                        <a href={item.url} tabIndex={-1} aria-hidden="true">
                          <Icon name="arrowRight" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Field>
        </Specimen>
        <Specimen label="Features" note="Case overview: little square numerals">
          <KeySection>
            <Features items={study.services} />
          </KeySection>
        </Specimen>
      </SpecimenGrid>
    </>
  );
}

//
// Testimonials
// ------------

function Quotes({ content }: SpecimenProps) {
  const { testimonials } = content;
  const portrait = testimonials.find(
    (testimonial) => testimonial.person?.image
  );
  const plain = testimonials.find((testimonial) => !testimonial.person?.image);

  return (
    <SpecimenGrid min={420}>
      <Specimen
        label="Player review"
        note="Testimonials: bubble cards in balanced columns, the reviewer below"
        wide
      >
        <Field>
          <div className="pt-quotes">
            {testimonials.map((testimonial, index) => (
              <Quote
                key={testimonial.id}
                testimonial={testimonial}
                index={index}
              />
            ))}
          </div>
        </Field>
      </Specimen>
      <Specimen
        label="Clients’ choice"
        note="Home and services: one review set like a magazine promo"
      >
        <Field>
          <QuotePromo testimonial={portrait ?? testimonials[0]} />
        </Field>
      </Specimen>
      {plain && (
        <Specimen label="Clients’ choice, no portrait" note="A heart instead">
          <Field>
            <QuotePromo testimonial={plain} />
          </Field>
        </Specimen>
      )}
    </SpecimenGrid>
  );
}

//
// Forms
// -----

function MessageForm({ variant }: { variant: "contact" | "inquiry" }) {
  const [sent, setSent] = useState(false);

  return (
    <section className="pt-formbox">
      <h2 className="pt-dir__title">
        <Sprite art={ITEMS.star} scale={4} className="pt-dir__star" />
        <span>
          {variant === "contact" ? "Send a message" : "Mission request"}
        </span>
      </h2>
      <form
        className="pt-form"
        onSubmit={(event) => {
          event.preventDefault();
          setSent(true);
        }}
      >
        {formFields(variant).map((field) => (
          <FormField key={field.name} field={field} />
        ))}

        <div className="pt-form__actions pt-field--wide">
          <Pill type="submit" icon="mail" tone="orange">
            {variant === "contact" ? "Send message" : "Send inquiry"}
          </Pill>
          <p className="pt-note" role="status">
            {sent
              ? "Message held — mockup only, nothing was sent."
              : "Mockup only — this form doesn’t send anything."}
          </p>
        </div>
      </form>
    </section>
  );
}

function ArchiveSearch({ posts }: { posts: Post[] }) {
  const years = [...new Set(posts.map((post) => post.year))];
  const [from, setFrom] = useState(years[years.length - 1] ?? "");
  const [until, setUntil] = useState(years[0] ?? "");
  const [type, setType] = useState("");
  const [query, setQuery] = useState("");

  return (
    <form
      className="pt-searchbar"
      role="search"
      onSubmit={(event) => event.preventDefault()}
    >
      <p className="pt-searchbar__label">Search archives by year or keyword</p>
      <div className="pt-searchbar__fields">
        <label className="pt-searchbar__field">
          <span>From</span>
          <select
            className="pt-select"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
          >
            {[...years].reverse().map((year) => (
              <option key={year}>{year}</option>
            ))}
          </select>
        </label>
        <span className="pt-searchbar__to">to</span>
        <label className="pt-searchbar__field">
          <span>Until</span>
          <select
            className="pt-select"
            value={until}
            onChange={(event) => setUntil(event.target.value)}
          >
            {years.map((year) => (
              <option key={year}>{year}</option>
            ))}
          </select>
        </label>
        <span className="pt-searchbar__sep" aria-hidden="true" />
        <label className="pt-searchbar__field">
          <span>Rating</span>
          <select
            className="pt-select"
            value={type}
            onChange={(event) => setType(event.target.value)}
          >
            <option value="">All</option>
            {RATING_TYPES.map((option) => (
              <option key={option} value={option}>
                {option}s
              </option>
            ))}
          </select>
        </label>
        <label className="pt-searchbar__field pt-searchbar__field--grow">
          <span>Keyword</span>
          <input
            className="pt-input"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <Go />
      </div>
    </form>
  );
}

function WorkSearch({ work }: { work: SpecimenProps["content"]["work"] }) {
  const id = useId();
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const matches = work.filter(
    (item) =>
      !needle ||
      [item.name, item.industry, item.role, item.year, ...item.services]
        .join(" ")
        .toLowerCase()
        .includes(needle)
  );

  return (
    <form
      className="pt-searchbar"
      role="search"
      onSubmit={(event) => event.preventDefault()}
    >
      <label className="pt-searchbar__label" htmlFor={id}>
        Search case studies by client, sector, or service
      </label>
      <div className="pt-searchbar__fields">
        <input
          id={id}
          className="pt-input"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <Go />
      </div>
      <p className="pt-searchbar__count" role="status">
        {matches.length} of {work.length}
      </p>
    </form>
  );
}

function Forms({ content }: SpecimenProps) {
  const { posts, work, services } = content;

  return (
    <SpecimenGrid min={320}>
      <Specimen
        label="Contact form"
        note="formFields(“contact”) under a directory tab"
        wide
      >
        <Field>
          <MessageForm variant="contact" />
        </Field>
      </Specimen>
      <Specimen
        label="Project inquiry"
        note="formFields(“inquiry”): every kind of field, checkboxes and radios in orange"
        wide
      >
        <Field>
          <MessageForm variant="inquiry" />
        </Field>
      </Specimen>
      <Specimen
        label="Newsletter"
        note="Writing and posts: the e-mail news promo"
      >
        <Field>
          <Newsletter />
        </Field>
      </Specimen>
      <Specimen
        label="Search tab"
        note="Raised on the frame’s top right, from 640px"
      >
        <Search />
      </Specimen>
      <Specimen label="Search, site map" note="Phones: inside the site map">
        <Search className="pt-search--map" />
      </Specimen>
      <Specimen label="Jump menu" note="Category tiles: goes where you pick">
        <Field>
          <JumpMenu
            label="Sub categories"
            options={services.map((service) => ({
              href: service.url,
              text: service.title
            }))}
          />
        </Field>
      </Specimen>
      <Specimen
        label="Archive search"
        note="Writing: years, rating, and keyword"
        wide
      >
        <Field>
          <ArchiveSearch posts={posts} />
        </Field>
      </Specimen>
      <Specimen
        label="Work search"
        note="Work: filters the master list, with a live count"
        wide
      >
        <Field>
          <WorkSearch work={work} />
        </Field>
      </Specimen>
    </SpecimenGrid>
  );
}

//
// Wayfinding
// ----------

function Wayfinding({ content }: SpecimenProps) {
  const to = useTo();
  const { profile, posts, work, services, socials } = content;
  const post = posts[1];
  const rating = ratingOf(post.type);
  const scene = sceneFor(viewOf("home"), "/", profile);
  // The content key jumps to parts of this section, as it would to topics
  const key = useId();
  const topics = [
    { id: `${key}side`, title: "Side lists" },
    { id: `${key}links`, title: "Link cards" },
    { id: `${key}nav`, title: "Previous and next" }
  ];

  return (
    <>
      <Note>
        On phones the header folds into a site map that drops open in the frame;
        its zone buttons are drawn here, but not the open menu.
      </Note>
      <SpecimenGrid min={220}>
        <Specimen
          label="Nav bar"
          note="Header, from 640px: orange on a halftone bar, the current section white"
          wide
        >
          <nav className="pt-nav" aria-label="Main" style={{ marginLeft: 0 }}>
            <ul>
              {NAVIGATION.map((item) => (
                <li key={item.path}>
                  <a
                    href={to(item.path)}
                    aria-current={item.path === "/about/" ? "page" : undefined}
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </Specimen>
        <Specimen
          label="Elsewhere strip"
          note="Under the header: other pages and profiles, the current one underlined"
          wide
        >
          <Elsewhere path="/testimonials/" socials={socials}>
            <Hire />
          </Elsewhere>
        </Specimen>
        <Specimen
          label="Content key"
          note="Posts, case studies, and services jump to a topic; here, to parts below"
          wide
        >
          <Field>
            <ContentKey topics={topics} />
          </Field>
        </Specimen>
        <Specimen
          label="Zone buttons"
          note="Phones: the site map’s zones, the current one orange and stickered"
          wide
        >
          <div style={{ maxWidth: 360 }}>
            <Zones current="/about/" />
          </div>
        </Specimen>
        <Specimen label="Shortcut rail" note="Beside the field, from 760px">
          <nav className="pt-rail" aria-label="Shortcuts" style={{ width: 24 }}>
            <span className="pt-rail__arrow" aria-hidden="true">
              <Icon name="arrowDown" />
            </span>
            <ul>
              {RAIL.map((item) => (
                <li key={item.text}>
                  <a href={to(item.path)}>{item.text}</a>
                </li>
              ))}
            </ul>
          </nav>
        </Specimen>
        <Specimen
          label="Side panel"
          note="Side column: shortcuts, then what the page is for"
        >
          <div className="pt-side__panel" style={{ maxWidth: 152 }}>
            <ul className="pt-side__buttons">
              {SIDE_BUTTONS.map((button) => (
                <li key={button.text}>
                  <a href={to(button.path)}>
                    <Icon name={button.icon} />
                    {button.text}
                  </a>
                </li>
              ))}
              <li>
                <a href="/feed.xml">
                  <Icon name="rss" />
                  RSS feed
                </a>
              </li>
            </ul>

            <div className="pt-whatis">
              <p className="pt-whatis__head">
                <Sprite art={INFO} />
                What is
              </p>
              <div className="pt-whatis__card">
                <p className="pt-whatis__title">
                  {scene.info.path ? (
                    <a href={to(scene.info.path)}>{scene.info.title}</a>
                  ) : (
                    scene.info.title
                  )}
                </p>
                <p>{scene.info.body}</p>
              </div>
            </div>
          </div>
        </Specimen>
        <Specimen label="Back link" note="Tops the side column">
          <Field>
            <Side>
              <BackLink href={to("/archive/")}>Back to Writing</BackLink>
            </Side>
          </Field>
        </Specimen>
        <Specimen label="Side list" note="Links with arrow tabs">
          <Field id={topics[0].id}>
            <Side>
              <SideList
                title="Other services"
                items={services.slice(1).map((service) => ({
                  text: service.title,
                  href: service.url
                }))}
              />
            </Side>
          </Field>
        </Specimen>
        <Specimen label="Side list, static" note="A case study’s specs">
          <Field>
            <Side>
              <SideList
                title="Specs"
                items={
                  [
                    work[0].industry && {
                      text: "Sector",
                      small: work[0].industry
                    },
                    work[0].year && { text: "Years", small: work[0].year },
                    work[0].role && { text: "Role", small: work[0].role }
                  ].filter(Boolean) as { text: string; small: string }[]
                }
              />
            </Side>
          </Field>
        </Specimen>
        <Specimen label="Link cards" note="Where to go after a post">
          <Field id={topics[1].id}>
            <Side>
              <SideGroup title="Links">
                {post.type && (
                  <LinkCard
                    href={to(typePath(post.type))}
                    label={`More ${post.type}s`}
                    art={ITEMS[rating.item]}
                  >
                    Browse every {post.type.toLowerCase()} in the archive
                  </LinkCard>
                )}
                <LinkCard
                  href={to("/contact/")}
                  label="Get in touch"
                  art={ITEMS.mail}
                >
                  Questions, thoughts, or a project in mind
                </LinkCard>
                <LinkCard
                  href={to("/portfolio/")}
                  label="Case studies"
                  art={MONITOR}
                >
                  See the work behind the writing
                </LinkCard>
              </SideGroup>
            </Side>
          </Field>
        </Specimen>
        <Specimen label="Previous and next" note="The end of a post" wide>
          <Field id={topics[2].id}>
            <PostNav nav={samplePostNav(posts)} />
          </Field>
        </Specimen>
        <Specimen
          label="Previous and next, one side"
          note="Case studies; the first has nothing before it"
          wide
        >
          <Field>
            <PostNav
              nav={{ next: { url: work[1].url, text: work[1].name } }}
              noun="case study"
            />
          </Field>
        </Specimen>
      </SpecimenGrid>
    </>
  );
}

//
// Prose
// -----

/**
 * A post's body as Post lays it out: a light box for each top-level topic.
 * Its content key is drawn under Wayfinding, since the key has a fixed id.
 */
function Prose({ prose }: SpecimenProps) {
  const id = useId();
  const topics = splitTopics(
    prose.replace(/<details class="toc">[\s\S]*?<\/details>/, "")
  ).map((topic) => ({ ...topic, id: `${id}${topic.id}` }));

  return (
    <>
      {topics.length === 1 && (
        <Note>
          One box: Post gives each h2 a box of its own, but the footnotes’
          heading sits inside their section, so this body stays whole, as a post
          with footnotes does.
        </Note>
      )}
      {/* The post's column beside its side column */}
      <Field width={704}>
        <div className="pt-columns__main">
          {topics.map((topic) => (
            <KeySection
              key={topic.id}
              id={topic.id}
              title={topic.title}
              html={topic.titleHtml}
              toKey={topics.length > 1}
            >
              <HtmlContent className="pt-prose" html={topic.html} />
            </KeySection>
          ))}
        </div>
      </Field>
    </>
  );
}

export const specimens: Specimens = {
  root: "pt",
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
