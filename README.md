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

## API discovery

`GET /.well-known/api-catalog` returns an RFC 9727 Linkset with media type
`application/linkset+json`. `HEAD` returns the same headers, including an
`api-catalog` Link relation. The catalog currently lists the public `/health`
API, with its `/openapi.json` specification and `/api-docs/` documentation.
Add an `item` link and a corresponding API entry when publishing another API.

After deploying, validate discovery with:

```sh
curl -sS https://isitagentready.com/api/scan \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://noel.fyi"}'
```

Check `checks.discovery.apiCatalog.status` for `"pass"`. This scanner checks
the live deployment, so a PR build alone cannot change its result.
