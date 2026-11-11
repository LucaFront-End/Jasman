import { defineConfig } from 'vite';
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
          if (routeName !== 'wix-inbox' && routeName !== 'wix-oauth-check') {
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

          const mod = await import(`./api/${routeName}.js`);
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

export default defineConfig({
  plugins: [react(), tailwindcss(), localVercelApiPlugin()],
});
