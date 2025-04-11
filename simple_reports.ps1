# Script simplifié pour générer les rapports CyberArk
# Cette version partage l'authentification entre les scripts pour éviter de saisir les identifiants à chaque fois

# Gestion de l'encodage UTF-8 avec vérification de la disponibilité de la console
try {
    # Vérifie si la console est disponible avant de modifier l'encodage
    if ([Environment]::UserInteractive -and (Test-Path env:\TERM)) {
        [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
    }
} catch {
    Write-Host "Note: Impossible de définir l'encodage de la console. Les caractères accentués peuvent ne pas s'afficher correctement." -ForegroundColor Yellow
}

# Configuration
$PVWA_URL = "https://accessqa.st.com/PasswordVault"  # Suppression du slash final
$EXPORT_DIR = "C:\tmp"
$AuthType = "CyberArk"  # Peut être CyberArk, LDAP ou RADIUS

# Variables globales pour le jeton d'authentification
$Global:AuthToken = $null
$Global:AuthCreds = $null
$Global:PVWASession = $null  # Pour stocker la session complète

# Variables pour la barre de progression
$Global:TotalScripts = 10  # Nombre total de scripts à exécuter
$Global:CompletedScripts = 0  # Nombre de scripts complétés

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

# Fonction pour mettre à jour la barre de progression
function Update-Progress {
    param (
        [string]$Activity,
        [string]$Status
    )
    
    $Global:CompletedScripts++
    $percentComplete = ($Global:CompletedScripts / $Global:TotalScripts) * 100
    
    Write-Progress -Activity "Génération des rapports CyberArk" -Status "$Status ($Global:CompletedScripts/$Global:TotalScripts)" -PercentComplete $percentComplete -CurrentOperation $Activity
}

# Fonction pour gérer l'authentification unique
function Get-CyberArkAuth {
    # Vérifie si le module PSPAS est disponible et l'installe si nécessaire
    if (!(Get-Module -ListAvailable -Name PSPAS)) {
        try {
            Write-Host "Installation du module PSPAS requis..." -ForegroundColor Yellow
            Install-Module PSPAS -Scope CurrentUser -Force
        } catch {
            Write-Host "ERREUR: Impossible d'installer le module PSPAS. Veuillez l'installer manuellement." -ForegroundColor Red
            return $null
        }
    }

    # Import du module PSPAS
    Import-Module PSPAS -Force

    # Si nous avons déjà un jeton d'authentification, l'utiliser
    if ($Global:AuthToken) {
        return $Global:AuthToken
    }

    # Sinon, demander les identifiants et s'authentifier
    Write-Host "===============================================" -ForegroundColor Cyan
    Write-Host "Authentification CyberArk (à faire une seule fois)" -ForegroundColor Yellow
    Write-Host "Type d'authentification: $AuthType" -ForegroundColor Yellow
    Write-Host "===============================================" -ForegroundColor Cyan

    try {
        # Vérifier si une session existe déjà
        Get-PASComponentSummary -ErrorAction SilentlyContinue -ErrorVariable TestConnect | Out-Null
        if ($TestConnect.count -ne 0) {
            Close-PASSession -ErrorAction SilentlyContinue
        }

        # Demander les identifiants si nécessaire
        if (-not $Global:AuthCreds) {
            $Global:AuthCreds = Get-Credential -Message "Entrez vos identifiants CyberArk"
        }

        # Créer une nouvelle session et stocker le jeton
        # On supprime le paramètre concurrentSession qui cause des problèmes
        $Global:PVWASession = New-PASSession -Credential $Global:AuthCreds -BaseURI $PVWA_URL -type $AuthType
        $Global:AuthToken = $Global:PVWASession | Select-Object -ExpandProperty sessionToken
        
        Write-Host "Authentification réussie!" -ForegroundColor Green
        return $Global:AuthToken
    }
    catch {
        Write-Host "ERREUR d'authentification: $_" -ForegroundColor Red
        $Global:AuthToken = $null
        $Global:AuthCreds = $null
        $Global:PVWASession = $null
        return $null
    }
}

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
        # Vérifier si le script accepte un jeton d'authentification
        $scriptContent = Get-Content -Path $ScriptPath -Raw
        $acceptsToken = $scriptContent -match "logonToken|PASSession|\$token"
        
        # Si le script accepte un jeton, ajouter le jeton aux paramètres
        if ($acceptsToken) {
            $token = Get-CyberArkAuth
            if ($token) {
                if ($scriptContent -match "logonToken") {
                    $Parameters["logonToken"] = $token
                }
                elseif ($scriptContent -match "\$token") {
                    $Parameters["token"] = $token
                }
            }
        }
        
        # Corrections spécifiques pour certains scripts
        if ($ScriptPath -match "Optimize-Addresses.ps1|Get-AccountReport.ps1|Get-SafeMemberReport.ps1") {
            # Ces scripts ont un problème d'URI, on s'assure que l'URL est correcte
            if ($Parameters.ContainsKey("PVWAAddress")) {
                $Parameters["PVWAAddress"] = $PVWA_URL
            }
        }
        
        # Vérifier les scripts avec problèmes d'authentification connus
        if ($ScriptPath -match "Get-Accounts.ps1") {
            # Pour ce script, on force la création d'une nouvelle session
            if (-not $Parameters.ContainsKey("UseSessionVariable")) {
                $Parameters["UseSessionVariable"] = $true
            }
        }
        
        # Exécuter le script avec les paramètres
        Write-Host "Paramètres: " -ForegroundColor Yellow
        $Parameters.GetEnumerator() | ForEach-Object { Write-Host "  $($_.Key): $($_.Value)" -ForegroundColor Gray }
        
        & $ScriptPath @Parameters
        Write-Host "Terminé avec succès" -ForegroundColor Green
        
        # Mettre à jour la barre de progression
        Update-Progress -Activity $Description -Status "En cours"
    } catch {
        Write-Host "ERREUR: $_" -ForegroundColor Red
        Write-Host "StackTrace: $($_.ScriptStackTrace)" -ForegroundColor Red
        $_.Exception.Message | Out-File -FilePath "$EXPORT_DIR\erreurs.log" -Append
        
        # Mettre quand même à jour la barre de progression en cas d'erreur
        Update-Progress -Activity "$Description (ERREUR)" -Status "En cours"
    }
    
    Write-Host ""
}

