import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Base URL is critical for itch.io / crazygames (they often host in subdirectories)
  base: './', 

  build: {
    // Output directory
    outDir: 'dist',
    
    // Clear old builds
    emptyOutDir: true,

    // Optimization settings
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs for production
        drop_debugger: true,
      },
      format: {
        comments: false, // Remove comments to save space and protect logic
      },
    },

    // Asset handling
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        // Consistent naming for cache busting
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },

  server: {
    // Dev server settings
    open: true,
    port: 3000,
  }
});
