@echo off
REM Start Backend Server

echo Activating conda environment...
call conda activate cms

echo Installing dependencies...
pip install -r requirements.txt

echo Starting Backend Server...
python main.py

pause
