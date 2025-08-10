#!/bin/bash
echo "🚀 Iniciando servidor Infinit..."
echo
echo "Construindo projeto para produção..."
npm run build
echo
echo "✅ Build concluído!"
echo
echo "Iniciando servidor na porta 3000..."
echo
echo "🌐 Servidor rodando em:"
echo "  Local:    http://localhost:3000"
echo "  Network:  http://$(hostname -I | awk '{print $1}'):3000"
echo
echo "Para parar o servidor, pressione Ctrl+C"
echo
npm start
