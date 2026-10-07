import netlifyReactRouter from "@netlify/vite-plugin-react-router";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    reactRouter(),
    netlifyReactRouter({
      // Netlify Forms posts here; keep it on the static/forms handler
      excludedPaths: ["/form-submission-success", "/form-submission-success/"]
    })
  ],
  server: {
    port: 4242
  }
});
