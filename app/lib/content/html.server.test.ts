import { describe, expect, it } from "vitest";

import {
  addExternalLinkAttributes,
  buildTableOfContents,
  convertToAbsoluteUrls
} from "./html.server";

describe("addExternalLinkAttributes", () => {
  it("opens links with a protocol or `//` in a new tab", () => {
    const html = addExternalLinkAttributes(
      '<a href="https://x.com">a</a> <a href="//cdn.x.com/y">b</a> <a href="mailto:a@b.c">c</a>'
    );
    expect(html).toBe(
      '<a href="https://x.com" target="_blank" rel="noopener">a</a> <a href="//cdn.x.com/y" target="_blank" rel="noopener">b</a> <a href="mailto:a@b.c" target="_blank" rel="noopener">c</a>'
    );
  });

  it("leaves internal links and code blocks alone", () => {
    const html =
      '<a href="/about/">a</a><pre><code>&lt;a href="https://x.com"&gt;</code></pre>';
    expect(addExternalLinkAttributes(html)).toBe(html);
  });
});

describe("buildTableOfContents", () => {
  const compact = (html: string) => html.replace(/\s*\n\s*/g, "");

  it("nests headings by level and skips ones without an id or excluded", () => {
    const html =
      '<h2 id="a">A</h2><h3 id="a-1">A &amp; 1</h3><h2>No id</h2><h2 id="b" data-toc-exclude>B</h2><h2 id="c">C</h2>';
    expect(compact(buildTableOfContents(html, ["h2", "h3"]))).toBe(
      '<nav class="toc-nav"><ol><li><a href="#a">A</a><ol><li><a href="#a-1">A &amp; 1</a></li></ol></li><li><a href="#c">C</a></li></ol></nav>'
    );
  });

  it("only lists the requested heading levels", () => {
    const html = '<h2 id="a">A</h2><h4 id="deep">Deep</h4>';
    expect(buildTableOfContents(html, ["h2", "h3"])).not.toContain("#deep");
  });

  it("returns an empty string when there are no headings", () => {
    expect(buildTableOfContents("<p>Nothing</p>", ["h2", "h3"])).toBe("");
  });
});

describe("convertToAbsoluteUrls", () => {
  const base = "https://keenanpayne.com/post/";

  it("resolves relative href, src and fragment URLs against the page", () => {
    expect(
      convertToAbsoluteUrls(
        '<a href="/about/">a</a><img src=\'img.png\'><a href="#fn1">1</a>',
        base
      )
    ).toBe(
      '<a href="https://keenanpayne.com/about/">a</a><img src=\'https://keenanpayne.com/post/img.png\'><a href="https://keenanpayne.com/post/#fn1">1</a>'
    );
  });

  it("keeps absolute URLs and resolves every srcset candidate", () => {
    const html =
      '<img srcset="/a.jpg 300w, https://res.cloudinary.com/x/w_600,q_auto/b.jpg 600w">';
    expect(convertToAbsoluteUrls(html, base)).toBe(
      '<img srcset="https://keenanpayne.com/a.jpg 300w, https://res.cloudinary.com/x/w_600,q_auto/b.jpg 600w">'
    );
  });
});
