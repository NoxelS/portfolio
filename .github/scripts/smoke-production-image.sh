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

curl --fail --silent --show-error "$base_url/robots.txt" --output "$smoke_dir/robots.txt"
grep --fixed-strings --line-regexp 'Allow: /' "$smoke_dir/robots.txt"
grep --fixed-strings --line-regexp 'Sitemap: https://noel.fyi/sitemap-index.xml' "$smoke_dir/robots.txt"

for locale in en de; do
  curl --fail --silent --show-error "$base_url/$locale/" --output "$smoke_dir/$locale.html"
  grep --quiet "<html lang=\"$locale\"" "$smoke_dir/$locale.html"
  if grep --extended-regexp --quiet '<meta[^>]*name="robots"[^>]*content="[^"]*noindex' "$smoke_dir/$locale.html"; then
    echo "The production $locale homepage must be indexable." >&2
    exit 1
  fi
done

curl --fail --silent --show-error "$base_url/sitemap-index.xml" --output "$smoke_dir/sitemap.xml"
grep --quiet 'https://noel.fyi/sitemap-' "$smoke_dir/sitemap.xml"

echo "Production image passed health, version, locale, robots, and sitemap checks."
