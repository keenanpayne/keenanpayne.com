import { HtmlContent } from "../../../../components/HtmlContent";
import type { LabContent, PostPageModel } from "../../../../lib/types";
import { readingMinutes, samePath, useTo } from "../../../site";
import {
  BackLink,
  Banner,
  ContentKey,
  KeySection,
  LinkCard,
  Newsletter,
  PostNav,
  ratingOf,
  SideGroup,
  SideList,
  Sprite
} from "../parts";
import { ITEMS, MONITOR } from "../sprites";

/** Banner colors for each post type, after the colors of each handheld */
const TYPE_COLORS: Record<string, string> = {
  Article: "#3d78d6",
  Essay: "#6ab335",
  Reflection: "#8a5bc9",
  Tutorial: "#ec8a1c"
};

const decode = (text: string) =>
  text
    .replace(/&#39;|&#x27;|&apos;/g, "’")
    .replace(/&quot;/g, "”")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

const count = (html: string, pattern: RegExp) =>
  (html.match(pattern) ?? []).length;

export interface Topic {
  id: string;
  /** Plain text, for the content key */
  title?: string;
  /** Heading HTML, keeping links to the resources a heading names */
  titleHtml?: string;
  /** HTML */
  html: string;
}

/**
 * Splits body HTML into one topic per top-level `<h2>`, so each can sit in its
 * own box. Falls back to a single topic when a heading sits inside a wrapper.
 */
export function splitTopics(html: string, first = "Introduction"): Topic[] {
  const parts = html.split(/(?=<h2[\s>])/);
  const balanced = parts.every((part) =>
    ["div", "details", "section", "figure", "aside", "ul", "ol"].every(
      (tag) =>
        count(part, new RegExp(`<${tag}[\\s>]`, "g")) ===
        count(part, new RegExp(`</${tag}>`, "g"))
    )
  );
  if (!balanced) return [{ id: "topic-intro", title: first, html }];

  return parts
    .map((part, index) => {
      const heading = /^<h2([^>]*)>([\s\S]*?)<\/h2>/.exec(part);
      if (!heading) return { id: "topic-intro", title: first, html: part };
      // Drop the heading's own permalink; the section has a "To key" link
      const titleHtml = heading[2]
        .trim()
        .replace(/^<a class="header-anchor"[^>]*>([\s\S]*)<\/a>$/, "$1");
      const title = decode(titleHtml.replace(/<[^>]+>/g, "").trim());
      const id = /id="([^"]+)"/.exec(heading[1])?.[1] ?? `topic-${index}`;
      return { id, title, titleHtml, html: part.slice(heading[0].length) };
    })
    .filter((topic) => topic.html.replace(/<[^>]+>|\s/g, "").length > 0);
}

export function Post({
  page,
  content
}: {
  page: PostPageModel;
  content: LabContent;
}) {
  const to = useTo();
  const body = page.content.replace(
    /<details class="toc">[\s\S]*?<\/details>/,
    ""
  );
  const topics = splitTopics(body);
  const minutes = readingMinutes(body);
  const type = page.type?.label;
  const rating = ratingOf(type);
  const image = content.posts.find((post) =>
    samePath(post.url, page.url)
  )?.image;

  return (
    <article className="pt-post">
      <Banner
        color={TYPE_COLORS[type ?? ""]}
        logo={type ?? "Article"}
        title={page.title && <h1 className="pt-banner__title">{page.title}</h1>}
        lede={page.lede && <p>{page.lede}</p>}
        image={
          image ? (
            <img src={image} alt="" />
          ) : (
            <span className="pt-banner__art">
              <Sprite art={ITEMS[rating.item]} scale={9} />
            </span>
          )
        }
        tab={`${type ?? "Article"} overview`}
      />

      <ContentKey
        topics={topics.flatMap((topic) =>
          topic.title ? [{ id: topic.id, title: topic.title }] : []
        )}
      />

      <div className="pt-columns">
        <div className="pt-columns__main">
          {topics.map((topic) => (
            <KeySection
              key={topic.id}
              id={topic.id}
              title={topic.title}
              html={topic.titleHtml}
              toKey={topics.length > 1}
            >
              <HtmlContent className="pt-prose" html={topic.html} />
            </KeySection>
          ))}

          <div className="pt-endnote">
            <p>
              Thanks for reading! Questions or thoughts?{" "}
              <a href={to("/contact/")}>Send me a note</a>.
            </p>
          </div>

          <PostNav nav={page.postNav} />
        </div>

        <aside className="pt-columns__side" aria-label="Article details">
          <BackLink href={to("/archive/")}>Back to Writing</BackLink>
          <SideList
            title="File data"
            items={[
              {
                text: "Published",
                small: <time dateTime={page.date.iso}>{page.date.long}</time>
              },
              { text: "Read time", small: `About ${minutes} min` },
              {
                text: `Rated ${rating.letter}`,
                small: type ? `For ${type}` : "Rating pending",
                href: to("/archive/#ratings")
              }
            ]}
          />
          {page.tags && page.tags.length > 0 && (
            <SideList
              title="Tags"
              items={page.tags.map((tag) => ({
                text: tag.name,
                href: tag.url
              }))}
            />
          )}
          <SideGroup title="Links">
            {page.type && (
              <LinkCard
                href={page.type.url}
                label={`More ${page.type.label}s`}
                art={ITEMS[rating.item]}
              >
                Browse every {page.type.title.toLowerCase().replace(/s$/, "")}{" "}
                in the archive
              </LinkCard>
            )}
            <LinkCard
              href={to("/contact/")}
              label="Get in touch"
              art={ITEMS.mail}
            >
              Questions, thoughts, or a project in mind
            </LinkCard>
            <LinkCard
              href={to("/portfolio/")}
              label="Case studies"
              art={MONITOR}
            >
              See the work behind the writing
            </LinkCard>
          </SideGroup>
        </aside>
      </div>

      {page.newsletter && <Newsletter />}
    </article>
  );
}
