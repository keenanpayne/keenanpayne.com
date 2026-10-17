import type { PortfolioItem } from "../types";

// Each file in this directory describes one case study, keyed by its filename
// (e.g. `asana.ts` -> `asana`). Content files reference these keys via `data:`.
const modules = import.meta.glob<PortfolioItem>(
  ["./*.ts", "!./index.ts", "!./_template.ts"],
  { eager: true, import: "default" }
);

export const portfolio: Record<string, PortfolioItem> = Object.fromEntries(
  Object.keys(modules)
    .sort()
    .map((path) => [path.replace(/^\.\/(.*)\.ts$/, "$1"), modules[path]])
);
