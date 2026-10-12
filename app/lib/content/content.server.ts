import slugifyString from "slugify";

import { personById } from "../../data/people";
import { portfolio } from "../../data/portfolio";
import { profile } from "../../data/profile";
import { socials } from "../../data/socials";
import testimonialAnalysis from "../../data/testimonial-analysis.json";
import { testimonials } from "../../data/testimonials";
import type { PortfolioItem, TestimonialAnalysis } from "../../data/types";
import { escapeHtml } from "../html";
import { absoluteUrl, canonicalPath, isExternalUrl, metadata } from "../site";
import type {
  BasicPageModel,
  EntriesSection,
  EntryModel,
  IntroSection,
  LabContent,
  LinkModel,
  PageMeta,
  PageModel,
  PhotoModel,
  PortfolioGridSection,
  PortfolioPageModel,
  PostNavModel,
  PostPageModel,
  SectionModel,
  TestimonialModel
} from "../types";

import { CLOUDINARY_URL as CLOUDINARY, cloudinaryCover } from "./cloudinary";
import {
  htmlDateString,
  longDate,
  postYear,
  readableDate
} from "./dates.server";
import { parseFrontMatter } from "./frontmatter.server";
import { addExternalLinkAttributes, buildTableOfContents } from "./html.server";
import { renderMarkdown } from "./markdown.server";
import { expandShortcodes } from "./shortcodes.server";

/**
 * Content
 * ==================================================
 * Loads every Markdown file in `/content`, applies per-collection defaults
 * (what Eleventy's directory data files and layouts used to provide), and
 * turns a URL into a serializable page model for the route components.
 */

const sources = import.meta.glob<string>("/content/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true
});

// Pages without a `date` (everything except posts) are dated at build time,
// which is what Eleventy's file-creation dates amounted to on Netlify.
const BUILD_DATE = new Date();

//
// Types
// -----

type CollectionName =
  | "pages"
  | "posts"
  | "drafts"
  | "bookshelf"
  | "portfolio"
  | "services"
  | "type";

type Layout = "page" | "post" | "portfolio" | "type";

interface RawSection {
  type: string;
  [key: string]: unknown;
}

interface FrontMatter {
  title?: string;
  permalink?: string;
  date?: Date | string;
  type?: string;
  long_form?: string;
  lede?: string;
  short_lede?: string;
  cover?: string;
  tags?: string | string[];
  meta?: {
    title?: string;
    description?: string | null;
    image?: string;
    image_alt?: string;
  };
  sections?: unknown;
  templateClass?: string;
  modifier?: string;
  toc?: boolean;
  cta?: boolean;
  comments?: boolean;
  navigation?: { key: string; order?: number };
  changefreq?: string;
  seoPriority?: number;
  /** Portfolio pages: key of the case study in `app/data/portfolio` */
  data?: string;
  /** Services: sort order */
  order?: number;
  excludeFromCollections?: boolean;
  [key: string]: unknown;
}

interface ContentItem {
  /** Source path, e.g. `/content/posts/introduction.md` */
  path: string;
  collection: CollectionName;
  layout: Layout;
  fileSlug: string;
  data: FrontMatter;
  tags: string[];
  body: string;
  url: string;
  date: Date;
}

/** Any page that is listed in the sitemap, page list and pre-rendered */
interface SitePage {
  url: string;
  title?: string;
  date: Date;
  /** Source path, used as the sort tie-breaker */
  path: string;
  changefreq?: string;
  seoPriority?: number;
}

//
// Collection defaults
// -------------------

const POST_LAYOUT = { changefreq: "yearly", seoPriority: 0.7 };

const COLLECTIONS: Record<
  CollectionName,
  { layout: Layout; data?: FrontMatter; tags?: string[] }
