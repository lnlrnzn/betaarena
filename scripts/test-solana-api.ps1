$env:SOLANATRACKER_API_KEY = (Get-Content .env.local | Select-String 'SOLANATRACKER_API_KEY' | ForEach-Object { $_ -replace 'SOLANATRACKER_API_KEY=', '' })
node scripts/test-solana-api.js
