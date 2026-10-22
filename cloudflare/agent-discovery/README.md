# Homepage agent discovery

This Cloudflare Worker adds RFC 8288 Link headers to `/`, `/en`, `/en/`, `/de`, and `/de/`, including the root locale redirect and Markdown-negotiated responses. The scanner follows the redirect, so the localized homepage must carry the headers too. Existing origin headers, status, body, cookies, and content negotiation are preserved.

The Worker serves three discovery documents without modifying the origin:

- `/.well-known/api-catalog`: RFC 9727 Linkset JSON catalog with its profile media parameter.
- `/openapi.json`: OpenAPI 3.1 description of the existing read-only `/index.md` and `/llms.txt` resources.
- `/agent-docs`: plain-text usage documentation.

Homepage links use `api-catalog`, `service-desc`, `service-doc`, and `describedby` (the full `/index.md` portfolio). There are no booking, messaging, MCP, or agent execution endpoints.

## Verify and deploy

From this directory, using Node 22 or later:

```sh
node --test worker.test.mjs
npx wrangler@4 deploy --dry-run
npx wrangler@4 deploy
```

Deployment requires Cloudflare access to the `noel.fyi` zone and permission to deploy Workers and manage Worker routes. The hostname must be proxied by Cloudflare. Inspect existing Worker routes before deployment: the configured `noel.fyi/*` route must not replace another Worker. A route (rather than a Worker custom domain) lets `fetch(request)` reach the existing origin. Other paths pass through untouched. Origin failures are still failures, even if they carry discovery headers.

Deploying this Worker is separate from merging the portfolio PR or building the frontend image; the existing frontend workflows do not deploy it. No credentials belong in this repository.

After deployment, check both the redirect and final homepage, then run the requested public scan:

```sh
curl -sSI https://noel.fyi/
curl -sSI https://noel.fyi/en/
curl -sSI https://noel.fyi/de/
curl -sS https://noel.fyi/.well-known/api-catalog
curl -sS -X POST https://isitagentready.com/api/scan \
  -H 'Content-Type: application/json' \
  --data '{"url":"https://noel.fyi"}' \
  | jq '.checks.discoverability.linkHeaders'
```

The acceptance condition is `status: "pass"`. A local test or dry run cannot prove the live check passes. Remove the Worker route to roll back edge behavior.

Specifications: [RFC 8288](https://www.rfc-editor.org/rfc/rfc8288), [RFC 9727 section 3](https://www.rfc-editor.org/rfc/rfc9727#section-3), [Cloudflare Worker routes](https://developers.cloudflare.com/workers/configuration/routing/routes/).
