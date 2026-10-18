import { useEffect } from "react";

import { DISQUS_EMBED } from "../../lib/endpoints";
import { useIsLive } from "./links";

interface DisqusConfig {
  (this: { page: { url: string } }): void;
}

declare global {
  interface Window {
    disqus_config?: DisqusConfig;
    DISQUS?: {
      reset: (options: { reload: boolean; config: DisqusConfig }) => void;
    };
  }
}

/** The thread's element, which Disqus fills (and the checks look for) */
export const COMMENTS_ID = "disqus_thread";

/** What stands in the thread's place in the lab */
export const COMMENTS_MOCKUP =
  "Mockup only — the comments load on the live site.";

// The embed is requested once per page load; `DISQUS.reset` serves the rest
let embedRequested = false;

/**
 * A post's or case study's comments: the Disqus thread for its canonical
 * URL, which every direction shows when the page asks for them
 * (`page.comments`), with a heading and surroundings of its own. On the
 * live site the embed loads into the thread's element; in the lab and the
 * style guide its place is marked (`data-mockup`) and `COMMENTS_MOCKUP`
 * says so.
 */
export function Comments({
  url,
  className
}: {
  /** The page's canonical URL (`page.meta.canonical`), which names its thread */
  url: string;
  className?: string;
}) {
  const live = useIsLive();

  useEffect(() => {
    if (!live) return;
    const config: DisqusConfig = function () {
      this.page.url = url;
    };
    window.disqus_config = config;

    if (window.DISQUS) {
      window.DISQUS.reset({ reload: true, config });
    } else if (!embedRequested) {
      embedRequested = true;
      const script = document.createElement("script");
      script.src = DISQUS_EMBED;
      script.setAttribute("data-timestamp", String(Date.now()));
      // Let the next page with comments try again
      script.onerror = () => {
        embedRequested = false;
        script.remove();
      };
      document.head.appendChild(script);
    }
  }, [live, url]);

  return (
    <>
      <div
        id={COMMENTS_ID}
        className={className}
        data-mockup={live ? undefined : ""}
      >
        {!live && <p>{COMMENTS_MOCKUP}</p>}
      </div>
      <noscript>Please enable JavaScript to view the comments.</noscript>
    </>
  );
}