> = {
  pages: { layout: "page" },
  posts: { layout: "post", data: POST_LAYOUT, tags: ["posts"] },
  drafts: { layout: "post", data: POST_LAYOUT, tags: ["drafts"] },
  bookshelf: {
    layout: "post",
    data: { ...POST_LAYOUT, type: "Book", long_form: "Book Review" }
  },
  portfolio: {
    layout: "portfolio",
    data: {
      changefreq: "yearly",
      seoPriority: 0.9,
      type: "Portfolio",
      long_form: "Portfolio Item",
      cta: false,
      comments: false
    }
  },
  services: {
    layout: "page",
    data: {
      type: "Service",
      long_form: "Service Item",
      cta: false,
      comments: false,
      templateClass: "_page-spacing-bottom"
    }
  },
  type: { layout: "type", data: { changefreq: "weekly" } }
};

// Sections shared by every `/type/*` and `/tags/*` archive page
const archiveSections = (heading: string): RawSection[] => [
  { type: "intro" },
  {
    type: "entries",
    showCovers: false,
    heading,
    orientation: "archive",
    items: { from: "posts", limit: -100 }
  },
  { type: "newsletter", spacing: 10 }
];

const TYPE_SECTIONS = archiveSections("Archives");
const TAG_SECTIONS = archiveSections("All articles");

const FILTERED_TAGS = ["all", "nav", "post", "posts", "Featured"];

// Only served as the body of a 404 response, never pre-rendered
const NOT_FOUND_URL = "/404.html";

const TESTIMONIAL_TRUNCATE_LENGTH = 225;

//
// Helpers
// -------

const slug = (value: unknown) =>
  slugifyString(String(value), { replacement: "-", lower: true });

const plural = (value: unknown) => `${value}s`;

const tagUrl = (tag: string) => `/tags/${slug(tag)}/`;

/** Archive of every post with this `type` (e.g. `/type/articles/`) */
const typeUrl = (type: string) => `/type/${plural(slug(type))}/`;

const html = (value: unknown) => addExternalLinkAttributes(String(value));

const toArray = (tags: FrontMatter["tags"]) =>
  tags === undefined || tags === null
    ? []
    : Array.isArray(tags)
      ? tags
      : [tags];

const filterTagList = (tags: string[]) =>
  tags.filter((tag) => !FILTERED_TAGS.includes(tag));

// Nunjucks' `truncate` filter (without `killwords`)
function truncate(input: string, length: number) {
  if (input.length <= length) return input;
  let index = input.lastIndexOf(" ", length);
  if (index === -1) index = length;
  return `${input.substring(0, index)}...`;
}

