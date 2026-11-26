FROM node:22.22.3-bookworm-slim
RUN corepack enable && corepack prepare pnpm@12.14.0 --activate
WORKDIR /app/public

COPY public/package.json public/pnpm-lock.yaml public/pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-public,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile
COPY public/ ./

ENV VITE_DIGISAY_API_BASE_URL=http://localhost:5080
ENV VITE_PUBLIC_AI_ASSISTANT_ENABLED=false
EXPOSE 8080
CMD ["pnpm", "dev", "--host", "0.0.0.0", "--port", "8080"]
