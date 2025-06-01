import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3998,
    open: true,
    host: '0.0.0.0' // Allow external connections for VPS deployment
  },
  preview: {
    port: 3998,
    host: '0.0.0.0', // Allow external connections for VPS deployment
    strictPort: true,
    allowedHosts: [
      'deployer.desu0g.xyz',
      'localhost',
      '127.0.0.1'
    ]
  }
}) 