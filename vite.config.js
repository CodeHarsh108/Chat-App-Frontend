import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'





// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  darkMode: 'class', // Enable dark mode support
  
  //  IMPORTANT: Base URL for production
  base: '/',
  
  // Build configuration
  build: {
    // Output directory (default is 'dist')
    outDir: 'dist',
    
    // Generate sourcemaps only in development
    sourcemap: process.env.NODE_ENV !== 'production',
    
    // Minify for production
    minify: 'terser',
    
    // Terser options for better minification
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true
      }
    },
    
    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        // Split vendor chunks
        manualChunks: {
          // React core libraries
          vendor: ['react', 'react-dom', 'react-router-dom'],
          
          // WebSocket libraries
          websocket: ['@stomp/stompjs', 'sockjs-client'],
          
          // Icons and UI
          icons: ['react-icons'],
          
          // HTTP client
          http: ['axios']
        },
        
        // Cache busting with content hash
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    },
    
    // Limit chunk size warning
    chunkSizeWarningLimit: 1000
  },
  
  // Development server configuration
  server: {
    port: 5173,
    host: true, // Listen on all addresses
    open: true, // Open browser automatically
    
    // Proxy API requests in development
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      },
      '/chat': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        ws: true // WebSocket proxy
      }
    }
  },
  
  // Preview configuration (for testing build locally)
  preview: {
    port: 4173,
    host: true,
    open: true
  }
})