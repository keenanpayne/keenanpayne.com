import type { EntriesSection } from "../../lib/types";
import { Entry } from "../Entry";
import { Label } from "../Label";
import { Notice } from "../Notice";

export function Entries({ section }: { section: EntriesSection }) {
  return (
    <section className="collections _container _page-spacing-top">
      <Label
        text={section.heading}
        className="collections-label"
        readMore={section.readMore}
      />

      {section.itemsClass !== undefined && (
        <div className={`collections-items ${section.itemsClass}`}>
          {section.empty ? (
            <Notice>No content is published here yet.</Notice>
          ) : (
            section.entries.map((entry, index) => (
              <Entry key={index} entry={entry} />
            ))
          )}
        </div>
      )}
    </section>
  );
}
