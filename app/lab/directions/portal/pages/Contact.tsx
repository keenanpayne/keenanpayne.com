import { useState, type FormEvent, type ReactNode } from "react";

import type { BasicPageModel, LabContent } from "../../../../lib/types";
import {
  formFields,
  Html,
  introOf,
  useLocalTime,
  useTo,
  type FormField as Field
} from "../../../site";
import { Directory, Intro, Mascot, Pill, Sprite, TitleBar } from "../parts";
import { ITEMS } from "../sprites";
import { Address } from "./About";

export function FormField({ field }: { field: Field }) {
  const className = field.wide ? "pt-field pt-field--wide" : "pt-field";

  if (field.kind === "choices") {
    return (
      <fieldset className={className}>
        <legend className="pt-field__label">{field.label}</legend>
        <div className="pt-choices">
          {field.options.map((option) => (
            <label className="pt-choice" key={option}>
              <input type={field.type} name={field.name} value={option} />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  return (
    <label className={className}>
      <span className="pt-field__label">{field.label}</span>
      {field.kind === "textarea" ? (
        <textarea
          className="pt-input"
          name={field.name}
          rows={field.rows}
          placeholder={field.placeholder}
        />
      ) : (
        <input
          className="pt-input"
          type={field.type}
          name={field.name}
          placeholder={field.placeholder}
        />
      )}
    </label>
  );
}

/** Mock contact and project inquiry forms; the lab never submits anything */
export function Contact({
  page,
  content,
  variant
}: {
  page: BasicPageModel;
  content: LabContent;
  variant: "contact" | "inquiry";
}) {
  const intro = introOf(page);
  const { email, location } = content.profile;
  const to = useTo();
  const time = useLocalTime();
  const [sent, setSent] = useState(false);
  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSent(true);
  };

  const contacts: [ReactNode, ReactNode][] = [
    [
      "General questions:",
      <a className="pt-tri" href={`mailto:${email}`}>
        {email}
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
        {content.socials.map((social) => (
          <a
            key={social.url}
            className="pt-tri"
            href={social.url}
            rel={social.rel}
          >
            {social.text}
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
    ["Local time:", <span>{time ? `${time} in ${location.city}` : "—"}</span>]
  ];

  return (
    <>
      <TitleBar title={variant === "contact" ? "Contact" : "Project inquiry"} />

      <div className="pt-split">
        <aside className="pt-split__aside">
          <Address profile={content.profile} />
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
              {formFields(variant).map((field) => (
                <FormField key={field.name} field={field} />
              ))}

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
