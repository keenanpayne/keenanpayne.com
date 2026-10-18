import netlifyReactRouter from "@netlify/vite-plugin-react-router";
import { reactRouter } from "@react-router/dev/vite";
import {
  createRunnableDevEnvironment,
  createServer,
  defineConfig,
  isRunnableDevEnvironment,
  type EnvironmentModuleNode,
  type Plugin,
  type ViteDevServer
} from "vite";

import { FORM_SUCCESS_PATH } from "./app/lib/endpoints.ts";

/** The content model, built on the server only (`import.meta.glob`) */
const CONTENT_MODULE = "/app/lib/content/content.server.ts";

/**
 * `virtual:lab-content`: the shared content every direction renders
 * (`getLabContent()`), serialized once and shipped as a module of its own.
 * It's the same on every page, so the routes leave it out of their loader
 * data, which otherwise repeats it in every pre-rendered page's hydration
 * script and `.data` file. The content module itself can only run under
 * Vite, so the plugin runs it there: on the dev server's own SSR runner,
 * and in a build on a throwaway one.
 */
function labContent(): Plugin {
  const id = "virtual:lab-content";
  const resolvedId = `\0${id}`;
  let devServer: ViteDevServer | undefined;
  let code: Promise<string> | undefined;

  type ContentModule = typeof import("./app/lib/content/content.server.ts");

  async function loadContentModule(): Promise<ContentModule> {
    if (devServer) {
      const ssr = devServer.environments.ssr;
      return isRunnableDevEnvironment(ssr)
        ? ssr.runner.import(CONTENT_MODULE)
        : (devServer.ssrLoadModule(CONTENT_MODULE) as Promise<ContentModule>);
    }
    // In a build: the way React Router loads its own config
    const server = await createServer({
      configFile: false,
      envFile: false,
      logLevel: "error",
      server: { middlewareMode: true, hmr: false, watch: null },
      optimizeDeps: { noDiscovery: true },
      environments: {
        content: {
          consumer: "server",
          dev: {
            createEnvironment: (name, config) =>
              createRunnableDevEnvironment(name, config)
          }
        }
      }
    });
    try {
      const environment = server.environments.content;
      if (!isRunnableDevEnvironment(environment)) {
        throw new Error("The lab content needs a runnable Vite environment");
      }
      return await environment.runner.import(CONTENT_MODULE);
    } finally {
      await server.close();
    }
  }

  async function serialize() {
    const { getLabContent } = await loadContentModule();
    // Parsed rather than parsed as code: quicker for an object this size
    return `export default JSON.parse(${JSON.stringify(JSON.stringify(getLabContent()))});`;
  }

  /** Whether `module` is `target`, or imports it somewhere down the line */
  function dependsOn(
    module: EnvironmentModuleNode,
    target: EnvironmentModuleNode
  ) {
    const seen = new Set<EnvironmentModuleNode>();
    const queue = [module];
    for (const next of queue) {
      if (next === target) return true;
      if (seen.has(next)) continue;
      seen.add(next);
      queue.push(...next.importedModules);
    }
    return false;
  }

  return {
    name: "lab-content",
    resolveId: (source) => (source === id ? resolvedId : undefined),
    load(moduleId) {
      if (moduleId !== resolvedId) return;
      code ??= serialize().catch((error: unknown) => {
        code = undefined;
        throw error;
      });
      return code;
    },
    configureServer(server) {
      devServer = server;
    },
    // In development, the module follows the content: a change to anything
    // the content model is built from (`content/`, `app/data/`, the
    // pipeline) rebuilds it, and the page reloads to show it
    hotUpdate({ modules, server }) {
      if (this.environment.name !== "ssr") return;
      const graph = this.environment.moduleGraph;
      const content = graph.getModulesByFile(
        `${server.config.root}${CONTENT_MODULE}`
      );
      if (!content?.size) return;
      const changed = [...content].some((module) =>
        modules.some((changed) => dependsOn(module, changed))
      );
      if (!changed) return;

      code = undefined;
      for (const environment of Object.values(server.environments)) {
        const module = environment.moduleGraph.getModuleById(resolvedId);
        if (module) environment.moduleGraph.invalidateModule(module);
      }
      server.hot.send({ type: "full-reload", path: "*" });
    }
  };
}

export default defineConfig({
  plugins: [
    labContent(),
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
