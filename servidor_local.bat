@echo off
cls
echo.
echo ========================================
echo    🏠 INFINIT - SERVIDOR LOCAL
echo ========================================
echo.
echo ✅ CONTROLE TOTAL DOS DADOS NO SEU PC
echo ✅ TODOS OS DADOS SALVOS LOCALMENTE
echo ✅ AMIGOS ACESSAM VIA LINK GLOBAL
echo.
echo ========================================

echo.
echo 📋 Verificando dependencias...

echo.
echo 🔧 Instalando ngrok para expor servidor...
call npm install -g ngrok
if errorlevel 1 (
    echo ❌ Erro ao instalar ngrok - tentando continuar...
)

echo.
echo 🏗️  Construindo projeto para producao...
call npm run build
if errorlevel 1 (
    echo ❌ Erro no build
    pause
    exit /b 1
)

echo.
echo 🗄️  Verificando banco de dados local...
if not exist "database.json" (
    echo 📝 Criando banco de dados inicial...
    echo {"users":[{"id":"1","name":"Usuario Teste","username":"teste","email":"teste@infinit.com","password":"123456","bio":"Usuario de teste","location":"","website":"","birthDate":"","avatar":"","banner":"","createdAt":"2025-01-01T00:00:00.000Z","achievements":[],"stats":{"messages":0,"friends":0,"groups":0}}]} > database.json
)

if not exist "src\data\friends.json" (
    echo 👥 Criando sistema de amigos...
    echo {"friends":[],"sentRequests":[],"receivedRequests":[]} > src\data\friends.json
)

if not exist "src\data\chats.json" (
    echo 💬 Criando sistema de chat...
    echo {"chats":[],"lastUpdated":""} > src\data\chats.json
)

echo.
echo 🚀 Iniciando servidor na porta 3000...
start /MIN cmd /c "npm start"

echo.
echo ⏳ Aguardando servidor inicializar...
timeout /t 5 > nul

echo.
echo 🌐 Expondo servidor para internet com ngrok...
echo.
echo ========================================
echo          📱 LINK PARA AMIGOS
echo ========================================
echo.
echo ⚠️  MANTENHA ESTA JANELA ABERTA!
echo.
echo � O link global aparecera abaixo:
echo    Compartilhe este link com seus amigos
echo.
echo 💾 Dados salvos em:
echo    - database.json (usuarios)
echo    - src\data\friends.json (amigos)
echo    - src\data\chats.json (conversas)
echo.
echo ========================================
echo.

ngrok http 3000

echo.
echo ⚠️  Servidor parado!
echo 💾 Todos os dados foram salvos no seu PC
pause
