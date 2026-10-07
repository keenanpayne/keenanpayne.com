import type { SectionModel } from "../../lib/types";
import { Newsletter, NewsletterLarge } from "../Newsletter";
import { Testimonial } from "../Testimonial";
import { Cta } from "./Cta";
import { Dribbble } from "./Dribbble";
import { Entries } from "./Entries";
import { Contact, ProjectInquiry } from "./Forms";
import { Intro } from "./Intro";
import { PageList, TagList, TypeList } from "./Lists";
import { PortfolioGrid } from "./PortfolioGrid";
import { SocialProofLogos } from "./SocialProofLogos";
import { Testimonials, TestimonialsGrid } from "./Testimonials";

/** Renders the `sections` a Markdown page declares in its front matter */
export function Sections({ sections }: { sections: SectionModel[] }) {
  return sections.map((section, index) => (
    <Section key={index} section={section} />
  ));
}

function Section({ section }: { section: SectionModel }) {
  switch (section.type) {
    case "intro":
      return <Intro section={section} />;
    case "entries":
      return <Entries section={section} />;
    case "newsletter":
      return <Newsletter spacing={section.spacing} />;
    case "newsletterStandalone":
      return <NewsletterLarge modifiers={section.modifiers} />;
    case "testimonials":
      return <Testimonials section={section} />;
    case "testimonials-grid":
      return <TestimonialsGrid section={section} />;
    case "testimonial":
      return section.testimonial ? (
        <Testimonial testimonial={section.testimonial} />
      ) : null;
    case "portfolioGrid":
      return <PortfolioGrid section={section} />;
    case "dribbble":
      return <Dribbble section={section} />;
    case "tagList":
      return <TagList section={section} />;
    case "typeList":
      return <TypeList section={section} />;
    case "pageList":
      return <PageList section={section} />;
    case "socialProofLogos":
      return <SocialProofLogos section={section} />;
    case "cta":
      return <Cta />;
    case "contact":
      return <Contact />;
    case "projectInquiry":
      return <ProjectInquiry />;
  }
}
