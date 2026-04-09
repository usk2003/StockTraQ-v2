@echo off
echo ==========================================
echo       StockTraQ .venv Repair Tool
echo ==========================================
echo.

echo [1/4] Deleting corrupted .venv folder...
rd /s /q "%~dp0.venv" 2>nul

echo [2/4] Recreating Virtual Environment...
python -m venv "%~dp0.venv"

echo [3/4] Upgrading Pip inside environment...
"%~dp0.venv\Scripts\python.exe" -m pip install --upgrade pip

echo [4/4] Installing all backend requirements (RAG + Prediction Model)...
"%~dp0.venv\Scripts\python.exe" -m pip install -r "%~dp0backend\requirements.txt"

echo.
echo ==========================================
echo 🎉 Environment Repair Complete!
echo You can now safely run .\run.bat again.
echo ==========================================
echo.
pause
