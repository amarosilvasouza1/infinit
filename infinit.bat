@echo off
title INFINIT - Menu Principal

:menu
cls
echo.
echo ========================================
echo        INFINIT - MENU PRINCIPAL
echo ========================================
echo.
echo 1. Iniciar Servidor (Recomendado)
echo 2. Instalar Dependencias
echo 3. Ver Dados Salvos
echo 4. Fazer Backup
echo 5. Limpar Cache
echo 6. Sair
echo.
echo ========================================
echo.
set /p escolha="Escolha uma opcao (1-6): "

if "%escolha%"=="1" goto iniciar
if "%escolha%"=="2" goto instalar
if "%escolha%"=="3" goto dados
if "%escolha%"=="4" goto backup
if "%escolha%"=="5" goto limpar
if "%escolha%"=="6" goto sair

echo Opcao invalida!
timeout /t 2 > nul
goto menu

:iniciar
cls
echo.
echo INICIANDO SERVIDOR INFINIT...
echo.
call start.bat
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
