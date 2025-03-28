# Fichiers de données de démonstration pour CyberArk Capacity Planning Dashboard

Ce répertoire contient des fichiers CSV de démonstration qui simulent les données que produiraient les différents scripts PowerShell de collecte CyberArk.

## Utilisation

Ces fichiers peuvent être importés dans l'application pour tester les différentes fonctionnalités et dashboards sans avoir besoin d'exécuter les scripts PowerShell sur un environnement CyberArk réel.

Pour les utiliser :

1. Accédez à la page d'upload de fichiers dans l'application
2. Sélectionnez le type de données à importer
3. Téléchargez le fichier CSV correspondant depuis ce répertoire

## Fichiers disponibles

- `accounts.csv` - Données sur les comptes privilégiés
- `capacity.csv` - Données de capacité des serveurs et composants
- `certificates.csv` - Informations sur les certificats SSL
- `compliance.csv` - Données de conformité aux différentes politiques
- `platforms.csv` - Informations sur les plateformes
- `risk.csv` - Données d'analyse des risques
- `safes.csv` - Informations sur les coffres et leur contenu
- `sessions.csv` - Données des sessions utilisateurs
- `system-health.csv` - État de santé des différents composants
- `users.csv` - Informations sur les utilisateurs

## Format des données

Les données ont été générées pour ressembler le plus possible aux sorties réelles des scripts PowerShell CyberArk. Les attributs et la structure des fichiers sont similaires à ce que vous obtiendriez en exécutant les scripts sur un environnement de production.

## Remarque importante

Ces données sont fictives et ne représentent pas un environnement réel. Elles sont conçues uniquement à des fins de démonstration et de test.

## Suppression des données

Pour effacer toutes les données de démonstration chargées :

1. Accédez à la page d'accueil
2. Cliquez sur le bouton "Effacer toutes les données" dans le menu utilisateur

Ou alternativement, vous pouvez actualiser l'application qui ne conserve pas les données entre les sessions.
