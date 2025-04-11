# PowerShell Script to Run All Required Scripts for CyberArk Dashboards
# This script will run all necessary scripts to populate the dashboards to 100%

# Output folder for all generated CSV files
function Get-FolderPath {
    param (
        [string]$DefaultPath = "C:\Temp"
    )

    Write-Host "`nSpecify the output folder for CSV files (Default: $DefaultPath): " -ForegroundColor Cyan -NoNewline
    $folderPath = Read-Host
    
    if ([string]::IsNullOrWhiteSpace($folderPath)) {
        $folderPath = $DefaultPath
    }
    
    # Check if folder exists, if not, create it
    if (-not (Test-Path -Path $folderPath)) {
        try {
            New-Item -Path $folderPath -ItemType Directory -Force | Out-Null
            Write-Host "Created folder: $folderPath" -ForegroundColor Green
        }
        catch {
            Write-Host "Error creating folder: $_" -ForegroundColor Red
            Write-Host "Using default folder: $DefaultPath" -ForegroundColor Yellow
            $folderPath = $DefaultPath
            if (-not (Test-Path -Path $folderPath)) {
                New-Item -Path $folderPath -ItemType Directory -Force | Out-Null
            }
        }
    }
    
    return $folderPath
}

function Get-CyberArkCredentials {
    Write-Host "`nEnter CyberArk credentials" -ForegroundColor Cyan
    $creds = Get-Credential -Message "Enter your CyberArk credentials"
    return $creds
}

function Get-PVWAURL {
    Write-Host "`nEnter PVWA URL (e.g., https://pvwa.cyberark.local/PasswordVault): " -ForegroundColor Cyan -NoNewline
    $pvwaURL = Read-Host
    
    while ([string]::IsNullOrWhiteSpace($pvwaURL)) {
        Write-Host "PVWA URL cannot be empty. Please enter a valid URL: " -ForegroundColor Red -NoNewline
        $pvwaURL = Read-Host
    }
    
    return $pvwaURL
}

function Get-AuthType {
    Write-Host "`nSelect Authentication Type:" -ForegroundColor Cyan
    Write-Host "1. CyberArk (default)"
    Write-Host "2. LDAP"
    Write-Host "3. RADIUS"
    
    $choice = Read-Host "Enter your choice (1-3)"
    
    switch ($choice) {
        "2" { return "LDAP" }
        "3" { return "RADIUS" }
        default { return "CyberArk" }
    }
}

function Show-ScriptStatus {
    param (
        [string]$ScriptName,
        [string]$Status,
        [string]$Color = "White"
    )
    
    Write-Host "[$ScriptName] " -ForegroundColor Cyan -NoNewline
    Write-Host "$Status" -ForegroundColor $Color
}

# Main script execution
Clear-Host
Write-Host "======================================================" -ForegroundColor Yellow
Write-Host "      CyberArk Dashboard Requirements Installer" -ForegroundColor Yellow
Write-Host "======================================================" -ForegroundColor Yellow
Write-Host "This script will run all necessary scripts to populate the CyberArk dashboards to 100%." -ForegroundColor White
Write-Host "You will be prompted for the required information for each script." -ForegroundColor White
Write-Host "======================================================" -ForegroundColor Yellow

# Get common parameters
$outputFolder = Get-FolderPath
$pvwaURL = Get-PVWAURL
$authType = Get-AuthType

# Script 1: System-Health.ps1
Write-Host "`n[1/12] System Health Script" -ForegroundColor Yellow
$runScript = Read-Host "Do you want to run System-Health.ps1? (Y/N) [Y]"
if ($runScript -eq "" -or $runScript -eq "Y" -or $runScript -eq "y") {
    $currentLocation = Get-Location
    try {
        Set-Location -Path "System Health"
        
        # Run System-Health.ps1
        $command = "./System-Health.ps1 -PVWAURL '$pvwaURL' -AuthType $authType -ExportPath '$outputFolder' -OutputCSV System_Health.csv"
        Show-ScriptStatus -ScriptName "System-Health.ps1" -Status "Executing: $command" -Color "Green"
        
        Invoke-Expression $command
        
        Show-ScriptStatus -ScriptName "System-Health.ps1" -Status "Completed" -Color "Green"
    }
    catch {
        Show-ScriptStatus -ScriptName "System-Health.ps1" -Status "Error: $_" -Color "Red"
    }
    finally {
        Set-Location -Path $currentLocation
    }
}

