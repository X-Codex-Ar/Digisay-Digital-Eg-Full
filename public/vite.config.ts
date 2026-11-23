// Vite and TanStack Start configuration for DigiSay platform
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function serveStaticPlugin() {
  const staticDir = path.resolve(__dirname, "static");
  return {
    name: "digisay-serve-static",
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (!req.url) return next();
        const rawUrl = req.url.split("?")[0] || "";
        const cleanPath = rawUrl.replace(/^\/+/, "");
        if (!cleanPath) return next();

        const filePath = path.join(staticDir, cleanPath);
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          const ext = path.extname(filePath).toLowerCase();
          const mimeTypes: Record<string, string> = {
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".webp": "image/webp",
            ".svg": "image/svg+xml",
            ".ico": "image/x-icon",
            ".txt": "text/plain",
            ".mp4": "video/mp4",
            ".pdf": "application/pdf",
            ".css": "text/css",
            ".js": "application/javascript",
          };
          res.setHeader("Content-Type", mimeTypes[ext] || "application/octet-stream");
          res.setHeader("Cache-Control", "no-cache");
          return fs.createReadStream(filePath).pipe(res);
        }
        next();
      });
    },
    closeBundle() {
      const outputDir = path.resolve(__dirname, ".output/public");
      if (fs.existsSync(outputDir) && fs.existsSync(staticDir)) {
        fs.cpSync(staticDir, outputDir, { recursive: true, force: true });
      }
    },
  };
}

export default defineConfig({
  publicDir: "static",
  plugins: [serveStaticPlugin()],
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR wrapper).
    server: { entry: "server" },
  },
});
