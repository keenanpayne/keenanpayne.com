import { describe, expect, it } from "vitest";

import { contentsOf, industriesOf, withoutContents, yearsOf } from "./helpers";

describe("yearsOf", () => {
  it("reads the first and last years of a range, however it's written", () => {
    expect(yearsOf("2014–2019")).toEqual([2014, 2019]);
    expect(yearsOf("2019-2020")).toEqual([2019, 2020]);
    expect(yearsOf("2021")).toEqual([2021, 2021]);
  });

  it("is null without a year", () => {
    expect(yearsOf(undefined)).toBeNull();
    expect(yearsOf("Ongoing")).toBeNull();
  });
});

describe("industriesOf", () => {
  it("counts each industry once, skipping work without one", () => {
    const work = [
      { industry: "SaaS" },
      { industry: "SaaS" },
      { industry: "Health" },
      {}
    ] as Parameters<typeof industriesOf>[0];
    expect([...industriesOf(work)]).toEqual(["SaaS", "Health"]);
  });
});

const CONTENTS =
  '<details class="toc">\n<summary class="toc-summary">Table of Contents</summary>\n\n' +
  '<nav class="toc-nav"><ol><li><a href="#one">One</a></li><li><a href="#two">Two</a></li></ol></nav>\n' +
  "</details>";
const BODY = '\n<h2 id="one">One</h2><p>…</p><h2 id="two">Two</h2>';

describe("contentsOf", () => {
  it("lifts the table of contents out of a post's content", () => {
    expect(contentsOf(CONTENTS + BODY)).toEqual({
      html: '<ol><li><a href="#one">One</a></li><li><a href="#two">Two</a></li></ol>',
      ids: ["one", "two"]
    });
  });

  it("is undefined for content without one", () => {
    expect(contentsOf(BODY)).toBeUndefined();
  });
});

describe("withoutContents", () => {
  it("leaves the body alone", () => {
    expect(withoutContents(CONTENTS + BODY)).toBe(BODY);
    expect(withoutContents(BODY)).toBe(BODY);
  });
});
