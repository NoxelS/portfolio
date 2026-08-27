#!/usr/bin/env bash

set -Eeuo pipefail

usage() {
	printf 'Usage: %s <staging|production>\n' "${0##*/}" >&2
	exit 64
}

target="${1:-}"
case "$target" in
	staging|production) ;;
	*) usage ;;
esac

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
network_name="${CADDY_NETWORK:-edge}"
container_name="portfolio-${target}"
image_name="portfolio:${target}"

if ! docker network inspect "$network_name" >/dev/null; then
	printf 'Docker network "%s" does not exist. Set CADDY_NETWORK to the network used by Caddy.\n' "$network_name" >&2
	exit 1
fi

docker image build \
	--file "${script_dir}/Dockerfile" \
	--tag "$image_name" \
	--build-arg "PUBLIC_DEPLOYMENT_ENV=${target}" \
	"$script_dir"

if docker container inspect "$container_name" >/dev/null 2>&1; then
	docker container rm --force "$container_name"
fi

docker container run \
	--detach \
	--name "$container_name" \
	--restart unless-stopped \
	--network "$network_name" \
	--network-alias "$container_name" \
	"$image_name" >/dev/null

for _ in {1..30}; do
	status="$(docker container inspect --format '{{.State.Health.Status}}' "$container_name")"
	if [[ "$status" == 'healthy' ]]; then
		printf '%s is healthy on the %s network.\n' "$container_name" "$network_name"
		exit 0
	fi
	if [[ "$status" == 'unhealthy' ]]; then
		break
	fi
	sleep 2
done

printf '%s did not become healthy. Recent logs:\n' "$container_name" >&2
docker container logs --tail 100 "$container_name" >&2
exit 1