// Nunjucks' `title` filter
const titleCase = (value: string) =>
  value
    .split(" ")
    .map((word) => {
      const lower = word.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");

const nl2br = (value: string) => value.replace(/\r\n|\n/g, "<br />\n");

const byDate = (a: { date: Date; path: string }, b: typeof a) =>
  a.date.getTime() - b.date.getTime() ||
  (a.path > b.path ? 1 : a.path < b.path ? -1 : 0);

// Front matter links are written without a trailing slash (`/services`)
function asLink(value: unknown): LinkModel | undefined {
  if (!value || typeof value !== "object") return undefined;
  const { url, text } = value as Record<string, unknown>;
  return { url: canonicalPath(String(url ?? "")), text: String(text ?? "") };
}

const optionalString = (value: unknown) =>
  value === undefined || value === null || value === ""
    ? undefined
    : String(value);

//
// Loading
// -------

function getCollectionName(path: string): CollectionName {
  const directory = path.split("/")[2];
  if (directory in COLLECTIONS) return directory as CollectionName;
  throw new Error(`Unknown content directory for ${path}`);
}

function getUrl(item: Omit<ContentItem, "url">) {
  const { permalink, title } = item.data;
  if (typeof permalink === "string") {
    return permalink.startsWith("/") ? permalink : `/${permalink}`;
  }

  switch (item.layout) {
    case "post":
    case "portfolio":
      return `/${slug(title)}/`;
    case "type":
      return `/type/${item.fileSlug}/`;
    default:
      return item.fileSlug === "index" ? "/" : `/${item.fileSlug}/`;
  }
}

function loadItem(path: string, source: string): ContentItem {
  const collection = getCollectionName(path);
  const defaults = COLLECTIONS[collection];
  const { data: frontMatter, body } = parseFrontMatter(source);
  const data = { ...defaults.data, ...(frontMatter as FrontMatter) };
  const fileSlug = path.slice(path.lastIndexOf("/") + 1, -".md".length);
  const date =
    data.date instanceof Date
      ? data.date
      : data.date
        ? new Date(data.date)
        : BUILD_DATE;

  const item = {
    path,
    collection,
    layout: defaults.layout,
    fileSlug,
    data,
    tags: [...(defaults.tags ?? []), ...toArray(data.tags)],
    body,
    date
  };

  return { ...item, url: getUrl(item) };
}

interface ContentIndex {
  /** Every routable page except the ones marked `excludeFromCollections` */
  listed: ContentItem[];
  /** Newest first */
  posts: ContentItem[];
  tagList: string[];
  typeList: string[];
  pages: SitePage[];
  byUrl: Map<string, () => PageModel>;
  /** The page served as the body of every 404 response */
  notFound: () => PageModel;
}

let contentIndex: ContentIndex | undefined;

function getIndex(): ContentIndex {
  if (contentIndex) return contentIndex;

  const memo = (fn: () => PageModel) => {
    let model: PageModel | undefined;
    return () => (model ??= fn());
  };

  const files = Object.entries(sources)
    .map(([path, source]) => loadItem(path, source))
    .sort((a, b) => (a.path > b.path ? 1 : -1));

  // The 404 page isn't routable, listed, or pre-rendered: fail the build,
  // not the first 404 request, when it's missing
  const notFoundItem = files.find((item) => item.url === NOT_FOUND_URL);
  if (!notFoundItem) {
    throw new Error(`No content page has \`permalink: ${NOT_FOUND_URL}\``);
  }
  const items = files.filter((item) => item !== notFoundItem);

  const listed = items.filter((item) => !item.data.excludeFromCollections);
  const posts = listed
    .filter((item) => item.collection === "posts")
    .sort(byDate)
    .reverse();

  const tagList = filterTagList([
    ...new Set(listed.flatMap((item) => item.tags))
  ]);
  const typeList = [
    ...new Set(
      listed
        .map((item) => item.data.type)
        .filter((type): type is string => Boolean(type))
    )
  ];

  const byUrl = new Map<string, () => PageModel>();

  for (const item of items) {
    if (byUrl.has(item.url)) {
      throw new Error(`Duplicate URL ${item.url} (${item.path})`);
    }
    byUrl.set(
      item.url,
      memo(() => buildItemPage(item))
    );
  }

  const tagPages: SitePage[] = tagList.map((tag) => {
    const url = tagUrl(tag);
    if (byUrl.has(url)) {
      throw new Error(`Duplicate URL ${url} (tag "${tag}")`);
    }
    byUrl.set(
      url,
      memo(() => buildTagPage(tag, url))
    );
    return {
      url,
      title: tagTitle(tag),
      date: BUILD_DATE,
      path: "/content/pages/tags/",
      changefreq: "weekly"
    };
  });

  // Sorted like Eleventy's `collections.all`: by date, then source path
  const pages: SitePage[] = [
    ...listed.map((item) => ({
      url: item.url,
      title: getTitle(item),
      date: item.date,
      path: item.path,
      changefreq: item.data.changefreq,
      seoPriority: item.data.seoPriority
    })),
    ...tagPages
  ].sort(byDate);

  contentIndex = {
    listed,
    posts,
    tagList,
    typeList,
    pages,
    byUrl,
    notFound: memo(() => buildItemPage(notFoundItem))
  };
  return contentIndex;
}

//
// Rendering
// ---------

const renderedBodies = new Map<string, string>();

function renderBody(item: ContentItem) {
  let rendered = renderedBodies.get(item.path);
  if (rendered === undefined) {
    rendered = item.body.trim()
      ? html(renderMarkdown(expandShortcodes(item.body, item.path)))
      : "";
    renderedBodies.set(item.path, rendered);
  }
  return rendered;
}

const getTitle = (item: ContentItem) =>
  item.layout === "type" ? plural(item.data.type) : item.data.title;

const tagTitle = (tag: string) => `Articles tagged “${tag}”`;

function getMeta(url: string, title?: string, meta?: FrontMatter["meta"]) {
  const name = meta?.title ? meta.title : title;
  const pageTitle = title ? `${name} | ${metadata.title}` : metadata.title;

  let image: string | undefined;
  if (meta?.image) {
    image = isExternalUrl(meta.image) ? meta.image : absoluteUrl(meta.image);
  }

  const result: PageMeta = {
    title: pageTitle,
    description: meta?.description || metadata.description,
    canonical: absoluteUrl(url)
  };
  if (image) result.image = image;
  if (image && meta?.image_alt) result.imageAlt = meta.image_alt;
  return result;
}

//
// Sections
// --------

interface SectionContext {
  title?: string;
  tag?: string;
  type?: string;
}

interface EntryFields {
  cover?: unknown;
  heading?: unknown;
  lede?: unknown;
  url?: unknown;
  linkText?: unknown;
}

function entry({ cover, heading, lede, url, linkText }: EntryFields) {
  const model: EntryModel = {};
  if (cover) model.cover = String(cover);
  if (heading) model.heading = String(heading);
  if (lede) model.lede = html(lede);
  if (url) model.url = String(url);
  if (linkText) model.linkText = String(linkText);
  return model;
}

// The case study's page: the Markdown file that declares `data: <key>`
function portfolioUrl(key: string) {
  const page = getIndex().listed.find(
    (item) => item.collection === "portfolio" && item.data.data === key
  );
  if (!page) throw new Error(`No portfolio page has \`data: ${key}\``);
  return page.url;
}

function portfolioEntry(key: string, showCovers: boolean) {
  const item = portfolio[key];
  if (!item) throw new Error(`Unknown portfolio item "${key}" in \`featured\``);
  return entry({
    cover: showCovers && cloudinaryCover(item.cover ?? ""),
    heading: item.name,
    lede: item.lede,
    url: portfolioUrl(key),
    linkText: "View case study"
  });
}

const servicesByDate = () =>
  getIndex()
    .listed.filter((item) => item.collection === "services")
    .sort(byDate);

// Nunjucks' `sort(attribute='data.order')`
const byOrder = (items: ContentItem[]) =>
  [...items].sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0));

