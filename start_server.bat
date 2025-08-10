@echo off
echo 🚀 Iniciando servidor Infinit...
echo.
echo Construindo projeto para producao...
call npm run build
echo.
echo ✅ Build concluido!
echo.
echo Iniciando servidor na porta 3000...
echo.
echo 🌐 Servidor rodando em:
echo   Local:    http://localhost:3000
echo   Network:  http://192.168.1.X:3000
echo.
echo Para parar o servidor, pressione Ctrl+C
echo.
call npm start
