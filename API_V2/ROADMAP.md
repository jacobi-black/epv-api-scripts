# Roadmap - CyberArk Capacity Planning Dashboard

## Phase 0 : Architecture et Fondation (Priorité Haute)

### 0.1 Structure de l'Application

- [x] Configuration du projet React avec Vite
  - [x] Mise en place des dépendances (MUI, React Router, Chart.js/Recharts)
  - [x] Configuration ESLint et formateurs de code
  - [x] Structure de répertoires claire et organisée
- [x] Système de routage
  - [x] Routes pour l'accueil et la sélection des dashboards
  - [x] Routes pour les dashboards individuels et les sous-dashboards
  - [x] Navigation fluide entre les niveaux

### 0.2 Système de Gestion des Données

- [x] Contexte React pour le partage des données
  - [x] Fonctions d'import des fichiers CSV
  - [x] Parsers pour chaque type de fichier de script
  - [x] Validation des formats de données
- [x] Gestion des données en mémoire (sans persistance)
  - [x] Structure de stockage temporaire en session
  - [x] Nettoyage des données lors de la déconnexion

## Phase 1 : Page d'Accueil et Sélection des Dashboards (Priorité Haute)

### 1.1 Page d'Accueil

- [x] Interface de sélection des dashboards
  - [x] Cartes visuelles pour chaque type de dashboard (9 au total)
  - [x] Icônes et descriptions claires
  - [x] Indication des scripts nécessaires pour chaque dashboard
- [x] Animations et transitions
  - [x] Effets de survol interactifs
  - [x] Transitions fluides entre les pages

### 1.2 Système d'Upload des Fichiers

- [x] Interface d'upload pour chaque dashboard
  - [x] Drag & drop intuitif
  - [x] Vérification des types de fichiers
  - [x] Feedback visuel d'importation réussie/échouée
- [x] Prévisualisation des données
  - [x] Aperçu des données importées
  - [x] Validation avant intégration
  - [x] Messages d'erreur clairs si problème de format

## Phase 2 : Dashboards Principaux (Priorité Haute)

### 2.1 Dashboard Capacité

- [x] Préparation des composants de base
  - [x] Structure des composants avec placeholders
  - [x] Vérification de la disponibilité des données requises
  - [x] Feedback utilisateur pour données manquantes
- [x] Vue d'ensemble avec KPIs principaux
  - [x] Utilisation CPU, mémoire et disque des serveurs CyberArk
  - [x] Nombre de sessions PSM simultanées et capacité maximale
  - [x] Taux d'utilisation du stockage des coffres
  - [x] Temps de réponse des composants
- [x] Sous-dashboards thématiques
  - [x] "Performance Système" - Métriques serveurs (basé sur System-Health.ps1)
  - [x] "Stockage & Coffres" - Utilisation des coffres (basé sur Get-Safes.ps1)
  - [x] "Capacité Sessions" - Analyse des sessions et capacité maximum

### 2.2 Dashboard Santé

- [x] Préparation des composants de base
  - [x] Structure des composants avec placeholders
  - [x] Vérification de la disponibilité des données requises
  - [x] Feedback utilisateur pour données manquantes
- [x] Vue d'ensemble avec KPIs principaux
  - [x] Statut des services CyberArk (actifs/inactifs)
  - [x] État de la réplication des composants
  - [x] Connectivité entre composants
  - [x] Temps de réponse des services critiques
  - [x] État des certificats (validité)
- [x] Sous-dashboards thématiques
  - [x] "Statut Services" - États des services CyberArk
  - [x] "Connectivité" - Liens entre composants et état de la communication
  - [x] "Certificats" - Validité et expiration des certificats

### 2.3 Dashboard Sécurité et Conformité

- [x] Préparation des composants de base
  - [x] Structure des composants avec placeholders
  - [x] Vérification de la disponibilité des données requises
  - [x] Feedback utilisateur pour données manquantes
- [x] Vue d'ensemble avec KPIs principaux
  - [x] Taux de conformité des comptes privilégiés aux politiques
  - [x] Nombre de violations de politiques détectées
  - [x] Comptes non conformes par catégorie
  - [x] Nombre de tentatives d'accès refusées
  - [x] Pourcentage de comptes non gérés ou mal configurés
