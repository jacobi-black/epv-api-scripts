# CyberArk API Explorer - Automatic CSV Report Generator
# This script executes all report scripts to generate CSV files

param(
    [Parameter(Mandatory = $true, HelpMessage = "Enter PVWA URL")]
    [String]$PVWAAddress,
    
    [Parameter(Mandatory = $false, HelpMessage = "Pass PVWA Credentials")]
    [PSCredential]$PVWACredentials,
    
    [Parameter(Mandatory = $false, HelpMessage = "Authentication Type for PVWA")]
    [String]$PVWAAuthType = "CyberArk",
    
    [Parameter(Mandatory = $false, HelpMessage = "Use Identity authentication instead of direct PVWA")]
    [Switch]$UseIdentity,
    
    [Parameter(Mandatory = $false, HelpMessage = "Enter Identity UserName")]
    [String]$IdentityUserName,
    
    [Parameter(Mandatory = $false, HelpMessage = "Enter Identity URL")]
    [String]$IdentityURL,
    
    [Parameter(Mandatory = $false, HelpMessage = "Enter Privilege Cloud Subdomain")]
    [String]$PCloudSubDomain,
    
    [Parameter(Mandatory = $false, HelpMessage = "Export Directory Path")]
    [String]$ExportDir = ".\exports"
)

# Ensure the export directory exists
if(-not (Test-Path -Path $ExportDir)) {
    New-Item -Path $ExportDir -ItemType Directory | Out-Null
    Write-Host "Created exports directory: $ExportDir" -ForegroundColor Green
}

# Function to execute a script with appropriate parameters
function Invoke-ReportScript {
    param (
        [string]$ScriptPath,
        [string]$ReportName,
        [string]$ReportParamName = "CSVPath",
        [hashtable]$AdditionalParams = @{}
    )
    
    $fullReportPath = Join-Path -Path $ExportDir -ChildPath $ReportName
    
    Write-Host "Generating $ReportName..." -ForegroundColor Cyan
    
    $scriptParams = @{
        $ReportParamName = $fullReportPath
    }
    
    # Add authentication parameters
    if($UseIdentity) {
        if([string]::IsNullOrEmpty($IdentityUserName) -or [string]::IsNullOrEmpty($IdentityURL) -or [string]::IsNullOrEmpty($PCloudSubDomain)) {
            Write-Error "Identity authentication requires IdentityUserName, IdentityURL, and PCloudSubDomain parameters"
            return $false
        }
        
        $scriptParams += @{
            IdentityUserName = $IdentityUserName
            IdentityURL = $IdentityURL
            PCloudSubDomain = $PCloudSubDomain
        }
    } else {
        $scriptParams += @{
            PVWAAddress = $PVWAAddress
            PVWAAuthType = $PVWAAuthType
        }
        
        if($null -ne $PVWACredentials) {
            $scriptParams += @{
                PVWACredentials = $PVWACredentials
            }
        }
    }
    
    # Add any additional parameters
    foreach($key in $AdditionalParams.Keys) {
        $scriptParams[$key] = $AdditionalParams[$key]
    }
    
    try {
        & $ScriptPath @scriptParams
        Write-Host "Successfully generated $ReportName" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "Error generating $ReportName : $_" -ForegroundColor Red
        return $false
    }
}

# Initialize results tracking
$results = @()

# 1. Account Reports
$scriptResult = Invoke-ReportScript -ScriptPath ".\Reports\Accounts\Get-AccountReport.ps1" `
                                  -ReportName "AccountReport.csv" `
                                  -ReportParamName "ReportPath" `
                                  -AdditionalParams @{ allProps = $true }
$results += [PSCustomObject]@{
    Report = "Account Report"
    Status = if($scriptResult) { "Success" } else { "Failed" }
    FilePath = Join-Path -Path $ExportDir -ChildPath "AccountReport.csv"
}

# 2. Safe Reports
$scriptResult = Invoke-ReportScript -ScriptPath ".\Reports\Safes\Get-SafeMemberReport.ps1" `
                                 -ReportName "SafeMemberReport.csv" `
                                 -ReportParamName "ReportPath" `
                                 -AdditionalParams @{ 
                                    IncludeGroups = $true
                                    IncludeApps = $true
                                 }
$results += [PSCustomObject]@{
    Report = "Safe Member Report"
    Status = if($scriptResult) { "Success" } else { "Failed" }
    FilePath = Join-Path -Path $ExportDir -ChildPath "SafeMemberReport.csv"
}

