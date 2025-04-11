# Script simplifié pour générer des rapports CyberArk
# Version avec paramètres d'authentification adaptés à chaque script

# Configuration 
$PVWA_URL = "https://accessqa.st.com/PasswordVault" # Sans slash final
$EXPORT_DIR = "C:\tmp"
$AuthType = "CyberArk" # CyberArk, LDAP ou RADIUS

# Créer le dossier d'export si nécessaire
if(-not (Test-Path -Path $EXPORT_DIR)) {
    New-Item -Path $EXPORT_DIR -ItemType Directory -Force | Out-Null
    Write-Host "Dossier d'export créé: $EXPORT_DIR" -ForegroundColor Green
}

# Vérification et importation du module PSPAS
if (!(Get-Module -ListAvailable -Name PSPAS)) {
    try {
        Write-Host "Installation du module PSPAS..." -ForegroundColor Yellow
        Install-Module PSPAS -Scope CurrentUser -Force
    } catch {
        Write-Host "ERREUR: Impossible d'installer PSPAS. Veuillez l'installer manuellement." -ForegroundColor Red
        exit
    }
}

Import-Module PSPAS -Force

# Fermeture de toute session existante
try {
    Close-PASSession -ErrorAction SilentlyContinue
} catch {
    # Ignore les erreurs (pas de session active)
}

# Authentification unique - On demande les identifiants une seule fois
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "Demande d'identifiants CyberArk (à saisir une seule fois)" -ForegroundColor Yellow
Write-Host "PVWA URL: $PVWA_URL" -ForegroundColor Yellow
Write-Host "Type d'authentification: $AuthType" -ForegroundColor Yellow
Write-Host "===============================================" -ForegroundColor Cyan

# Demande des identifiants
$creds = Get-Credential -Message "Entrez vos identifiants CyberArk"
if ($null -eq $creds) {
    Write-Host "Authentification annulée. Fin du script." -ForegroundColor Red
    exit
}

# Fonction simplifiée pour exécuter les scripts
function Run-Report {
    param (
        [string]$Description,
        [string]$ScriptPath,
        [hashtable]$Parameters
    )
    
    if (-not (Test-Path $ScriptPath)) {
        Write-Host "ERREUR: Le script $ScriptPath n'existe pas" -ForegroundColor Red
        return
    }

    Write-Host "--- $Description ---" -ForegroundColor Cyan
    Write-Host "Exécution de: $ScriptPath" -ForegroundColor Yellow
    
    try {
        & $ScriptPath @Parameters
        Write-Host "Terminé avec succès" -ForegroundColor Green
    } 
    catch {
        Write-Host "ERREUR: $_" -ForegroundColor Red
        $_.Exception.Message | Out-File -FilePath "$EXPORT_DIR\erreurs.log" -Append
    }
    
    Write-Host ""
}

