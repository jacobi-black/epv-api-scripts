# Script simplifié pour générer les rapports CyberArk
# Cette version n'essaie pas de partager l'authentification entre les scripts

# Configuration
$PVWA_URL = "https://accessqa.st.com/PasswordVault/"
$EXPORT_DIR = "C:\tmp"

# Créer le dossier d'export si nécessaire
if(-not (Test-Path -Path $EXPORT_DIR)) {
    New-Item -Path $EXPORT_DIR -ItemType Directory -Force | Out-Null
    Write-Host "Dossier d'export créé: $EXPORT_DIR" -ForegroundColor Green
}

# Vérifier si les scripts existent et afficher un message d'erreur si ce n'est pas le cas
function Test-ScriptExists {
    param($Path)
    
    if (Test-Path $Path) {
        return $true
    } else {
        Write-Host "ERREUR: Le script $Path n'existe pas" -ForegroundColor Red
        return $false
    }
}

# Demander les identifiants une fois pour les afficher à l'utilisateur
$AuthType = "CyberArk"  # Peut être CyberArk, LDAP ou RADIUS
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "Vous aurez besoin de vos identifiants CyberArk pour chaque script." -ForegroundColor Yellow
Write-Host "Type d'authentification: $AuthType" -ForegroundColor Yellow
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Fonction pour exécuter les commandes avec gestion d'erreurs simple
function Run-Command {
    param (
        [string]$Description,
        [string]$ScriptPath,
        [hashtable]$Parameters
    )
    
    Write-Host "--- $Description ---" -ForegroundColor Cyan
    Write-Host "Exécution de: $ScriptPath" -ForegroundColor Yellow
    
    try {
        & $ScriptPath @Parameters
        Write-Host "Terminé avec succès" -ForegroundColor Green
    } catch {
        Write-Host "ERREUR: $_" -ForegroundColor Red
        $_.Exception.Message | Out-File -FilePath "$EXPORT_DIR\erreurs.log" -Append
    }
    
    Write-Host ""
}

# 1. Rapport des comptes
$accountReportPath = ".\Reports\Accounts\Get-AccountReport.ps1"
if (Test-ScriptExists $accountReportPath) {
    $params = @{
        ReportPath = "$EXPORT_DIR\AccountReport.csv"
        PVWAAddress = $PVWA_URL
        allProps = $true
    }
    Run-Command -Description "Rapport des comptes" -ScriptPath $accountReportPath -Parameters $params
}

# 2. Rapport des membres de coffres
$safeMemberReportPath = ".\Reports\Safes\Get-SafeMemberReport.ps1"
if (Test-ScriptExists $safeMemberReportPath) {
    $params = @{
        ReportPath = "$EXPORT_DIR\SafeMemberReport.csv"
        PVWAAddress = $PVWA_URL
        IncludeGroups = $true
        IncludeApps = $true
    }
    Run-Command -Description "Rapport des membres de coffres" -ScriptPath $safeMemberReportPath -Parameters $params
}

# 3. Rapport des comptes découverts
$discoveredAccountsPath = ".\Discovered Accounts\Get-DiscoveredAccountsReport.ps1"
if (Test-ScriptExists $discoveredAccountsPath) {
    $params = @{
        PVWAURL = $PVWA_URL
        List = $true
        CSVPath = "$EXPORT_DIR\DiscoveredAccounts.csv"
        AuthType = $AuthType
        AutoNextPage = $true
    }
    Run-Command -Description "Rapport des comptes découverts" -ScriptPath $discoveredAccountsPath -Parameters $params
}

# 4. Rapport des utilisateurs inactifs
$inactiveUsersPath = ".\User Management\Get-InactiveUsersReport.ps1"
if (Test-ScriptExists $inactiveUsersPath) {
    $params = @{
        PVWAURL = $PVWA_URL
        CSVPath = "$EXPORT_DIR\InactiveUsers.csv"
        AuthType = $AuthType
        InactiveDays = 30
    }
    Run-Command -Description "Rapport des utilisateurs inactifs" -ScriptPath $inactiveUsersPath -Parameters $params
}

