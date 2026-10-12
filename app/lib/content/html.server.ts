import { parse, type HTMLElement } from "node-html-parser";

import { escapeHtml } from "../html";
import { isExternalUrl } from "../site";

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
      // `text` is entity-decoded, so re-escape it for the markup
      text: escapeHtml(heading.text.trim()),
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
// Port of `htmlToAbsoluteUrls` from `@11ty/eleventy-plugin-rss`. The content
// has already been serialized by node-html-parser (`addExternalLinkAttributes`),
// so re-serializing it here changes nothing but the URLs.

const URL_ATTRIBUTES = [
  "href",
  "src",
  "poster",
  "cite",
  "action",
  "longdesc",
  "formaction"
];

function resolveUrl(url: string, base: string) {
  try {
    return new URL(url.trim(), base).toString();
  } catch {
    return url;
  }
}

// Splits a `srcset` into its candidates like browsers do: a URL is a run of
// non-whitespace characters (Cloudinary URLs contain commas), followed by
// optional descriptors up to the next comma.
function parseSrcset(srcset: string) {
  const candidates: Array<{ url: string; descriptors: string }> = [];
  let position = 0;

  while (position < srcset.length) {
    while (/[\s,]/.test(srcset[position] ?? "")) position++;
    if (position >= srcset.length) break;

    const urlStart = position;
    while (position < srcset.length && !/\s/.test(srcset[position])) position++;
    let url = srcset.slice(urlStart, position);
    let descriptors = "";

    if (url.endsWith(",")) {
      url = url.replace(/,+$/, "");
    } else {
      const descriptorsStart = position;
      let depth = 0;
      while (position < srcset.length) {
        const character = srcset[position];
        if (character === "(") depth++;
        else if (character === ")") depth = Math.max(0, depth - 1);
        else if (character === "," && depth === 0) break;
        position++;
      }
      descriptors = srcset.slice(descriptorsStart, position).trim();
    }

    candidates.push({ url, descriptors });
  }

  return candidates;
}

function resolveSrcset(srcset: string, base: string) {
  return parseSrcset(srcset)
    .map(({ url, descriptors }) =>
      [resolveUrl(url, base), descriptors].filter(Boolean).join(" ")
    )
    .join(", ");
}

export function convertToAbsoluteUrls(html: string, base: string) {
  const root = parse(html);

  for (const name of URL_ATTRIBUTES) {
    for (const element of root.querySelectorAll(`[${name}]`)) {
      element.setAttribute(name, resolveUrl(element.getAttribute(name)!, base));
    }
  }
  for (const element of root.querySelectorAll("[srcset]")) {
    element.setAttribute(
      "srcset",
      resolveSrcset(element.getAttribute("srcset")!, base)
    );
  }

  return root.toString();
}
