@echo off
title INFINIT - Teste Completo
cls

echo.
echo TESTE COMPLETO DO INFINIT
echo ========================================
echo.

echo 1. Testando Node.js...
node --version
if errorlevel 1 (
    echo ERRO: Node.js nao encontrado!
    echo Instale o Node.js primeiro
    pause
    exit /b 1
)

echo.
echo 2. Testando npm...
npm --version
if errorlevel 1 (
    echo ERRO: npm nao encontrado!
    pause
    exit /b 1
)

echo.
echo 3. Verificando dependencias...
if not exist "node_modules" (
    echo Instalando dependencias...
    npm install
    if errorlevel 1 (
        echo ERRO na instalacao
        pause
        exit /b 1
    )
) else (
    echo ✓ node_modules OK
)

echo.
echo 4. Verificando build...
if not exist ".next" (
    echo Fazendo build...
    npm run build
    if errorlevel 1 (
        echo ERRO no build
        pause
        exit /b 1
    )
) else (
    echo ✓ Build OK
)

echo.
echo 5. Verificando arquivos de dados...
if not exist "database.json" (
    echo Criando database.json...
    echo {"users":[{"id":"1","name":"Admin","username":"admin","email":"admin@infinit.com","password":"123456","bio":"Admin","avatar":"","createdAt":"2025-01-01T00:00:00.000Z","achievements":[],"stats":{"messages":0,"friends":0,"groups":0}}]} > database.json
)

if not exist "src\data" mkdir "src\data"

if not exist "src\data\friends.json" (
    echo Criando friends.json...
    echo {"friends":[],"sentRequests":[],"receivedRequests":[]} > src\data\friends.json
)

if not exist "src\data\chats.json" (
    echo Criando chats.json...
    echo {"chats":[],"lastUpdated":""} > src\data\chats.json
)

echo ✓ Arquivos de dados OK

echo.
echo 6. Testando servidor...
echo Iniciando servidor por 10 segundos...
start /MIN cmd /c "npm start"
timeout /t 5 > nul

echo Verificando se servidor subiu...
netstat -an | find "3000" > nul
if errorlevel 1 (
    echo ERRO: Servidor nao subiu na porta 3000
    echo Pode estar em uso ou com problema
) else (
    echo ✓ Servidor rodando na porta 3000
)

echo.
echo 7. Verificando ngrok...
where ngrok >nul 2>&1
if errorlevel 1 (
    echo Instalando ngrok...
    npm install -g ngrok
    if errorlevel 1 (
        echo ERRO: Nao conseguiu instalar ngrok
        echo Execute como administrador
    ) else (
        echo ✓ ngrok instalado
    )
) else (
    echo ✓ ngrok encontrado
)

echo.
echo ========================================
echo TESTE CONCLUIDO
echo ========================================
echo.
echo Agora vou iniciar o servidor completo...
echo Pressione qualquer tecla para continuar
pause > nul

echo.
echo INICIANDO SERVIDOR INFINIT...
echo.

REM Matar qualquer processo na porta 3000
for /f "tokens=5" %%a in ('netstat -ano ^| find "3000" ^| find "LISTENING"') do taskkill /F /PID %%a >nul 2>&1

echo Iniciando servidor limpo...
start /MIN cmd /c "npm start"

echo Aguardando 10 segundos...
timeout /t 10 > nul

echo.
echo EXPONDO SERVIDOR COM NGROK...
echo.
echo ========================================
echo        LINK PARA SEUS AMIGOS
echo ========================================
echo.
echo ⚠️ MANTENHA ESTA JANELA ABERTA!
echo.
echo 💾 Dados salvos localmente em:
echo    - database.json
echo    - src\data\friends.json
echo    - src\data\chats.json
echo.
echo 🔗 Link aparecera abaixo:
echo.

ngrok http 3000

echo.
echo ========================================
echo SERVIDOR PARADO
echo ========================================
echo.
echo Pressione qualquer tecla para sair...
pause > nul