// Posts and featured items are newest first
function getCollection(name: unknown): ContentItem[] | undefined {
  const index = getIndex();
  switch (name) {
    case "posts":
      return index.posts;
    case "featured":
      return index.listed
        .filter((item) => item.tags.includes("Featured"))
        .sort(byDate)
        .reverse();
    case "portfolio":
      return index.listed.filter((item) => item.collection === "portfolio");
    case "services":
      return servicesByDate();
    default:
      return undefined;
  }
}

function resolveEntries(
  section: RawSection,
  context: SectionContext
): EntriesSection {
  const showCovers = Boolean(section.showCovers);
  const model: EntriesSection = {
    type: "entries",
    heading: optionalString(section.heading),
    readMore: asLink(section.readMore),
    entries: [],
    empty: false
  };

  const items = section.items as Record<string, unknown> | undefined;
  if (!items) return model;

  const { orientation, columns } = section;
  model.itemsClass =
    orientation && columns
      ? `-${orientation}-${columns}-columns`
      : `-${orientation ?? ""}`;

  const from = items.from;
  // Content writes `limit: -100` for "everything" (Nunjucks' `head` filter)
  const limit = Math.abs(Number(items.limit)) || Infinity;
  const collection = (getCollection(from) ?? []).slice(0, limit);

  if (!collection.length) {
    model.empty = true;
    return model;
  }

  if (from === "featured" || from === "posts") {
    let posts = collection;
    if (context.tag) {
      posts = posts.filter((post) => post.tags.includes(context.tag!));
    } else if (context.type) {
      posts = posts.filter((post) => post.data.type === context.type);
    }
    model.entries = posts.map((post) =>
      entry({
        cover: showCovers && post.data.cover,
        heading: post.data.title,
        lede: post.data.lede,
        url: post.url,
        linkText: "Read article"
      })
    );
  } else if (from === "portfolio") {
    const featured = items.featured as string[] | undefined;
    model.entries = featured
      ? featured.map((key) => portfolioEntry(key, showCovers))
      : Object.entries(portfolio)
          .filter(([, item]) => !item.template && !item.featured)
          .map(([key]) => portfolioEntry(key, showCovers));
  } else if (from === "services") {
    model.entries = byOrder(collection).map((service) =>
      entry({
        cover: showCovers && service.data.cover,
        heading: service.data.title,
        lede: service.data.lede,
        linkText: "Learn more"
      })
    );
  }

  return model;
}

