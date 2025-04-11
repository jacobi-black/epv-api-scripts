# Script simplifié pour générer des rapports CyberArk
# Version avec paramètres exacts selon les README de chaque script

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

# Créer une session pour générer un jeton logon à partager entre scripts
try {
    $session = New-PASSession -Credential $creds -BaseURI $PVWA_URL -type $AuthType
    $logonToken = $session.sessionToken
    Write-Host "Session d'authentification créée avec succès" -ForegroundColor Green
}
catch {
    Write-Host "ERREUR d'authentification: $_" -ForegroundColor Red
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

# Liste complète des rapports disponibles
$reports = @(
    # 1. Rapport des comptes - D'après README: logonToken est supporté
    @{
        Description = "Rapport des comptes"
        ScriptPath = ".\Reports\Accounts\Get-AccountReport.ps1"
        Parameters = @{
            ReportPath = "$EXPORT_DIR\AccountReport.csv"
            PVWAAddress = $PVWA_URL
            allProps = $true
            logonToken = $logonToken
        }
    },
    # 2. Rapport des membres de coffres - D'après README: logonToken est supporté
    @{
        Description = "Rapport des membres de coffres"
        ScriptPath = ".\Reports\Safes\Get-SafeMemberReport.ps1"
        Parameters = @{
            ReportPath = "$EXPORT_DIR\SafeMemberReport.csv"
            PVWAAddress = $PVWA_URL
            IncludeGroups = $true
            IncludeApps = $true
            logonToken = $logonToken
        }
    },
    # 3. Rapport des comptes découverts - D'après README: LogonToken est supporté
    @{
        Description = "Rapport des comptes découverts"
        ScriptPath = ".\Discovered Accounts\Get-DiscoveredAccountsReport.ps1"
        Parameters = @{
            PVWAURL = $PVWA_URL
            LogonToken = $logonToken
            List = $true
            CSVPath = "$EXPORT_DIR\DiscoveredAccounts.csv"
            AuthType = $AuthType
            AutoNextPage = $true
            Report = $true
            Limit = 500
            DisableSSLVerify = $true
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
        }
    },
    # 8. Rapport des applications AAM - D'après README: paramètres Export et CSVPath
    @{
        Description = "Rapport des applications AAM"
        ScriptPath = ".\AAM Applications\Export-Import-Applications.ps1"
        Parameters = @{
            PVWAURL = $PVWA_URL
            Export = $true
            CSVPath = "$EXPORT_DIR\AAMApplications.csv"
            PVWACredentials = $creds
        }
    },
    # 9. Rapport d'optimisation des adresses
    @{
        Description = "Rapport d'optimisation des adresses"
        ScriptPath = ".\Optimize Address\Optimize-Addresses.ps1"
        Parameters = @{
            PVWAAddress = $PVWA_URL
            PVWACredentials = $creds
            ExportToCSV = $true
            CSVPath = "$EXPORT_DIR\AddressOptimization.csv"
            ShowAllResults = $false
            SuppressErrorResults = $true
        }
    },
    # 10. Rapport de tous les comptes - D'après README: paramètres List, Report, CSVPath, et SortBy
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
            PVWACredentials = $creds
            DisableLogoff = $true
        }
    },
    # 11. Rapport de santé du système - Nécessite le module CyberArk-Common
    @{
        Description = "Rapport de santé du système"
        ScriptPath = ".\System Health\System-Health.ps1"
        Parameters = @{
            PVWAURL = $PVWA_URL
            PVWACredentials = $creds
            AllComponentTypes = $true
            AllServers = $true
            OutputObject = $true
        }
        # Pour ce script, on utilise une logique personnalisée d'exécution
        CustomExecution = {
            param($Description, $ScriptPath, $Parameters)
            
            Write-Host "--- $Description ---" -ForegroundColor Cyan
            Write-Host "Exécution de: $ScriptPath" -ForegroundColor Yellow
            
            $scriptDirectory = Split-Path -Parent $ScriptPath
            $cyberArkCommonPath = Join-Path $scriptDirectory "CyberArk-Common.psm1"
            
            if (!(Test-Path $cyberArkCommonPath)) {
                Write-Host "ERREUR: Le module CyberArk-Common.psm1 n'a pas été trouvé à côté du script" -ForegroundColor Red
                "Le module CyberArk-Common.psm1 n'a pas été trouvé à $cyberArkCommonPath" | Out-File -FilePath "$EXPORT_DIR\erreurs.log" -Append
                return
            }
            
            # Créer un script wrapper temporaire
            $wrapperScript = @"
# Script wrapper pour System-Health.ps1
`$ErrorActionPreference = "Stop"

try {
    # Vérifier si le module est déjà chargé
    if (-not (Get-Module -Name CyberArk-Common)) {
        # Importer le module
        Import-Module "$cyberArkCommonPath" -Force -DisableNameChecking
    }
    
    # Chemin absolu du script à exécuter
    `$scriptPath = "$ScriptPath"
    
    # Préparer la commande avec les paramètres dans le format correct
    `$command = "`$scriptPath -PVWAURL '$($Parameters.PVWAURL)' -DisableSSLVerify -AllComponentTypes -AllServers -OutputObject"
    
    # Exécuter le script en utilisant Invoke-Expression
    `$output = Invoke-Expression `$command
    
    # Exporter les résultats en CSV
    `$output | Export-Csv -Path "$EXPORT_DIR\SystemHealth.csv" -NoTypeInformation
    
    Write-Output "Rapport SystemHealth exporté avec succès"
} catch {
    Write-Error "Erreur lors de l'exécution du script System-Health: `$_"
    throw
}
"@
            
            $wrapperPath = Join-Path $env:TEMP "SystemHealthWrapper.ps1"
            $wrapperScript | Out-File -FilePath $wrapperPath -Encoding UTF8 -Force
            
            try {
                # Exécuter le script wrapper dans une nouvelle session PowerShell avec les privilèges admin
                $process = Start-Process -FilePath powershell.exe -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$wrapperPath`"" -Wait -PassThru -WindowStyle Hidden
                
                if ($process.ExitCode -eq 0 -and (Test-Path "$EXPORT_DIR\SystemHealth.csv")) {
                    Write-Host "Terminé avec succès" -ForegroundColor Green
                } else {
                    Write-Host "ERREUR: Le script a retourné un code d'erreur $($process.ExitCode)" -ForegroundColor Red
                    Get-Content $wrapperPath | Out-File -FilePath "$EXPORT_DIR\erreurs.log" -Append
                }
            } catch {
                Write-Host "ERREUR: $_" -ForegroundColor Red
                $_.Exception.Message | Out-File -FilePath "$EXPORT_DIR\erreurs.log" -Append
            } finally {
                # Nettoyer le script temporaire
                if (Test-Path $wrapperPath) {
                    Remove-Item $wrapperPath -Force
                }
            }
            
            Write-Host ""
        }
    }
)

# Fonction pour afficher le menu et obtenir les sélections
function Show-ReportMenu {
    Clear-Host
    Write-Host "============= SÉLECTION DES RAPPORTS À EXÉCUTER =============" -ForegroundColor Cyan
    Write-Host "0. Exécuter TOUS les rapports" -ForegroundColor Yellow
    
    for ($i = 0; $i -lt $reports.Count; $i++) {
        Write-Host "$($i+1). $($reports[$i].Description)" -ForegroundColor White
    }
    
    Write-Host "Q. Quitter sans exécuter de rapports" -ForegroundColor Red
    Write-Host "=========================================================" -ForegroundColor Cyan
    
    $validChoices = @("0", "Q")
    for ($i = 1; $i -le $reports.Count; $i++) {
        $validChoices += $i.ToString()
    }
    
    $choices = @()
    while ($true) {
        $choice = Read-Host "Entrez les numéros des rapports à exécuter (séparés par des virgules), 0 pour tous, ou Q pour quitter"
        
        if ($choice -eq "Q") {
            return @()
        }
        
        if ($choice -eq "0") {
            return (0..($reports.Count-1))
        }
        
        $selectedReports = $choice -split "," | ForEach-Object { $_.Trim() }
        $allValid = $true
        
        foreach ($selectedReport in $selectedReports) {
            if (-not ($validChoices -contains $selectedReport)) {
                Write-Host "Choix invalide: $selectedReport" -ForegroundColor Red
                $allValid = $false
                break
            }
            
            if ($selectedReport -ne "Q" -and $selectedReport -ne "0") {
                $choices += [int]$selectedReport - 1
            }
        }
        
        if ($allValid) {
            return $choices
        }
    }
}

# Obtenir les rapports à exécuter
$selectedIndices = Show-ReportMenu
if ($selectedIndices.Count -eq 0) {
    Write-Host "Aucun rapport sélectionné. Fin du script." -ForegroundColor Yellow
    
    # Fermer la session avant de quitter
    try {
        Close-PASSession
        Write-Host "Session CyberArk fermée" -ForegroundColor Green
    } catch {
        Write-Host "Note: Impossible de fermer la session CyberArk: $_" -ForegroundColor Yellow
    }
    
    exit
}

# Exécuter les rapports sélectionnés
$selectedReports = $selectedIndices | ForEach-Object { $reports[$_] }
$totalReports = $selectedReports.Count
$currentReport = 0

foreach ($report in $selectedReports) {
    $currentReport++
    $progress = [math]::Round(($currentReport / $totalReports) * 100)
    Write-Progress -Activity "Génération des rapports CyberArk" -Status "Rapport $currentReport sur $totalReports" -PercentComplete $progress
    
    if ($report.ContainsKey('CustomExecution')) {
        # Utiliser l'exécution personnalisée définie dans le rapport
        & $report.CustomExecution $report.Description $report.ScriptPath $report.Parameters
    } else {
        # Utiliser la fonction standard Run-Report
        Run-Report -Description $report.Description -ScriptPath $report.ScriptPath -Parameters $report.Parameters
    }
}

# Compléter la barre de progression
Write-Progress -Activity "Génération des rapports CyberArk" -Status "Terminé" -PercentComplete 100 -Completed

# Fermer la session à la fin
try {
    Close-PASSession
    Write-Host "Session CyberArk fermée" -ForegroundColor Green
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