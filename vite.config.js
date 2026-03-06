import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Replace 'kicad-guide' with your exact GitHub repository name
export default defineConfig({
  plugins: [react()],
  base: '/kicad-guide/',
  server: {
    host: true,
    port: 5173,
  },
})