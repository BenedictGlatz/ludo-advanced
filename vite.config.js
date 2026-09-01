import { defineConfig } from "vite";

// The whole game is one page, so there is no multi-entry configuration and no routing.
// `dist/` is a plain static directory, which is what NFR-06 commits to: no server, no backend.
export default defineConfig({
  root: ".",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    // Named so that a failing 300-line check is never blamed on a bundler artefact.
    sourcemap: true,
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
});
