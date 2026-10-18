import type { BasicPageModel, LabContent } from "../../../../lib/types";
import {
  formOf,
  Html,
  introOf,
  LocalTime,
  useSubmission,
  useTo,
  type FormField as Field
} from "../../../site";
import { Button, MoreLink, PageHeader, Panel } from "../parts";

export function FormField({ field }: { field: Field }) {
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

/** The contact and project inquiry forms, beside the comms channel */
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
  const form = formOf(variant);
  const { props, hidden, status, sent } = useSubmission(variant);

  return (
    <>
      <PageHeader
        episode={variant === "contact" ? "Episode:06" : "Episode:07"}
        eyebrow={form.title}
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
                <dd className="mc-contact__time">
                  <LocalTime hour12={false} seconds placeholder="--:--:--" />
                </dd>
              </div>
            </dl>
            <MoreLink href={to(form.alternate.path)}>
              {form.alternate.text}
            </MoreLink>
          </div>
        </Panel>

        <Panel
          label={
            variant === "contact" ? "Compose transmission" : "Mission request"
          }
          code={sent ? "Held" : "Ready"}
        >
          <form className="mc-form" {...props}>
            {hidden}
            {form.fields.map((field) => (
              <FormField key={field.name} field={field} />
            ))}

            <div className="mc-form__actions mc-field--wide">
              <Button type="submit">{form.submit}</Button>
              {status && (
                <p className="mc-form__status" role="status">
                  {sent
                    ? "Transmission held — mockup only, nothing was sent."
                    : status}
                </p>
              )}
            </div>
          </form>
        </Panel>
      </section>
    </>
  );
}
