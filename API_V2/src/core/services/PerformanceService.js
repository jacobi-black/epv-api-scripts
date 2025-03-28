/**
 * Service d'optimisation des performances pour l'application
 * Fournit des outils pour mesurer, surveiller et améliorer les performances
 */

// Constantes
const PERFORMANCE_THRESHOLDS = {
  COMPONENT_RENDER: 50, // ms
  API_CALL: 500, // ms
  PAGE_LOAD: 1000, // ms
  LONG_TASK: 100, // ms
  IDLE_TIMEOUT: 5000, // ms
};

// Polyfill pour requestIdleCallback
const requestIdleCallbackPolyfill = (callback, options = {}) => {
  const timeout = options.timeout || 1000;
  const start = Date.now();

  return setTimeout(() => {
    callback({
      didTimeout: false,
      timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
    });
  }, Math.min(timeout, 50));
};

const cancelIdleCallbackPolyfill = (id) => clearTimeout(id);

// Utiliser les fonctions natives si disponibles, sinon les polyfills
const requestIdleCallbackFn =
  typeof window !== "undefined" && "requestIdleCallback" in window
    ? window.requestIdleCallback
    : requestIdleCallbackPolyfill;

const cancelIdleCallbackFn =
  typeof window !== "undefined" && "cancelIdleCallback" in window
    ? window.cancelIdleCallback
    : cancelIdleCallbackPolyfill;

// Stockage des métriques
let metrics = {
  pageLoads: [],
  componentRenders: {},
  apiCalls: {},
  longTasks: [],
  resourceLoads: [],
  memorySnapshots: [],
};

/**
 * Fonction sécurisée pour obtenir des informations sur la mémoire
 * @returns {Object|null} Informations sur la mémoire ou null si non disponible
 */
const getMemoryInfo = () => {
  try {
    if (
      typeof window !== "undefined" &&
      window.performance &&
      window.performance.memory
    ) {
      return {
        usedJSHeapSize: window.performance.memory.usedJSHeapSize,
        totalJSHeapSize: window.performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: window.performance.memory.jsHeapSizeLimit,
      };
    }
  } catch (e) {
    console.warn("Performance memory API non disponible:", e);
  }

  return null;
};

/**
 * Fonction sécurisée pour cloner des objets sans utiliser JSON.parse/stringify
 * @param {Object} obj - Objet à cloner
 * @returns {Object} Clone de l'objet
 */
const safeClone = (obj) => {
  if (obj === undefined || obj === null) return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => safeClone(item));
  }

  if (typeof obj === "object" && obj !== null) {
    const result = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = safeClone(obj[key]);
      }
    }
    return result;
  }

  // Valeurs primitives
  return obj;
};

/**
 * Service de gestion des performances
 */
class PerformanceService {
  constructor() {
    this.isMonitoring = false;
    this.observers = [];
    this.idleCallbackId = null;
    this.enabled = true;

    // Cache pour les composants memoizés
    this.memoizationCache = new Map();
  }

  /**
   * Active ou désactive le service
   * @param {boolean} enabled - État d'activation
   */
  setEnabled(enabled) {
    this.enabled = !!enabled;
    if (!this.enabled && this.isMonitoring) {
      this.stopMonitoring();
    }
  }

  /**
   * Démarre la surveillance des performances
   */
  startMonitoring() {
    if (!this.enabled || this.isMonitoring) return;

    this.isMonitoring = true;
    this._setupObservers();

    console.log("Surveillance des performances démarrée");
  }

  /**
   * Arrête la surveillance des performances
   */
  stopMonitoring() {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    this._cleanupObservers();

    if (this.idleCallbackId) {
      cancelIdleCallbackFn(this.idleCallbackId);
      this.idleCallbackId = null;
    }

    console.log("Surveillance des performances arrêtée");
  }

  /**
   * Enregistre une métrique de chargement de page
   * @param {string} routePath - Chemin de la route
   * @param {number} loadTime - Temps de chargement en ms
   */
  recordPageLoad(routePath, loadTime) {
    if (!this.enabled) return;

    metrics.pageLoads.push({
      routePath,
      loadTime,
      timestamp: Date.now(),
      warning: loadTime > PERFORMANCE_THRESHOLDS.PAGE_LOAD,
    });

    if (loadTime > PERFORMANCE_THRESHOLDS.PAGE_LOAD) {
      console.warn(`Chargement lent de la page ${routePath}: ${loadTime}ms`);
    }
  }

  /**
   * Enregistre une métrique de rendu de composant
   * @param {string} componentName - Nom du composant
   * @param {number} renderTime - Temps de rendu en ms
   */
  recordComponentRender(componentName, renderTime) {
    if (!this.enabled) return;

    if (!metrics.componentRenders[componentName]) {
      metrics.componentRenders[componentName] = [];
    }

    metrics.componentRenders[componentName].push({
      renderTime,
      timestamp: Date.now(),
      warning: renderTime > PERFORMANCE_THRESHOLDS.COMPONENT_RENDER,
    });

    if (renderTime > PERFORMANCE_THRESHOLDS.COMPONENT_RENDER) {
      console.warn(`Rendu lent du composant ${componentName}: ${renderTime}ms`);
    }
  }

