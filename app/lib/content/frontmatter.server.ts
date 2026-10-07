import yaml from "js-yaml";

export interface ParsedFile {
  data: Record<string, unknown>;
  body: string;
}

/**
 * Splits a Markdown file into YAML front matter and body.
 *
 * Mirrors the behaviour of `gray-matter` (which Eleventy used): the body
 * starts right after the newline that follows the closing `---`.
 */
export function parseFrontMatter(source: string): ParsedFile {
  const input = source.replace(/^\uFEFF/, "");
  const open = "---";
  const close = "\n---";

  if (!input.startsWith(open) || input.charAt(open.length) === "-") {
    return { data: {}, body: input };
  }

  const rest = input.slice(open.length);
  let closeIndex = rest.indexOf(close);
  if (closeIndex === -1) closeIndex = rest.length;

  const matter = rest.slice(0, closeIndex);
  const data = matter.replace(/^\s*#[^\n]+/gm, "").trim()
    ? ((yaml.load(matter) as Record<string, unknown> | undefined) ?? {})
    : {};

  let body =
    closeIndex === rest.length ? "" : rest.slice(closeIndex + close.length);
  if (body.startsWith("\r")) body = body.slice(1);
  if (body.startsWith("\n")) body = body.slice(1);

  return { data, body };
}
