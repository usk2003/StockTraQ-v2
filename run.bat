@echo off
echo Starting StockTraQ...

:: Start Backend
start cmd /k "cd backend && ..\.venv\Scripts\python.exe -m uvicorn main:app --reload"

:: Start Node Backend
start cmd /k "cd node-backend && node server.js"

:: Start Frontend
start cmd /k "cd frontend && npm run dev"

echo Backend and Frontend are starting.
pause
