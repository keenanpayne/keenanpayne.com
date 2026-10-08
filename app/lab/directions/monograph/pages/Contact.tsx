import { useState, type FormEvent } from "react";

import type { BasicPageModel } from "../../../../lib/types";
import { Html, Icon, MoreLink, PageHeader, useTo } from "../parts";

import { introOf } from "./Generic";

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
  <label className={wide ? "mg-field mg-field--wide" : "mg-field"}>
    <span className="mg-field__label">{label}</span>
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
  const [sent, setSent] = useState(false);
  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <>
      <PageHeader
        icon="mail"
        eyebrow={variant === "contact" ? "Contact" : "Project inquiry"}
        title={intro?.heading ?? page.meta.title}
      />

      <section className="mg-section mg-contact">
        <aside className="mg-contact__aside">
          {intro?.subheading && (
            <Html as="p" className="mg-contact__lede" html={intro.subheading} />
          )}
          <dl className="mg-facts">
            <div>
              <dt>Email</dt>
              <dd>
                <a href="mailto:contact@keenanpayne.com">
                  contact@keenanpayne.com
                </a>
              </dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>Denver, Colorado (Mountain Time)</dd>
            </div>
          </dl>
          {variant === "contact" ? (
            <MoreLink href={to("/project-inquiry/")}>
              Start a project inquiry instead
            </MoreLink>
          ) : (
            <MoreLink href={to("/contact/")}>Just saying hello?</MoreLink>
          )}
        </aside>

        <form className="mg-form" onSubmit={onSubmit}>
          <p className="mg-label mg-field--wide">
            <Icon name="pen" />
            {variant === "contact"
              ? "Send a note"
              : "Tell me about your project"}
          </p>

          <Field label="Name">
            <input
              className="mg-input"
              type="text"
              placeholder="First and last name"
            />
          </Field>
          <Field label="Email">
            <input
              className="mg-input"
              type="email"
              placeholder="email@company.com"
            />
          </Field>

          {variant === "contact" ? (
            <Field label="What would you like to share?" wide>
              <textarea className="mg-input" rows={6} />
            </Field>
          ) : (
            <>
              <Field label="Company">
                <input
                  className="mg-input"
                  type="text"
                  placeholder="Company name"
                />
              </Field>
              <Field label="Website">
                <input
                  className="mg-input"
                  type="url"
                  placeholder="If you have one"
                />
              </Field>

              <fieldset className="mg-field mg-field--wide">
                <legend className="mg-field__label">
                  What services are you interested in?
                </legend>
                <div className="mg-toggles">
                  {SERVICES.map((service) => (
                    <label className="mg-toggle" key={service}>
                      <input type="checkbox" />
                      <span>{service}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <Field label="Please tell me about your company and project" wide>
                <textarea
                  className="mg-input"
                  rows={7}
                  placeholder={
                    "What does your company do?\nWhat do you hope to do?\nHow can I help you reach your goals?"
                  }
                />
              </Field>

              <Field label="Ideal launch date">
                <input className="mg-input" type="date" />
              </Field>

              <fieldset className="mg-field">
                <legend className="mg-field__label">
                  Is your launch date flexible?
                </legend>
                <div className="mg-toggles">
                  {["Yes", "No"].map((answer) => (
                    <label className="mg-toggle" key={answer}>
                      <input type="radio" name="mg-flexible" />
                      <span>{answer}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="mg-field mg-field--wide">
                <legend className="mg-field__label">Project budget</legend>
                <div className="mg-toggles">
                  {BUDGETS.map((budget) => (
                    <label className="mg-toggle" key={budget}>
                      <input type="radio" name="mg-budget" />
                      <span>{budget}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </>
          )}

          <div className="mg-form__actions mg-field--wide">
            <button className="mg-pill" type="submit">
              {variant === "contact" ? "Send message" : "Send inquiry"}
            </button>
            <p className="mg-meta" role="status">
              {sent
                ? "Mockup only — nothing was sent."
                : "Mockup only — this form doesn’t send anything."}
            </p>
          </div>
        </form>
      </section>
    </>
  );
}
