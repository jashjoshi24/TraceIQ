# One-shot backend setup + launch for SentinelX / TraceIQ.
# Run from anywhere; it cd's into its own folder first.
# Usage (from PowerShell):
#   powershell -ExecutionPolicy Bypass -File .\run_backend_setup.ps1

$ErrorActionPreference = "Continue"
Set-Location -Path $PSScriptRoot

Write-Host "== Writing .env ==" -ForegroundColor Cyan
$envContent = @"
DATABASE_URL=postgresql://postgres:Jash%400550@localhost:5432/traceiq
PCAP_STORAGE_DIR=./pcap-storage
REDIS_URL=redis://localhost:6379
"@
Set-Content -Path (Join-Path $PSScriptRoot "..\.env") -Value $envContent -NoNewline
Write-Host "Wrote ..\.env" -ForegroundColor Green

Write-Host "== Creating database 'traceiq' (if it doesn't already exist) ==" -ForegroundColor Cyan
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
        # Persist the bin folder on PATH for future sessions too.
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
    Write-Host "Open pgAdmin (installed alongside PostgreSQL) instead, connect to your local server," -ForegroundColor Yellow
    Write-Host "right-click 'Databases' -> Create -> Database..., name it 'traceiq', and save." -ForegroundColor Yellow
    Write-Host "Then re-run this script to continue." -ForegroundColor Yellow
} else {
    & $psqlExe -U postgres -h localhost -p 5432 -c "CREATE DATABASE traceiq;" 2>&1 | ForEach-Object {
        if ($_ -match "already exists") {
            Write-Host "Database 'traceiq' already exists - continuing." -ForegroundColor Yellow
        } else {
            Write-Host $_
        }
    }
}

Write-Host "== Setting up Python virtual environment ==" -ForegroundColor Cyan
if (-not (Test-Path "venv")) {
    python -m venv venv
}
& ".\venv\Scripts\Activate.ps1"

Write-Host "== Installing backend dependencies ==" -ForegroundColor Cyan
pip install -r requirements.txt

Write-Host "== Starting backend on http://localhost:8000 ==" -ForegroundColor Cyan
Write-Host "Look for 'Database tables verified/created.' and 'PCAP pipeline worker started.' below." -ForegroundColor Cyan
Write-Host "Leave this window open while you use the app. Press Ctrl+C to stop." -ForegroundColor Cyan
python -m uvicorn main:app --reload --port 8000
