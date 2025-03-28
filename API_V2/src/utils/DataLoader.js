/**
 * Utilitaire d'optimisation du chargement des données
 * Fournit des mécanismes pour améliorer les performances de chargement
 * et de traitement des données dans l'application
 */

import cacheManager from "./CacheManager";

class DataLoader {
  constructor() {
    this.loadingQueue = new Map();
    this.dataProcessors = new Map();
    this.pendingBatches = new Map();
    this.batchTimers = new Map();
    this.loadingStats = {
      totalLoads: 0,
      cachedLoads: 0,
      networkLoads: 0,
      batchedLoads: 0,
      errors: 0,
      timings: [],
    };

    // Configuration par défaut
    this.config = {
      batchDelay: 50, // ms à attendre pour regrouper les requêtes en batch
      maxBatchSize: 20, // nombre maximum d'éléments par batch
      defaultCacheTTL: 1800000, // 30 minutes
      defaultCachePriority: "MEDIUM",
      enablePrefetching: true,
      retryAttempts: 2,
      retryDelay: 1000, // 1 seconde entre les tentatives
      logTimings: true,
      processingTimeout: 30000, // 30 secondes max pour le traitement
    };
  }

  /**
   * Configure les options du DataLoader
   * @param {Object} options - Options de configuration
   */
  configure(options = {}) {
    this.config = { ...this.config, ...options };
  }

  /**
   * Enregistre un processeur de données spécifique à un type
   * @param {string} dataType - Type de données pour ce processeur
   * @param {Function} processorFn - Fonction de traitement des données
   * @param {Object} options - Options spécifiques au processeur
   */
  registerProcessor(dataType, processorFn, options = {}) {
    this.dataProcessors.set(dataType, {
      processor: processorFn,
      options: {
        cachePriority:
          options.cachePriority || this.config.defaultCachePriority,
        cacheTTL: options.cacheTTL || this.config.defaultCacheTTL,
        batchable: options.batchable !== false,
        validateResult: options.validateResult || ((data) => data != null),
        transformResult: options.transformResult || ((data) => data),
      },
    });
  }

  /**
   * Charge une ressource de données avec optimisation de cache et batch
   * @param {string} key - Clé unique pour la ressource
   * @param {Function} fetchFn - Fonction de récupération des données si non cachées
   * @param {Object} options - Options pour le chargement
   * @returns {Promise<any>} - Données chargées
   */
  async load(key, fetchFn, options = {}) {
    const startTime = Date.now();
    this.loadingStats.totalLoads++;

    const dataType = options.dataType || "default";
    const processorInfo = this.dataProcessors.get(dataType);

    // Options de chargement
    const loadOptions = {
      ...this.config,
      ...options,
      cachePriority:
        options.cachePriority ||
        processorInfo?.options.cachePriority ||
        this.config.defaultCachePriority,
      cacheTTL:
        options.cacheTTL ||
        processorInfo?.options.cacheTTL ||
        this.config.defaultCacheTTL,
      batchable: options.batchable ?? processorInfo?.options.batchable ?? true,
      batchKey: options.batchKey || dataType,
      skipCache: options.skipCache || false,
      forceReload: options.forceReload || false,
    };

    try {
      // 1. Vérifier le cache si pas forcé de recharger
      if (!loadOptions.skipCache && !loadOptions.forceReload) {
        const cachedData = cacheManager.get(key);
        if (cachedData !== null) {
          this.loadingStats.cachedLoads++;
          this._recordTiming(key, "cache", Date.now() - startTime);
          return cachedData;
        }
      }

      // 2. Vérifier si une requête identique est déjà en cours
      if (this.loadingQueue.has(key) && !loadOptions.forceReload) {
        return this.loadingQueue.get(key);
      }

      // 3. Si le chargement est batchable, l'ajouter à un batch
      if (loadOptions.batchable && loadOptions.batchFn) {
        const batchPromise = this._addToBatch(
          key,
          loadOptions.batchKey,
          loadOptions
        );
        this.loadingQueue.set(key, batchPromise);

        // Nettoyer la queue une fois terminé
        batchPromise.finally(() => {
          this.loadingQueue.delete(key);
        });

        return batchPromise;
      }

      // 4. Chargement standard
      const loadPromise = this._executeLoad(key, fetchFn, loadOptions);
      this.loadingQueue.set(key, loadPromise);

      // Nettoyer la queue une fois terminé
      loadPromise.finally(() => {
        this.loadingQueue.delete(key);
      });

      return loadPromise;
    } catch (error) {
      this.loadingStats.errors++;
      console.error(`Erreur lors du chargement de ${key}:`, error);
      throw error;
    }
  }

