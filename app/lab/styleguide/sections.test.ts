import { describe, expect, it } from "vitest";

import {
  comparePath,
  resolveMode,
  sectionPath,
  styleguidePath
} from "./sections";

const SLUGS = ["wireframe", "mech"];

describe("resolveMode", () => {
  it("shows every direction's overview at the root", () => {
    expect(resolveMode("", SLUGS)).toEqual({
      kind: "compare",
      section: "overview"
    });
    expect(resolveMode("/", SLUGS)).toEqual({
      kind: "compare",
      section: "overview"
    });
  });

  it("shows one direction, or one of its sections", () => {
    expect(resolveMode("mech/", SLUGS)).toEqual({
      kind: "direction",
      slug: "mech"
    });
    expect(resolveMode("mech/color/", SLUGS)).toEqual({
      kind: "direction",
      slug: "mech",
      only: "color"
    });
  });

  it("shows how every direction conforms", () => {
    expect(resolveMode("conformance/", SLUGS)).toEqual({ kind: "conformance" });
    expect(resolveMode("conformance/mech/", SLUGS)).toBeUndefined();
  });

  it("compares one section across directions", () => {
    expect(resolveMode("compare/color/", SLUGS)).toEqual({
      kind: "compare",
      section: "color"
    });
  });

  it("rejects unknown directions, sections, and depths", () => {
    expect(resolveMode("nope/", SLUGS)).toBeUndefined();
    expect(resolveMode("mech/nope/", SLUGS)).toBeUndefined();
    expect(resolveMode("mech/color/extra/", SLUGS)).toBeUndefined();
    expect(resolveMode("compare/nope/", SLUGS)).toBeUndefined();
    // The overview comparison is the root, not `compare/overview/`
    expect(resolveMode("compare/overview/", SLUGS)).toBeUndefined();
  });
});

describe("paths", () => {
  it("builds the guide's URLs", () => {
    expect(comparePath("overview")).toBe("/lab/styleguide/");
    expect(comparePath("color")).toBe("/lab/styleguide/compare/color/");
    expect(styleguidePath("mech")).toBe("/lab/styleguide/mech/");
    expect(styleguidePath("mech", "color")).toBe("/lab/styleguide/mech/#color");
    expect(sectionPath("mech", "color")).toBe("/lab/styleguide/mech/color/");
  });
});