# Liste complète des rapports à exécuter avec les paramètres adaptés
$reports = @(
    # 1. Rapport des comptes
    @{
        Description = "Rapport des comptes"
        ScriptPath = ".\Reports\Accounts\Get-AccountReport.ps1"
        Parameters = @{
            ReportPath = "$EXPORT_DIR\AccountReport.csv"
            PVWAAddress = $PVWA_URL
            allProps = $true
            # Note: Ce script gère directement la demande d'identifiants
        }
    },
    # 2. Rapport des membres de coffres
    @{
        Description = "Rapport des membres de coffres"
        ScriptPath = ".\Reports\Safes\Get-SafeMemberReport.ps1"
        Parameters = @{
            ReportPath = "$EXPORT_DIR\SafeMemberReport.csv"
            PVWAAddress = $PVWA_URL
            IncludeGroups = $true
            IncludeApps = $true
            # Note: Ce script gère directement la demande d'identifiants
        }
    },
    # 3. Rapport des comptes découverts
    @{
        Description = "Rapport des comptes découverts"
        ScriptPath = ".\Discovered Accounts\Get-DiscoveredAccountsReport.ps1"
        Parameters = @{
            PVWAURL = $PVWA_URL
            List = $true
            CSVPath = "$EXPORT_DIR\DiscoveredAccounts.csv"
            AuthType = $AuthType
            AutoNextPage = $true
            # Note: Ce script gère directement la demande d'identifiants
        }
    },
    # 4. Rapport des utilisateurs inactifs
    @{
        Description = "Rapport des utilisateurs inactifs"
        ScriptPath = ".\User Management\Get-InactiveUsersReport.ps1"
        Parameters = @{
            PVWAURL = $PVWA_URL
            CSVPath = "$EXPORT_DIR\InactiveUsers.csv"
            AuthType = $AuthType
            InactiveDays = 30
            # Note: Ce script gère directement la demande d'identifiants
        }
    },
    # 5. Rapport des plateformes
    @{
        Description = "Rapport des plateformes"
        ScriptPath = ".\Platforms\Get-PlatformReport.ps1"
        Parameters = @{
            PVWAURL = $PVWA_URL
            CSVPath = "$EXPORT_DIR\PlatformReport.csv"
            AuthType = $AuthType
            ExtendedReport = $true
            IncludeInactive = $true
            # Note: Ce script gère directement la demande d'identifiants
        }
    },
    # 6. Rapport des risques de comptes
    @{
        Description = "Rapport des risques de comptes"
        ScriptPath = ".\Security Events\Get-AccoutnsRiskReport.ps1"
        Parameters = @{
            PVWAURL = $PVWA_URL
            CSVPath = "$EXPORT_DIR\AccountRiskReport.csv"
            AuthType = $AuthType
            EventsDaysFilter = 30
            # Note: Ce script gère directement la demande d'identifiants
        }
    },
    # 7. Rapport des sessions PSM
    @{
        Description = "Rapport des sessions PSM"
        ScriptPath = ".\PSM Sessions Management\PSM-SessionsManagement.ps1"
        Parameters = @{
            PVWAURL = $PVWA_URL
            List = $true
            CSVPath = "$EXPORT_DIR\PSMSessions.csv"
            AuthType = $AuthType
            PSMServerName = "PSMServer"
            # Note: Ce script gère directement la demande d'identifiants
        }
    },
    # 8. Rapport des applications AAM
    @{
        Description = "Rapport des applications AAM"
        ScriptPath = ".\AAM Applications\Export-Import-Applications.ps1"
        Parameters = @{
            PVWAURL = $PVWA_URL
            Export = $true
            CSVPath = "$EXPORT_DIR\AAMApplications.csv"
            AuthType = $AuthType
            # Note: Ce script gère directement la demande d'identifiants
        }
    },
    # 9. Rapport d'optimisation des adresses
    @{
        Description = "Rapport d'optimisation des adresses"
        ScriptPath = ".\Optimize Address\Optimize-Addresses.ps1"
        Parameters = @{
            PVWAAddress = $PVWA_URL
            ExportToCSV = $true
            CSVPath = "$EXPORT_DIR\AddressOptimization.csv"
            ShowAllResults = $true
            # Note: Ce script gère directement la demande d'identifiants
        }
    },
    # 10. Rapport de tous les comptes
    @{
        Description = "Rapport de tous les comptes"
        ScriptPath = ".\Get Accounts\Get-Accounts.ps1"
        Parameters = @{
            PVWAURL = $PVWA_URL
            List = $true
            Report = $true
            CSVPath = "$EXPORT_DIR\AllAccounts.csv"
            SortBy = "UserName"
            AutoNextPage = $true
            # Note: Ce script gère directement la demande d'identifiants
        }
    }
)

# Exécuter tous les rapports
$totalReports = $reports.Count
$currentReport = 0

foreach ($report in $reports) {
    $currentReport++
    $progress = [math]::Round(($currentReport / $totalReports) * 100)
    Write-Progress -Activity "Génération des rapports CyberArk" -Status "Rapport $currentReport sur $totalReports" -PercentComplete $progress
    
    Run-Report -Description $report.Description -ScriptPath $report.ScriptPath -Parameters $report.Parameters
}

# Compléter la barre de progression
Write-Progress -Activity "Génération des rapports CyberArk" -Status "Terminé" -PercentComplete 100 -Completed

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