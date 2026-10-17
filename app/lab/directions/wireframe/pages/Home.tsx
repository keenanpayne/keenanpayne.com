import { Html, useTo, type TemplateProps } from "../../../site";
import { KindWords, PostList, Section, ServiceList, WorkGrid } from "../parts";

export function Home({ content }: TemplateProps<"home">) {
  const to = useTo();
  const { profile } = content;

  return (
    <>
      <header className="wireframe-pageHeader wireframe-hero">
        <img src={profile.avatar} alt={profile.name} />
        <div>
          <p className="wireframe-eyebrow">{profile.role}</p>
          <h1>{profile.name}</h1>
          <Html as="p" className="wireframe-lede" html={profile.bio} />
        </div>
      </header>

      <Section title={<a href={to("/archive/")}>Writing</a>}>
        <PostList posts={content.posts.slice(0, 4)} />
      </Section>

      <Section title={<a href={to("/portfolio/")}>Work</a>}>
        <WorkGrid work={content.work} />
      </Section>

      <Section title={<a href={to("/services/")}>Services</a>}>
        <ServiceList services={content.services} />
      </Section>

      <KindWords testimonials={content.testimonials} />
    </>
  );
}
