# Roadmap - CyberArk Capacity Planning Dashboard

## Phase 0 : Architecture et Fondation (Priorité Haute)

### 0.1 Structure de l'Application

- [ ] Configuration du projet React avec Vite
  - [ ] Mise en place des dépendances (MUI, React Router, Chart.js/Recharts)
  - [ ] Configuration ESLint et formateurs de code
  - [ ] Structure de répertoires claire et organisée
- [ ] Système de routage
  - [ ] Routes pour l'accueil et la sélection des dashboards
  - [ ] Routes pour les dashboards individuels et les sous-dashboards
  - [ ] Navigation fluide entre les niveaux

### 0.2 Système de Gestion des Données

- [ ] Contexte React pour le partage des données
  - [ ] Fonctions d'import des fichiers CSV
  - [ ] Parsers pour chaque type de fichier de script
  - [ ] Validation des formats de données
- [ ] Gestion des données en mémoire (sans persistance)
  - [ ] Structure de stockage temporaire en session
  - [ ] Nettoyage des données lors de la déconnexion

## Phase 1 : Page d'Accueil et Sélection des Dashboards (Priorité Haute)

### 1.1 Page d'Accueil

- [ ] Interface de sélection des dashboards
  - [ ] Cartes visuelles pour chaque type de dashboard (9 au total)
  - [ ] Icônes et descriptions claires
  - [ ] Indication des scripts nécessaires pour chaque dashboard
- [ ] Animations et transitions
  - [ ] Effets de survol interactifs
  - [ ] Transitions fluides entre les pages

### 1.2 Système d'Upload des Fichiers

- [ ] Interface d'upload pour chaque dashboard
  - [ ] Drag & drop intuitif
  - [ ] Vérification des types de fichiers
  - [ ] Feedback visuel d'importation réussie/échouée
- [ ] Prévisualisation des données
  - [ ] Aperçu des données importées
  - [ ] Validation avant intégration
  - [ ] Messages d'erreur clairs si problème de format

## Phase 2 : Dashboards Principaux (Priorité Haute)

### 2.1 Dashboard Capacité

- [ ] Vue d'ensemble avec KPIs principaux
  - [ ] Utilisation CPU, mémoire et disque des serveurs CyberArk
  - [ ] Nombre de sessions PSM simultanées et capacité maximale
  - [ ] Taux d'utilisation du stockage des coffres
  - [ ] Temps de réponse des composants
- [ ] Sous-dashboards thématiques
  - [ ] "Performance Système" - Métriques serveurs (basé sur System-Health.ps1)
  - [ ] "Stockage & Coffres" - Utilisation des coffres (basé sur Get-Safes.ps1)
  - [ ] "Capacité Sessions" - Analyse des sessions et capacité maximum

### 2.2 Dashboard Santé

- [ ] Vue d'ensemble avec KPIs principaux
  - [ ] Statut des services CyberArk (actifs/inactifs)
  - [ ] État de la réplication des composants
  - [ ] Connectivité entre composants
  - [ ] Temps de réponse des services critiques
  - [ ] État des certificats (validité)
- [ ] Sous-dashboards thématiques
  - [ ] "Statut Services" - États des services CyberArk
  - [ ] "Connectivité" - Liens entre composants et état de la communication
  - [ ] "Certificats" - Validité et expiration des certificats

### 2.3 Dashboard Sécurité et Conformité

- [ ] Vue d'ensemble avec KPIs principaux
  - [ ] Taux de conformité des comptes privilégiés aux politiques
  - [ ] Nombre de violations de politiques détectées
  - [ ] Comptes non conformes par catégorie
  - [ ] Nombre de tentatives d'accès refusées
  - [ ] Pourcentage de comptes non gérés ou mal configurés
- [ ] Sous-dashboards thématiques
  - [ ] "Conformité Comptes" - Analyse des comptes et conformité
  - [ ] "Violations" - Suivi des incidents de sécurité
  - [ ] "Risques" - Évaluation des risques et alertes

## Phase 3 : Dashboards Secondaires (Priorité Moyenne)

### 3.1 Dashboard d'Utilisation des Comptes Privilégiés

- [ ] Vue d'ensemble avec KPIs principaux
  - [ ] Nombre d'accès aux comptes privilégiés par période
  - [ ] Top 10 des comptes les plus utilisés
  - [ ] Répartition des accès par département/équipe
  - [ ] Ratio d'accès normaux vs exceptionnels
  - [ ] Durée moyenne d'utilisation des comptes
- [ ] Sous-dashboards thématiques
  - [ ] "Utilisation Générale" - Vue globale des accès
  - [ ] "Analyses Par Équipe" - Répartition par département
  - [ ] "Tendances d'Usage" - Évolution temporelle

### 3.2 Dashboard de Monitoring des Sessions

- [ ] Vue d'ensemble avec KPIs principaux
  - [ ] Nombre de sessions actives
  - [ ] Durée moyenne des sessions par type de compte
  - [ ] Nombre d'anomalies détectées
  - [ ] Heatmap géographique des connexions
  - [ ] Taux de sessions terminées anormalement
- [ ] Sous-dashboards thématiques
  - [ ] "Sessions Actives" - Monitoring des sessions en cours
  - [ ] "Analyse Comportementale" - Détection d'anomalies
  - [ ] "Géolocalisation" - Visualisation géographique des connexions

### 3.3 Dashboard de Rotation des Mots de Passe

- [ ] Vue d'ensemble avec KPIs principaux
  - [ ] Taux de réussite des rotations de mots de passe
  - [ ] Âge moyen des credentials par type de compte
  - [ ] Nombre de comptes avec rotation en échec
  - [ ] Taux d'utilisation des coffres
  - [ ] Statut des sauvegardes des coffres
- [ ] Sous-dashboards thématiques
  - [ ] "Performance des Rotations" - Suivi des opérations de rotation
  - [ ] "Comptes Problématiques" - Focus sur les échecs
  - [ ] "Coffres et Sauvegardes" - État des coffres et backups

## Phase 4 : Dashboards Avancés (Priorité Basse)

### 4.1 Dashboard d'Utilisation des Applications et API

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

- [ ] Thème cohérent pour tous les dashboards
  - [ ] Palette de couleurs harmonisée
  - [ ] Typographie optimisée pour la lisibilité
  - [ ] Icônes et symboles standardisés
- [ ] Composants UI réutilisables
  - [ ] Bibliothèque de cartes, graphiques et tableaux
  - [ ] Systèmes de filtres et contrôles interactifs
  - [ ] Modals et notifications standardisées

### 5.2 Expérience Utilisateur

- [ ] Navigation améliorée
  - [ ] Fil d'Ariane (breadcrumbs) pour la navigation
  - [ ] Menu latéral rétractable
  - [ ] Raccourcis clavier
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
