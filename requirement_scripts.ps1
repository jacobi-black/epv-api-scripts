#
# Script: requirement_scripts.ps1
# Description: Exécute les scripts nécessaires pour générer tous les rapports pour les dashboards CyberArk
# Auteur: CyberArk API Explorer
#

[CmdletBinding()]
param (
    [switch]$SkipModuleCheck,      # Ignorer la vérification des modules
    [switch]$WhatIf,               # Simuler l'exécution sans lancer les scripts
    [string]$SingleScript,         # Exécuter un seul script spécifié par son nom
    [switch]$NoInteractive         # Mode non interactif (pour les tâches planifiées)
)

# Configuration de TLS 1.2 (requis pour les API modernes)
try {
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Write-Host "TLS 1.2 activé" -ForegroundColor Green
}
catch {
    Write-Host "ATTENTION: Impossible d'activer TLS 1.2. Certaines connexions API peuvent échouer." -ForegroundColor Red
    Write-Host "Erreur: $_" -ForegroundColor Red
}

# Fonction pour la journalisation
function Write-Log {
    param(
        [string]$Message,
        [string]$Color = "White",
        [switch]$NoConsole
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    
    # Ajouter au fichier de log
    if ($null -ne $script:LogFile) {
        Add-Content -Path $script:LogFile -Value $logMessage
    }
    
    # Afficher dans la console sauf si NoConsole est spécifié
    if (-not $NoConsole) {
        Write-Host $logMessage -ForegroundColor $Color
    }
}

# Fonction pour afficher un titre
function Show-Title {
    param (
        [string]$Title
    )
    
    $separator = "-" * 80
    Write-Log ""
    Write-Log $separator -Color Cyan
    Write-Log "  $Title" -Color Cyan
    Write-Log $separator -Color Cyan
    Write-Log ""
}

# Fonction pour vérifier les modules requis
function Test-RequiredModules {
    param (
        [string[]]$Modules
    )
    
    $missingModules = @()
    
    foreach ($module in $Modules) {
        if (-not (Get-Module -ListAvailable -Name $module)) {
            $missingModules += $module
        }
    }
    
    return $missingModules
}

# Fonction pour installer les modules manquants
function Install-RequiredModules {
    param (
        [string[]]$Modules
    )
    
    # Vérifier si PowerShellGet est disponible
    if (-not (Get-Module -ListAvailable -Name PowerShellGet)) {
        Write-Log "Le module PowerShellGet n'est pas disponible. Tentative d'installation de base..." -Color Yellow
        try {
            # Installation de PowerShellGet via méthode alternative
            Invoke-Expression "Install-Module -Name PowerShellGet -Force -Scope CurrentUser -AllowClobber" -ErrorAction Stop
        }
        catch {
            Write-Log "Erreur lors de l'installation de PowerShellGet. Installation manuelle requise." -Color Red
            Write-Log "Pour installer manuellement, exécutez: Install-Module -Name PowerShellGet -Force -Scope CurrentUser" -Color Yellow
            return $false
        }
    }
    
    # Vérifier les droits d'administrateur
    $isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    $scopeParam = if ($isAdmin) { "" } else { "-Scope CurrentUser" }
    
    foreach ($module in $Modules) {
        try {
            Write-Log "Installation du module requis: $module..." -Color Yellow
            
            # Essayer d'abord avec Scope CurrentUser si non admin
            if (-not $isAdmin) {
                Write-Log "Installation en tant qu'utilisateur (non administrateur)" -Color Gray
                $installCmd = "Install-Module -Name '$module' -Force -Scope CurrentUser -AllowClobber -SkipPublisherCheck -ErrorAction Stop"
            } else {
                $installCmd = "Install-Module -Name '$module' -Force -AllowClobber -SkipPublisherCheck -ErrorAction Stop"
            }
            
            try {
                # Configurer TLS 1.2 explicitement pour éviter les erreurs de connexion
                [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
                
                # Exécuter la commande d'installation
                Invoke-Expression $installCmd
                
                # Vérifier si l'installation a réussi
                if (Get-Module -ListAvailable -Name $module) {
                    Write-Log "Module $module installé avec succès" -Color Green
                } else {
                    throw "Le module n'a pas été installé correctement"
                }
            }
            catch {
                # Si l'installation échoue, afficher un message plus détaillé
                Write-Log "Erreur lors de l'installation via PowerShellGet: $_" -Color Red
                
                # Proposer une méthode alternative pour les modules essentiels
                if ($module -eq "PSSolutions.CyberArk.Common") {
                    Write-Log "Vous pouvez télécharger manuellement CyberArk-Common depuis:" -Color Yellow
                    Write-Log "https://github.com/cyberark/epv-api-scripts/blob/main/CyberArk-Common/CyberArk-Common.psm1" -Color Yellow
                    Write-Log "Et le placer dans le même dossier que les scripts" -Color Yellow
                }
                
                Write-Log "Tentative d'installation alternative..." -Color Yellow
                try {
                    # Méthode alternative utilisant Save-Module puis Import-Module
                    $tempPath = Join-Path $env:TEMP "TempModules\$module"
                    if (-not (Test-Path $tempPath)) {
                        New-Item -Path $tempPath -ItemType Directory -Force | Out-Null
                    }
                    
                    Save-Module -Name $module -Path $env:TEMP\TempModules -Force -ErrorAction Stop
                    Write-Log "Module sauvegardé dans $tempPath" -Color Gray
                    
                    # Copier vers le répertoire des modules utilisateur
                    $userModulePath = "$HOME\Documents\WindowsPowerShell\Modules\$module"
                    if (-not (Test-Path $userModulePath)) {
                        New-Item -Path $userModulePath -ItemType Directory -Force | Out-Null
                    }
                    
                    Copy-Item -Path "$tempPath\*" -Destination $userModulePath -Recurse -Force
                    Write-Log "Module copié vers $userModulePath" -Color Gray
                    
                    Import-Module $module -Force -ErrorAction Stop
                    Write-Log "Module $module installé avec méthode alternative" -Color Green
                }
                catch {
                    Write-Log "Échec également avec la méthode alternative: $_" -Color Red
                    Write-Log "Certains scripts peuvent échouer sans ce module." -Color Red
                }
            }
        }
        catch {
            Write-Log "Erreur générale lors de l'installation du module $module: $_" -Color Red
            Write-Log "Certains scripts peuvent échouer sans ce module." -Color Red
        }
    }
}

# Fonction pour exécuter un script avec gestion d'erreurs
function Execute-Script {
    param (
        [string]$ScriptName,
        [string]$ScriptPath,
        [string]$Parameters,
        [string]$Description,
        [System.Management.Automation.PSCredential]$Credentials = $null,
        [bool]$NeedsCredentials = $false
    )
    
    # Vérifier si le script existe
    if (-not (Test-Path -Path $ScriptPath)) {
        Write-Log "Le script $ScriptPath n'existe pas" -Color Red
        return $false
    }
    
    # Si WhatIf est spécifié, simuler l'exécution sans lancer le script
    if ($WhatIf) {
        Write-Log "[SIMULATION] Exécution de $ScriptName" -Color Magenta
        Write-Log "[SIMULATION] Commande: $ScriptPath $Parameters" -Color Magenta
        if ($NeedsCredentials -and $null -ne $Credentials) {
            Write-Log "[SIMULATION] Utilisation des credentials: $($Credentials.UserName)" -Color Magenta
        }
        return $true
    }
    
    try {
        Write-Log "`nExécution de $ScriptName" -Color Yellow
        Write-Log "Description: $Description" -Color Gray
        Write-Log "Commande: $ScriptPath $Parameters" -Color Gray
        Write-Log "Veuillez patienter..." -Color Gray
        
        # Aller dans le dossier du script
        $originalLocation = Get-Location
        $scriptDirectory = Split-Path -Parent $ScriptPath
        Set-Location -Path $scriptDirectory
        
        # Exécuter le script en utilisant PowerShell avec les arguments appropriés
        $scriptFile = Split-Path -Leaf $ScriptPath
        
        # Construire la commande différemment selon que le script a besoin de credentials ou non
        $success = $false
        
        if ($NeedsCredentials -and $null -ne $Credentials) {
            Write-Log "Exécution avec credentials pour $ScriptName" -Color Gray -NoConsole
            
            # Utiliser splatting au lieu d'injecter directement les credentials
            $splat = @{
                PVWACredentials = $Credentials
            }
            
            # Exécuter avec gestion d'erreur
            try {
                $scriptBlock = [ScriptBlock]::Create(".\$scriptFile $Parameters")
                & $scriptBlock @splat
                $success = $?
            }
            catch {
                Write-Log "Erreur lors de l'exécution avec credentials: $_" -Color Red
                $success = $false
            }
        }
        else {
            # Exécution normale sans credentials
            try {
                $command = "& .\$scriptFile $Parameters"
                Invoke-Expression $command -ErrorAction Stop
                $success = $true
            }
            catch {
                Write-Log "Erreur lors de l'exécution de la commande: $_" -Color Red
                $success = $false
            }
        }
        
        # Revenir au dossier d'origine
        Set-Location -Path $originalLocation
        
        if ($success) {
            Write-Log "$ScriptName terminé avec succès" -Color Green
            return $true
        }
        else {
            Write-Log "Échec de l'exécution de $ScriptName" -Color Red
            return $false
        }
    }
    catch {
        Write-Log "Erreur lors de l'exécution de $ScriptName : $_" -Color Red
        
        # Assurez-vous de toujours revenir au dossier d'origine
        if ((Get-Location).Path -ne $originalLocation) {
            Set-Location -Path $originalLocation
        }
        
        return $false
    }
}

# Définition des chemins de base
$basePath = $PSScriptRoot
if (-not $basePath) {
    $basePath = "."
}

# Fonction pour demander des credentials
function Get-SecureCyberArkCredentials {
    $username = Read-Host -Prompt "Nom d'utilisateur CyberArk"
    if ([string]::IsNullOrEmpty($username)) {
        Write-Log "Le nom d'utilisateur est obligatoire." -Color Red
        return $null
    }
    
    $securePassword = Read-Host -Prompt "Mot de passe" -AsSecureString
    
    $credentials = New-Object System.Management.Automation.PSCredential($username, $securePassword)
    return $credentials
}

# Créer une fonction pour vérifier l'existence des scripts
function Verify-Scripts {
    param (
        [array]$ScriptsList
    )
    
    $missingScripts = @()
    
    foreach ($script in $ScriptsList) {
        if (-not (Test-Path -Path $script.Path)) {
            $missingScripts += "$($script.Name) ($($script.Path))"
        }
    }
    
    return $missingScripts
}

# Liste des scripts à exécuter
$scripts = @(
    @{
        Name = "System Health"
        Path = "$basePath\System Health\System-Health.ps1"
        Params = '-PVWAURL "{0}" -ExportPath "{1}" -OutputCSV "System_Health.csv"'
        Description = "Rapport sur la santé du système"
        Required = $true
        NeedsCredentials = $true
    },
    @{
        Name = "Account Report"
        Path = "$basePath\Reports\Accounts\Get-AccountReport.ps1"
        Params = '-ReportPath "{1}\AccountReport.csv" -PVWAAddress "{0}" -PVWAAuthType "{2}"'
        Description = "Rapport détaillé des comptes"
        Required = $true
        NeedsCredentials = $true
    },
    @{
        Name = "Accounts Risk Report"
        Path = "$basePath\Security Events\Get-AccoutnsRiskReport.ps1"
        Params = '-PVWAURL "{0}" -CSVPath "{1}\AccountsRisk.csv" -AuthType "{2}"'
        Description = "Rapport de risques des comptes"
        Required = $true
        NeedsCredentials = $false
    },
    @{
        Name = "Accounts List"
        Path = "$basePath\Get Accounts\Get-Accounts.ps1"
        Params = '-PVWAURL "{0}" -List -Report -CSVPath "{1}\Accounts.csv" -AutoNextPage'
        Description = "Liste de tous les comptes"
        Required = $true
        NeedsCredentials = $false
    },
    @{
        Name = "Discovered Accounts"
        Path = "$basePath\Discovered Accounts\Get-DiscoveredAccountsReport.ps1"
        Params = '-PVWAURL "{0}" -List -AutoNextPage -CSVPath "{1}\DiscoveredAccounts.csv" -AuthType "{2}"'
        Description = "Rapport des comptes découverts"
        Required = $true
        NeedsCredentials = $false
    },
    @{
        Name = "Safe Member Report"
        Path = "$basePath\Reports\Safes\Get-SafeMemberReport.ps1"
        Params = '-ReportPath "{1}\SafeMemberReport.csv" -PVWAAddress "{0}" -PVWAAuthType "{2}"'
        Description = "Rapport des membres des coffres"
        Required = $true
        NeedsCredentials = $true
    },
    @{
        Name = "Safe Management"
        Path = "$basePath\Safe Management\Safe-Management.ps1"
        Params = '-PVWAURL "{0}" -Report -OutputPath "{1}\SafeReport.csv"'
        Description = "Rapport sur les coffres"
        Required = $true
        NeedsCredentials = $true
    },
    @{
        Name = "PSM Sessions Management"
        Path = "$basePath\PSM Sessions Management\PSM-SessionsManagement.ps1"
        Params = '-PVWAURL "{0}" -List -PSMServerName "{3}" -AuthType "{2}"'
        Description = "Gestion et statistiques des sessions"
        Required = $true
        NeedsCredentials = $false
    },
    @{
        Name = "Bulk Account Actions"
        Path = "$basePath\Get Accounts\Invoke-BulkAccountActions.ps1"
        Params = '-PVWAURL "{0}" -AccountsAction "Verify" -FailedOnly -AuthType "{2}"'
        Description = "Statistiques de rotation des mots de passe"
        Required = $true
        NeedsCredentials = $false
    },
    @{
        Name = "HTML5 Gateway Test"
        Path = "$basePath\Test HTML5 Certificate\Test-HTML5Certificate.ps1"
        Params = ''
        Description = "Test des passerelles HTML5"
        Required = $false
        NeedsCredentials = $false
    },
    @{
        Name = "Platform Report"
        Path = "$basePath\Platforms\Get-PlatformReport.ps1"
        Params = '-PVWAURL "{0}" -ExtendedReport -CSVPath "{1}\Platforms.csv" -AuthType "{2}"'
        Description = "Rapport sur les plateformes"
        Required = $true
        NeedsCredentials = $false
    },
    @{
        Name = "Applications Report"
        Path = "$basePath\AAM Applications\Export-Import-Applications.ps1"
        Params = '-Export -PVWAURL "{0}" -CSVPath "{1}\Applications.csv" -AuthType "{2}"'
        Description = "Rapport sur les applications"
        Required = $false
        NeedsCredentials = $false
    }
)

# Vérifier les modules requis pour les scripts CyberArk
$requiredModules = @(
    "PSSolutions.CyberArk.Common",
    "PowerShellGet",
    "PackageManagement",
    "PSReadLine"
)

# Modules recommandés mais facultatifs
$recommendedModules = @(
    "psPAS",         # Pour API REST CyberArk
    "ImportExcel",   # Pour l'exportation Excel améliorée
    "PSWriteHTML",   # Pour les rapports HTML
    "PSWriteColor",  # Pour l'amélioration de l'affichage console
    "PSScriptAnalyzer" # Pour vérifier les scripts
)

# Fonction pour vérifier les composants CyberArk installés
function Get-CyberArkComponents {
    $cyberArkComponents = @{
        "CPM" = @()
        "PSM" = @()
        "PVWA" = @()
        "AIM" = @()
        "EPV" = @()
        "PSMP" = @()
        "PTA" = @()
    }
    
    # Vérifier les installations possibles via le registre Windows
    try {
        # Vérifier les composants installés via des chemins d'installation typiques
        $possiblePaths = @(
            "C:\Program Files\CyberArk",
            "C:\Program Files (x86)\CyberArk",
            "D:\CyberArk",
            "E:\CyberArk"
        )
        
        foreach ($path in $possiblePaths) {
            if (Test-Path $path) {
                # Vérifier les sous-dossiers pour identifier les composants
                $subDirs = Get-ChildItem -Path $path -Directory -ErrorAction SilentlyContinue
                
                foreach ($dir in $subDirs) {
                    if ($dir.Name -like "*Password Manager*" -or $dir.Name -like "*CPM*") {
                        $cyberArkComponents["CPM"] += $dir.FullName
                    }
                    elseif ($dir.Name -like "*Privileged Session Manager*" -or $dir.Name -like "*PSM*") {
                        $cyberArkComponents["PSM"] += $dir.FullName
                    }
                    elseif ($dir.Name -like "*Password Vault Web Access*" -or $dir.Name -like "*PVWA*") {
                        $cyberArkComponents["PVWA"] += $dir.FullName
                    }
                    elseif ($dir.Name -like "*Application Identity Manager*" -or $dir.Name -like "*AIM*") {
                        $cyberArkComponents["AIM"] += $dir.FullName
                    }
                    elseif ($dir.Name -like "*Enterprise Password Vault*" -or $dir.Name -like "*EPV*") {
                        $cyberArkComponents["EPV"] += $dir.FullName
                    }
                    elseif ($dir.Name -like "*Privileged Session Manager SSH Proxy*" -or $dir.Name -like "*PSMP*") {
                        $cyberArkComponents["PSMP"] += $dir.FullName
                    }
                    elseif ($dir.Name -like "*Privileged Threat Analytics*" -or $dir.Name -like "*PTA*") {
                        $cyberArkComponents["PTA"] += $dir.FullName
                    }
                }
            }
        }
    }
    catch {
        Write-Log "Erreur lors de la recherche des composants CyberArk: $_" -Color Yellow
    }
    
    return $cyberArkComponents
}

# Fonction pour vérifier les dépendances système spécifiques à CyberArk
function Test-CyberArkSystemRequirements {
    $requirements = @{
        "PowerShell Version" = @{
            Required = "5.1"
            Current = $PSVersionTable.PSVersion.ToString()
            Status = $false
        }
        ".NET Framework" = @{
            Required = "4.7.2"
            Current = "Unknown"
            Status = $false
        }
        "TLS 1.2 Enabled" = @{
            Required = $true
            Current = $false
            Status = $false
        }
    }
    
    # Vérifier la version de PowerShell
    if ([version]$PSVersionTable.PSVersion -ge [version]"5.1") {
        $requirements["PowerShell Version"].Status = $true
    }
    
    # Vérifier .NET Framework
    try {
        $netRegPath = "HKLM:\SOFTWARE\Microsoft\NET Framework Setup\NDP\v4\Full\"
        if (Test-Path $netRegPath) {
            $netRelease = (Get-ItemProperty $netRegPath -Name Release).Release
            $netVersion = switch ($netRelease) {
                { $_ -ge 461808 } { "4.7.2 ou supérieur"; break }
                { $_ -ge 461308 } { "4.7.1"; break }
                { $_ -ge 460798 } { "4.7"; break }
                { $_ -ge 394802 } { "4.6.2"; break }
                { $_ -ge 394254 } { "4.6.1"; break }
                { $_ -ge 393295 } { "4.6"; break }
                { $_ -ge 379893 } { "4.5.2"; break }
                default { "4.5 ou inférieur" }
            }
            
            $requirements[".NET Framework"].Current = $netVersion
            if ($netRelease -ge 461808) {
                $requirements[".NET Framework"].Status = $true
            }
        }
    }
    catch {
        $requirements[".NET Framework"].Current = "Erreur de vérification"
    }
    
    # Vérifier TLS 1.2
    try {
        $securityProtocols = [Net.ServicePointManager]::SecurityProtocol
        $requirements["TLS 1.2 Enabled"].Current = ($securityProtocols -match "Tls12")
        $requirements["TLS 1.2 Enabled"].Status = ($securityProtocols -match "Tls12")
    }
    catch {
        $requirements["TLS 1.2 Enabled"].Current = "Erreur de vérification"
    }
    
    return $requirements
}

$missingModules = Test-RequiredModules -Modules $requiredModules
$recommendedMissingModules = Test-RequiredModules -Modules $recommendedModules
$cyberArkComponents = Get-CyberArkComponents
$systemRequirements = Test-CyberArkSystemRequirements

# Afficher les résultats des vérifications
Show-Title "Vérification de l'environnement CyberArk"

# Sauter les vérifications de modules si demandé
if ($SkipModuleCheck) {
    Write-Log "Vérification des modules désactivée par l'utilisateur" -Color Yellow
}
else {
    # Vérifier les exigences système
    Write-Log "Exigences système:" -Color Cyan
    foreach ($req in $systemRequirements.GetEnumerator()) {
        $statusColor = if ($req.Value.Status) { "Green" } else { "Yellow" }
        $statusText = if ($req.Value.Status) { "OK" } else { "Attention" }
        Write-Log "  $($req.Key): $($req.Value.Current) [Requis: $($req.Value.Required)] - $statusText" -Color $statusColor
    }

    # Afficher les composants CyberArk détectés
    Write-Log "`nComposants CyberArk détectés:" -Color Cyan
    $componentsDetected = $false
    foreach ($component in $cyberArkComponents.GetEnumerator()) {
        if ($component.Value.Count -gt 0) {
            $componentsDetected = $true
            Write-Log "  $($component.Key) - $($component.Value.Count) instance(s)" -Color Green
            foreach ($instance in $component.Value) {
                Write-Log "    - $instance" -Color Gray
            }
        }
    }

    if (-not $componentsDetected) {
        Write-Log "  Aucun composant CyberArk détecté localement." -Color Yellow
        Write-Log "  Cela n'affectera pas l'exécution des scripts si vous vous connectez à un serveur distant." -Color Yellow
    }

    # Vérifier les modules requis
    if ($missingModules.Count -gt 0) {
        Write-Log "`nModules requis manquants:" -Color Yellow
        foreach ($module in $missingModules) {
            Write-Log "  - $module (REQUIS)" -Color Red
        }
        
        $installModules = Read-Host -Prompt "Voulez-vous installer les modules requis manquants? (O/N, défaut: O)"
        if ([string]::IsNullOrEmpty($installModules) -or $installModules.ToUpper() -eq "O") {
            Install-RequiredModules -Modules $missingModules
        }
        else {
            Write-Log "ATTENTION: Sans ces modules requis, certains scripts échoueront." -Color Red
        }
    }
    else {
        Write-Log "`nTous les modules requis sont installés." -Color Green
    }

    # Vérifier les modules recommandés
    if ($recommendedMissingModules.Count -gt 0) {
        Write-Log "`nModules recommandés manquants:" -Color Yellow
        foreach ($module in $recommendedMissingModules) {
            Write-Log "  - $module (Recommandé)" -Color Yellow
        }
        
        $installRecommended = Read-Host -Prompt "Voulez-vous installer les modules recommandés? (O/N, défaut: N)"
        if ($installRecommended.ToUpper() -eq "O") {
            Install-RequiredModules -Modules $recommendedMissingModules
        }
        else {
            Write-Log "Les modules recommandés peuvent améliorer certaines fonctionnalités mais ne sont pas obligatoires." -Color Gray
        }
    }
    else {
        Write-Log "`nTous les modules recommandés sont installés." -Color Green
    }
}

# Afficher le titre principal
Show-Title "CyberArk API Explorer - Génération des rapports pour tableaux de bord"

# Demander les variables globales nécessaires
Write-Log "Veuillez saisir les informations requises:" -Color Yellow

$PVWAURL = Read-Host -Prompt "URL du PVWA (ex: https://pvwa.domain.com/PasswordVault)"
if ([string]::IsNullOrEmpty($PVWAURL)) {
    Write-Log "L'URL du PVWA est obligatoire." -Color Red
    exit
}

$ExportPath = Read-Host -Prompt "Chemin d'exportation des rapports (ex: C:\Temp)"
if ([string]::IsNullOrEmpty($ExportPath)) {
    $ExportPath = Join-Path -Path $PSScriptRoot -ChildPath "Exports"
    Write-Log "Chemin d'exportation par défaut utilisé: $ExportPath" -Color Yellow
}

# Initialiser le fichier de log
$script:LogFile = Join-Path -Path $ExportPath -ChildPath "execution_log_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"

$AuthType = Read-Host -Prompt "Type d'authentification [CyberArk, LDAP, RADIUS] (défaut: CyberArk)"
if ([string]::IsNullOrEmpty($AuthType)) { 
    $AuthType = "CyberArk"
    Write-Log "Type d'authentification par défaut utilisé: $AuthType" -Color Yellow
}

$PSMServerName = Read-Host -Prompt "Nom du serveur PSM (ex: PSMServer)"
if ([string]::IsNullOrEmpty($PSMServerName)) {
    Write-Log "Aucun nom de serveur PSM fourni. Certains scripts peuvent échouer." -Color Yellow
}

# Demander les informations d'identification si nécessaire
$credentialsNeeded = $scripts | Where-Object { $_.NeedsCredentials -eq $true }
if ($credentialsNeeded.Count -gt 0) {
    Write-Log "`nCertains scripts nécessitent des informations d'identification CyberArk." -Color Yellow
    $credentials = Get-SecureCyberArkCredentials
    
    if ($null -eq $credentials) {
        Write-Log "Informations d'identification non valides. Le script va s'arrêter." -Color Red
        exit
    }
}
else {
    $credentials = $null
}

# Créer le dossier d'exportation s'il n'existe pas
if (-not (Test-Path -Path $ExportPath)) {
    try {
        New-Item -Path $ExportPath -ItemType Directory -Force | Out-Null
        Write-Log "Dossier d'exportation créé: $ExportPath" -Color Gray
    }
    catch {
        Write-Log "Impossible de créer le dossier d'exportation: $_" -Color Red
        $ExportPath = Join-Path -Path $PSScriptRoot -ChildPath "Exports"
        New-Item -Path $ExportPath -ItemType Directory -Force -ErrorAction SilentlyContinue | Out-Null
        Write-Log "Utilisation du dossier d'exportation par défaut: $ExportPath" -Color Yellow
    }
}

# Vérifier l'existence des scripts
$missingScripts = Verify-Scripts -ScriptsList $scripts
if ($missingScripts.Count -gt 0) {
    Write-Log "`nLes scripts suivants sont introuvables :" -Color Yellow
    foreach ($script in $missingScripts) {
        Write-Log "  - $script" -Color Yellow
    }
    
    $continue = Read-Host -Prompt "Voulez-vous continuer malgré les scripts manquants ? (O/N, défaut: N)"
    if ($continue.ToUpper() -ne "O") {
        Write-Log "Script arrêté par l'utilisateur." -Color Cyan
        exit
    }
}

# Mettre à jour le code dans la section de sélection des scripts après tous les préparatifs (avant l'exécution des scripts)

if ($WhatIf) {
    Write-Log "Mode SIMULATION activé - Les scripts ne seront pas réellement exécutés" -Color Magenta
}

if (-not [string]::IsNullOrEmpty($SingleScript)) {
    Write-Log "Mode SCRIPT UNIQUE activé - Seul le script '$SingleScript' sera exécuté" -Color Magenta
    
    # Chercher le script demandé par son nom
    $scriptToRun = $scripts | Where-Object { $_.Name -eq $SingleScript }
    
    if ($null -eq $scriptToRun) {
        # Essayer une recherche moins stricte
        $scriptToRun = $scripts | Where-Object { $_.Name -like "*$SingleScript*" }
        
        if ($null -eq $scriptToRun -or $scriptToRun.Count -eq 0) {
            Write-Log "Aucun script correspondant à '$SingleScript' n'a été trouvé" -Color Red
            exit
        }
        elseif ($scriptToRun.Count -gt 1) {
            Write-Log "Plusieurs scripts correspondent à '$SingleScript':" -Color Yellow
            foreach ($s in $scriptToRun) {
                Write-Log "  - $($s.Name)" -Color Yellow
            }
            Write-Log "Veuillez spécifier un nom plus précis" -Color Yellow
            exit
        }
        else {
            # Un seul script trouvé
            Write-Log "Script trouvé: $($scriptToRun.Name)" -Color Green
        }
    }
    
    $selectedScripts = @($scriptToRun)
}
elseif ($NoInteractive) {
    # Mode non interactif, exécuter tous les scripts requis
    Write-Log "Mode NON INTERACTIF activé - Tous les scripts requis seront exécutés" -Color Yellow
    $selectedScripts = $scripts | Where-Object { $_.Required -and (Test-Path -Path $_.Path) }
}
else {
    # Mode interactif normal - continuer avec la sélection des scripts comme avant
    # Proposer de choisir les scripts à exécuter
    Show-Title "Sélection des scripts à exécuter"
    
    Write-Log "Que souhaitez-vous faire?" -Color Yellow
    Write-Log "1. Exécuter tous les scripts disponibles" -Color White
    Write-Log "2. Sélectionner les scripts à exécuter" -Color White
    $choice = Read-Host -Prompt "Votre choix (1/2)"
    
    $selectedScripts = @()
    
    if ($choice -eq "1") {
        # Filtrer les scripts manquants
        $selectedScripts = $scripts | Where-Object { Test-Path -Path $_.Path }
        
        if ($selectedScripts.Count -lt $scripts.Count) {
            Write-Log "Certains scripts n'ont pas été sélectionnés car ils sont introuvables." -Color Yellow
        }
    }
    elseif ($choice -eq "2") {
        for ($i = 0; $i -lt $scripts.Count; $i++) {
            $script = $scripts[$i]
            
            # Vérifier si le script existe
            if (-not (Test-Path -Path $script.Path)) {
                Write-Log "  [Non disponible] $($script.Name) - Fichier introuvable" -Color Red
                continue
            }
            
            $response = Read-Host -Prompt "Exécuter '$($script.Name)' ? (O/N, défaut: O si requis, N si optionnel)"
            
            if ([string]::IsNullOrEmpty($response)) {
                if ($script.Required) {
                    $selectedScripts += $script
                    Write-Log "  [Sélectionné] $($script.Name)" -Color Green
                }
                else {
                    Write-Log "  [Ignoré] $($script.Name)" -Color Gray
                }
            }
            elseif ($response.ToUpper() -eq "O") {
                $selectedScripts += $script
                Write-Log "  [Sélectionné] $($script.Name)" -Color Green
            }
            else {
                Write-Log "  [Ignoré] $($script.Name)" -Color Gray
            }
        }
    }
    else {
        Write-Log "Choix invalide. Le script va s'arrêter." -Color Red
        exit
    }
}

if ($selectedScripts.Count -eq 0) {
    Write-Log "Aucun script sélectionné. Le script va s'arrêter." -Color Red
    exit
}

# Exécuter les scripts sélectionnés
Show-Title "Exécution des scripts sélectionnés"

$successCount = 0
$failCount = 0
$skippedCount = 0
$totalScripts = $selectedScripts.Count
$currentScript = 0

foreach ($script in $selectedScripts) {
    $currentScript++
    $progressPercentage = [math]::Round(($currentScript / $totalScripts) * 100)
    Write-Progress -Activity "Exécution des scripts" -Status "$currentScript/$totalScripts - $($script.Name)" -PercentComplete $progressPercentage
    
    # Vérifier à nouveau si le script existe avant d'essayer de l'exécuter
    if (-not (Test-Path -Path $script.Path)) {
        Write-Log "Script '$($script.Name)' introuvable: $($script.Path)" -Color Yellow
        $skippedCount++
        continue
    }
    
    # Formater les paramètres
    $parameters = $script.Params -f $PVWAURL, $ExportPath, $AuthType, $PSMServerName
    
    # Exécuter le script avec ou sans credentials selon les besoins
    $result = Execute-Script -ScriptName $script.Name -ScriptPath $script.Path -Parameters $parameters -Description $script.Description -Credentials $credentials -NeedsCredentials $script.NeedsCredentials
    
    if ($result) {
        $successCount++
    }
    else {
        $failCount++
        
        $retry = Read-Host -Prompt "Voulez-vous réessayer '$($script.Name)' ? (O/N, défaut: N)"
        if ($retry.ToUpper() -eq "O") {
            Write-Log "Nouvelle tentative pour $($script.Name)..." -Color Yellow
            $result = Execute-Script -ScriptName $script.Name -ScriptPath $script.Path -Parameters $parameters -Description $script.Description -Credentials $credentials -NeedsCredentials $script.NeedsCredentials
            
            if ($result) {
                $successCount++
                $failCount--
            }
        }
        
        $skipRemaining = Read-Host -Prompt "Voulez-vous ignorer les scripts restants et terminer ? (O/N, défaut: N)"
        if ($skipRemaining.ToUpper() -eq "O") {
            Write-Log "Interruption demandée par l'utilisateur." -Color Yellow
            break
        }
    }
}

# Compléter la barre de progression
Write-Progress -Activity "Exécution des scripts" -Completed

# Afficher le résumé
Show-Title "Résumé de l'exécution"

Write-Log "Scripts exécutés avec succès: $successCount" -Color Green
Write-Log "Scripts en échec: $failCount" -Color $(if ($failCount -gt 0) { "Red" } else { "Green" })
if ($skippedCount -gt 0) {
    Write-Log "Scripts ignorés (introuvables): $skippedCount" -Color Yellow
}
Write-Log "Total des scripts sélectionnés: $($selectedScripts.Count)" -Color Cyan

Write-Log "`nLes rapports ont été générés dans le dossier: $ExportPath" -Color Yellow
Write-Log "Journal d'exécution: $script:LogFile" -Color Yellow

# Fin du script
Write-Log "`nScript terminé." -Color Cyan 