/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração para servidor local com controle total
  
  // Headers para permitir acesso dos amigos via ngrok
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

  // Variáveis de ambiente para dados locais
  env: {
    LOCAL_DATA_PATH: './src/data',
    DATABASE_PATH: './database.json',
    STORAGE_TYPE: 'local'
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
  compress: true
}

module.exports = nextConfig
