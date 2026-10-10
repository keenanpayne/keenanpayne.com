import type { LabContent } from "../../../../lib/types";
import { Html, useTo } from "../../../site";
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

  return (
    <>
      <section className="mg-hero">
        <img
          className="mg-hero__avatar"
          src={content.profile.avatar}
          alt={content.profile.name}
        />
        <Html as="p" className="mg-hero__lede" html={content.profile.bio} />
      </section>

      <Section icon="pen" label="Writing">
        <PostCards posts={content.posts.slice(0, 4)} />
      </Section>

      <Section icon="grid" label="Work">
        <WorkGrid work={content.work} />
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
