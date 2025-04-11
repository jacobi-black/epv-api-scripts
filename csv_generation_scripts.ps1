# CSV Generation Scripts for CyberArk API Explorer
# This script lists all commands needed to execute scripts that generate CSV reports

Write-Host "CyberArk API Explorer - CSV Generation Scripts" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# Account Reports
Write-Host "## Account Reports" -ForegroundColor Green
Write-Host "# Generates detailed account information report" -ForegroundColor Yellow
Write-Host ".\Reports\Accounts\Get-AccountReport.ps1 -ReportPath '.\exports\AccountReport.csv' -PVWAAddress '<PVWA_URL>' -allProps"
Write-Host ""

# Safe Reports
Write-Host "## Safe Management Reports" -ForegroundColor Green
Write-Host "# Generates safe membership report with detailed permissions" -ForegroundColor Yellow
Write-Host ".\Reports\Safes\Get-SafeMemberReport.ps1 -ReportPath '.\exports\SafeMemberReport.csv' -PVWAAddress '<PVWA_URL>' -IncludeGroups -IncludeApps"
Write-Host ""

# Discovered Accounts Report
Write-Host "## Discovered Accounts Report" -ForegroundColor Green
Write-Host "# Generates report of discovered accounts in the system" -ForegroundColor Yellow
Write-Host ".\Discovered Accounts\Get-DiscoveredAccountsReport.ps1 -CSVPath '.\exports\DiscoveredAccounts.csv' -PVWAAddress '<PVWA_URL>'"
Write-Host ""

# User Management Reports
Write-Host "## User Management Reports" -ForegroundColor Green
Write-Host "# Generates report of inactive users" -ForegroundColor Yellow
Write-Host ".\User Management\Get-InactiveUsersReport.ps1 -CSVPath '.\exports\InactiveUsers.csv' -PVWAAddress '<PVWA_URL>'"
Write-Host ""

# Platform Reports
Write-Host "## Platform Reports" -ForegroundColor Green
Write-Host "# Generates detailed platform configurations report" -ForegroundColor Yellow
Write-Host ".\Platforms\Get-PlatformReport.ps1 -CSVPath '.\exports\PlatformReport.csv' -PVWAAddress '<PVWA_URL>'"
Write-Host ""

# Security Events Report
Write-Host "## Security Events Report" -ForegroundColor Green
Write-Host "# Generates account risk report" -ForegroundColor Yellow
Write-Host ".\Security Events\Get-AccoutnsRiskReport.ps1 -CSVPath '.\exports\AccountRiskReport.csv' -PVWAAddress '<PVWA_URL>'"
Write-Host ""

# PSM Sessions Report
Write-Host "## PSM Sessions Management Report" -ForegroundColor Green
Write-Host "# Generates PSM sessions report" -ForegroundColor Yellow
Write-Host ".\PSM Sessions Management\PSM-SessionsManagement.ps1 -CSVPath '.\exports\PSMSessions.csv' -PVWAAddress '<PVWA_URL>'"
Write-Host ""

# AAM Applications Report
Write-Host "## AAM Applications Report" -ForegroundColor Green
Write-Host "# Exports AAM applications configuration" -ForegroundColor Yellow
Write-Host ".\AAM Applications\Export-Import-Applications.ps1 -Action Export -CSVPath '.\exports\AAMApplications.csv' -PVWAAddress '<PVWA_URL>'"
Write-Host ""

# Address Optimization Report
Write-Host "## Address Optimization Report" -ForegroundColor Green
Write-Host "# Generates report for address optimization" -ForegroundColor Yellow
Write-Host ".\Optimize Address\Optimize-Addresses.ps1 -CSVPath '.\exports\AddressOptimization.csv' -PVWAAddress '<PVWA_URL>'"
Write-Host ""

# Get Accounts Report
Write-Host "## Get Accounts Report" -ForegroundColor Green
Write-Host "# Retrieves all accounts and exports to CSV" -ForegroundColor Yellow
Write-Host ".\Get Accounts\Get-Accounts.ps1 -CSVPath '.\exports\AllAccounts.csv' -PVWAAddress '<PVWA_URL>'"
Write-Host ""

Write-Host "Notes:" -ForegroundColor Magenta
Write-Host "1. Replace <PVWA_URL> with your actual PVWA URL (e.g., https://cyberark.domain.com/PasswordVault)" -ForegroundColor Magenta
Write-Host "2. Ensure the 'exports' directory exists before running the scripts" -ForegroundColor Magenta
Write-Host "3. You'll be prompted for credentials unless you provide them with -PVWACredentials parameter" -ForegroundColor Magenta
Write-Host "4. For Identity authentication, use -IdentityUserName, -IdentityURL, and -PCloudSubDomain parameters instead of PVWAAddress" -ForegroundColor Magenta 