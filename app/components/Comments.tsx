import { useEffect } from "react";

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

let embedRequested = false;

export function Comments({ url }: { url: string }) {
  useEffect(() => {
    // Disqus configuration
    const config: DisqusConfig = function () {
      this.page.url = url;
    };
    window.disqus_config = config;

    if (window.DISQUS) {
      window.DISQUS.reset({ reload: true, config });
    } else if (!embedRequested) {
      embedRequested = true;
      const script = document.createElement("script");
      script.src = "https://keenan-payne.disqus.com/embed.js";
      script.setAttribute("data-timestamp", String(+new Date()));
      // Let the next post with comments try again
      script.onerror = () => {
        embedRequested = false;
        script.remove();
      };
      (document.head || document.body).appendChild(script);
    }

    // Disqus theme switching
    // Ref: https://thisdevbrain.com/disqus-auto-theme-switching/
    const onThemeChanged = () => {
      if (document.readyState == "complete") {
        window.DISQUS?.reset({ reload: true, config });
      }
    };
    document.addEventListener("themeChanged", onThemeChanged);
    return () => document.removeEventListener("themeChanged", onThemeChanged);
  }, [url]);

  return (
    <div className="comments">
      <div id="disqus_thread" className="_container -small"></div>

      <noscript>Please enable JavaScript to view the comments.</noscript>
    </div>
  );
}
