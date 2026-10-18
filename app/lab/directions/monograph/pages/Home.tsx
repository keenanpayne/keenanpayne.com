import type { LabContent } from "../../../../lib/types";
import { homeWork, Html, useTo } from "../../../site";
import {
  Banner,
  KindWords,
  MoreLink,
  Section,
  ServicesLedger,
  WorkGrid
} from "../parts";

import { PostCards } from "./Archive";

export function Home({ content }: { content: LabContent }) {
  const to = useTo();
  const { profile } = content;

  return (
    <>
      <section className="mg-hero">
        <img
          className="mg-hero__avatar"
          src={profile.avatar}
          alt={profile.name}
        />
        <div className="mg-hero__text">
          <h1 className="mg-label mg-hero__title">
            {profile.name}
            <span aria-hidden="true">–</span>
            {profile.role}
          </h1>
          <Html as="p" className="mg-hero__lede" html={profile.bio} />
        </div>
      </section>

      <Section icon="pen" label="Writing">
        <PostCards posts={content.posts.slice(0, 4)} />
      </Section>

      <Section icon="grid" label="Work">
        <WorkGrid work={homeWork(content)} />
        <div className="mg-section__more">
          <MoreLink href={to("/portfolio/")}>All work</MoreLink>
        </div>
      </Section>

      <Section icon="list" label="Services">
        <ServicesLedger services={content.services} />
        <div className="mg-section__more">
          <MoreLink href={to("/services/")}>All services</MoreLink>
        </div>
      </Section>

      <Banner />

      <KindWords testimonials={content.testimonials} />
    </>
  );
}
