#
# Script: requirement_scripts.ps1
# Description: Exécute les scripts nécessaires pour générer tous les rapports pour les dashboards CyberArk
# Auteur: CyberArk API Explorer
#

# Fonction pour afficher un titre
function Show-Title {
    param (
        [string]$Title
    )
    
    $separator = "-" * 80
    Write-Host ""
    Write-Host $separator -ForegroundColor Cyan
    Write-Host "  $Title" -ForegroundColor Cyan
    Write-Host $separator -ForegroundColor Cyan
    Write-Host ""
}

# Fonction pour exécuter un script avec gestion d'erreurs
function Execute-Script {
    param (
        [string]$ScriptName,
        [string]$ScriptPath,
        [string]$Parameters,
        [string]$Description
    )
    
    try {
        Write-Host "`n[INFO] Exécution de $ScriptName" -ForegroundColor Yellow
        Write-Host "[INFO] Description: $Description" -ForegroundColor Gray
        Write-Host "[INFO] Commande: $ScriptPath $Parameters" -ForegroundColor Gray
        Write-Host "[INFO] Veuillez patienter..." -ForegroundColor Gray
        
        # Aller dans le dossier du script
        $originalLocation = Get-Location
        $scriptDirectory = Split-Path -Parent $ScriptPath
        Set-Location -Path $scriptDirectory
        
        # Exécuter le script
        $scriptFile = Split-Path -Leaf $ScriptPath
        $command = "$scriptFile $Parameters"
        Invoke-Expression $command
        
        # Revenir au dossier d'origine
        Set-Location -Path $originalLocation
        
        Write-Host "[SUCCESS] $ScriptName terminé avec succès" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "[ERROR] Erreur lors de l'exécution de $ScriptName : $_" -ForegroundColor Red
        Set-Location -Path $originalLocation
        return $false
    }
}

# Définition des chemins de base
$basePath = $PSScriptRoot
if (-not $basePath) {
    $basePath = "."
}

# Liste des scripts à exécuter
$scripts = @(
    @{
        Name = "System Health"
        Path = "$basePath\System Health\System-Health.ps1"
        Params = '-PVWAURL "{0}" -ExportPath "{1}" -OutputCSV "System_Health.csv"'
        Description = "Rapport sur la santé du système"
        Required = $true
    },
    @{
        Name = "Account Report"
        Path = "$basePath\Reports\Accounts\Get-AccountReport.ps1"
        Params = '-ReportPath "{1}\AccountReport.csv" -PVWAAddress "{0}" -PVWAAuthType "{2}"'
        Description = "Rapport détaillé des comptes"
        Required = $true
    },
    @{
        Name = "Accounts Risk Report"
        Path = "$basePath\Security Events\Get-AccoutnsRiskReport.ps1"
        Params = '-PVWAURL "{0}" -CSVPath "{1}\AccountsRisk.csv"'
        Description = "Rapport de risques des comptes"
        Required = $true
    },
    @{
        Name = "Accounts List"
        Path = "$basePath\Get Accounts\Get-Accounts.ps1"
        Params = '-PVWAURL "{0}" -List -Report -CSVPath "{1}\Accounts.csv" -AutoNextPage'
        Description = "Liste de tous les comptes"
        Required = $true
    },
    @{
        Name = "Discovered Accounts"
        Path = "$basePath\Discovered Accounts\Get-DiscoveredAccountsReport.ps1"
        Params = '-PVWAURL "{0}" -List -AutoNextPage -CSVPath "{1}\DiscoveredAccounts.csv"'
        Description = "Rapport des comptes découverts"
        Required = $true
    },
    @{
        Name = "Safe Member Report"
        Path = "$basePath\Reports\Safes\Get-SafeMemberReport.ps1"
        Params = '-ReportPath "{1}\SafeMemberReport.csv" -PVWAAddress "{0}" -PVWAAuthType "{2}"'
        Description = "Rapport des membres des coffres"
        Required = $true
    },
    @{
        Name = "Safe Management"
        Path = "$basePath\Safe Management\Safe-Management.ps1"
        Params = '-PVWAURL "{0}" -Report -OutputPath "{1}\SafeReport.csv"'
        Description = "Rapport sur les coffres"
        Required = $true
    },
    @{
        Name = "PSM Sessions Management"
        Path = "$basePath\PSM Sessions Management\PSM-SessionsManagement.ps1"
        Params = '-PVWAURL "{0}" -List -PSMServerName "{3}"'
        Description = "Gestion et statistiques des sessions"
        Required = $true
    },
    @{
        Name = "Bulk Account Actions"
        Path = "$basePath\Get Accounts\Invoke-BulkAccountActions.ps1"
        Params = '-PVWAURL "{0}" -AccountsAction "Verify" -FailedOnly'
        Description = "Statistiques de rotation des mots de passe"
        Required = $true
    },
    @{
        Name = "HTML5 Gateway Test"
        Path = "$basePath\Test HTML5 Certificate\Test-HTML5Certificate.ps1"
        Params = ''
        Description = "Test des passerelles HTML5"
        Required = $false
    },
    @{
        Name = "Platform Report"
        Path = "$basePath\Platforms\Get-PlatformReport.ps1"
        Params = '-PVWAURL "{0}" -ExtendedReport -CSVPath "{1}\Platforms.csv"'
        Description = "Rapport sur les plateformes"
        Required = $true
    },
    @{
        Name = "Applications Report"
        Path = "$basePath\AAM Applications\Export-Import-Applications.ps1"
        Params = '-Export -PVWAURL "{0}" -CSVPath "{1}\Applications.csv"'
        Description = "Rapport sur les applications"
        Required = $false
    }
)

