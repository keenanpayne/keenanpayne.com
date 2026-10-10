/**
 * Response headers that harden every page. The root middleware adds them to
 * server-rendered responses, and the build writes them to Netlify's
 * `_headers` file for the pre-rendered pages and assets.
 *
 * The CSP only sets directives that don't depend on which scripts, styles,
 * or frames a page loads, so Disqus, CodePen, and Twitter embeds keep
 * working. Netlify already sends `Strict-Transport-Security`.
 */
export const SECURITY_HEADERS: Record<string, string> = {
  "Content-Security-Policy": [
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    // Netlify Forms post to this origin; the newsletter posts to Buttondown
    "form-action 'self' https://buttondown.com",
    "upgrade-insecure-requests"
  ].join("; "),
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
};

/** `SECURITY_HEADERS` for every path, in Netlify's `_headers` format */
export function netlifyHeadersFile() {
  const lines = Object.entries(SECURITY_HEADERS).map(
    ([name, value]) => `  ${name}: ${value}`
  );
  return `/*\n${lines.join("\n")}\n`;
}
