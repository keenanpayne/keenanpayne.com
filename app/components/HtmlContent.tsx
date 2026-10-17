import { useEffect, useRef, useSyncExternalStore } from "react";

declare global {
  interface Window {
    twttr?: { widgets?: { load: (element?: Element) => void } };
  }
}

const subscribe = () => () => {};

/**
 * `false` while hydrating server-rendered markup, `true` for anything React
 * renders itself (e.g. after a client-side navigation)
 */
const useIsClientRender = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

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
  const clientRender = useIsClientRender();
  const scriptsRunFor = useRef(clientRender ? null : html);

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
