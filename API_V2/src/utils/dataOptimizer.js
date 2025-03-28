/**
 * Utilitaires d'optimisation des performances pour le traitement et l'affichage des données
 * Ces fonctions permettent d'améliorer les temps de chargement et de rendu des dashboards
 */

// Cache pour stocker les résultats calculés
let calculationsCache = {};

/**
 * Réinitialise le cache lors de la déconnexion ou du changement complet de données
 */
export const clearCalculationsCache = () => {
  calculationsCache = {};
};

/**
 * Effectue un calcul avec mise en cache du résultat pour éviter les recalculs inutiles
 * @param {string} key - Clé unique pour identifier le calcul
 * @param {Function} calculationFn - Fonction effectuant le calcul
 * @param {Array} dependencies - Tableau de dépendances pour invalider le cache
 * @returns {any} Résultat du calcul, depuis le cache si disponible
 */
export const memoizedCalculation = (key, calculationFn, dependencies = []) => {
  // Création d'une clé de cache basée sur le nom du calcul et le hash des dépendances
  const dependenciesHash = JSON.stringify(dependencies);
  const cacheKey = `${key}_${dependenciesHash}`;

  // Si le résultat est déjà en cache et que les dépendances n'ont pas changé, on le retourne
  if (calculationsCache[cacheKey]) {
    return calculationsCache[cacheKey];
  }

  // Sinon, on effectue le calcul et on le stocke en cache
  const result = calculationFn();
  calculationsCache[cacheKey] = result;
  return result;
};

/**
 * Optimise un jeu de données volumineux pour l'affichage
 * @param {Array} data - Données brutes à optimiser
 * @param {Object} options - Options d'optimisation
 * @returns {Array} Données optimisées pour l'affichage
 */
export const optimizeDataForDisplay = (data, options = {}) => {
  if (!data || !data.length) return [];

  const {
    maxItems = 1000, // Nombre maximum d'éléments à retourner
    aggregationKey = null, // Clé pour l'agrégation des données
    sortBy = null, // Clé pour le tri
    sortDirection = "desc", // Direction du tri ('asc' ou 'desc')
  } = options;

  // Copie des données pour éviter de modifier les originales
  let optimizedData = [...data];

  // Si le nombre d'éléments dépasse le maximum, on effectue une optimisation
  if (data.length > maxItems) {
    // Si une clé d'agrégation est spécifiée, on agrège les données
    if (aggregationKey) {
      const aggregatedData = data.reduce((acc, item) => {
        const key = item[aggregationKey] || "Unknown";
        if (!acc[key]) {
          acc[key] = { count: 0, items: [] };
        }
        acc[key].count += 1;
        acc[key].items.push(item);
        return acc;
      }, {});

      // Conversion en tableau pour le tri et l'affichage
      optimizedData = Object.entries(aggregatedData).map(([key, value]) => ({
        [aggregationKey]: key,
        count: value.count,
        // On garde quelques éléments représentatifs
        examples: value.items.slice(0, 3),
      }));
    } else {
      // Sans agrégation, on échantillonne les données
      optimizedData = optimizedData.filter((_, index) => {
        // Algorithme simplifié pour garder un échantillon représentatif
        return index % Math.ceil(data.length / maxItems) === 0;
      });
    }
  }

  // Si une clé de tri est spécifiée, on trie les données
  if (sortBy) {
    optimizedData.sort((a, b) => {
      const valueA = a[sortBy];
      const valueB = b[sortBy];

      if (typeof valueA === "number" && typeof valueB === "number") {
        return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
      }

      const stringA = String(valueA || "");
      const stringB = String(valueB || "");
      return sortDirection === "asc"
        ? stringA.localeCompare(stringB)
        : stringB.localeCompare(stringA);
    });
  }

  return optimizedData;
};

/**
 * Optimise les données pour les graphiques en réduisant la quantité de points
 * @param {Array} data - Données brutes pour le graphique
 * @param {number} maxPoints - Nombre maximum de points à afficher
 * @param {string} xKey - Clé pour l'axe X
 * @param {string} yKey - Clé pour l'axe Y
 * @returns {Array} Données optimisées pour le graphique
 */
export const optimizeChartData = (data, maxPoints = 100, xKey, yKey) => {
  if (!data || !data.length || data.length <= maxPoints) return data;

  // Calcul du pas d'échantillonnage
  const step = Math.ceil(data.length / maxPoints);

  // Échantillonnage des données
  const optimized = data.filter((_, index) => index % step === 0);

  // S'assurer qu'on inclut le dernier point pour une visualisation correcte
  if (optimized[optimized.length - 1] !== data[data.length - 1]) {
    optimized.push(data[data.length - 1]);
  }

  return optimized;
};

/**
 * Crée un worker pour effectuer des calculs intensifs en arrière-plan
 * @param {Function} processingFn - Fonction de traitement à exécuter
 * @returns {Promise} Promise résolue avec le résultat du traitement
 */
export const processDataInBackground = (processingFn, data) => {
  return new Promise((resolve, reject) => {
    try {
      // Pour éviter de bloquer l'UI, on utilise setTimeout
      setTimeout(() => {
        const result = processingFn(data);
        resolve(result);
      }, 0);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Hook personnalisé React pour l'optimisation des données
 * @param {Array} data - Données brutes
 * @param {Object} options - Options d'optimisation
 * @returns {Array} Données optimisées
 */
export const useOptimizedData = (data, options = {}) => {
  // Cette fonction est conçue pour être utilisée dans un hook React personnalisé
  // L'implémentation complète dépendrait du framework utilisé (React, Vue, etc.)
  return memoizedCalculation(
    "optimizedData",
    () => optimizeDataForDisplay(data, options),
    [data, JSON.stringify(options)]
  );
};
