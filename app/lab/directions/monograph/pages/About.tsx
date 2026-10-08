import { socials } from "../../../../data/socials";
import type { BasicPageModel } from "../../../../lib/types";
import { Html, Icon, PageHeader, Section, useTo } from "../parts";

import { introOf } from "./Generic";

const PHOTOS = [
  {
    src: "https://res.cloudinary.com/keenan-payne/image/upload/f_auto,q_auto,w_800/v1666204078/people/me/jun-27-2021_o8sd0l.jpg",
    alt: "Me in grayscale"
  },
  {
    src: "https://res.cloudinary.com/keenan-payne/image/upload/f_auto,q_auto,w_800/v1666204077/people/me/dec-26-2021_iuhh3w.jpg",
    alt: "Me being cold"
  },
  {
    src: "https://res.cloudinary.com/keenan-payne/image/upload/f_auto,q_auto,w_800/v1666204078/people/me/jul-5-2020_lwglyk.jpg",
    alt: "Hanging out with my high school buddies"
  }
];

export function About({ page }: { page: BasicPageModel }) {
  const intro = introOf(page);
  const to = useTo();

  const facts: [string, React.ReactNode][] = [
    ["Based in", "Denver, Colorado"],
    ["Experience", "Eighteen years on the web"],
    ["Previously", <a href={to("/portfolio/asana/")}>Asana, 2014–2019</a>],
    ["Shows a year", "About thirty"],
    ["Off the clock", "Magic: The Gathering, travel, family"],
    [
      "Elsewhere",
      [1, 4, 6, 2].map((id, index) => (
        <span key={id}>
          {index > 0 && " – "}
          <a href={socials[id].url}>{socials[id].name}</a>
        </span>
      ))
    ]
  ];

  return (
    <>
      <PageHeader
        icon="user"
        eyebrow="About"
        title={intro?.heading ?? "About"}
        lede={intro?.subheading}
      />

      <section className="mg-section mg-about">
        <div className="mg-about__body">
          <p className="mg-label">
            <Icon name="pen" />
            In brief
          </p>
          {intro?.body && <Html className="mg-prose" html={intro.body} />}
        </div>

        <aside className="mg-about__aside">
          <p className="mg-label">
            <Icon name="list" />
            At a glance
          </p>
          <dl className="mg-facts">
            {facts.map(([term, detail]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{detail}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </section>

      <Section icon="camera" label="Photos of me and others">
        <div className="mg-row mg-row--thirds mg-photos">
          {PHOTOS.map((photo) => (
            <figure className="mg-card" key={photo.src}>
              <div className="mg-figure mg-figure--portrait">
                <img src={photo.src} alt={photo.alt} loading="lazy" />
              </div>
              <figcaption className="mg-meta">{photo.alt}</figcaption>
            </figure>
          ))}
        </div>
      </Section>
    </>
  );
}
