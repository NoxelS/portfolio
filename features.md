# 1. Health Feature For Uptime And Docker Health Checks

Add a lightweight health endpoint at `/health` that can be used by uptime monitors, Docker health checks, and post-deploy validation.

The endpoint should return JSON with enough information to verify that the running service is healthy and that the expected version is deployed. It should not expose secrets, internal hostnames, infrastructure details, or sensitive environment variables.

Recommended response fields:

```json
{
  "status": "ok",
  "service": "portfolio",
  "version": "<git-sha-or-release>",
  "commit": "<git-sha>",
  "builtAt": "<iso-date>",
  "uptimeSeconds": 123,
  "timestamp": "<iso-date>"
}
```

Implementation notes:

- Add an Astro API route at `/health` with `prerender = false` so it reflects the running server instance.
- Return `200` with `status: "ok"` when the app can serve traffic.
- Return `Cache-Control: no-store` so health checks are never cached by Cloudflare or browsers.
- Include the deployed version from build-time environment variables, such as `GITHUB_SHA`, `BUILD_VERSION`, or a Docker build argument.
- Keep checks shallow at first. The portfolio currently has no critical database or upstream dependency to verify.
- Add a Docker `HEALTHCHECK` that calls `http://127.0.0.1:4321/health`.
- Add a CI/CD smoke test after building the Docker image to start the container and verify `/health` returns the expected version.
- Consider adding `Server-Timing` later if the endpoint is used for lightweight latency checks.

Acceptance criteria:

- `/health` returns JSON and `Cache-Control: no-store`.
- The endpoint includes the current deployed version or commit SHA.
- Docker can use `/health` as the container health check.
- CI/CD verifies that the image starts and `/health` responds before publishing or deploying.
- The endpoint does not leak secrets or internal infrastructure details.

# 2. Analytics, Consent, And Behavioral Insights

Add privacy-conscious, self-hosted analytics for the portfolio. The goal is to understand how visitors use the site and how the site performs technically without adding meaningful performance overhead or collecting unnecessary personal data.

Use OpenPanel as the preferred analytics backend because it is open source, self-hostable, supports product-style event tracking, funnels, dashboards, custom events, and Astro integration. Reconsider Umami only if operational simplicity becomes more important than deep event analysis.

Do not implement or test analytics tracking until the OpenPanel service exists on Asgard and the production endpoint/client ID are available.

## Consent Requirements

Because this site targets Germany/EU visitors and the feature includes behavioral tracking, add an explicit analytics consent banner before sending analytics events.

Use an opt-in model:

- Initialize OpenPanel with analytics disabled by default.
- Queue events before consent with OpenPanel consent management.
- Show a banner with clear choices: accept analytics and reject analytics.
- Give accept and reject actions equal visual weight.
- Do not use preselected non-essential consent.
- On accept, persist the consent choice and call OpenPanel `ready()` so queued events are flushed.
- On reject, persist rejection and do not call `ready()`.
- On revoke, persist rejection and reinitialize or reload analytics in disabled mode.
- Keep consent withdrawal as easy as giving consent.
- Do not enable session replay initially. If session replay is ever added, require a separate explicit opt-in.

OpenPanel consent behavior to rely on:

- `disabled: true` prevents network sends.
- `track`, `identify`, `screenView`, and replay chunks are queued in memory while disabled.
- `ready()` enables analytics and flushes the queue.
- If the user rejects consent and `ready()` is never called, queued events are not sent and are lost on unload.

Privacy constraints:

- Avoid collecting PII.
- Do not track raw form values, names, emails, full query strings, auth tokens, or sensitive URL parameters.
- Do not call `identify()` unless a future logged-in feature makes it necessary.
- Do not use persistent cross-site identifiers.
- Prefer short raw-event retention, then aggregate historical reporting.
- Add a privacy notice before production launch that explains OpenPanel, hosting location, data categories, legal basis, retention, and withdrawal/objection options.

## Behavioral Metrics

Track user behavior through explicit, intentional events rather than broad automatic capture.

Baseline events:

- page views by route
- referrer and traffic source
- visit date and time
- device class and viewport size
- button clicks through `data-analytics-*` attributes
- outbound link clicks
- project card clicks
- resume/download clicks
- contact actions
- social profile clicks
- scroll-depth milestones at 25%, 50%, 75%, 90%, and 100%

Suggested funnels:

