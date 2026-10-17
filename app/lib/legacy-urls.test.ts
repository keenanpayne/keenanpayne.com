import { describe, expect, it } from "vitest";

import { resolveLegacyPath } from "./legacy-urls";

describe("resolveLegacyPath", () => {
  it("sends the old blog index to the archive", () => {
    expect(resolveLegacyPath("/blog")).toBe("/archive/");
    expect(resolveLegacyPath("/blog/")).toBe("/archive/");
    expect(resolveLegacyPath("/blog/index.html")).toBe("/archive/");
  });

  it("maps old post URLs to their canonical page", () => {
    expect(resolveLegacyPath("/blog/css-arrow-interaction.html")).toBe(
      "/css-arrow-interaction/"
    );
    expect(resolveLegacyPath("/blog/css-arrow-interaction")).toBe(
      "/css-arrow-interaction/"
    );
    expect(resolveLegacyPath("/Blog/Post.HTML")).toBe("/Post/");
  });

  it("keeps file paths as they are", () => {
    expect(resolveLegacyPath("/blog/image.png")).toBe("/image.png");
  });

  it("never redirects off-site", () => {
    expect(resolveLegacyPath("/blog//evil.com/x")).toBe("/evil.com/x/");
    expect(resolveLegacyPath("/blog/\\\\evil.com")).toBe("/evil.com");
  });

  it("redirects /work to the portfolio", () => {
    expect(resolveLegacyPath("/work")).toBe("/portfolio/");
    expect(resolveLegacyPath("/WORK/")).toBe("/portfolio/");
  });

  it("ignores every other path", () => {
    expect(resolveLegacyPath("/about/")).toBeUndefined();
    expect(resolveLegacyPath("/blogroll")).toBeUndefined();
  });
});
