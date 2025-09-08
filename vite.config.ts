import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // SW atualiza sozinho
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: 'Radar Ultrassom — ESP32',
        short_name: 'Radar ESP32',
        start_url: '/',
        display: 'standalone',
        background_color: '#0b1220',
        theme_color: '#0f172a',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      // IMPORTANTE: não cachear o /stream (SSE)
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /\/stream$/i, // seu endpoint SSE
            handler: 'NetworkOnly', // nunca use cache
            method: 'GET',
          },
        ],
        navigateFallbackDenylist: [/\/stream$/i],
      },
    }),
  ],
});
