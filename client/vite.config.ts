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

const GIT_COMMIT = process.env.GIT_COMMIT || currentCommit()

// Empty when git or the repository is unavailable (e.g. inside a Docker build)
function currentCommit() {
  if (process.env.NODE_ENV !== 'production') {
    return ''
  }
  try {
    return execSync('git rev-parse HEAD', { cwd: '..', stdio: 'pipe' })
      .toString()
      .trim()
  } catch {
    return ''
  }
}

export default defineConfig({
  plugins: [react()],
  build: {
    // Mermaid's parser chunk (~660 kB) is lazy-loaded only for notes with diagrams.
    chunkSizeWarningLimit: 800,
  },
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
