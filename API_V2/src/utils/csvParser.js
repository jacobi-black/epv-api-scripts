import { getCache, setCache } from "./cache";

/**
 * Parse a CSV file and return the data
 * @param {String|File} csvData - The CSV data or file to parse
 * @returns {Array} - The parsed data
 */
export const parseCSV = (csvData) => {
  try {
    // Si csvData est déjà une chaîne, on l'utilise directement
    // Sinon, on suppose que c'est le résultat de FileReader.readAsText
    const text = typeof csvData === "string" ? csvData : null;

    if (!text) {
      throw new Error("Format de données invalide");
    }

    const lines = text.split("\n");

    if (lines.length < 2) {
      throw new Error("Le fichier CSV est vide ou mal formaté");
    }

    // Parser les en-têtes
    const headers = lines[0].split(",").map((h) => h.trim());

    // Parser les données en une seule passe
    const data = lines
      .slice(1)
      .filter((line) => line.trim()) // Ignorer les lignes vides
      .map((line) => {
        const values = line.split(",").map((v) => v.trim());
        return headers.reduce((obj, header, index) => {
          obj[header] = values[index];
          return obj;
        }, {});
      });

    return data;
  } catch (error) {
    console.error("Erreur lors du parsing du CSV:", error);
    throw error;
  }
};

/**
 * Identify the type of data in the CSV file based on headers or content
 * @param {Array} data - The parsed CSV data
 * @returns {String} - The type of data (accounts, safes, systemHealth)
 */
export const identifyDataType = (data) => {
  if (!data || data.length === 0) {
    return "unknown";
  }

  const headers = Object.keys(data[0]);

  // Check for account data
  if (
    headers.includes("AccountID") ||
    headers.includes("Username") ||
    headers.includes("Safe") ||
    headers.includes("Platform")
  ) {
    return "accounts";
  }

  // Check for safe data
  if (
    headers.includes("SafeName") ||
    headers.includes("MemberName") ||
    headers.includes("Permissions")
  ) {
    return "safes";
  }

  // Check for system health data
  if (
    headers.includes("ComponentID") ||
    headers.includes("Status") ||
    headers.includes("Version")
  ) {
    return "systemHealth";
  }

  return "unknown";
};

/**
 * Store the parsed data in session storage for persistence
 * @param {String} type - The type of data (accounts, safes, systemHealth)
 * @param {Array} data - The parsed data
 */
export const storeData = (type, data) => {
  sessionStorage.setItem(type, JSON.stringify(data));
};

/**
 * Retrieve the stored data from session storage
 * @param {String} type - The type of data to retrieve
 * @returns {Array|null} - The retrieved data or null if not found
 */
export const retrieveData = (type) => {
  const data = sessionStorage.getItem(type);
  return data ? JSON.parse(data) : null;
};

/**
 * Clear all stored data from session storage
 */
export const clearAllData = () => {
  sessionStorage.clear();
};

/**
 * Get statistics from account data
 * @param {Array} data - The account data
 * @returns {Object} - Statistics about the accounts
 */
export const getAccountStats = (data) => {
  if (!data || data.length === 0) {
    return {};
  }

  // Count by platform
  const platformCounts = data.reduce((acc, account) => {
    const platform = account.Platform || account.PlatformID || "Unknown";
    acc[platform] = (acc[platform] || 0) + 1;
    return acc;
  }, {});

  // Count by safe
  const safeCounts = data.reduce((acc, account) => {
    const safe = account.Safe || account.SafeName || "Unknown";
    acc[safe] = (acc[safe] || 0) + 1;
    return acc;
  }, {});

  // Count managed vs unmanaged accounts
  const managedCount = data.filter(
    (account) =>
      account.CPMStatus === "success" ||
      account.CPMStatus === "Success" ||
      account.AutomaticManagement === "True" ||
      account.AutomaticManagement === "true" ||
      account.AutomaticManagement === true
  ).length;

  return {
    total: data.length,
    byPlatform: platformCounts,
    bySafe: safeCounts,
    managed: managedCount,
    unmanaged: data.length - managedCount,
  };
};

/**
 * Get statistics from safe data
 * @param {Array} data - The safe data
 * @returns {Object} - Statistics about the safes
 */
export const getSafeStats = (data) => {
  if (!data || data.length === 0) {
    return {};
  }

  // Count unique safes
  const uniqueSafes = [
    ...new Set(data.map((item) => item.SafeName || item.Safe)),
  ];

  // Count members per safe
  const membersBySafe = data.reduce((acc, item) => {
    const safe = item.SafeName || item.Safe;
    if (!acc[safe]) {
      acc[safe] = new Set();
    }
    acc[safe].add(item.MemberName || item.Member);
    return acc;
  }, {});

  // Convert to counts
  const memberCounts = Object.keys(membersBySafe).reduce((acc, safe) => {
    acc[safe] = membersBySafe[safe].size;
    return acc;
  }, {});

  return {
    total: uniqueSafes.length,
    membersBySafe: memberCounts,
  };
};

/**
 * Get statistics from system health data
 * @param {Array} data - The system health data
 * @returns {Object} - Statistics about system health
 */
export const getSystemHealthStats = (data) => {
  if (!data || data.length === 0) {
    return {};
  }

  // Count by status
  const statusCounts = data.reduce((acc, component) => {
    const status = component.Status || "Unknown";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  // Count by component type
  const componentTypeCounts = data.reduce((acc, component) => {
    const type = component.ComponentType || component.Type || "Unknown";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  return {
    total: data.length,
    byStatus: statusCounts,
    byComponentType: componentTypeCounts,
  };
};

// Cache des données parsées
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fonction pour obtenir des statistiques rapides
export const getStats = (data) => {
  if (!data || data.length === 0) return null;

  const stats = {
    total: data.length,
    byPlatform: {},
    bySafe: {},
    byStatus: {},
  };

  // Calculer les statistiques en une seule passe
  data.forEach((item) => {
    // Compter par plateforme
    if (item.Platform) {
      stats.byPlatform[item.Platform] =
        (stats.byPlatform[item.Platform] || 0) + 1;
    }

    // Compter par coffre
    if (item.Safe) {
      stats.bySafe[item.Safe] = (stats.bySafe[item.Safe] || 0) + 1;
    }

    // Compter par statut
    if (item.CPMStatus) {
      stats.byStatus[item.CPMStatus] =
        (stats.byStatus[item.CPMStatus] || 0) + 1;
    }
  });

  return stats;
};

// Fonction pour nettoyer le cache
export const clearCSVCache = () => {
  clearCache();
};
