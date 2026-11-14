import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

function localVercelApiPlugin() {
  return {
    name: 'local-vercel-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) {
          return next();
        }
        try {
          const parsedUrl = new URL(req.url, 'http://localhost');
          const routeName = parsedUrl.pathname.replace(/^\/api\//, '').replace(/\.js$/, '');
          if (
            routeName !== 'wix-inbox' &&
            routeName !== 'wix-oauth-check' &&
            routeName !== 'order' &&
            routeName !== 'tracking-config'
          ) {
            return next();
          }

          req.query = Object.fromEntries(parsedUrl.searchParams.entries());
          res.status = (code) => {
            res.statusCode = code;
            return res;
          };
          res.json = (payload) => {
            if (!res.headersSent) {
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
            }
            res.end(JSON.stringify(payload));
            return res;
          };

          const apiFileUrl = pathToFileURL(
            path.resolve(process.cwd(), 'api', `${routeName}.js`)
          ).href;
          const mod = await import(apiFileUrl);
          return await mod.default(req, res);
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ ok: false, error: err?.message || 'dev_api_error' }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  for (const [k, v] of Object.entries(env)) {
    if (process.env[k] === undefined) {
      process.env[k] = v;
    }
  }
  return {
    plugins: [react(), tailwindcss(), localVercelApiPlugin()],
  };
});
