# CI/CD and image promotion

GitHub Actions verifies the frontend and publishes images. Production deployment
is a separate infrastructure step; this repository does not change Kubernetes,
Flux, DNS, or Cloudflare routing.

## Images

The image repository is:

~~~text
ghcr.io/noxels/portfolio-frontend
~~~

Pushes to main publish:

- <base-version>-staging.<run-number>: staging build version.
- sha-<short-commit>: staging commit reference.
- frontend-staging: moving staging convenience tag.

Pushes to production publish:

- <version> and v<version>: production release tags.
- sha-<full-commit>: production commit reference.

Production images are built with PUBLIC_DEPLOYMENT_ENV=production. This enables
indexing and the production robots.txt; changing a staging container's runtime
environment does not convert it into a production build.

Every production push must have a new stable SemVer in frontend/package.json
and frontend/package-lock.json. Existing v<version> tags are rejected to avoid
overwriting a released version. Use the image digest recorded in the workflow
summary and GitHub release for deployment.

## Verification and publication

Pull requests to main or production install dependencies, audit them, build
Astro, and report bundle sizes. Production-targeted PRs and production pushes
verify with the production build environment. The bundle report is informational.

CI calls the staging or production image workflow only after verification
succeeds. Pull requests never publish images. Staging pushes can cancel older
runs; production publishing runs are serialized.

Production additionally loads the image into Docker and tests it as a non-root
user with a read-only filesystem before publishing. Checks cover:

- /health, including the expected release version and exact commit.
- English and German homepages, with production indexing enabled.
- Relative locale redirects behind an HTTPS proxy, private redirect responses,
  and secure language-preference cookies.
- Public cache headers on both localized homepages.
- robots.txt and sitemap-index.xml.

Only the tested local image is pushed. After publication, GitHub Actions creates
a GitHub release targeting the exact built commit, with its image digest.

## Bootstrap

Create production from the release-ready main commit. The initial branch push
runs CI and publishes the current package version, initially 0.0.1. Creating
the branch is therefore also the first image publication; it does not deploy
the website.

Protect production with required pull requests and the Verify frontend status
check. Disable force pushes and deletion.

## Subsequent promotion

1. Verify the current staging website.
2. Run Promote to production from the main branch in GitHub Actions.
3. The workflow snapshots main, computes the next patch version above the
   current package version and all stable vX.Y.Z tags, and creates release/X.Y.Z.
4. The release branch preserves main's complete source tree and joins previous
   production history, then commits the new package and lockfile versions.
   Prerelease and unrelated tags are ignored.
5. Open the workflow summary and follow Open promotion pull request. The form
   has production as its base and a prefilled title and description. Create
   the PR yourself so normal PR verification runs automatically.
6. Review and merge the PR. CI verifies, tests, publishes the production image,
   and creates the release.

The workflow uses GITHUB_TOKEN with contents write permission to push the
release branch. Pull requests are created manually. Keep default workflow token
permissions read-only and leave Actions-created/approved pull requests disabled.

Only one release candidate should be open at a time. Existing release branches
are never force-pushed. Make website fixes on main and promote them; production
is the release destination rather than a separate source of website changes.

## Cloudflare delivery

Cloudflare DNS, tunnel routes, and cache rules are managed in the dashboard.
The root domain points to the Sisyphus tunnel; the obsolete wildcard A record
pointing to the server IP has been removed. Configure each public hostname
explicitly instead of depending on that wildcard.

The portfolio cache rules cover noel.fyi and portfolio-staging.noel.fyi:

- /en/* and /de/* are eligible for caching and respect origin cache headers.
  The rendered homepages send a 60-second browser TTL and a 600-second shared-cache
  TTL. Without an origin header, Cloudflare's default status-code TTL applies.
- /assets/*, including the public CV PDFs, has an explicit two-hour edge TTL
  to avoid revalidating the static server's default max-age=0 on every request.
  Two hours is the minimum edge-TTL override on the current Free plan.
- / and /_locale/* must remain uncached because they select or persist a visitor's
  preferred language. Their redirects use relative Location headers so the
  tunnel's internal HTTP connection cannot downgrade the visitor's HTTPS URL.

After publishing changed content at an existing URL, use Cloudflare's Custom
Purge for the affected URLs if it needs to become visible before its TTL expires.
Include both locale homepages when deploying changes to them. Purging the edge
cache does not clear copies already cached in visitors' browsers.

## Future infrastructure setup

Deployment automation must select stable production versions, exclude staging
and prerelease tags, and pin the selected digest. It must not use the mutable
frontend-staging tag as a production reference. No production deployment
resources are managed or created by these workflows.

## Lighthouse deprecated API warnings

Cloudflare can inject `/cdn-cgi/challenge-platform/.../main.js` into HTML
responses. Its browser probes can trigger the `StorageType.persistent` and
Protected Audience deprecation warnings even though the application does not
call either API. On 2026-10-22, Chrome DevTools Protocol reported both `PersistentQuotaType`
and `Fledge` deprecations at line 1 of the Precursor variant
(`/cdn-cgi/challenge-platform/scripts/precursor/main.js`).

Public HTML responses send `Cache-Control: no-transform` in both the Astro
runtime and the legacy Nginx configuration. Cloudflare documents this directive
as preventing JavaScript Detections injection:
https://developers.cloudflare.com/cloudflare-challenges/challenge-types/javascript-detections/

The existing cache lifetimes remain in place. This opts these responses out of
edge transformations; Cloudflare may also skip compression, so check transfer
sizes after rollout. Assets retain their existing cache and transformation policy.

After deploying, verify **both** `/en/` and `/de/`:

1. Confirm `Cache-Control` includes `no-transform`.
2. Inspect the delivered HTML and browser network requests for
   `/cdn-cgi/challenge-platform/` scripts.
3. Run Lighthouse in a fresh browser session and confirm that the deprecated
   APIs audit has no warnings. A local build cannot validate edge injection.

The confirmed source is Precursor, a separate Cloudflare zone setting. Its
documentation does not explicitly guarantee that it honors `no-transform`.
The rollout therefore also requires setting **Security > Settings > Precursor >
Status: Off** for `noel.fyi`, then repeating the checks. The header change alone
is not a verified fix for Precursor. Monitor mode still runs the script. Review rules using
JavaScript Fingerprinting or `cf.bot_management.js_detection.passed` before
disabling client-side signals. See:
https://developers.cloudflare.com/cloudflare-challenges/precursor/

Rollback: remove `no-transform` from the HTML policy in both files. Any separate
zone setting change must be reverted in the Cloudflare dashboard as well.
