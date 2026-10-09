import { useState, type FormEvent } from "react";

import type { BasicPageModel, LabContent } from "../../../../lib/types";
import {
  formFields,
  Html,
  introOf,
  useTo,
  type FormField as Field
} from "../../../site";
import { Icon, MoreLink, PageHeader } from "../parts";

function FormField({ field }: { field: Field }) {
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
                <a href={`mailto:${email}`}>{email}</a>
              </dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>{`${location.name} (${location.timeZoneName})`}</dd>
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

          {formFields(variant).map((field) => (
            <FormField key={field.name} field={field} />
          ))}

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
