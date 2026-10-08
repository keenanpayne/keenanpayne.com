import type { BasicPageModel, LabContent } from "../../../../lib/types";
import {
  Badge,
  GoDot,
  Go,
  Heading,
  Html,
  Icon,
  Intro,
  introOf,
  ItemIcon,
  Pill,
  TagStrip,
  Tile,
  TitleBar,
  useQueryParam,
  useTo,
  WorkCard,
  type Work as WorkItem
} from "../parts";
import { FACE, MONITOR } from "../sprites";
import { Logotype } from "./Home";

/** The featured project as a wide banner, like a game launch */
function Launch({ item }: { item: WorkItem }) {
  const to = useTo();

  return (
    <section className="pt-hero pt-hero--work">
      <div className="pt-hero__screen">
        <img className="pt-hero__backdrop" src={item.cover} alt="" />
        <div className="pt-hero__copy">
          <Logotype lines={[item.name]} as="h2" />
          <p className="pt-hero__tag">
            <GoDot />
            {item.role ?? "Featured case study"}
          </p>
          {item.lede && (
            <Html as="p" className="pt-hero__lede" html={item.lede} />
          )}
        </div>
        <TagStrip
          cells={[
            { label: "Plat form", art: MONITOR },
            { label: "Case page", art: FACE, href: item.url },
            { badge: <Badge big="01" small="Case" /> }
          ]}
        />
      </div>
      <div className="pt-hero__bar">
        <Pill href={item.url} icon="case" tone="dark">
          Read the case study
        </Pill>
        <p>{[item.industry, item.year].filter(Boolean).join(" · ")}</p>
        <Pill href={to("/project-inquiry/")} icon="power" tone="dark">
          Start a project
        </Pill>
      </div>
    </section>
  );
}

export function Work({
  page,
  content
}: {
  page: BasicPageModel;
  content: LabContent;
}) {
  const intro = introOf(page);
  const [query, setQuery] = useQueryParam("q");
  const [featured, ...rest] = content.work;
  const needle = query.trim().toLowerCase();
  const matches = content.work.filter(
    (item) =>
      !needle ||
      [item.name, item.industry, item.role, item.year, ...item.services]
        .join(" ")
        .toLowerCase()
        .includes(needle)
  );

  return (
    <>
      <TitleBar
        title="Work"
        images={content.work.slice(0, 4).map((item) => item.coverSquare)}
      />
      <Intro heading={intro?.heading} lede={intro?.subheading} />

      {featured && <Launch item={featured} />}

      <ul className="pt-games">
        {rest.slice(0, 3).map((item, index) => (
          <li key={item.url}>
            <WorkCard item={item} index={index + 1} />
          </li>
        ))}
      </ul>

      <section className="pt-section" id="master-list">
        <Heading>Master work list</Heading>
        <form
          className="pt-searchbar"
          role="search"
          onSubmit={(event) => event.preventDefault()}
        >
          <label className="pt-searchbar__label" htmlFor="pt-work-q">
            Search case studies by client, sector, or service
          </label>
          <div className="pt-searchbar__fields">
            <input
              id="pt-work-q"
              className="pt-input"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <Go />
          </div>
          <p className="pt-searchbar__count" role="status">
            {matches.length} of {content.work.length}
          </p>
        </form>

        <div className="pt-tableWrap">
          <table className="pt-table">
            <thead>
              <tr>
                <th scope="col">
                  <span className="pt-visually-hidden">Type</span>
                </th>
                <th scope="col">Client</th>
                <th scope="col">Sector</th>
                <th scope="col">Role</th>
                <th scope="col">Years</th>
                <th scope="col">
                  <span className="pt-visually-hidden">Link</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {matches.map((item) => (
                <tr key={item.url}>
                  <td className="pt-table__icon">
                    <ItemIcon item="case" />
                  </td>
                  <th scope="row">
                    <a href={item.url}>{item.name}</a>
                  </th>
                  <td>{item.industry}</td>
                  <td>{item.role}</td>
                  <td className="pt-table__num">{item.year}</td>
                  <td className="pt-table__go">
                    <a href={item.url} tabIndex={-1} aria-hidden="true">
                      <Icon name="arrowRight" />
                    </a>
                  </td>
                </tr>
              ))}
              {matches.length === 0 && (
                <tr>
                  <td colSpan={6} className="pt-table__empty">
                    No case studies match “{query}”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {rest.length > 3 && (
        <section className="pt-section">
          <Heading>Explore these other case studies</Heading>
          <ul className="pt-tiles">
            {rest.slice(3).map((item) => (
              <Tile
                key={item.url}
                title={item.name}
                href={item.url}
                icon="case"
                image={item.cover}
              />
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