# Script 2: Safe Management
Write-Host "`n[2/12] Safe Management Script" -ForegroundColor Yellow
$runScript = Read-Host "Do you want to run Safe-Management.ps1? (Y/N) [Y]"
if ($runScript -eq "" -or $runScript -eq "Y" -or $runScript -eq "y") {
    $currentLocation = Get-Location
    try {
        Set-Location -Path "Safe Management"
        
        # Run Safe-Management.ps1
        $command = "./Safe-Management.ps1 -PVWAURL '$pvwaURL' -AuthType $authType -Report -OutputPath '$outputFolder/Safes.csv'"
        Show-ScriptStatus -ScriptName "Safe-Management.ps1" -Status "Executing: $command" -Color "Green"
        
        Invoke-Expression $command
        
        Show-ScriptStatus -ScriptName "Safe-Management.ps1" -Status "Completed" -Color "Green"
    }
    catch {
        Show-ScriptStatus -ScriptName "Safe-Management.ps1" -Status "Error: $_" -Color "Red"
    }
    finally {
        Set-Location -Path $currentLocation
    }
}

# Script 3: Get Accounts
Write-Host "`n[3/12] Get Accounts Script" -ForegroundColor Yellow
$runScript = Read-Host "Do you want to run Get-Accounts.ps1? (Y/N) [Y]"
if ($runScript -eq "" -or $runScript -eq "Y" -or $runScript -eq "y") {
    $currentLocation = Get-Location
    try {
        Set-Location -Path "Get Accounts"
        
        # Run Get-Accounts.ps1
        $command = "./Get-Accounts.ps1 -PVWAURL '$pvwaURL' -List -Report -AutoNextPage -CSVPath '$outputFolder/Accounts.csv'"
        Show-ScriptStatus -ScriptName "Get-Accounts.ps1" -Status "Executing: $command" -Color "Green"
        
        Invoke-Expression $command
        
        Show-ScriptStatus -ScriptName "Get-Accounts.ps1" -Status "Completed" -Color "Green"
    }
    catch {
        Show-ScriptStatus -ScriptName "Get-Accounts.ps1" -Status "Error: $_" -Color "Red"
    }
    finally {
        Set-Location -Path $currentLocation
    }
}

# Script 4: Get Account Risk Report
Write-Host "`n[4/12] Account Risk Report Script" -ForegroundColor Yellow
$runScript = Read-Host "Do you want to run Get-AccountReport.ps1? (Y/N) [Y]"
if ($runScript -eq "" -or $runScript -eq "Y" -or $runScript -eq "y") {
    $currentLocation = Get-Location
    try {
        Set-Location -Path "Reports/Accounts"
        
        # Run Get-AccountReport.ps1
        $command = "./Get-AccountReport.ps1 -PVWAAddress '$pvwaURL' -PVWAAuthType $authType -ReportPath '$outputFolder/Accounts_Risk.csv' -allProps"
        Show-ScriptStatus -ScriptName "Get-AccountReport.ps1" -Status "Executing: $command" -Color "Green"
        
        Invoke-Expression $command
        
        Show-ScriptStatus -ScriptName "Get-AccountReport.ps1" -Status "Completed" -Color "Green"
    }
    catch {
        Show-ScriptStatus -ScriptName "Get-AccountReport.ps1" -Status "Error: $_" -Color "Red"
    }
    finally {
        Set-Location -Path $currentLocation
    }
}

# Script 5: Get User Activity Report
Write-Host "`n[5/12] User Activity Report Script" -ForegroundColor Yellow
$runScript = Read-Host "Do you want to run Get-UsersActivityReport.ps1? (Y/N) [Y]"
if ($runScript -eq "" -or $runScript -eq "Y" -or $runScript -eq "y") {
    $currentLocation = Get-Location
    try {
        Set-Location -Path "User Management"
        
        # Get number of days for history
        Write-Host "Enter number of days of history to extract (default: 30): " -ForegroundColor Cyan -NoNewline
        $days = Read-Host
        if ([string]::IsNullOrWhiteSpace($days)) {
            $days = 30
        }
        
        # Run Get-UsersActivityReport.ps1
        $command = "./Get-UsersActivityReport.ps1 -PVWA '$pvwaURL' -AuthType $authType -Days $days -ExportPath '$outputFolder' -OutputCSV Users_Activity.csv"
        Show-ScriptStatus -ScriptName "Get-UsersActivityReport.ps1" -Status "Executing: $command" -Color "Green"
        
        Invoke-Expression $command
        
        Show-ScriptStatus -ScriptName "Get-UsersActivityReport.ps1" -Status "Completed" -Color "Green"
    }
    catch {
        Show-ScriptStatus -ScriptName "Get-UsersActivityReport.ps1" -Status "Error: $_" -Color "Red"
    }
    finally {
        Set-Location -Path $currentLocation
    }
}