function resolveIntro(
  section: RawSection,
  context: SectionContext
): IntroSection {
  const model: IntroSection = { type: "intro" };

  if (section.heading) model.heading = html(section.heading);
  else model.title = context.title;
  if (section.subheading) model.subheading = html(section.subheading);
  if (section.body) model.body = html(section.body);
  if (section.headerMaxWidth) {
    model.headerMaxWidth = String(section.headerMaxWidth);
  }
  if (section.subheadingMaxWidth) {
    model.subheadingMaxWidth = String(section.subheadingMaxWidth);
  }
  if (section.bodyMaxWidth) model.bodyMaxWidth = String(section.bodyMaxWidth);
  if (section.leftPhotos) model.leftPhotos = section.leftPhotos as PhotoModel[];

  const right = section.right as Record<string, unknown> | undefined;
  if (right) {
    model.right = {};
    if (right.heading) model.right.heading = String(right.heading);
    if (right.readMore) model.right.readMore = asLink(right.readMore);

    const items = right.items as Record<string, unknown> | undefined;
    if (items) {
      if (items.from === "services") {
        let services = byOrder(servicesByDate());
        if (items.limit) services = services.slice(0, Number(items.limit));
        model.right.items = {
          from: "services",
          entries: services.map((service) =>
            entry({
              heading: service.data.title,
              lede: service.data.short_lede
            })
          )
        };
      } else if (items.from === "photosOfMe") {
        model.right.items = { from: "photosOfMe" };
      } else {
        throw new Error(`Unknown intro items source "${items.from}"`);
      }
    }
  }

  return model;
}

function resolveTestimonial(id: unknown): TestimonialModel | undefined {
  const testimonial = testimonials.find((item) => item.id === Number(id));
  if (!testimonial) return undefined;

  const model: TestimonialModel = {
    id: testimonial.id,
    content: html(testimonial.content)
  };
  if (testimonial.content.length > TESTIMONIAL_TRUNCATE_LENGTH) {
    model.truncated = html(
      truncate(testimonial.content, TESTIMONIAL_TRUNCATE_LENGTH)
    );
  }

  const person = personById(testimonial.person_id);
  if (person) {
    model.person = { name: person.name };
    if (person.position) model.person.position = person.position;
    if (person.image) model.person.image = person.image;
  }

  return model;
}

const resolveTestimonials = (ids: unknown) =>
  (Array.isArray(ids) ? ids : [])
    .map(resolveTestimonial)
    .filter((testimonial): testimonial is TestimonialModel => !!testimonial);

function resolvePortfolioGrid(section: RawSection): PortfolioGridSection {
  const project = portfolio[String(section.project)];
  const assets = project?.assets ?? {};
  const contained = Boolean(section.contained);
  const description = optionalString(section.description);

  const model: PortfolioGridSection = {
    type: "portfolioGrid",
    modifier: optionalString(section.modifier),
    contained,
    enlarge: Boolean(section.enlarge),
    eyebrow: optionalString(section.eyebrow),
    headline: optionalString(section.headline),
    description: description ? html(nl2br(description)) : undefined,
    items: null
  };

  if (!Array.isArray(section.items)) return model;

  model.items = section.items.map((key) => {
    const asset = assets[Number(key)] ?? {};
    const transform = asset.asset_transform ?? "";
    const video = asset.video?.replace(`${CLOUDINARY}/video/upload/`, "");
    const image = asset.image?.replace(`${CLOUDINARY}/image/upload/`, "");
    const videoUrl = `${CLOUDINARY}/video/upload/${transform}/${video}`;
    const videoUrlRaw = `${CLOUDINARY}/video/upload/${video}`;
    const imageUrl = `${CLOUDINARY}/image/upload/${transform}/${image}`;
    const imageUrlRaw = `${CLOUDINARY}/image/upload/${image}`;

    return {
      video: video ? videoUrl : undefined,
      image: image ? imageUrl : undefined,
      imageRaw: image ? imageUrlRaw : undefined,
      title: optionalString(asset.title),
      caption: asset.caption ? html(asset.caption) : undefined,
      autoplay: asset.autoplay || undefined,
      preventLazy: asset.preventLazy || undefined,
      link: optionalString(asset.link),
      enlargeHref:
        asset.shot_link || (image ? imageUrlRaw : video ? videoUrlRaw : "#")
    };
  });

  return model;
}

