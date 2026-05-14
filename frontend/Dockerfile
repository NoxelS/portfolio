FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS build
ENV ASTRO_TELEMETRY_DISABLED=1
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
ARG BUILD_VERSION=development
ARG COMMIT_SHA=development
ARG BUILT_AT=development
ARG PUBLIC_OPENPANEL_CLIENT_ID=
ARG PUBLIC_OPENPANEL_API_URL=
ARG PUBLIC_OPENPANEL_SCRIPT_URL=
WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=4321 \
    ASTRO_TELEMETRY_DISABLED=1 \
    PUBLIC_BUILD_VERSION=$BUILD_VERSION \
    PUBLIC_COMMIT_SHA=$COMMIT_SHA \
    PUBLIC_BUILT_AT=$BUILT_AT \
    PUBLIC_OPENPANEL_CLIENT_ID=$PUBLIC_OPENPANEL_CLIENT_ID \
    PUBLIC_OPENPANEL_API_URL=$PUBLIC_OPENPANEL_API_URL \
    PUBLIC_OPENPANEL_SCRIPT_URL=$PUBLIC_OPENPANEL_SCRIPT_URL
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY server.mjs ./server.mjs
EXPOSE 4321
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 CMD node -e "fetch('http://127.0.0.1:4321/health').then((r)=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "./server.mjs"]
