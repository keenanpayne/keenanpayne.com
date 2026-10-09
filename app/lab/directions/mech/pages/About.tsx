import { useRef } from "react";

import type { BasicPageModel, LabContent } from "../../../../lib/types";
import { Html, introOf, pad, relabel } from "../../../site";
import {
  Feed,
  Lightbox,
  type LightboxHandle,
  PageHeader,
  Panel,
  Readout,
  Section
} from "../parts";

// Mech's voice for the shared profile facts
const FACT_LABELS = {
  role: "Designation",
  location: "Base",
  experience: "Service record",
  previously: "Prior assignment",
  offDuty: "Off duty"
};

export function About({
  page,
  content
}: {
  page: BasicPageModel;
  content: LabContent;
}) {
  const intro = introOf(page);
  const lightbox = useRef<LightboxHandle>(null);
  const { experience, facts, photos } = content.profile;

  const rows: [string, React.ReactNode][] = [
    ...relabel(facts, FACT_LABELS).map((fact): [string, React.ReactNode] => [
      fact.label,
      fact.url ? (
        <a href={fact.url}>{fact.text}</a>
      ) : fact.id === "role" ? (
        `KP-01 · ${fact.text}`
      ) : (
        fact.text
      )
    ]),
    [
      "Relays",
      content.socials.map((social, index) => (
        <span key={social.url}>
          {index > 0 && " · "}
          <a href={social.url} rel={social.rel}>
            {social.text}
          </a>
        </span>
      ))
    ]
  ];

  return (
    <>
      <PageHeader
        episode="Episode:03"
        eyebrow="About"
        jp="人物"
        title={intro?.heading ?? "About"}
        lede={intro?.subheading}
        aside={
          <dl className="mc-readouts mc-readouts--grid">
            <Readout
              label="Experience"
              value={experience.years}
              unit="yrs"
              tone="amber"
            />
            <Readout
              label="Units"
              value={pad(content.work.length, 3)}
              tone="green"
            />
          </dl>
        }
      />

      <section className="mc-section mc-split mc-split--reverse">
        <div>
          <p className="mc-kicker">Pilot briefing</p>
          {intro?.body && <Html className="mc-prose" html={intro.body} />}
        </div>

        <Panel as="aside" label="Personnel file" code="KP-01">
          <div className="mc-dossier">
            <Feed
              className="mc-dossier__photo"
              src={photos[0].src}
              alt={photos[0].alt}
              label="ID · KP-01"
              eager
              natural
              onZoom={() => lightbox.current?.open(0)}
            />
            <dl className="mc-spec mc-spec--compact">
              {rows.map(([term, detail]) => (
                <div key={term}>
                  <dt>{term}</dt>
                  <dd>{detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Panel>
      </section>

      <Section
        label="Surveillance archive"
        jp="写真"
        code={`${photos.length} frames`}
      >
        <div className="mc-grid mc-grid--3">
          {photos.map((item, index) => (
            <Panel
              as="figure"
              key={item.src}
              className="mc-photo"
              label={`Frame ${pad(index + 1, 3)}`}
              code="Rec"
            >
              <Feed
                src={item.src}
                alt={item.alt}
                natural
                onZoom={() => lightbox.current?.open(index)}
              />
              <figcaption>{item.alt}</figcaption>
            </Panel>
          ))}
        </div>
      </Section>

      <Lightbox
        ref={lightbox}
        images={photos.map((item) => ({
          src: item.large,
          alt: item.alt,
          caption: item.alt
        }))}
      />
    </>
  );
}
