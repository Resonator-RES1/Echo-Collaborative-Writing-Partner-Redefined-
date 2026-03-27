import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        tailwindcss(),
        wasm(),
        topLevelAwait()
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (id.includes('node_modules')) {
                if (id.includes('@tiptap') || id.includes('prosemirror')) {
                  return 'vendor-editor';
                }
                if (id.includes('lucide-react')) {
                  return 'vendor-icons';
                }
                if (id.includes('recharts')) {
                  return 'vendor-charts';
                }
                if (id.includes('@google/genai') || id.includes('voy-search') || id.includes('minisearch')) {
                  return 'vendor-ai';
                }
                if (id.includes('motion')) {
                  return 'vendor-motion';
                }
                if (id.includes('react/') || id.includes('react-dom/')) {
                  return 'vendor-react';
                }
                return 'vendor-core'; // Fallback
              }
            }
          }
        }
      },
      optimizeDeps: {
        include: ['lucide-react', 'react', 'react-dom', 'react-markdown', '@google/genai']
      }
    };
});
