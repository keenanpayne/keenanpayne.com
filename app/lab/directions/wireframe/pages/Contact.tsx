import { useState, type FormEvent } from "react";

import {
  formOf,
  introOf,
  titleOf,
  useTo,
  type TemplateProps
} from "../../../site";
import { Facts, FormField, PageHeader } from "../parts";

/** Mock contact and project inquiry forms; the lab never submits anything */
export function Contact({
  kind,
  page,
  content
}: TemplateProps<"contact" | "inquiry">) {
  const to = useTo();
  const intro = introOf(page);
  const { email, location } = content.profile;
  const form = formOf(kind);
  const [sent, setSent] = useState(false);
  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <>
      <PageHeader
        eyebrow={form.title}
        title={titleOf(page)}
        lede={intro?.subheading}
      >
        <Facts
          rows={[
            ["Email", <a href={`mailto:${email}`}>{email}</a>],
            ["Location", `${location.name} (${location.timeZoneName})`]
          ]}
        />
        <p>
          <a href={to(form.alternate.path)}>{form.alternate.text}</a>
        </p>
      </PageHeader>

      <form className="wireframe-form" onSubmit={onSubmit}>
        {form.fields.map((field) => (
          <FormField key={field.name} field={field} />
        ))}
        <p className="wireframe-field--wide">
          <button type="submit">{form.submit}</button>{" "}
          <span className="wireframe-meta" role="status">
            {sent
              ? "Mockup only — nothing was sent."
              : "Mockup only — this form doesn’t send anything."}
          </span>
        </p>
      </form>
    </>
  );
}
