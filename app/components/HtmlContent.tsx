import { useEffect, useRef } from "react";

import { isHydrated } from "../lib/hydration";

declare global {
  interface Window {
    twttr?: { widgets?: { load: (element?: Element) => void } };
  }
}

/**
 * Renders a trusted HTML string (rendered Markdown). Embed scripts in the
 * content (CodePen, Twitter) run as usual on the initial page load; after a
 * client-side navigation they are re-created so the browser executes them.
 */
export function HtmlContent({
  html,
  className
}: {
  html: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Server-rendered markup was parsed (and its scripts run) by the browser
  const scriptsRunFor = useRef(isHydrated() ? null : html);

  useEffect(() => {
    const element = ref.current;
    if (!element || scriptsRunFor.current === html) return;
    scriptsRunFor.current = html;

    const scripts = element.querySelectorAll("script");
    for (const original of scripts) {
      const script = document.createElement("script");
      for (const { name, value } of original.attributes) {
        script.setAttribute(name, value);
      }
      script.textContent = original.textContent;
      original.replaceWith(script);
    }

    if (scripts.length) window.twttr?.widgets?.load(element);
  }, [html]);

  return (
    <div
      ref={ref}
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
