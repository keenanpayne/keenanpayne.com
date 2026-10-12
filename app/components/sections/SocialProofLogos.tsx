import asana from "../../assets/svg/asana.svg?raw";
import gofundme from "../../assets/svg/gofundme.svg?raw";
import neuralink from "../../assets/svg/neuralink.svg?raw";
import rippling from "../../assets/svg/rippling.svg?raw";
import stable from "../../assets/svg/stable.svg?raw";
import { Label } from "../Label";

const LOGOS = [
  { name: "asana", svg: asana },
  { name: "gofundme", svg: gofundme },
  { name: "rippling", svg: rippling },
  { name: "neuralink", svg: neuralink },
  { name: "stable", svg: stable }
];

export function SocialProofLogos() {
  return (
    <section className="_page-spacing-top _page-spacing-bottom _container">
      <Label text="Trusted by incredible companies" />

      <div className="socialProofLogos">
        {LOGOS.map((logo) => (
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
