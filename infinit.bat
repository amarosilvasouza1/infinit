@echo off
title INFINIT - Inicio Rapido
cls

echo.
echo ⚡ INICIO RAPIDO - INFINIT ⚡
echo.
echo 1. Primeira vez (instalar tudo)
echo 2. Iniciar servidor (ja instalado)
echo 3. Ver dados salvos
echo 4. Backup dos dados
echo 5. Sair
echo.
set /p escolha="Digite sua opcao (1-5): "

if "%escolha%"=="1" goto primeira_vez
if "%escolha%"=="2" goto iniciar_servidor
if "%escolha%"=="3" goto ver_dados
if "%escolha%"=="4" goto backup
if "%escolha%"=="5" goto sair
goto menu

:primeira_vez
cls
echo.
echo 🔧 PRIMEIRA INSTALACAO
echo.
echo Instalando dependencias...
call npm install
echo.
echo Instalando ngrok...
call npm install -g ngrok
echo.
echo Criando arquivos de dados...
call servidor_local.bat
goto fim

:iniciar_servidor
cls
echo.
echo 🚀 INICIANDO SERVIDOR
echo.
if not exist "node_modules" (
    echo ⚠️  Dependencias nao encontradas!
    echo Execute a opcao 1 primeiro
    pause
    goto menu
)

echo Verificando build...
if not exist ".next" (
    echo 🏗️  Fazendo build...
    call npm run build
)

echo.
echo 📊 Status dos dados:
if exist "database.json" (
    echo ✅ database.json - OK
) else (
    echo ❌ database.json - CRIANDO...
    echo {"users":[{"id":"1","name":"Admin","username":"admin","email":"admin@infinit.com","password":"123456","bio":"Administrador","avatar":"","createdAt":"2025-01-01T00:00:00.000Z"}]} > database.json
)

if exist "src\data\friends.json" (
    echo ✅ friends.json - OK
) else (
    echo ❌ friends.json - CRIANDO...
    mkdir src\data 2>nul
    echo {"friends":[],"sentRequests":[],"receivedRequests":[]} > src\data\friends.json
)

if exist "src\data\chats.json" (
    echo ✅ chats.json - OK
) else (
    echo ❌ chats.json - CRIANDO...
    echo {"chats":[],"lastUpdated":""} > src\data\chats.json
)

echo.
echo 🌐 Iniciando servidor e ngrok...
echo.
echo ⚠️  IMPORTANTE: Mantenha esta janela aberta!
echo.
start /MIN cmd /c "npm start"
timeout /t 5 > nul
ngrok http 3000
goto fim

:ver_dados
cls
echo.
echo 📊 DADOS SALVOS NO SEU PC
echo.
echo 📁 Localizacao dos arquivos:
echo    %cd%\database.json
echo    %cd%\src\data\friends.json
echo    %cd%\src\data\chats.json
echo.

if exist "database.json" (
    echo 👥 USUARIOS REGISTRADOS:
    powershell -Command "Get-Content database.json | ConvertFrom-Json | Select-Object -ExpandProperty users | ForEach-Object { Write-Host \"   - $($_.name) (@$($_.username))\" }"
    echo.
)

if exist "src\data\friends.json" (
    echo 🤝 AMIZADES:
    powershell -Command "$friends = Get-Content src\data\friends.json | ConvertFrom-Json; Write-Host \"   Amigos: $($friends.friends.Count)\"; Write-Host \"   Solicitacoes enviadas: $($friends.sentRequests.Count)\"; Write-Host \"   Solicitacoes recebidas: $($friends.receivedRequests.Count)\""
    echo.
)

echo.
pause
goto menu

:backup
cls
echo.
echo 💾 BACKUP DOS DADOS
echo.
set data_atual=%date:~-4%-%date:~3,2%-%date:~0,2%_%time:~0,2%-%time:~3,2%-%time:~6,2%
set data_atual=%data_atual: =0%
set pasta_backup=backup_%data_atual%

mkdir "%pasta_backup%" 2>nul

echo Criando backup em: %pasta_backup%
copy "database.json" "%pasta_backup%\" 2>nul
copy "src\data\*.json" "%pasta_backup%\" 2>nul

echo.
echo ✅ Backup criado com sucesso!
echo    Pasta: %pasta_backup%
echo.
pause
goto menu

:sair
exit

:fim
echo.
echo Pressione qualquer tecla para voltar ao menu...
pause > nul
goto menu

:menu
cls
goto :eof
