import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // GitHub Pagesはリポジトリ名のサブパス配下（https://<user>.github.io/<repo>/）で配信されるため、
  // 相対パスにしてどのサブパスにデプロイしても動作するようにする
  base: './',
  plugins: [react()],
})
