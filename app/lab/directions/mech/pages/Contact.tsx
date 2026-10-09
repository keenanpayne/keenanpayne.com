import { useState, type FormEvent } from "react";

import type { BasicPageModel, LabContent } from "../../../../lib/types";
import {
  formFields,
  Html,
  introOf,
  useLocalTime,
  useTo,
  type FormField as Field
} from "../../../site";
import { Button, MoreLink, PageHeader, Panel } from "../parts";

function FormField({ field }: { field: Field }) {
  const className = field.wide ? "mc-field mc-field--wide" : "mc-field";

  if (field.kind === "choices") {
    return (
      <fieldset className={className}>
        <legend className="mc-field__label">{field.label}</legend>
        <div className="mc-toggles">
          {field.options.map((option) => (
            <label className="mc-toggle" key={option}>
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
      <span className="mc-field__label">{field.label}</span>
      {field.kind === "textarea" ? (
        <textarea
          className="mc-input"
          name={field.name}
          rows={field.rows}
          placeholder={field.placeholder}
        />
      ) : (
        <input
          className="mc-input"
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
  const time = useLocalTime({ hour12: false, seconds: true });
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
                  <a href={`mailto:${email}`}>{email}</a>
                </dd>
              </div>
              <div>
                <dt>Base</dt>
                <dd>{`${location.name} (${location.timeZoneName})`}</dd>
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
            {formFields(variant).map((field) => (
              <FormField key={field.name} field={field} />
            ))}

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
