import type { MetaDescriptor } from "react-router";

import type { PageMeta } from "./types";

export function metaTags(meta: PageMeta): MetaDescriptor[] {
  const tags: MetaDescriptor[] = [
    { title: meta.title },
    { name: "description", content: meta.description },
    { tagName: "link", rel: "canonical", href: meta.canonical },

    // Social sharing
    { property: "og:url", content: meta.canonical },
    { property: "og:title", content: meta.title },
    { name: "twitter:site", content: "@keenanpayne_" },
    { name: "twitter:creator", content: "@keenanpayne_" },
    { property: "og:description", content: meta.description },
    { property: "twitter:description", content: meta.description }
  ];

  if (meta.image) {
    tags.push(
      { property: "og:image", content: meta.image },
      { name: "twitter:image", content: meta.image },
      { name: "twitter:card", content: "summary_large_image" }
    );

    if (meta.imageAlt) {
      tags.push(
        { property: "og:image:alt", content: meta.imageAlt },
        { property: "twitter:image:alt", content: meta.imageAlt }
      );
    }
  } else {
    tags.push({ name: "twitter:card", content: "summary" });
  }

  return tags;
}
