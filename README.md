# Portfolio

Source code for my personal portfolio at [noel.fyi](https://noel.fyi), showcasing my work as a freelance Applied AI Engineer.

Available in English and German, the site brings together selected projects, my services, and my background.

## Core technologies

- **Astro & TypeScript** — site structure, components, and typed content.
- **Tailwind CSS** — styling and responsive layouts.
- **OGL / WebGL** — the animated mesh in the hero section, with a Canvas 2D fallback.
- **Node.js** — standalone server runtime through Astro's Node adapter.
- **Docker & GitHub Actions** — container builds and CI/CD workflows.

## Local development

Requires Node.js 22.12 or newer.

```sh
cd frontend
npm ci
npm run dev
```

Use `npm run build` to create a production build and `npm run preview` to preview it locally.


## Markdown content negotiation

Request a page with `Accept: text/markdown` to receive Markdown at the same URL.
Browsers and wildcard requests keep the default HTML (and `/` keeps its locale
redirect). `/` retains the existing English `/index.md` representation; `/en/`,
`/de/`, and localized legal pages convert their rendered main content, keeping
links absolute and removing scripts, styles, navigation and decorative elements.
Both HTML and negotiated Markdown responses vary on `Accept`.

```sh
curl -H 'Accept: text/markdown' http://localhost:4321/de/
cd frontend
node --test test/markdown.test.mjs
```

These pages render on demand so negotiation runs in the production Node server.
Browser cache policies remain in place; `CDN-Cache-Control: no-store` bypasses
shared edge caching for negotiated URLs to prevent cross-format cache entries.
Verify both formats on the public URL after deployment.
Token counts are omitted because no tokenizer is configured.
