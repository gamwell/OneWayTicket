import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  base: '/',
  plugins: [react()],
  
  // --- CONFIGURATION DU SERVEUR (Solution à ERR_CONNECTION_REFUSED) ---
  server: {
    port: 5173,      // Force le port 5173
    strictPort: true, // Si le port 5173 est pris, Vite s'arrête au lieu de passer à 5174
    host: true       // Permet l'accès via l'IP locale si besoin
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@supabase')) return 'vendor-supabase';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('jspdf') || id.includes('html2canvas')) return 'vendor-pdf';
            if (id.includes('stripe')) return 'vendor-stripe';
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})