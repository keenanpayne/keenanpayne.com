import type { ReactNode } from "react";

import { introOf, relabel, type TemplateProps, titleOf } from "../../../site";
import { Band, Cells, Copy, Facts, PageHeader, SectionHead } from "../parts";

export function About({ page, content }: TemplateProps<"about">) {
  const intro = introOf(page);
  const { profile, socials } = content;
  const facts = relabel(profile.facts, { offDuty: "Off duty" });

  return (
    <>
      <PageHeader
        eyebrow="About"
        title={titleOf(page)}
        lede={intro?.subheading}
      />

      <Band label="Story">
        <div className="gl-split">
          <div className="gl-pad">
            {intro?.body && <Copy html={intro.body} />}
          </div>
          <div className="gl-pad gl-about__aside">
            <img
              className="gl-about__portrait"
              src={profile.avatar}
              alt={profile.name}
            />
            <p className="gl-label">At a glance</p>
            <Facts
              rows={[
                ...facts.map((fact): [string, ReactNode] => [
                  fact.label,
                  fact.url ? <a href={fact.url}>{fact.text}</a> : fact.text
                ]),
                [
                  "Elsewhere",
                  socials.map((social, index) => (
                    <span key={social.url}>
                      {index > 0 && ", "}
                      <a href={social.url} rel={social.rel}>
                        {social.text}
                      </a>
                    </span>
                  ))
                ]
              ]}
            />
          </div>
        </div>
      </Band>

      <Band invert>
        <SectionHead eyebrow="Photos" title="Away from the desk" />
        <Cells cols={3}>
          {profile.photos.map((photo) => (
            <li key={photo.src} className="gl-cell">
              <figure className="gl-photo">
                <a href={photo.large}>
                  <img src={photo.src} alt={photo.alt} loading="lazy" />
                </a>
                <figcaption>{photo.alt}</figcaption>
              </figure>
            </li>
          ))}
        </Cells>
      </Band>
    </>
  );
}
