@echo off
title INFINIT - SERVIDOR LOCAL SIMPLES
cls

echo.
echo ==========================================
echo        INFINIT - SERVIDOR LOCAL
echo ==========================================
echo.

REM Verificar Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Node.js nao instalado!
    echo Baixe e instale: https://nodejs.org
    pause
    exit /b 1
)

echo ✓ Node.js OK

REM Instalar dependencias se necessario
if not exist "node_modules" (
    echo.
    echo Instalando dependencias...
    npm install
    if errorlevel 1 (
        echo ERRO na instalacao
        pause
        exit /b 1
    )
)

echo ✓ Dependencias OK

REM Build se necessario  
if not exist ".next" (
    echo.
    echo Fazendo build...
    npm run build
    if errorlevel 1 (
        echo ERRO no build
        pause
        exit /b 1
    )
)

echo ✓ Build OK

REM Criar dados
if not exist "database.json" (
    echo {"users":[{"id":"1","name":"Admin","username":"admin","email":"admin@infinit.com","password":"123456","bio":"Admin","avatar":"","createdAt":"2025-01-01T00:00:00.000Z","achievements":[],"stats":{"messages":0,"friends":0,"groups":0}}]} > database.json
)

if not exist "src\data" mkdir "src\data"
if not exist "src\data\friends.json" (
    echo {"friends":[],"sentRequests":[],"receivedRequests":[]} > src\data\friends.json
)
if not exist "src\data\chats.json" (
    echo {"chats":[],"lastUpdated":""} > src\data\chats.json
)

echo ✓ Dados OK

echo.
echo ==========================================
echo         INICIANDO SERVIDOR
echo ==========================================
echo.

REM Limpar porta 3000
taskkill /F /IM node.exe >nul 2>&1

echo 1. Iniciando Next.js na porta 3000...
start /MIN cmd /c "npm start"

echo 2. Aguardando servidor subir...
ping localhost -n 10 >nul

echo 3. Verificando se servidor subiu...
netstat -an | find "3000" >nul
if errorlevel 1 (
    echo ❌ ERRO: Servidor nao subiu
    echo Tente executar: npm start
    pause
    exit /b 1
)

echo ✓ Servidor funcionando!

echo.
echo ==========================================
echo         SERVIDOR FUNCIONANDO!
echo ==========================================
echo.
echo 🎯 ACESSO LOCAL:
echo    http://localhost:3000
echo.
echo 📱 PARA TESTAR:
echo    1. Abra seu navegador
echo    2. Va para: http://localhost:3000
echo    3. Crie uma conta e teste
echo.
echo ⚠️  PARA AMIGOS ACESSAREM:
echo    Precisa configurar ngrok (veja CONFIGURAR_NGROK.txt)
echo.
echo 💾 DADOS SALVOS EM:
echo    - database.json (usuarios)
echo    - src\data\friends.json (amigos)  
echo    - src\data\chats.json (conversas)
echo.
echo ⚠️  MANTENHA ESTA JANELA ABERTA!
echo    Para parar: Ctrl+C
echo.
echo ==========================================

REM Abrir no navegador automaticamente
timeout /t 3 > nul
start http://localhost:3000

echo.
echo Servidor rodando...
echo Pressione Ctrl+C para parar
echo.

REM Manter janela aberta
:loop
timeout /t 30 > nul
netstat -an | find "3000" >nul
if errorlevel 1 (
    echo ❌ Servidor parou inesperadamente
    pause
    exit /b 1
)
echo ✓ Servidor ainda rodando... [%time%]
goto loop
