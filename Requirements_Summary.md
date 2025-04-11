# Résumé des Prérequis par Script CSV

Ce document fournit un résumé des prérequis pour chaque script générant des fichiers CSV dans CyberArk API Explorer.

## Tableau des prérequis

| Script                                               | Version min. CyberArk                         | Modules requis | Permissions                     | Authentification supportée         | Notes spéciales                                               |
| ---------------------------------------------------- | --------------------------------------------- | -------------- | ------------------------------- | ---------------------------------- | ------------------------------------------------------------- |
| Reports\Accounts\Get-AccountReport.ps1               | Toutes versions                               | PSPAS          | Accès aux comptes               | LogonToken, Identity, PVWA direct  | Installation auto de PSPAS si absent                          |
| Reports\Safes\Get-SafeMemberReport.ps1               | Toutes versions                               | PSPAS          | Accès aux safes                 | LogonToken, Identity, PVWA direct  | Installation auto de PSPAS si absent                          |
| Discovered Accounts\Get-DiscoveredAccountsReport.ps1 | PVWA v11.6+                                   | -              | Accès aux comptes découverts    | LogonToken, CyberArk, LDAP, RADIUS | Utilise l'API REST                                            |
| User Management\Get-InactiveUsersReport.ps1          | PVWA v10.9+ (v11.1+ pour filtrage inactivité) | -              | Audit Users                     | CyberArk, LDAP, RADIUS             | Utilise l'API REST 2ème génération                            |
| Platforms\Get-PlatformReport.ps1                     | PVWA v11.6+                                   | -              | Accès aux plateformes           | AuthType                           | Rapport sur plateformes et composants de connexion            |
| Security Events\Get-AccoutnsRiskReport.ps1           | PVWA v10.4+                                   | -              | Accès au module Security Events | CyberArk, LDAP, RADIUS             | Nécessite PTA installé                                        |
| PSM Sessions Management\PSM-SessionsManagement.ps1   | PVWA v10.5+                                   | -              | Accès aux sessions PSM          | CyberArk, LDAP, RADIUS             | Liste/termine sessions PSM                                    |
| AAM Applications\Export-Import-Applications.ps1      | PVWA v9.10+                                   | -              | Accès aux applications          | AuthType                           | Export/import des applications et méthodes d'authentification |
| Optimize Address\Optimize-Addresses.ps1              | Non spécifié                                  | -              | Accès aux comptes               | LogonToken, Identity, PVWA direct  | Vérifie les adresses contre DNS                               |
| Get Accounts\Get-Accounts.ps1                        | PVWA v10.4+                                   | -              | Accès aux comptes               | PVWAURL requis                     | Rapport et énumération des comptes                            |

## Remarques générales

1. **Module PSPAS**: La plupart des scripts utilisent ou nécessitent le module PowerShell PSPAS
2. **Permissions**: Tous les scripts requièrent des permissions appropriées dans CyberArk
3. **Authentification Identity**: Pour l'authentification avec Privilege Cloud, les scripts nécessitent le module IdentityAuth.psm1
4. **Compatibilité des scripts**: Certains scripts ne fonctionnent qu'à partir d'une version spécifique de PVWA
5. **Connectivité**: Assurez-vous que le PVWA est accessible depuis le poste où les scripts sont exécutés

## Options d'authentification

### LogonToken

- Permet de réutiliser un jeton d'authentification préétabli

### Identity (Privilege Cloud)

- IdentityUserName: Nom d'utilisateur pour se connecter à PCloud ISPSS
- IdentityURL/IdentityTenantURL: URL du portail Identity
- PCloudSubDomain: Sous-domaine PCloud assigné

### PVWA Direct

- PVWAAddress: URL du PVWA
- PVWACredentials: Informations d'identification stockées dans un objet PSCredential
- PVWAAuthType: Type d'authentification (CyberArk, LDAP, RADIUS)
