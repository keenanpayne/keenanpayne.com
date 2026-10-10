// View models passed from route loaders to components. Everything here is
// plain, serializable data — HTML strings are marked as such in comments.

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
  linkText?: string;
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

export interface PhotoModel {
  src: string;
  alt?: string;
  lazy?: boolean;
  width?: string | number;
  height?: string | number;
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
  headerMaxWidth?: string;
  subheadingMaxWidth?: string;
  bodyMaxWidth?: string;
  leftPhotos?: PhotoModel[];
  right?: {
    heading?: string;
    readMore?: LinkModel;
    items?:
      | { from: "services"; entries: EntryModel[] }
      | { from: "photosOfMe" }
      | { from: "other" };
  };
}

export interface EntriesSection {
  type: "entries";
  heading?: string;
  readMore?: LinkModel;
  showCovers: boolean;
  /** Class for the items container; omitted when the section lists nothing */
  itemsClass?: string;
  entries: EntryModel[];
  /** The source collection is empty: show the "nothing published" notice */
  empty: boolean;
}

export interface NewsletterSection {
  type: "newsletter";
  spacing?: string | number;
}

export interface NewsletterStandaloneSection {
  type: "newsletterStandalone";
  modifiers?: string;
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
  contained?: boolean;
  enlarge?: boolean;
  eyebrow?: string;
  headline?: string;
  /** HTML */
  description?: string;
  items: PortfolioGridItem[] | null;
}

export interface DribbbleSection {
  type: "dribbble";
  modifier?: string;
  items: Array<{ src?: string; alt?: string; type?: string }>;
}

export interface SocialProofLogosSection {
  type: "socialProofLogos";
  logos: Array<{ name: string; svg: string }>;
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
  | DribbbleSection
  | TagListSection
  | TypeListSection
  | PageListSection
  | SocialProofLogosSection
  | { type: "cta" }
  | { type: "contact" }
  | { type: "projectInquiry" };

interface BaseModel {
  /** Canonical path of the page, e.g. `/about/` */
  url: string;
  meta: PageMeta;
}

export interface BasicPageModel extends BaseModel {
  layout: "page";
  templateClass?: string;
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
  sectionClass: string;
  title?: string;
  /** Plain text */
  lede?: string;
  type?: { label: string; url: string; title: string };
  date: { iso: string; short: string; long: string };
  tags: Array<{ name: string; url?: string }> | null;
  /** HTML for `.post-content` (cover, table of contents and body) */
  content: string;
  footer?: {
    url: string;
    title: string;
    article: string;
    typeUrl: string;
    typeTitle: string;
    typeLabel: string;
  };
  postNav: PostNavModel | null;
  comments: boolean;
  newsletter: boolean;
}

export interface PortfolioDetailPerson {
  name: string;
  url?: string;
  position?: string;
}

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
  awards?: Array<{
    name: string;
    year: string;
    category: string;
    details: string;
    status: string;
    link: string;
  }>;
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
  postNav: PostNavModel | null;
  comments: boolean;
}

export type PageModel = BasicPageModel | PostPageModel | PortfolioPageModel;
