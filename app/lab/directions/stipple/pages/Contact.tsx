import { useState, type FormEvent } from "react";

import {
  formFields,
  introOf,
  useLocalTime,
  useTo,
  type TemplateProps
} from "../../../site";
import {
  Facts,
  FormField,
  Layout,
  More,
  mockStatus,
  PageHeader,
  Terrain
} from "../parts";

/** Mock contact and project inquiry forms; the lab never submits anything */
export function Contact({
  kind,
  page,
  content
}: TemplateProps<"contact" | "inquiry">) {
  const to = useTo();
  const time = useLocalTime();
  const intro = introOf(page);
  const { email, location } = content.profile;
  const [sent, setSent] = useState(false);
  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <Layout
      rail={
        <section className="st-railNote" aria-labelledby="st-reach">
          <Terrain className="st-railNote__art" seed={page.url} scale={120} />
          <h2 id="st-reach">Direct line</h2>
          <Facts
            rows={[
              ["Email", <a href={`mailto:${email}`}>{email}</a>],
              ["Based in", location.name],
              ["Local time", time ? `${time} (${location.timeZoneName})` : "—"]
            ]}
          />
        </section>
      }
    >
      <PageHeader
        crumbs={
          kind === "contact" ? (
            <span>Contact</span>
          ) : (
            <>
              <a href={to("/contact/")}>Contact</a>
              <span aria-hidden="true">/</span>
              <span>Project inquiry</span>
            </>
          )
        }
        title={intro?.heading ?? page.meta.title}
        lede={intro?.subheading}
      >
        <p className="st-actions">
          {kind === "contact" ? (
            <More href={to("/project-inquiry/")}>
              Start a project inquiry instead
            </More>
          ) : (
            <More href={to("/contact/")}>Just saying hello?</More>
          )}
        </p>
      </PageHeader>

      <form className="st-form" onSubmit={onSubmit}>
        {formFields(kind === "contact" ? "contact" : "inquiry").map((field) => (
          <FormField key={field.name} field={field} />
        ))}
        <p className="st-form__submit">
          <button className="st-button" type="submit">
            {kind === "contact" ? "Send message" : "Send inquiry"}
          </button>
          <span role="status">{mockStatus(sent)}</span>
        </p>
      </form>
    </Layout>
  );
}
