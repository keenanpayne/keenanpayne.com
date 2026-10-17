import type { SocialProofLogosSection } from "../../lib/types";
import { Label } from "../Label";

export function SocialProofLogos({
  section
}: {
  section: SocialProofLogosSection;
}) {
  return (
    <section className="_page-spacing-top _page-spacing-bottom _container">
      <Label text="Trusted by incredible companies" />

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
