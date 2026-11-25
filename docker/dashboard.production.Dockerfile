FROM node:22.22.3-bookworm-slim AS build
RUN corepack enable && corepack prepare pnpm@12.14.0 --activate
WORKDIR /app/dashboard

COPY dashboard/package.json dashboard/pnpm-lock.yaml dashboard/pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-dashboard-production,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile
COPY dashboard/ ./
RUN pnpm build

FROM nginx:1.27-alpine AS runtime
COPY docker/nginx-dashboard.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dashboard/dist/digisay-dashboard/browser/ /usr/share/nginx/html/
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