# 5. Rapport des plateformes
$platformReportPath = ".\Platforms\Get-PlatformReport.ps1"
if (Test-ScriptExists $platformReportPath) {
    $params = @{
        PVWAURL = $PVWA_URL
        CSVPath = "$EXPORT_DIR\PlatformReport.csv"
        AuthType = $AuthType
        ExtendedReport = $true
        IncludeInactive = $true
    }
    Run-Command -Description "Rapport des plateformes" -ScriptPath $platformReportPath -Parameters $params
}

# 6. Rapport des risques de comptes - Vérifier plusieurs noms possibles
$riskReportPath = $null
$riskReportPaths = @(
    ".\Security Events\Get-AccountsRiskReport.ps1", 
    ".\Security Events\Get-AccoutnsRiskReport.ps1"
)

foreach ($path in $riskReportPaths) {
    if (Test-Path $path) {
        $riskReportPath = $path
        break
    }
}

if ($riskReportPath) {
    $params = @{
        PVWAURL = $PVWA_URL
        CSVPath = "$EXPORT_DIR\AccountRiskReport.csv"
        AuthType = $AuthType
        EventsDaysFilter = 30
    }
    Run-Command -Description "Rapport des risques de comptes" -ScriptPath $riskReportPath -Parameters $params
} else {
    Write-Host "ERREUR: Aucun script de rapport de risque trouvé" -ForegroundColor Red
    "Script de rapport de risque non trouvé" | Out-File -FilePath "$EXPORT_DIR\erreurs.log" -Append
}

# 7. Rapport des sessions PSM
$psmSessionsPath = ".\PSM Sessions Management\PSM-SessionsManagement.ps1"
if (Test-ScriptExists $psmSessionsPath) {
    $params = @{
        PVWAURL = $PVWA_URL
        List = $true
        CSVPath = "$EXPORT_DIR\PSMSessions.csv"
        AuthType = $AuthType
        PSMServerName = "PSMServer"  # Remplacez par votre serveur PSM réel
    }
    Run-Command -Description "Rapport des sessions PSM" -ScriptPath $psmSessionsPath -Parameters $params
}

# 8. Rapport des applications AAM
$aamAppsPath = ".\AAM Applications\Export-Import-Applications.ps1"
if (Test-ScriptExists $aamAppsPath) {
    $params = @{
        PVWAURL = $PVWA_URL
        Export = $true
        CSVPath = "$EXPORT_DIR\AAMApplications.csv"
        AuthType = $AuthType
    }
    Run-Command -Description "Rapport des applications AAM" -ScriptPath $aamAppsPath -Parameters $params
}

# 9. Rapport d'optimisation des adresses
$optimizeAddressPath = ".\Optimize Address\Optimize-Addresses.ps1"
if (Test-ScriptExists $optimizeAddressPath) {
    $params = @{
        PVWAAddress = $PVWA_URL
        ExportToCSV = $true
        CSVPath = "$EXPORT_DIR\AddressOptimization.csv"
        ShowAllResults = $true
    }
    Run-Command -Description "Rapport d'optimisation des adresses" -ScriptPath $optimizeAddressPath -Parameters $params
}

# 10. Rapport de tous les comptes
$getAccountsPath = ".\Get Accounts\Get-Accounts.ps1"
if (Test-ScriptExists $getAccountsPath) {
    $params = @{
        PVWAURL = $PVWA_URL
        List = $true
        Report = $true
        CSVPath = "$EXPORT_DIR\AllAccounts.csv"
        SortBy = "UserName"
        AutoNextPage = $true
    }
    Run-Command -Description "Rapport de tous les comptes" -ScriptPath $getAccountsPath -Parameters $params
}

# Afficher un résumé des rapports générés
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "Résumé des rapports générés:" -ForegroundColor Cyan
$csvFiles = Get-ChildItem -Path $EXPORT_DIR -Filter "*.csv"
if ($csvFiles.Count -eq 0) {
    Write-Host "Aucun rapport CSV généré. Vérifiez le fichier erreurs.log" -ForegroundColor Red
} else {
    $csvFiles | ForEach-Object { Write-Host "- $($_.Name)" -ForegroundColor White }
}

# Vérifier s'il y a eu des erreurs
if (Test-Path "$EXPORT_DIR\erreurs.log") {
    Write-Host "`nAttention: Des erreurs ont été détectées. Consultez le fichier $EXPORT_DIR\erreurs.log" -ForegroundColor Red
} 