import type { ReactNode } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData
} from "react-router";

import type { Route } from "./+types/root";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Topbar } from "./components/Topbar";
import { getNavigation } from "./lib/content/content.server";
import { useMarkHydrated } from "./lib/hydration";
import { SECURITY_HEADERS } from "./lib/security-headers";
import { metadata } from "./lib/site";
import stylesheet from "./styles/app.css?url";

/*

Interested in the chaos behind this magic?
Check it out on GitHub ✌🏻
https://github.com/keenanpayne/keenanpayne.com

*/

export const links: Route.LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=IBM+Plex+Mono:wght@500&display=swap"
  },
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

  // Preconnect to Google Fonts
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

export function loader() {
  return { navigation: getNavigation() };
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="newStyles">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="HandheldFriendly" content="True" />
        <meta name="MobileOptimized" content="320" />
        <meta name="author" content="Keenan Payne" />
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

export default function App({ loaderData }: Route.ComponentProps) {
  useMarkHydrated();

  return (
    <>
      <Topbar />
      <Header navigation={loaderData.navigation} />
      <Outlet />
      <Footer navigation={loaderData.navigation} />
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const data = useRouteLoaderData<typeof loader>("root");
  const navigation = data?.navigation ?? [];

  let message = "Something went wrong";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = `${error.status}`;
    details = error.statusText || details;
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <>
      <title>{`${message} | ${metadata.title}`}</title>
      <Topbar />
      <Header navigation={navigation} />
      <main className="_container _text-align-center">
        <p className="_font-family-mono _text-h4">{message}</p>
        <h1>{details}</h1>
        {stack && (
          <pre>
            <code>{stack}</code>
          </pre>
        )}
      </main>
      <Footer navigation={navigation} />
    </>
  );
}
