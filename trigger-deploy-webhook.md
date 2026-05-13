# Trigger Yggdrasil Deploy Webhook

Use this guide from another repository when a successful main-branch build should tell Yggdrasil to pull and recreate that project's Docker Compose service.

## Required Setup

1. Add the repository to `services/webhooks/service-map.tsv` in this infrastructure repo.
2. Deploy the `webhooks` service after changing the allowlist.
3. Store the webhook HMAC secret in the source repository's GitHub Actions secrets.

Use this GitHub secret name in side-project repositories:

```text
YGGDRASIL_WEBHOOK_SECRET
```

Yes, the secret should be stored in GitHub Actions secrets. Do not commit it to the side-project repository, print it in logs, or pass it as a plain query parameter.

## Endpoint

```text
POST https://hooks.noel.fyi/hooks/deploy
```

The webhook only accepts signed `POST` requests for `refs/heads/main`.

## Payload

Send metadata only. Do not send code or shell commands.

```json
{
  "repository": "portfolio",
  "ref": "refs/heads/main",
  "image": "ghcr.io/noxels/portfolio",
  "tag": "latest"
}
```

Fields:

| Field | Required | Meaning |
| --- | --- | --- |
| `repository` | Yes | Allowlisted repository key from `services/webhooks/service-map.tsv` |
| `ref` | Yes | Must be `refs/heads/main` |
| `image` | No | Image name for logs and ntfy notifications |
| `tag` | No | Image tag for logs and ntfy notifications |

## Signature

Sign the exact raw JSON request body with HMAC-SHA256 and send it as:

```text
X-Hub-Signature-256: sha256=<hex digest>
```

The webhook rejects requests if the signature does not match `YGGDRASIL_WEBHOOK_SECRET`.

## GitHub Actions Example

Add this step after the image has been pushed to the registry:

```yaml
- name: Trigger Yggdrasil deploy
  if: github.ref == 'refs/heads/main'
  env:
    WEBHOOK_SECRET: ${{ secrets.YGGDRASIL_WEBHOOK_SECRET }}
    WEBHOOK_URL: https://hooks.noel.fyi/hooks/deploy
    REPOSITORY: portfolio
    IMAGE: ghcr.io/noxels/portfolio
    TAG: latest
  run: |
    set -euo pipefail

    payload=$(jq -cn \
      --arg repository "$REPOSITORY" \
      --arg ref "$GITHUB_REF" \
      --arg image "$IMAGE" \
      --arg tag "$TAG" \
      '{repository: $repository, ref: $ref, image: $image, tag: $tag}')

    signature="sha256=$(printf '%s' "$payload" | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" -binary | xxd -p -c 256)"

    curl --fail-with-body \
      --request POST \
      --header "Content-Type: application/json" \
      --header "X-Hub-Signature-256: $signature" \
      --data "$payload" \
      "$WEBHOOK_URL"
```

## Agent Checklist

When adding this to a side-project repository:

1. Confirm the Docker image is pushed before the webhook step runs.
2. Set `REPOSITORY` to the allowlisted key in `services/webhooks/service-map.tsv`.
3. Set `IMAGE` and `TAG` to the image that was just pushed.
4. Use `secrets.YGGDRASIL_WEBHOOK_SECRET` for signing.
5. Never include the secret in workflow logs.

## Expected Result

A successful request returns:

```text
Deployment request accepted
```

The `webhooks` service sends ntfy monitoring messages when the request is accepted, rejected, and completed.
