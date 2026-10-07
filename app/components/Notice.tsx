import { noticeIcon } from "../lib/content/icons";

const escape = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Same markup as the `type/notice.html` Markdown shortcode */
export function Notice({ children }: { children: string }) {
  return (
    <p
      className="-context -notice"
      dangerouslySetInnerHTML={{
        __html: `\n  ${noticeIcon}\n  <span>${escape(children)}</span>\n`
      }}
    />
  );
}