# Afficher le titre principal
Show-Title "CyberArk API Explorer - Génération des rapports pour tableaux de bord"

# Demander les variables globales nécessaires
Write-Host "Veuillez saisir les informations requises:" -ForegroundColor Yellow

$PVWAURL = Read-Host -Prompt "URL du PVWA (ex: https://pvwa.domain.com/PasswordVault)"
$ExportPath = Read-Host -Prompt "Chemin d'exportation des rapports (ex: C:\Temp)"
$AuthType = Read-Host -Prompt "Type d'authentification [CyberArk, LDAP, RADIUS] (défaut: CyberArk)"
if ([string]::IsNullOrEmpty($AuthType)) { $AuthType = "CyberArk" }
$PSMServerName = Read-Host -Prompt "Nom du serveur PSM (ex: PSMServer)"

# Créer le dossier d'exportation s'il n'existe pas
if (-not (Test-Path -Path $ExportPath)) {
    try {
        New-Item -Path $ExportPath -ItemType Directory -Force | Out-Null
        Write-Host "[INFO] Dossier d'exportation créé: $ExportPath" -ForegroundColor Gray
    }
    catch {
        Write-Host "[ERROR] Impossible de créer le dossier d'exportation: $_" -ForegroundColor Red
        exit
    }
}

# Proposer de choisir les scripts à exécuter
Show-Title "Sélection des scripts à exécuter"

Write-Host "Que souhaitez-vous faire?"
Write-Host "1. Exécuter tous les scripts"
Write-Host "2. Sélectionner les scripts à exécuter"
$choice = Read-Host -Prompt "Votre choix (1/2)"

$selectedScripts = @()

if ($choice -eq "1") {
    $selectedScripts = $scripts
}
elseif ($choice -eq "2") {
    for ($i = 0; $i -lt $scripts.Count; $i++) {
        $script = $scripts[$i]
        $response = Read-Host -Prompt "Exécuter '$($script.Name)' ? (O/N, défaut: O si requis, N si optionnel)"
        
        if ([string]::IsNullOrEmpty($response)) {
            if ($script.Required) {
                $selectedScripts += $script
                Write-Host "  [Sélectionné] $($script.Name)" -ForegroundColor Green
            }
            else {
                Write-Host "  [Ignoré] $($script.Name)" -ForegroundColor Gray
            }
        }
        elseif ($response.ToUpper() -eq "O") {
            $selectedScripts += $script
            Write-Host "  [Sélectionné] $($script.Name)" -ForegroundColor Green
        }
        else {
            Write-Host "  [Ignoré] $($script.Name)" -ForegroundColor Gray
        }
    }
}
else {
    Write-Host "[ERROR] Choix invalide. Le script va s'arrêter." -ForegroundColor Red
    exit
}

# Exécuter les scripts sélectionnés
Show-Title "Exécution des scripts sélectionnés"

$successCount = 0
$failCount = 0

foreach ($script in $selectedScripts) {
    $parameters = $script.Params -f $PVWAURL, $ExportPath, $AuthType, $PSMServerName
    $result = Execute-Script -ScriptName $script.Name -ScriptPath $script.Path -Parameters $parameters -Description $script.Description
    
    if ($result) {
        $successCount++
    }
    else {
        $failCount++
        
        $retry = Read-Host -Prompt "Voulez-vous réessayer '$($script.Name)' ? (O/N, défaut: N)"
        if ($retry.ToUpper() -eq "O") {
            Write-Host "[INFO] Nouvelle tentative pour $($script.Name)..." -ForegroundColor Yellow
            $result = Execute-Script -ScriptName $script.Name -ScriptPath $script.Path -Parameters $parameters -Description $script.Description
            
            if ($result) {
                $successCount++
                $failCount--
            }
        }
    }
}

# Afficher le résumé
Show-Title "Résumé de l'exécution"

Write-Host "Scripts exécutés avec succès: $successCount" -ForegroundColor Green
Write-Host "Scripts en échec: $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Green" })
Write-Host "Total des scripts sélectionnés: $($selectedScripts.Count)" -ForegroundColor Cyan

Write-Host "`nLes rapports ont été générés dans le dossier: $ExportPath" -ForegroundColor Yellow

# Fin du script
Write-Host "`n[INFO] Script terminé." -ForegroundColor Cyan 