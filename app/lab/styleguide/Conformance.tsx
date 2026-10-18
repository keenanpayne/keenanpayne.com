/**
 * Conformance
 * ==================================================
 * How every direction measures up to the shared feature set, information
 * architecture, and foundations (`../conformance/`): a summary for each,
 * every check across all of them, then what each one still falls short of,
 * page by page. The same results `npm run lab:check` holds them to.
 */

import { Fragment, useEffect, type ReactNode } from "react";
import { Link } from "react-router";

import { CHECKED_PATHS } from "../conformance/pages";
import type {
  CheckGroup,
  CheckResult,
  CheckStatus,
  ConformanceReport
} from "../conformance/report.server";
import { directions, getDirection, labPath } from "../registry";
import { pad } from "../site/helpers";

import { styleguidePath } from "./sections";

const GROUPS: CheckGroup[] = [
  "Shell",
  "Every page",
  "Pages",
  "Foundations",
  "Source"
];

const STATUS: Record<CheckStatus, { label: string; mark: string }> = {
  met: { label: "Met", mark: "✓" },
  gap: { label: "Known gap", mark: "◐" },
  regression: { label: "Regression", mark: "✕" },
  closed: { label: "Met, still listed", mark: "↑" }
};

/** A count of a direction's checks in a status, e.g. `3 known gaps` */
const TALLY: Record<Exclude<CheckStatus, "met">, (count: number) => string> = {
  regression: (count) => `${count} regression${count === 1 ? "" : "s"}`,
  closed: (count) => `${count} met, still listed`,
  gap: (count) => `${count} known gap${count === 1 ? "" : "s"}`
};

/** Worst first: what fails the tests, then what's waiting */
const RANK: Record<CheckStatus, number> = {
  regression: 0,
  closed: 1,
  gap: 2,
  met: 3
};

const SOURCE_ID = "source.facts";

/**
 * A direction's results with its per-file source checks folded into one,
 * since every direction has different files
 */
function rowsOf(results: CheckResult[]): CheckResult[] {
  const files = results.filter((result) => result.group === "Source");
  if (!files.length) return results;
  const status = files
    .map((file) => file.status)
    .sort((a, b) => RANK[a] - RANK[b])[0];
  return [
    ...results.filter((result) => result.group !== "Source"),
    {
      ...files[0],
      id: SOURCE_ID,
      status,
      problems: files.flatMap((file) =>
        file.problems.map(
          (problem) => `${file.id.slice(SOURCE_ID.length + 1)}, ${problem}`
        )
      )
    }
  ];
}

/** A rule's `code` spans as code */
function Rule({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/(`[^`]+`)/)
        .map((part, index) =>
          part.startsWith("`") ? (
            <code key={index}>{part.slice(1, -1)}</code>
          ) : (
            part
          )
        )}
    </>
  );
}

function Mark({
  status,
  children
}: {
  status: CheckStatus;
  children?: ReactNode;
}) {
  const { label, mark } = STATUS[status];
  return (
    <span className="sg-mark" data-status={status}>
      <span aria-hidden="true">{mark}</span>
      {children ?? <span className="sg-visually-hidden">{label}</span>}
    </span>
  );
}

/**
 * A check's problems, each once, with where it turns up: the pages (or the
 * files and lines) it's on
 */
function issuesOf(problems: string[]) {
  const issues = new Map<string, string[]>();
  for (const problem of problems) {
    const [where, ...what] = problem.split(": ");
    const issue = what.length ? what.join(": ") : problem;
    issues.set(issue, [
      ...(issues.get(issue) ?? []),
      ...(what.length ? [where] : [])
    ]);
  }
  return [...issues].map(([issue, wheres]) => ({ issue, wheres }));
}

const anchorOf = (slug: string, id: string) =>
  `${slug}--${id.replace(/[^\w-]+/g, "-")}`;

