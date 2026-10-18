import { useState, type ReactNode } from "react";

import { metadata } from "../../../../lib/site";
import type { BasicPageModel, LabContent } from "../../../../lib/types";
import {
  formOf,
  Html,
  introOf,
  titleOf,
  useLocalTime,
  useTo,
  type FormField as Field
} from "../../../site";
import { cx, Directory, Intro, Mascot, Pill, Sprite, TitleBar } from "../parts";
import { ITEMS } from "../sprites";
import { Address } from "./About";

export function FormField({ field }: { field: Field }) {
  const className = cx("pt-field", field.wide && "pt-field--wide");

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

/** The contact or inquiry form under a directory tab; the lab never sends it */
export function MessageForm({ variant }: { variant: "contact" | "inquiry" }) {
  const to = useTo();
  const form = formOf(variant);
  const [sent, setSent] = useState(false);

  return (
    <section className="pt-formbox">
      <h2 className="pt-dir__title">
        <Sprite art={ITEMS.star} scale={4} className="pt-dir__star" />
        <span>
          {variant === "contact" ? "Send a message" : "Mission request"}
        </span>
      </h2>
      <form
        className="pt-form"
        onSubmit={(event) => {
          event.preventDefault();
          setSent(true);
        }}
      >
        {form.fields.map((field) => (
          <FormField key={field.name} field={field} />
        ))}

        <div className="pt-form__actions pt-field--wide">
          <Pill type="submit" icon="mail" tone="orange">
            {form.submit}
          </Pill>
          <p className="pt-note" role="status">
            {sent
              ? "Message held — mockup only, nothing was sent."
              : "Mockup only — this form doesn’t send anything."}
          </p>
        </div>
      </form>
      <p className="pt-formbox__alt">
        <a className="pt-tri" href={to(form.alternate.path)}>
          {form.alternate.text}
        </a>
      </p>
    </section>
  );
}

/** Ticks on its own, so the page around it doesn't re-render each minute */
function LocalClock({ city }: { city: string }) {
  const time = useLocalTime();
  return time ? `${time} in ${city}` : "—";
}

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
      <a className="pt-tri" href={metadata.feed.path}>
        Subscribe by RSS
      </a>
    ],
    [
      "Local time:",
      <span>
        <LocalClock city={location.city} />
      </span>
    ]
  ];

  return (
    <>
      <TitleBar title={formOf(variant).title} as="p" />

      <div className="pt-split">
        <aside className="pt-split__aside">
          <Address profile={content.profile} />
          <Mascot item="mail" className="pt-split__mascot" />
        </aside>

        <div className="pt-split__main">
          <Intro heading={titleOf(page)} as="h1" />
          {intro?.subheading && (
            <Html as="p" className="pt-intro__lede" html={intro.subheading} />
          )}

          {variant === "contact" && (
            <Directory title="Contacts" rows={contacts} />
          )}

          <MessageForm variant={variant} />

          {variant === "inquiry" && (
            <Directory title="Other ways to reach me" rows={contacts} />
          )}
        </div>
      </div>
    </>
  );
}