  /**
   * Charge plusieurs ressources de données en parallèle
   * @param {Array<Object>} items - Tableau d'objets {key, fetchFn, options}
   * @param {Object} globalOptions - Options appliquées à tous les chargements
   * @returns {Promise<Map<string, any>>} - Map des données chargées
   */
  async loadMany(items, globalOptions = {}) {
    const results = new Map();
    const promises = items.map(async ({ key, fetchFn, options = {} }) => {
      try {
        const mergedOptions = { ...globalOptions, ...options };
        const data = await this.load(key, fetchFn, mergedOptions);
        results.set(key, data);
        return { key, data, success: true };
      } catch (error) {
        results.set(key, null);
        return { key, error, success: false };
      }
    });

    await Promise.all(promises);
    return results;
  }

  /**
   * Précharge des données qui seront probablement nécessaires bientôt
   * @param {Array<Object>} items - Tableau d'objets {key, fetchFn, options}
   * @returns {Promise<void>}
   */
  async prefetch(items) {
    if (!this.config.enablePrefetching) return;

    const prefetchPromises = items.map(
      async ({ key, fetchFn, options = {} }) => {
        try {
          // Vérifier si déjà en cache
          if (cacheManager.has(key)) return;

          // Précharger avec faible priorité
          const prefetchOptions = {
            ...options,
            cachePriority: options.cachePriority || "LOW",
            _isPrefetch: true,
          };

          await this.load(key, fetchFn, prefetchOptions);
        } catch (error) {
          console.warn(`Erreur lors du préchargement de ${key}:`, error);
        }
      }
    );

    // Ne pas attendre que tous les préchargements soient terminés
    Promise.all(prefetchPromises).catch((error) => {
      console.warn("Erreur lors du préchargement:", error);
    });
  }

  /**
   * Effectue le chargement effectif d'une ressource
   * @param {string} key - Clé de ressource
   * @param {Function} fetchFn - Fonction de récupération
   * @param {Object} options - Options de chargement
   * @returns {Promise<any>} - Données chargées
   * @private
   */
  async _executeLoad(key, fetchFn, options) {
    const startTime = Date.now();
    let attempts = 0;
    let lastError = null;

    while (attempts <= options.retryAttempts) {
      try {
        if (attempts > 0) {
          await new Promise((resolve) =>
            setTimeout(resolve, options.retryDelay)
          );
        }

        this.loadingStats.networkLoads++;
        const rawData = await fetchFn();

        // Traiter les données si un processeur est défini
        const processor = this.dataProcessors.get(options.dataType);
        const processedData = processor
          ? await this._processData(rawData, processor, options)
          : rawData;

        // Valider les données si nécessaire
        if (processor && processor.options.validateResult) {
          const isValid = processor.options.validateResult(processedData);
          if (!isValid) {
            throw new Error(`Données invalides pour ${key}`);
          }
        }

        // Mettre en cache sauf si c'est demandé de ne pas le faire
        if (!options.skipCache) {
          cacheManager.set(key, processedData, {
            priority: options.cachePriority,
            ttl: options.cacheTTL,
            metadata: {
              dataType: options.dataType,
              timestamp: Date.now(),
              source: options._isPrefetch ? "prefetch" : "direct",
            },
          });
        }

        this._recordTiming(key, "load", Date.now() - startTime);
        return processedData;
      } catch (error) {
        lastError = error;
        attempts++;

        if (attempts > options.retryAttempts) {
          this.loadingStats.errors++;
          throw error;
        }
      }
    }

    throw lastError;
  }

