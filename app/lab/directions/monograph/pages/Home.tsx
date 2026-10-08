import type { LabContent } from "../../../../lib/types";
import {
  Banner,
  KindWords,
  MoreLink,
  Section,
  ServicesLedger,
  useTo,
  WorkGrid
} from "../parts";

import { PostCards } from "./Archive";

const AVATAR =
  "https://res.cloudinary.com/keenan-payne/image/upload/f_auto,q_auto,c_fill,g_face,ar_1:1,w_480/v1666204078/people/me/jun-27-2021_o8sd0l.jpg";

export function Home({ content }: { content: LabContent }) {
  const to = useTo();

  return (
    <>
      <section className="mg-hero">
        <img className="mg-hero__avatar" src={AVATAR} alt="Keenan Payne" />
        <p className="mg-hero__lede">
          I’m a full-stack web developer and designer with eighteen years of
          experience helping teams market and build products on the web. I spent
          five years growing the website at{" "}
          <a href={to("/portfolio/asana/")}>Asana</a>, and have since partnered
          with <a href={to("/portfolio/rippling/")}>Rippling</a>,{" "}
          <a href={to("/portfolio/gofundme/")}>GoFundMe</a>,{" "}
          <a href={to("/portfolio/neuralink/")}>Neuralink</a>, and many others.
          I also <a href={to("/archive/")}>write</a> about craft, career, and
          the occasional reflection.
        </p>
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
