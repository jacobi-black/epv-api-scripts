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
    param ($Description, $Command)
    
    Write-Host "--- $Description ---" -ForegroundColor Cyan
    Write-Host "Exécution de: $Command" -ForegroundColor Yellow
    
    try {
        Invoke-Expression $Command
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
    Run-Command "Rapport des comptes" "& `"$accountReportPath`" -ReportPath `"$EXPORT_DIR\AccountReport.csv`" -PVWAAddress $PVWA_URL -allProps"
}

# 2. Rapport des membres de coffres
$safeMemberReportPath = ".\Reports\Safes\Get-SafeMemberReport.ps1"
if (Test-ScriptExists $safeMemberReportPath) {
    Run-Command "Rapport des membres de coffres" "& `"$safeMemberReportPath`" -ReportPath `"$EXPORT_DIR\SafeMemberReport.csv`" -PVWAAddress $PVWA_URL -IncludeGroups -IncludeApps"
}

# 3. Rapport des comptes découverts
$discoveredAccountsPath = ".\Discovered Accounts\Get-DiscoveredAccountsReport.ps1"
if (Test-ScriptExists $discoveredAccountsPath) {
    Run-Command "Rapport des comptes découverts" "& `"$discoveredAccountsPath`" -PVWAURL $PVWA_URL -List -CSVPath `"$EXPORT_DIR\DiscoveredAccounts.csv`" -AuthType $AuthType -AutoNextPage"
}

# 4. Rapport des utilisateurs inactifs
$inactiveUsersPath = ".\User Management\Get-InactiveUsersReport.ps1"
if (Test-ScriptExists $inactiveUsersPath) {
    Run-Command "Rapport des utilisateurs inactifs" "& `"$inactiveUsersPath`" -PVWAURL $PVWA_URL -CSVPath `"$EXPORT_DIR\InactiveUsers.csv`" -AuthType $AuthType -InactiveDays 30"
}

# 5. Rapport des plateformes
$platformReportPath = ".\Platforms\Get-PlatformReport.ps1"
if (Test-ScriptExists $platformReportPath) {
    Run-Command "Rapport des plateformes" "& `"$platformReportPath`" -PVWAURL $PVWA_URL -CSVPath `"$EXPORT_DIR\PlatformReport.csv`" -AuthType $AuthType -ExtendedReport -IncludeInactive"
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
    Run-Command "Rapport des risques de comptes" "& `"$riskReportPath`" -PVWAURL $PVWA_URL -CSVPath `"$EXPORT_DIR\AccountRiskReport.csv`" -AuthType $AuthType -EventsDaysFilter 30"
} else {
    Write-Host "ERREUR: Aucun script de rapport de risque trouvé" -ForegroundColor Red
    "Script de rapport de risque non trouvé" | Out-File -FilePath "$EXPORT_DIR\erreurs.log" -Append
}

# 7. Rapport des sessions PSM
$psmSessionsPath = ".\PSM Sessions Management\PSM-SessionsManagement.ps1"
if (Test-ScriptExists $psmSessionsPath) {
    # Remplacez "PSMServer" par votre serveur PSM réel
    Run-Command "Rapport des sessions PSM" "& `"$psmSessionsPath`" -PVWAURL $PVWA_URL -List -CSVPath `"$EXPORT_DIR\PSMSessions.csv`" -AuthType $AuthType -PSMServerName `"PSMServer`""
}

# 8. Rapport des applications AAM
$aamAppsPath = ".\AAM Applications\Export-Import-Applications.ps1"
if (Test-ScriptExists $aamAppsPath) {
    Run-Command "Rapport des applications AAM" "& `"$aamAppsPath`" -PVWAURL $PVWA_URL -Export -CSVPath `"$EXPORT_DIR\AAMApplications.csv`" -AuthType $AuthType"
}

# 9. Rapport d'optimisation des adresses
$optimizeAddressPath = ".\Optimize Address\Optimize-Addresses.ps1"
if (Test-ScriptExists $optimizeAddressPath) {
    Run-Command "Rapport d'optimisation des adresses" "& `"$optimizeAddressPath`" -PVWAAddress $PVWA_URL -ExportToCSV -CSVPath `"$EXPORT_DIR\AddressOptimization.csv`" -ShowAllResults"
}

# 10. Rapport de tous les comptes
$getAccountsPath = ".\Get Accounts\Get-Accounts.ps1"
if (Test-ScriptExists $getAccountsPath) {
    Run-Command "Rapport de tous les comptes" "& `"$getAccountsPath`" -PVWAURL $PVWA_URL -List -Report -CSVPath `"$EXPORT_DIR\AllAccounts.csv`" -SortBy `"UserName`" -AutoNextPage"
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