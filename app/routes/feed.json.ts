import { rfc3339Date } from "../lib/content/dates.server";
import { getFeedPosts } from "../lib/content/content.server";
import { absoluteUrl, metadata } from "../lib/site";

// JSON Feed (https://jsonfeed.org/version/1.1) of every post, newest first
export function loader() {
  const author = { name: metadata.author.name, url: metadata.author.url };
  const feed = {
    version: "https://jsonfeed.org/version/1.1",
    title: metadata.title,
    language: metadata.language,
    home_page_url: metadata.url,
    feed_url: absoluteUrl(metadata.jsonfeed.path),
    description: metadata.description,
    authors: [author],
    // Deprecated in 1.1; kept for JSON Feed 1.0 readers
    author,
    items: getFeedPosts().map((post) => ({
      id: post.url,
      url: post.url,
      title: post.title,
      content_html: post.content,
      date_published: rfc3339Date(post.date)
    }))
  };

  return new Response(JSON.stringify(feed, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
