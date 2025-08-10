@echo off
echo.
echo ========================================
echo    🏠 SERVIDOR LOCAL COM DADOS NO PC
echo ========================================
echo.
echo Este script configura o servidor para manter
echo todos os dados no seu computador
echo.
echo ⚠️  SEU PC PRECISA FICAR LIGADO para amigos acessarem
echo.
echo ========================================

echo.
echo 🔧 Instalando ngrok (para expor servidor)...
npm install -g ngrok

echo.
echo 🏗️  Fazendo build do projeto...
call npm run build

echo.
echo 🚀 Iniciando servidor local...
start /B npm start

timeout /t 3

echo.
echo 🌐 Expondo servidor para internet...
echo.
echo ⚠️  MANTENHA ESTA JANELA ABERTA!
echo.
echo 📤 O link para seus amigos aparecerá abaixo:
echo.
ngrok http 3000
