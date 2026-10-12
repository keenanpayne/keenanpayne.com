import { useState, type FormEvent } from "react";

import { formOf, introOf, useTo, type TemplateProps } from "../../../site";
import { FrontRange } from "../FrontRange";
import {
  DirectLine,
  FormField,
  Layout,
  More,
  mockStatus,
  PageHeader
} from "../parts";

/** Mock contact and project inquiry forms; the lab never submits anything */
export function Contact({
  kind,
  page,
  content
}: TemplateProps<"contact" | "inquiry">) {
  const to = useTo();
  const form = formOf(kind);
  const intro = introOf(page);
  const [sent, setSent] = useState(false);
  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <>
      {kind === "contact" && (
        <FrontRange className="st-vista" location={content.profile.location} />
      )}

      <Layout
        rail={
          <DirectLine
            profile={content.profile}
            ground={kind === "inquiry" ? page.url : undefined}
          />
        }
      >
        <PageHeader
          crumbs={
            kind === "contact" ? (
              <span>{form.title}</span>
            ) : (
              <>
                <a href={to("/contact/")}>Contact</a>
                <span aria-hidden="true">/</span>
                <span>{form.title}</span>
              </>
            )
          }
          title={intro?.heading ?? page.meta.title}
          lede={intro?.subheading}
        >
          <p className="st-actions">
            <More href={to(form.alternate.path)}>{form.alternate.text}</More>
          </p>
        </PageHeader>

        <form className="st-form" onSubmit={onSubmit}>
          {form.fields.map((field) => (
            <FormField key={field.name} field={field} />
          ))}
          <p className="st-form__submit">
            <button className="st-button" type="submit">
              {form.submit}
            </button>
            <span role="status">{mockStatus(sent)}</span>
          </p>
        </form>
      </Layout>
    </>
  );
}
