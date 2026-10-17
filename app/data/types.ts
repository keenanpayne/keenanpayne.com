export interface Person {
  id: number;
  name: string;
  position?: string;
  url?: string;
  image?: string;
  projects?: string[];
}

export interface Testimonial {
  id: number;
  project: string;
  person_id: number;
  content: string;
}

export interface Social {
  name: string;
  url: string;
  /** Link relation: `me` on a profile that verifies this site as its owner's */
  rel?: "me";
}

export interface PortfolioAsset {
  link?: string;
  shot_link?: string;
  image?: string;
  video?: string;
  asset_transform?: string;
  title?: string;
  caption?: string;
  description?: string;
  autoplay?: boolean;
  preventLazy?: boolean;
}

export interface PortfolioAward {
  name: string;
  year: string;
  category: string;
  details: string;
  status: string;
  link: string;
}

export interface PortfolioItem {
  template?: boolean;
  featured?: boolean;
  name: string;
  project?: string;
  year?: string | number;
  size?: string;
  industry?: string;
  color?: string;
  role?: string;
  url?: string;
  external_case_study?: string;
  services?: string[];
  technologies?: string[];
  caption?: string;
  overview?: string;
  lede?: string;
  description?: string;
  cover?: string;
  pillars?: {
    client?: string;
    challenge?: string;
    solution?: string;
  };
  people?: number[];
  testimonials?: number[];
  assets?: Record<number, PortfolioAsset>;
  awards?: PortfolioAward[];
}
