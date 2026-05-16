PYTHON_DIR := backend
FRONTEND_DIR := frontend

.PHONY: validate fix evaluate-rag

validate:
	cd $(PYTHON_DIR) && uv sync --frozen
	cd $(PYTHON_DIR) && uv run ruff check .
	cd $(FRONTEND_DIR) && npm ci
	cd $(FRONTEND_DIR) && npm audit --audit-level=high
	cd $(FRONTEND_DIR) && PUBLIC_BUILD_VERSION=$${PUBLIC_BUILD_VERSION:-development} PUBLIC_COMMIT_SHA=$${PUBLIC_COMMIT_SHA:-development} PUBLIC_BUILT_AT=$${PUBLIC_BUILT_AT:-development} npm run build
	cd $(FRONTEND_DIR) && npm run report:bundle

fix:
	cd $(PYTHON_DIR) && uv sync --frozen
	cd $(PYTHON_DIR) && uv run ruff format .
	cd $(PYTHON_DIR) && uv run ruff check --fix .
	cd $(FRONTEND_DIR) && npm ci
	cd $(FRONTEND_DIR) && npm audit --audit-level=high
	cd $(FRONTEND_DIR) && PUBLIC_BUILD_VERSION=$${PUBLIC_BUILD_VERSION:-development} PUBLIC_COMMIT_SHA=$${PUBLIC_COMMIT_SHA:-development} PUBLIC_BUILT_AT=$${PUBLIC_BUILT_AT:-development} npm run build
	cd $(FRONTEND_DIR) && npm run report:bundle

evaluate-rag:
	docker compose up -d redis
	cd $(PYTHON_DIR) && uv run python -m tests.evaluations.run_evaluation
