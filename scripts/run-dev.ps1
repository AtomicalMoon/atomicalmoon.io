
#!/usr/bin/env pwsh
Write-Host "Run dev helper for atomicalmoon.io"

function Abort($msg) {
  Write-Error $msg
  exit 1
}

Write-Host "Checking for Node.js and npm..."
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { Abort 'node not found. Install Node.js LTS and try again.' }

# On Windows PowerShell execution policy can block npm.ps1; prefer npm.cmd when available
$npmCmd = (Get-Command npm.cmd -ErrorAction SilentlyContinue) ? 'npm.cmd' : (Get-Command npm -ErrorAction SilentlyContinue) ? 'npm' : $null
if (-not $npmCmd) { Abort 'npm not found. Install Node.js LTS and try again.' }

Write-Host "node:" (node -v)
Write-Host "npm:" (& $npmCmd -v)

if (Get-Command wat2wasm -ErrorAction SilentlyContinue) {
  Write-Host "wat2wasm found — compiling wasm/particles.wat -> public/particles.wasm"
  if (-not (Test-Path public)) { New-Item -ItemType Directory -Path public | Out-Null }
  & wat2wasm wasm/particles.wat -o public/particles.wasm
  if ($LASTEXITCODE -ne 0) { Write-Warning "wat2wasm failed; continuing with JS fallback." }
} else {
  Write-Host "wat2wasm not found — skipping WASM compile (JS fallback will be used)."
}

Write-Host "Installing npm dependencies (this may take a few minutes)..."
& $npmCmd install
if ($LASTEXITCODE -ne 0) { Abort 'npm install failed. See output above.' }

Write-Host "Starting development servers (frontend + backend)..."
Write-Host "Use Ctrl+C to stop."
& $npmCmd run dev:full
