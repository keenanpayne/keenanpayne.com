// `markdown-it-footnote` ships no type definitions.
declare module "markdown-it-footnote" {
  import type { PluginSimple } from "markdown-it";

  const footnote: PluginSimple;
  export default footnote;
}

// The shared content, serialized at build time; see `vite.config.ts`.
declare module "virtual:lab-content" {
  import type { LabContent } from "./lib/types";

  const content: LabContent;
  export default content;
}
