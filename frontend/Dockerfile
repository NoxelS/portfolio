FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS build
ARG BUILD_VERSION=development
ARG COMMIT_SHA=development
ARG BUILT_AT=development
ARG PUBLIC_API_BASE_URL=
ARG PUBLIC_OPENPANEL_CLIENT_ID=
ARG PUBLIC_OPENPANEL_API_URL=
ARG PUBLIC_OPENPANEL_SCRIPT_URL=
ENV ASTRO_TELEMETRY_DISABLED=1
ENV PUBLIC_BUILD_VERSION=$BUILD_VERSION \
    PUBLIC_COMMIT_SHA=$COMMIT_SHA \
    PUBLIC_BUILT_AT=$BUILT_AT \
    PUBLIC_API_BASE_URL=$PUBLIC_API_BASE_URL \
    PUBLIC_OPENPANEL_CLIENT_ID=$PUBLIC_OPENPANEL_CLIENT_ID \
    PUBLIC_OPENPANEL_API_URL=$PUBLIC_OPENPANEL_API_URL \
    PUBLIC_OPENPANEL_SCRIPT_URL=$PUBLIC_OPENPANEL_SCRIPT_URL
COPY . .
RUN npm run build

FROM nginx:1.29-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 4321
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1:4321/health || exit 1
