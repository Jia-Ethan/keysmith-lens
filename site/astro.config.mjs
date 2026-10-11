import { defineConfig } from "astro/config";

// SITE_URL / BASE_PATH let the same build serve a custom domain or a
// GitHub Pages project path (e.g. BASE_PATH=/keysmith-switch-site).
export default defineConfig({
  site: process.env.SITE_URL || "https://jia-ethan.github.io",
  base: process.env.BASE_PATH || "/",
  trailingSlash: "always",
  build: { format: "directory", inlineStylesheets: "auto" },
  i18n: {
    locales: ["zh", "en"],
    defaultLocale: "zh",
    routing: { prefixDefaultLocale: false },
  },
  markdown: {
    syntaxHighlight: false,
  },
  devToolbar: { enabled: false },
});