  /**
   * Traite les données selon le processeur enregistré
   * @param {any} data - Données brutes
   * @param {Object} processorInfo - Informations sur le processeur
   * @param {Object} options - Options de traitement
   * @returns {Promise<any>} - Données traitées
   * @private
   */
  async _processData(data, processorInfo, options) {
    const { processor, options: processorOptions } = processorInfo;

    // Créer une promise avec timeout pour éviter les traitements trop longs
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error("Timeout lors du traitement des données"));
      }, options.processingTimeout);

      try {
        // Exécuter le processeur
        Promise.resolve(processor(data, options))
          .then((processed) => {
            clearTimeout(timeoutId);

            // Appliquer une transformation finale si définie
            const result = processorOptions.transformResult
              ? processorOptions.transformResult(processed)
              : processed;

            resolve(result);
          })
          .catch((error) => {
            clearTimeout(timeoutId);
            reject(error);
          });
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  }

  /**
   * Ajoute une requête à un batch pour chargement groupé
   * @param {string} key - Clé de ressource
   * @param {string} batchKey - Clé du batch
   * @param {Object} options - Options de chargement
   * @returns {Promise<any>} - Promise pour la requête en batch
   * @private
   */
  _addToBatch(key, batchKey, options) {
    this.loadingStats.batchedLoads++;

    // Créer le batch s'il n'existe pas
    if (!this.pendingBatches.has(batchKey)) {
      this.pendingBatches.set(batchKey, []);

      // Configurer le timer pour exécuter le batch
      const timerId = setTimeout(() => {
        this._executeBatch(batchKey, options);
      }, options.batchDelay);

      this.batchTimers.set(batchKey, timerId);
    }

    // Créer une promise pour cette requête spécifique
    let resolveItem, rejectItem;
    const itemPromise = new Promise((resolve, reject) => {
      resolveItem = resolve;
      rejectItem = reject;
    });

    // Ajouter à la liste des requêtes en attente
    this.pendingBatches.get(batchKey).push({
      key,
      resolve: resolveItem,
      reject: rejectItem,
      options,
    });

    // Exécuter immédiatement si le batch est plein
    const currentBatchSize = this.pendingBatches.get(batchKey).length;
    if (currentBatchSize >= options.maxBatchSize) {
      // Annuler le timer existant
      clearTimeout(this.batchTimers.get(batchKey));
      this.batchTimers.delete(batchKey);

      // Exécuter le batch
      this._executeBatch(batchKey, options);
    }

    return itemPromise;
  }

  /**
   * Exécute un batch de requêtes
   * @param {string} batchKey - Clé du batch
   * @param {Object} options - Options de chargement
   * @private
   */
  async _executeBatch(batchKey, options) {
    const batch = this.pendingBatches.get(batchKey) || [];
    this.pendingBatches.delete(batchKey);

    // Annuler le timer s'il existe encore
    if (this.batchTimers.has(batchKey)) {
      clearTimeout(this.batchTimers.get(batchKey));
      this.batchTimers.delete(batchKey);
    }

    if (batch.length === 0) return;

    const startTime = Date.now();
    const keys = batch.map((item) => item.key);

    try {
      // Exécuter la fonction de batch
      const batchResults = await options.batchFn(keys, options);

      // Distribuer les résultats
      batch.forEach((item) => {
        const result = batchResults.get(item.key);
        if (result !== undefined) {
          // Mettre en cache si nécessaire
          if (!options.skipCache) {
            cacheManager.set(item.key, result, {
              priority: options.cachePriority,
              ttl: options.cacheTTL,
              metadata: {
                dataType: options.dataType,
                timestamp: Date.now(),
                source: "batch",
              },
            });
          }
          item.resolve(result);
        } else {
          item.reject(
            new Error(`Aucun résultat pour ${item.key} dans le batch`)
          );
        }
      });

      this._recordTiming(
        batchKey,
        "batch",
        Date.now() - startTime,
        batch.length
      );
    } catch (error) {
      // En cas d'échec global, rejeter toutes les promesses
      batch.forEach((item) => {
        item.reject(error);
      });

      this.loadingStats.errors++;
      console.error(`Erreur lors de l'exécution du batch ${batchKey}:`, error);
    }
  }

  /**
   * Enregistre les temps de chargement pour l'analyse des performances
   * @param {string} key - Clé de la ressource chargée
   * @param {string} mode - Mode de chargement (cache, load, batch)
   * @param {number} duration - Durée en ms
   * @param {number} itemCount - Nombre d'éléments (pour batch)
   * @private
   */
  _recordTiming(key, mode, duration, itemCount = 1) {
    if (!this.config.logTimings) return;

    this.loadingStats.timings.push({
      key,
      mode,
      duration,
      timestamp: Date.now(),
      itemCount,
    });

    // Limiter la taille de l'historique des timings
    if (this.loadingStats.timings.length > 500) {
      this.loadingStats.timings = this.loadingStats.timings.slice(-500);
    }
  }

  /**
   * Obtient des statistiques sur l'utilisation du DataLoader
   * @returns {Object} - Statistiques compilées
   */
  getStats() {
    const timings = this.loadingStats.timings;

    // Calculer les statistiques de performance
    const avgLoadTime =
      timings.length > 0
        ? timings.reduce((sum, t) => sum + t.duration, 0) / timings.length
        : 0;

    const avgByMode = {};
    ["cache", "load", "batch"].forEach((mode) => {
      const modeTimes = timings.filter((t) => t.mode === mode);
      avgByMode[mode] =
        modeTimes.length > 0
          ? modeTimes.reduce((sum, t) => sum + t.duration, 0) / modeTimes.length
          : 0;
    });

    // Calculer le taux de cache hit
    const totalLoads = this.loadingStats.totalLoads;
    const cacheHitRate =
      totalLoads > 0 ? (this.loadingStats.cachedLoads / totalLoads) * 100 : 0;

    // Calculer l'efficacité du batching
    const batchEfficiency =
      this.loadingStats.batchedLoads > 0
        ? ((this.loadingStats.batchedLoads -
            timings.filter((t) => t.mode === "batch").length) /
            this.loadingStats.batchedLoads) *
          100
        : 0;

    return {
      loads: {
        total: this.loadingStats.totalLoads,
        fromCache: this.loadingStats.cachedLoads,
        fromNetwork: this.loadingStats.networkLoads,
        batched: this.loadingStats.batchedLoads,
        errors: this.loadingStats.errors,
      },
      performance: {
        averageLoadTime: `${avgLoadTime.toFixed(2)}ms`,
        cacheLoadTime: `${avgByMode.cache.toFixed(2)}ms`,
        networkLoadTime: `${avgByMode.load.toFixed(2)}ms`,
        batchLoadTime: `${avgByMode.batch.toFixed(2)}ms`,
      },
      efficiency: {
        cacheHitRate: `${cacheHitRate.toFixed(2)}%`,
        batchEfficiency: `${batchEfficiency.toFixed(2)}%`,
      },
      activeLoads: this.loadingQueue.size,
      activeBatches: this.pendingBatches.size,
      processors: Array.from(this.dataProcessors.keys()),
      cacheStats: cacheManager.getStats(),
    };
  }

  /**
   * Réinitialise les statistiques du DataLoader
   */
  resetStats() {
    this.loadingStats = {
      totalLoads: 0,
      cachedLoads: 0,
      networkLoads: 0,
      batchedLoads: 0,
      errors: 0,
      timings: [],
    };
  }

  /**
   * Annule toutes les requêtes en cours
   */
  cancelAll() {
    // Annuler tous les batchs en attente
    this.batchTimers.forEach((timerId) => {
      clearTimeout(timerId);
    });

    this.pendingBatches.forEach((batch) => {
      batch.forEach((item) => {
        item.reject(new Error("Chargement annulé"));
      });
    });

    // Réinitialiser les collections
    this.loadingQueue.clear();
    this.pendingBatches.clear();
    this.batchTimers.clear();
  }
}

// Exporter une instance singleton
const dataLoader = new DataLoader();
export default dataLoader;
