// `@types/markdown-it-footnote` references the CommonJS build of
// `@types/markdown-it`, which clashes with the ESM types used here.
declare module "markdown-it-footnote" {
  import type { PluginSimple } from "markdown-it";

  const footnote: PluginSimple;
  export default footnote;
}
