import { describe, expect, it } from "vitest";

import { parseFrontMatter } from "./frontmatter.server";

describe("parseFrontMatter", () => {
  it("splits YAML front matter from the body", () => {
    const { data, body } = parseFrontMatter(
      "---\ntitle: Hi\ntags:\n  - a\n---\n# Body\n"
    );
    expect(data).toEqual({ title: "Hi", tags: ["a"] });
    expect(body).toBe("# Body\n");
  });

  it("returns the whole file as the body when there is no front matter", () => {
    expect(parseFrontMatter("# Just Markdown")).toEqual({
      data: {},
      body: "# Just Markdown"
    });
    expect(parseFrontMatter("----\nnot front matter")).toEqual({
      data: {},
      body: "----\nnot front matter"
    });
  });

  it("treats empty and comment-only front matter as no data", () => {
    expect(parseFrontMatter("---\n---\nbody")).toEqual({
      data: {},
      body: "body"
    });
    expect(parseFrontMatter("---\n# note\n---\nbody")).toEqual({
      data: {},
      body: "body"
    });
  });

  it("handles CRLF line endings and a byte order mark", () => {
    expect(parseFrontMatter("﻿---\r\ntitle: Hi\r\n---\r\nbody")).toEqual({
      data: { title: "Hi" },
      body: "body"
    });
  });

  it("keeps unterminated front matter as data with an empty body", () => {
    expect(parseFrontMatter("---\ntitle: Hi\n")).toEqual({
      data: { title: "Hi" },
      body: ""
    });
  });
});
