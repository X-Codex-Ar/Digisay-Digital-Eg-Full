FROM node:22.22.3-bookworm-slim
RUN corepack enable && corepack prepare pnpm@12.14.0 --activate
WORKDIR /app/dashboard

COPY dashboard/package.json dashboard/pnpm-lock.yaml dashboard/pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-dashboard,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile
COPY dashboard/ ./

EXPOSE 4200
CMD ["pnpm", "exec", "ng", "serve", "--host", "0.0.0.0", "--port", "4200", "--poll", "2000"]
