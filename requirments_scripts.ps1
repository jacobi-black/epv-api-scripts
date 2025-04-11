# PowerShell Script to Run All Required Scripts for CyberArk Dashboards
# This script will run all necessary scripts to populate the dashboards to 100%

# Fonction pour rechercher un script dans plusieurs emplacements possibles
function Find-ScriptInPaths {
    param (
        [Parameter(Mandatory=$true)]
        [string]$ScriptName,
        [string[]]$InitialPaths = @(".", ".."),
        [int]$MaxDepth = 3
    )
    
    # Chemins possibles où le script pourrait se trouver
    $searchPaths = $InitialPaths
    $searchPaths += @(
        "Scripts",
        "PowerShell",
        "CyberArk",
        "EPV Scripts", 
        "Reports",
        "Tools",
        "AAM Applications",
        "User Management",
        "CCP Setup",
        "Platforms",
        "System Health",
        "PSM Sessions Management",
        "Get Accounts"
    )
    
    $scriptPath = $null
    
    # Recherche dans les chemins spécifiques d'abord
    foreach ($path in $searchPaths) {
        if (Test-Path -Path $path) {
            $script = Get-ChildItem -Path $path -Filter $ScriptName -Recurse -Depth $MaxDepth -ErrorAction SilentlyContinue | Select-Object -First 1
            if ($script) {
                $scriptPath = $script.FullName
                break
            }
        }
    }
    
    # Si script non trouvé, recherche récursive plus large
    if (-not $scriptPath) {
        $startDir = Get-Location
        for ($i = 0; $i -lt $MaxDepth; $i++) {
            $searchDir = $startDir
            for ($j = 0; $j -lt $i; $j++) {
                $searchDir = Split-Path -Parent $searchDir
            }
            
            if (Test-Path $searchDir) {
                $script = Get-ChildItem -Path $searchDir -Filter $ScriptName -Recurse -Depth $MaxDepth -ErrorAction SilentlyContinue | Select-Object -First 1
                if ($script) {
                    $scriptPath = $script.FullName
                    break
                }
            }
        }
    }
    
    return $scriptPath
}

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
    
    # Assurez-vous que l'URL n'a pas de slash final
    if ($pvwaURL.EndsWith("/")) {
        $pvwaURL = $pvwaURL.TrimEnd("/")
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
        "2" { return "ldap" }     # Convertir en minuscules
        "3" { return "radius" }   # Convertir en minuscules
        default { return "cyberark" }  # Convertir en minuscules
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

# Variable globale pour stocker la session logon (token)
$Global:logonToken = $null

# Fonction pour se connecter à l'API REST et obtenir un jeton
function Get-LogonToken {
    param (
        [string]$PVWAURL,
        [string]$AuthType,
        [System.Management.Automation.PSCredential]$Credentials
    )
    
    # Si on a déjà un token, on le retourne directement
    if ($null -ne $Global:logonToken) {
        return $Global:logonToken
    }
    
    try {
        # Construire l'URL de logon
        $logonURL = "$PVWAURL/WebServices/auth/Cyberark/CyberArkAuthenticationService.svc/Logon"
        
        # Construire le corps de la requête en fonction du type d'authentification
        $username = $Credentials.UserName
        $password = $Credentials.GetNetworkCredential().Password
        
        $bodyParams = @{
            username = $username
            password = $password
        }
        
        if ($AuthType -eq "cyberark") {
            $bodyParams.Add("useRadiusAuthentication", "false")
        } elseif ($AuthType -eq "radius") {
            $bodyParams.Add("useRadiusAuthentication", "true")
        } elseif ($AuthType -eq "ldap") {
            $logonURL = "$PVWAURL/WebServices/auth/LDAP/CyberArkAuthenticationService.svc/Logon"
        }
        
        $body = $bodyParams | ConvertTo-Json
        
        # Définir les en-têtes pour la requête
        $headers = @{
            "Content-Type" = "application/json"
        }
        
        # Exécuter la requête de logon
        $response = Invoke-RestMethod -Uri $logonURL -Method Post -Body $body -Headers $headers -ContentType "application/json" -ErrorAction Stop
        
        # Stocker le jeton pour une utilisation ultérieure
        $Global:logonToken = $response.CyberArkLogonResult
        
        return $Global:logonToken
    }
    catch {
        Write-Host "Erreur lors de la connexion à l'API REST: $_" -ForegroundColor Red
        return $null
    }
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
$authType = $authType.ToLower()  # Convertir en minuscules

# Obtenir les identifiants une seule fois
$credentials = Get-CyberArkCredentials
$securePassword = $credentials.Password
$username = $credentials.UserName

# Script 1: System-Health.ps1
Write-Host "`n[1/11] System Health Script" -ForegroundColor Yellow
$runScript = Read-Host "Do you want to run System-Health.ps1? (Y/N) [Y]"
if ($runScript -eq "" -or $runScript -eq "Y" -or $runScript -eq "y") {
    $currentLocation = Get-Location
    try {
        Set-Location -Path "System Health"
        
        # Run System-Health.ps1
        $command = "./System-Health.ps1 -PVWAURL '$pvwaURL' -AuthType $authType -PVWACredentials `$credentials -ExportPath '$outputFolder' -OutputCSV System_Health.csv"
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
Write-Host "`n[2/11] Safe Management Script" -ForegroundColor Yellow
$runScript = Read-Host "Do you want to run Safe-Management.ps1? (Y/N) [Y]"
if ($runScript -eq "" -or $runScript -eq "Y" -or $runScript -eq "y") {
    $currentLocation = Get-Location
    try {
        Set-Location -Path "Safe Management"
        
        # Obtenir un token de connexion et le passer au script
        $token = Get-LogonToken -PVWAURL $pvwaURL -AuthType $authType -Credentials $credentials
        
        if ($token) {
            # Run Safe-Management.ps1 avec le token
            $command = "./Safe-Management.ps1 -PVWAURL '$pvwaURL' -AuthType $authType -PVWACredentials `$credentials -Report -OutputPath '$outputFolder/Safes.csv'"
            Show-ScriptStatus -ScriptName "Safe-Management.ps1" -Status "Executing: $command" -Color "Green"
            
            Invoke-Expression $command
            
            Show-ScriptStatus -ScriptName "Safe-Management.ps1" -Status "Completed" -Color "Green"
        } else {
            Show-ScriptStatus -ScriptName "Safe-Management.ps1" -Status "Failed to obtain logon token" -Color "Red"
        }
    }
    catch {
        Show-ScriptStatus -ScriptName "Safe-Management.ps1" -Status "Error: $_" -Color "Red"
    }
    finally {
        Set-Location -Path $currentLocation
    }
}

# Script 3: Get Accounts
Write-Host "`n[3/11] Get Accounts Script" -ForegroundColor Yellow
$runScript = Read-Host "Do you want to run Get-Accounts.ps1? (Y/N) [Y]"
if ($runScript -eq "" -or $runScript -eq "Y" -or $runScript -eq "y") {
    $currentLocation = Get-Location
    try {
        Set-Location -Path "Get Accounts"
        
        # Obtenir un token de connexion
        $token = Get-LogonToken -PVWAURL $pvwaURL -AuthType $authType -Credentials $credentials
        
        if ($token) {
            # Attention: on retire le paramètre -List pour éviter l'erreur 405
            $command = "./Get-Accounts.ps1 -PVWAURL '$pvwaURL' -AuthType $authType -PVWACredentials `$credentials -Report -AutoNextPage -CSVPath '$outputFolder/Accounts.csv'"
            Show-ScriptStatus -ScriptName "Get-Accounts.ps1" -Status "Executing: $command" -Color "Green"
            
            Invoke-Expression $command
            
            Show-ScriptStatus -ScriptName "Get-Accounts.ps1" -Status "Completed" -Color "Green"
        } else {
            Show-ScriptStatus -ScriptName "Get-Accounts.ps1" -Status "Failed to obtain logon token" -Color "Red"
        }
    }
    catch {
        Show-ScriptStatus -ScriptName "Get-Accounts.ps1" -Status "Error: $_" -Color "Red"
    }
    finally {
        Set-Location -Path $currentLocation
    }
}

# Script 4: Get Account Risk Report
Write-Host "`n[4/11] Account Risk Report Script" -ForegroundColor Yellow
$runScript = Read-Host "Do you want to run Get-AccountReport.ps1? (Y/N) [Y]"
if ($runScript -eq "" -or $runScript -eq "Y" -or $runScript -eq "y") {
    $currentLocation = Get-Location
    try {
        Set-Location -Path "Reports/Accounts"
        
        # Run Get-AccountReport.ps1
        $command = "./Get-AccountReport.ps1 -PVWAAddress '$pvwaURL' -PVWAAuthType $authType -PVWACredentials `$credentials -ReportPath '$outputFolder/Accounts_Risk.csv' -allProps"
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
Write-Host "`n[5/11] User Activity Report Script" -ForegroundColor Yellow
$runScript = Read-Host "Do you want to run Get-UsersActivityReport.ps1? (Y/N) [Y]"
if ($runScript -eq "" -or $runScript -eq "Y" -or $runScript -eq "y") {
    $currentLocation = Get-Location
    try {
        # Get number of days for history
        Write-Host "Enter number of days of history to extract (default: 30): " -ForegroundColor Cyan -NoNewline
        $days = Read-Host
        if ([string]::IsNullOrWhiteSpace($days)) {
            $days = 30
        }
        
        # Recherche avancée du script
        $scriptPath = Find-ScriptInPaths -ScriptName "Get-UsersActivityReport.ps1"
        
        if ($scriptPath) {
            # Run Get-UsersActivityReport.ps1
            $command = "& '$scriptPath' -PVWA '$pvwaURL' -AuthType $authType -PVWACredentials `$credentials -Days $days -ExportPath '$outputFolder' -OutputCSV Users_Activity.csv"
            Show-ScriptStatus -ScriptName "Get-UsersActivityReport.ps1" -Status "Found at: $scriptPath" -Color "Green"
            Show-ScriptStatus -ScriptName "Get-UsersActivityReport.ps1" -Status "Executing command" -Color "Green"
            
            Invoke-Expression $command
            
            Show-ScriptStatus -ScriptName "Get-UsersActivityReport.ps1" -Status "Completed" -Color "Green"
        } else {
            Write-Host "Get-UsersActivityReport.ps1 not found in the directory structure." -ForegroundColor Red
            Write-Host "Please locate the script manually and run it with the following parameters:" -ForegroundColor Yellow
            Write-Host "-PVWA '$pvwaURL' -AuthType $authType -Days $days -ExportPath '$outputFolder' -OutputCSV Users_Activity.csv" -ForegroundColor Yellow
        }
    }
    catch {
        Show-ScriptStatus -ScriptName "Get-UsersActivityReport.ps1" -Status "Error: $_" -Color "Red"
    }
    finally {
        Set-Location -Path $currentLocation
    }
}

# Script 6: PSM Sessions Management
Write-Host "`n[6/11] PSM Sessions Management Script" -ForegroundColor Yellow
$runScript = Read-Host "Do you want to run PSM-SessionsManagement.ps1? (Y/N) [Y]"
if ($runScript -eq "" -or $runScript -eq "Y" -or $runScript -eq "y") {
    $currentLocation = Get-Location
    try {
        Set-Location -Path "PSM Sessions Management"
        
        # Modifié pour utiliser le paramètre -List au lieu de -Days (qui n'est pas reconnu)
        $command = "./PSM-SessionsManagement.ps1 -PVWA '$pvwaURL' -AuthType $authType -PVWACredentials `$credentials -List -ExportPath '$outputFolder' -OutputCSV PSM_Sessions.csv"
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
Write-Host "`n[7/11] Test HTML5 Gateway Script" -ForegroundColor Yellow
$runScript = Read-Host "Do you want to run Test-HTML5Certificate.ps1? (Y/N) [Y]"
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
        
        # Run Test-HTML5Certificate.ps1
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

# Script 8: Invoke Bulk Account Actions
Write-Host "`n[8/11] Bulk Account Actions Script" -ForegroundColor Yellow
$runScript = Read-Host "Do you want to run Invoke-BulkAccountActions.ps1? (Y/N) [Y]"
if ($runScript -eq "" -or $runScript -eq "Y" -or $runScript -eq "y") {
    $currentLocation = Get-Location
    try {
        Set-Location -Path "Get Accounts"
        
        # Run Invoke-BulkAccountActions.ps1
        $command = "./Invoke-BulkAccountActions.ps1 -PVWAURL '$pvwaURL' -AuthType $authType -PVWACredentials `$credentials -AccountsAction 'Verify' -OutputCSV '$outputFolder/Accounts_Usage.csv'"
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

# Script 9: Get Applications
Write-Host "`n[9/11] Get Applications Script" -ForegroundColor Yellow
$runScript = Read-Host "Do you want to run Get-Applications.ps1? (Y/N) [Y]"
if ($runScript -eq "" -or $runScript -eq "Y" -or $runScript -eq "y") {
    $currentLocation = Get-Location
    try {
        # Recherche avancée du script
        $scriptPath = Find-ScriptInPaths -ScriptName "Get-Applications.ps1"
        
        if ($scriptPath) {
            # Run Get-Applications.ps1
            $command = "& '$scriptPath' -PVWA '$pvwaURL' -AuthType $authType -PVWACredentials `$credentials -ExportPath '$outputFolder' -OutputCSV Applications.csv"
            Show-ScriptStatus -ScriptName "Get-Applications.ps1" -Status "Found at: $scriptPath" -Color "Green"
            Show-ScriptStatus -ScriptName "Get-Applications.ps1" -Status "Executing command" -Color "Green"
            
            Invoke-Expression $command
            
            Show-ScriptStatus -ScriptName "Get-Applications.ps1" -Status "Completed" -Color "Green"
        } else {
            Write-Host "Get-Applications.ps1 not found in the directory structure." -ForegroundColor Red
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

# Script 10: Get CCP Performance
Write-Host "`n[10/11] Get CCP Performance Script" -ForegroundColor Yellow
$runScript = Read-Host "Do you want to run Get-CCPPerformance.ps1? (Y/N) [Y]"
if ($runScript -eq "" -or $runScript -eq "Y" -or $runScript -eq "y") {
    $currentLocation = Get-Location
    try {
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
        
        # Recherche avancée du script
        $scriptPath = Find-ScriptInPaths -ScriptName "Get-CCPPerformance.ps1"
        
        if ($scriptPath) {
            # Run Get-CCPPerformance.ps1
            $command = "& '$scriptPath' -CCP '$ccpURL' -Days $days -ExportPath '$outputFolder' -OutputCSV CCP_Performance.csv"
            Show-ScriptStatus -ScriptName "Get-CCPPerformance.ps1" -Status "Found at: $scriptPath" -Color "Green"
            Show-ScriptStatus -ScriptName "Get-CCPPerformance.ps1" -Status "Executing command" -Color "Green"
            
            Invoke-Expression $command
            
            Show-ScriptStatus -ScriptName "Get-CCPPerformance.ps1" -Status "Completed" -Color "Green"
        } else {
            Write-Host "Get-CCPPerformance.ps1 not found in the directory structure." -ForegroundColor Red
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

# Script 11: Get Platforms
Write-Host "`n[11/11] Get Platforms Script" -ForegroundColor Yellow
$runScript = Read-Host "Do you want to run Get-Platforms.ps1? (Y/N) [Y]"
if ($runScript -eq "" -or $runScript -eq "Y" -or $runScript -eq "y") {
    $currentLocation = Get-Location
    try {
        # Recherche avancée du script
        $scriptPath = Find-ScriptInPaths -ScriptName "Get-Platforms.ps1"
        
        if ($scriptPath) {
            # Run Get-Platforms.ps1
            $command = "& '$scriptPath' -PVWA '$pvwaURL' -AuthType $authType -PVWACredentials `$credentials -ExportPath '$outputFolder' -OutputCSV Platforms.csv"
            Show-ScriptStatus -ScriptName "Get-Platforms.ps1" -Status "Found at: $scriptPath" -Color "Green"
            Show-ScriptStatus -ScriptName "Get-Platforms.ps1" -Status "Executing command" -Color "Green"
            
            Invoke-Expression $command
            
            Show-ScriptStatus -ScriptName "Get-Platforms.ps1" -Status "Completed" -Color "Green"
        } else {
            Write-Host "Get-Platforms.ps1 not found in the directory structure." -ForegroundColor Red
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