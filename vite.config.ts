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
            manualChunks: {
              'editor-core': ['@tiptap/react', '@tiptap/starter-kit', 'tiptap-markdown'],
              'ai-engine': ['@google/genai', 'voy-search', 'minisearch'],
              'ui-framework': ['motion', 'lucide-react', 'recharts']
            }
          }
        }
      },
      optimizeDeps: {
        include: ['lucide-react', 'react', 'react-dom', 'react-markdown', '@google/genai']
      }
    };
});
