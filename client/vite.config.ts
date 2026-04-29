import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import { execSync } from 'child_process'

// read the config file
const CONFIG_FILE_PATH = '../config.json'
const config = JSON.parse(fs.readFileSync(CONFIG_FILE_PATH, 'utf8'))

// In production, use empty string (same origin). In dev, use config file.
const apiServerUrl =
  process.env.NODE_ENV === 'production' ? '' : config.apiServerUrl

// Get version from root package.json
const rootPackage = JSON.parse(fs.readFileSync('../package.json', 'utf8'))
const APP_VERSION = rootPackage.version

// Get current git commit hash
const GIT_COMMIT =
  process.env.GIT_COMMIT ||
  (process.env.NODE_ENV === 'production'
    ? execSync('git rev-parse HEAD', { cwd: '..' }).toString().trim()
    : '')

export default defineConfig({
  plugins: [react()],
  define: {
    API_SERVER_URL: JSON.stringify(apiServerUrl),
    APP_VERSION: JSON.stringify(APP_VERSION),
    GIT_COMMIT: JSON.stringify(GIT_COMMIT),
  },
  server: {
    proxy: {
      '/media': {
        target: config.apiServerUrl,
        changeOrigin: true,
      },
    },
  },
})
