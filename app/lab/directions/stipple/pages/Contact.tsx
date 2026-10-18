import {
  formOf,
  introOf,
  titleOf,
  useSubmission,
  useTo,
  type TemplateProps
} from "../../../site";
import { FrontRange } from "../FrontRange";
import { DirectLine, FormField, Layout, More, PageHeader } from "../parts";

/** The contact and project inquiry forms, with a direct line beside them */
export function Contact({
  kind,
  page,
  content
}: TemplateProps<"contact" | "inquiry">) {
  const to = useTo();
  const form = formOf(kind);
  const intro = introOf(page);
  const { props, hidden, status } = useSubmission(kind);

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
          title={titleOf(page)}
          lede={intro?.subheading}
        >
          <p className="st-actions">
            <More href={to(form.alternate.path)}>{form.alternate.text}</More>
          </p>
        </PageHeader>

        <form className="st-form" {...props}>
          {hidden}
          {form.fields.map((field) => (
            <FormField key={field.name} field={field} />
          ))}
          <p className="st-form__submit">
            <button className="st-button" type="submit">
              {form.submit}
            </button>
            {status && <span role="status">{status}</span>}
          </p>
        </form>
      </Layout>
    </>
  );
}
