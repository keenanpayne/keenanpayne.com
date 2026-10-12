import { describe, expect, it } from "vitest";

import { rebaseLinks } from "./links";

const BASE = "/lab/monograph";

describe("rebaseLinks", () => {
  it("points site paths under link keys at their lab mirror", () => {
    expect(
      rebaseLinks(
        {
          url: "/about/",
          link: "/contact/?from=lab#form",
          type: { url: "/type/essays/" }
        },
        BASE
      )
    ).toEqual({
      url: "/lab/monograph/about/",
      link: "/lab/monograph/contact/?from=lab#form",
      type: { url: "/lab/monograph/type/essays/" }
    });
  });

  it("leaves external URLs, images, and other keys alone", () => {
    const data = {
      url: "https://example.com/",
      link: "//cdn.example.com/x",
      image: { url: "/images/social.png" },
      cover: "/portfolio/asana/",
      src: "/images/photo.jpg"
    };
    expect(rebaseLinks(data, BASE)).toEqual(data);
  });

  it("keeps links written with the site's own origin in the lab", () => {
    expect(
      rebaseLinks(
        {
          url: "https://keenanpayne.com/contact",
          link: "http://www.keenanpayne.com/type/drafts/",
          home: { url: "https://keenanpayne.com" },
          body:
            '<a href="https://keenanpayne.com/contact" target="_blank">A</a> ' +
            '<a href="https://keenanpayne.com.example.net/">B</a> ' +
            '<a href="https://keenanpayne.com/images/x.png">C</a>'
        },
        BASE
      )
    ).toEqual({
      url: "/lab/monograph/contact",
      link: "/lab/monograph/type/drafts/",
      home: { url: "/lab/monograph/" },
      body:
        '<a href="/lab/monograph/contact" target="_blank">A</a> ' +
        '<a href="https://keenanpayne.com.example.net/">B</a> ' +
        '<a href="https://keenanpayne.com/images/x.png">C</a>'
    });
  });

  it("follows the site's legacy redirects first", () => {
    expect(
      rebaseLinks(
        { url: "/blog/css-arrow-interaction.html", link: "/work" },
        BASE
      )
    ).toEqual({
      url: "/lab/monograph/css-arrow-interaction/",
      link: "/lab/monograph/portfolio/"
    });
  });

  it("rewrites hrefs inside HTML strings, in either quote style", () => {
    const html =
      "<a href=\"/about/\">A</a> <a href='/practices'>B</a> " +
      '<a href="https://example.com/">C</a> <img src="/images/i.png"> ' +
      '<a href="/images/file.pdf">D</a> <a href="//cdn.example.com/">E</a>';
    expect(rebaseLinks({ body: html }, BASE)).toEqual({
      body:
        '<a href="/lab/monograph/about/">A</a> ' +
        "<a href='/lab/monograph/practices'>B</a> " +
        '<a href="https://example.com/">C</a> <img src="/images/i.png"> ' +
        '<a href="/images/file.pdf">D</a> <a href="//cdn.example.com/">E</a>'
    });
  });

  it("walks arrays and nested objects, keeping everything else", () => {
    expect(
      rebaseLinks(
        {
          count: 2,
          empty: null,
          items: [{ url: "/a/" }, { url: "/b/", text: "B" }],
          nested: { deep: { link: "/c/" } }
        },
        BASE
      )
    ).toEqual({
      count: 2,
      empty: null,
      items: [
        { url: "/lab/monograph/a/" },
        { url: "/lab/monograph/b/", text: "B" }
      ],
      nested: { deep: { link: "/lab/monograph/c/" } }
    });
  });
});
