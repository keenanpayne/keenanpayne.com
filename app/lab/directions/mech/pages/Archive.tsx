import { useState } from "react";

import type { BasicPageModel, LabContent } from "../../../../lib/types";
import { introOf, pad, postsByYear, postTypes } from "../../../site";
import {
  Newsletter,
  PageHeader,
  Panel,
  PostCards,
  Readout,
  recordCode,
  Section,
  Tri
} from "../parts";

type Posts = LabContent["posts"];

/** Articles per year as columns of hexagon cells, like a level meter */
function Equalizer({ years }: { years: [string, Posts][] }) {
  const max = Math.max(...years.map(([, posts]) => posts.length));
  const chronological = [...years].reverse();

  return (
    <Panel className="mc-eq" label="Output by year" code={`Peak ${pad(max)}`}>
      <ol className="mc-eq__columns">
        {chronological.map(([year, posts]) => (
          <li key={year} style={{ "--rows": max } as React.CSSProperties}>
            <span className="mc-eq__count">{pad(posts.length)}</span>
            <span className="mc-eq__cells" aria-hidden="true">
              {Array.from({ length: max }, (_, index) => (
                <span
                  key={index}
                  className={
                    index < posts.length
                      ? index === posts.length - 1
                        ? "is-peak"
                        : "is-on"
                      : undefined
                  }
                />
              ))}
            </span>
            <span className="mc-eq__year">{year}</span>
            <span className="mc-visually-hidden">
              {posts.length} articles in {year}
            </span>
          </li>
        ))}
      </ol>
    </Panel>
  );
}

export function Archive({
  page,
  content
}: {
  page: BasicPageModel;
  content: LabContent;
}) {
  const intro = introOf(page);
  const [filter, setFilter] = useState<string>();

  const types = postTypes(content.posts);
  const allYears = postsByYear(content.posts);
  const shown = filter
    ? content.posts.filter((post) => post.type === filter)
    : content.posts;

  return (
    <>
      <PageHeader
        episode="Episode:02"
        eyebrow="Writing"
        jp="記録"
        title={intro?.heading ?? "Writing"}
        lede={intro?.subheading}
        aside={
          <dl className="mc-readouts mc-readouts--grid">
            <Readout
              label="Records"
              value={pad(content.posts.length, 3)}
              tone="green"
            />
            <Readout
              label="Years"
              value={pad(allYears.length, 3)}
              tone="green"
            />
            <Readout
              label="Classes"
              value={pad(types.length, 3)}
              tone="green"
            />
            <Readout label="Latest" value={content.posts[0]?.date ?? "—"} />
          </dl>
        }
      />

      <Section label="Latest records" jp="最新">
        <PostCards posts={content.posts.slice(0, 4)} all={content.posts} />
      </Section>

      <Section label="Signal history" jp="履歴">
        <Equalizer years={allYears} />
      </Section>

      <Section
        label="Record log"
        jp="目録"
        code={`${shown.length} of ${content.posts.length} shown`}
      >
        <div className="mc-filter" role="group" aria-label="Filter by class">
          {[undefined, ...types].map((type) => (
            <button
              type="button"
              key={type ?? "all"}
              aria-pressed={filter === type}
              onClick={() => setFilter(type)}
            >
              {type ?? "All classes"}
              <span>
                {pad(
                  type
                    ? content.posts.filter((post) => post.type === type).length
                    : content.posts.length
                )}
              </span>
            </button>
          ))}
        </div>

        {postsByYear(shown).map(([year, posts]) => (
          <div className="mc-log" key={year}>
            <h3 className="mc-log__year">
              <span>{year}</span>
              <span className="mc-log__rule" aria-hidden="true" />
              <span className="mc-log__count">
                {pad(posts.length)} record{posts.length === 1 ? "" : "s"}
              </span>
            </h3>
            <ol className="mc-log__rows">
              {posts.map((post) => (
                <li key={post.url}>
                  <a href={post.url}>
                    <span className="mc-log__code">
                      {recordCode(content.posts, post.url)}
                    </span>
                    <span className="mc-log__date">
                      {post.date.slice(0, 6)}
                    </span>
                    <span className="mc-log__title">{post.title}</span>
                    <span className="mc-log__type">{post.type}</span>
                    <Tri />
                  </a>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </Section>

      <Newsletter />
    </>
  );
}
