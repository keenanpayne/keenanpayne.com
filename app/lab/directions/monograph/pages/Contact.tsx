import { useState, type FormEvent } from "react";

import type { BasicPageModel, LabContent } from "../../../../lib/types";
import {
  formOf,
  Html,
  introOf,
  useTo,
  type FormField as Field
} from "../../../site";
import { Facts, Icon, MoreLink, PageHeader } from "../parts";

export function FormField({ field }: { field: Field }) {
  const className = field.wide ? "mg-field mg-field--wide" : "mg-field";

  if (field.kind === "choices") {
    return (
      <fieldset className={className}>
        <legend className="mg-field__label">{field.label}</legend>
        <div className="mg-toggles">
          {field.options.map((option) => (
            <label className="mg-toggle" key={option}>
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
      <span className="mg-field__label">{field.label}</span>
      {field.kind === "textarea" ? (
        <textarea
          className="mg-input"
          name={field.name}
          rows={field.rows}
          placeholder={field.placeholder}
        />
      ) : (
        <input
          className="mg-input"
          type={field.type}
          name={field.name}
          placeholder={field.placeholder}
        />
      )}
    </label>
  );
}

/** The form beside the details, with the page's lede above them */
export function ContactForm({
  profile,
  variant,
  lede
}: {
  profile: LabContent["profile"];
  variant: "contact" | "inquiry";
  /** HTML */
  lede?: string;
}) {
  const form = formOf(variant);
  const { email, location } = profile;
  const to = useTo();
  const [sent, setSent] = useState(false);
  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <section className="mg-section mg-contact">
      <aside className="mg-contact__aside">
        {lede && <Html as="p" className="mg-contact__lede" html={lede} />}
        <Facts
          rows={[
            ["Email", <a href={`mailto:${email}`}>{email}</a>],
            ["Location", `${location.name} (${location.timeZoneName})`]
          ]}
        />
        <MoreLink href={to(form.alternate.path)}>
          {form.alternate.text}
        </MoreLink>
      </aside>

      <form className="mg-form" onSubmit={onSubmit}>
        <p className="mg-label mg-field--wide">
          <Icon name="pen" />
          {variant === "contact" ? "Send a note" : "Tell me about your project"}
        </p>

        {form.fields.map((field) => (
          <FormField key={field.name} field={field} />
        ))}

        <div className="mg-form__actions mg-field--wide">
          <button className="mg-pill" type="submit">
            {form.submit}
          </button>
          <p className="mg-meta" role="status">
            {sent
              ? "Mockup only — nothing was sent."
              : "Mockup only — this form doesn’t send anything."}
          </p>
        </div>
      </form>
    </section>
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

  return (
    <>
      <PageHeader
        icon="mail"
        eyebrow={formOf(variant).title}
        title={intro?.heading ?? page.meta.title}
      />

      <ContactForm
        profile={content.profile}
        variant={variant}
        lede={intro?.subheading}
      />
    </>
  );
}
