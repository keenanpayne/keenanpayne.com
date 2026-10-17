import type { BasicPageModel } from "../../lib/types";
import { HtmlContent } from "../HtmlContent";
import { Sections } from "../sections/Sections";

export function BasicPage({ page }: { page: BasicPageModel }) {
  return (
    <main className={page.templateClass || undefined}>
      <Sections sections={page.sections} />

      {page.content && <HtmlContent html={page.content} />}
    </main>
  );
}
