// Utilitaires pour l'application
import dateUtils from "./dateUtils";
import formatUtils from "./formatUtils";
import cacheManager from "./CacheManager";
import dataLoader from "./DataLoader";
import performanceMonitor, { measurePerformance } from "./PerformanceMonitor";

// Exporter l'ensemble des utilitaires
export {
  dateUtils,
  formatUtils,
  cacheManager,
  dataLoader,
  performanceMonitor,
  measurePerformance,
};

// Configuration de base des utilitaires
const initializeUtils = () => {
  // Initialiser le système de cache avec des paramètres par défaut
  // mais ne pas démarrer le monitoring jusqu'à ce que l'application soit chargée
  console.log("Initialisation des utilitaires...");

  // Configuration des processeurs de données communs
  dataLoader.registerProcessor(
    "safes",
    (data) => {
      // Traitement spécifique aux données de safes
      return data.map((safe) => ({
        ...safe,
        Size: safe.Size ? parseFloat(safe.Size) : 0,
        IsActive:
          typeof safe.IsActive === "string"
            ? safe.IsActive === "true"
            : !!safe.IsActive,
      }));
    },
    { cacheTTL: 600000 }
  ); // 10 minutes

  dataLoader.registerProcessor(
    "accounts",
    (data) => {
      // Traitement spécifique aux données de comptes
      return data.map((account) => ({
        ...account,
        LastUsed: account.LastUsed ? new Date(account.LastUsed) : null,
        CreationDate: account.CreationDate
          ? new Date(account.CreationDate)
          : null,
      }));
    },
    { cacheTTL: 900000 }
  ); // 15 minutes

  dataLoader.registerProcessor(
    "systemHealth",
    (data) => {
      // Traitement spécifique aux données de santé système
      return data.map((component) => ({
        ...component,
        Status: component.Status || "Unknown",
        LastChecked: component.LastChecked
          ? new Date(component.LastChecked)
          : new Date(),
      }));
    },
    { cacheTTL: 300000 }
  ); // 5 minutes
};

// Démarrer le monitoring de performance sur demande
const startPerformanceMonitoring = (options = {}) => {
  performanceMonitor.start(options);
  console.log("Monitoring de performance démarré");
};

// Démarrer la mise en cache stratégique
const enableCaching = (options = {}) => {
  const defaultOptions = {
    enablePrefetching: true,
    batchDelay: 50,
    defaultCacheTTL: 1800000,
  };

  dataLoader.configure({ ...defaultOptions, ...options });
  console.log("Mise en cache stratégique activée");
};

export default {
  initializeUtils,
  startPerformanceMonitoring,
  enableCaching,
};