# Fonction pour tester les scripts avant de les exécuter
function Test-ScriptParameters {
    param(
        [string]$ScriptPath
    )
    
    if (!(Test-Path $ScriptPath)) { return $false }
    
    try {
        $scriptContent = Get-Content -Path $ScriptPath -Raw
        $scriptBlock = [ScriptBlock]::Create($scriptContent)
        $commandInfo = Get-Command -CommandType Function -Name ($scriptPath | Split-Path -Leaf) -ErrorAction SilentlyContinue
        
        if ($null -eq $commandInfo) {
            # Analyse alternative des paramètres
            if ($scriptContent -match "logonToken") {
                return @{ SupportsLogonToken = $true }
            }
            if ($scriptContent -match "\$token") {
                return @{ SupportsToken = $true }
            }
            return @{ SupportsGenericParams = $true }
        }
        
        return $commandInfo.Parameters
    } catch {
        Write-Host "Erreur lors de l'analyse des paramètres du script: $_" -ForegroundColor Yellow
        return $false
    }
}

# Authentification initiale
$token = Get-CyberArkAuth
if (-not $token) {
    Write-Host "Impossible de s'authentifier. Vérifiez vos identifiants et réessayez." -ForegroundColor Red
    exit
}

# Initialiser la barre de progression
Write-Progress -Activity "Génération des rapports CyberArk" -Status "Démarrage (0/$Global:TotalScripts)" -PercentComplete 0

