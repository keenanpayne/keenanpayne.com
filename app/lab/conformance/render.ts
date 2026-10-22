/**
 * Rendering for the conformance checks
 * ==================================================
 * Renders a direction's mockup of a site path the way the lab route does
 * (`app/routes/lab.$direction.tsx`), to HTML, and parses it so the checks
 * can read it like a visitor would: its text, its links, its landmarks.
 * A page can also be rendered as the live site would (`live()`), at the
 * site root, for what differs there: where the forms send.
 */

import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { createMemoryRouter, RouterProvider } from "react-router";
import { parse, type HTMLElement } from "node-html-parser";

import type { LabContent } from "../../lib/types";
import { labBase } from "../registry";
import { DirectionPage, type Direction } from "../site/direction";
import type { NavItem, View } from "../site/ia";
import { resolveSitePage } from "../site/page.server";

export interface RenderedPage {
  slug: string;
  /** The site path, e.g. `/about/` */
  path: string;
  view: View;
  navigation: NavItem[];
  /** With links rebased onto the direction, as its templates receive it */
  content: LabContent;
  /** A site path as the direction links to it, e.g. `/lab/mech/about/` */
  to: (path: string) => string;
  /** The whole page */
  document: HTMLElement;
  /** Every `<main>`; a conforming page has one */
  mains: HTMLElement[];
  /** The page in `<main>`, or an empty element when there's none */
  main: HTMLElement;
  /** Everything outside `<main>`: the Shell's chrome */
  chrome: HTMLElement;
  /** The same page as the live site renders it, at the site root */
  live: () => RenderedPage;
}

export function renderPage(
  slug: string,
  direction: Direction,
  requested: string,
  /** Where the direction's links lead: its lab mirror, or `""` for the site root */
  base = labBase(slug)
): RenderedPage {
  const { path, view, navigation, content } = resolveSitePage(requested, base);
  const page = createElement(DirectionPage, {
    direction,
    base,
    path,
    view,
    navigation,
    content
  });
  // Some parts read the router (e.g. `useViewTransitionState`)
  const router = createMemoryRouter([{ path: "*", element: page }], {
    initialEntries: [`${base}${path}`]
  });
  const html = renderToString(createElement(RouterProvider, { router }));

  const document = parse(html);
  const mains = document.querySelectorAll("main");
  const chrome = parse(html);
  chrome.querySelectorAll("main").forEach((main) => main.remove());

  let live: RenderedPage | undefined;
  const rendered: RenderedPage = {
    slug,
    path,
    view,
    navigation,
    content,
    to: (sitePath) => `${base}${sitePath}`,
    document,
    mains,
    main: mains[0] ?? parse(""),
    chrome,
    live: () =>
      base === "" ? rendered : (live ??= renderPage(slug, direction, path, ""))
  };
  return rendered;
}
