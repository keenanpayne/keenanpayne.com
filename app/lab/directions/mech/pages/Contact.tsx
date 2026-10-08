import { useState, type FormEvent } from "react";

import type { BasicPageModel } from "../../../../lib/types";
import {
  Button,
  Html,
  introOf,
  MoreLink,
  PageHeader,
  Panel,
  useDenverTime,
  useTo
} from "../parts";

const SERVICES = [
  "Website design",
  "Website development",
  "Web application development",
  "User Interface (UI) design",
  "User Experience (UX) research",
  "Other",
  "Not sure yet"
];

const BUDGETS = [
  "Less than $10,000",
  "$10,000 - $25,000",
  "$25,000 - $50,000",
  "More than $50,000"
];

const Field = ({
  label,
  wide,
  children
}: {
  label: string;
  wide?: boolean;
  children: React.ReactNode;
}) => (
  <label className={wide ? "mc-field mc-field--wide" : "mc-field"}>
    <span className="mc-field__label">{label}</span>
    {children}
  </label>
);

/** Mock contact and project inquiry forms; the lab never submits anything */
export function Contact({
  page,
  variant
}: {
  page: BasicPageModel;
  variant: "contact" | "inquiry";
}) {
  const intro = introOf(page);
  const to = useTo();
  const time = useDenverTime();
  const [sent, setSent] = useState(false);
  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <>
      <PageHeader
        episode={variant === "contact" ? "Episode:06" : "Episode:07"}
        eyebrow={variant === "contact" ? "Contact" : "Project inquiry"}
        jp={variant === "contact" ? "通信" : "依頼"}
        title={intro?.heading ?? page.meta.title}
      />

      <section className="mc-section mc-split mc-contact">
        <Panel as="aside" label="Comms channel" code="Open">
          <div className="mc-contact__aside">
            {intro?.subheading && (
              <Html
                as="p"
                className="mc-contact__lede"
                html={intro.subheading}
              />
            )}
            <dl className="mc-spec mc-spec--compact">
              <div>
                <dt>Frequency</dt>
                <dd>
                  <a href="mailto:contact@keenanpayne.com">
                    contact@keenanpayne.com
                  </a>
                </dd>
              </div>
              <div>
                <dt>Base</dt>
                <dd>Denver, Colorado (Mountain Time)</dd>
              </div>
              <div>
                <dt>Local time</dt>
                <dd className="mc-contact__time">{time ?? "--:--:--"}</dd>
              </div>
            </dl>
            {variant === "contact" ? (
              <MoreLink href={to("/project-inquiry/")}>
                Start a project inquiry instead
              </MoreLink>
            ) : (
              <MoreLink href={to("/contact/")}>Just saying hello?</MoreLink>
            )}
          </div>
        </Panel>

        <Panel
          label={
            variant === "contact" ? "Compose transmission" : "Mission request"
          }
          code={sent ? "Held" : "Ready"}
        >
          <form className="mc-form" onSubmit={onSubmit}>
            <Field label="Name">
              <input
                className="mc-input"
                type="text"
                placeholder="First and last name"
              />
            </Field>
            <Field label="Email">
              <input
                className="mc-input"
                type="email"
                placeholder="email@company.com"
              />
            </Field>

            {variant === "contact" ? (
              <Field label="What would you like to share?" wide>
                <textarea className="mc-input" rows={6} />
              </Field>
            ) : (
              <>
                <Field label="Company">
                  <input
                    className="mc-input"
                    type="text"
                    placeholder="Company name"
                  />
                </Field>
                <Field label="Website">
                  <input
                    className="mc-input"
                    type="url"
                    placeholder="If you have one"
                  />
                </Field>

                <fieldset className="mc-field mc-field--wide">
                  <legend className="mc-field__label">
                    What services are you interested in?
                  </legend>
                  <div className="mc-toggles">
                    {SERVICES.map((service) => (
                      <label className="mc-toggle" key={service}>
                        <input type="checkbox" />
                        <span>{service}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <Field
                  label="Please tell me about your company and project"
                  wide
                >
                  <textarea
                    className="mc-input"
                    rows={7}
                    placeholder={
                      "What does your company do?\nWhat do you hope to do?\nHow can I help you reach your goals?"
                    }
                  />
                </Field>

                <Field label="Ideal launch date">
                  <input className="mc-input" type="date" />
                </Field>

                <fieldset className="mc-field">
                  <legend className="mc-field__label">
                    Is your launch date flexible?
                  </legend>
                  <div className="mc-toggles">
                    {["Yes", "No"].map((answer) => (
                      <label className="mc-toggle" key={answer}>
                        <input type="radio" name="mc-flexible" />
                        <span>{answer}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="mc-field mc-field--wide">
                  <legend className="mc-field__label">Project budget</legend>
                  <div className="mc-toggles">
                    {BUDGETS.map((budget) => (
                      <label className="mc-toggle" key={budget}>
                        <input type="radio" name="mc-budget" />
                        <span>{budget}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </>
            )}

            <div className="mc-form__actions mc-field--wide">
              <Button type="submit">
                {variant === "contact" ? "Transmit" : "Send inquiry"}
              </Button>
              <p className="mc-form__status" role="status">
                {sent
                  ? "Transmission held — mockup only, nothing was sent."
                  : "Mockup only — this form doesn’t send anything."}
              </p>
            </div>
          </form>
        </Panel>
      </section>
    </>
  );
}
