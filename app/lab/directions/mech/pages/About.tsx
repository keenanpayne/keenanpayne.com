import { useRef } from "react";

import { socials } from "../../../../data/socials";
import type { BasicPageModel, LabContent } from "../../../../lib/types";
import {
  Feed,
  Html,
  introOf,
  Lightbox,
  type LightboxHandle,
  pad,
  PageHeader,
  Panel,
  Readout,
  Section,
  useTo
} from "../parts";

const photo = (id: string, transform: string) =>
  `https://res.cloudinary.com/keenan-payne/image/upload/f_auto,q_auto,${transform}/${id}`;

const PHOTOS = [
  {
    id: "v1666204078/people/me/jun-27-2021_o8sd0l.jpg",
    alt: "Me in grayscale"
  },
  { id: "v1666204077/people/me/dec-26-2021_iuhh3w.jpg", alt: "Me being cold" },
  {
    id: "v1666204078/people/me/jul-5-2020_lwglyk.jpg",
    alt: "Hanging out with my high school buddies"
  }
].map((item) => ({ ...item, src: photo(item.id, "w_800") }));

// Larger copies for the lightbox, never upscaled past the original
const ENLARGED = PHOTOS.map((item) => ({
  src: photo(item.id, "c_limit,w_1800"),
  alt: item.alt,
  caption: item.alt
}));

export function About({
  page,
  content
}: {
  page: BasicPageModel;
  content: LabContent;
}) {
  const intro = introOf(page);
  const to = useTo();
  const lightbox = useRef<LightboxHandle>(null);

  const facts: [string, React.ReactNode][] = [
    ["Designation", "KP-01 · Full-stack web developer & designer"],
    ["Base", "Denver, Colorado"],
    ["Service record", "Eighteen years on the web"],
    [
      "Prior assignment",
      <a href={to("/portfolio/asana/")}>Asana, 2014–2019</a>
    ],
    ["Shows a year", "About thirty"],
    ["Off duty", "Magic: The Gathering, travel, family"],
    [
      "Relays",
      [1, 4, 6, 2].map((id, index) => (
        <span key={id}>
          {index > 0 && " · "}
          <a href={socials[id].url}>{socials[id].name}</a>
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
            <Readout label="Experience" value="18" unit="yrs" tone="amber" />
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
              src={PHOTOS[0].src}
              alt={PHOTOS[0].alt}
              label="ID · KP-01"
              eager
              natural
              onZoom={() => lightbox.current?.open(0)}
            />
            <dl className="mc-spec mc-spec--compact">
              {facts.map(([term, detail]) => (
                <div key={term}>
                  <dt>{term}</dt>
                  <dd>{detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Panel>
      </section>

      <Section label="Surveillance archive" jp="写真" code="3 frames">
        <div className="mc-grid mc-grid--3">
          {PHOTOS.map((item, index) => (
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

      <Lightbox ref={lightbox} images={ENLARGED} />
    </>
  );
}
