import type { ComponentType, ReactNode } from "react";

import type { LabContent } from "../../lib/types";
import type { SpecimenId } from "../styleguide/sections";

import baseStyles from "./base.css?url";
import type { NavItem, View, ViewKind } from "./ia";
import { BaseContext } from "./links";

/** What the template for one kind of page receives */
export type TemplateProps<K extends ViewKind> = Extract<View, { kind: K }> & {
  content: LabContent;
};

export interface ShellProps {
  view: View;
  /** The site path being rendered, e.g. `/about/` */
  path: string;
  /** Primary navigation, with the current section marked */
  navigation: NavItem[];
  content: LabContent;
  /** The page, rendered by its template */
  children: ReactNode;
}

/** What each of a direction's style guide specimens receives */
export interface SpecimenProps {
  content: LabContent;
  /** HTML: an article body with every element the Markdown can produce */
  prose: string;
  /** Primary navigation as the style guide shows the Shell: About is current */
  navigation: NavItem[];
}

/**
 * A direction's entries in the style guide at `/lab/styleguide/`: one for
 * each section in `../styleguide/sections.ts` it draws itself
 */
export type Specimens = { [K in SpecimenId]: ComponentType<SpecimenProps> };

/**
 * A design direction: a skin over the shared content and information
 * architecture. It decides how things look, never what the site says or
 * which pages it has.
 */
export interface Direction {
  /** Stylesheet URLs (the direction's CSS and any web fonts) */
  stylesheets: string[];
  /**
   * The class on the Shell's outermost element, which sets the direction's
   * type, color, and background. The style guide renders every specimen
   * inside one.
   */
  root: string;
  /** Chrome around every page: header, navigation, footer */
  Shell: ComponentType<ShellProps>;
  /** One template for each kind of page in `./ia.ts` */
  templates: { [K in ViewKind]: ComponentType<TemplateProps<K>> };
  /** Its parts, laid out for the style guide, which alone loads them */
  specimens: () => Promise<{ default: Specimens }>;
}

/**
 * Stylesheet links, hoisted into the document's head. Vitest serves a
 * stylesheet import as an empty URL, which React would warn about, so
 * those are left out.
 */
export const Stylesheets = ({ hrefs }: { hrefs: string[] }) =>
  hrefs
    .filter(Boolean)
    .map((href) => (
      <link key={href} rel="stylesheet" href={href} precedence="default" />
    ));

/** Renders a site path in a direction, with links prefixed by `base` */
export function DirectionPage({
  direction,
  base,
  ...props
}: Omit<ShellProps, "children"> & { direction: Direction; base: string }) {
  const { stylesheets, Shell, templates } = direction;
  const Template = templates[props.view.kind] as ComponentType<
    TemplateProps<ViewKind>
  >;
  return (
    <BaseContext.Provider value={base}>
      {/* The shared base first, then the direction's own */}
      <Stylesheets hrefs={[baseStyles, ...stylesheets]} />
      <Shell {...props}>
        <Template {...props.view} content={props.content} />
      </Shell>
    </BaseContext.Provider>
  );
}
