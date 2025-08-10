/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração para servidor local com dados no PC
  output: 'standalone',
  
  // Permitir acesso externo via ngrok
  experimental: {
    serverComponentsExternalPackages: []
  },
  
  // Headers para permitir acesso dos amigos
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization'
          }
        ]
      }
    ]
  },

  // Configurações para desenvolvimento
  env: {
    LOCAL_DATA_PATH: './src/data',
    DATABASE_PATH: './database.json'
  },

  // Ignorar avisos para build limpo
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Otimizações para servidor local
  poweredByHeader: false,
  compress: true,
  
  // Configurar para aceitar conexões externas
  experimental: {
    allowMiddlewareResponseBody: true
  }
}

module.exports = nextConfig
