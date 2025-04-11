# Script simplifie pour generer des rapports CyberArk
# Version avec parametres exacts selon les README de chaque script

# Configuration 
$PVWA_URL = "https://accessqa.st.com/PasswordVault" # Sans slash final
$EXPORT_DIR = "C:\tmp"
$AuthType = "CyberArk" # CyberArk, LDAP ou RADIUS

# Creer le dossier d'export si necessaire
if(-not (Test-Path -Path $EXPORT_DIR)) {
    New-Item -Path $EXPORT_DIR -ItemType Directory -Force | Out-Null
    Write-Host "Dossier d'export cree: $EXPORT_DIR" -ForegroundColor Green
}

# Verification et importation du module PSPAS
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
Write-Host "Demande d'identifiants CyberArk (a saisir une seule fois)" -ForegroundColor Yellow
Write-Host "PVWA URL: $PVWA_URL" -ForegroundColor Yellow
Write-Host "Type d'authentification: $AuthType" -ForegroundColor Yellow
Write-Host "===============================================" -ForegroundColor Cyan

# Demande des identifiants
$creds = Get-Credential -Message "Entrez vos identifiants CyberArk"
if ($null -eq $creds) {
    Write-Host "Authentification annulee. Fin du script." -ForegroundColor Red
    exit
}

# Creer une session pour generer un jeton logon a partager entre scripts
try {
    $session = New-PASSession -Credential $creds -BaseURI $PVWA_URL -type $AuthType
    $logonToken = $session.sessionToken
    Write-Host "Session d'authentification creee avec succes" -ForegroundColor Green
}
catch {
    Write-Host "ERREUR d'authentification: $_" -ForegroundColor Red
    exit
}

# Fonction simplifiee pour executer les scripts
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
    Write-Host "Execution de: $ScriptPath" -ForegroundColor Yellow
    
    try {
        & $ScriptPath @Parameters
        Write-Host "Termine avec succes" -ForegroundColor Green
    } 
    catch {
        Write-Host "ERREUR: $_" -ForegroundColor Red
        $_.Exception.Message | Out-File -FilePath "$EXPORT_DIR\erreurs.log" -Append
    }
    
    Write-Host ""
}

# Liste complete des rapports disponibles
$reports = @(
    # 1. Rapport des comptes - D'apres README: logonToken est supporte
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
    # 2. Rapport des membres de coffres - D'apres README: logonToken est supporte
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
    # 3. Rapport des comptes decouverts - D'apres README: LogonToken est supporte
    @{
        Description = "Rapport des comptes decouverts"
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
    # 8. Rapport des applications AAM - D'apres README: parametres Export et CSVPath
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
    # 10. Rapport de tous les comptes - D'apres README: parametres List, Report, CSVPath, et SortBy
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
    # 11. Rapport de sante du systeme - Necessite le module CyberArk-Common
    @{
        Description = "Rapport de sante du systeme"
        ScriptPath = ".\System Health\System-Health.ps1"
        Parameters = @{
            PVWAURL = $PVWA_URL
            AllComponentTypes = $true
            AllServers = $true
            DisableSSLVerify = $true
        }
        # Pour ce script, on utilise une logique personnalisee d'execution
        CustomExecution = {
            param($Description, $ScriptPath, $Parameters)
            
            Write-Host "--- $Description ---" -ForegroundColor Cyan
            Write-Host "Execution de: $ScriptPath" -ForegroundColor Yellow
            
            $moduleDir = Split-Path -Parent $ScriptPath
            $modulePath = Join-Path $moduleDir "CyberArk-Common.psm1"
            
            if (!(Test-Path $modulePath)) {
                Write-Host "ERREUR: Module CyberArk-Common.psm1 non trouve ($modulePath)" -ForegroundColor Red
                return
            }
            
            # Preparer les arguments
            $argList = "-NoProfile -ExecutionPolicy Bypass"
            
            # 1. Preparer l'importation du module
            $importCmd = "Import-Module '$modulePath' -Force -DisableNameChecking;"
            
            # 2. Preparer les parametres - en les passant un par un pour eviter les problemes
            $paramString = "-PVWAURL '$($Parameters.PVWAURL)'"
            if ($Parameters.DisableSSLVerify) { $paramString += " -DisableSSLVerify" }
            if ($Parameters.AllComponentTypes) { $paramString += " -AllComponentTypes" }
            if ($Parameters.AllServers) { $paramString += " -AllServers" }
            
            # 3. Preparer la commande d'execution avec capture de sortie
            $scriptCmd = "&'$ScriptPath' $paramString | Out-File '$EXPORT_DIR\SystemHealth.txt' -Encoding default;"
            
            # 4. Ajouter la commande pour capturer l'objet et l'exporter en CSV
            $exportCmd = "if (`$output = Get-ComponentStatus) { `$output | Export-Csv -Path '$EXPORT_DIR\SystemHealth.csv' -NoTypeInformation -Encoding ASCII }"
            
            # 5. Combiner le tout
            $fullCommand = "$importCmd $scriptCmd $exportCmd"
            
            Write-Host "Execution du script avec parametres directs:" -ForegroundColor Yellow
            Write-Host $paramString -ForegroundColor Gray
            
            try {
                # Execution directe en specifiant l'encodage et en utilisant -Command au lieu de -File
                $process = Start-Process -FilePath "powershell.exe" -ArgumentList "$argList -Command `"$fullCommand`"" -Wait -PassThru -NoNewWindow
                
                if ($process.ExitCode -eq 0) {
                    Write-Host "Script execute avec succes (Code: $($process.ExitCode))" -ForegroundColor Green
                    
                    # Verifier si le rapport CSV ou TXT a ete genere
                    if (Test-Path "$EXPORT_DIR\SystemHealth.csv") {
                        Write-Host "Rapport exporte avec succes: $EXPORT_DIR\SystemHealth.csv" -ForegroundColor Green
                    } elseif (Test-Path "$EXPORT_DIR\SystemHealth.txt") {
                        Write-Host "Rapport texte genere: $EXPORT_DIR\SystemHealth.txt" -ForegroundColor Yellow
                        
                        # Tenter de convertir le texte en CSV si necessaire
                        $content = Get-Content "$EXPORT_DIR\SystemHealth.txt" -Raw
                        if ($content -match "ComponentID") {
                            Write-Host "Tentative de conversion du texte en CSV..." -ForegroundColor Yellow
                            # Tentative de parsing et conversion - code simplifie
                            $content | Out-File "$EXPORT_DIR\SystemHealth.csv" -Encoding ASCII
                        }
                    } else {
                        Write-Host "Aucun fichier de rapport n'a ete genere." -ForegroundColor Red
                    }
                } else {
                    Write-Host "Le script a retourne le code d'erreur: $($process.ExitCode)" -ForegroundColor Red
                    
                    # Essai avec approche alternative
                    Write-Host "Tentative avec chemin absolu..." -ForegroundColor Yellow
                    $absolutePath = Resolve-Path $ScriptPath
                    $altCmd = "powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$absolutePath`" -PVWAURL `"$($Parameters.PVWAURL)`" -DisableSSLVerify -AllComponentTypes -AllServers -OutputDir `"$EXPORT_DIR`""
                    Write-Host "Commande: $altCmd" -ForegroundColor Gray
                    
                    # Execution de la commande alternative
                    cmd /c $altCmd > "$EXPORT_DIR\SystemHealth_alt.txt" 2>&1
                    
                    if (Test-Path "$EXPORT_DIR\SystemHealth_alt.txt") {
                        Write-Host "Sortie alternative capturee dans: $EXPORT_DIR\SystemHealth_alt.txt" -ForegroundColor Yellow
                    }
                }
            } catch {
                Write-Host "ERREUR lors de l'execution: $_" -ForegroundColor Red
                $_.Exception.Message | Out-File "$EXPORT_DIR\erreurs.log" -Append -Encoding ASCII
            }
            
            Write-Host ""
        }
    }
)

