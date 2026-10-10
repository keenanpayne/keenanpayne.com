import { useState } from "react";

import { SAMPLE_PAGES } from "../../registry";
import {
  formFields,
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

import {
  Facts,
  FormField,
  LinkList,
  Newsletter,
  PageHeader,
  PageTable,
  PostList,
  PostNav,
  Quote,
  Section,
  ServiceList,
  WorkGrid
} from "./parts";

function TypeScale({ content }: SpecimenProps) {
  const { profile, posts } = content;
  const post = posts[1];

  return (
    <>
      <TypeSample label="Page title">
        <h1>{profile.name}</h1>
      </TypeSample>
      <TypeSample label="Lede">
        <Html as="p" className="wireframe-lede" html={profile.bio} />
      </TypeSample>
      <TypeSample label="Section heading">
        <h2>Writing</h2>
      </TypeSample>
      <TypeSample label="Item heading">
        <h3>{post.title}</h3>
      </TypeSample>
      <TypeSample label="Body">
        <p>{post.lede}</p>
      </TypeSample>
      <TypeSample label="Eyebrow">
        <p className="wireframe-eyebrow">{profile.role}</p>
      </TypeSample>
      <TypeSample label="Meta">
        <span className="wireframe-meta">{`${post.date} · ${post.type}`}</span>
      </TypeSample>
    </>
  );
}

const Motifs = () => (
  <Note>
    None, by design. Wireframe is the content and information architecture with
    no skin: system type, hairline rules, and the browser’s own controls, so
    every other direction’s flourishes are its own.
  </Note>
);

function Imagery({ content }: SpecimenProps) {
  const { profile, work, testimonials } = content;
  const person = testimonials.find(
    (testimonial) => testimonial.person?.image
  )?.person;
  const photo = profile.photos[0];

  return (
    <SpecimenGrid min={220}>
      <Specimen label="Portrait" note="Home hero, round">
        <div className="wireframe-hero">
          <img src={profile.avatar} alt={profile.name} />
        </div>
      </Specimen>
      <Specimen label="Cover" note="Work cards, as uploaded">
        <img src={work[0].cover} alt="" loading="lazy" />
      </Specimen>
      <Specimen label="Photo" note="About, with its caption">
        <figure>
          <img src={photo.src} alt={photo.alt} loading="lazy" />
          <figcaption>{photo.alt}</figcaption>
        </figure>
      </Specimen>
      {person?.image && (
        <Specimen label="Avatar" note="Testimonials, 40px round">
          <div className="wireframe-quote">
            <figcaption>
              <img src={person.image} alt="" loading="lazy" />
              <span>{person.name}</span>
            </figcaption>
          </div>
        </Specimen>
      )}
    </SpecimenGrid>
  );
}

function PageHeaders({ content }: SpecimenProps) {
  const to = useTo();
  const { profile, posts } = content;
  const post = posts[1];

  return (
    <SpecimenGrid min={420}>
      <Specimen label="Home" note="Portrait, role, name, and bio" wide>
        <header className="wireframe-pageHeader wireframe-hero">
          <img src={profile.avatar} alt={profile.name} />
          <div>
            <p className="wireframe-eyebrow">{profile.role}</p>
            <h1>{profile.name}</h1>
            <Html as="p" className="wireframe-lede" html={profile.bio} />
          </div>
        </header>
      </Specimen>
      <Specimen
        label="Article"
        note="Breadcrumb eyebrow, title, lede, facts"
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
      <Specimen label="Button" note="Form submit, the browser’s own">
        <button type="button">Send message</button>
      </Specimen>
      <Specimen label="Text link" note="Inherits the text color, underlined">
        <p>
          A link to <a href={to("/about/")}>About</a> within a sentence.
        </p>
      </Specimen>
      <Specimen label="Section link" note="A heading that links">
        <h2>
          <a href={to("/archive/")}>Writing</a>
        </h2>
      </Specimen>
      <Specimen label="More link">
        <p>
          <a href={to(`/type/${type.toLowerCase()}s/`)}>
            {`More ${type.toLowerCase()}s`}
          </a>
        </p>
      </Specimen>
    </SpecimenGrid>
  );
}

function Labels({ content }: SpecimenProps) {
  const to = useTo();
  const post = content.posts[1];
  const types = postTypes(content.posts).map((type) => ({
    text: type,
    url: to(`/type/${type.toLowerCase()}s/`)
  }));

  return (
    <SpecimenGrid min={240}>
      <Specimen label="Eyebrow">
        <p className="wireframe-eyebrow">{content.profile.role}</p>
      </Specimen>
      <Specimen label="Meta">
        <span className="wireframe-meta">
          <time dateTime={post.iso}>{post.date}</time>
          {post.type && ` · ${post.type}`}
        </span>
      </Specimen>
      <Specimen label="Tags" note="Post types and tags" wide>
        <LinkList links={types} label="Post types" />
      </Specimen>
    </SpecimenGrid>
  );
}

function Surfaces({ content }: SpecimenProps) {
  const post = content.posts[1];

  return (
    <SpecimenGrid min={320}>
      <Specimen label="Section" note="A hairline over each section" wide>
        <Section title="Writing">
          <p>{post.lede}</p>
        </Section>
      </Specimen>
      <Specimen label="Tint" note="Quotes and code blocks">
        <div className="wireframe-quote">
          <p style={{ margin: 0 }}>{post.lede}</p>
        </div>
      </Specimen>
    </SpecimenGrid>
  );
}

const Cards = ({ content }: SpecimenProps) => (
  <Specimen label="Work card" note="Cover, name, lede, industry and years">
    <WorkGrid work={content.work.slice(0, 3)} />
  </Specimen>
);

function Lists({ content }: SpecimenProps) {
  const to = useTo();
  const { profile, posts, services } = content;

  return (
    <SpecimenGrid min={340}>
      <Specimen label="Posts" note="Title, date and type, lede">
        <PostList posts={posts.slice(0, 3)} />
      </Specimen>
      <Specimen label="Services">
        <ServiceList services={services.slice(0, 3)} />
      </Specimen>
      <Specimen label="Facts" note="Term and detail pairs" wide>
        <Facts
          rows={profile.facts.map((fact) => [
            fact.label,
            fact.url ? <a href={fact.url}>{fact.text}</a> : fact.text
          ])}
        />
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
      <Specimen label="Quote" note="With a portrait">
        <Quote testimonial={first} />
      </Specimen>
      {second && (
        <Specimen label="Quote">
          <Quote testimonial={second} />
        </Specimen>
      )}
    </SpecimenGrid>
  );
}

function Forms() {
  const [sent, setSent] = useState(false);

  return (
    <SpecimenGrid min={320}>
      <Specimen label="Contact form" note="formFields(“contact”)" wide>
        <form
          className="wireframe-form"
          onSubmit={(event) => {
            event.preventDefault();
            setSent(true);
          }}
        >
          {formFields("contact").map((field) => (
            <FormField key={field.name} field={field} />
          ))}
          <p className="wireframe-field--wide">
            <button type="submit">Send message</button>{" "}
            <span className="wireframe-meta" role="status">
              {sent
                ? "Mockup only — nothing was sent."
                : "Mockup only — this form doesn’t send anything."}
            </span>
          </p>
        </form>
      </Specimen>
      <Specimen label="Choices" note="From the project inquiry">
        <form className="wireframe-form">
          {formFields("inquiry")
            .filter((field) => field.kind === "choices")
            .slice(0, 2)
            .map((field) => (
              <FormField key={field.name} field={field} />
            ))}
        </form>
      </Specimen>
      <Specimen label="Newsletter">
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
        <p className="wireframe-eyebrow">
          <a href={to("/archive/")}>Writing</a>
          {post.type && ` / ${post.type}`}
        </p>
      </Specimen>
      <Specimen label="Previous and next" note="The end of a post" wide>
        <PostNav nav={samplePostNav(content.posts)} />
      </Specimen>
    </SpecimenGrid>
  );
}

const Prose = ({ prose }: SpecimenProps) => (
  <Html className="wireframe-prose" html={prose} />
);

export const specimens: Specimens = {
  root: "wireframe",
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
