// View models passed from route loaders to components. Everything here is
// plain, serializable data — HTML strings are marked as such in comments.

import type { ProfileFact } from "../data/profile";
import type { Person, PortfolioAward } from "../data/types";

export interface LinkModel {
  url: string;
  text: string;
}

export interface PageMeta {
  title: string;
  description: string;
  canonical: string;
  image?: string;
  imageAlt?: string;
}

export interface EntryModel {
  cover?: string;
  heading?: string;
  /** HTML */
  lede?: string;
  url?: string;
}

export interface TestimonialModel {
  id: number;
  /** HTML */
  content: string;
  /** HTML, set when the content is long enough to be collapsed */
  truncated?: string;
  person?: {
    name: string;
    position?: string;
    image?: string;
  };
}

export interface IntroSection {
  type: "intro";
  /** HTML */
  heading?: string;
  /** Fallback (plain text) heading when no `heading` is set */
  title?: string;
  /** HTML */
  subheading?: string;
  /** HTML */
  body?: string;
}

export interface EntriesSection {
  type: "entries";
  heading?: string;
  readMore?: LinkModel;
  /** Empty when nothing matches: shows the "nothing published" notice */
  entries: EntryModel[];
}

export interface NewsletterSection {
  type: "newsletter";
}

export interface NewsletterStandaloneSection {
  type: "newsletterStandalone";
}

export interface TestimonialsSection {
  type: "testimonials";
  readMore?: LinkModel;
  testimonials: TestimonialModel[] | null;
}

export interface TestimonialsGridSection {
  type: "testimonials-grid";
  qualities: Array<{ label: string; count: number }>;
  testimonials: TestimonialModel[];
}

export interface TestimonialSection {
  type: "testimonial";
  testimonial?: TestimonialModel;
}

export interface PortfolioGridItem {
  video?: string;
  image?: string;
  imageRaw?: string;
  title?: string;
  /** HTML */
  caption?: string;
  autoplay?: boolean;
  preventLazy?: boolean;
  link?: string;
  enlargeHref: string;
}

export interface PortfolioGridSection {
  type: "portfolioGrid";
  modifier?: string;
  enlarge?: boolean;
  eyebrow?: string;
  headline?: string;
  /** HTML */
  description?: string;
  items: PortfolioGridItem[] | null;
}

export interface TagListSection {
  type: "tagList";
  tags: LinkModel[];
}

export interface TypeListSection {
  type: "typeList";
  title?: string;
  types: LinkModel[];
}

export interface PageListSection {
  type: "pageList";
  title?: string;
  pages: Array<{ title?: string; url: string }>;
}

export type SectionModel =
  | IntroSection
  | EntriesSection
  | NewsletterSection
  | NewsletterStandaloneSection
  | TestimonialsSection
  | TestimonialsGridSection
  | TestimonialSection
  | PortfolioGridSection
  | TagListSection
  | TypeListSection
  | PageListSection;

interface BaseModel {
  /** Canonical path of the page, e.g. `/about/` */
  url: string;
  meta: PageMeta;
}

export interface BasicPageModel extends BaseModel {
  layout: "page";
  sections: SectionModel[];
  /** HTML */
  content: string;
}

export interface PostNavModel {
  next?: LinkModel;
  previous?: LinkModel;
}

export interface PostPageModel extends BaseModel {
  layout: "post";
  title?: string;
  /** Plain text */
  lede?: string;
  type?: { label: string; url: string; title: string };
  date: { iso: string; short: string; long: string };
  tags: Array<{ name: string; url?: string }> | null;
  /** HTML for `.post-content` (cover, table of contents and body) */
  content: string;
  postNav: PostNavModel | null;
  comments: boolean;
  newsletter: boolean;
}

export type PortfolioDetailPerson = Pick<Person, "name" | "url" | "position">;

export interface PortfolioPageModel extends BaseModel {
  layout: "portfolio";
  color?: string;
  client?: string;
  lede?: string;
  /** HTML */
  overview?: string;
  size?: string;
  industry?: string;
  services?: string[];
  year?: string;
  technologies?: string[];
  people?: PortfolioDetailPerson[];
  awards?: PortfolioAward[];
  siteUrl?: string;
  siteTitle?: string;
  cover?: string;
  pillars?: {
    client?: string;
    /** HTML */
    challenge?: string;
    /** HTML */
    solution?: string;
  };
  sections: SectionModel[];
  /** HTML */
  content: string;
  comments: boolean;
}

export type PageModel = BasicPageModel | PostPageModel | PortfolioPageModel;

/** Real site content handed to every design lab direction */
export interface LabContent {
  /** Newest first */
  posts: {
    title: string;
    url: string;
    /** Readable, e.g. `Oct 09, 2022` */
    date: string;
    /** `yyyy-mm-dd` */
    iso: string;
    year: string;
    type?: string;
    /** The archive of every post of its type, e.g. `/type/essays/` */
    typeUrl?: string;
    lede?: string;
    image?: string;
  }[];
  work: {
    name: string;
    url: string;
    /** HTML */
    lede?: string;
    cover: string;
    /** Square crop padded with the cover's edge color */
    coverSquare: string;
    year?: string;
    role?: string;
    industry?: string;
    services: string[];
    technologies: string[];
  }[];
  services: { title: string; url: string; lede?: string }[];
  testimonials: TestimonialModel[];
  profile: ProfileModel;
  /** Profiles elsewhere, in display order */
  socials: SocialLink[];
}

export interface SocialLink extends LinkModel {
  /** `me` for profiles that verify the site (Mastodon) */
  rel?: string;
}

/** `app/data/profile.ts`, with image URLs resolved */
export interface ProfileModel {
  name: string;
  role: string;
  email: string;
  location: {
    city: string;
    name: string;
    short: string;
    timeZone: string;
    timeZoneName: string;
    latitude: number;
    longitude: number;
    elevationFeet: number;
  };
  experience: { years: number; text: string };
  /** HTML */
  bio: string;
  facts: ProfileFact[];
  /** Square, face-centered crop */
  avatar: string;
  photos: Array<{
    src: string;
    /** For lightboxes; never upscaled past the original */
    large: string;
    alt: string;
  }>;
  process: Array<{ title: string; text: string }>;
}
