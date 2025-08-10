@echo off
title INFINIT - Menu Principal

:menu
cls
echo.
echo ========================================
echo        INFINIT - MENU PRINCIPAL
echo ========================================
echo.
echo 1. 🏠 Servidor Local (Testar sozinho)
echo 2. 🌐 Servidor Global (Amigos distantes)
echo 3. 📦 Instalar Dependencias
echo 4. 📊 Ver Dados Salvos
echo 5. 💾 Fazer Backup
echo 6. 🛠️  Limpar Cache
echo 7. ⚙️  Configurar ngrok
echo 8. ❌ Sair
echo.
echo ========================================
echo.
set /p escolha="Escolha uma opcao (1-8): "

if "%escolha%"=="1" goto local
if "%escolha%"=="2" goto global
if "%escolha%"=="3" goto instalar
if "%escolha%"=="4" goto dados
if "%escolha%"=="5" goto backup
if "%escolha%"=="6" goto limpar
if "%escolha%"=="7" goto ngrok
if "%escolha%"=="8" goto sair

echo Opcao invalida!
timeout /t 2 > nul
goto menu

:local
cls
echo.
echo 🏠 INICIANDO SERVIDOR LOCAL...
echo (Apenas para voce testar)
echo.
call servidor_local_simples.bat
goto menu

:global
cls
echo.
echo 🌐 INICIANDO SERVIDOR GLOBAL...
echo (Para amigos distantes acessarem)
echo.
call servidor.bat
goto menu

:ngrok
cls
echo.
echo ⚙️  CONFIGURACAO DO NGROK
echo.
echo Para amigos distantes acessarem, voce precisa:
echo.
echo 1. Criar conta gratis em: https://dashboard.ngrok.com/signup
echo 2. Pegar seu token em: https://dashboard.ngrok.com/get-started/your-authtoken
echo 3. Configurar o token:
echo.
set /p token="Cole seu token aqui (ou Enter para pular): "

if "%token%"=="" (
    echo.
    echo Configuracao cancelada
    echo Veja o arquivo CONFIGURAR_NGROK.md para detalhes
    pause
    goto menu
)

echo.
echo Configurando token...
ngrok config add-authtoken %token%
if errorlevel 1 (
    echo ERRO ao configurar token
    echo Verifique se o token esta correto
) else (
    echo ✓ Token configurado com sucesso!
    echo Agora voce pode usar a opcao 2 (Servidor Global)
)
pause
goto menu

:iniciar
cls
echo.
echo INICIANDO SERVIDOR INFINIT...
echo.

REM Verificar dependencias
if not exist "node_modules" (
    echo Dependencias nao encontradas!
    echo Instalando automaticamente...
    npm install
    if errorlevel 1 (
        echo ERRO na instalacao
        pause
        goto menu
    )
)

REM Verificar build
if not exist ".next" (
    echo Build nao encontrado!
    echo Fazendo build automaticamente...
    npm run build
    if errorlevel 1 (
        echo ERRO no build
        pause
        goto menu
    )
)

echo.
echo Criando arquivos necessarios...

REM Criar arquivos de dados
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

echo.
echo ========================================
echo INICIANDO SERVIDOR...
echo ========================================
echo.

REM Limpar porta 3000
for /f "tokens=5" %%a in ('netstat -ano ^| find "3000" ^| find "LISTENING"') do taskkill /F /PID %%a >nul 2>&1

echo Iniciando Next.js...
start /MIN cmd /c "npm start"

echo Aguardando servidor inicializar...
timeout /t 8 > nul

echo.
echo Verificando se servidor subiu...
netstat -an | find "3000" > nul
if errorlevel 1 (
    echo ERRO: Servidor nao iniciou
    echo Tente novamente ou use a opcao 5 (Limpar Cache)
    pause
    goto menu
)

echo Servidor OK! Iniciando ngrok...
echo.
echo ========================================
echo        LINK PARA AMIGOS
echo ========================================
echo.
echo MANTENHA ESTA JANELA ABERTA!
echo.
echo Quando aparecer o link, compartilhe com seus amigos:
echo.

ngrok http 3000

echo.
echo Servidor parado! Voltando ao menu...
timeout /t 3 > nul
goto menu

:instalar
cls
echo.
echo INSTALANDO DEPENDENCIAS...
echo.
call npm install
echo.
echo Instalando ngrok...
call npm install -g ngrok
echo.
echo Instalacao concluida!
pause
goto menu

:dados
cls
echo.
echo DADOS SALVOS NO SEU PC
echo ========================================
echo.
echo Localizacao dos arquivos:
echo    %cd%\database.json
echo    %cd%\src\data\friends.json  
echo    %cd%\src\data\chats.json
echo.

if exist "database.json" (
    echo database.json - OK
) else (
    echo database.json - NAO EXISTE
)

if exist "src\data\friends.json" (
    echo friends.json - OK  
) else (
    echo friends.json - NAO EXISTE
)

if exist "src\data\chats.json" (
    echo chats.json - OK
) else (
    echo chats.json - NAO EXISTE
)

echo.
pause
goto menu

:backup
cls
echo.
echo FAZENDO BACKUP DOS DADOS...
echo.

set "timestamp=%date:~-4%-%date:~3,2%-%date:~0,2%_%time:~0,2%-%time:~3,2%-%time:~6,2%"
set "timestamp=%timestamp: =0%"
set "backup_folder=backup_%timestamp%"

mkdir "%backup_folder%" 2>nul

if exist "database.json" copy "database.json" "%backup_folder%\" >nul
if exist "src\data\friends.json" copy "src\data\friends.json" "%backup_folder%\" >nul  
if exist "src\data\chats.json" copy "src\data\chats.json" "%backup_folder%\" >nul

echo Backup criado em: %backup_folder%
echo.
pause
goto menu

:limpar
cls
echo.
echo LIMPANDO CACHE...
echo.
if exist ".next" rmdir /s /q ".next"
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache"
echo Cache limpo!
pause
goto menu

:sair
cls
echo.
echo Obrigado por usar o INFINIT!
echo.
timeout /t 2 > nul
exit