# Script 6: PSM Sessions Management
Write-Host "`n[6/12] PSM Sessions Management Script" -ForegroundColor Yellow
$runScript = Read-Host "Do you want to run PSM-SessionsManagement.ps1? (Y/N) [Y]"
if ($runScript -eq "" -or $runScript -eq "Y" -or $runScript -eq "y") {
    $currentLocation = Get-Location
    try {
        Set-Location -Path "PSM Sessions Management"
        
        # Get number of days for history
        Write-Host "Enter number of days of history to extract (default: 30): " -ForegroundColor Cyan -NoNewline
        $days = Read-Host
        if ([string]::IsNullOrWhiteSpace($days)) {
            $days = 30
        }
        
        # Run PSM-SessionsManagement.ps1
        $command = "./PSM-SessionsManagement.ps1 -PVWA '$pvwaURL' -AuthType $authType -Days $days -ExportPath '$outputFolder' -OutputCSV PSM_Sessions.csv"
        Show-ScriptStatus -ScriptName "PSM-SessionsManagement.ps1" -Status "Executing: $command" -Color "Green"
        
        Invoke-Expression $command
        
        Show-ScriptStatus -ScriptName "PSM-SessionsManagement.ps1" -Status "Completed" -Color "Green"
    }
    catch {
        Show-ScriptStatus -ScriptName "PSM-SessionsManagement.ps1" -Status "Error: $_" -Color "Red"
    }
    finally {
        Set-Location -Path $currentLocation
    }
}

# Script 7: Test HTML5 Gateway
Write-Host "`n[7/12] Test HTML5 Gateway Script" -ForegroundColor Yellow
$runScript = Read-Host "Do you want to run Test-HTML5Gateway.ps1? (Y/N) [Y]"
if ($runScript -eq "" -or $runScript -eq "Y" -or $runScript -eq "y") {
    $currentLocation = Get-Location
    try {
        Set-Location -Path "Test HTML5 Certificate"
        
        # Get HTML5 Gateway URL
        Write-Host "Enter the HTML5 Gateway URL (e.g., https://gateway.cyberark.local): " -ForegroundColor Cyan -NoNewline
        $gatewayURL = Read-Host
        
        while ([string]::IsNullOrWhiteSpace($gatewayURL)) {
            Write-Host "Gateway URL cannot be empty. Please enter a valid URL: " -ForegroundColor Red -NoNewline
            $gatewayURL = Read-Host
        }
        
        # Run Test-HTML5Gateway.ps1
        $command = "./Test-HTML5Certificate.ps1 -Gateway '$gatewayURL' -ExportPath '$outputFolder' -OutputCSV HTML5_Gateway_Test.csv"
        Show-ScriptStatus -ScriptName "Test-HTML5Certificate.ps1" -Status "Executing: $command" -Color "Green"
        
        Invoke-Expression $command
        
        Show-ScriptStatus -ScriptName "Test-HTML5Certificate.ps1" -Status "Completed" -Color "Green"
    }
    catch {
        Show-ScriptStatus -ScriptName "Test-HTML5Certificate.ps1" -Status "Error: $_" -Color "Red"
    }
    finally {
        Set-Location -Path $currentLocation
    }
}

