import {
  formOf,
  introOf,
  LocalTime,
  useTo,
  type TemplateProps
} from "../../../site";
import { Band, Facts, Form, More, PageHeader } from "../parts";

/** The contact and project inquiry forms, beside the ways to reach me */
export function Contact({
  kind,
  page,
  content
}: TemplateProps<"contact" | "inquiry">) {
  const to = useTo();
  const intro = introOf(page);
  const { email, location } = content.profile;
  const form = formOf(kind);

  return (
    <>
      <PageHeader
        eyebrow={form.title}
        title={intro?.heading ?? page.meta.title}
        lede={intro?.subheading}
        aside={
          <>
            <Facts
              rows={[
                ["Email", <a href={`mailto:${email}`}>{email}</a>],
                ["Based in", location.name],
                [
                  "Local time",
                  <>
                    <LocalTime />{" "}
                    <span className="gl-meta">{location.timeZoneName}</span>
                  </>
                ]
              ]}
            />
            <p className="gl-contact__alternate">
              <More href={to(form.alternate.path)}>{form.alternate.text}</More>
            </p>
          </>
        }
      />

      <Band label={form.title} className="gl-form-band">
        <div className="gl-form-panel">
          <div className="gl-form-panel__bar">
            <p className="gl-label">{form.title}</p>
            <span className="gl-meta">{`${form.fields.length} questions`}</span>
          </div>
          <Form kind={kind} />
        </div>
      </Band>
    </>
  );
}
