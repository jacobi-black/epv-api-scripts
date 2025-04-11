$PVWA_URL = "https://accessqa.st.com/PasswordVault/"
$EXPORT_DIR = "C:\tmp"

# Création du dossier d'export
if(-not (Test-Path -Path $EXPORT_DIR)) {
    New-Item -Path $EXPORT_DIR -ItemType Directory -Force
}

# Vérifier que le module PSPAS est disponible
if (!(Get-Module -ListAvailable -Name PSPAS)) {
    Write-Host "Installation du module PSPAS..." -ForegroundColor Yellow
    Install-Module PSPAS -Scope CurrentUser -Force
}

# Variables pour l'authentification centralisée
$AuthType = "CyberArk" # Peut être CyberArk, LDAP ou RADIUS

# Créer directement les identifiants au format attendu plutôt que d'utiliser Get-Credential
$Username = Read-Host "Entrez votre nom d'utilisateur CyberArk"
$Password = Read-Host "Entrez votre mot de passe" -AsSecureString
$Credential = New-Object System.Management.Automation.PSCredential($Username, $Password)

# Importer le module PSPAS pour établir une session réutilisable
Import-Module PSPAS

# Établir la session une seule fois et récupérer le jeton
$LogonToken = $null
try {
    Write-Host "Établissement de la session CyberArk..." -ForegroundColor Yellow
    New-PASSession -Credential $Credential -BaseURI $PVWA_URL -Type $AuthType
    
    # Récupérer le jeton de session pour le passer aux scripts
    $LogonToken = (Get-PASSession).SecurityToken
    
    if ($LogonToken) {
        Write-Host "Session établie avec succès et jeton récupéré" -ForegroundColor Green
    } else {
        Write-Host "Session établie mais impossible de récupérer le jeton" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "ERREUR d'authentification: $_" -ForegroundColor Red
    exit
}

# Fonction simple pour exécuter un script avec gestion d'erreurs
function Execute-Script {
    param($Path, $Arguments)
    
    # Vérifier si le script existe
    if (-not (Test-Path $Path)) {
        Write-Host "ERREUR: Le script $Path n'existe pas" -ForegroundColor Red
        "Le script $Path n'existe pas" | Out-File -FilePath "$EXPORT_DIR\erreurs.log" -Append
        return
    }
    
    Write-Host "Exécution de $Path..." -ForegroundColor Yellow
    try {
        # Remplacer PVWACredentials par logonToken si présent
        if ($Arguments.ContainsKey("PVWACredentials")) {
            $Arguments.Remove("PVWACredentials")
        }
        
        # Ajouter le jeton d'authentification s'il est disponible
        if ($LogonToken) {
            $Arguments["logonToken"] = $LogonToken
        }
        
        # Exécuter le script
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

try {
    # 1. Rapport des comptes
    Execute-Script -Path ".\Reports\Accounts\Get-AccountReport.ps1" -Arguments @{
        ReportPath = "$EXPORT_DIR\AccountReport.csv"
        PVWAAddress = $PVWA_URL
        allProps = $true
    }

    # 2. Rapport des membres de coffres
    Execute-Script -Path ".\Reports\Safes\Get-SafeMemberReport.ps1" -Arguments @{
        ReportPath = "$EXPORT_DIR\SafeMemberReport.csv"
        PVWAAddress = $PVWA_URL
        IncludeGroups = $true
        IncludeApps = $true
    }

    # 3. Rapport des comptes découverts
    Execute-Script -Path ".\Discovered Accounts\Get-DiscoveredAccountsReport.ps1" -Arguments @{
        PVWAURL = $PVWA_URL
        List = $true
        CSVPath = "$EXPORT_DIR\DiscoveredAccounts.csv"
        AuthType = $AuthType  # Garder AuthType car certains scripts l'exigent même avec un jeton
        AutoNextPage = $true
    }

    # 4. Rapport des utilisateurs inactifs
    Execute-Script -Path ".\User Management\Get-InactiveUsersReport.ps1" -Arguments @{
        PVWAURL = $PVWA_URL
        CSVPath = "$EXPORT_DIR\InactiveUsers.csv"
        AuthType = $AuthType  # Garder AuthType car certains scripts l'exigent même avec un jeton
        InactiveDays = 30
    }

    # 5. Rapport des plateformes
    Execute-Script -Path ".\Platforms\Get-PlatformReport.ps1" -Arguments @{
        PVWAURL = $PVWA_URL
        CSVPath = "$EXPORT_DIR\PlatformReport.csv"
        AuthType = $AuthType  # Garder AuthType car certains scripts l'exigent même avec un jeton
        ExtendedReport = $true
        IncludeInactive = $true
    }

    # 6. Rapport des risques de comptes - Vérifier le bon nom de fichier
    # Tester les deux noms possibles
    $riskReportPath = ""
    if (Test-Path ".\Security Events\Get-AccountsRiskReport.ps1") {
        $riskReportPath = ".\Security Events\Get-AccountsRiskReport.ps1"
    } 
    elseif (Test-Path ".\Security Events\Get-AccoutnsRiskReport.ps1") {
        $riskReportPath = ".\Security Events\Get-AccoutnsRiskReport.ps1"
    }
    
    if ($riskReportPath -ne "") {
        Execute-Script -Path $riskReportPath -Arguments @{
            PVWAURL = $PVWA_URL
            CSVPath = "$EXPORT_DIR\AccountRiskReport.csv"
            AuthType = $AuthType  # Garder AuthType car certains scripts l'exigent même avec un jeton
            EventsDaysFilter = 30
        }
    } else {
        Write-Host "ERREUR: Script de rapport de risque non trouvé" -ForegroundColor Red
        "Script de rapport de risque non trouvé" | Out-File -FilePath "$EXPORT_DIR\erreurs.log" -Append
    }

    # 7. Rapport des sessions PSM
    Execute-Script -Path ".\PSM Sessions Management\PSM-SessionsManagement.ps1" -Arguments @{
        PVWAURL = $PVWA_URL
        List = $true
        CSVPath = "$EXPORT_DIR\PSMSessions.csv"
        AuthType = $AuthType  # Garder AuthType car certains scripts l'exigent même avec un jeton
        PSMServerName = "PSMServer"  # Remplacer par votre serveur PSM réel
    }

    # 8. Rapport des applications AAM
    Execute-Script -Path ".\AAM Applications\Export-Import-Applications.ps1" -Arguments @{
        PVWAURL = $PVWA_URL
        Export = $true
        CSVPath = "$EXPORT_DIR\AAMApplications.csv"
        AuthType = $AuthType  # Garder AuthType car certains scripts l'exigent même avec un jeton
    }

    # 9. Rapport d'optimisation des adresses
    Execute-Script -Path ".\Optimize Address\Optimize-Addresses.ps1" -Arguments @{
        PVWAAddress = $PVWA_URL
        ExportToCSV = $true
        CSVPath = "$EXPORT_DIR\AddressOptimization.csv"
        ShowAllResults = $true
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
}
finally {
    # Fermer la session à la fin
    try {
        Write-Host "Fermeture de la session CyberArk..." -ForegroundColor Yellow
        Close-PASSession
        Write-Host "Session fermée avec succès" -ForegroundColor Green
    }
    catch {
        Write-Host "ERREUR lors de la fermeture de session: $_" -ForegroundColor Red
    }
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