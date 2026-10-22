import type { ReactNode } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration
} from "react-router";

import type { Route } from "./+types/root";
import { SECURITY_HEADERS } from "./lib/security-headers";
import { metadata, pageTitle } from "./lib/site";

/*

Interested in the chaos behind this magic?
Check it out on GitHub ✌🏻
https://github.com/keenanpayne/keenanpayne.com

*/

export const links: Route.LinksFunction = () => [
  {
    rel: "alternate",
    href: metadata.feed.path,
    type: "application/atom+xml",
    title: metadata.title
  },
  {
    rel: "alternate",
    href: metadata.jsonfeed.path,
    type: "application/json",
    title: metadata.title
  },

  // The directions load their web fonts from Google Fonts
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous"
  }
];

export const middleware: Route.MiddlewareFunction[] = [
  async (_, next) => {
    const response = await next();
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
      response.headers.set(name, value);
    }
    return response;
  }
];

/**
 * The document alone: every page's chrome and styles come from the design
 * direction rendering it, the live one (`app/lab/live.ts`) at the site root
 * and each of the others in the lab at `/lab/<slug>/`.
 */
export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="author" content={metadata.author.name} />
        <meta name="color-scheme" content="light dark" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

/**
 * Thrown errors (a loader that fails, a lab URL that isn't one), on a plain
 * page of their own: the page route answers unknown paths itself, with the
 * live direction's not-found page.
 */
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Something went wrong";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = `${error.status}`;
    // A 404 thrown without status text would otherwise read as a server error
    details =
      error.status === 404 ? "Page not found" : error.statusText || details;
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main
      style={{
        maxWidth: "40rem",
        margin: "0 auto",
        padding: "4rem 1rem",
        fontFamily: "system-ui, sans-serif",
        lineHeight: 1.5
      }}
    >
      <title>{pageTitle(message)}</title>
      <p style={{ fontFamily: "ui-monospace, monospace" }}>{message}</p>
      <h1>{details}</h1>
      <p>
        <a href="/">Back to the home page</a>
      </p>
      {stack && (
        <pre style={{ overflowX: "auto" }}>
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
