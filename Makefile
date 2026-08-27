FRONTEND_DIR := frontend

.PHONY: validate fix

validate:
	cd $(FRONTEND_DIR) && npm ci
	cd $(FRONTEND_DIR) && npm audit --audit-level=high
	cd $(FRONTEND_DIR) && PUBLIC_BUILD_VERSION=$${PUBLIC_BUILD_VERSION:-development} PUBLIC_COMMIT_SHA=$${PUBLIC_COMMIT_SHA:-development} PUBLIC_BUILT_AT=$${PUBLIC_BUILT_AT:-development} npm run build
	cd $(FRONTEND_DIR) && npm run report:bundle

fix:
	cd $(FRONTEND_DIR) && npm ci
	cd $(FRONTEND_DIR) && npm audit --audit-level=high
	cd $(FRONTEND_DIR) && PUBLIC_BUILD_VERSION=$${PUBLIC_BUILD_VERSION:-development} PUBLIC_COMMIT_SHA=$${PUBLIC_COMMIT_SHA:-development} PUBLIC_BUILT_AT=$${PUBLIC_BUILT_AT:-development} npm run build
	cd $(FRONTEND_DIR) && npm run report:bundle