# 3. Discovered Accounts Report
$scriptResult = Invoke-ReportScript -ScriptPath ".\Discovered Accounts\Get-DiscoveredAccountsReport.ps1" `
                                 -ReportName "DiscoveredAccounts.csv"
$results += [PSCustomObject]@{
    Report = "Discovered Accounts Report"
    Status = if($scriptResult) { "Success" } else { "Failed" }
    FilePath = Join-Path -Path $ExportDir -ChildPath "DiscoveredAccounts.csv"
}

# 4. User Management Reports
$scriptResult = Invoke-ReportScript -ScriptPath ".\User Management\Get-InactiveUsersReport.ps1" `
                                 -ReportName "InactiveUsers.csv"
$results += [PSCustomObject]@{
    Report = "Inactive Users Report"
    Status = if($scriptResult) { "Success" } else { "Failed" }
    FilePath = Join-Path -Path $ExportDir -ChildPath "InactiveUsers.csv"
}

# 5. Platform Reports
$scriptResult = Invoke-ReportScript -ScriptPath ".\Platforms\Get-PlatformReport.ps1" `
                                 -ReportName "PlatformReport.csv"
$results += [PSCustomObject]@{
    Report = "Platform Report"
    Status = if($scriptResult) { "Success" } else { "Failed" }
    FilePath = Join-Path -Path $ExportDir -ChildPath "PlatformReport.csv"
}

# 6. Security Events Report
$scriptResult = Invoke-ReportScript -ScriptPath ".\Security Events\Get-AccoutnsRiskReport.ps1" `
                                 -ReportName "AccountRiskReport.csv"
$results += [PSCustomObject]@{
    Report = "Account Risk Report" 
    Status = if($scriptResult) { "Success" } else { "Failed" }
    FilePath = Join-Path -Path $ExportDir -ChildPath "AccountRiskReport.csv"
}

# 7. PSM Sessions Report
$scriptResult = Invoke-ReportScript -ScriptPath ".\PSM Sessions Management\PSM-SessionsManagement.ps1" `
                                 -ReportName "PSMSessions.csv"
$results += [PSCustomObject]@{
    Report = "PSM Sessions Report"
    Status = if($scriptResult) { "Success" } else { "Failed" }
    FilePath = Join-Path -Path $ExportDir -ChildPath "PSMSessions.csv"
}

# 8. AAM Applications Report
$scriptResult = Invoke-ReportScript -ScriptPath ".\AAM Applications\Export-Import-Applications.ps1" `
                                 -ReportName "AAMApplications.csv" `
                                 -AdditionalParams @{ Action = "Export" }
$results += [PSCustomObject]@{
    Report = "AAM Applications Report"
    Status = if($scriptResult) { "Success" } else { "Failed" }
    FilePath = Join-Path -Path $ExportDir -ChildPath "AAMApplications.csv"
}

# 9. Address Optimization Report
$scriptResult = Invoke-ReportScript -ScriptPath ".\Optimize Address\Optimize-Addresses.ps1" `
                                 -ReportName "AddressOptimization.csv"
$results += [PSCustomObject]@{
    Report = "Address Optimization Report"
    Status = if($scriptResult) { "Success" } else { "Failed" }
    FilePath = Join-Path -Path $ExportDir -ChildPath "AddressOptimization.csv"
}

# 10. Get Accounts Report
$scriptResult = Invoke-ReportScript -ScriptPath ".\Get Accounts\Get-Accounts.ps1" `
                                 -ReportName "AllAccounts.csv"
$results += [PSCustomObject]@{
    Report = "All Accounts Report"
    Status = if($scriptResult) { "Success" } else { "Failed" }
    FilePath = Join-Path -Path $ExportDir -ChildPath "AllAccounts.csv"
}

# Display summary results
Write-Host "`nReport Generation Summary:" -ForegroundColor Cyan
Write-Host "=======================" -ForegroundColor Cyan
$results | Format-Table -AutoSize

# Export results to CSV
$resultsPath = Join-Path -Path $ExportDir -ChildPath "ReportGenerationResults.csv"
$results | Export-Csv -Path $resultsPath -NoTypeInformation
Write-Host "`nReport generation results saved to: $resultsPath" -ForegroundColor Green

# Instructions for using the reports
Write-Host "`nAll reports have been saved to: $ExportDir" -ForegroundColor Yellow
Write-Host "You can now use these CSV files for your dashboards or further analysis." -ForegroundColor Yellow 