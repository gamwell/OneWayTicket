import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Définit @ comme raccourci pour le dossier /src
      "@": path.resolve(__dirname, "./src"),
    },
  },
})