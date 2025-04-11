$PVWA_URL = "https://votre-pvwa.domaine.com/PasswordVault"
$EXPORT_DIR = "C:\tmp"

# Variables pour l'authentification centralisée
$AuthType = "CyberArk" # Peut être CyberArk, LDAP ou RADIUS
$Credential = Get-Credential -Message "Entrez vos identifiants pour CyberArk"

# Création du dossier d'export
New-Item -Path $EXPORT_DIR -ItemType Directory -Force

# Fonction simple pour exécuter un script avec gestion d'erreurs
function Execute-Script {
    param($Path, $Arguments)
    Write-Host "Exécution de $Path..." -ForegroundColor Yellow
    try {
        & $Path @Arguments
        Write-Host "Exécution réussie" -ForegroundColor Green
    }
    catch {
        Write-Host "ERREUR lors de l'exécution de $Path : $_" -ForegroundColor Red
        $ErrorMessage = $_.Exception.Message
        $ErrorMessage | Out-File -FilePath "$EXPORT_DIR\erreurs.log" -Append
    }
    Write-Host "-------------------------------------" -ForegroundColor Gray
}

# 1. Rapport des comptes
Execute-Script -Path ".\Reports\Accounts\Get-AccountReport.ps1" -Arguments @{
    ReportPath = "$EXPORT_DIR\AccountReport.csv"
    PVWAAddress = $PVWA_URL
    allProps = $true
    PVWACredentials = $Credential
    PVWAAuthType = $AuthType
}

# 2. Rapport des membres de coffres
Execute-Script -Path ".\Reports\Safes\Get-SafeMemberReport.ps1" -Arguments @{
    ReportPath = "$EXPORT_DIR\SafeMemberReport.csv"
    PVWAAddress = $PVWA_URL
    IncludeGroups = $true
    IncludeApps = $true
    PVWACredentials = $Credential
    PVWAAuthType = $AuthType
}

# 3. Rapport des comptes découverts
Execute-Script -Path ".\Discovered Accounts\Get-DiscoveredAccountsReport.ps1" -Arguments @{
    PVWAURL = $PVWA_URL
    List = $true
    CSVPath = "$EXPORT_DIR\DiscoveredAccounts.csv"
    AuthType = $AuthType
    AutoNextPage = $true
}

# 4. Rapport des utilisateurs inactifs
Execute-Script -Path ".\User Management\Get-InactiveUsersReport.ps1" -Arguments @{
    PVWAURL = $PVWA_URL
    CSVPath = "$EXPORT_DIR\InactiveUsers.csv"
    AuthType = $AuthType
    InactiveDays = 30
}

# 5. Rapport des plateformes
Execute-Script -Path ".\Platforms\Get-PlatformReport.ps1" -Arguments @{
    PVWAURL = $PVWA_URL
    CSVPath = "$EXPORT_DIR\PlatformReport.csv"
    AuthType = $AuthType
    ExtendedReport = $true
    IncludeInactive = $true
}

# 6. Rapport des risques de comptes
Execute-Script -Path ".\Security Events\Get-AccountsRiskReport.ps1" -Arguments @{
    PVWAURL = $PVWA_URL
    CSVPath = "$EXPORT_DIR\AccountRiskReport.csv"
    EventsDaysFilter = 30
    AuthType = $AuthType
}

# 7. Rapport des sessions PSM
Execute-Script -Path ".\PSM Sessions Management\PSM-SessionsManagement.ps1" -Arguments @{
    PVWAURL = $PVWA_URL
    List = $true
    CSVPath = "$EXPORT_DIR\PSMSessions.csv"
    AuthType = $AuthType
    PSMServerName = "PSMServer" # Remplacer par votre serveur PSM réel
}

# 8. Rapport des applications AAM
Execute-Script -Path ".\AAM Applications\Export-Import-Applications.ps1" -Arguments @{
    PVWAURL = $PVWA_URL
    Export = $true
    CSVPath = "$EXPORT_DIR\AAMApplications.csv"
    AuthType = $AuthType
}

# 9. Rapport d'optimisation des adresses
Execute-Script -Path ".\Optimize Address\Optimize-Addresses.ps1" -Arguments @{
    PVWAAddress = $PVWA_URL
    ExportToCSV = $true
    CSVPath = "$EXPORT_DIR\AddressOptimization.csv"
    ShowAllResults = $true
    PVWACredentials = $Credential
}

# 10. Rapport de tous les comptes
Execute-Script -Path ".\Get Accounts\Get-Accounts.ps1" -Arguments @{
    PVWAURL = $PVWA_URL
    List = $true
    Report = $true
    CSVPath = "$EXPORT_DIR\AllAccounts.csv"
    SortBy = "UserName"
    AutoNextPage = $true
}

# Afficher un résumé des rapports générés
Write-Host "`nRésumé des rapports générés:" -ForegroundColor Cyan
$csvFiles = Get-ChildItem -Path $EXPORT_DIR -Filter "*.csv"
if ($csvFiles.Count -eq 0) {
    Write-Host "Aucun rapport CSV généré. Vérifiez le fichier erreurs.log" -ForegroundColor Red
} else {
    $csvFiles | ForEach-Object { Write-Host " - $($_.Name)" -ForegroundColor White }
}

# Vérifier s'il y a eu des erreurs
if (Test-Path "$EXPORT_DIR\erreurs.log") {
    Write-Host "`nAttention: Des erreurs ont été détectées. Consultez le fichier erreurs.log" -ForegroundColor Red
} 