import type { BasicPageModel, LabContent } from "../../../../lib/types";
import {
  Banner,
  KindWords,
  PageHeader,
  Section,
  ServicesLedger
} from "../parts";

import { introOf } from "./Generic";

const PROCESS = [
  [
    "Listen",
    "We talk through your goals, audience, constraints, and what success looks like."
  ],
  [
    "Plan",
    "A clear scope, timeline, and budget, so there are no surprises later."
  ],
  [
    "Build",
    "Regular check-ins and working previews as the project comes together."
  ],
  [
    "Launch",
    "A careful release, documentation for your team, and support after launch."
  ]
];

export function Services({
  page,
  content
}: {
  page: BasicPageModel;
  content: LabContent;
}) {
  const intro = introOf(page);

  return (
    <>
      <PageHeader
        icon="list"
        eyebrow="Services"
        title={intro?.heading ?? "Services"}
        lede={intro?.subheading}
      />

      <Section icon="list" label="Services I offer">
        <ServicesLedger services={content.services} />
      </Section>

      <Section icon="spark" label="How we’ll work together">
        <ol className="mg-row mg-row--quarters mg-steps">
          {PROCESS.map(([title, copy], index) => (
            <li className="mg-card" key={title}>
              <span className="mg-steps__number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mg-card__title">{title}</h3>
              <p className="mg-copy">{copy}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Banner />

      <KindWords testimonials={content.testimonials} />
    </>
  );
}
