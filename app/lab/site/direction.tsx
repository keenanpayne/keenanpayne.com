import type { ComponentType, ReactNode } from "react";

import type { LabContent } from "../../lib/types";

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

/**
 * A design direction: a skin over the shared content and information
 * architecture. It decides how things look, never what the site says or
 * which pages it has.
 */
export interface Direction {
  /** Stylesheet URLs (the direction's CSS and any web fonts) */
  stylesheets: string[];
  /** Chrome around every page: header, navigation, footer */
  Shell: ComponentType<ShellProps>;
  /** One template for each kind of page in `./ia.ts` */
  templates: { [K in ViewKind]: ComponentType<TemplateProps<K>> };
}

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
      {stylesheets.map((href) => (
        <link key={href} rel="stylesheet" href={href} precedence="default" />
      ))}
      <Shell {...props}>
        <Template {...props.view} content={props.content} />
      </Shell>
    </BaseContext.Provider>
  );
}
