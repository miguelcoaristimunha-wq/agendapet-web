@echo off
title AgendaPet Web - Servidor Local
echo ======================================================
echo    Iniciando AgendaPet Web (Patinhas e Cia)
echo ======================================================
echo.
echo Abrindo o painel no seu navegador...
start http://localhost:3000
echo Servidor rodando em http://localhost:3000
echo Pressione Ctrl + C para encerrar quando terminar.
echo.
npx http-server . -p 3000 -c-1
pause
