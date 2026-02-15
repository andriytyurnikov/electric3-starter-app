import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import path from "node:path";
import httpProxy from "http-proxy";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Custom Vite plugin that proxies Electric WebSocket connections to Jetty.
// Vite's own HMR WebSocket uses `Sec-WebSocket-Protocol: vite-hmr` — we
// leave those alone and forward everything else to the Clojure backend.
function electricWsProxy() {
  const proxy = httpProxy.createProxyServer({
    target: "ws://localhost:8080",
    ws: true,
  });

  proxy.on("error", (err, _req, res) => {
    console.error("[electric-ws-proxy] error:", err.message);
    if (res && res.writeHead) {
      res.writeHead(502);
      res.end("Electric backend unavailable");
    }
  });

  return {
    name: "electric-ws-proxy",
    configureServer(server) {
      server.httpServer.on("upgrade", (req, socket, head) => {
        // Vite's own HMR WebSocket identifies itself with this protocol.
        // Let Vite handle it natively — proxy everything else to Jetty.
        if (req.headers["sec-websocket-protocol"] === "vite-hmr") {
          return; // handled by Vite
        }
        proxy.ws(req, socket, head);
      });
    },
  };
}

export default defineConfig({
  root: "resources/public/electric_starter_app",
  publicDir: false,

  server: {
    port: 5173,
    strictPort: true,
    fs: {
      allow: [path.resolve(__dirname, "resources/public")],
    },
  },

  plugins: [
    // Rewrite /electric_starter_app/* requests to /* since Vite's root
    // is already resources/public/electric_starter_app/. shadow-cljs uses
    // absolute paths like /electric_starter_app/js/cljs-runtime/foo.js
    // which don't resolve within Vite's root without this rewrite.
    {
      name: "rewrite-electric-base-path",
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (req.url.startsWith("/electric_starter_app/")) {
            req.url = req.url.slice("/electric_starter_app".length);
          }
          next();
        });
      },
    },
    electricWsProxy(),
  ],
});
