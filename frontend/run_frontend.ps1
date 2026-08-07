# One-shot frontend setup + launch for SentinelX / TraceIQ.
# Run this in a SEPARATE terminal window from run_backend_setup.ps1 -
# both need to stay running at the same time.
# Usage (from PowerShell):
#   powershell -ExecutionPolicy Bypass -File .\run_frontend.ps1

$ErrorActionPreference = "Continue"
Set-Location -Path $PSScriptRoot

Write-Host "== Writing .env.local ==" -ForegroundColor Cyan
$envContent = @"
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws/pcap
"@
Set-Content -Path ".env.local" -Value $envContent -NoNewline
Write-Host "Wrote .env.local" -ForegroundColor Green

Write-Host "== Starting frontend on http://localhost:3000 ==" -ForegroundColor Cyan
Write-Host "Once it's up, open http://localhost:3000/pcap in your browser." -ForegroundColor Cyan
Write-Host "Leave this window open while you use the app. Press Ctrl+C to stop." -ForegroundColor Cyan
npm run dev
