@echo off
cd /d "%~dp0"
title AgendaPet Web - Servidor Local (Patinhas & Cia)
echo ======================================================
echo    Iniciando AgendaPet Web (Patinhas e Cia)
echo ======================================================
echo.
echo Servidor iniciando em http://localhost:3000 ...
echo O seu navegador sera aberto automaticamente.
echo.
echo Para encerrar o servidor, basta fechar esta janela.
echo ======================================================
echo.
call npx --no-install http-server . -p 3000 -c-1 -o
if %ERRORLEVEL% NEQ 0 (
  call npm start
)
pause
