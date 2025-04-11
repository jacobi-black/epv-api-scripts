# Prérequis des scripts CyberArk pour la génération de rapports CSV
# Ce fichier liste les prérequis pour chaque script générant des fichiers CSV

Write-Host "Prérequis des scripts CyberArk pour la génération de rapports CSV" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Reports\Accounts\Get-AccountReport.ps1" -ForegroundColor Green
Write-Host "Prérequis:" -ForegroundColor Yellow
Write-Host "- Version CyberArk: Compatible avec toutes les versions"
Write-Host "- Modules PowerShell: PSPAS (sera automatiquement installé si absent)"
Write-Host "- Permissions requises: Accès aux comptes via API"
Write-Host "- Options d'authentification:"
Write-Host "  * LogonToken préétabli"
Write-Host "  * Identity pour PCloud ISPSS (IdentityUserName, IdentityURL, PCloudSubDomain)"
Write-Host "  * PVWA direct (PVWAAddress, PVWACredentials, PVWAAuthType)"
Write-Host ""

Write-Host "2. Reports\Safes\Get-SafeMemberReport.ps1" -ForegroundColor Green
Write-Host "Prérequis:" -ForegroundColor Yellow
Write-Host "- Version CyberArk: Compatible avec toutes les versions"
Write-Host "- Modules PowerShell: PSPAS (sera automatiquement installé si absent)"
Write-Host "- Permissions requises: Accès aux safes via API"
Write-Host "- Options d'authentification:"
Write-Host "  * LogonToken préétabli"
Write-Host "  * Identity pour PCloud ISPSS (IdentityUserName, IdentityURL, PCloudSubDomain)"
Write-Host "  * PVWA direct (PVWAAddress, PVWACredentials, PVWAAuthType)"
Write-Host ""

Write-Host "3. Discovered Accounts\Get-DiscoveredAccountsReport.ps1" -ForegroundColor Green
Write-Host "Prérequis:" -ForegroundColor Yellow
Write-Host "- Version CyberArk: PVWA v11.6 et supérieure"
Write-Host "- Permissions requises: Accès aux comptes découverts via API"
Write-Host "- Options d'authentification:"
Write-Host "  * LogonToken pour ISPSS"
Write-Host "  * AuthType (CyberArk, LDAP, RADIUS)"
Write-Host "- Note: Utilise l'API REST et supporte PVWA v11.6+"
Write-Host ""

Write-Host "4. User Management\Get-InactiveUsersReport.ps1" -ForegroundColor Green
Write-Host "Prérequis:" -ForegroundColor Yellow
Write-Host "- Version CyberArk: PVWA v10.9 et supérieure"
Write-Host "- Permissions requises: Audit Users"
Write-Host "- Pour le filtrage par durée d'inactivité: v11.1 minimum"
Write-Host "- Options d'authentification:"
Write-Host "  * AuthType (CyberArk, LDAP, RADIUS)"
Write-Host "- Note: Utilise l'API REST de 2ème génération"
Write-Host ""

Write-Host "5. Platforms\Get-PlatformReport.ps1" -ForegroundColor Green
Write-Host "Prérequis:" -ForegroundColor Yellow
Write-Host "- Version CyberArk: PVWA v11.6 et supérieure"
Write-Host "- Permissions requises: Accès aux plateformes via API"
Write-Host "- Options d'authentification:"
Write-Host "  * AuthType"
Write-Host "- Note: Rapport sur les plateformes cibles et leurs composants de connexion"
Write-Host ""

Write-Host "6. Security Events\Get-AccoutnsRiskReport.ps1" -ForegroundColor Green
Write-Host "Prérequis:" -ForegroundColor Yellow
Write-Host "- Version CyberArk: PVWA v10.4 et supérieure"
Write-Host "- Nécessite PTA installé et des identifiants utilisateur ayant accès au module Security Events"
Write-Host "- Options d'authentification:"
Write-Host "  * AuthType (CyberArk, LDAP, RADIUS)"
Write-Host "- Note: Collecte des informations de risque à partir des événements de sécurité PTA"
Write-Host ""

Write-Host "7. PSM Sessions Management\PSM-SessionsManagement.ps1" -ForegroundColor Green
Write-Host "Prérequis:" -ForegroundColor Yellow
Write-Host "- Version CyberArk: v10.5 et supérieure"
Write-Host "- Permissions requises: Accès aux sessions PSM"
Write-Host "- Options d'authentification:"
Write-Host "  * AuthType (CyberArk, LDAP, RADIUS)"
Write-Host "- Note: Liste ou termine toutes les sessions actives sur un serveur PSM spécifique"
Write-Host ""

Write-Host "8. AAM Applications\Export-Import-Applications.ps1" -ForegroundColor Green
Write-Host "Prérequis:" -ForegroundColor Yellow
Write-Host "- Version CyberArk: PVWA v9.10 et supérieure"
Write-Host "- Permissions requises: Accès aux applications via API"
Write-Host "- Options d'authentification:"
Write-Host "  * AuthType"
Write-Host "- Note: Export/import des applications, y compris les méthodes d'authentification"
Write-Host ""

Write-Host "9. Optimize Address\Optimize-Addresses.ps1" -ForegroundColor Green
Write-Host "Prérequis:" -ForegroundColor Yellow
Write-Host "- Permissions requises: Accès aux comptes via API"
Write-Host "- Options d'authentification:"
Write-Host "  * LogonToken"
Write-Host "  * Identity (IdentityUserName, IdentityTenantURL, PCloudSubdomain)"
Write-Host "  * PVWA direct (PVWACredentials, PVWAAddress)"
Write-Host "- Note: Utilisé pour vérifier les adresses de compte contre DNS et assurer leur validité"
Write-Host ""

Write-Host "10. Get Accounts\Get-Accounts.ps1" -ForegroundColor Green
Write-Host "Prérequis:" -ForegroundColor Yellow
Write-Host "- Version CyberArk: PVWA v10.4 et supérieure"
Write-Host "- Permissions requises: Accès aux comptes via API"
Write-Host "- Options d'authentification:"
Write-Host "  * Non spécifiées dans le README mais doit requérir PVWAURL"
Write-Host "- Note: Permet de générer facilement des rapports ou d'énumérer des comptes"
Write-Host ""

Write-Host "Notes générales:" -ForegroundColor Magenta
Write-Host "1. La plupart des scripts nécessitent le module PSPAS PowerShell" -ForegroundColor Magenta
Write-Host "2. Tous les scripts requièrent des permissions appropriées dans CyberArk" -ForegroundColor Magenta
Write-Host "3. Pour l'authentification Identity (Privilege Cloud), les scripts nécessitent le module IdentityAuth.psm1" -ForegroundColor Magenta
Write-Host "4. Assurez-vous que le PVWA est accessible depuis le poste où les scripts sont exécutés" -ForegroundColor Magenta 