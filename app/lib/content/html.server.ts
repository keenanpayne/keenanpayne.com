import { parse, type HTMLElement } from "node-html-parser";

import { isExternalUrl } from "../site";

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

//
// External links
// --------------
// Port of `eleventy-plugin-external-links`: links whose `href` starts with a
// protocol (`https:`, `mailto:`, …) or `//` open in a new tab. Like the
// plugin, the markup is re-serialized by node-html-parser, which also drops
// HTML comments and stray end tags (e.g. a `</p>` after nested paragraphs).

export function addExternalLinkAttributes(html: string) {
  const root = parse(html);

  for (const link of root.querySelectorAll("a")) {
    const href = link.getAttribute("href");
    if (href && isExternalUrl(href)) {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener");
    }
  }

  return root.toString();
}

//
// Table of contents
// -----------------
// Port of `eleventy-plugin-nesting-toc`: builds a nested list from headings
// that have an `id` (added by markdown-it-anchor).

interface TocItem {
  slug?: string;
  text?: string;
  level: number;
  parent?: TocItem;
  children: TocItem[];
}

function tocItemHtml(item: TocItem): string {
  let markup = "";
  const isLink = item.slug && item.text;

  if (isLink) {
    markup += `
                    <li><a href="#${item.slug}">${item.text}</a>
            `;
  }

  if (item.children.length > 0) {
    markup += `
                <ol>
                    ${item.children.map(tocItemHtml).join("\n")}
                </ol>
            `;
  }

  if (isLink) markup += "\t\t</li>";

  return markup;
}

function getParent(previous: TocItem, current: TocItem): TocItem {
  if (current.level > previous.level) return previous;
  if (current.level === previous.level) return previous.parent!;
  return getParent(previous.parent!, current);
}

export function buildTableOfContents(html: string, tags: string[]) {
  const root: TocItem = { level: 0, children: [] };
  root.parent = root;

  const headings = parse(html)
    .querySelectorAll(tags.join(","))
    .filter(
      (heading: HTMLElement) =>
        heading.hasAttribute("id") && !heading.hasAttribute("data-toc-exclude")
    );

  let previous = root;
  for (const heading of headings) {
    const current: TocItem = {
      slug: heading.getAttribute("id"),
      text: heading.text.trim(),
      level: Number(heading.tagName.slice(1)),
      children: []
    };
    current.parent = getParent(previous, current);
    current.parent.children.push(current);
    previous = current;
  }

  if (!root.children.length) return "";

  return `<nav class="toc-nav">${tocItemHtml(root)}</nav>`;
}

//
// Absolute URLs (feeds)
// ---------------------
// Port of `htmlToAbsoluteUrls` from `@11ty/eleventy-plugin-rss`.

const URL_ATTRIBUTE =
  /(\s(?:href|src|poster|cite|action|longdesc|formaction)\s*=\s*)(?:"([^"]*)"|'([^']*)')/gi;
const SRCSET_ATTRIBUTE = /(\ssrcset\s*=\s*)(?:"([^"]*)"|'([^']*)')/gi;

function absoluteUrl(url: string, base: string) {
  try {
    return new URL(url.trim(), base).toString();
  } catch {
    return url;
  }
}

export function convertToAbsoluteUrls(html: string, base: string) {
  return html
    .replace(
      URL_ATTRIBUTE,
      (_match, prefix: string, double?: string, single?: string) =>
        double !== undefined
          ? `${prefix}"${absoluteUrl(double, base)}"`
          : `${prefix}'${absoluteUrl(single!, base)}'`
    )
    .replace(
      SRCSET_ATTRIBUTE,
      (_match, prefix: string, double?: string, single?: string) => {
        const candidates = (double ?? single!)
          .split(",")
          .map((candidate) => {
            const [url, ...descriptors] = candidate.trim().split(/\s+/);
            return [absoluteUrl(url, base), ...descriptors].join(" ");
          })
          .join(", ");
        return double !== undefined
          ? `${prefix}"${candidates}"`
          : `${prefix}'${candidates}'`;
      }
    );
}