function resolveSection(
  section: RawSection,
  context: SectionContext
): SectionModel {
  const index = getIndex();

  switch (section.type) {
    case "intro":
      return resolveIntro(section, context);
    case "entries":
      return resolveEntries(section, context);
    case "newsletter":
      return {
        type: "newsletter",
        spacing: section.spacing as string | number | undefined
      };
    case "newsletterStandalone":
      return {
        type: "newsletterStandalone",
        modifiers: optionalString(section.modifiers)
      };
    case "testimonials":
      return {
        type: "testimonials",
        readMore: asLink(section.readMore),
        testimonials: section.ids ? resolveTestimonials(section.ids) : null
      };
    case "testimonials-grid": {
      const analysis = testimonialAnalysis as TestimonialAnalysis;
      return {
        type: "testimonials-grid",
        qualities: analysis.topQualities.slice(0, 8).map((quality) => ({
          label: titleCase(quality.word.replaceAll("-", " ")),
          count: quality.count
        })),
        testimonials: resolveTestimonials(section.ids)
      };
    }
    case "testimonial":
      return {
        type: "testimonial",
        testimonial: section.id ? resolveTestimonial(section.id) : undefined
      };
    case "portfolioGrid":
      return resolvePortfolioGrid(section);
    case "dribbble":
      return {
        type: "dribbble",
        modifier: optionalString(section.modifier),
        items: (section.items as Array<Record<string, string>>) ?? []
      };
    case "tagList":
      return {
        type: "tagList",
        tags: index.tagList.map((tag) => ({ text: tag, url: tagUrl(tag) }))
      };
    case "typeList": {
      const exclude = section.exclude as string[] | undefined;
      return {
        type: "typeList",
        title: context.title,
        types: exclude
          ? index.typeList
              .filter((type) => !exclude.includes(type))
              .map((type) => ({ text: type, url: typeUrl(type) }))
          : []
      };
    }
    case "pageList":
      return {
        type: "pageList",
        title: context.title,
        pages: index.pages.map(({ title, url }) => ({ title, url }))
      };
    case "socialProofLogos":
    case "cta":
    case "contact":
    case "projectInquiry":
      return { type: section.type };
    default:
      throw new Error(`Unknown section type "${section.type}"`);
  }
}

const resolveSections = (sections: unknown, context: SectionContext) =>
  Array.isArray(sections)
    ? (sections as RawSection[]).map((section) =>
        resolveSection(section, context)
      )
    : [];

//
// Layouts
// -------

function getPostNav(item: ContentItem): PostNavModel | null {
  const { posts } = getIndex();
  const index = posts.indexOf(item);
  if (index === -1) return null;

  const toLink = (post?: ContentItem) =>
    post ? { url: post.url, text: String(post.data.title) } : undefined;
  const next = toLink(posts[index - 1]);
  const previous = toLink(posts[index + 1]);

  if (!next && !previous) return null;
  return { next, previous };
}