# Script 8: Get Ad-Hoc Access
Write-Host "`n[8/12] Get Ad-Hoc Access Script" -ForegroundColor Yellow
$runScript = Read-Host "Do you want to run Get-AdHocAccess.ps1? (Y/N) [Y]"
if ($runScript -eq "" -or $runScript -eq "Y" -or $runScript -eq "y") {
    $currentLocation = Get-Location
    try {
        Set-Location -Path "PSM Sessions Management"
        
        # Run Get-AdHocAccess.ps1
        $command = "./Get-AdHocAccess.ps1 -PVWA '$pvwaURL' -AuthType $authType -ExportPath '$outputFolder' -OutputCSV AdHoc_Access.csv"
        Show-ScriptStatus -ScriptName "Get-AdHocAccess.ps1" -Status "Executing: $command" -Color "Green"
        
        Invoke-Expression $command
        
        Show-ScriptStatus -ScriptName "Get-AdHocAccess.ps1" -Status "Completed" -Color "Green"
    }
    catch {
        Show-ScriptStatus -ScriptName "Get-AdHocAccess.ps1" -Status "Error: $_" -Color "Red"
    }
    finally {
        Set-Location -Path $currentLocation
    }
}

# Script 9: Invoke Bulk Account Actions
Write-Host "`n[9/12] Bulk Account Actions Script" -ForegroundColor Yellow
$runScript = Read-Host "Do you want to run Invoke-BulkAccountActions.ps1? (Y/N) [Y]"
if ($runScript -eq "" -or $runScript -eq "Y" -or $runScript -eq "y") {
    $currentLocation = Get-Location
    try {
        Set-Location -Path "Get Accounts"
        
        # Run Invoke-BulkAccountActions.ps1
        $command = "./Invoke-BulkAccountActions.ps1 -PVWAURL '$pvwaURL' -AuthType $authType -AccountsAction 'Verify' -ExportPath '$outputFolder' -OutputCSV Accounts_Usage.csv"
        Show-ScriptStatus -ScriptName "Invoke-BulkAccountActions.ps1" -Status "Executing: $command" -Color "Green"
        
        Invoke-Expression $command
        
        Show-ScriptStatus -ScriptName "Invoke-BulkAccountActions.ps1" -Status "Completed" -Color "Green"
    }
    catch {
        Show-ScriptStatus -ScriptName "Invoke-BulkAccountActions.ps1" -Status "Error: $_" -Color "Red"
    }
    finally {
        Set-Location -Path $currentLocation
    }
}

# Script 10: Get Applications
Write-Host "`n[10/12] Get Applications Script" -ForegroundColor Yellow
$runScript = Read-Host "Do you want to run Get-Applications.ps1? (Y/N) [Y]"
if ($runScript -eq "" -or $runScript -eq "Y" -or $runScript -eq "y") {
    $currentLocation = Get-Location
    try {
        Set-Location -Path "AAM Applications"
        
        # Look for the script in the directory
        $applicationScript = Get-ChildItem -Path "." -Filter "Get-Applications.ps1" -Recurse | Select-Object -First 1
        if ($applicationScript) {
            $scriptPath = $applicationScript.FullName
            
            # Run Get-Applications.ps1
            $command = "$scriptPath -PVWA '$pvwaURL' -AuthType $authType -ExportPath '$outputFolder' -OutputCSV Applications.csv"
            Show-ScriptStatus -ScriptName "Get-Applications.ps1" -Status "Executing: $command" -Color "Green"
            
            Invoke-Expression $command
            
            Show-ScriptStatus -ScriptName "Get-Applications.ps1" -Status "Completed" -Color "Green"
        } else {
            Write-Host "Get-Applications.ps1 not found in AAM Applications directory." -ForegroundColor Red
            Write-Host "Please locate the script manually and run it with the following parameters:" -ForegroundColor Yellow
            Write-Host "-PVWA '$pvwaURL' -AuthType $authType -ExportPath '$outputFolder' -OutputCSV Applications.csv" -ForegroundColor Yellow
        }
    }
    catch {
        Show-ScriptStatus -ScriptName "Get-Applications.ps1" -Status "Error: $_" -Color "Red"
    }
    finally {
        Set-Location -Path $currentLocation
    }
}

