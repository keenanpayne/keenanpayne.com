/**
 * Source
 * ==================================================
 * Facts about the site's owner live in the content (`app/data/profile.ts`,
 * `content/`), so a direction's code never spells them out: an edit to the
 * profile has to reach every direction. This finds them in a direction's
 * code: the owner's name, initials, email, domain, role, city, and years of
 * experience. Comments may mention them.
 */

import { profile } from "../../data/profile";
import { metadata } from "../../lib/site";

export const SOURCE_RULE =
  "A direction’s code never spells out a fact about the site’s owner (name, initials, email, domain, role, location, years of experience): it reads them from `content`, so an edit to the profile reaches every direction.";

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const word = (text: string, flags = "") =>
  new RegExp(`(?<![\\w-])${escape(text)}(?!\\w)`, flags);

const { location, experience } = profile;
const initials = profile.name
  .split(/\s+/)
  .map((part) => part[0])
  .join("");
const host = new URL(metadata.url).host.replace(/^www\./, "");
const yearsInWords = experience.text.split(" ")[0];

/** Each fact, and how it's found */
const FACTS: [fact: string, pattern: RegExp][] = [
  ...profile.name
    .split(/\s+/)
    .map((part): [string, RegExp] => ["the owner’s name", word(part)]),
  ["the owner’s initials", word(initials)],
  ["the owner’s email", word(profile.email, "i")],
  ["the site’s domain", word(host, "i")],
  ["the owner’s role", word(profile.role, "i")],
  ["the owner’s city", word(location.city)],
  ["the owner’s state", word(location.name.split(", ")[1])],
  ["the owner’s time zone", word(location.timeZoneName, "i")],
  [
    "the owner’s years of experience",
    new RegExp(`\\b${experience.years}\\+? years\\b|\\b${yearsInWords}\\b`, "i")
  ]
];

/** Code without its comments and imports, keeping line numbers */
function code(source: string) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, " "))
    .split("\n")
    .map((line) =>
      /^\s*(import\b|export\b.*\bfrom\b|}\s*from\b)/.test(line)
        ? ""
        : line.replace(/(^|\s)\/\/.*$/, "")
    );
}

/** Where a file spells out a fact, e.g. `12: the owner’s name ("Keenan")` */
export function factsIn(source: string) {
  return code(source).flatMap((line, index) =>
    FACTS.flatMap(([fact, pattern]) => {
      const match = pattern.exec(line);
      return match ? [`line ${index + 1}: ${fact} (“${match[0]}”)`] : [];
    })
  );
}
