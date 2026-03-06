import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // GitHub Pages serves from /kicad-guide/ subdirectory
  base: '/kicad-guide/',

  build: {
    // Raise chunk size warning limit (default 500kb is too aggressive for this app)
    chunkSizeWarningLimit: 800,

    rollupOptions: {
      output: {
        // Split vendor code for better caching
        manualChunks: {
          react: ['react', 'react-dom'],
        },
        // Deterministic filenames with content hash for cache busting
        assetFileNames:  'assets/[name]-[hash][extname]',
        chunkFileNames:  'assets/[name]-[hash].js',
        entryFileNames:  'assets/[name]-[hash].js',
      },
    },

    // Generate source maps for production (helps with debugging)
    sourcemap: false,

    // Target modern browsers — smaller output, no legacy polyfills
    target: 'es2020',

    // Minify with esbuild (default, fastest)
    minify: 'esbuild',
  },

  // Ensure consistent asset handling
  assetsInclude: ['**/*.svg', '**/*.png', '**/*.webp'],
})