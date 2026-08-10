# Starts the TraceIQ Authentication / RBAC API (port 8001).
# Run backend\run_backend_setup.ps1 AT LEAST ONCE FIRST - it creates the
# shared venv, installs dependencies, and applies the auth database
# migration. This script just activates that same venv and starts the
# second server; it does not install anything itself.
#
# Usage (from PowerShell, in its own terminal window):
#   cd backend
#   powershell -ExecutionPolicy Bypass -File .\app\run_auth_backend.ps1

$ErrorActionPreference = "Continue"
# backend/ is the working directory this needs (so the "app" package resolves)
Set-Location -Path (Join-Path $PSScriptRoot "..")

if (-not (Test-Path "venv\Scripts\Activate.ps1")) {
    Write-Host "No venv found in backend\. Run run_backend_setup.ps1 first." -ForegroundColor Red
    exit 1
}
& ".\venv\Scripts\Activate.ps1"

Write-Host "== Starting Auth/RBAC backend on http://localhost:8001 ==" -ForegroundColor Cyan
Write-Host "Leave this window open alongside the PCAP/Dashboard backend (port 8000) and the frontend." -ForegroundColor Cyan
python -m uvicorn app.main:app --reload --port 8001