- homepage view to project click
- homepage view to resume download
- homepage view to contact action
- project view to external source/demo click
- landing page view to social profile click

Event implementation rules:

- Use a small first-party analytics script instead of hydrating a framework component.
- Use delegated click listeners with `closest('[data-analytics-event]')`.
- Track only explicit elements, for example `data-analytics-event`, `data-analytics-id`, and `data-analytics-label`.
- Track scroll depth as coarse deduplicated milestones only.
- Batch events in memory and flush with `navigator.sendBeacon()`.
- Use `fetch(..., { keepalive: true })` as a fallback.
- Do not block rendering, scrolling, or navigation for analytics.
- Keep payloads small and schema-versioned.

Recommended event names:

- `page_view`
- `click`
- `outbound_link`
- `download`
- `scroll_depth`
- `contact_action`
- `web_vital`
- `resource_timing`
- `server_timing`
- `client_error`

## Technical Metrics

Collect technical insight alongside behavioral analytics. Browser-only metrics should be sent after consent. Server-side metrics should avoid personal data and should never be cached as user-facing content.

Browser real-user monitoring:

- LCP
- INP
- CLS
- FCP
- TTFB
- navigation type
- route/path
- viewport class
- connection class when available
- release/version

Important note: Core Web Vitals such as LCP, INP, and CLS are browser/user metrics. They cannot be measured accurately on the server. The server can collect backend and delivery metrics that help explain those browser metrics.

Navigation timing diagnostics:

- DNS duration
- TCP duration
- TLS duration
- request duration
- response download duration
- DOM interactive timing
- load event timing
- redirect count

Resource timing diagnostics:

- largest resources by transfer size
- slowest resources by duration
- render-blocking CSS and JavaScript
- font loading duration
- LCP image candidate data where available
- compressed and decoded sizes where available

Server and delivery metrics:

- request duration
- SSR render duration
- route template
- status code
- response size
- error type
- upstream fetch duration for future API/CMS calls
- `Server-Timing` values
- cache policy selected by the app
- Cloudflare cache status where available
- Docker/container health status through the `/health` feature

Build and release metrics:

- total client JavaScript bytes
- total CSS bytes
- asset count
- largest chunks
- server bundle size
- Docker image size if easy to collect
- release SHA and build timestamp
- dependency changes that affect bundle size

Use CI to report bundle-size metrics and prevent performance regressions before deployment.

## Implementation Phases

Phase 1: OpenPanel readiness

- Add OpenPanel service on Asgard outside this repository.
- Decide the production OpenPanel URL and client ID.
- Add secrets or public runtime config needed by the portfolio.
- Document retention and privacy settings.

Phase 2: Consent foundation

- Add a consent banner component.
- Store only the minimum consent state required.
- Initialize OpenPanel with `disabled: true` for new visitors.
- Call OpenPanel `ready()` only after accept.
- Add a way to reject and later revoke analytics consent.

Phase 3: Behavioral tracking

- Add page-view tracking.
- Add click tracking through explicit data attributes.
- Add outbound-link and download tracking.
- Add deduplicated scroll-depth tracking.
- Add funnel-friendly event names and properties.

Phase 4: Technical tracking

- Add `web-vitals` collection for LCP, INP, CLS, FCP, and TTFB.
- Add navigation timing summaries.
- Add resource timing summaries for the largest and slowest resources.
- Add `Server-Timing` headers for SSR and API routes.
- Add server request timing where useful.

Phase 5: CI and operational insight

- Add bundle-size reporting in CI.
- Track largest chunks and total JS/CSS size.
- Add performance budgets once the first real design is implemented.
- Correlate releases with Web Vitals and interaction changes.

## Acceptance Criteria

- OpenPanel is documented as the selected analytics backend.
- No analytics tracking is tested or shipped until the OpenPanel service is available on Asgard.
- A German/EU-safe consent banner is present before analytics events are sent.
- OpenPanel starts disabled and flushes queued events only after consent.
- Rejection prevents analytics from being sent.
- Users can revoke analytics consent.
- Click tracking works through explicit data attributes.
- Scroll-depth tracking emits deduplicated milestones only.
- Core Web Vitals are reported after consent.
- Server-side request and SSR timing metrics are available.
- CI reports bundle-size metrics.
- Tests cover consent gating, event schema validation, click extraction, scroll milestone deduplication, and privacy/cache behavior once analytics implementation begins.
