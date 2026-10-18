/**
 * New Design Lab Direction
 * --------------------------
 * Starts a direction as a copy of Wireframe (the unstyled baseline), so it
 * renders every page from the first run, then registers it.
 *
 * Usage:
 *   $ npm run lab:new -- <slug> ["Display name"]
 *   $ npm run lab:new -- neo-brutal "Neo Brutal"
 *
 * Process:
 * 1. Copies app/lab/directions/wireframe/ to app/lab/directions/<slug>/,
 *    renaming `wireframe` to the slug (files, CSS classes, variables) and
 *    `Wireframe` to the display name, which the starter only uses in comments
 * 2. Registers it in app/lab/registry.ts: its metadata, and its chunk
 */

import { execFileSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  readdirSync,
  readFileSync,
  renameSync,
  statSync,
  writeFileSync
} from "node:fs";
import { join } from "node:path";

import { RESERVED_SLUGS } from "../app/lab/styleguide/sections.ts";

const DIRECTIONS = "app/lab/directions";
const REGISTRY = "app/lab/registry.ts";
const MARKER = "`npm run lab:new` adds new directions";
const STARTER = "wireframe";

const [slug, nameArg] = process.argv.slice(2);

function fail(message: string): never {
  console.error(`✗ ${message}`);
  console.error('  Usage: npm run lab:new -- <slug> ["Display name"]');
  process.exit(1);
}

if (!slug || !/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(slug)) {
  fail("Give a slug in kebab-case, e.g. `neo-brutal`.");
}

if (RESERVED_SLUGS.includes(slug)) {
  fail(`"${slug}" is reserved for the style guide's URLs.`);
}

const target = join(DIRECTIONS, slug);
if (existsSync(target)) fail(`${target} already exists.`);
if (readFileSync(REGISTRY, "utf8").includes(`slug: "${slug}"`)) {
  fail(`"${slug}" is already in ${REGISTRY}.`);
}

const name =
  nameArg ??
  slug.replace(
    /(^|-)([a-z0-9])/g,
    (_match, dash: string, char: string) =>
      (dash ? " " : "") + char.toUpperCase()
  );
// Today where the script runs (`toISOString` would give the UTC date)
const now = new Date();
const today = [now.getFullYear(), now.getMonth() + 1, now.getDate()]
  .map((part) => String(part).padStart(2, "0"))
  .join("-");

// 1. Copy the starter, renaming it throughout
cpSync(join(DIRECTIONS, STARTER), target, { recursive: true });

function rename(directory: string) {
  for (const entry of readdirSync(directory)) {
    let path = join(directory, entry);
    if (entry.includes(STARTER)) {
      const renamed = join(directory, entry.replaceAll(STARTER, slug));
      renameSync(path, renamed);
      path = renamed;
    }
    if (statSync(path).isDirectory()) {
      rename(path);
    } else {
      const source = readFileSync(path, "utf8");
      // The display name lands in comments only (the starter reads its name
      // from the registry everywhere else), so it just mustn't close one. A
      // replacer function, so `$` in the name isn't read as a pattern.
      const safeName = name.replaceAll("*/", "* /");
      writeFileSync(
        path,
        source.replaceAll(STARTER, slug).replaceAll("Wireframe", () => safeName)
      );
    }
  }
}
rename(target);

// 2. Register it, as the last entry before the marker comment
const registry = readFileSync(REGISTRY, "utf8").split("\n");
const at = registry.findIndex((line) => line.includes(MARKER));
if (at < 0) fail(`Couldn’t find the “${MARKER}” marker in ${REGISTRY}.`);
// The entry before the new one needs a comma now
registry[at - 1] = `${registry[at - 1].trimEnd()},`;
registry.splice(
  at,
  0,
  "  {",
  `    slug: "${slug}",`,
  `    name: ${JSON.stringify(name)},`,
  '    summary: "TODO: describe the look in a sentence or two.",',
  '    reference: "TODO: what inspired it",',
  `    date: "${today}",`,
  `    load: () => import("./directions/${slug}")`,
  "  }"
);
writeFileSync(REGISTRY, registry.join("\n"));

execFileSync("npx", ["prettier", "--write", REGISTRY, target], {
  stdio: "ignore"
});

console.log(`✓ Created ${name} at ${target}/`);
console.log(`
Next:
  1. Fill in its summary and reference in ${REGISTRY}
  2. Restyle ${target}/${slug}.css, and the Shell and pages/ as the look needs
  3. Preview it at http://localhost:4242/lab/${slug}/ (npm run dev)
  4. Lay its parts out in ${target}/specimens.tsx for the style guide at
     http://localhost:4242/lab/styleguide/${slug}/
  5. Run npm run lab:check: it holds the direction to the same features,
     pages, and foundations as the others

See app/lab/README.md for what a direction may (and may not) change.`);