function buildPostPage(item: ContentItem): PostPageModel {
  const { data } = item;
  const type = data.type;
  const isBook = type === "Book";
  const body = renderBody(item);

  let content = "";
  if (isBook) {
    content += `<img class="post-imageBook" src="${escapeHtml(String(data.cover ?? ""))}" alt="${escapeHtml(String(data.title ?? ""))}" />`;
  }
  if (data.toc !== false) {
    const levels = import.meta.env.DEV
      ? ["h2", "h3", "h4", "h5"]
      : ["h2", "h3"];
    const toc = buildTableOfContents(body, levels);
    if (toc) {
      content += `<details class="toc">\n<summary class="toc-summary _label-sans">\nTable of Contents\n</summary>\n\n${toc}\n</details>\n`;
    }
  }
  content += body;

  const visibleTags = filterTagList(item.tags);
  const model: PostPageModel = {
    layout: "post",
    url: item.url,
    meta: getMeta(item.url, data.title, data.meta),
    sectionClass: [
      "post _page-spacing-top _container -small",
      type ? plural(slug(type)) : "",
      data.modifier ? `-${data.modifier}` : ""
    ]
      .filter(Boolean)
      .join(" "),
    date: {
      iso: htmlDateString(item.date),
      short: isBook ? postYear(item.date) : readableDate(item.date),
      long: longDate(item.date)
    },
    tags:
      item.tags.length > 1
        ? visibleTags.map((tag) =>
            tag === "drafts"
              ? { name: "draft" }
              : { name: tag, url: tagUrl(tag) }
          )
        : null,
    content,
    postNav: getPostNav(item),
    comments: data.comments !== false,
    newsletter: data.cta !== false
  };

  if (data.title) model.title = String(data.title);
  if (data.lede) model.lede = String(data.lede);
  if (type) {
    model.type = {
      label: type,
      url: typeUrl(type),
      title: `View archive for ${plural(slug(type))}`
    };
  }
  if (data.title) {
    model.footer = {
      article: data.long_form ? "a" : "an",
      typeLabel: (data.long_form ?? type ?? "").toLowerCase()
    };
  }

  return model;
}

function buildPortfolioPage(item: ContentItem): PortfolioPageModel {
  const { data } = item;
  const project: Partial<PortfolioItem> = portfolio[String(data.data)] ?? {};
  const { pillars } = project;

  return {
    layout: "portfolio",
    url: item.url,
    meta: getMeta(item.url, data.title, data.meta),
    color: project.color,
    client: project.name,
    lede: project.lede,
    overview: project.overview && html(project.overview),
    size: project.size,
    industry: project.industry,
    services: project.services,
    year: project.year === undefined ? undefined : String(project.year),
    technologies: project.technologies,
    people: project.people?.flatMap((id) => {
      const person = personById(id);
      return person
        ? [{ name: person.name, url: person.url, position: person.position }]
        : [];
    }),
    awards: project.awards,
    siteUrl: project.url,
    siteTitle: project.url
      ? `Visit ${project.name ?? ""} ${project.project ?? ""}`
      : undefined,
    cover: project.cover && cloudinaryCover(project.cover),
    pillars: pillars && {
      client: pillars.client,
      challenge: pillars.challenge && html(pillars.challenge),
      solution: pillars.solution && html(pillars.solution)
    },
    sections: resolveSections(data.sections, { title: data.title }),
    content: renderBody(item),
    comments: data.comments !== false
  };
}

function buildBasicPage(
  url: string,
  title: string | undefined,
  data: FrontMatter,
  sections: unknown,
  content: string,
  context: SectionContext
): BasicPageModel {
  return {
    layout: "page",
    url,
    meta: getMeta(url, title, data.meta),
    templateClass: data.templateClass,
    sections: resolveSections(sections, { title, ...context }),
    content
  };
}

function buildItemPage(item: ContentItem): PageModel {
  switch (item.layout) {
    case "post":
      return buildPostPage(item);
    case "portfolio":
      return buildPortfolioPage(item);
    default: {
      // `sections:` with no value is `null`, which means "none"
      let sections = item.data.sections;
      if (sections === undefined && item.layout === "type") {
        sections = TYPE_SECTIONS;
      }
      return buildBasicPage(
        item.url,
        getTitle(item),
        item.data,
        sections,
        renderBody(item),
        { type: item.data.type }
      );
    }
  }
}

function buildTagPage(tag: string, url: string): PageModel {
  return buildBasicPage(url, tagTitle(tag), {}, TAG_SECTIONS, "", { tag });
}

//
// Public API
// ----------

function normalizePath(pathname: string) {
  let path = pathname;
  try {
    path = decodeURI(pathname);
  } catch {
    // Keep the raw pathname when it can't be decoded
  }
  return path;
}

