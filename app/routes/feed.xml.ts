import { rfc822Date } from "../lib/content/dates.server";
import { getFeedPosts } from "../lib/content/content.server";
import { convertToAbsoluteUrls, escapeHtml } from "../lib/content/html.server";
import { metadata } from "../lib/site";

// Atom feed of every post, newest first
export function loader() {
  const posts = getFeedPosts();
  const updated = posts.reduce<Date | undefined>(
    (newest, post) => (!newest || post.date > newest ? post.date : newest),
    undefined
  );

  const entries = posts
    .map(
      (post) => `
	<entry>
		<title>${escapeHtml(post.title)}</title>
		<link href="${post.url}"/>
		<updated>${rfc822Date(post.date)}</updated>
		<id>${post.url}</id>
		<content type="html">${escapeHtml(convertToAbsoluteUrls(post.content, post.url))}</content>
	</entry>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
	<title>${escapeHtml(metadata.title)}</title>
	<subtitle>${escapeHtml(metadata.feed.subtitle)}</subtitle>
	<link href="${new URL(metadata.feed.path, metadata.url)}" rel="self"/>
	<link href="${metadata.url}"/>
	<updated>${updated ? rfc822Date(updated) : ""}</updated>
	<id>${metadata.feed.id}</id>
	<author>
		<name>${escapeHtml(metadata.author.name)}</name>
		<email>${escapeHtml(metadata.author.email)}</email>
	</author>${entries}
</feed>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/atom+xml; charset=utf-8" }
  });
}
