import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  server: {
    // Same-origin `/api` in dev so `credentials: 'include'` can use cookies on the Vite host
    // (backend must set cookie Path=/ and compatible SameSite).
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        // Help the browser keep JSESSIONID on the Vite origin (localhost:5173) when Spring
        // sends Path=/api or a concrete host in Set-Cookie.
        cookieDomainRewrite: '',
        cookiePathRewrite: '/',
      },
    },
  },
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