/** Opens the details a link points at, as a fragment link can't */
function useOpenTarget() {
  useEffect(() => {
    const open = () => {
      const target = document.getElementById(
        decodeURIComponent(location.hash.slice(1))
      );
      if (target instanceof HTMLDetailsElement) target.open = true;
    };
    open();
    addEventListener("hashchange", open);
    return () => removeEventListener("hashchange", open);
  }, []);
}

export function ConformanceView({ report }: { report?: ConformanceReport }) {
  useOpenTarget();

  if (!report) {
    return <p className="sg-heading__blurb">Running the checks…</p>;
  }

  const reports = report.directions.flatMap((entry) => {
    const info = getDirection(entry.slug);
    return info
      ? [
          {
            info,
            index: directions.indexOf(info),
            rows: rowsOf(entry.results)
          }
        ]
      : [];
  });
  const checks = reports[0]?.rows ?? [];
  const checkedAt = new Date(report.checkedAt);

  return (
    <>
      <header className="sg-heading">
        <div>
          <h1 className="sg-heading__title">Conformance</h1>
          <p className="sg-heading__blurb">
            How each direction measures up to the feature set, information
            architecture, and foundations every one of them shares (
            <code>app/lab/conformance/</code>). Known gaps predate the checks
            and only shrink: to close one, delete its line in{" "}
            <code>gaps.ts</code> and run <code>npm run lab:check</code>.
            Anything else that falls short fails the tests.
          </p>
        </div>
        <p className="sg-heading__aside sg-caption__note">
          Checked{" "}
          <time dateTime={report.checkedAt}>
            {/* In UTC, so the prerendered page and the browser agree */}
            {checkedAt.toLocaleString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
              timeZone: "UTC",
              timeZoneName: "short"
            })}
          </time>
        </p>
      </header>

      <section className="sg-section" aria-labelledby="conformance-summary">
        <h2 id="conformance-summary" className="sg-visually-hidden">
          Summary
        </h2>
        <div className="sg-cards">
          {reports.map(({ info, index, rows }) => {
            const count = (status: CheckStatus) =>
              rows.filter((row) => row.status === status).length;
            const met = count("met") + count("closed");
            return (
              <article key={info.slug} className="sg-overview sg-score">
                <header className="sg-overview__head">
                  <span className="sg-overview__number">{pad(index + 1)}</span>
                  <h3 className="sg-overview__name">
                    <a href={`#${info.slug}`}>{info.name}</a>
                  </h3>
                </header>
                <p className="sg-score__count">
                  <strong>{met}</strong>
                  {` of ${rows.length} checks met`}
                </p>
                <meter
                  className="sg-score__meter"
                  min={0}
                  max={rows.length}
                  value={met}
                  aria-label={`${info.name}: ${met} of ${rows.length} checks met`}
                />
                <ul className="sg-score__tally">
                  {(["regression", "closed", "gap"] as const).map(
                    (status) =>
                      count(status) > 0 && (
                        <li key={status}>
                          <Mark status={status}>
                            {TALLY[status](count(status))}
                          </Mark>
                        </li>
                      )
                  )}
                  {met === rows.length && count("closed") === 0 && (
                    <li>
                      <Mark status="met">Meets every check</Mark>
                    </li>
                  )}
                </ul>
                <p className="sg-overview__links">
                  <Link
                    className="sg-button sg-button--quiet"
                    to={styleguidePath(info.slug)}
                  >
                    Style guide
                  </Link>
                  <Link
                    className="sg-button sg-button--quiet"
                    to={labPath(info.slug)}
                  >
                    Open mockup ↗
                  </Link>
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="sg-section" aria-labelledby="conformance-checks">
        <header className="sg-heading">
          <div>
            <h2 id="conformance-checks" className="sg-heading__title">
              Every check
            </h2>
            <p className="sg-heading__blurb">
              Requirements are read from each direction’s rendered sample pages,
              foundations from its stylesheet, and facts from its code.
            </p>
          </div>
          <ul className="sg-legend" aria-label="Key">
            {(Object.keys(STATUS) as CheckStatus[]).map((status) => (
              <li key={status}>
                <Mark status={status}>{STATUS[status].label}</Mark>
              </li>
            ))}
          </ul>
        </header>

        <div
          className="sg-matrix"
          role="region"
          aria-labelledby="conformance-checks"
          tabIndex={0}
        >
          <table>
            <thead>
              <tr>
                <th scope="col">Check</th>
                {reports.map(({ info }) => (
                  <th key={info.slug} scope="col">
                    {info.name}
                  </th>
                ))}
              </tr>
            </thead>
            {GROUPS.map((group) => {
              const rows = checks.filter((check) => check.group === group);
              if (!rows.length) return null;
              return (
                <tbody key={group}>
                  <tr className="sg-matrix__group">
                    <th scope="rowgroup" colSpan={reports.length + 1}>
                      {group}
                    </th>
                  </tr>
                  {rows.map((check) => (
                    <tr key={check.id}>
                      <th scope="row">
                        <code className="sg-matrix__id">{check.id}</code>
                        <span className="sg-matrix__rule">
                          <Rule text={check.rule} />
                        </span>
                      </th>
                      {reports.map(({ info, rows: own }) => {
                        const result = own.find((row) => row.id === check.id);
                        if (!result) return <td key={info.slug} />;
                        return (
                          <td key={info.slug}>
                            {result.status === "met" ? (
                              <Mark status="met" />
                            ) : (
                              <a
                                href={`#${anchorOf(info.slug, result.id)}`}
                                aria-label={`${info.name}, ${result.id}: ${STATUS[result.status].label}`}
                              >
                                <Mark status={result.status} />
                              </a>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              );
            })}
          </table>
        </div>
      </section>

      {reports.map(({ info, index, rows }) => {
        const open = rows
          .filter((row) => row.status !== "met")
          .sort((a, b) => RANK[a.status] - RANK[b.status]);
        return (
          <section
            key={info.slug}
            id={info.slug}
            className="sg-section"
            aria-labelledby={`${info.slug}-gaps`}
          >
            <header className="sg-row__head">
              <h2 id={`${info.slug}-gaps`} className="sg-row__name">
                <span className="sg-overview__number">{pad(index + 1)}</span>
                {info.name}
              </h2>
              <Link to={styleguidePath(info.slug)}>Style guide</Link>
              <Link to={labPath(info.slug)}>Open mockup ↗</Link>
            </header>
            {open.length ? (
              <div className="sg-gaps">
                {open.map((result) => {
                  const issues = issuesOf(result.problems);
                  return (
                    <details
                      key={result.id}
                      id={anchorOf(info.slug, result.id)}
                      className="sg-gap"
                    >
                      <summary>
                        <Mark status={result.status}>
                          {STATUS[result.status].label}
                        </Mark>
                        <code>{result.id}</code>
                        <span className="sg-caption__note">
                          {result.status === "closed"
                            ? "Delete its line in gaps.ts"
                            : `${issues.length} to fix`}
                        </span>
                      </summary>
                      <p>
                        <Rule text={result.rule} />
                      </p>
                      {issues.length > 0 && (
                        <ul>
                          {issues.map(({ issue, wheres }) => (
                            <li key={issue}>
                              {issue}
                              {wheres.length > 0 && (
                                <span className="sg-gap__where">
                                  {wheres.length === CHECKED_PATHS.length &&
                                  result.group !== "Source"
                                    ? "On every page"
                                    : wheres.map((where, at) => (
                                        <Fragment key={where}>
                                          {at > 0
                                            ? ", "
                                            : result.group === "Source"
                                              ? "In "
                                              : "On "}
                                          <code>{where}</code>
                                        </Fragment>
                                      ))}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </details>
                  );
                })}
              </div>
            ) : (
              <p className="sg-gaps__none">
                <Mark status="met">Meets every check.</Mark>
              </p>
            )}
          </section>
        );
      })}
    </>
  );
}
