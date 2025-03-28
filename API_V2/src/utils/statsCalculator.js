/**
 * Utilitaires pour calculer les statistiques à partir des données chargées
 * Ces fonctions sont utilisées pour transformer les données brutes en métriques exploitables
 */

/**
 * Calcule les statistiques pour les données de comptes
 * @param {Array} accountsData - Les données brutes de comptes
 * @returns {Object} Statistiques calculées
 */
export const getAccountsStats = (accountsData) => {
  if (!accountsData || !accountsData.length) {
    return {
      accountTypes: [],
      platforms: [],
      safes: [],
    };
  }

  // Agrégation par type de compte
  const typesMap = accountsData.reduce((acc, account) => {
    const type = account.accountType || "Unknown";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  // Agrégation par plateforme
  const platformsMap = accountsData.reduce((acc, account) => {
    const platform = account.platform || "Unknown";
    acc[platform] = (acc[platform] || 0) + 1;
    return acc;
  }, {});

  // Agrégation par coffre-fort
  const safesMap = accountsData.reduce((acc, account) => {
    const safe = account.safeName || "Unknown";
    acc[safe] = (acc[safe] || 0) + 1;
    return acc;
  }, {});

  // Conversion des maps en tableaux pour les graphiques
  const accountTypes = Object.entries(typesMap).map(([type, count]) => ({
    type,
    count,
  }));

  const platforms = Object.entries(platformsMap).map(([platform, count]) => ({
    platform,
    count,
  }));

  const safes = Object.entries(safesMap)
    .map(([safe, count]) => ({
      safe,
      count,
    }))
    .sort((a, b) => b.count - a.count); // Tri par nombre de comptes, décroissant

  return {
    accountTypes,
    platforms,
    safes,
  };
};

/**
 * Calcule les statistiques pour les données de coffres-forts
 * @param {Array} safesData - Les données brutes des coffres-forts
 * @param {Array} safeMembersData - Les données des membres des coffres-forts (optionnel)
 * @returns {Object} Statistiques calculées
 */
export const getSafesStats = (safesData, safeMembersData = []) => {
  if (!safesData || !safesData.length) {
    return {
      safeTypes: [],
      locations: [],
      access: [],
    };
  }

  // Agrégation par type de coffre
  const typesMap = safesData.reduce((acc, safe) => {
    const type = safe.type || "Standard";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  // Agrégation par emplacement
  const locationsMap = safesData.reduce((acc, safe) => {
    const location = safe.location || "Default";
    acc[location] = (acc[location] || 0) + 1;
    return acc;
  }, {});

  // Conversion des maps en tableaux pour les graphiques
  const safeTypes = Object.entries(typesMap).map(([type, count]) => ({
    type,
    count,
  }));

  const locations = Object.entries(locationsMap).map(([location, count]) => ({
    location,
    count,
  }));

  // Statistiques d'accès si des données de membres sont disponibles
  let access = [];
  if (safeMembersData && safeMembersData.length) {
    const accessMap = safeMembersData.reduce((acc, member) => {
      const accessType = member.role || "Member";
      acc[accessType] = (acc[accessType] || 0) + 1;
      return acc;
    }, {});

    access = Object.entries(accessMap).map(([access, count]) => ({
      access,
      count,
    }));
  }

  return {
    safeTypes,
    locations,
    access,
  };
};

/**
 * Calcule les statistiques pour les données de santé du système
 * @param {Array} systemHealthData - Les données brutes de santé système
 * @param {Array} componentsData - Les données des composants du système (optionnel)
 * @returns {Object} Statistiques calculées
 */
export const getSystemHealthStats = (systemHealthData, componentsData = []) => {
  if (!systemHealthData || !systemHealthData.length) {
    return {
      cpuAvg: 0,
      memoryAvg: 0,
      diskAvg: 0,
      components: {},
    };
  }

  // Calcul de moyennes pour les métriques principales
  const cpuAvg =
    systemHealthData.reduce((sum, item) => sum + (item.cpuUsage || 0), 0) /
    systemHealthData.length;
  const memoryAvg =
    systemHealthData.reduce((sum, item) => sum + (item.memoryUsage || 0), 0) /
    systemHealthData.length;
  const diskAvg =
    systemHealthData.reduce((sum, item) => sum + (item.diskUsage || 0), 0) /
    systemHealthData.length;

  // Statistiques des composants si disponibles
  let componentsStats = {};
  if (componentsData && componentsData.length) {
    const statusCounts = componentsData.reduce((acc, comp) => {
      const status = comp.status || "Unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    componentsStats = {
      statusCounts,
      total: componentsData.length,
      healthy: statusCounts["Healthy"] || 0,
      warning: statusCounts["Warning"] || 0,
      critical: statusCounts["Critical"] || 0,
    };
  }

  // Série temporelle pour les graphiques d'historique
  const timeSeriesData = systemHealthData.map((item) => ({
    timestamp: item.timestamp || new Date().toISOString(),
    cpu: item.cpuUsage || 0,
    memory: item.memoryUsage || 0,
    disk: item.diskUsage || 0,
  }));

  return {
    cpuAvg,
    memoryAvg,
    diskAvg,
    components: componentsStats,
    timeSeriesData,
  };
};
