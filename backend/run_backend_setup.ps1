# One-shot backend setup + launch for SentinelX / TraceIQ - PCAP/Dashboard API (port 8000).
# Run from anywhere; it cd's into its own folder first.
# Usage (from PowerShell):
#   powershell -ExecutionPolicy Bypass -File .\run_backend_setup.ps1
#
# This script also provisions the shared venv used by the AUTH backend
# (backend/app, port 8001) and applies its database schema, so after this
# runs once you only need backend/app/run_auth_backend.ps1 to start that
# second server - no separate venv/install for it.

$ErrorActionPreference = "Continue"
Set-Location -Path $PSScriptRoot

Write-Host "== Writing .env ==" -ForegroundColor Cyan
$envContent = @"
DATABASE_URL=postgresql://postgres:Jash%400550@localhost:5432/traceiq
ASYNC_DATABASE_URL=postgresql+asyncpg://postgres:Jash%400550@localhost:5432/traceiq
PCAP_STORAGE_DIR=./pcap-storage
REDIS_URL=redis://localhost:6379
JWT_SECRET_KEY=94c8b0fb6029f636cc6b7a2d8d85fef109594f86d84a7e3d1c9ef26759c25603
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
"@
Set-Content -Path (Join-Path $PSScriptRoot "..\.env") -Value $envContent -NoNewline
Write-Host "Wrote ..\.env" -ForegroundColor Green

Write-Host "== Locating psql ==" -ForegroundColor Cyan
$env:PGPASSWORD = "Jash@0550"
$psqlCmd = Get-Command psql -ErrorAction SilentlyContinue
$psqlExe = $null

if ($psqlCmd) {
    $psqlExe = "psql"
} else {
    Write-Host "'psql' not found on PATH - searching common PostgreSQL install locations..." -ForegroundColor Yellow
    $candidates = @()
    foreach ($base in @("C:\Program Files\PostgreSQL", "C:\Program Files (x86)\PostgreSQL")) {
        if (Test-Path $base) {
            $candidates += Get-ChildItem -Path $base -Directory -ErrorAction SilentlyContinue |
                Sort-Object Name -Descending |
                ForEach-Object { Join-Path $_.FullName "bin\psql.exe" }
        }
    }
    $found = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
    if ($found) {
        Write-Host "Found psql at: $found" -ForegroundColor Green
        $psqlExe = $found
        $binDir = Split-Path $found -Parent
        if ($env:PATH -notlike "*$binDir*") {
            $env:PATH += ";$binDir"
            try {
                [Environment]::SetEnvironmentVariable("PATH", [Environment]::GetEnvironmentVariable("PATH", "User") + ";$binDir", "User")
                Write-Host "Added $binDir to your User PATH (restart terminals to pick it up elsewhere)." -ForegroundColor Green
            } catch {
                Write-Host "Could not persist PATH automatically - you can add it manually if needed." -ForegroundColor Yellow
            }
        }
    }
}

if (-not $psqlExe) {
    Write-Host "WARNING: could not find psql.exe automatically." -ForegroundColor Yellow
    Write-Host "Open pgAdmin instead, connect to your local server, and make sure a 'traceiq' database exists," -ForegroundColor Yellow
    Write-Host "then run the SQL in database\traceiq_auth_schema.sql against it manually." -ForegroundColor Yellow
} else {
    Write-Host "== Creating database 'traceiq' (if it doesn't already exist) ==" -ForegroundColor Cyan
    & $psqlExe -U postgres -h localhost -p 5432 -c "CREATE DATABASE traceiq;" 2>&1 | ForEach-Object {
        if ($_ -match "already exists") {
            Write-Host "Database 'traceiq' already exists - continuing." -ForegroundColor Yellow
        } else {
            Write-Host $_
        }
    }

    Write-Host "== Applying auth module schema (users, roles, permissions, refresh_tokens, ...) ==" -ForegroundColor Cyan
    $schemaPath = Join-Path $PSScriptRoot "..\database\traceiq_auth_schema.sql"
    & $psqlExe -U postgres -h localhost -p 5432 -d traceiq -f $schemaPath
    Write-Host "Schema applied (safe to re-run - it only creates what's missing)." -ForegroundColor Green
}

Write-Host "== Setting up Python virtual environment ==" -ForegroundColor Cyan
if (-not (Test-Path "venv")) {
    python -m venv venv
}
& ".\venv\Scripts\Activate.ps1"

Write-Host "== Installing backend dependencies (PCAP/dashboard API + auth API) ==" -ForegroundColor Cyan
pip install -r requirements.txt

Write-Host "== Verifying auth database migration (no-op if the SQL above already applied it) ==" -ForegroundColor Cyan
Push-Location ..
alembic upgrade head
Pop-Location

Write-Host "== Seeding default roles/permissions/demo users (safe to re-run) ==" -ForegroundColor Cyan
python -m app.db.seed

Write-Host "== Starting PCAP/Dashboard backend on http://localhost:8000 ==" -ForegroundColor Cyan
Write-Host "Look for 'Database tables verified/created.' and 'PCAP pipeline worker started.' below." -ForegroundColor Cyan
Write-Host "Leave this window open. In a SEPARATE terminal, run backend\app\run_auth_backend.ps1 to start the login/RBAC API (port 8001)." -ForegroundColor Cyan
python -m uvicorn main:app --reload --port 8000
