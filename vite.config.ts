import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const buildTime = Date.now().toString();

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'inject-build-version',
      transformIndexHtml(html: string) {
        return html.replace('__BUILD_VERSION__', buildTime);
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['lucide-react', 'sonner'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  server: {
    hmr: {
      protocol: 'ws',
      host: 'localhost',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})