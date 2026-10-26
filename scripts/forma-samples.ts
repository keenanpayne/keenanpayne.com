/**
 * Forma UI samples
 * ==================================================
 * Writes every direction's markup into the forma-ui repository, as the
 * samples its demo renders and its markup recipes: one HTML file per style
 * guide section (`samples/components/<id>.html`) and one per sample page
 * (`samples/pages/<id>.html`), read from this site's own pre-rendered
 * pages. Run it after a build, whenever a direction's markup changes:
 *
 *   npm run build && npm run forma:samples            # ../forma-ui
 *   npm run forma:samples -- /path/to/forma-ui
 *
 * What it writes is the page as the lab renders it, with the lab's own
 * chrome and scripts left out and its links pointed where the demo can
 * follow them: sample pages at each other, and everything else at the
 * live site.
 */

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync
} from "node:fs";
import { join, resolve } from "node:path";

import { parse, type HTMLElement, type Node } from "node-html-parser";

import { SAMPLE_PAGES } from "../app/lab/site/ia.ts";
import { STYLE_SECTIONS } from "../app/lab/styleguide/sections.ts";

const BUILD = resolve("build/client");
const FORMA = resolve(process.argv[2] ?? "../forma-ui");
const DIRECTIONS = join(FORMA, "src", "directions");

const SITE_ORIGIN = (
  JSON.parse(readFileSync("app/data/metadata.json", "utf8")) as {
    url: string;
  }
).url.replace(/\/$/, "");

/** `Case study` → `case-study`: the sample page's file name */
const idOf = (label: string) =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const PAGES = SAMPLE_PAGES.map((page) => ({ ...page, id: idOf(page.label) }));

/** Where a direction's mockups live in the lab, e.g. `/lab/mech` */
const labBase = (slug: string) => `/lab/${slug}`;

/** The directions forma-ui has, by its manifests */
const directions = readdirSync(DIRECTIONS)
  .filter((slug) => existsSync(join(DIRECTIONS, slug, "direction.json")))
  .map((slug) => {
    const manifest = JSON.parse(
      readFileSync(join(DIRECTIONS, slug, "direction.json"), "utf8")
    ) as { name: string };
    return { slug, name: manifest.name };
  });

/** Sections each direction renders itself, plus the Shell */
const COMPONENTS = STYLE_SECTIONS.filter(
  (section) => !("shared" in section) || section.id === "shell"
).map((section) => section.id);

/** Attributes that hold URLs (`value` on a jump menu's options) */
const URL_ATTRIBUTES = ["href", "src", "poster", "action"];

/** React writes these two in camel case; HTML reads them in any case */
const ATTRIBUTE_CASE: Record<string, string> = {
  popoverTarget: "popovertarget",
  popoverTargetAction: "popovertargetaction"
};

function fail(message: string): never {
  console.error(`✗ ${message}`);
  process.exit(1);
}

if (!existsSync(join(BUILD, "lab", "index.html"))) {
  fail(`No build at ${BUILD}: run \`npm run build\` first`);
}
if (!existsSync(DIRECTIONS)) {
  fail(`No forma-ui checkout at ${FORMA} (its src/directions/ is missing)`);
}

const read = (path: string) => {
  const file = join(BUILD, path, "index.html");
  if (!existsSync(file)) fail(`${file} wasn't pre-rendered`);
  return parse(readFileSync(file, "utf8"));
};

/**
 * Where a lab link leads in the demo: a sample page's file, or the live
 * site for anything the demo doesn't have
 */
