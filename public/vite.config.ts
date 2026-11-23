// Vite and TanStack Start configuration for DigiSay platform
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // This app lives in the repository's root `public/` directory. Keep its Vite-served
  // static files in `public/static/` to distinguish them from the application folder.
  publicDir: "static",
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR wrapper).
    server: { entry: "server" },
  },
});
