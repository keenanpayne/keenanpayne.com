import { Link } from "react-router";

export function Cta() {
  return (
    <section className="cta _page-spacing-top _page-spacing-bottom _container">
      <div className="cta-content _container">
        <h2 className="cta-title _text-larger _font-family-serif">
          Interested in working together?
        </h2>

        <p className="cta-subheading _text-h5">
          I have availability throughout Q3–Q4 2025 and would love to help you
          with your next project.
        </p>

        <p className="cta-link">
          <Link className="button -primary" to="/project-inquiry/">
            Get in touch →
          </Link>
        </p>
      </div>
    </section>
  );
}
