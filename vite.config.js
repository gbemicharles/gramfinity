import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const dynamicTonConnectManifestPlugin = () => ({
  name: 'dynamic-tonconnect-manifest',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url === '/tonconnect-manifest.json') {
        const protocol = req.headers['x-forwarded-proto'] || 'http';
        const host = req.headers.host;
        const origin = `${protocol}://${host}`;
        
        const manifest = {
          url: origin,
          name: "Gramfinity Terminal",
          iconUrl: "https://raw.githubusercontent.com/ton-community/tutorials/main/01-wallet/logo.png"
        };
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end(JSON.stringify(manifest, null, 2));
        return;
      }
      next();
    });
  }
});

export default defineConfig({
  plugins: [react(), dynamicTonConnectManifestPlugin()],
  server: {
    port: 3000,
    open: true
  }
});
