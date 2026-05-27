# Portfolio

Dockerized portfolio frontend and API stack.

## Local Development

Use the dev Compose file to run the frontend, API, and Redis locally while the API connects to remote LLM services by default.

```bash
docker compose -f compose.dev.yaml --env-file .env up --build
```

Default dev endpoints:

- Frontend: `http://localhost:4321`
- API: `http://localhost:8000`
- Redis Insight: `http://localhost:8001`

Default remote model endpoints:

- `API_LLM_BASE_URL=https://llm.noel.fyi`
- `API_EMBEDDINGS_BASE_URL=https://embeddings.noel.fyi`
- `API_RERANKING_BASE_URL=https://reranking.noel.fyi`

Override those values in `.env` if the model services are exposed through a LAN or VPN address.

## Production Images

Pushes to `main` publish two GHCR images:

- `ghcr.io/noxels/portfolio-frontend:latest`
- `ghcr.io/noxels/portfolio-api:latest`

The API image includes `content/` and `instructions/`, so production does not need to mount those directories from the server filesystem.

Runtime environment values are configured on the server through `.env`; CI does not inject deployment-specific environment variables into published images.

## Server Deployment

Log in once if GHCR packages are private:

```bash
docker login ghcr.io
```

Start or update the production stack:

```bash
docker compose -f compose.prod.yaml --env-file .env pull
docker compose -f compose.prod.yaml --env-file .env up -d
docker image prune -f
```

Smoke checks:

```bash
curl -f http://127.0.0.1:4321/health
curl -f http://127.0.0.1:8000/health
docker compose -f compose.prod.yaml ps
```
