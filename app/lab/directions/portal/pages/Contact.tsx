import { useState, type FormEvent, type ReactNode } from "react";

import { socials } from "../../../../data/socials";
import type { BasicPageModel } from "../../../../lib/types";
import {
  Directory,
  Html,
  Intro,
  introOf,
  Mascot,
  Pill,
  Sprite,
  TitleBar,
  useDenverTime,
  useTo
} from "../parts";
import { ITEMS } from "../sprites";
import { Address } from "./About";

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
  children: ReactNode;
}) => (
  <label className={wide ? "pt-field pt-field--wide" : "pt-field"}>
    <span className="pt-field__label">{label}</span>
    {children}
  </label>
);

const Choices = ({
  legend,
  name,
  type,
  options,
  wide
}: {
  legend: string;
  name: string;
  type: "checkbox" | "radio";
  options: string[];
  wide?: boolean;
}) => (
  <fieldset className={wide ? "pt-field pt-field--wide" : "pt-field"}>
    <legend className="pt-field__label">{legend}</legend>
    <div className="pt-choices">
      {options.map((option) => (
        <label className="pt-choice" key={option}>
          <input type={type} name={name} />
          <span>{option}</span>
        </label>
      ))}
    </div>
  </fieldset>
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

  const contacts: [ReactNode, ReactNode][] = [
    [
      "General questions:",
      <a className="pt-tri" href="mailto:contact@keenanpayne.com">
        contact@keenanpayne.com
      </a>
    ],
    [
      "Project inquiries:",
      <a className="pt-tri" href={to("/project-inquiry/")}>
        Fill out the project inquiry form
      </a>
    ],
    [
      "Services:",
      <a className="pt-tri" href={to("/services/")}>
        See what I can help with
      </a>
    ],
    [
      "Other directories:",
      <span className="pt-dir__links">
        {[1, 4, 6, 2, 3].map((id) => (
          <a
            key={id}
            className="pt-tri"
            href={socials[id].url}
            rel={socials[id].name === "Mastodon" ? "me" : undefined}
          >
            {socials[id].name}
          </a>
        ))}
      </span>
    ],
    [
      "Writing:",
      <a className="pt-tri" href="/feed.xml">
        Subscribe by RSS
      </a>
    ],
    ["Local time:", <span>{time ? `${time} in Denver` : "—"}</span>]
  ];

  return (
    <>
      <TitleBar title={variant === "contact" ? "Contact" : "Project inquiry"} />

      <div className="pt-split">
        <aside className="pt-split__aside">
          <Address />
          <Mascot item="mail" className="pt-split__mascot" />
        </aside>

        <div className="pt-split__main">
          <Intro heading={intro?.heading} />
          {intro?.subheading && (
            <Html as="p" className="pt-intro__lede" html={intro.subheading} />
          )}

          {variant === "contact" && (
            <Directory title="Contacts" rows={contacts} />
          )}

          <section className="pt-formbox">
            <h2 className="pt-dir__title">
              <Sprite art={ITEMS.star} scale={4} className="pt-dir__star" />
              <span>
                {variant === "contact" ? "Send a message" : "Mission request"}
              </span>
            </h2>
            <form className="pt-form" onSubmit={onSubmit}>
              <Field label="Name">
                <input
                  className="pt-input"
                  type="text"
                  placeholder="First and last name"
                />
              </Field>
              <Field label="Email">
                <input
                  className="pt-input"
                  type="email"
                  placeholder="email@company.com"
                />
              </Field>

              {variant === "contact" ? (
                <Field label="What would you like to share?" wide>
                  <textarea className="pt-input" rows={6} />
                </Field>
              ) : (
                <>
                  <Field label="Company">
                    <input
                      className="pt-input"
                      type="text"
                      placeholder="Company name"
                    />
                  </Field>
                  <Field label="Website">
                    <input
                      className="pt-input"
                      type="url"
                      placeholder="If you have one"
                    />
                  </Field>
                  <Choices
                    legend="What services are you interested in?"
                    name="pt-services"
                    type="checkbox"
                    options={SERVICES}
                    wide
                  />
                  <Field
                    label="Please tell me about your company and project"
                    wide
                  >
                    <textarea
                      className="pt-input"
                      rows={7}
                      placeholder={
                        "What does your company do?\nWhat do you hope to do?\nHow can I help you reach your goals?"
                      }
                    />
                  </Field>
                  <Field label="Ideal launch date">
                    <input className="pt-input" type="date" />
                  </Field>
                  <Choices
                    legend="Is your launch date flexible?"
                    name="pt-flexible"
                    type="radio"
                    options={["Yes", "No"]}
                  />
                  <Choices
                    legend="Project budget"
                    name="pt-budget"
                    type="radio"
                    options={BUDGETS}
                    wide
                  />
                </>
              )}

              <div className="pt-form__actions pt-field--wide">
                <Pill type="submit" icon="mail" tone="orange">
                  {variant === "contact" ? "Send message" : "Send inquiry"}
                </Pill>
                <p className="pt-note" role="status">
                  {sent
                    ? "Message held — mockup only, nothing was sent."
                    : "Mockup only — this form doesn’t send anything."}
                </p>
              </div>
            </form>
          </section>

          {variant === "inquiry" && (
            <Directory title="Other ways to reach me" rows={contacts} />
          )}
        </div>
      </div>
    </>
  );
}