  /**
   * Enregistre une métrique d'appel API
   * @param {string} endpoint - Endpoint API
   * @param {number} responseTime - Temps de réponse en ms
   * @param {boolean} success - Si l'appel a réussi
   */
  recordApiCall(endpoint, responseTime, success = true) {
    if (!this.enabled) return;

    if (!metrics.apiCalls[endpoint]) {
      metrics.apiCalls[endpoint] = [];
    }

    metrics.apiCalls[endpoint].push({
      responseTime,
      success,
      timestamp: Date.now(),
      warning: responseTime > PERFORMANCE_THRESHOLDS.API_CALL,
    });

    if (responseTime > PERFORMANCE_THRESHOLDS.API_CALL) {
      console.warn(`Appel API lent vers ${endpoint}: ${responseTime}ms`);
    }
  }

  /**
   * Enregistre une tâche longue
   * @param {string} taskName - Nom de la tâche
   * @param {number} duration - Durée en ms
   */
  recordLongTask(taskName, duration) {
    if (!this.enabled) return;

    metrics.longTasks.push({
      taskName,
      duration,
      timestamp: Date.now(),
      warning: duration > PERFORMANCE_THRESHOLDS.LONG_TASK,
    });

    if (duration > PERFORMANCE_THRESHOLDS.LONG_TASK) {
      console.warn(`Tâche longue détectée: ${taskName} (${duration}ms)`);
    }
  }

  /**
   * Crée un instantané de l'utilisation mémoire
   */
  takeMemorySnapshot() {
    if (!this.enabled) return;

    const memoryInfo = getMemoryInfo();
    if (!memoryInfo) return;

    metrics.memorySnapshots.push({
      ...memoryInfo,
      timestamp: Date.now(),
    });
  }

  /**
   * Récupère toutes les métriques enregistrées
   * @returns {Object} Métriques de performance
   */
  getMetrics() {
    return safeClone(metrics);
  }

  /**
   * Récupère les métriques pour un composant spécifique
   * @param {string} componentName - Nom du composant
   * @returns {Array} Métriques du composant
   */
  getComponentMetrics(componentName) {
    const componentMetrics = metrics.componentRenders[componentName] || [];
    return safeClone(componentMetrics);
  }

  /**
   * Récupère les métriques pour un endpoint API spécifique
   * @param {string} endpoint - Endpoint API
   * @returns {Array} Métriques de l'endpoint
   */
  getApiMetrics(endpoint) {
    const apiMetrics = metrics.apiCalls[endpoint] || [];
    return safeClone(apiMetrics);
  }

  /**
   * Réinitialise toutes les métriques
   */
  resetMetrics() {
    metrics = {
      pageLoads: [],
      componentRenders: {},
      apiCalls: {},
      longTasks: [],
      resourceLoads: [],
      memorySnapshots: [],
    };

    console.log("Métriques de performance réinitialisées");
  }

  /**
   * Mémoïse une fonction pour éviter des recalculs inutiles
   * @param {Function} fn - Fonction à mémoïser
   * @param {Function} getDependencies - Fonction retournant les dépendances
   * @returns {Function} Fonction mémoïsée
   */
  memoize(fn, getDependencies) {
    if (!this.enabled) return fn;

    return (...args) => {
      const key = getDependencies
        ? JSON.stringify(getDependencies(...args))
        : JSON.stringify(args);

      if (this.memoizationCache.has(key)) {
        return this.memoizationCache.get(key);
      }

      const result = fn(...args);
      this.memoizationCache.set(key, result);

      return result;
    };
  }

  /**
   * Nettoie le cache de mémoïsation
   */
  clearMemoizationCache() {
    this.memoizationCache.clear();
  }

