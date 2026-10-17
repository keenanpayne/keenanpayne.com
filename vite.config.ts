import netlifyReactRouter from "@netlify/vite-plugin-react-router";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

import { FORM_SUCCESS_PATH } from "./app/lib/endpoints.ts";

export default defineConfig({
  plugins: [
    reactRouter(),
    netlifyReactRouter({
      // Netlify Forms posts here; keep it on the static/forms handler
      excludedPaths: [FORM_SUCCESS_PATH, `${FORM_SUCCESS_PATH}/`]
    })
  ],
  server: {
    port: 4242
  }
});
