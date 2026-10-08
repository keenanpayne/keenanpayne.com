import { useState } from "react";

import type { BasicPageModel, LabContent } from "../../../../lib/types";
import {
  Feature,
  Go,
  Heading,
  Icon,
  Intro,
  introOf,
  MONTH_NAMES,
  NewsList,
  Newsletter,
  pad,
  parseDate,
  postNews,
  Rating,
  RATING_TYPES,
  ratingOf,
  TitleBar,
  typePath,
  useQueryParam,
  useTo,
  type Post
} from "../parts";

const DESCRIPTIONS: Record<string, string> = {
  Article: "Notes on the craft: front-end, design, and working on the web.",
  Essay: "Longer arguments about work, career, and making things.",
  Reflection: "Looking back on a month, a year, or a lesson learned.",
  Tutorial: "Step-by-step builds with code you can copy."
};

/** Month grid with posting days linked, like the old release calendars */
function Calendar({ posts }: { posts: Post[] }) {
  const dated = posts.flatMap((post) => {
    const date = parseDate(post.date);
    return date ? [{ post, ...date }] : [];
  });
  const months = [
    ...new Set(dated.map(({ year, month }) => `${year}-${pad(month + 1)}`))
  ];
  const [key, setKey] = useState(months[0] ?? "");
  if (!key) return null;

  const index = months.indexOf(key);
  const [year, month] = key.split("-").map(Number);
  const inMonth = dated
    .filter((entry) => entry.year === year && entry.month === month - 1)
    .sort((a, b) => a.day - b.day);
  const days = new Set(inMonth.map((entry) => entry.day));
  const lead = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const length = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells = [
    ...Array.from({ length: lead }, () => 0),
    ...Array.from({ length }, (_, day) => day + 1)
  ];
  while (cells.length % 7) cells.push(0);

  const firstOn = (day: number) =>
    inMonth.find((entry) => entry.day === day)?.post;

  return (
    <div className="pt-cal">
      <div className="pt-cal__month">
        <table className="pt-cal__grid">
          <caption>
            <span className="pt-cal__head">
              <span>{MONTH_NAMES[month - 1]}</span>
              <span className="pt-cal__year">{String(year).slice(2)}</span>
            </span>
          </caption>
          <thead>
            <tr>
              {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                <th key={i} scope="col">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: cells.length / 7 }, (_, week) => (
              <tr key={week}>
                {cells.slice(week * 7, week * 7 + 7).map((day, i) => {
                  const post = day && days.has(day) ? firstOn(day) : undefined;
                  return (
                    <td key={i} className={day ? undefined : "is-blank"}>
                      {post ? (
                        <a href={post.url} title={post.title}>
                          {day}
                        </a>
                      ) : (
                        day || ""
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pt-cal__controls">
          <button
            type="button"
            className="pt-cal__step"
            disabled={index >= months.length - 1}
            onClick={() => setKey(months[index + 1])}
            aria-label="Earlier month"
          >
            <Icon name="arrowRight" />
          </button>
          <select
            className="pt-select"
            aria-label="Select month"
            value={key}
            onChange={(event) => setKey(event.target.value)}
          >
            {months.map((option) => {
              const [y, m] = option.split("-").map(Number);
              return (
                <option key={option} value={option}>
                  {MONTH_NAMES[m - 1]} {y}
                </option>
              );
            })}
          </select>
          <button
            type="button"
            className="pt-cal__step pt-cal__step--next"
            disabled={index <= 0}
            onClick={() => setKey(months[index - 1])}
            aria-label="Later month"
          >
            <Icon name="arrowRight" />
          </button>
        </div>
      </div>

      <ol className="pt-cal__days" aria-label="Published this month">
        {inMonth.map((entry) => (
          <li key={entry.post.url}>
            <span className="pt-cal__day">{pad(entry.day)}</span>
            <a href={entry.post.url}>
              {entry.post.title} – {entry.post.type ?? "Post"}
            </a>
          </li>
        ))}
        {Array.from({ length: Math.max(0, 5 - inMonth.length) }, (_, i) => (
          <li key={`empty-${i}`} aria-hidden="true">
            <span className="pt-cal__day" />
          </li>
        ))}
      </ol>
    </div>
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
  const to = useTo();
  const [latest, ...older] = content.posts;
  const years = [...new Set(content.posts.map((post) => post.year))];
  const [query, setQuery] = useQueryParam("q");
  const [from, setFrom] = useState(years[years.length - 1] ?? "");
  const [until, setUntil] = useState(years[0] ?? "");
  const [type, setType] = useState("");

  const needle = query.trim().toLowerCase();
  const shown = content.posts.filter(
    (post) =>
      post.year >= from &&
      post.year <= until &&
      (!type || post.type === type) &&
      (!needle ||
        `${post.title} ${post.lede ?? ""} ${post.type ?? ""}`
          .toLowerCase()
          .includes(needle))
  );
  const byYear = years
    .map((year) => [year, shown.filter((post) => post.year === year)] as const)
    .filter(([, posts]) => posts.length > 0);

  return (
    <>
      <TitleBar
        title="Writing"
        images={content.posts.map((post) => post.image)}
      />
      <Intro heading={intro?.heading} lede={intro?.subheading} />

      {latest && (
        <Feature
          href={latest.url}
          image={latest.image}
          title={latest.title}
          date={latest.date}
          sub={latest.lede}
        />
      )}

      <div className="pt-pair">
        <section className="pt-section">
          <Heading>Latest news</Heading>
          <NewsList items={postNews(older.slice(0, 5))} />
        </section>
        <section className="pt-section">
          <Heading>Subscribe</Heading>
          <Newsletter />
        </section>
      </div>

      <section className="pt-section" id="archive">
        <Heading>Writing archives</Heading>
        <form
          className="pt-searchbar"
          role="search"
          onSubmit={(event) => event.preventDefault()}
        >
          <p className="pt-searchbar__label">
            Search archives by year or keyword
          </p>
          <div className="pt-searchbar__fields">
            <label className="pt-searchbar__field">
              <span>From</span>
              <select
                className="pt-select"
                value={from}
                onChange={(event) => setFrom(event.target.value)}
              >
                {[...years].reverse().map((year) => (
                  <option key={year}>{year}</option>
                ))}
              </select>
            </label>
            <span className="pt-searchbar__to">to</span>
            <label className="pt-searchbar__field">
              <span>Until</span>
              <select
                className="pt-select"
                value={until}
                onChange={(event) => setUntil(event.target.value)}
              >
                {years.map((year) => (
                  <option key={year}>{year}</option>
                ))}
              </select>
            </label>
            <span className="pt-searchbar__sep" aria-hidden="true" />
            <label className="pt-searchbar__field">
              <span>Rating</span>
              <select
                className="pt-select"
                value={type}
                onChange={(event) => setType(event.target.value)}
              >
                <option value="">All</option>
                {RATING_TYPES.map((option) => (
                  <option key={option} value={option}>
                    {option}s
                  </option>
                ))}
              </select>
            </label>
            <label className="pt-searchbar__field pt-searchbar__field--grow">
              <span>Keyword</span>
              <input
                className="pt-input"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <Go />
          </div>
        </form>

        <p className="pt-count" role="status">
          Showing {shown.length} of {content.posts.length} articles
        </p>

        {byYear.map(([year, posts]) => (
          <div className="pt-rows" key={year}>
            <h3 className="pt-rows__year">
              {year}
              <span>
                {posts.length} article{posts.length === 1 ? "" : "s"}
              </span>
            </h3>
            <ol>
              {posts.map((post) => (
                <li key={post.url}>
                  <Rating type={post.type} />
                  <a href={post.url}>{post.title}</a>
                  <span className="pt-rows__date">{post.date}</span>
                </li>
              ))}
            </ol>
          </div>
        ))}
        {byYear.length === 0 && (
          <p className="pt-empty">No articles match. Try a wider search.</p>
        )}
      </section>

      <section className="pt-section">
        <Heading>Calendar</Heading>
        <Calendar posts={content.posts} />
      </section>

      <section className="pt-section" id="ratings">
        <Heading>Ratings guide</Heading>
        <ul className="pt-ratings">
          {RATING_TYPES.map((option) => {
            const count = content.posts.filter(
              (post) => post.type === option
            ).length;
            return (
              <li key={option}>
                <Rating type={option} />
                <div>
                  <p className="pt-ratings__name">
                    <a href={to(typePath(option))}>
                      {ratingOf(option).letter} – {option}
                    </a>
                    <span>{pad(count)} titles</span>
                  </p>
                  <p>{DESCRIPTIONS[option]}</p>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="pt-fineprint">
          Ratings are issued by the KPRB (Keenan Payne Rating Board), which is
          entirely made up.
        </p>
      </section>
    </>
  );
}
