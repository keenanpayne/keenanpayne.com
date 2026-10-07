import type { SocialProofLogosSection } from "../../lib/types";

export function SocialProofLogos({
  section
}: {
  section: SocialProofLogosSection;
}) {
  return (
    <section className="_page-spacing-top _page-spacing-bottom _container">
      <p className="_label">
        <span>Trusted by incredible companies</span>
      </p>

      <div className="socialProofLogos">
        {section.logos.map((logo) => (
          <div
            key={logo.name}
            className={`socialProofLogos-logo -${logo.name}`}
            dangerouslySetInnerHTML={{ __html: logo.svg }}
          />
        ))}
      </div>
    </section>
  );
}
