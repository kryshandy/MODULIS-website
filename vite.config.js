import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import fs from 'node:fs/promises'

const root = process.cwd()
const contentFilePath = resolve(root, 'src/data/site-content.json')

function adminApiPlugin() {
  return {
    name: 'admin-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ? req.url.split('?')[0] : ''

        // 1. Redirection / Réécriture /admin -> /admin/
        if (url === '/admin') {
          req.url = '/admin/'
          next()
          return
        }

        // 2. GET /api/content
        if (req.method === 'GET' && url === '/api/content') {
          try {
            const data = await fs.readFile(contentFilePath, 'utf-8')
            res.setHeader('Content-Type', 'application/json')
            res.setHeader('Cache-Control', 'no-cache')
            res.statusCode = 200
            res.end(data)
          } catch (err) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Impossible de lire le fichier de contenu: ' + err.message }))
          }
          return
        }

        // 3. POST /api/save-content
        if (req.method === 'POST' && url === '/api/save-content') {
          let body = ''
          req.on('data', (chunk) => {
            body += chunk
          })
          req.on('end', async () => {
            try {
              const parsed = JSON.parse(body)
              const formatted = JSON.stringify(parsed, null, 2)
              await fs.writeFile(contentFilePath, formatted, 'utf-8')

              res.setHeader('Content-Type', 'application/json')
              res.statusCode = 200
              res.end(JSON.stringify({ success: true, message: 'Données sauvegardées avec succès.' }))
            } catch (err) {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Erreur lors de la sauvegarde: ' + err.message }))
            }
          })
          return
        }

        // 4. GET /api/health
        if (req.method === 'GET' && url === '/api/health') {
          res.setHeader('Content-Type', 'application/json')
          res.statusCode = 200
          res.end(JSON.stringify({ status: 'ok', mode: 'local-flat-file' }))
          return
        }

        next()
      })
    }
  }
}

export default defineConfig({
  base: '/',
  plugins: [adminApiPlugin()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        admin: resolve(root, 'admin/index.html'),
        kavala: resolve(root, 'case-kavala.html'),
        nova: resolve(root, 'case-nova.html'),
        orbis: resolve(root, 'case-orbis.html'),
        pulse: resolve(root, 'case-pulse.html')
      }
    }
  }
})