/** Returns the page model for a pathname, or `undefined` when there is none. */
export function getPage(pathname: string): PageModel | undefined {
  const { byUrl } = getIndex();
  const path = normalizePath(pathname);
  const build =
    byUrl.get(path) ??
    (!path.endsWith("/") ? byUrl.get(`${path}/`) : undefined);
  return build?.();
}

export function getNotFoundPage(): PageModel {
  return getIndex().notFound();
}

/** Every page that should be pre-rendered at build time */
export function getPrerenderPaths() {
  return getIndex().pages.map((page) => page.url);
}

/** Navigation items, from each page's `navigation` front matter */
export function getNavigation(): LinkModel[] {
  return getIndex()
    .listed.filter((item) => item.data.navigation)
    .map((item) => ({ item, order: item.data.navigation!.order ?? 0 }))
    .sort((a, b) => a.order - b.order || byDate(a.item, b.item))
    .map(({ item }) => ({
      url: item.url,
      text: item.data.navigation!.key
    }));
}

export function getSitemapPages() {
  return getIndex().pages.map((page) => ({
    url: absoluteUrl(page.url),
    lastmod: htmlDateString(page.date),
    changefreq: page.changefreq ?? "monthly",
    priority: page.seoPriority ?? 0.5
  }));
}

export function getFeedPosts() {
  return getIndex().posts.map((post) => ({
    title: String(post.data.title ?? ""),
    url: absoluteUrl(post.url),
    date: post.date,
    content: renderBody(post)
  }));
}

/** Real site content for the design lab (`/lab/*`), in one flat shape */
export function getLabContent(): LabContent {
  const index = getIndex();

  const posts = index.posts.map((post) => {
    const image = optionalString(post.data.meta?.image);
    return {
      title: String(post.data.title ?? ""),
      url: post.url,
      date: readableDate(post.date),
      iso: htmlDateString(post.date),
      year: postYear(post.date),
      type: optionalString(post.data.type),
      lede: optionalString(post.data.lede ?? post.data.meta?.description),
      // Skip social images that point outside `/public/images`
      image: image && /^(https:\/\/|\/images\/)/.test(image) ? image : undefined
    };
  });

  const work = Object.entries(portfolio)
    .filter(([, item]) => !item.template && item.cover)
    .sort(([, a], [, b]) => Number(b.featured ?? 0) - Number(a.featured ?? 0))
    .map(([key, item]) => ({
      name: item.name,
      url: portfolioUrl(key),
      lede: optionalString(item.lede),
      cover: cloudinaryCover(item.cover ?? ""),
      // Square, padded with the cover's own edge color, for narrow frames
      coverSquare: `${CLOUDINARY}/image/upload/f_auto,q_auto,c_pad,ar_1:1,b_auto:border,w_640/${item.cover}`,
      year: optionalString(item.year),
      role: optionalString(item.role),
      industry: optionalString(item.industry),
      services: item.services ?? [],
      technologies: item.technologies ?? []
    }));

  const services = byOrder(servicesByDate()).map((item) => ({
    title: String(item.data.title ?? ""),
    url: item.url,
    lede: optionalString(item.data.short_lede ?? item.data.lede)
  }));

  const { socials: socialNames, ...about } = profile;
  const image = (id: string, transform: string) =>
    `${CLOUDINARY}/image/upload/f_auto,q_auto,${transform}/${id}`;
  const socialByName = (name: string) => {
    const social = socials.find((candidate) => candidate.name === name);
    if (!social) throw new Error(`No social profile named "${name}"`);
    return social;
  };

  return {
    posts,
    work,
    services,
    testimonials: resolveTestimonials([6, 41, 2]),
    profile: {
      ...about,
      avatar: image(about.avatar, "c_fill,g_face,ar_1:1,w_480"),
      photos: about.photos.map((photo) => ({
        src: image(photo.image, "w_800"),
        large: image(photo.image, "c_limit,w_1800"),
        alt: photo.alt
      }))
    },
    socials: socialNames.map(socialByName).map((social) => ({
      text: social.name,
      url: social.url,
      rel: social.name === "Mastodon" ? "me" : undefined
    }))
  };
}