- [x] Sous-dashboards thématiques
  - [x] "Conformité Comptes" - Analyse des comptes et conformité
  - [x] "Violations" - Suivi des incidents de sécurité
  - [x] "Risques" - Évaluation des risques et alertes

### 2.4 Dashboard d'Inventaire et Analyse des Comptes

- [x] Préparation des composants de base
  - [x] Structure des composants avec placeholders
  - [x] Vérification de la disponibilité des données requises
  - [x] Feedback utilisateur pour données manquantes
- [x] Vue d'ensemble avec KPIs principaux
  - [x] Distribution des comptes par type
  - [x] Âge des comptes et conformité
  - [x] Comptes critiques et leur statut
- [x] Sous-dashboards thématiques
  - [x] "Inventaire des Comptes" - Vue détaillée du parc de comptes
  - [x] "Analyses & Tendances" - Distribution et évolution
  - [x] "Comptes à Risque" - Identification des comptes sensibles

## Phase 3 : Dashboards Secondaires (Priorité Moyenne)

### 3.1 Dashboard d'Utilisation des Comptes Privilégiés

- [x] Préparation des composants de base
  - [x] Structure des composants avec placeholders
  - [x] Vérification de la disponibilité des données requises
  - [x] Feedback utilisateur pour données manquantes
- [x] Vue d'ensemble avec KPIs principaux
  - [x] Nombre d'accès aux comptes privilégiés par période
  - [x] Top 10 des comptes les plus utilisés
  - [x] Répartition des accès par département/équipe
  - [x] Ratio d'accès normaux vs exceptionnels
  - [x] Durée moyenne d'utilisation des comptes
- [x] Sous-dashboards thématiques
  - [x] "Utilisation Générale" - Vue globale des accès
  - [x] "Analyses Par Équipe" - Répartition par département
  - [x] "Tendances d'Usage" - Évolution temporelle

### 3.2 Dashboard de Monitoring des Sessions

- [x] Préparation des composants de base
  - [x] Structure des composants avec placeholders
  - [x] Vérification de la disponibilité des données requises
  - [x] Feedback utilisateur pour données manquantes
- [x] Vue d'ensemble avec KPIs principaux
  - [x] Nombre de sessions actives
  - [x] Durée moyenne des sessions par type de compte
  - [x] Nombre d'anomalies détectées
  - [x] Heatmap géographique des connexions
  - [x] Taux de sessions terminées anormalement
- [x] Sous-dashboards thématiques
  - [x] "Sessions Actives" - Monitoring des sessions en cours
  - [x] "Analyse Comportementale" - Détection d'anomalies
  - [x] "Géolocalisation" - Visualisation géographique des connexions

### 3.3 Dashboard de Rotation des Mots de Passe

- [x] Préparation des composants de base
  - [x] Structure des composants avec placeholders
  - [x] Vérification de la disponibilité des données requises
  - [x] Feedback utilisateur pour données manquantes
- [x] Vue d'ensemble avec KPIs principaux
  - [x] Taux de réussite des rotations de mots de passe
  - [x] Âge moyen des credentials par type de compte
  - [x] Nombre de comptes avec rotation en échec
  - [x] Taux d'utilisation des coffres
  - [x] Statut des sauvegardes des coffres
- [x] Sous-dashboards thématiques
  - [x] "Performance des Rotations" - Suivi des opérations de rotation
  - [x] "Comptes Problématiques" - Focus sur les échecs
  - [x] "Coffres et Sauvegardes" - État des coffres et backups

## Phase 4 : Dashboards Avancés (Priorité Basse)

### 4.1 Dashboard d'Utilisation des Applications et API

- [x] Préparation des composants de base
  - [x] Structure des composants avec placeholders
  - [x] Vérification de la disponibilité des données requises
  - [x] Feedback utilisateur pour données manquantes
- [ ] Vue d'ensemble avec KPIs principaux
  - [ ] Nombre d'applications intégrées à CyberArk
  - [ ] Volume d'appels API par application
  - [ ] Taux d'erreur des appels API
  - [ ] Temps de réponse moyen des API
  - [ ] Nombre de nouvelles applications intégrées
- [ ] Sous-dashboards thématiques
  - [ ] "Applications Intégrées" - Vue des applications
  - [ ] "Performances API" - Métriques des appels API
  - [ ] "Tendances d'Utilisation" - Évolution de l'usage

