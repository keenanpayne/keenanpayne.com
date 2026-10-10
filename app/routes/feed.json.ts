import { rfc3339Date } from "../lib/content/dates.server";
import { getFeedPosts } from "../lib/content/content.server";
import { convertToAbsoluteUrls } from "../lib/content/html.server";
import { metadata } from "../lib/site";

// JSON Feed (https://jsonfeed.org/version/1.1) of every post, newest first
export function loader() {
  const feed = {
    version: "https://jsonfeed.org/version/1.1",
    title: metadata.title,
    language: metadata.language,
    home_page_url: metadata.url,
    feed_url: metadata.jsonfeed.url,
    description: metadata.description,
    author: {
      name: metadata.author.name,
      url: metadata.author.url
    },
    items: getFeedPosts().map((post) => ({
      id: post.url,
      url: post.url,
      title: post.title,
      content_html: convertToAbsoluteUrls(post.content, post.url),
      date_published: rfc3339Date(post.date)
    }))
  };

  return new Response(JSON.stringify(feed, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
