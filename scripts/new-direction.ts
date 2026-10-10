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
 *    renaming `wireframe` to the slug (files, CSS classes, variables)
 * 2. Adds the direction's metadata to app/lab/registry.ts
 * 3. Adds its components to app/lab/directions/index.ts
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

const DIRECTIONS = "app/lab/directions";
const REGISTRY = "app/lab/registry.ts";
const INDEX = `${DIRECTIONS}/index.ts`;
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
const today = new Date().toISOString().slice(0, 10);

/** Inserts lines just above a `npm run lab:new` marker comment */
function insertAboveMarker(
  file: string,
  marker: string,
  lines: string[],
  { comma = false } = {}
) {
  const source = readFileSync(file, "utf8").split("\n");
  const at = source.findIndex((line) => line.includes(marker));
  if (at < 0) fail(`Couldn’t find the “${marker}” marker in ${file}.`);
  // The entry before the new one needs a comma now
  if (comma && !source[at - 1].trimEnd().endsWith(",")) {
    source[at - 1] = `${source[at - 1].trimEnd()},`;
  }
  source.splice(at, 0, ...lines);
  writeFileSync(file, source.join("\n"));
}

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
      writeFileSync(
        path,
        source.replaceAll(STARTER, slug).replaceAll("Wireframe", name)
      );
    }
  }
}
rename(target);

// 2. Register its metadata
insertAboveMarker(
  REGISTRY,
  "`npm run lab:new` adds new directions",
  [
    "  {",
    `    slug: "${slug}",`,
    `    name: ${JSON.stringify(name)},`,
    '    summary: "TODO: describe the look in a sentence or two.",',
    '    reference: "TODO: what inspired it",',
    `    date: "${today}"`,
    "  }"
  ],
  { comma: true }
);

// 3. Register its components, loaded on demand
insertAboveMarker(
  INDEX,
  "`npm run lab:new` adds new directions",
  [
    `  ${slug.includes("-") ? JSON.stringify(slug) : slug}: () => import("./${slug}")`
  ],
  { comma: true }
);

execFileSync("npx", ["prettier", "--write", REGISTRY, INDEX, target], {
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

See app/lab/README.md for what a direction may (and may not) change.`);
