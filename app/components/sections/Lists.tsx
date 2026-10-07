import { Fragment } from "react";
import { Link } from "react-router";

import type {
  PageListSection,
  TagListSection,
  TypeListSection
} from "../../lib/types";

// Tags are inline-flex, so keep the whitespace between them
function TagLinks({ links }: { links: TagListSection["tags"] }) {
  return links.map((link) => (
    <Fragment key={link.url}>
      {" "}
      <Link to={link.url} className="tag -large">
        {link.text}
      </Link>
    </Fragment>
  ));
}

export function TagList({ section }: { section: TagListSection }) {
  return (
    <div className="_text-align-center" style={{ marginTop: "1.5rem" }}>
      <TagLinks links={section.tags} />
    </div>
  );
}

export function TypeList({ section }: { section: TypeListSection }) {
  return (
    <>
      <h1 className="_text-align-center">{section.title}</h1>

      <div className="_text-align-center">
        <TagLinks links={section.types} />
      </div>
    </>
  );
}

export function PageList({ section }: { section: PageListSection }) {
  return (
    <>
      {/* Browsers move this heading out of the table, where it was authored */}
      <h1 className="_text-align-center">{section.title}</h1>

      <table className="_container">
        <thead>
          <tr>
            <th>Page Title</th>
            <th>URL</th>
          </tr>
        </thead>
        <tbody>
          {section.pages.map((page) => (
            <tr key={page.url}>
              <td>{page.title}</td>
              <td>
                <a href={page.url}>
                  <code>{page.url}</code>
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
