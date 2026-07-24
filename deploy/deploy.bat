@echo off
rem ============================================================================
rem  Deploiement du site ATFR sur le VPS (Windows) en une commande.
rem  Double-clique ce fichier, ou lance-le depuis un terminal :
rem      deploy\deploy.bat
rem  Il se place tout seul a la racine du depot (peu importe d'ou il est lance).
rem ============================================================================
setlocal
cd /d "%~dp0.."

echo ============================================
echo   Deploiement ATFR - %DATE% %TIME%
echo   Depot : %CD%
echo ============================================
echo.

echo [1/4] Recuperation du code (git pull)...
git pull || goto :err
echo.

echo [2/4] Installation des dependances (npm install)...
call npm install || goto :err
echo.

echo [3/4] Build du front (npm run build)...
call npm run build || goto :err
echo.

echo [4/4] Redemarrage de l'API (PM2)...
call pm2 restart atfr-api --update-env || goto :err
call pm2 save
echo.

echo ============================================
echo   Deploiement termine avec SUCCES
echo ============================================
echo.
echo   - Front : nouveau dist\ servi par Caddy (hard refresh Ctrl+Shift+R).
echo   - API   : atfr-api redemarre (fonctions + crons a jour).
echo   Note : Caddy n'a PAS besoin d'etre redemarre pour un deploiement de
echo   code. Ne relance atfr-caddy que si tu modifies deploy\Caddyfile ou le
echo   domaine (SITE_DOMAIN) : pm2 restart deploy\pm2.config.cjs --update-env
goto :end

:err
echo.
echo ********************************************
echo   ECHEC : une etape a echoue (voir au-dessus).
echo   Rien n'a ete deploye a moitie cote PM2 tant que l'etape 4 n'est pas
echo   passee. Corrige l'erreur puis relance deploy\deploy.bat.
echo ********************************************

:end
endlocal
pause
