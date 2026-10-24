import {
  formOf,
  introOf,
  titleOf,
  useSubmission,
  useTo,
  type TemplateProps
} from "../../../site";
import { Facts, FormField, KANA, PageHeader, Submit } from "../parts";

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
        kana={kind === "inquiry" ? KANA.inquiry : KANA.contact}
        emblem={kind === "inquiry" ? "pinwheel" : "target"}
      >
        <Facts
          rows={[
            ["Email", <a href={`mailto:${email}`}>{email}</a>],
            ["Location", `${location.name} (${location.timeZoneName})`]
          ]}
        />
        <p className="neon-more">
          <a href={to(form.alternate.path)}>
            {form.alternate.text}
            <span aria-hidden="true"> →</span>
          </a>
        </p>
      </PageHeader>

      <form className="neon-form neon-console" {...props}>
        {hidden}
        <p className="neon-console__head" aria-hidden="true">
          <span>{form.title}</span>
          <span>{kind === "inquiry" ? KANA.inquiry : KANA.contact}</span>
        </p>
        {form.fields.map((field) => (
          <FormField key={field.name} field={field} />
        ))}
        <Submit label={form.submit} status={status} />
      </form>
    </>
  );
}
