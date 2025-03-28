import { useState, useEffect, useCallback, useRef } from "react";
import { dataLoader, performanceMonitor } from "../utils";

/**
 * Hook customisé pour le chargement optimisé des données
 * Utilise le système de cache et DataLoader pour améliorer les performances
 *
 * @param {Function} fetchFunction - Fonction asynchrone pour récupérer les données
 * @param {Object} options - Options de configuration
 * @param {string} options.key - Clé unique pour cette requête (pour mise en cache)
 * @param {string} options.dataType - Type de données pour le traitement
 * @param {boolean} options.skipCache - Ne pas utiliser le cache
 * @param {boolean} options.forceReload - Forcer le rechargement des données
 * @param {Array} options.dependencies - Dépendances pour déclencher un rechargement
 * @param {Function} options.onSuccess - Callback appelé en cas de succès
 * @param {Function} options.onError - Callback appelé en cas d'erreur
 * @param {Object} options.loadOptions - Options supplémentaires pour DataLoader
 * @returns {Object} - État du chargement de données
 */
function useDataFetching(fetchFunction, options = {}) {
  const {
    key = null,
    dataType = "default",
    skipCache = false,
    forceReload = false,
    dependencies = [],
    onSuccess = null,
    onError = null,
    loadOptions = {},
    enableBackgroundRefresh = false,
    refreshInterval = 0,
    maxRetries = 3,
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Références pour éviter les problèmes avec l'asynchrone dans useEffect
  const isMounted = useRef(true);
  const intervalRef = useRef(null);
  const uniqueKey = useRef(
    key || `fetch_${Math.random().toString(36).substring(2)}`
  );

  // Stocker les callbacks pour y accéder dans les fonctions asynchrones
  const callbacksRef = useRef({ onSuccess, onError });
  callbacksRef.current = { onSuccess, onError };

  const fetchData = useCallback(
    async (isRefresh = false) => {
      // Si c'est un rafraîchissement en arrière-plan, ne pas modifier l'état de chargement
      if (!isRefresh) {
        setLoading(true);
      }

      if (retryCount >= maxRetries) {
        if (isMounted.current && !isRefresh) {
          setError(
            new Error(
              `Le nombre maximum de tentatives (${maxRetries}) a été atteint.`
            )
          );
          setLoading(false);
        }
        return;
      }

      const loadStart = performance.now ? performance.now() : Date.now();

      try {
        // Générer une clé basée sur les paramètres si non fournie
        const cacheKey = uniqueKey.current;

        // Utiliser DataLoader pour optimiser le chargement
        const result = await dataLoader.load(cacheKey, fetchFunction, {
          dataType,
          skipCache: skipCache || isRefresh,
          forceReload: forceReload || isRefresh,
          ...loadOptions,
        });

        // Enregistrer la durée de chargement pour le monitoring
        const loadDuration =
          (performance.now ? performance.now() : Date.now()) - loadStart;
        performanceMonitor.recordApiCall(
          `useDataFetching(${dataType})`,
          loadDuration,
          "HOOK",
          { isRefresh, cacheHit: loadDuration < 50 }
        );

        if (isMounted.current) {
          setData(result);
          setLastUpdated(new Date());
          setError(null);
          setLoading(false);
          setRetryCount(0);

          // Appeler le callback onSuccess si fourni
          if (callbacksRef.current.onSuccess) {
            callbacksRef.current.onSuccess(result);
          }
        }
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);

        if (isMounted.current && !isRefresh) {
          setError(err);
          setLoading(false);
          setRetryCount((prev) => prev + 1);

          // Appeler le callback onError si fourni
          if (callbacksRef.current.onError) {
            callbacksRef.current.onError(err);
          }
        }
      }
    },
    [
      fetchFunction,
      dataType,
      skipCache,
      forceReload,
      maxRetries,
      retryCount,
      ...(loadOptions.dependencies || []),
      ...dependencies,
    ]
  );

  // Fonction pour forcer le rechargement des données
  const refetch = useCallback(() => {
    setRetryCount(0);
    return fetchData(false);
  }, [fetchData]);

  // Fonction pour rafraîchir silencieusement en arrière-plan
  const refreshInBackground = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  // Effet pour le chargement initial des données
  useEffect(() => {
    fetchData();

    // Si un intervalle de rafraîchissement est défini et le rafraîchissement en arrière-plan est activé
    if (refreshInterval > 0 && enableBackgroundRefresh) {
      intervalRef.current = setInterval(refreshInBackground, refreshInterval);
    }

    return () => {
      isMounted.current = false;
      // Nettoyer l'intervalle si existant
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [
    fetchData,
    refreshInBackground,
    refreshInterval,
    enableBackgroundRefresh,
  ]);

  // Précharger des données associées si spécifiées
  useEffect(() => {
    if (options.prefetch && Array.isArray(options.prefetch) && data) {
      dataLoader.prefetch(options.prefetch);
    }
  }, [data, options.prefetch]);

  return {
    data,
    loading,
    error,
    refetch,
    refreshInBackground,
    lastUpdated,
    retryCount,
  };
}

/**
 * Hook pour charger plusieurs sources de données en parallèle
 * @param {Array} fetchConfigs - Tableau de configurations de chargement
 * @param {Object} globalOptions - Options appliquées à tous les chargements
 * @returns {Object} - État de chargement groupé
 */
export function useMultiDataFetching(fetchConfigs, globalOptions = {}) {
  const [multiData, setMultiData] = useState({});
  const [multiLoading, setMultiLoading] = useState(true);
  const [multiError, setMultiError] = useState(null);
  const [isPartialData, setIsPartialData] = useState(false);

  // Références pour le suivi des chargements individuels
  const loadingStatusRef = useRef({});
  const dataResultsRef = useRef({});
  const errorsRef = useRef({});
  const isMountedRef = useRef(true);

  // Fonction pour mettre à jour l'état global en fonction des chargements individuels
  const updateGlobalStatus = useCallback(() => {
    if (!isMountedRef.current) return;

    const keys = Object.keys(loadingStatusRef.current);
    const isAnyLoading = keys.some((key) => loadingStatusRef.current[key]);
    const errors = Object.values(errorsRef.current).filter(Boolean);

    // Vérifier s'il y a des données partielles (certaines sources ont réussi, d'autres non)
    const isPartial = errors.length > 0 && errors.length < keys.length;

    setMultiLoading(isAnyLoading);
    setMultiError(errors.length > 0 ? errors : null);
    setIsPartialData(isPartial);
    setMultiData({ ...dataResultsRef.current });
  }, []);

  // Créer des hooks individuels pour chaque source de données
  const dataStates = fetchConfigs.map((config, index) => {
    const { key, fetcher, ...configOptions } = config;
    const fetchKey = key || `multi_${index}`;

    // Callback pour mettre à jour l'état de cette source
    const handleStatusUpdate = (isLoading, result, err) => {
      loadingStatusRef.current[fetchKey] = isLoading;

      if (result !== undefined) {
        dataResultsRef.current[fetchKey] = result;
      }

      if (err) {
        errorsRef.current[fetchKey] = err;
      } else if (!isLoading) {
        errorsRef.current[fetchKey] = null;
      }

      updateGlobalStatus();
    };

    // Utiliser useDataFetching pour chaque source
    return useDataFetching(fetcher, {
      key: fetchKey,
      ...globalOptions,
      ...configOptions,
      onSuccess: (data) => {
        handleStatusUpdate(false, data, null);
        if (configOptions.onSuccess) {
          configOptions.onSuccess(data);
        }
      },
      onError: (error) => {
        handleStatusUpdate(false, undefined, error);
        if (configOptions.onError) {
          configOptions.onError(error);
        }
      },
    });
  });

  // Effet pour initialiser et nettoyer
  useEffect(() => {
    // Initialiser les statuts de chargement
    fetchConfigs.forEach((config, index) => {
      const fetchKey = config.key || `multi_${index}`;
      loadingStatusRef.current[fetchKey] = true;
    });

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Fonction pour recharger toutes les sources
  const refetchAll = useCallback(() => {
    return Promise.all(dataStates.map((state) => state.refetch()));
  }, [dataStates]);

  return {
    data: multiData,
    loading: multiLoading,
    error: multiError,
    refetch: refetchAll,
    isPartialData,
    dataStates,
  };
}

export default useDataFetching;
