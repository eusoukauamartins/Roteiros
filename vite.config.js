import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Porta 3005 para rodar em paralelo ao original (que usa 3000)
// Para mudar, edite o número abaixo ou use: npm run dev -- --port XXXX
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3005,
    open: true
  }
})
