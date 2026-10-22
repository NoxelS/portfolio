#!/usr/bin/env bash
set -euo pipefail

image="${1:?Usage: smoke-production-image.sh IMAGE VERSION COMMIT}"
version="${2:?Expected release version is required}"
commit="${3:?Expected commit is required}"
container="portfolio-production-smoke"
base_url="http://127.0.0.1:14321"
smoke_dir="$(mktemp -d)"

cleanup() {
  docker logs "$container" || true
  docker rm --force "$container" >/dev/null || true
  rm -rf "$smoke_dir"
}
trap cleanup EXIT

docker run --detach --name "$container" \
  --read-only --tmpfs /tmp:rw,noexec,nosuid,size=64m \
  --user 1000:1000 --cap-drop ALL --security-opt no-new-privileges \
  --publish 127.0.0.1:14321:4321 "$image"

for attempt in {1..30}; do
  if curl --fail --silent --show-error --max-time 2 \
    "$base_url/health" --output "$smoke_dir/health.json"; then
    break
  fi
  sleep 1
done

jq --exit-status --arg version "$version" --arg commit "$commit" \
  '.status == "ok" and .service == "portfolio" and .version == $version and .commit == $commit' \
  "$smoke_dir/health.json"

# The tunnel reaches this server over HTTP. Redirects must preserve the
# visitor's HTTPS origin instead of rebuilding a URL from that HTTP hop.
curl --fail --silent --show-error --dump-header "$smoke_dir/root.headers" \
  --header 'Host: noel.fyi' --header 'X-Forwarded-Proto: https' \
  --header 'Accept-Language: de' "$base_url/" --output /dev/null
tr -d '\r' < "$smoke_dir/root.headers" | grep --ignore-case --line-regexp 'location: /de/'
tr -d '\r' < "$smoke_dir/root.headers" | grep --ignore-case --line-regexp 'cache-control: private, no-store'

curl --fail --silent --show-error --dump-header "$smoke_dir/locale.headers" \
  --header 'Host: noel.fyi' --header 'X-Forwarded-Proto: https' \
  "$base_url/_locale/en?returnTo=/en/privacy/" --output /dev/null
tr -d '\r' < "$smoke_dir/locale.headers" | grep --ignore-case --line-regexp 'location: /en/privacy/'
tr -d '\r' < "$smoke_dir/locale.headers" | grep --ignore-case --line-regexp 'cache-control: private, no-store'
grep --ignore-case --quiet 'set-cookie: portfolio_locale=en;.*Secure; HttpOnly' "$smoke_dir/locale.headers"

curl --fail --silent --show-error "$base_url/robots.txt" --output "$smoke_dir/robots.txt"
grep --fixed-strings --line-regexp 'Allow: /' "$smoke_dir/robots.txt"
grep --fixed-strings --line-regexp 'Sitemap: https://noel.fyi/sitemap-index.xml' "$smoke_dir/robots.txt"

# Public authentication discovery must remain accessible without locale redirects.
curl --fail --silent --show-error --dump-header "$smoke_dir/auth.headers" \
  --header 'Accept-Language: de' "$base_url/auth.md" --output "$smoke_dir/auth.md"
tr -d '\r' < "$smoke_dir/auth.headers" | grep --extended-regexp '^HTTP/[0-9.]+ 200( |$)'
tr -d '\r' < "$smoke_dir/auth.headers" | grep --ignore-case --line-regexp 'content-type: text/markdown; charset=utf-8'
tr -d '\r' < "$smoke_dir/auth.headers" | grep --ignore-case --line-regexp 'cache-control: public, max-age=300, s-maxage=3600, stale-while-revalidate=600'
grep --fixed-strings --line-regexp '# auth.md' "$smoke_dir/auth.md"
for document in index.md llms.txt; do
  curl --fail --silent --show-error "$base_url/$document" --output "$smoke_dir/$document"
  grep --fixed-strings --quiet 'https://noel.fyi/auth.md' "$smoke_dir/$document"
done

for locale in en de; do
  curl --fail --silent --show-error --dump-header "$smoke_dir/$locale.headers" \
    "$base_url/$locale/" --output "$smoke_dir/$locale.html"
  tr -d '\r' < "$smoke_dir/$locale.headers" | grep --ignore-case --line-regexp \
    'cache-control: public, max-age=60, s-maxage=600, stale-while-revalidate=60'
  grep --quiet "<html lang=\"$locale\"" "$smoke_dir/$locale.html"
  # Resizing is a build-time setting: validate the HTML emitted by the actual image.
  grep --quiet '/cdn-cgi/image/width=192,quality=80,format=auto/profile1.png 192w' "$smoke_dir/$locale.html"
  grep --quiet '/cdn-cgi/image/width=500,quality=80,format=auto/profile1.png 500w' "$smoke_dir/$locale.html"
  grep --quiet '/cdn-cgi/image/width=144,height=40,quality=80,format=auto/assets/companies/UNIPD_Marchio_STD_RED.png 1x' "$smoke_dir/$locale.html"
  if grep --extended-regexp --quiet '/cdn-cgi/image/[^" ]*\.svg([?" ]|$)' "$smoke_dir/$locale.html"; then
    echo "SVG logos must bypass image transformations." >&2
    exit 1
  fi
  if grep --extended-regexp --quiet '<meta[^>]*name="robots"[^>]*content="[^"]*noindex' "$smoke_dir/$locale.html"; then
    echo "The production $locale homepage must be indexable." >&2
    exit 1
  fi
done

curl --fail --silent --show-error "$base_url/sitemap-index.xml" --output "$smoke_dir/sitemap.xml"
grep --quiet 'https://noel.fyi/sitemap-' "$smoke_dir/sitemap.xml"

echo "Production image passed health, version, HTTPS redirects, cache headers, locale, responsive images, robots, and sitemap checks."
