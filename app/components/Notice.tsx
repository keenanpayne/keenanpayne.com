import { noticeIcon } from "../lib/content/icons";
import { escapeHtml } from "../lib/html";

/** Same markup as the `type/notice.html` Markdown shortcode */
export function Notice({ children }: { children: string }) {
  return (
    <p
      className="-context -notice"
      dangerouslySetInnerHTML={{
        __html: `\n  ${noticeIcon}\n  <span>${escapeHtml(children)}</span>\n`
      }}
    />
  );
}
