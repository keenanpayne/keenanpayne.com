/**
 * Requirements
 * ==================================================
 * The feature set and information architecture every direction renders,
 * written as checks over its rendered pages. A direction decides how each
 * of these looks, never whether it's there. Wireframe meets every one, so
 * it shows what each asks for in plain HTML.
 *
 * The checks read pages the way a visitor does (text, links, images,
 * landmarks) rather than markup, so any skin can meet them. A direction may
 * add motifs on top: ornament, flavor copy, extra presentations of the same
 * content. A new feature, page section, or link destination goes in the
 * shared layers and here first, then in Wireframe, then in every direction.
 */

import { parse, type HTMLElement } from "node-html-parser";
import type { Root } from "postcss";

import { getLabContent, getPage } from "../../lib/content/content.server";
import { metadata } from "../../lib/site";
import type { SectionModel, TestimonialModel } from "../../lib/types";
import { COMMENTS_ID } from "../site/comments";
import {
  formOf,
  newsletterForm,
  submissionOf,
  type SubmissionKind
} from "../site/forms";
import {
  hasNewsletter,
  homeWork,
  introOf,
  quotesOf,
  readingMinutes,
  samePath,
  titleOf
} from "../site/helpers";
import {
  HOME,
  resolveView,
  sectionFor,
  type View,
  type ViewKind
} from "../site/ia";
import { readoutLabel, WEATHER_CREDIT } from "../site/readout";

import type { RenderedPage } from "./render";
import { hiddenAt, PHONE_WIDTH, type Target } from "./viewport";

export interface Requirement {
  /** Stable, e.g. `shell.skipLink`; what `gaps.ts` lists */
  id: string;
  /** Where it's reported: the Shell, every page, or one kind of page */
  group: "Shell" | "Every page" | "Pages";
  /** What every direction does, in a sentence */
  rule: string;
  /** The kinds of page it applies to; every page when left out */
  kinds?: readonly ViewKind[];
  /**
   * What a page is missing or gets wrong; nothing when it conforms. Reads
   * the page, and the direction's stylesheet with its nesting resolved.
   */
  check: (page: RenderedPage, stylesheet: Root) => string[];
}

type PageOf<K extends ViewKind> = RenderedPage & {
  view: Extract<View, { kind: K }>;
};

/** A requirement for some kinds of page, whose check reads their models */
function forKinds<K extends ViewKind>(
  kinds: readonly K[],
  id: string,
  rule: string,
  check: (
    page: PageOf<K>,
    problem: (message: string) => void,
    stylesheet: Root
  ) => void
): Omit<Requirement, "group"> {
  return {
    id,
    rule,
    kinds,
    check: (page, stylesheet) => {
      const problems: string[] = [];
      check(page as PageOf<K>, (message) => problems.push(message), stylesheet);
      return problems;
    }
  };
}

/** Every kind of page, which the checks render one of each of at least */
export const ALL_KINDS = [
  "home",
  "work",
  "caseStudy",
  "writing",
  "post",
  "archive",
  "about",
  "services",
  "service",
  "testimonials",
  "contact",
  "inquiry",
  "page",
  "notFound"
] as const satisfies readonly ViewKind[];

// A kind added to `View` but not here is a type error
type Unlisted = Exclude<ViewKind, (typeof ALL_KINDS)[number]>;
const everyKindListed: [Unlisted] extends [never] ? true : Unlisted = true;
void everyKindListed;

// Reading pages
// --------------------------------------------------

/** Text as a visitor reads it, ignoring case and spacing */
const flat = (text: string) => text.replace(/\s+/g, "").toLowerCase();

/** HTML as the text a visitor reads */
const plain = (html: string) => parse(html).text.replace(/\s+/g, " ").trim();

/** Whether an element's text includes some text (ignoring case and spacing) */
const says = (element: HTMLElement, text: string) =>
  flat(element.text).includes(flat(text));

/** An attribute, whatever the case React rendered its name in */
const attr = (element: HTMLElement, name: string) =>
  Object.entries(element.attributes).find(
    ([key]) => key.toLowerCase() === name
  )?.[1];

