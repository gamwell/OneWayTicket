import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // --- OPTIMISATION DU BUNDLING ---
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Sépare les grosses librairies dans des fichiers distincts
          if (id.includes('node_modules')) {
            if (id.includes('@supabase')) return 'vendor-supabase';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('jspdf') || id.includes('html2canvas')) return 'vendor-pdf';
            if (id.includes('stripe')) return 'vendor-stripe';
            return 'vendor'; // Reste des librairies
          }
        },
      },
    },
    chunkSizeWarningLimit: 600, // Augmente la limite d'alerte à 600kb
  },
})