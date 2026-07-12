import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Build stamp used for cache-busting and build metadata.
// Declared here (before first use in the `define` block) to resolve
// the production build ReferenceError: "buildStamp is not defined".
const buildStamp = process.env.BUILD_STAMP ?? new Date().toISOString()

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src') } },
  define: {
    __BUILD_STAMP__: JSON.stringify(buildStamp) } })