/** A URL without its query, hash, or trailing slash */
const bare = (url: string) => url.replace(/[?#].*$/, "").replace(/\/$/, "");

const linksIn = (element: HTMLElement) => element.querySelectorAll("a[href]");

const linksTo = (element: HTMLElement, url: string) =>
  linksIn(element).filter(
    (link) => bare(attr(link, "href") ?? "") === bare(url)
  );

const linksToIn = (element: HTMLElement, url: string) =>
  linksTo(element, url).length > 0;

/** An image's file name, which every crop and size of it shares */
const imageKey = (src: string) =>
  src
    .split("?")[0]
    .split("/")
    .pop()
    ?.replace(/\.\w+$/, "") ?? src;

/** Whether an element shows an image or video, in any crop or size */
function shows(element: HTMLElement, src: string) {
  const key = imageKey(src);
  return element
    .querySelectorAll("img, source, video, image, [style]")
    .some((media) =>
      ["src", "srcset", "href", "poster", "style"].some((name) =>
        attr(media, name)?.includes(key)
      )
    );
}

const short = (text: string, length = 60) =>
  text.length > length ? `${text.slice(0, length)}…` : text;

/**
 * The Shell's clocks: every button described as `useReadout()` describes one (for
 * the owner's city) that opens a popover crediting Open-Meteo. A Shell may
 * have more than one, e.g. one in its header and one in its phone menu.
 */
const clocksIn = (page: RenderedPage) => {
  const { chrome, document, content } = page;
  const label = readoutLabel(content.profile.location.city);
  return chrome.querySelectorAll("button").filter((button) => {
    const target = attr(button, "popovertarget");
    const popover = target && document.getElementById(target);
    return (
      attr(button, "aria-description") === label &&
      popover &&
      attr(popover, "popover") !== undefined &&
      linksIn(popover).some((link) =>
        attr(link, "href")?.startsWith(WEATHER_CREDIT.href)
      )
    );
  });
};

/** An element and its ancestors, outward, as the stylesheet checks see them */
function chainOf(element: HTMLElement): Target[] {
  const chain: Target[] = [];
  for (
    let node: HTMLElement | null = element;
    node?.rawTagName;
    node = node.parentNode
  ) {
    chain.push({
      tag: node.rawTagName.toLowerCase(),
      classes: node.classList.value,
      attributes: node.attributes
    });
  }
  return chain;
}

/**
 * Problems with where a form sends (`submissionOf(kind)`): each attribute
 * its `<form>` carries, and each hidden field inside it
 */
function submissionProblems(form: HTMLElement, kind: SubmissionKind) {
  const { attributes, hidden } = submissionOf(kind);
  return [
    ...Object.entries(attributes)
      .filter(
        ([name, value]) =>
          (attr(form, name) ?? "").toLowerCase() !== value.toLowerCase()
      )
      .map(([name, value]) => `${name}="${value}" on the form`),
    ...hidden
      .filter(
        (field) =>
          !form
            .querySelectorAll(`input[type="hidden"][name="${field.name}"]`)
            .some((input) => attr(input, "value") === field.value)
      )
      .map((field) => `a hidden field ${field.name}="${field.value}"`)
  ];
}

/** Problems with a list of quotes: each one's words and who said them */
function quoteProblems(element: HTMLElement, quotes: TestimonialModel[]) {
  return quotes.flatMap((quote) => {
    const who = quote.person?.name ?? `testimonial ${quote.id}`;
    const words = short(plain(quote.content), 60).replace(/…$/, "");
    if (!says(element, words)) return [`the quote from ${who}`];
    if (quote.person?.name && !says(element, quote.person.name)) {
      return [`the name with ${who}’s quote`];
    }
    return [];
  });
}

/** Problems with a page's intro: its subheading and body, when it has them */
function introProblems(
  element: HTMLElement,
  page: { sections: SectionModel[] }
) {
  const intro = introOf(page);
  const problems: string[] = [];
  if (intro?.subheading && !says(element, plain(intro.subheading))) {
    problems.push("the intro’s subheading");
  }
  if (intro?.body && !says(element, plain(intro.body))) {
    problems.push("the intro’s body");
  }
  return problems;
}

/** Problems with an article body: every heading, link, and image in it */
function bodyProblems(element: HTMLElement, html: string) {
  const body = parse(html);
  return [
    ...body
      .querySelectorAll("h2, h3, h4")
      .filter((heading) => !says(element, heading.text))
      .map((heading) => `the body’s heading “${short(heading.text.trim())}”`),
    ...linksIn(body)
      .map((link) => attr(link, "href") ?? "")
      .filter((href) => !href.startsWith("#") && !linksToIn(element, href))
      .map((href) => `the body’s link to ${href}`),
    ...body
      .querySelectorAll("img[src]")
      .map((image) => attr(image, "src") ?? "")
      .filter((src) => !shows(element, src))
      .map((src) => `the body’s image ${imageKey(src)}`)
  ];
}

/** Problems with a list of links that should each be in the element */
const linkProblems = (
  element: HTMLElement,
  links: { url: string; text?: string }[]
) =>
  links
    .filter((link) => !linksToIn(element, link.url))
    .map((link) => `a link to ${link.text ?? link.url}`);

// The Shell, on every page
// --------------------------------------------------

const shell: Omit<Requirement, "group">[] = [
  forKinds(
    ALL_KINDS,
    "shell.main",
    "One `<main>` holds the page, with an `id` the skip link targets.",
    ({ mains }, problem) => {
      if (mains.length !== 1) problem(`${mains.length} <main> elements`);
      else if (!attr(mains[0], "id")) problem("an id on <main>");
    }
  ),
  forKinds(
    ALL_KINDS,
    "shell.skipLink",
    "A skip link to `<main>` comes before everything else that can be focused.",
    ({ document, main }, problem) => {
      const id = attr(main, "id");
      const first = document.querySelector(
        "a[href], button, input, select, textarea, main"
      );
      if (!id || !first || attr(first, "href") !== `#${id}`) {
        problem("a skip link to <main>, first in the page");
      }
    }
  ),
  forKinds(
    ALL_KINDS,
    "shell.home",
    "The site owner’s name links home.",
    ({ chrome, content, to }, problem) => {
      if (
        !linksTo(chrome, to("/")).some((link) =>
          says(link, content.profile.name)
        )
      ) {
        problem(`a link home named “${content.profile.name}”`);
      }
    }
  ),
  forKinds(
    ALL_KINDS,
    "shell.navigation",
    'A `<nav>` links to every navigation item, in order, by its name, and marks the current one (and only it) with `aria-current="page"`.',
    ({ chrome, navigation }, problem) => {
      const nav = chrome
        .querySelectorAll('nav, [role="navigation"]')
        .find((element) => {
          let next = 0;
          for (const link of linksIn(element)) {
            const item = navigation[next];
            if (
              item &&
              bare(attr(link, "href") ?? "") === bare(item.url) &&
              says(link, item.text)
            ) {
              next++;
            }
          }
          return next === navigation.length;
        });
      if (!nav) {
        problem(
          `a <nav> with ${navigation.map((item) => item.text).join(", ")}`
        );
        return;
      }
      for (const item of navigation) {
        const current = linksTo(nav, item.url).some(
          (link) => attr(link, "aria-current") === "page"
        );
        if (item.current && !current) {
          problem(`aria-current="page" on ${item.text}`);
        }
        if (!item.current && current) {
          problem(`no aria-current on ${item.text}, which isn’t current`);
        }
      }
    }
  ),
  forKinds(
    ALL_KINDS,
    "shell.landmarks",
    "No two landmarks of a kind share a name: a menu that repeats the navigation is labeled for what it is.",
    ({ document }, problem) => {
      const kinds = {
        navigation: 'nav, [role="navigation"]',
        search: 'search, [role="search"]',
        complementary: 'aside, [role="complementary"]'
      };
      for (const [kind, selector] of Object.entries(kinds)) {
        const names = document.querySelectorAll(selector).map((element) => {
          const by = attr(element, "aria-labelledby");
          return (
            attr(element, "aria-label") ??
            (by && document.getElementById(by)?.text.trim()) ??
            "(unnamed)"
          );
        });
        for (const name of new Set(names)) {
          const count = names.filter((other) => other === name).length;
          if (count > 1)
            problem(`one ${kind} landmark named ${name}, not ${count}`);
        }
      }
    }
  ),
  forKinds(
    ALL_KINDS,
    "shell.footer",
    "A `<footer>` ends every page with `©`, the year, and the site owner’s name.",
    ({ chrome, content }, problem) => {
      const year = String(new Date().getFullYear());
      const name = content.profile.name;
      if (
        !chrome
          .querySelectorAll("footer")
          .some(
            (footer) =>
              says(footer, "©") && says(footer, year) && says(footer, name)
          )
      ) {
        problem(`a <footer> with © ${year} ${name}`);
      }
    }
  ),
  forKinds(
    ALL_KINDS,
    "shell.socials",
    "The chrome links to every profile in `content.socials`.",
    ({ chrome, content }, problem) =>
      linkProblems(chrome, content.socials).forEach(problem)
  ),
  forKinds(
    ALL_KINDS,
    "shell.feed",
    "The chrome links to the RSS feed.",
    ({ chrome }, problem) => {
      if (!linksToIn(chrome, metadata.feed.path)) {
        problem(`a link to ${metadata.feed.path}`);
      }
    }
  ),
  forKinds(
    ALL_KINDS,
    "shell.localTime",
    "A button named for the owner’s city the way `useReadout()` names it (“Denver local time and weather”) opens a popover with the local time and weather, crediting Open-Meteo.",
    (page, problem) => {
      if (!clocksIn(page).length) {
        const { city } = page.content.profile.location;
        problem(`a “${city}” button opening a weather popover`);
      }
    }
  ),
  forKinds(
    ALL_KINDS,
    "shell.clockOnPhones",
    `A clock stays on screen on phones: at ${PHONE_WIDTH}px wide, no style sets \`display: none\` or \`visibility: hidden\` on one of the clock buttons or anything around it, so the weather is a tap away there too. (Read from the stylesheet by width; rules under a state such as \`:hover\` or an open menu don’t count.)`,
    (page, problem, stylesheet) => {
      const clocks = clocksIn(page);
      if (!clocks.length) return; // shell.localTime says so
      const hiddenBy = clocks.map((clock) =>
        hiddenAt(stylesheet, PHONE_WIDTH, chainOf(clock))
      );
      if (hiddenBy.every(Boolean)) {
        problem(
          `a clock on screen at ${PHONE_WIDTH}px wide (\`${hiddenBy[0]}\` hides it)`
        );
      }
    }
  ),
  forKinds(
    ALL_KINDS,
    "shell.links",
    "The chrome only links to pages the navigation leads to (home, its items, and the pages beneath them), so a skin never adds a way into the site the others lack.",
    ({ chrome, to }, problem) => {
      const base = to("");
      const paths = new Set(
        linksIn(chrome)
          .map((link) => attr(link, "href") ?? "")
          .filter((href) => href.startsWith(`${base}/`))
          .map((href) => href.slice(base.length).replace(/[?#].*$/, ""))
      );
      for (const path of paths) {
        if (path === "/") continue;
        if (!sectionFor(resolveView(path, getPage(path)).kind)) {
          problem(`no link to ${path}, which no navigation item leads to`);
        }
      }
    }
  ),
  forKinds(
    ALL_KINDS,
    "shell.forms",
    "The chrome holds no forms (search, sign-ups): what a page offers comes from its page model.",
    ({ chrome }, problem) => {
      const forms = chrome.querySelectorAll('form, search, [role="search"]');
      if (forms.length) problem(`no forms in the chrome (${forms.length})`);
    }
  )
];

// Every page
// --------------------------------------------------

const everyPage: Omit<Requirement, "group">[] = [
  forKinds(
    ALL_KINDS,
    "page.h1",
    "A page has one `<h1>`, in `<main>`; on a page with a title, it’s the title (`titleOf()`).",
    ({ document, main, view }, problem) => {
      const headings = document.querySelectorAll("h1");
      const inMain = main.querySelectorAll("h1");
      if (headings.length !== 1 || inMain.length !== 1) {
        problem(
          `one <h1>, in <main> (${headings.length}, ${inMain.length} in <main>)`
        );
        return;
      }
      if ("page" in view) {
        const title = plain(titleOf(view.page));
        if (!says(inMain[0], title)) problem(`“${title}” in the <h1>`);
      }
    }
  ),
  forKinds(
    ALL_KINDS,
    "page.links",
    "Every link leads somewhere: a page the site has, or an `id` on this one.",
    ({ document, to }, problem) => {
      const base = to("");
      const hrefs = new Set(
        linksIn(document).map((link) => attr(link, "href") ?? "")
      );
      for (const href of hrefs) {
        if (href === "" || href === "#") {
          problem('no placeholder links (href="#")');
        } else if (href.startsWith("#")) {
          if (!document.getElementById(decodeURIComponent(href.slice(1)))) {
            problem(`an id for ${href}`);
          }
        } else if (href.startsWith(`${base}/`)) {
          const path = href.slice(base.length).replace(/[?#].*$/, "");
          if (path !== "/" && !getPage(path)) problem(`a page at ${path}`);
        }
      }
    }
  ),
  forKinds(
    ALL_KINDS,
    "page.images",
    "Every `<img>` has an `alt`, empty when it’s decoration.",
    ({ document }, problem) => {
      const missing = document
        .querySelectorAll("img")
        .filter((image) => attr(image, "alt") === undefined);
      if (missing.length) problem(`alt on ${missing.length} images`);
    }
  ),
  forKinds(
    ALL_KINDS,
    "page.newsletter",
    "The newsletter sign-up (`newsletterForm`: a form with a required email field named `email`, sending the shared way on the live site) is on exactly the pages that ask for it.",
    (page, problem) => {
      const { main, view } = page;
      const asked =
        view.kind === "post"
          ? view.page.newsletter
          : "page" in view && hasNewsletter(view.page);
      const { name, required } = newsletterForm.field;
      const emailIn = (form: HTMLElement) =>
        form.querySelector(`input[type="email"][name="${name}"]`);
      const signups = (element: HTMLElement) =>
        element
          .querySelectorAll("form")
          .filter((form) => emailIn(form) && !form.querySelector("textarea"));
      const forms = signups(main);
      if (asked && !forms.length) problem("the newsletter sign-up");
      if (!asked && forms.length) problem("no newsletter sign-up here");
      if (asked) {
        const live = signups(page.live().main);
        if (!live.length) problem("the newsletter sign-up on the live site");
        live
          .flatMap((form) => submissionProblems(form, "newsletter"))
          .forEach(problem);
      }
      if (
        required &&
        forms.some((form) => attr(emailIn(form)!, "required") === undefined)
      ) {
        problem("the sign-up’s email marked required");
      }
    }
  )
];

// Pages, by kind
// --------------------------------------------------

const pages: Omit<Requirement, "group">[] = [
  forKinds(
    ["home"],
    "home.intro",
    "Home introduces the owner: name, role, portrait, and bio.",
    ({ main, content }, problem) => {
      const { name, role, bio, avatar } = content.profile;
      if (!says(main, name)) problem(`the name, ${name}`);
      if (!says(main, role)) problem(`the role, “${role}”`);
      if (!shows(main, avatar)) problem("the portrait");
      if (!says(main, plain(bio))) problem("the bio");
    }
  ),
  forKinds(
    ["home"],
    "home.writing",
    `Home links to the writing archive and to at least the latest ${HOME.posts} posts.`,
    ({ main, content, to }, problem) => {
      linkProblems(main, [
        { url: to("/archive/"), text: "Writing" },
        ...content.posts
          .slice(0, HOME.posts)
          .map((post) => ({ url: post.url, text: post.title }))
      ]).forEach(problem);
    }
  ),
  forKinds(
    ["home"],
    "home.work",
    `Home links to the portfolio and to exactly the case studies in \`HOME.work\` (${homeWork(
      getLabContent()
    )
      .map((item) => item.name)
      .join(
        ", "
      )}; \`homeWork()\`), and shows no other case study: no link to one, and no cover.`,
    ({ main, content, to }, problem) => {
      const shown = homeWork(content);
      if (shown.length !== HOME.work.length) {
        problem("a case study in the content for every path in HOME.work");
      }
      linkProblems(main, [
        { url: to("/portfolio/"), text: "Work" },
        ...shown.map((item) => ({ url: item.url, text: item.name }))
      ]).forEach(problem);
      for (const item of content.work) {
        if (shown.includes(item)) continue;
        if (linksToIn(main, item.url)) {
          problem(`no link to ${item.name}, which Home doesn’t show`);
        }
        if (shows(main, item.cover) || shows(main, item.coverSquare)) {
          problem(`no cover of ${item.name}, which Home doesn’t show`);
        }
      }
    }
  ),
  forKinds(
    ["home"],
    "home.services",
    "Home lists every service, linked, with its lede.",
    ({ main, content }, problem) => {
      for (const service of content.services) {
        if (!linksToIn(main, service.url))
          problem(`a link to ${service.title}`);
        if (service.lede && !says(main, plain(service.lede))) {
          problem(`${service.title}’s lede`);
        }
      }
    }
  ),
  forKinds(
    ["home"],
    "home.testimonials",
    "Home quotes every testimonial in `content.testimonials`, whole or truncated, with who said it.",
    ({ main, content }, problem) =>
      quoteProblems(main, content.testimonials).forEach(problem)
  ),

  forKinds(
    ["work"],
    "work.caseStudies",
    "The portfolio lists every case study, linked, with its lede, industry, role, and years.",
    ({ main, content }, problem) => {
      for (const item of content.work) {
        if (!linksToIn(main, item.url)) problem(`a link to ${item.name}`);
        if (item.lede && !says(main, plain(item.lede))) {
          problem(`${item.name}’s lede`);
        }
        for (const [label, value] of [
          ["industry", item.industry],
          ["role", item.role],
          ["years", item.year]
        ]) {
          if (value && !says(main, value)) problem(`${item.name}’s ${label}`);
        }
      }
    }
  ),
  forKinds(
    ["work", "services", "service"],
    "page.testimonials",
    "Quotes every testimonial the page asks for (`quotesOf()`).",
    ({ main, view, content }, problem) =>
      quoteProblems(main, quotesOf(view.page, content)).forEach(problem)
  ),

  forKinds(
    ["caseStudy"],
    "caseStudy.specs",
    "A case study links back to the portfolio, and shows its cover, lede, overview, industry, company size, years, every service and technology, its collaborators and awards, and the site it made.",
    ({ main, view: { page }, to }, problem) => {
      if (!linksToIn(main, to("/portfolio/")))
        problem("a link to the portfolio");
      if (page.cover && !shows(main, page.cover)) problem("the cover");
      const texts: [string, string | undefined][] = [
        ["lede", page.lede],
        ["overview", page.overview && plain(page.overview)],
        ["industry", page.industry],
        ["company size", page.size],
        ["years", page.year],
        ...(page.services ?? []).map((service): [string, string] => [
          "service",
          service
        ]),
        ...(page.technologies ?? []).map((tech): [string, string] => [
          "technology",
          tech
        ]),
        ...(page.people ?? []).map((person): [string, string] => [
          "collaborator",
          person.name
        ]),
        ...(page.awards ?? []).map((award): [string, string] => [
          "award",
          award.name
        ])
      ];
      for (const [label, text] of texts) {
        if (text && !says(main, text))
          problem(`the ${label}, “${short(text, 40)}”`);
      }
      for (const person of page.people ?? []) {
        if (person.url && !linksToIn(main, person.url)) {
          problem(`a link to ${person.name}`);
        }
      }
      if (page.siteUrl && !linksToIn(main, page.siteUrl)) {
        problem(`a link to ${page.siteUrl}`);
      }
    }
  ),
  forKinds(
    ["caseStudy"],
    "caseStudy.story",
    "A case study tells its story whole: the client, the challenge, the solution, every gallery item, its quotes, and its body.",
    ({ main, view: { page } }, problem) => {
      const { client, challenge, solution } = page.pillars ?? {};
      if (client && !says(main, client)) problem("the client");
      if (challenge && !says(main, plain(challenge))) problem("the challenge");
      if (solution && !says(main, plain(solution))) problem("the solution");
      for (const section of page.sections) {
        if (section.type === "portfolioGrid") {
          for (const item of section.items ?? []) {
            const media = item.video ?? item.image;
            if (media && !shows(main, media)) {
              problem(`the gallery’s ${item.title ?? imageKey(media)}`);
            }
          }
        }
        if (section.type === "testimonial" && section.testimonial) {
          quoteProblems(main, [section.testimonial]).forEach(problem);
        }
      }
      bodyProblems(main, page.content).forEach(problem);
    }
  ),
  forKinds(
    ["caseStudy"],
    "caseStudy.enlarge",
    "A gallery that asks to open larger (`section.enlarge`) links each screenshot to its full size (`item.enlargeHref`), the link around the image.",
    ({ main, view: { page } }, problem) => {
      for (const section of page.sections) {
        if (section.type !== "portfolioGrid" || !section.enlarge) continue;
        for (const item of section.items ?? []) {
          if (item.video || !item.image) continue;
          const image = item.image;
          if (!linksTo(main, item.enlargeHref).some((a) => shows(a, image))) {
            problem(
              `a link around the gallery’s ${item.title ?? imageKey(image)}`
            );
          }
        }
      }
    }
  ),

  forKinds(
    ["writing"],
    "writing.posts",
    "The writing archive lists every post, linked, with its date, type, and lede.",
    ({ main, content }, problem) => {
      for (const post of content.posts) {
        if (!linksToIn(main, post.url)) {
          problem(`a link to “${short(post.title, 40)}”`);
          continue;
        }
        const dated =
          says(main, post.date) ||
          main.querySelector(`time[datetime="${post.iso}"]`);
        if (!dated) problem(`the date of “${short(post.title, 40)}”`);
        if (post.type && !says(main, post.type)) {
          problem(`the type of “${short(post.title, 40)}”`);
        }
        if (post.lede && !says(main, post.lede)) {
          problem(`the lede of “${short(post.title, 40)}”`);
        }
      }
    }
  ),

  forKinds(
    ["post"],
    "post.meta",
    "A post links back to the writing archive and its type’s archive, and shows its lede, its date in a `<time datetime>`, its reading time (`readingMinutes()`), and every tag.",
    ({ main, view: { page }, to }, problem) => {
      if (!linksToIn(main, to("/archive/"))) problem("a link to the archive");
      if (page.type && !linksToIn(main, page.type.url)) {
        problem(`a link to the ${page.type.label} archive`);
      }
      if (page.lede && !says(main, page.lede)) problem("the lede");
      if (!main.querySelector(`time[datetime="${page.date.iso}"]`)) {
        problem(`<time datetime="${page.date.iso}">`);
      }
      const minutes = readingMinutes(page.content);
      if (!says(main, `${minutes} min`))
        problem(`the reading time, ${minutes} min`);
      for (const tag of page.tags ?? []) {
        if (tag.url ? !linksToIn(main, tag.url) : !says(main, tag.name)) {
          problem(`the tag ${tag.name}`);
        }
      }
    }
  ),
  forKinds(
    ["post"],
    "post.body",
    "A post renders its body whole: every heading, link, and image in it.",
    ({ main, view: { page } }, problem) =>
      bodyProblems(main, page.content).forEach(problem)
  ),
  forKinds(
    ["post"],
    "post.nav",
    "A post links to the previous and next posts.",
    ({ main, view: { page } }, problem) =>
      linkProblems(
        main,
        [page.postNav?.previous, page.postNav?.next].flatMap((link) =>
          link ? [link] : []
        )
      ).forEach(problem)
  ),
  forKinds(
    ["post", "caseStudy"],
    "post.comments",
    "A post or case study that asks for comments (`page.comments`) shows them (`Comments`: the Disqus thread for its canonical URL), and one that doesn’t shows none.",
    ({ main, view: { page } }, problem) => {
      const threads = main.querySelectorAll(`#${COMMENTS_ID}`).length;
      if (page.comments && threads !== 1) {
        problem(threads ? "one comments thread" : "the comments thread");
      }
      if (!page.comments && threads) problem("no comments thread here");
    }
  ),

  forKinds(
    ["archive", "page"],
    "listing.sections",
    "A page renders its intro, its body, and each of its sections: entries (linked, with their ledes), tags, post types, and pages.",
    ({ main, view: { page } }, problem) => {
      introProblems(main, page).forEach(problem);
      bodyProblems(main, page.content).forEach(problem);
      for (const section of page.sections) {
        if (section.type === "entries") {
          for (const entry of section.entries) {
            const name = entry.heading ?? entry.url ?? "an entry";
            if (entry.url && !linksToIn(main, entry.url))
              problem(`a link to ${name}`);
            if (entry.lede && !says(main, plain(entry.lede))) {
              problem(`the lede of ${name}`);
            }
          }
        }
        if (section.type === "tagList")
          linkProblems(main, section.tags).forEach(problem);
        if (section.type === "typeList")
          linkProblems(main, section.types).forEach(problem);
        if (section.type === "pageList") {
          linkProblems(
            main,
            section.pages.map((entry) => ({
              url: entry.url,
              text: entry.title
            }))
          ).forEach(problem);
        }
      }
    }
  ),

  forKinds(
    ["about"],
    "about.profile",
    "About shows its intro and body, every profile fact (in the direction’s own labels) with its link, every profile elsewhere, and every photo with its caption.",
    ({ main, view: { page }, content }, problem) => {
      introProblems(main, page).forEach(problem);
      for (const fact of content.profile.facts) {
        if (!says(main, fact.text)) problem(`the ${fact.id} fact`);
        if (fact.url && !linksToIn(main, fact.url))
          problem(`the ${fact.id} fact’s link`);
      }
      linkProblems(main, content.socials).forEach(problem);
      for (const photo of content.profile.photos) {
        if (!shows(main, photo.src)) problem(`the photo “${photo.alt}”`);
        const captioned =
          says(main, photo.alt) ||
          main
            .querySelectorAll("img")
            .some((image) => attr(image, "alt") === photo.alt);
        if (!captioned) problem(`the caption “${photo.alt}”`);
      }
    }
  ),

  forKinds(
    ["services"],
    "services.list",
    "Services lists every service, linked, with its lede, and every step of the process.",
    ({ main, content }, problem) => {
      for (const service of content.services) {
        if (!linksToIn(main, service.url))
          problem(`a link to ${service.title}`);
        if (service.lede && !says(main, plain(service.lede))) {
          problem(`${service.title}’s lede`);
        }
      }
      for (const step of content.profile.process) {
        if (!says(main, step.title) || !says(main, step.text)) {
          problem(`the ${step.title} step`);
        }
      }
    }
  ),
  forKinds(
    ["service"],
    "service.page",
    "A service links back to Services, renders its intro, body, and entries, and lists every other service, linked, with its lede.",
    ({ main, view: { page }, content, to }, problem) => {
      if (!linksToIn(main, to("/services/"))) problem("a link to Services");
      introProblems(main, page).forEach(problem);
      bodyProblems(main, page.content).forEach(problem);
      for (const section of page.sections) {
        if (section.type !== "entries") continue;
        for (const entry of section.entries) {
          if (entry.heading && !says(main, plain(entry.heading))) {
            problem(`the entry “${short(plain(entry.heading), 40)}”`);
          }
          if (entry.lede && !says(main, plain(entry.lede))) {
            problem(`the lede of “${short(plain(entry.heading ?? ""), 40)}”`);
          }
        }
      }
      for (const service of content.services) {
        if (samePath(service.url, page.url)) continue;
        if (!linksToIn(main, service.url))
          problem(`a link to ${service.title}`);
        if (service.lede && !says(main, plain(service.lede))) {
          problem(`${service.title}’s lede`);
        }
      }
    }
  ),

  forKinds(
    ["testimonials"],
    "testimonials.grid",
    "Testimonials shows every quality with its count, and every quote in the grid.",
    ({ main, view: { page } }, problem) => {
      const grid = page.sections.find(
        (section) => section.type === "testimonials-grid"
      );
      if (!grid) return;
      for (const quality of grid.qualities) {
        if (!says(main, quality.label)) problem(`the quality ${quality.label}`);
      }
      quoteProblems(main, grid.testimonials).forEach(problem);
    }
  ),

  forKinds(
    ["contact", "inquiry"],
    "form.questions",
    "A form asks `formOf(kind)`’s questions: a control named for each field, required where the field is, its label, and each of its choices.",
    ({ main, view }, problem) => {
      for (const field of formOf(view.kind).fields) {
        const controls = main.querySelectorAll(`form [name="${field.name}"]`);
        if (!controls.length) problem(`a control named ${field.name}`);
        if (
          field.required &&
          controls.length &&
          !controls.some((control) => attr(control, "required") !== undefined)
        ) {
          problem(`${field.name} marked required`);
        }
        if (!says(main, field.label)) problem(`the label “${field.label}”`);
        if (field.kind === "choices") {
          for (const option of field.options) {
            if (!says(main, option)) problem(`the choice “${option}”`);
          }
          if (controls.length && controls.length < field.options.length) {
            problem(`a control for each of ${field.name}’s choices`);
          }
        }
      }
    }
  ),
  forKinds(
    ["contact", "inquiry"],
    "form.copy",
    "A form page shows the form’s title, the owner’s email and location, the form’s submit label, and its link to the other form.",
    ({ main, view, content, to }, problem) => {
      const form = formOf(view.kind);
      const { email, location } = content.profile;
      if (!says(main, form.title)) problem(`the form’s title, “${form.title}”`);
      if (!linksToIn(main, `mailto:${email}`))
        problem(`a mailto: link to ${email}`);
      if (!says(main, location.name)) problem(`the location, ${location.name}`);
      const submits = main
        .querySelectorAll("form button, form input[type=submit]")
        .filter((button) => (attr(button, "type") ?? "submit") === "submit");
      if (
        !submits.some(
          (button) =>
            says(button, form.submit) || attr(button, "value") === form.submit
        )
      ) {
        problem(`a submit button labeled “${form.submit}”`);
      }
      if (
        !linksTo(main, to(form.alternate.path)).some((link) =>
          says(link, form.alternate.text)
        )
      ) {
        problem(`a link to ${form.alternate.path}, “${form.alternate.text}”`);
      }
    }
  ),
  forKinds(
    ["contact", "inquiry"],
    "form.sends",
    "On the live site, the form sends its answers the shared way (`useSubmission(kind)`): to Netlify Forms under the form’s name, on to the success page, with the hidden fields a submission needs. In the lab it’s a mockup that can’t send, even without script.",
    (page, problem) => {
      const { view } = page;
      const [first] = formOf(view.kind).fields;
      const formIn = (element: HTMLElement) =>
        element
          .querySelectorAll("form")
          .find((candidate) =>
            candidate.querySelector(`[name="${first.name}"]`)
          );
      const live = formIn(page.live().main);
      if (!live) return problem("a form with the questions");
      submissionProblems(live, view.kind).forEach(problem);
      const mockup = formIn(page.main);
      if (mockup && attr(mockup, "method")?.toLowerCase() !== "dialog") {
        problem('the lab’s mockup with method="dialog", so it never sends');
      }
    }
  ),

  forKinds(
    ["notFound"],
    "notFound.links",
    "The not-found page links home, to the writing archive, and to the portfolio.",
    ({ main, to }, problem) =>
      linkProblems(main, [
        { url: to("/"), text: "Home" },
        { url: to("/archive/"), text: "Writing" },
        { url: to("/portfolio/"), text: "Work" }
      ]).forEach(problem)
  )
];

/** Every requirement, in the order they're reported */
export const REQUIREMENTS: Requirement[] = [
  ...shell.map((requirement) => ({ ...requirement, group: "Shell" as const })),
  ...everyPage.map((requirement) => ({
    ...requirement,
    group: "Every page" as const
  })),
  ...pages.map((requirement) => ({ ...requirement, group: "Pages" as const }))
];
