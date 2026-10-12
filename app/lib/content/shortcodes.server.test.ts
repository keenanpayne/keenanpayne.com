import { describe, expect, it } from "vitest";

import { expandShortcodes } from "./shortcodes.server";

describe("expandShortcodes", () => {
  it("expands an include with comma-separated arguments", () => {
    const html = expandShortcodes(
      '{% include "type/note.html", content: "Hi <em>there</em>", align: "left" %}',
      "test.md"
    );
    expect(html).toContain('<p class="-context -note -left">');
    expect(html).toContain("<span>Hi <em>there</em></span>");
  });

  it("accepts single quotes and arguments without a leading comma", () => {
    const html = expandShortcodes(
      "{% include 'type/p_large.html' content: 'Big' %}",
      "test.md"
    );
    expect(html).toBe('<p class="-large">\n  Big\n</p>\n');
  });

  it("parses booleans, numbers and nil like Liquid", () => {
    const html = expandShortcodes(
      '{% include "components/image.njk", imgSrc: "v1/pic", width: 500, lazy: false, set: false, alt: nil %}',
      "test.md"
    );
    expect(html).toContain('width="500"');
    expect(html).not.toContain("loading=");
    expect(html).not.toContain("srcset=");
    expect(html).not.toContain("alt=");
  });

  it("treats an empty string as truthy, like Liquid", () => {
    const html = expandShortcodes(
      '{% include "atoms/figure.html", src: "x.jpg", alt: "", caption: "" %}',
      "test.md"
    );
    expect(html).toContain("<figcaption>");
  });

  it("expands every tag and leaves the surrounding Markdown untouched", () => {
    const source =
      'Before\n\n{% include "type/tldr.html", content: "One" %}\n\n{% include "type/tldr.html", content: "Two" %}\nAfter';
    const html = expandShortcodes(source, "test.md");
    expect(html.startsWith("Before\n\n")).toBe(true);
    expect(html.endsWith("\nAfter")).toBe(true);
    expect(html.match(/-tldr/g)).toHaveLength(2);
  });

  it("throws for unknown shortcodes and unparseable arguments", () => {
    expect(() =>
      expandShortcodes('{% include "type/missing.html" %}', "post.md")
    ).toThrow('Unknown shortcode "type/missing.html" in post.md');
    expect(() =>
      expandShortcodes(
        '{% include "type/tldr.html", content "no colon" %}',
        "post.md"
      )
    ).toThrow("Unable to parse shortcode arguments");
  });
});
