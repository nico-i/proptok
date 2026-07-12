import { copyFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const rootDir = dirname(fileURLToPath(import.meta.url));

// GitHub Pages serves 404.html for unknown paths. Mirroring index.html into it
// makes a cold, hard navigation to any SPA route load the app (before the
// service worker's navigateFallback is even installed).
function spaFallback(): Plugin {
  return {
    name: "spa-404-fallback",
    apply: "build",
    closeBundle() {
      const out = resolve(rootDir, "dist");
      copyFileSync(resolve(out, "index.html"), resolve(out, "404.html"));
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    spaFallback(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/apple-touch-icon.png"],
      manifest: {
        name: "PropTok",
        short_name: "PropTok",
        description: "A prop camera app for film sets.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#0a0a0d",
        theme_color: "#0a0a0d",
        icons: [
          { src: "icons/pwa-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/pwa-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "icons/pwa-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Serve the SPA shell for any navigation (cold/offline launch of / or
        // any route) instead of 404ing. Core to the "opens into the app even
        // offline on set" requirement.
        navigateFallback: "index.html",
        // Never intercept real asset/API requests as navigations.
        navigateFallbackDenylist: [/^\/api/, /\.[^/]+$/],
      },
      devOptions: {
        // Let the service worker + install prompt be tested with `vite dev`.
        enabled: true,
      },
    }),
  ],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
  },
});
