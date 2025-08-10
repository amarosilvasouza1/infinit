@echo off
echo.
echo ========================================
echo          🚀 INFINIT - QUICK DEPLOY
echo ========================================
echo.
echo Este script te ajuda a colocar o site online
echo para seus amigos acessarem de qualquer lugar!
echo.
echo ========================================
echo          📋 OPCOES DISPONIVEIS
echo ========================================
echo.
echo 1. 🌐 VERCEL (RECOMENDADO - GRATIS)
echo    - Site online em 2 minutos
echo    - Funciona de qualquer lugar do mundo
echo    - URL como: infinit-seunome.vercel.app
echo.
echo 2. 🏠 SERVIDOR LOCAL (SÓ REDE LOCAL)
echo    - Para amigos na mesma rede
echo    - Precisa configurar roteador
echo.
echo ========================================
echo.
choice /c 12 /m "Escolha uma opcao"

if errorlevel 2 goto local
if errorlevel 1 goto vercel

:vercel
echo.
echo 🚀 DEPLOY VERCEL - PASSOS:
echo.
echo 1. Abra: https://vercel.com
echo 2. Faca login com GitHub
echo 3. Clique "New Project"
echo 4. Selecione o repositorio "infinit"
echo 5. Clique "Deploy"
echo.
echo ✅ Pronto! Em 2 minutos seus amigos poderao acessar!
echo.
echo 📤 Compartilhe o link que a Vercel criar com seus amigos
echo.
pause
goto end

:local
echo.
echo 🏠 SERVIDOR LOCAL - INICIANDO...
echo.
echo ⚠️  AVISO: Funciona apenas para amigos na mesma rede Wi-Fi
echo.
echo 🔧 Para internet global, use a Vercel (opcao 1)
echo.
call npm run build
echo.
echo 🌐 Iniciando servidor...
call npm start
goto end

:end
echo.
echo ========================================
echo     ✅ PROCESSO CONCLUIDO!
echo ========================================
echo.
echo 📱 Seus amigos podem acessar via:
echo    - Celular (Android/iOS)
echo    - Computador
echo    - Tablet
echo.
echo 🎮 Funcionalidades disponiveis:
echo    - Chat completo
echo    - Sistema de amigos  
echo    - Grupos
echo    - Stories
echo    - E muito mais!
echo.
pause
