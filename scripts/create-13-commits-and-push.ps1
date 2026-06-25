$ErrorActionPreference = "Stop"

$gitCommand = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitCommand -and (Test-Path -LiteralPath "C:\Program Files\Git\cmd\git.exe")) {
  $env:Path = "C:\Program Files\Git\cmd;$env:Path"
  $gitCommand = Get-Command git -ErrorAction SilentlyContinue
}
if (-not $gitCommand) {
  throw "Git is not installed or not available on PATH. Install Git for Windows, reopen the terminal, then run this script again."
}

Set-Location -LiteralPath (Split-Path -Parent $PSScriptRoot)

$gitDir = ".git-real"
function G {
  git --git-dir $gitDir --work-tree "." @args
}

git --git-dir $gitDir --work-tree "." init

if (-not (G config user.name)) {
  G config user.name "TicketBari Builder"
}
if (-not (G config user.email)) {
  G config user.email "ticketbari@example.local"
}

$remotes = G remote
if ($remotes -notcontains "origin") {
  G remote add origin "https://github.com/Ayonpal5/ticketbari9.git"
} else {
  G remote set-url origin "https://github.com/Ayonpal5/ticketbari9.git"
}

function Commit-Step {
  param(
    [string]$Message,
    [string[]]$Paths
  )
  foreach ($Path in $Paths) {
    if (Test-Path -LiteralPath $Path) {
      G add -- $Path
    }
  }
  $staged = G diff --cached --name-only
  if ($staged) {
    G commit -m $Message
  } else {
    Write-Host "Skipping: $Message (no staged changes)"
  }
}

Commit-Step "chore: scaffold TicketBari project metadata" @(
  "package.json",
  "package-lock.json",
  "index.html",
  ".gitignore",
  ".env.example",
  "vercel.json",
  "start-dev.ps1"
)

Commit-Step "feat(client): build TicketBari React app shell and workflows" @(
  "src/main.jsx"
)

Commit-Step "style(client): add responsive TicketBari visual system" @(
  "src/styles.css"
)

Commit-Step "chore(server): configure backend package and environment template" @(
  "server/package.json",
  "server/package-lock.json",
  "server/.env.example"
)

Commit-Step "feat(server): add database, auth, and error middleware" @(
  "server/src/config/db.js",
  "server/src/config/betterAuth.js",
  "server/src/middleware/auth.js",
  "server/src/middleware/error.js",
  "server/src/utils/token.js"
)

Commit-Step "feat(server): add Mongo models for users tickets bookings transactions" @(
  "server/src/models/User.js",
  "server/src/models/Ticket.js",
  "server/src/models/Booking.js",
  "server/src/models/Transaction.js"
)

Commit-Step "feat(server): add authentication and ticket APIs" @(
  "server/src/routes/authRoutes.js",
  "server/src/routes/ticketRoutes.js"
)

Commit-Step "feat(server): add booking and payment APIs" @(
  "server/src/routes/bookingRoutes.js",
  "server/src/routes/paymentRoutes.js"
)

Commit-Step "feat(server): add admin and image upload APIs" @(
  "server/src/routes/adminRoutes.js",
  "server/src/routes/uploadRoutes.js"
)

Commit-Step "feat(server): wire Express app and seed data" @(
  "server/src/server.js",
  "server/src/seed.js"
)

Commit-Step "test(server): add integration verification script" @(
  "server/src/verify-integrations.js"
)

Commit-Step "docs: add README deployment guide and checklist" @(
  "README.md",
  "DEPLOYMENT.md",
  "PROJECT_CHECKLIST.md"
)

Commit-Step "chore: add commit and push helper script" @(
  "scripts/create-13-commits-and-push.ps1"
)

G branch -M main
G push -u origin main