### 4.2 Dashboard de Réponse aux Incidents

- [x] Préparation des composants de base
  - [x] Structure des composants avec placeholders
  - [x] Vérification de la disponibilité des données requises
  - [x] Feedback utilisateur pour données manquantes
- [ ] Vue d'ensemble avec KPIs principaux
  - [ ] Nombre d'incidents de sécurité par type
  - [ ] Temps moyen de résolution des incidents
  - [ ] Répartition des alertes par niveau de criticité
  - [ ] Nombre d'accès d'urgence utilisés
  - [ ] Tendances des incidents sur la durée
- [ ] Sous-dashboards thématiques
  - [ ] "Incidents Actifs" - Suivi des incidents en cours
  - [ ] "Résolution et MTTR" - Temps de résolution
  - [ ] "Analyse des Tendances" - Évolution temporelle

### 4.3 Dashboard d'Efficacité et d'Adoption

- [x] Préparation des composants de base
  - [x] Structure des composants avec placeholders
  - [x] Vérification de la disponibilité des données requises
  - [x] Feedback utilisateur pour données manquantes
- [ ] Vue d'ensemble avec KPIs principaux
  - [ ] Taux d'adoption par équipe/département
  - [ ] Évolution du nombre d'utilisateurs actifs
  - [ ] Temps moyen pour obtenir un accès privilégié
  - [ ] Nombres de workflows automatisés
  - [ ] Indice de satisfaction utilisateur
- [ ] Sous-dashboards thématiques
  - [ ] "Adoption par Département" - Répartition de l'usage
  - [ ] "Efficacité Opérationnelle" - Gains de temps et automatisation
  - [ ] "Satisfaction Utilisateurs" - Métriques de satisfaction

## Phase 5 : UI/UX et Finalisation (Priorité Moyenne)

### 5.1 Design System Complet

- [x] Thème cohérent pour tous les dashboards
  - [x] Palette de couleurs harmonisée
  - [x] Typographie optimisée pour la lisibilité
  - [x] Icônes et symboles standardisés
- [x] Composants UI réutilisables
  - [x] Bibliothèque de cartes, graphiques et tableaux
  - [x] Systèmes de filtres et contrôles interactifs
  - [x] Modals et notifications standardisées

### 5.2 Expérience Utilisateur

- [x] Navigation améliorée
  - [x] Fil d'Ariane (breadcrumbs) pour la navigation
  - [x] Menu latéral rétractable
  - [x] Raccourcis clavier
- [x] Messages de feedback utilisateur
  - [x] Alertes pour données manquantes
  - [x] Indicateurs de chargement
  - [x] Notifications d'erreurs explicites
- [ ] Aide et onboarding
  - [ ] Tooltips contextuels
  - [ ] Guides d'utilisation intégrés
  - [ ] Tutoriels interactifs pour les nouveaux utilisateurs

## Phase 6 : Documentation et Support

### 6.1 Documentation Technique

- [ ] Documentation du code et de l'architecture
  - [ ] Structure des composants
  - [ ] Flux de données
  - [ ] Guide d'extension pour nouveaux dashboards
- [ ] Guide d'installation et de déploiement
  - [ ] Prérequis système
  - [ ] Étapes d'installation
  - [ ] Configuration et personnalisation

### 6.2 Documentation Utilisateur

- [ ] Manuels utilisateurs
  - [ ] Guide par dashboard
  - [ ] Instructions d'utilisation des scripts PowerShell
  - [ ] FAQ et résolution de problèmes
- [ ] Vidéos et tutoriels
  - [ ] Démos des fonctionnalités principales
  - [ ] Guides pas-à-pas pour les tâches courantes

## Remarques Importantes pour le Développement

1. **Traitement des données**:

   - Aucune persistance entre les sessions
   - Données stockées uniquement en mémoire
   - Respect strict de la confidentialité des données

2. **Architecture**:

   - Structure modulaire pour faciliter l'extension
   - Composants réutilisables et bien documentés
   - Séparation claire entre UI, logique métier et traitement des données

3. **Performance**:
   - Optimisation pour les grands volumes de données
   - Pagination et virtualisation des listes longues
   - Chargement asynchrone des composants lourds
