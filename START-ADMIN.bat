@echo off
REM Lance le système complet en tant qu'administrateur SANS UAC
REM Utilise une tâche planifiée configurée avec scripts\setup-auto-admin.ps1

powershell -ExecutionPolicy Bypass -File "%~dp0scripts\run-admin-task.ps1"