# Script 11: Get CCP Performance
Write-Host "`n[11/12] Get CCP Performance Script" -ForegroundColor Yellow
$runScript = Read-Host "Do you want to run Get-CCPPerformance.ps1? (Y/N) [Y]"
if ($runScript -eq "" -or $runScript -eq "Y" -or $runScript -eq "y") {
    $currentLocation = Get-Location
    try {
        Set-Location -Path "CCP Setup"
        
        # Look for the script in the directory
        $ccpScript = Get-ChildItem -Path "." -Filter "Get-CCPPerformance.ps1" -Recurse | Select-Object -First 1
        if ($ccpScript) {
            $scriptPath = $ccpScript.FullName
            
            # Get CCP URL
            Write-Host "Enter the CCP URL (e.g., https://ccp.cyberark.local): " -ForegroundColor Cyan -NoNewline
            $ccpURL = Read-Host
            
            while ([string]::IsNullOrWhiteSpace($ccpURL)) {
                Write-Host "CCP URL cannot be empty. Please enter a valid URL: " -ForegroundColor Red -NoNewline
                $ccpURL = Read-Host
            }
            
            # Get number of days for history
            Write-Host "Enter number of days of history to extract (default: 30): " -ForegroundColor Cyan -NoNewline
            $days = Read-Host
            if ([string]::IsNullOrWhiteSpace($days)) {
                $days = 30
            }
            
            # Run Get-CCPPerformance.ps1
            $command = "$scriptPath -CCP '$ccpURL' -Days $days -ExportPath '$outputFolder' -OutputCSV CCP_Performance.csv"
            Show-ScriptStatus -ScriptName "Get-CCPPerformance.ps1" -Status "Executing: $command" -Color "Green"
            
            Invoke-Expression $command
            
            Show-ScriptStatus -ScriptName "Get-CCPPerformance.ps1" -Status "Completed" -Color "Green"
        } else {
            Write-Host "Get-CCPPerformance.ps1 not found in CCP Setup directory." -ForegroundColor Red
            Write-Host "Please locate the script manually and run it with the following parameters:" -ForegroundColor Yellow
            Write-Host "-CCP '$ccpURL' -Days $days -ExportPath '$outputFolder' -OutputCSV CCP_Performance.csv" -ForegroundColor Yellow
        }
    }
    catch {
        Show-ScriptStatus -ScriptName "Get-CCPPerformance.ps1" -Status "Error: $_" -Color "Red"
    }
    finally {
        Set-Location -Path $currentLocation
    }
}

# Script 12: Get Platforms
Write-Host "`n[12/12] Get Platforms Script" -ForegroundColor Yellow
$runScript = Read-Host "Do you want to run Get-Platforms.ps1? (Y/N) [Y]"
if ($runScript -eq "" -or $runScript -eq "Y" -or $runScript -eq "y") {
    $currentLocation = Get-Location
    try {
        Set-Location -Path "Platforms"
        
        # Look for the script in the directory
        $platformsScript = Get-ChildItem -Path "." -Filter "Get-Platforms.ps1" -Recurse | Select-Object -First 1
        if ($platformsScript) {
            $scriptPath = $platformsScript.FullName
            
            # Run Get-Platforms.ps1
            $command = "$scriptPath -PVWA '$pvwaURL' -AuthType $authType -ExportPath '$outputFolder' -OutputCSV Platforms.csv"
            Show-ScriptStatus -ScriptName "Get-Platforms.ps1" -Status "Executing: $command" -Color "Green"
            
            Invoke-Expression $command
            
            Show-ScriptStatus -ScriptName "Get-Platforms.ps1" -Status "Completed" -Color "Green"
        } else {
            Write-Host "Get-Platforms.ps1 not found in Platforms directory." -ForegroundColor Red
            Write-Host "Please locate the script manually and run it with the following parameters:" -ForegroundColor Yellow
            Write-Host "-PVWA '$pvwaURL' -AuthType $authType -ExportPath '$outputFolder' -OutputCSV Platforms.csv" -ForegroundColor Yellow
        }
    }
    catch {
        Show-ScriptStatus -ScriptName "Get-Platforms.ps1" -Status "Error: $_" -Color "Red"
    }
    finally {
        Set-Location -Path $currentLocation
    }
}

# Summary
Write-Host "`n======================================================" -ForegroundColor Yellow
Write-Host "                Script Execution Summary               " -ForegroundColor Yellow
Write-Host "======================================================" -ForegroundColor Yellow
Write-Host "All scripts have been executed. CSV files are available in: $outputFolder" -ForegroundColor Green
Write-Host "`nThese files can now be uploaded to the CyberArk Dashboard to populate all dashboards at 100%." -ForegroundColor White
Write-Host "======================================================" -ForegroundColor Yellow 