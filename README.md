# Keenan Payne's Website

[![Netlify Status](https://api.netlify.com/api/v1/badges/23342844-d353-4977-9ac2-e69e9e17fd82/deploy-status)](https://app.netlify.com/sites/keenanpayne/deploys)

Feel free to fork this and use my code and designs for whatever you'd like. You can add credit to myself if you please, but it's not necessary.

The site is built with [React](https://react.dev/) and [React Router](https://reactrouter.com/) (framework mode) with server-side rendering. Every page is also pre-rendered to static HTML at build time, and all content lives in Markdown files.

How it looks is a **design direction**: a skin over the shared content and information architecture, one of several in the design lab (`app/lab/`, see [its README](app/lab/README.md)). The live one, which renders every page at the site root, is set in `app/lab/live.ts`; the others are mocked up at `/lab/<slug>/` until their turn.

## Requirements

- Node.js 24 (see `.node-version`; [Volta](https://volta.sh/) picks it up automatically from `package.json`)

## Available Scripts

### Development

```bash
# Start the development server at http://localhost:4242
npm run dev

# Build and serve the production site locally
npm run serve:prod
```

### Building

```bash
# Build the client, server, and pre-rendered pages into build/
npm run build

# Serve an existing production build (http://localhost:3000)
npm run start
```

### Code Quality

```bash
# Run all code quality checks (types, lint, formatting, tests)
npm run validate

# Fix all auto-fixable issues
npm run fix

# Type checking
npm run typecheck

# Unit tests: the content pipeline's helpers, and the design lab's
# conformance checks
npm run test

# Linting
npm run lint         # Run all linters
npm run lint:js      # Run ESLint
npm run lint:css     # Run Stylelint
npm run lint:fix     # Fix all auto-fixable lint issues

# Formatting
npm run format       # Format all files
npm run check:format # Check formatting without making changes
```

### Maintenance

```bash
# Clean build artifacts
npm run clean        # Remove build/ and generated route types
npm run clean:deps   # Remove dependencies
npm run clean:all    # Remove both build artifacts and dependencies

# Security and Updates
npm run audit        # Check for vulnerabilities and outdated deps
npm run audit:fix    # Try to fix vulnerabilities and update deps

# Build Analysis
npm run size         # Show size of build directory

# Re-count the qualities mentioned in testimonials (app/data/testimonial-analysis.json)
npm run analyze:testimonials

# Start a design lab direction as a copy of Wireframe
npm run lab:new -- <slug> ["Display name"]

# Check every design lab direction against the shared feature set,
# information architecture, and foundations (see app/lab/README.md). CI
# (.github/workflows/ci.yml) runs these, with types, lint, formatting, and
# the other tests, on every push and pull request.
npm run lab:check
```

## Project Structure

```
.
├── app/                    # React Router application
│   ├── assets/svg/         # Inline SVG icons and logos
│   ├── components/         # HtmlContent: rendered Markdown, with its embeds
│   ├── data/               # Profile, people, testimonials, socials, portfolio case studies, site metadata
│   ├── lab/                # Design directions over the same content (see app/lab/README.md)
│   │   ├── directions/     # One folder per direction (its shell, page templates, and styles)
│   │   ├── site/           # What every direction shares: page kinds, navigation, forms, helpers
│   │   ├── conformance/    # Checks that every direction has the same features and foundations
│   │   └── live.ts         # Which direction the site runs
│   ├── lib/                # Content loading, Markdown rendering, helpers
│   │   └── content/        # Server-only content pipeline
│   ├── routes/             # Route modules (pages, the lab, feeds, sitemap)
│   ├── root.tsx            # The document; each page's chrome and styles come from its direction
│   └── routes.ts           # Route configuration
├── content/                # Markdown content
│   ├── bookshelf/          # Book reviews
│   ├── drafts/             # Draft posts (published, but not listed)
│   ├── pages/              # Standalone pages (home, about, contact, …)
│   ├── portfolio/          # Case studies
│   ├── posts/              # Blog posts
│   ├── services/           # Service pages
│   └── type/               # Archive pages for each post type
├── public/                 # Static files (images)
├── scripts/                # Maintenance scripts
├── netlify.toml            # Netlify build settings
├── postcss.config.js       # PostCSS plugins
├── react-router.config.ts  # SSR and pre-rendering settings
└── vite.config.ts          # Vite, React Router, and Netlify plugins
```

## Writing Content

Every Markdown file in `content/` becomes a page. Front matter works like it did with Eleventy:

- `title`, `permalink`, `date`, `tags`, `type`, `lede`, `cover`, and `meta` (`title`, `description`, `image`, `image_alt`)
- `sections` builds a page from sections (`intro`, `entries`, `testimonials`, `portfolioGrid`, …) — see `resolveSection()` in `app/lib/content/content.server.ts` for the full list; each direction decides how they look
- `toc: false` hides a post's table of contents, and `cta: false` its newsletter sign-up

The primary navigation isn't front matter: it's `NAVIGATION` in `app/lab/site/ia.ts`, which every direction renders.

Each folder has its own defaults (layout, URL, and data), defined in `app/lib/content/content.server.ts`. Posts without a `permalink` are published at `/<slugified title>/`.

Markdown is rendered with [markdown-it](https://github.com/markdown-it/markdown-it) (raw HTML, footnotes, linkable headings, and build-time [Prism](https://prismjs.com/) syntax highlighting). Posts can embed these shortcodes:

```liquid
{% include "type/note.html", content: "A note", align: "left" %}
{% include "type/question.html", content: "A question?" %}
{% include "type/tip.html", content: "A tip" %}
{% include "type/notice.html", content: "A notice" %}
{% include "type/tldr.html", content: "The gist" %}
{% include "type/further-reading.html", content: "Links" %}
{% include "type/p_large.html", content: "A large paragraph" %}
{% include "type/blockquote.html", content: "A quote", author: "Someone" %}
{% include "atoms/figure.html", src: "/images/…", alt: "…", caption: "…", source_title: "…", source_link: "…" %}
{% include "components/image.njk", imgSrc: "cloudinary/path.jpg", alt: "…", caption: "…" %}
```

The shortcodes are implemented in `app/lib/content/shortcodes.server.ts`.

## Styles

Each design direction brings its own stylesheet, `app/lab/directions/<slug>/<slug>.css`, scoped to its root class (see [app/lab/README.md](app/lab/README.md)); the lab's own pages have `app/lab/lab.css` and `app/lab/styleguide/styleguide.css`. They're plain CSS, compiled with PostCSS:

- [postcss-nested](https://github.com/postcss/postcss-nested) for nesting
- [postcss-media-minmax](https://github.com/postcss/postcss-media-minmax) and [Autoprefixer](https://github.com/postcss/autoprefixer) for browser support

## Deployment

The site deploys to [Netlify](https://netlify.com) with `npm run build`, publishing `build/client`. Pre-rendered pages are served as static files; any other request (404s and legacy redirects in `app/lib/legacy-urls.ts`) is server-rendered by a Netlify Function generated by [`@netlify/vite-plugin-react-router`](https://www.npmjs.com/package/@netlify/vite-plugin-react-router). The contact and project inquiry forms use [Netlify Forms](https://docs.netlify.com/manage/forms/setup/), and the newsletter sign-up posts to [Buttondown](https://buttondown.com/); where each sends is `submissionOf()` in `app/lab/site/forms.ts`, and `useSubmission()` wires every direction's forms to it (in the lab, they're mockups).

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Credits

- [Netlify](https://netlify.com)
  - Superb web hosting and deployment platform
- [React](https://react.dev/) and [React Router](https://reactrouter.com/)
  - UI library and full-stack routing framework
- [Vite](https://vite.dev/)
  - Build tool and development server
- [PostCSS](https://postcss.org/)
  - CSS transformation tool with mixins, nesting, custom media queries, and autoprefixer
- [Markdown-it](https://github.com/markdown-it/markdown-it)
  - Markdown parser with support for footnotes and anchors
- [Prism](https://prismjs.com/)
  - Syntax highlighting
- [Luxon](https://moment.github.io/luxon/)
  - Modern JavaScript date/time library
- [TypeScript](https://www.typescriptlang.org/)
  - Typed JavaScript
- [ESLint](https://eslint.org/)
  - JavaScript linting utility
- [Prettier](https://prettier.io/)
  - Code formatter for consistent style
- [Stylelint](https://stylelint.io/)
  - CSS linting utility

## License

This project is licensed under the MIT License - see the LICENSE file for details.
