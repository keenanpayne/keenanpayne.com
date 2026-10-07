import MarkdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import markdownItFootnote from "markdown-it-footnote";
import Prism from "prismjs";
import loadLanguages from "prismjs/components/index.js";
import prismComponents from "prismjs/components.json";

/**
 * Markdown rendering
 * ==================================================
 * Same markdown-it setup the site used with Eleventy: raw HTML, soft line
 * breaks, autolinks, linkable headings, footnotes, and build-time Prism
 * syntax highlighting (ported from `@11ty/eleventy-plugin-syntaxhighlight`).
 */

// Avoid "Language does not exist" console logs
(loadLanguages as typeof loadLanguages & { silent: boolean }).silent = true;

const HARDCODED_ALIASES: Record<string, string> = {
  njk: "jinja2",
  nunjucks: "jinja2"
};

type PrismLanguageDefinitions = Record<string, { alias?: string | string[] }>;

// Resolves aliases such as `html` -> `markup` and `ts` -> `typescript`
function normalizeLanguage(language: string) {
  const name = HARDCODED_ALIASES[language] ?? language;
  const languages = prismComponents.languages as PrismLanguageDefinitions;

  if (languages[name]) return name;

  for (const [languageName, { alias }] of Object.entries(languages)) {
    if (Array.isArray(alias) ? alias.includes(name) : alias === name) {
      return languageName;
    }
  }

  return name;
}

function getGrammar(language: string) {
  const name = normalizeLanguage(language);
  if (!Prism.languages[name]) loadLanguages([name]);
  return Prism.languages[name];
}

// Line highlighting, e.g. ```css/1,4/-1 (highlights / additions / removals)
function parseLineRanges(ranges = "") {
  const lines = new Set<number>();
  if (!ranges) return lines;

  for (const range of ranges.split(",").map((r) => r.trim())) {
    const [start, end] = range.split("-");
    const first = parseInt(start, 10);
    const last = parseInt(end || start, 10);
    for (let line = first; line <= last; line++) lines.add(line);
  }

  return lines;
}

function wrapLines(lines: string[], ranges: string) {
  const groups = ranges.split("/");
  const highlight = parseLineRanges(groups.length === 1 ? groups[0] : "");
  const add = parseLineRanges(groups.length === 2 ? groups[0] : "");
  const remove = parseLineRanges(groups.length === 2 ? groups[1] : "");

  return lines.map((line, index) => {
    // Lines with uneven <span> tags can't be wrapped safely
    if (line.split("<span").length !== line.split("</span").length) {
      return line;
    }
    if (highlight.has(index)) {
      return `<mark class="highlight-line highlight-line-active">${line}</mark>`;
    }
    if (add.has(index)) {
      return `<ins class="highlight-line highlight-line-add">${line}</ins>`;
    }
    if (remove.has(index)) {
      return `<del class="highlight-line highlight-line-remove">${line}</del>`;
    }
    return `<span class="highlight-line">${line}</span>`;
  });
}

function highlight(code: string, info: string) {
  // An empty string defers to markdown-it's built-in escaping
  if (!info) return "";

  const [language, ...highlightRanges] = info.split("/");
  let html = code;

  if (language !== "text") {
    const grammar = getGrammar(language);
    if (grammar) html = Prism.highlight(code, grammar, language);
  }

  let lines = html.split("\n");
  if (lines[lines.length - 1] === "") lines = lines.slice(0, -1);
  if (highlightRanges.length)
    lines = wrapLines(lines, highlightRanges.join("/"));

  const attributes = ` class="language-${language}"`;
  return `<pre${attributes}><code${attributes}>${lines.join("\n")}</code></pre>`;
}

const markdown = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
  highlight
})
  .use(markdownItAnchor, {
    permalink: markdownItAnchor.permalink.headerLink()
  })
  .disable("code")
  .use(markdownItFootnote);

markdown.renderer.rules.footnote_block_open = () =>
  '<section class="footnotes">\n' +
  '<h2 class="_label"><span>Footnotes</span></h2>\n' +
  '<ol class="footnotes-list">\n';

export function renderMarkdown(source: string) {
  return markdown.render(source, {});
}