# Fonction pour afficher le menu et obtenir les selections
function Show-ReportMenu {
    Clear-Host
    Write-Host "============= SELECTION DES RAPPORTS A EXECUTER =============" -ForegroundColor Cyan
    Write-Host "0. Executer TOUS les rapports" -ForegroundColor Yellow
    
    for ($i = 0; $i -lt $reports.Count; $i++) {
        Write-Host "$($i+1). $($reports[$i].Description)" -ForegroundColor White
    }
    
    Write-Host "Q. Quitter sans executer de rapports" -ForegroundColor Red
    Write-Host "=========================================================" -ForegroundColor Cyan
    
    $validChoices = @("0", "Q")
    for ($i = 1; $i -le $reports.Count; $i++) {
        $validChoices += $i.ToString()
    }
    
    $choices = @()
    while ($true) {
        $choice = Read-Host "Entrez les numeros des rapports a executer (separes par des virgules), 0 pour tous, ou Q pour quitter"
        
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

# Obtenir les rapports a executer
$selectedIndices = Show-ReportMenu
if ($selectedIndices.Count -eq 0) {
    Write-Host "Aucun rapport selectionne. Fin du script." -ForegroundColor Yellow
    
    # Fermer la session avant de quitter
    try {
        Close-PASSession
        Write-Host "Session CyberArk fermee" -ForegroundColor Green
    } catch {
        Write-Host "Note: Impossible de fermer la session CyberArk: $_" -ForegroundColor Yellow
    }
    
    exit
}

# Executer les rapports selectionnes
$selectedReports = $selectedIndices | ForEach-Object { $reports[$_] }
$totalReports = $selectedReports.Count
$currentReport = 0

foreach ($report in $selectedReports) {
    $currentReport++
    $progress = [math]::Round(($currentReport / $totalReports) * 100)
    Write-Progress -Activity "Generation des rapports CyberArk" -Status "Rapport $currentReport sur $totalReports" -PercentComplete $progress
    
    if ($report.ContainsKey('CustomExecution')) {
        # Utiliser l'execution personnalisee definie dans le rapport
        & $report.CustomExecution $report.Description $report.ScriptPath $report.Parameters
    } else {
        # Utiliser la fonction standard Run-Report
        Run-Report -Description $report.Description -ScriptPath $report.ScriptPath -Parameters $report.Parameters
    }
}

# Completer la barre de progression
Write-Progress -Activity "Generation des rapports CyberArk" -Status "Termine" -PercentComplete 100 -Completed

# Fermer la session a la fin
try {
    Close-PASSession
    Write-Host "Session CyberArk fermee" -ForegroundColor Green
} catch {
    Write-Host "Note: Impossible de fermer la session CyberArk: $_" -ForegroundColor Yellow
}

# Afficher un resume des rapports generes
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "Resume des rapports generes:" -ForegroundColor Cyan
$csvFiles = Get-ChildItem -Path $EXPORT_DIR -Filter "*.csv"
if ($csvFiles.Count -eq 0) {
    Write-Host "Aucun rapport CSV genere. Verifiez le fichier erreurs.log" -ForegroundColor Red
} else {
    $csvFiles | ForEach-Object { Write-Host "- $($_.Name)" -ForegroundColor White }
}

# Verifier s'il y a eu des erreurs
if (Test-Path "$EXPORT_DIR\erreurs.log") {
    Write-Host "`nAttention: Des erreurs ont ete detectees. Consultez le fichier $EXPORT_DIR\erreurs.log" -ForegroundColor Red
} 