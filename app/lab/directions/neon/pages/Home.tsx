import { HOME, homeWork, Html, useTo, type TemplateProps } from "../../../site";
import { Billboard } from "../Billboard";
import {
  floorOf,
  KANA,
  KindWords,
  More,
  PostList,
  Section,
  ServiceList,
  Ticker,
  WorkGrid
} from "../parts";
import { Skyline } from "../scene";

export function Home({ content }: TemplateProps<"home">) {
  const to = useTo();
  const { profile, posts, services, testimonials } = content;
  const floors = 4;

  return (
    <>
      <header className="neon-hero">
        <Skyline seed={1} trail rings className="neon-hero__city" />
        <div className="neon-hero__copy">
          <p className="neon-hero__role">
            <span>{profile.role}</span>
          </p>
          <h1 className="neon-hero__name">{profile.name}</h1>
          <Html as="p" className="neon-lede" html={profile.bio} />
          <p className="neon-hero__actions">
            <a className="neon-button" href={to("/portfolio/")}>
              See the work
            </a>
            <a
              className="neon-button neon-button--ghost"
              href={to("/contact/")}
            >
              Get in touch
            </a>
          </p>
        </div>
        <Billboard
          src={profile.avatar}
          alt={profile.name}
          className="neon-hero__billboard"
        >
          <span className="neon-billboard__tag" aria-hidden="true">
            Live · {KANA.open}
          </span>
        </Billboard>
      </header>

      <Ticker items={posts.slice(0, 8).map((post) => post.title)} />

      <Section
        title={<a href={to("/archive/")}>Writing</a>}
        kana={KANA.writing}
        floor={floorOf(0, floors)}
        tone="pink"
      >
        <PostList posts={posts.slice(0, HOME.posts)} />
        <More href={to("/archive/")}>Every article</More>
      </Section>

      <Section
        title={<a href={to("/portfolio/")}>Work</a>}
        kana={KANA.work}
        floor={floorOf(1, floors)}
        tone="cyan"
      >
        <WorkGrid work={homeWork(content)} pairs />
        <More href={to("/portfolio/")}>All the work</More>
      </Section>

      <Section
        title={<a href={to("/services/")}>Services</a>}
        kana={KANA.services}
        floor={floorOf(2, floors)}
        tone="amber"
      >
        <ServiceList services={services} />
      </Section>

      <KindWords testimonials={testimonials} floor={floorOf(3, floors)} />
    </>
  );
}
