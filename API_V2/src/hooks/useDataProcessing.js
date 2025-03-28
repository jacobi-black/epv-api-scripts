/**
 * Hooks personnalisés pour le traitement des données
 * Implémente le point 7.6 du roadmap - Hooks personnalisés pour la logique métier
 */

import { useState, useEffect, useCallback } from "react";
import { useData } from "../utils/DataContext";
import { memoizedCalculation } from "../utils/dataOptimizer";

/**
 * Hook pour le filtrage avancé des données avec memoization
 * @param {Array} initialData - Données initiales à filtrer
 * @param {Object} initialFilters - Filtres initiaux
 * @returns {Object} Données filtrées et fonctions de gestion des filtres
 */
export const useFilteredData = (initialData = [], initialFilters = {}) => {
  const [data, setData] = useState(initialData);
  const [filters, setFilters] = useState(initialFilters);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Appliquer les filtres aux données
  const applyFilters = useCallback(() => {
    setLoading(true);

    // Utilisation de setTimeout pour éviter de bloquer l'UI
    setTimeout(() => {
      try {
        // Utilisation de memoizedCalculation pour éviter les recalculs inutiles
        const result = memoizedCalculation(
          "filteredData",
          () => {
            if (!data.length) return [];

            return data.filter((item) => {
              return Object.entries(filters).every(([key, filterValue]) => {
                if (!filterValue || filterValue === "") return true;

                // Filtre de type égalité simple
                if (typeof filterValue !== "object") {
                  if (typeof item[key] === "string") {
                    return item[key]
                      .toLowerCase()
                      .includes(String(filterValue).toLowerCase());
                  }
                  return item[key] === filterValue;
                }

                // Filtre avec opérateur
                const { value, operator = "eq" } = filterValue;

                if (value === undefined || value === null || value === "") {
                  return true;
                }

                switch (operator) {
                  case "eq":
                    return item[key] === value;
                  case "neq":
                    return item[key] !== value;
                  case "gt":
                    return Number(item[key]) > Number(value);
                  case "gte":
                    return Number(item[key]) >= Number(value);
                  case "lt":
                    return Number(item[key]) < Number(value);
                  case "lte":
                    return Number(item[key]) <= Number(value);
                  case "contains":
                    return String(item[key])
                      .toLowerCase()
                      .includes(String(value).toLowerCase());
                  case "startsWith":
                    return String(item[key])
                      .toLowerCase()
                      .startsWith(String(value).toLowerCase());
                  case "endsWith":
                    return String(item[key])
                      .toLowerCase()
                      .endsWith(String(value).toLowerCase());
                  default:
                    return true;
                }
              });
            });
          },
          [data, filters]
        );

        setFilteredData(result);
      } catch (error) {
        console.error("Erreur lors du filtrage des données:", error);
        setFilteredData([]);
      } finally {
        setLoading(false);
      }
    }, 0);
  }, [data, filters]);

  // Appliquer les filtres lorsque les données ou les filtres changent
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Mettre à jour un filtre spécifique
  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Supprimer un filtre spécifique
  const removeFilter = useCallback((key) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  // Réinitialiser tous les filtres
  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  // Mettre à jour les données
  const updateData = useCallback((newData) => {
    setData(newData);
  }, []);

  return {
    data,
    filteredData,
    filters,
    loading,
    updateData,
    updateFilter,
    removeFilter,
    resetFilters,
    applyFilters,
  };
};

/**
 * Hook pour la manipulation des métriques de données
 * @param {Array} data - Données pour les calculs de métriques
 * @param {Array} metricDefinitions - Définitions des métriques à calculer
 * @returns {Object} Métriques calculées et fonctions de manipulation
 */
export const useMetrics = (data = [], metricDefinitions = []) => {
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [trending, setTrending] = useState({});

  // Calculer toutes les métriques définies
  const calculateMetrics = useCallback(() => {
    if (!data.length || !metricDefinitions.length) {
      setMetrics({});
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const calculatedMetrics = {};

      metricDefinitions.forEach(
        ({ id, name, calculation, format, thresholds }) => {
          try {
            // Calcul de la métrique
            const value = calculation(data);

            // Vérification des seuils pour définir le statut
            let status = "normal";
            if (thresholds) {
              if (
                thresholds.danger !== undefined &&
                ((thresholds.inverse && value < thresholds.danger) ||
                  (!thresholds.inverse && value > thresholds.danger))
              ) {
                status = "danger";
              } else if (
                thresholds.warning !== undefined &&
                ((thresholds.inverse && value < thresholds.warning) ||
                  (!thresholds.inverse && value > thresholds.warning))
              ) {
                status = "warning";
              }
            }

            // Stockage de la métrique calculée
            calculatedMetrics[id] = {
              id,
              name,
              value,
              formattedValue: format ? format(value) : value,
              status,
              thresholds,
            };
          } catch (err) {
            console.error(
              `Erreur lors du calcul de la métrique "${name}":`,
              err
            );
            calculatedMetrics[id] = {
              id,
              name,
              value: null,
              formattedValue: "N/A",
              status: "error",
              error: err.message,
            };
          }
        }
      );

      setMetrics(calculatedMetrics);
    } catch (err) {
      console.error("Erreur lors du calcul des métriques:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [data, metricDefinitions]);

  // Calculer les tendances pour les métriques
  const calculateTrending = useCallback(
    (previousData = []) => {
      if (!data.length || !previousData.length || !metricDefinitions.length) {
        return;
      }

      try {
        const trendingValues = {};

        metricDefinitions.forEach(({ id, calculation }) => {
          try {
            const currentValue = calculation(data);
            const previousValue = calculation(previousData);

            // Calcul de la variation en pourcentage
            if (previousValue !== 0) {
              const percentChange =
                ((currentValue - previousValue) / Math.abs(previousValue)) *
                100;
              trendingValues[id] = {
                value: percentChange,
                direction:
                  percentChange > 0
                    ? "up"
                    : percentChange < 0
                    ? "down"
                    : "stable",
              };
            } else {
              trendingValues[id] = {
                value: currentValue > 0 ? 100 : 0,
                direction: currentValue > 0 ? "up" : "stable",
              };
            }
          } catch (err) {
            console.error(
              `Erreur lors du calcul de tendance pour la métrique "${id}":`,
              err
            );
            trendingValues[id] = {
              value: 0,
              direction: "stable",
              error: err.message,
            };
          }
        });

        setTrending(trendingValues);
      } catch (err) {
        console.error("Erreur lors du calcul des tendances:", err);
      }
    },
    [data, metricDefinitions]
  );

  // Calculer les métriques au chargement et quand les données changent
  useEffect(() => {
    calculateMetrics();
  }, [calculateMetrics]);

  return {
    metrics,
    trending,
    loading,
    error,
    calculateMetrics,
    calculateTrending,
  };
};

/**
 * Hook pour la gestion des données de tableau avec tri et pagination
 * @param {Array} data - Données du tableau
 * @returns {Object} État et fonctions pour la gestion du tableau
 */
export const useTableData = (data = []) => {
  const [tableData, setTableData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [pagination, setPagination] = useState({ page: 0, pageSize: 10 });
  const [totalRows, setTotalRows] = useState(0);

  // Appliquer le tri et la pagination aux données
  useEffect(() => {
    if (!data.length) {
      setTableData([]);
      setTotalRows(0);
      return;
    }

    let processedData = [...data];

    // Tri des données
    if (sortConfig.key) {
      processedData.sort((a, b) => {
        const valueA = a[sortConfig.key];
        const valueB = b[sortConfig.key];

        if (valueA === undefined || valueA === null)
          return sortConfig.direction === "asc" ? -1 : 1;
        if (valueB === undefined || valueB === null)
          return sortConfig.direction === "asc" ? 1 : -1;

        if (typeof valueA === "number" && typeof valueB === "number") {
          return sortConfig.direction === "asc"
            ? valueA - valueB
            : valueB - valueA;
        }

        const stringA = String(valueA).toLowerCase();
        const stringB = String(valueB).toLowerCase();

        return sortConfig.direction === "asc"
          ? stringA.localeCompare(stringB)
          : stringB.localeCompare(stringA);
      });
    }

    // Mise à jour du total
    setTotalRows(processedData.length);

    // Pagination
    const { page, pageSize } = pagination;
    const start = page * pageSize;
    const paginatedData = processedData.slice(start, start + pageSize);

    setTableData(paginatedData);
  }, [data, sortConfig, pagination]);

  // Gérer le tri
  const requestSort = useCallback((key) => {
    setSortConfig((prevSortConfig) => {
      if (prevSortConfig.key === key) {
        // Inverser la direction si on clique sur la même colonne
        return {
          key,
          direction: prevSortConfig.direction === "asc" ? "desc" : "asc",
        };
      }

      // Nouvelle colonne, tri ascendant par défaut
      return { key, direction: "asc" };
    });
  }, []);

  // Changer de page
  const handlePageChange = useCallback((newPage) => {
    setPagination((prev) => ({
      ...prev,
      page: newPage,
    }));
  }, []);

  // Modifier la taille de page
  const handlePageSizeChange = useCallback((newPageSize) => {
    setPagination({
      page: 0, // Retour à la première page lors du changement de taille
      pageSize: newPageSize,
    });
  }, []);

  return {
    tableData,
    sortConfig,
    pagination,
    totalRows,
    totalPages: Math.ceil(totalRows / pagination.pageSize),
    requestSort,
    handlePageChange,
    handlePageSizeChange,
  };
};

/**
 * Hook pour l'accès et le traitement avancé des données du contexte global
 * @param {string} dataType - Type de données à accéder ('accounts', 'safes', etc.)
 * @returns {Object} Données et fonctions de traitement
 */
export const useContextData = (dataType) => {
  const context = useData();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Déterminer quelles données et statistiques récupérer selon le type
  const getData = useCallback(() => {
    if (!context) {
      setError("Contexte de données non disponible");
      setLoading(false);
      return { data: [], stats: null };
    }

    setLoading(true);
    setError(null);

    try {
      let data = [];
      let stats = null;

      switch (dataType) {
        case "accounts":
          data = context.accountsData || [];
          stats = context.accountsStats;
          break;
        case "safes":
          data = context.safesData || [];
          stats = context.safesStats;
          break;
        case "safeMembers":
          data = context.safeMembersData || [];
          break;
        case "systemHealth":
          data = context.systemHealthData || [];
          stats = context.systemHealthStats;
          break;
        case "platforms":
          data = context.platformsData || [];
          break;
        default:
          setError(`Type de données non pris en charge: ${dataType}`);
      }

      setLoading(false);
      return { data, stats };
    } catch (err) {
      setError(`Erreur lors de la récupération des données: ${err.message}`);
      setLoading(false);
      return { data: [], stats: null };
    }
  }, [context, dataType]);

  // Récupérer les données et statistiques
  const { data, stats } = getData();

  // Vérifier si des données complémentaires sont disponibles
  const hasComplementaryData = useCallback(
    (complementaryType) => {
      if (!context) return false;

      switch (complementaryType) {
        case "platforms":
          return context.platformsData && context.platformsData.length > 0;
        case "safeMembers":
          return context.safeMembersData && context.safeMembersData.length > 0;
        case "components":
          return context.componentsData && context.componentsData.length > 0;
        case "cpm":
          return context.cpmData && context.cpmData.length > 0;
        default:
          return false;
      }
    },
    [context]
  );

  // Obtenir des données complémentaires
  const getComplementaryData = useCallback(
    (complementaryType) => {
      if (!context) return [];

      switch (complementaryType) {
        case "platforms":
          return context.platformsData || [];
        case "safeMembers":
          return context.safeMembersData || [];
        case "components":
          return context.componentsData || [];
        case "cpm":
          return context.cpmData || [];
        default:
          return [];
      }
    },
    [context]
  );

  return {
    data,
    stats,
    loading,
    error,
    hasComplementaryData,
    getComplementaryData,
    clearData: context?.clearAllData,
  };
};