# 1. Rapport des comptes
$accountReportPath = ".\Reports\Accounts\Get-AccountReport.ps1"
if (Test-ScriptExists $accountReportPath) {
    $params = @{
        ReportPath = "$EXPORT_DIR\AccountReport.csv"
        PVWAAddress = $PVWA_URL
        allProps = $true
        logonToken = $token
    }
    Run-Command -Description "Rapport des comptes" -ScriptPath $accountReportPath -Parameters $params
}
else {
    Update-Progress -Activity "Rapport des comptes (SAUTÉ)" -Status "En cours"
}

# 2. Rapport des membres de coffres
$safeMemberReportPath = ".\Reports\Safes\Get-SafeMemberReport.ps1"
if (Test-ScriptExists $safeMemberReportPath) {
    $params = @{
        ReportPath = "$EXPORT_DIR\SafeMemberReport.csv"
        PVWAAddress = $PVWA_URL
        IncludeGroups = $true
        IncludeApps = $true
        logonToken = $token
    }
    Run-Command -Description "Rapport des membres de coffres" -ScriptPath $safeMemberReportPath -Parameters $params
}
else {
    Update-Progress -Activity "Rapport des membres de coffres (SAUTÉ)" -Status "En cours"
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
else {
    Update-Progress -Activity "Rapport des comptes découverts (SAUTÉ)" -Status "En cours"
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
else {
    Update-Progress -Activity "Rapport des utilisateurs inactifs (SAUTÉ)" -Status "En cours"
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
else {
    Update-Progress -Activity "Rapport des plateformes (SAUTÉ)" -Status "En cours"
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
    Update-Progress -Activity "Rapport des risques de comptes (SAUTÉ)" -Status "En cours"
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
else {
    Update-Progress -Activity "Rapport des sessions PSM (SAUTÉ)" -Status "En cours"
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
else {
    Update-Progress -Activity "Rapport des applications AAM (SAUTÉ)" -Status "En cours"
}

# 9. Rapport d'optimisation des adresses
$optimizeAddressPath = ".\Optimize Address\Optimize-Addresses.ps1"
if (Test-ScriptExists $optimizeAddressPath) {
    $params = @{
        PVWAAddress = $PVWA_URL
        ExportToCSV = $true
        CSVPath = "$EXPORT_DIR\AddressOptimization.csv"
        ShowAllResults = $true
        logonToken = $token
    }
    Run-Command -Description "Rapport d'optimisation des adresses" -ScriptPath $optimizeAddressPath -Parameters $params
}
else {
    Update-Progress -Activity "Rapport d'optimisation des adresses (SAUTÉ)" -Status "En cours"
}

# 10. Rapport de tous les comptes
$getAccountsPath = ".\Get Accounts\Get-Accounts.ps1"
if (Test-ScriptExists $getAccountsPath) {
    # Ce script a des problèmes d'authentification, on crée une session fraîche
    Close-PASSession -ErrorAction SilentlyContinue
    $freshCreds = Get-Credential -Message "Authentification pour le rapport de tous les comptes"
    $session = New-PASSession -Credential $freshCreds -BaseURI $PVWA_URL -type $AuthType
    
    $params = @{
        PVWAURL = $PVWA_URL
        List = $true
        Report = $true
        CSVPath = "$EXPORT_DIR\AllAccounts.csv"
        SortBy = "UserName"
        AutoNextPage = $true
    }
    Run-Command -Description "Rapport de tous les comptes" -ScriptPath $getAccountsPath -Parameters $params
    
    # Restaurer la session globale
    Close-PASSession -ErrorAction SilentlyContinue
    Use-PASSession -Session $Global:AuthToken
}
else {
    Update-Progress -Activity "Rapport de tous les comptes (SAUTÉ)" -Status "En cours"
}

# Compléter la barre de progression
Write-Progress -Activity "Génération des rapports CyberArk" -Status "Terminé ($Global:CompletedScripts/$Global:TotalScripts)" -PercentComplete 100 -Completed

# Fermer la session à la fin
try {
    if (Get-Command -Name Close-PASSession -ErrorAction SilentlyContinue) {
        Close-PASSession
        Write-Host "Session CyberArk fermée" -ForegroundColor Green
    }
} catch {
    Write-Host "Note: Impossible de fermer la session CyberArk: $_" -ForegroundColor Yellow
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