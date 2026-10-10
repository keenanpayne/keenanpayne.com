import { cloudinarySrc, cloudinarySrcset } from "./cloudinary";
import {
  furtherReadingIcon,
  noteIcon,
  noticeIcon,
  questionIcon,
  tipIcon
} from "./icons";

/**
 * Markdown shortcodes
 * ==================================================
 * Content files embed small HTML snippets with a Liquid-style include tag:
 *
 *   {% include "type/note.html" content: "Some <em>HTML</em>", align: "left" %}
 *
 * The tags are expanded before the Markdown is rendered (just like Eleventy's
 * Liquid pre-processing did), so each snippet's exact output — including its
 * whitespace — determines how markdown-it parses the surrounding content.
 */

type Value = string | number | boolean | null | undefined;
type Args = Record<string, Value>;

// Liquid semantics: only `false`, `null` and `undefined` are falsy
const truthy = (value: Value) =>
  value !== undefined && value !== null && value !== false;

// Liquid output semantics: `null`/`undefined` render as an empty string
const out = (value: Value) =>
  value === undefined || value === null ? "" : String(value);

const shortcodes: Record<string, (args: Args) => string> = {
  "type/p_large.html": ({ content }) =>
    `<p class="-large">\n  ${out(content)}\n</p>\n`,

  "type/tldr.html": ({ content }) =>
    `<p class="-context -tldr">\n  ${out(content)}\n</p>\n`,

  "type/tip.html": ({ content }) =>
    `<p class="-context -tip">\n  ${tipIcon}\n  ${out(content)}\n</p>\n`,

  "type/further-reading.html": ({ content }) =>
    `<p class="-context -further-reading">\n  ${furtherReadingIcon}\n  ${out(content)}\n</p>\n`,

  "type/notice.html": ({ content }) =>
    `<p class="-context -notice">\n  ${noticeIcon}\n  <span>${out(content)}</span>\n</p>\n`,

  "type/question.html": ({ content }) =>
    `<p class="-context -question">\n  ${questionIcon}\n  <span>${out(content)}</span>\n</p>\n`,

  "type/note.html": ({ content, align }) =>
    `<p class="-context -note ${truthy(align) ? `-${out(align)}` : ""}">\n  ${noteIcon}\n  <span>${out(content)}</span>\n</p>\n`,

  "type/blockquote.html": (args) => {
    const { content, author, author_position } = args;
    const { author_source_link, author_source_title } = args;
    let cite = "";

    if (truthy(author)) {
      cite += `\n    <cite class="blockquote-cite _text-h4">${out(author)}`;
      if (truthy(author_position)) cite += `,${out(author_position)}`;
      if (truthy(author_source_link)) {
        cite += `, <a href="${out(author_source_link)}" target="_blank" rel="noopener" title="${out(author_source_title)} by ${out(author)}">${out(author_source_title)}</a>`;
      }
      cite += `\n    </cite>\n  `;
    }

    return `<blockquote class="blockquote">\n  <p class="blockquote-content _text-h3">\n    <span>${out(content)}</span>\n  </p>\n\n  ${cite}\n</blockquote>\n`;
  },

  "atoms/figure.html": (args) => {
    const { src, alt, width, caption, source_title, source_link } = args;
    let html = `<figure>\n  <img src="${out(src)}" alt="${out(alt)}" ${truthy(width) ? ` width="${out(width)}" ` : ""}>`;

    if (truthy(caption)) {
      html += `<figcaption>\n      <div class="figure-caption">${out(caption)}</div>`;
      if (source_title !== "" && source_link !== "") {
        html += `<p class="figure-source">\n          <small>\n            <strong>Source:</strong>\n            <a href="${out(source_link)}" title="${out(source_title)}" target="_blank" rel="noopener">${out(source_title)}</a>\n          </small>\n        </p>`;
      }
      html += `</figcaption>`;
    }

    return `${html}</figure>\n`;
  },

  "components/image.njk": (args) => {
    const { imgSrc, alt, width, lazy, set, caption } = args;
    const { source_title, source_link } = args;
    const className = args.class;
    const file = out(imgSrc);
    let html =
      `<figure ${truthy(className) ? ` class="${out(className)}" ` : ""}>\n` +
      `  <a href="${cloudinarySrc(file)}" title="View full image">\n` +
      `    <img ${truthy(imgSrc) ? ` src="${cloudinarySrc(file)}" ` : ""} ` +
      `${set !== false ? ` srcset="${cloudinarySrcset(file)}" ` : ""} ` +
      `${truthy(alt) ? ` alt="${out(alt)}" ` : ""} ` +
      `${truthy(width) ? ` width="${out(width)}" ` : ""} ` +
      `${lazy !== false ? ` loading="lazy" ` : ""}>\n` +
      `  </a>`;

    if (truthy(caption)) {
      html += `<figcaption>\n      <div class="figure-caption">\n        ${out(caption)}\n      </div>`;
      if (truthy(source_title) && truthy(source_link)) {
        html += `<p class="figure-source">\n          <small>\n            <strong>Source:</strong>\n            <a href="${out(source_link)}" title="${out(source_title)}" target="_blank" rel="noopener">\n              ${out(source_title)}\n            </a>\n          </small>\n        </p>`;
      }
      html += `</figcaption>`;
    }

    return `${html}</figure>\n`;
  }
};

const INCLUDE_TAG = /\{%\s*include\s+(["'])(.+?)\1\s*,?([\s\S]*?)%\}/g;
const ARGUMENT =
  /\s*,?\s*([A-Za-z_][\w-]*)\s*:\s*("[^"]*"|'[^']*'|[^\s,]+)\s*/y;

function parseValue(raw: string): Value {
  if (/^(["']).*\1$/s.test(raw)) return raw.slice(1, -1);
  if (raw === "true") return true;
  if (raw === "false") return false;
  if (raw === "nil" || raw === "null") return null;
  if (/^-?\d+(\.\d+)?$/.test(raw)) return Number(raw);
  // Bare identifiers would be variable lookups in Liquid; none are defined
  return undefined;
}

function parseArgs(source: string, tag: string): Args {
  const args: Args = {};
  ARGUMENT.lastIndex = 0;

  while (ARGUMENT.lastIndex < source.length) {
    const start = ARGUMENT.lastIndex;
    const match = ARGUMENT.exec(source);
    if (!match) {
      if (source.slice(start).trim() === "") break;
      throw new Error(`Unable to parse shortcode arguments in: ${tag}`);
    }
    args[match[1]] = parseValue(match[2]);
  }

  return args;
}

/** Expands every `{% include "…" %}` shortcode in a Markdown source string. */
export function expandShortcodes(source: string, file: string) {
  return source.replace(INCLUDE_TAG, (tag, _quote, name: string, rawArgs) => {
    const shortcode = shortcodes[name];
    if (!shortcode) {
      throw new Error(`Unknown shortcode "${name}" in ${file}`);
    }
    return shortcode(parseArgs(rawArgs, tag));
  });
}
