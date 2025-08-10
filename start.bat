@echo off
title INFINIT - Start
cls

echo.
echo INFINIT - SERVIDOR LOCAL
echo.

REM Verificar se node_modules existe
if not exist "node_modules" (
    echo Dependencias nao instaladas!
    echo.
    echo Executando: npm install
    call npm install
    if errorlevel 1 (
        echo Erro na instalacao
        pause
        exit /b 1
    )
)

REM Verificar se build existe
if not exist ".next" (
    echo Fazendo build...
    call npm run build
    if errorlevel 1 (
        echo Erro no build
        pause
        exit /b 1
    )
)

REM Criar arquivos de dados se nao existirem
echo Verificando arquivos de dados...

if not exist "database.json" (
    echo Criando database.json...
    echo {"users":[{"id":"1","name":"Admin","username":"admin","email":"admin@infinit.com","password":"123456","bio":"Administrador do servidor","avatar":"","createdAt":"2025-01-01T00:00:00.000Z","achievements":[],"stats":{"messages":0,"friends":0,"groups":0}}]} > database.json
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

echo.
echo Tudo pronto!
echo.
echo Iniciando servidor na porta 3000...
echo.

REM Iniciar o servidor
start /MIN cmd /c "npm start"

echo Aguardando servidor inicializar...
timeout /t 8 > nul

echo.
echo Agora vou expor o servidor para internet...
echo.
echo ========================================
echo          LINK PARA AMIGOS
echo ========================================
echo.
echo MANTENHA ESTA JANELA ABERTA!
echo.
echo Dados salvos em:
echo    - database.json (usuarios)
echo    - src\data\friends.json (amigos)
echo    - src\data\chats.json (conversas)
echo.
echo O link global aparecera abaixo:
echo    Compartilhe este link com seus amigos
echo.
echo ========================================
echo.

REM Tentar iniciar ngrok
ngrok http 3000

echo.
echo Servidor parado!
echo Todos os dados foram salvos no seu PC
pause
