@echo off
echo ==========================================
echo Starting SLGrid Backend Server...
echo ==========================================

:: Define the exact path to your Python 3.11
set PYTHON_EXE="C:\Users\Dimuthu\AppData\Local\Programs\Python\Python311\python.exe"

:: 1. Silently ensure the correct engine is installed
echo Checking MATLAB Engine connection...
%PYTHON_EXE% -m pip install -r requirements.txt --quiet

:: 2. Start the FastAPI server
echo Launching main.py...
%PYTHON_EXE% main.py

pause