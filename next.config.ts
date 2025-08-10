import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  eslint: {
    // Ignorar erros ESLint durante build para deploy
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignorar erros TypeScript durante build para deploy
    ignoreBuildErrors: true,
  },
}

export default nextConfig