  /**
   * Analyse les métriques et identifie les problèmes de performance
   * @returns {Object} Rapport d'analyse
   */
  analyzePerformance() {
    if (!this.enabled) return { issues: [], suggestions: [] };

    const issues = [];
    const suggestions = [];

    // Analyser les chargements de page
    const slowPageLoads = metrics.pageLoads.filter(
      (load) => load.loadTime > PERFORMANCE_THRESHOLDS.PAGE_LOAD
    );

    if (slowPageLoads.length > 0) {
      issues.push({
        type: "page-load",
        message: `${slowPageLoads.length} chargements de page lents détectés`,
        items: safeClone(slowPageLoads),
      });

      suggestions.push(
        "Implémenter le chargement différé (lazy loading) des composants",
        "Optimiser les assets (images, CSS, JS)",
        "Considérer l'utilisation du rendu côté serveur (SSR)"
      );
    }

    // Analyser les renders de composants
    const slowComponentRenders = Object.entries(metrics.componentRenders)
      .filter(([_, renders]) =>
        renders.some(
          (render) =>
            render.renderTime > PERFORMANCE_THRESHOLDS.COMPONENT_RENDER
        )
      )
      .map(([name, renders]) => ({
        name,
        avgRenderTime:
          renders.reduce((sum, r) => sum + r.renderTime, 0) / renders.length,
        maxRenderTime: Math.max(...renders.map((r) => r.renderTime)),
        renderCount: renders.length,
      }));

    if (slowComponentRenders.length > 0) {
      issues.push({
        type: "component-render",
        message: `${slowComponentRenders.length} composants avec des rendus lents`,
        items: slowComponentRenders,
      });

      suggestions.push(
        "Optimiser les composants avec React.memo",
        "Réduire le nombre de re-renders avec useMemo et useCallback",
        "Fragmenter les composants complexes en plus petits composants"
      );
    }

    // Analyser les appels API
    const slowApiCalls = Object.entries(metrics.apiCalls)
      .filter(([_, calls]) =>
        calls.some(
          (call) => call.responseTime > PERFORMANCE_THRESHOLDS.API_CALL
        )
      )
      .map(([endpoint, calls]) => ({
        endpoint,
        avgResponseTime:
          calls.reduce((sum, c) => sum + c.responseTime, 0) / calls.length,
        maxResponseTime: Math.max(...calls.map((c) => c.responseTime)),
        callCount: calls.length,
        failureRate: calls.filter((c) => !c.success).length / calls.length,
      }));

    if (slowApiCalls.length > 0) {
      issues.push({
        type: "api-call",
        message: `${slowApiCalls.length} endpoints API lents`,
        items: slowApiCalls,
      });

      suggestions.push(
        "Implémenter un cache côté client pour les données fréquemment utilisées",
        "Optimiser les requêtes backend",
        "Utiliser une stratégie de chargement en arrière-plan"
      );
    }

    return {
      issues,
      suggestions: [...new Set(suggestions)],
      timestamp: Date.now(),
    };
  }

  /**
   * Mesure les performances d'une fonction
   * @param {Function} fn - Fonction à mesurer
   * @param {string} taskName - Nom de la tâche
   * @returns {any} Résultat de la fonction
   */
  measure(fn, taskName) {
    if (!this.enabled) return fn();

    const startTime = performance.now();
    try {
      return fn();
    } finally {
      const duration = performance.now() - startTime;
      this.recordLongTask(taskName, duration);
    }
  }

  /**
   * Version asynchrone de measure
   * @param {Function} asyncFn - Fonction asynchrone à mesurer
   * @param {string} taskName - Nom de la tâche
   * @returns {Promise<any>} Résultat de la fonction
   */
  async measureAsync(asyncFn, taskName) {
    if (!this.enabled) return await asyncFn();

    const startTime = performance.now();
    try {
      return await asyncFn();
    } finally {
      const duration = performance.now() - startTime;
      this.recordLongTask(taskName, duration);
    }
  }

  /**
   * Configure les observateurs de performance
   * @private
   */
  _setupObservers() {
    if (typeof window !== "undefined" && window.PerformanceObserver) {
      // Observer pour les chargements de ressources
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            metrics.resourceLoads.push({
              name: entry.name,
              initiatorType: entry.initiatorType,
              duration: entry.duration,
              transferSize: entry.transferSize || 0,
              timestamp: Date.now(),
            });
          }
        });

        resourceObserver.observe({ entryTypes: ["resource"] });
        this.observers.push(resourceObserver);
      } catch (e) {
        console.warn(
          "Erreur lors de la configuration de PerformanceObserver pour les ressources:",
          e
        );
      }

      // Observer pour les tâches longues
      try {
        if (
          PerformanceObserver.supportedEntryTypes &&
          PerformanceObserver.supportedEntryTypes.includes("longtask")
        ) {
          const longTaskObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              metrics.longTasks.push({
                taskName: "browser-longtask",
                duration: entry.duration,
                timestamp: Date.now(),
                warning: true,
              });
            }
          });

          longTaskObserver.observe({ entryTypes: ["longtask"] });
          this.observers.push(longTaskObserver);
        }
      } catch (e) {
        console.warn(
          "Erreur lors de la configuration de PerformanceObserver pour les longues tâches:",
          e
        );
      }
    }

    // Prendre des instantanés mémoire à intervalle régulier
    this.idleCallbackId = requestIdleCallbackFn(this._onIdle.bind(this), {
      timeout: PERFORMANCE_THRESHOLDS.IDLE_TIMEOUT,
    });
  }

  /**
   * Exécuté pendant les périodes d'inactivité
   * @private
   */
  _onIdle() {
    if (!this.isMonitoring) return;

    // Prendre un instantané mémoire
    this.takeMemorySnapshot();

    // Reprogrammer pour le prochain cycle d'inactivité
    this.idleCallbackId = requestIdleCallbackFn(this._onIdle.bind(this), {
      timeout: PERFORMANCE_THRESHOLDS.IDLE_TIMEOUT,
    });
  }

  /**
   * Nettoie les observateurs
   * @private
   */
  _cleanupObservers() {
    for (const observer of this.observers) {
      try {
        observer.disconnect();
      } catch (e) {
        console.warn("Erreur lors de la déconnexion d'un observer:", e);
      }
    }

    this.observers = [];
  }
}

// Exporter une instance singleton
export const performanceService = new PerformanceService();

export default performanceService;