function rewriteUrl(url: string, slug: string) {
  if (!url.startsWith("/") || url.startsWith("//")) return url;
  const [, pathname, suffix] = /^([^?#]*)(.*)$/s.exec(url)!;
  const base = labBase(slug);
  if (pathname === base || pathname.startsWith(`${base}/`)) {
    const sitePath = pathname.slice(base.length) || "/";
    const page = PAGES.find((candidate) => candidate.path === sitePath);
    return page
      ? `./${page.id}.html${suffix}`
      : `${SITE_ORIGIN}${sitePath}${suffix}`;
  }
  return `${SITE_ORIGIN}${url}`;
}

function rewriteLinks(root: HTMLElement, slug: string) {
  for (const element of root.querySelectorAll("*")) {
    const names =
      element.rawTagName === "option"
        ? [...URL_ATTRIBUTES, "value"]
        : URL_ATTRIBUTES;
    for (const name of names) {
      const value = element.getAttribute(name);
      if (value !== undefined)
        element.setAttribute(name, rewriteUrl(value, slug));
    }
    const srcset = element.getAttribute("srcset");
    if (srcset) {
      element.setAttribute(
        "srcset",
        srcset
          .split(",")
          .map((candidate) => {
            const [url, ...descriptor] = candidate.trim().split(/\s+/);
            return [rewriteUrl(url, slug), ...descriptor].join(" ");
          })
          .join(", ")
      );
    }
    for (const [from, to] of Object.entries(ATTRIBUTE_CASE)) {
      const value = element.getAttribute(from);
      if (value !== undefined) {
        element.removeAttribute(from);
        element.setAttribute(to, value);
      }
    }
  }
}

/** React's markers between text nodes and around Suspense boundaries */
const REACT_COMMENTS = /<!--(?: |\$|\/\$|\$!|\$\?)-->/g;

/** The parser writes an empty attribute bare; `alt=""` reads as meant */
const EMPTY_ATTRIBUTES = /\s(alt|content|title|value)(?=[\s>])/g;

const clean = (html: string) =>
  `${html.replace(REACT_COMMENTS, "").replace(EMPTY_ATTRIBUTES, ' $1=""').trim()}\n`;

const isElement = (node: Node): node is HTMLElement => node.nodeType === 1;

/** The direction's own markup on a lab page: everything but the lab's chrome */
function pageMarkup(document: HTMLElement, slug: string) {
  const body = document.querySelector("body");
  if (!body) fail(`${slug}: no <body>`);
  const own = body.childNodes.filter(
    (node) =>
      isElement(node) &&
      !["script", "link", "template"].includes(node.rawTagName) &&
      !node.classList.contains("labBar")
  ) as HTMLElement[];
  if (own.length === 0)
    fail(`${slug}: nothing but the lab's chrome on the page`);
  for (const element of own) rewriteLinks(element, slug);
  return clean(own.map((element) => element.toString()).join("\n"));
}

function write(path: string, html: string) {
  mkdirSync(join(path, ".."), { recursive: true });
  writeFileSync(path, html);
  return Buffer.byteLength(html);
}

let files = 0;
let bytes = 0;

for (const { slug, name } of directions) {
  const dir = join(DIRECTIONS, slug);
  if (!existsSync(join(BUILD, "lab", slug, "index.html"))) {
    console.warn(`  – ${name}: not in this site's lab, skipped`);
    continue;
  }

  for (const page of PAGES) {
    const document = read(join("lab", slug, page.path));
    bytes += write(
      join(dir, "samples", "pages", `${page.id}.html`),
      pageMarkup(document, slug)
    );
    files++;
  }

  const guide = read(join("lab", "styleguide", slug));
  for (const id of COMPONENTS) {
    const stage = guide.querySelector(
      id === "shell" ? `#${id} .sg-stage--frame` : `#${id} .sg-stage__root`
    );
    if (!stage) fail(`${name}: the style guide has no ${id} section`);
    rewriteLinks(stage, slug);
    bytes += write(
      join(dir, "samples", "components", `${id}.html`),
      clean(stage.innerHTML)
    );
    files++;
  }
  console.log(
    `  ✓ ${name}: ${PAGES.length} pages, ${COMPONENTS.length} components`
  );
}

console.log(
  `\n✓ Wrote ${files} samples (${(bytes / 1024 / 1024).toFixed(1)} MB) to ${DIRECTIONS}`
);
