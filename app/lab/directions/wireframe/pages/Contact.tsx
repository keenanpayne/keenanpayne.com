import { useState, type FormEvent } from "react";

import { formFields, introOf, useTo, type TemplateProps } from "../../../site";
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
  const variant = kind === "contact" ? "contact" : "inquiry";
  const [sent, setSent] = useState(false);
  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <>
      <PageHeader
        eyebrow={kind === "contact" ? "Contact" : "Project inquiry"}
        title={intro?.heading ?? page.meta.title}
        lede={intro?.subheading}
      >
        <Facts
          rows={[
            ["Email", <a href={`mailto:${email}`}>{email}</a>],
            ["Location", `${location.name} (${location.timeZoneName})`]
          ]}
        />
        <p>
          {kind === "contact" ? (
            <a href={to("/project-inquiry/")}>
              Start a project inquiry instead
            </a>
          ) : (
            <a href={to("/contact/")}>Just saying hello?</a>
          )}
        </p>
      </PageHeader>

      <form className="wireframe-form" onSubmit={onSubmit}>
        {formFields(variant).map((field) => (
          <FormField key={field.name} field={field} />
        ))}
        <p className="wireframe-field--wide">
          <button type="submit">
            {kind === "contact" ? "Send message" : "Send inquiry"}
          </button>{" "}
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
