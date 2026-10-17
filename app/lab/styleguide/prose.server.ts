/**
 * Prose specimen
 * ==================================================
 * An article body with every element the site's Markdown can produce, run
 * through the same pipeline as a real post (shortcodes, then markdown-it,
 * then link attributes), so a direction's prose styles meet exactly the
 * HTML they will style. The copy only describes itself.
 */

import { addExternalLinkAttributes } from "../../lib/content/html.server";
import { renderMarkdown } from "../../lib/content/markdown.server";
import { expandShortcodes } from "../../lib/content/shortcodes.server";

const SOURCE = `
{% include "type/tldr.html", content: "<strong>TL;DR:</strong> a summary that opens some posts, for readers in a hurry." %}

{% include "type/p_large.html", content: "A large paragraph leads into a post, set a step above the body copy." %}

Body copy is set for long reading. It carries [an inline link](/archive/), [a link off the site](https://example.com/), **strong text**, *emphasis*, \`inline code\`, and a footnote reference.[^1] A second sentence lets the paragraph wrap, so its measure and leading show.

## A second-level heading

The paragraph after a heading shows the space between them. Most sections of a post open like this one.

### A third-level heading

- An item in an unordered list
- A longer item, long enough to wrap onto a second line, so the indent of the wrapped line shows
  - A nested item
- A last item

1. The first step in an ordered list
2. A second step, with \`code\` in it
3. A third step

#### A fourth-level heading

> A Markdown blockquote, for quoting a source within the flow of the text.

{% include "type/blockquote.html", content: "A pull quote, set large, with the person it came from credited below.", author: "A Person", author_position: " Their role" %}

\`\`\`css
/* A code block, highlighted by language */
.button {
  display: inline-flex;
  gap: 0.5em;
  color: var(--ink, #111);
}
\`\`\`

{% include "type/note.html", content: "A note sets an aside apart from the text." %}

{% include "type/tip.html", content: "A tip gives advice related to the text." %}

{% include "type/notice.html", content: "A notice flags something to watch out for." %}

{% include "type/question.html", content: "A question asks the reader to stop and consider something." %}

{% include "type/further-reading.html", content: "Further reading points to <a href='/archive/'>related writing</a>." %}

| Element | Markdown | Used for |
| --- | --- | --- |
| Table | Pipes and dashes | Comparisons |
| Code | Backticks | Snippets and names |
| Footnote | \`[^1]\` | Asides and sources |

{% include "atoms/figure.html", src: "/images/public-domain/la-piana.jpg", alt: "La Piana by Edward Lear", caption: "A figure, with a caption and its source.", source_title: "La Piana by Edward Lear, The Art Institute of Chicago", source_link: "https://www.artic.edu/artworks/26684/la-piana" %}

---

A paragraph after a horizontal rule ends the article.

[^1]: A footnote, gathered at the end of the article.
`;

let cache: string | undefined;

/** The prose specimen, as HTML */
export function getProseSpecimen() {
  cache ??= addExternalLinkAttributes(
    renderMarkdown(expandShortcodes(SOURCE.trim(), "styleguide/prose.md"))
  );
  return cache;
}
