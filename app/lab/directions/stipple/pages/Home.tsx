import { useRef } from "react";

import { Html, useLocalTime, useTo, type TemplateProps } from "../../../site";
import { Groundwork } from "../Groundwork";
import {
  Button,
  Entries,
  Layout,
  Mark,
  More,
  postItems,
  Quotes,
  Section,
  ServiceCards,
  WorkCard
} from "../parts";

export function Home({ content }: TemplateProps<"home">) {
  const to = useTo();
  const time = useLocalTime();
  const copy = useRef<HTMLDivElement>(null);
  const { profile, posts, work, services, testimonials } = content;

  return (
    <>
      <header className="st-hero">
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
          <p className="st-hero__note">
            {profile.location.short}
            {time && ` · ${time}`}
          </p>
        </div>
      </header>

      <Layout wide>
        <Section
          id="hello"
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

        <Section
          id="work"
          title="Selected work"
          action={<More href={to("/portfolio/")}>All work</More>}
        >
          <div className="st-cards">
            {work.slice(0, 3).map((item) => (
              <WorkCard key={item.url} item={item} />
            ))}
          </div>
        </Section>

        <Section
          id="writing"
          title="Writing"
          action={<More href={to("/archive/")}>Archive</More>}
        >
          <Entries items={postItems(posts.slice(0, 5))} size="medium" />
        </Section>

        <Section
          id="services"
          title="Services"
          action={<More href={to("/services/")}>How I work</More>}
        >
          <ServiceCards services={services} />
        </Section>

        <Section id="kind-words" title="Kind words">
          <Quotes testimonials={testimonials} />
        </Section>
      </Layout>
    </>
  );
}
