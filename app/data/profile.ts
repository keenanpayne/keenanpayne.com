/**
 * Profile
 * ==================================================
 * Who Keenan is, in one place. Every design lab direction (`app/lab/`)
 * renders this copy in its own voice — relabeling a fact, cropping a photo —
 * but never restates it, so an edit here reaches every direction at once.
 */

import metadata from "./metadata.json";

export type ProfileFactId =
  "role" | "location" | "experience" | "previously" | "shows" | "offDuty";

export interface ProfileFact {
  /** Stable key, so a direction can relabel the fact in its own voice */
  id: ProfileFactId;
  label: string;
  text: string;
  /** Site path or URL the fact links to */
  url?: string;
}

/** Cloudinary image IDs */
const PORTRAIT = "v1666204078/people/me/jun-27-2021_o8sd0l.jpg";

const role = "Full-stack web developer & designer";

const location = {
  city: "Denver",
  name: "Denver, Colorado",
  short: "Denver, CO",
  timeZone: "America/Denver",
  timeZoneName: "Mountain Time",
  latitude: 39.7392,
  longitude: -104.9903,
  elevationFeet: 5280
};

// In figures and in words, so every mention of it agrees
const years = 18;
const yearsInWords = "Eighteen";

const experience = { years, text: `${yearsInWords} years on the web` };

export const profile = {
  name: metadata.author.name,
  role,
  email: metadata.author.email,
  location,
  experience,
  /** HTML; site paths are rebased for the lab */
  bio:
    `I’m a full-stack web developer and designer with ${yearsInWords.toLowerCase()} years of experience helping teams market and build products on the web. ` +
    'I spent five years growing the website at <a href="/portfolio/asana/">Asana</a>, and have since partnered with ' +
    '<a href="/portfolio/rippling/">Rippling</a>, <a href="/portfolio/gofundme/">GoFundMe</a>, ' +
    '<a href="/portfolio/neuralink/">Neuralink</a>, and many others. ' +
    'I also <a href="/archive/">write</a> about craft, career, and the occasional reflection.',
  facts: [
    { id: "role", label: "Role", text: role },
    { id: "location", label: "Based in", text: location.name },
    { id: "experience", label: "Experience", text: experience.text },
    {
      id: "previously",
      label: "Previously",
      text: "Asana, 2014–2019",
      url: "/portfolio/asana/"
    },
    { id: "shows", label: "Shows a year", text: "About thirty" },
    {
      id: "offDuty",
      label: "Off the clock",
      text: "Magic: The Gathering, travel, family"
    }
  ] as ProfileFact[],
  /** Square, face-centered crop of the first photo */
  avatar: PORTRAIT,
  photos: [
    { image: PORTRAIT, alt: "Me in grayscale" },
    {
      image: "v1666204077/people/me/dec-26-2021_iuhh3w.jpg",
      alt: "Me being cold"
    },
    {
      image: "v1666204078/people/me/jul-5-2020_lwglyk.jpg",
      alt: "Hanging out with my high school buddies"
    }
  ],
  /** How a project runs, start to finish */
  process: [
    {
      title: "Listen",
      text: "We talk through your goals, audience, constraints, and what success looks like."
    },
    {
      title: "Plan",
      text: "A clear scope, timeline, and budget, so there are no surprises later."
    },
    {
      title: "Build",
      text: "Regular check-ins and working previews as the project comes together."
    },
    {
      title: "Launch",
      text: "A careful release, documentation for your team, and support after launch."
    }
  ],
  /** Profiles elsewhere, by their name in `./socials.ts`, in display order */
  socials: ["LinkedIn", "Bluesky", "Mastodon", "Dribbble", "CodePen"]
};
