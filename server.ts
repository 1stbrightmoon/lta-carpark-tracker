import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import healthHandler from './api/health.ts';
import carparkAvailabilityHandler from './api/carparkavailability.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// API endpoints mounted directly from the /api folder
app.all('/api/health', (req, res) => healthHandler(req, res));
app.all('/api/carparkavailability', (req, res) => carparkAvailabilityHandler(req, res));

// In development, mount Vite's connect middleware; in production, serve static files
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
} else {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`ParkSG server running on port ${PORT}`);
});
