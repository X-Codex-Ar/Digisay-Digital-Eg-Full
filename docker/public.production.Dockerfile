FROM node:22.22.3-bookworm-slim AS build
RUN corepack enable && corepack prepare pnpm@12.14.0 --activate
WORKDIR /app/public

COPY public/package.json public/pnpm-lock.yaml public/pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-public-production,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile
COPY public/ ./
RUN pnpm build

FROM node:22.22.3-bookworm-slim AS runtime
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=8080 \
    NITRO_HOST=0.0.0.0 \
    NITRO_PORT=8080
WORKDIR /app
COPY --from=build --chown=node:node /app/public/.output ./.output
USER node
EXPOSE 8080
CMD ["node", ".output/server/index.mjs"]
