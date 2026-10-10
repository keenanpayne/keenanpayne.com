# Design lab

Every direction at `/lab/<slug>/` is a **skin over one site**: the same content and the same pages, in a different visual language. The site’s content and information architecture live in shared layers; a direction only decides how they look.

## Layers

| Layer | Lives in | Owns |
| --- | --- | --- |
| Content | `content/*.md`, `app/data/` (`profile.ts`, `inquiry.ts`, `portfolio/`, `testimonials.ts`, …) | What the site says |
| Content model | `getLabContent()` in `app/lib/content/content.server.ts`, typed as `LabContent` | The shape every direction receives |
| Information arch. | `site/ia.ts` | The kinds of page (`View`), which URL is which kind, the navigation, the sample pages |
| Direction contract | `site/direction.tsx` | `Direction`: `stylesheets`, a `Shell`, one template per kind of page, and its style guide `specimens` |
| Shared helpers | `site/` (`helpers.ts`, `hooks.ts`, `forms.ts`, `links.tsx`, `weather.ts`) | Reading the content the same way everywhere: intros, years, reading time, clocks, form fields, Denver's weather |
| Directions | `directions/<slug>/` | How it looks |

A request for `/lab/mech/about/` runs through the route in `app/routes/lab.$direction.tsx`: the loader resolves `/about/` to a `View` (`{ kind: "about", page }`), marks the current navigation item, loads `LabContent`, and rebases every internal link onto `/lab/mech/`. `DirectionPage` then renders the direction’s `Shell` around `templates[view.kind]`.

## A direction

```
directions/<slug>/
├── index.tsx    # The Direction: stylesheets, Shell, and a template for every kind of page
├── Shell.tsx    # Header, navigation, footer
├── pages/       # One template per kind of page (some directions share one across kinds)
├── parts.tsx    # The direction’s own building blocks
├── specimens.tsx # Its parts, laid out for the style guide
└── <slug>.css   # Its styles
```

The `Direction` type requires a template for every kind in `View`, so a direction can’t skip a page, and adding a kind of page is a type error in each direction until it has one.

### Rules

- **Content comes from props, never from the direction.** Read facts, copy, photos, and links from `content` (`profile`, `socials`, `posts`, `work`, `services`, `testimonials`) and the template’s `page`. Don’t restate them.
- **Voice is the direction’s.** Relabeling a fact (`relabel(facts, { location: "Base" })`), naming sections in the skin’s language, and flavor copy that only makes sense in one skin (Portal’s mascot lines, Mech’s episode numbers) belong to the direction.
- **Links:** URLs in the content are already rebased. For fixed site paths, use `useTo()`: `to("/contact/")`.
- **Forms:** render `formFields("contact" | "inquiry")`, so every direction asks the same questions.
- **Styles are scoped.** A direction’s stylesheet stays loaded after the lab navigates to another direction, so prefix every class and custom property (`mc-`, `--mc-`).
- **Page-wide effects skip the style guide.** A rule that reaches past the direction for something a visitor opens (locking the page’s scroll, hiding the lab bar) must not match it inside the style guide’s previews: `:root:has(.mc-deck:not([hidden], .sg-stage *))`.
- **Light and dark:** define tokens on `:root`, then override them under `@media (prefers-color-scheme: dark)` with `:root:not([data-theme="light"])`, and again under `:root[data-theme="dark"]` (the lab bar’s switch).

## Common changes

| To… | Change |
| --- | --- |
| Edit a fact, the bio, a photo, a step | `app/data/profile.ts`: every direction updates |
| Edit a page’s copy | Its Markdown in `content/` |
| Add a form question | `site/forms.ts` |
| Add a navigation item | `NAVIGATION` (and `SECTIONS`, for the pages beneath it) in `site/ia.ts` |
| Add something to the content model | `LabContent` in `app/lib/types.ts` and `getLabContent()` |
| Add a kind of page | `View`, `resolveView()`, and `SAMPLE_PAGES` in `site/ia.ts`, then `npm run typecheck` lists every direction that needs a template |
| Restyle a direction | Only its folder |
| Start a direction | `npm run lab:new -- <slug> ["Display name"]`, which copies Wireframe, renames it, and registers it |
| Show a new part in the style guide | Its direction’s `specimens.tsx` |
| Retire a direction | Delete its folder and its entries in `registry.ts` and `directions/index.ts` |

## Style guide

`/lab/styleguide/` shows every direction’s foundations, components, and chrome, two ways: one direction with all of its sections (`/lab/styleguide/<slug>/`, or one section alone at `/lab/styleguide/<slug>/<section>/`), or one section across every direction (`/lab/styleguide/compare/<section>/`). The sections are listed in `styleguide/sections.ts`.

- **Shared sections** draw themselves for every direction: Color reads the custom properties straight from `<slug>.css` (`styleguide/tokens.server.ts`), Typefaces reads the font tokens and the Google Fonts URL in `stylesheets`, and Shell renders the direction’s `Shell` around a placeholder. They need nothing from a direction beyond following the light and dark rule above.
- **Specimens** are the rest (type scale, motifs, imagery, page header, buttons, labels, panels, cards, lists, testimonials, forms, wayfinding, prose). A direction’s `specimens.tsx` gives each one a component that renders its own parts with real `content`, laid out with `styleguide/kit.tsx`: `SpecimenGrid`, `Specimen` (a captioned example), `TypeSample` (measures and prints a style’s specs), and `Note`. They render inside the direction’s `root` class; `prose` is an article body with every element the Markdown can produce, run through the real pipeline.
- When a direction gains a part or a variant, add it to its specimens. Adding a section is one entry in `STYLE_SECTIONS`, then `npm run typecheck` lists every direction that needs a specimen for it.

**Wireframe** is the baseline: every kind of page with all of its content in plain, semantic HTML. It’s the quickest way to see what a page has to offer, and new directions start as a copy of it.

## Taking a direction live

Directions don’t depend on the lab route: `DirectionPage` takes a `base` for its links, so a production route can render one at the site root with `base=""` and loader data that skips `rebaseLinks`. What’s left is wiring the forms to Netlify (the lab’s are mockups) and page metadata.
