import { defineConfig } from "vite";

// The whole game is one page, so there is no multi-entry configuration and no routing.
// `dist/` is a plain static directory, which is what NFR-06 commits to: no server, no backend.
export default defineConfig({
  root: ".",
  // Relative asset paths instead of the default "/". GitHub Pages serves a project site from a
  // subdirectory, https://<user>.github.io/ludo-advanced/, where an absolute "/assets/..." asks the
  // domain root and gets a 404. Relative paths also work when the build is opened as a plain file,
  // which is the fallback for playing on a machine without a toolchain. Hardcoding "/ludo-advanced/"
  // instead would tie the build to one repository name.
  base: "./",
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
