import {
  formOf,
  introOf,
  titleOf,
  useSubmission,
  useTo,
  type TemplateProps
} from "../../../site";
import { Facts, FormField, PageHeader } from "../parts";

/** The contact and project inquiry forms, with the ways to reach me */
export function Contact({
  kind,
  page,
  content
}: TemplateProps<"contact" | "inquiry">) {
  const to = useTo();
  const intro = introOf(page);
  const { email, location } = content.profile;
  const form = formOf(kind);
  const { props, hidden, status } = useSubmission(kind);

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
        <p className="wireframe-more">
          <a href={to(form.alternate.path)}>{form.alternate.text}</a>
        </p>
      </PageHeader>

      <form className="wireframe-form" {...props}>
        {hidden}
        {form.fields.map((field) => (
          <FormField key={field.name} field={field} />
        ))}
        <p className="wireframe-field--wide">
          <button type="submit">{form.submit}</button>
          {status && (
            <>
              {" "}
              <span className="wireframe-meta" role="status">
                {status}
              </span>
            </>
          )}
        </p>
      </form>
    </>
  );
}
