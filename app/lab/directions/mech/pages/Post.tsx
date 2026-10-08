import { useEffect, useRef } from "react";

import { HtmlContent } from "../../../../components/HtmlContent";
import type { LabContent, PostPageModel } from "../../../../lib/types";
import {
  MoreLink,
  Newsletter,
  Panel,
  PostNav,
  recordCode,
  useTo
} from "../parts";

/** Fixed bar along the top of the screen that fills as you read */
function SyncBar() {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const root = document.documentElement;
      const max = root.scrollHeight - root.clientHeight;
      const progress = max > 0 ? Math.min(1, root.scrollTop / max) : 0;
      const node = bar.current;
      if (!node) return;
      node.style.setProperty("--progress", String(progress));
      // The percentage label only changes once per whole percent
      const value = `${Math.round(progress * 100)}`;
      if (node.dataset.value !== value) node.dataset.value = value;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="mc-sync" ref={bar} data-value="0" aria-hidden="true">
      <span className="mc-sync__label">Sync</span>
      <span className="mc-sync__track">
        <span className="mc-sync__fill" />
      </span>
    </div>
  );
}

export function Post({
  page,
  content
}: {
  page: PostPageModel;
  content: LabContent;
}) {
  const to = useTo();
  const words = page.content.replace(/<[^>]+>/g, " ").split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 230));
  const code = recordCode(content.posts, page.url);

  return (
    <article className="mc-post">
      <SyncBar />

      <header className="mc-pageHeader mc-post__header">
        <div className="mc-pageHeader__main">
          <p className="mc-pageHeader__eyebrow">
            <span className="mc-pageHeader__episode">{code}</span>
            <a href={to("/archive/")}>Records</a>
            {page.type && (
              <>
                <span aria-hidden="true">/</span>
                <a href={page.type.url}>{page.type.label}</a>
              </>
            )}
          </p>
          {page.title && (
            <div className="mc-titlecard mc-titlecard--post">
              <h1 className="mc-titlecard__title">{page.title}</h1>
            </div>
          )}
          {page.lede && <p className="mc-pageHeader__lede">{page.lede}</p>}
        </div>
      </header>

      <div className="mc-post__layout">
        <aside className="mc-post__rail">
          <Panel label="File data" code={code}>
            <dl className="mc-spec">
              <div>
                <dt>Logged</dt>
                <dd>
                  <time dateTime={page.date.iso}>{page.date.long}</time>
                </dd>
              </div>
              <div>
                <dt>Read time</dt>
                <dd>{minutes} min</dd>
              </div>
              {page.type && (
                <div>
                  <dt>Class</dt>
                  <dd>
                    <a href={page.type.url}>{page.type.label}</a>
                  </dd>
                </div>
              )}
              {page.tags && page.tags.length > 0 && (
                <div>
                  <dt>Tags</dt>
                  <dd>
                    <ul className="mc-chips mc-chips--small">
                      {page.tags.map((tag) => (
                        <li key={tag.name}>
                          {tag.url ? (
                            <a href={tag.url}>{tag.name}</a>
                          ) : (
                            tag.name
                          )}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
            </dl>
          </Panel>
        </aside>

        <HtmlContent className="mc-prose mc-post__body" html={page.content} />
      </div>

      <footer className="mc-post__footer">
        <p>
          <span className="mc-kicker">End of record</span>
          Thanks for reading. Questions or thoughts?{" "}
          <a href={to("/contact/")}>Open a channel</a>.
        </p>
        {page.type && (
          <MoreLink
            href={page.type.url}
          >{`More ${page.type.title.toLowerCase()}`}</MoreLink>
        )}
      </footer>

      <PostNav nav={page.postNav} />

      {page.newsletter && <Newsletter />}
    </article>
  );
}
