/**
 * Moniteur de performance pour l'application
 * Permet de suivre les métriques de performance, identifier les goulots d'étranglement
 * et fournir des recommandations d'optimisation
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      pageLoads: {},
      componentRenders: {},
      apiCalls: {},
      resourceLoads: {},
      longTasks: [],
    };

    this.thresholds = {
      pageLoad: 1500, // ms
      apiCall: 500, // ms
      componentRender: 50, // ms
      resourceLoad: 300, // ms
      longTask: 100, // ms
    };

    this.session = {
      startTime: Date.now(),
      id: this._generateSessionId(),
      userAgent:
        typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
      warnings: [],
      optimizationSuggestions: [],
    };

    // État actuel
    this.isMonitoring = false;
    this.isRecording = false;
    this._marks = new Map();
    this._measures = [];
    this._interactionSamples = 0;

    // Buffers pour minimiser l'impact sur les performances
    this._pendingLogs = [];
    this._metricBuffer = [];
    this._flushInterval = null;
  }

  /**
   * Démarre le monitoring des performances
   * @param {Object} options - Options de configuration
   */
  start(options = {}) {
    if (this.isMonitoring) return;

    // Configurer les seuils avec les options passées
    this.thresholds = { ...this.thresholds, ...options.thresholds };

    // Démarrer le monitoring de base
    this.isMonitoring = true;

    // Initialiser la surveillance des performances web si disponible
    this._initPerformanceObservers();

    // Démarrer l'intervalle de vidage des métriques en mémoire
    this._flushInterval = setInterval(() => this._flushMetrics(), 30000);

    // Marquer le début de la session
    this.mark("session_start");

    console.log(
      `[PerformanceMonitor] Monitoring démarré - Session ${this.session.id}`
    );
  }

  /**
   * Arrête le monitoring des performances
   */
  stop() {
    if (!this.isMonitoring) return;

    // Marquer la fin de la session
    this.mark("session_end");
    this.measure("session_duration", "session_start", "session_end");

    // Vider les dernières métriques
    this._flushMetrics();

    // Nettoyer les ressources
    if (this._flushInterval) {
      clearInterval(this._flushInterval);
      this._flushInterval = null;
    }

    this._disconnectObservers();
    this.isMonitoring = false;

    console.log(
      `[PerformanceMonitor] Monitoring arrêté - Durée de session: ${
        (Date.now() - this.session.startTime) / 1000
      }s`
    );
  }

  /**
   * Commence l'enregistrement d'une opération
   * @param {string} markName - Nom du marqueur
   * @returns {string} - Le nom du marqueur
   */
  mark(markName) {
    if (!this.isMonitoring) return markName;

    const timestamp = performance.now ? performance.now() : Date.now();
    this._marks.set(markName, timestamp);

    return markName;
  }

  /**
   * Mesure le temps écoulé entre deux marqueurs
   * @param {string} measureName - Nom de la mesure
   * @param {string} startMark - Marqueur de début
   * @param {string} endMark - Marqueur de fin (optionnel, par défaut: maintenant)
   * @returns {number} - Durée en millisecondes
   */
  measure(measureName, startMark, endMark = null) {
    if (!this.isMonitoring) return 0;

    const startTime = this._marks.get(startMark);
    if (!startTime) return 0;

    const endTime = endMark
      ? this._marks.get(endMark)
      : performance.now
      ? performance.now()
      : Date.now();

    if (!endTime) return 0;

    const duration = endTime - startTime;

    this._measures.push({
      name: measureName,
      startMark,
      endMark: endMark || "now",
      duration,
      timestamp: Date.now(),
    });

    return duration;
  }

  /**
   * Enregistre le chargement d'une page
   * @param {string} pageName - Nom de la page
   * @param {number} duration - Durée du chargement en ms
   * @param {Object} details - Détails supplémentaires
   */
  recordPageLoad(pageName, duration, details = {}) {
    if (!this.isMonitoring) return;

    if (!this.metrics.pageLoads[pageName]) {
      this.metrics.pageLoads[pageName] = {
        count: 0,
        totalDuration: 0,
        min: Infinity,
        max: 0,
        samples: [],
      };
    }

    const metrics = this.metrics.pageLoads[pageName];
    metrics.count++;
    metrics.totalDuration += duration;
    metrics.min = Math.min(metrics.min, duration);
    metrics.max = Math.max(metrics.max, duration);

    // Garder un échantillon limité pour l'analyse
    metrics.samples.push({
      duration,
      timestamp: Date.now(),
      ...details,
    });

    if (metrics.samples.length > 20) {
      metrics.samples.shift(); // Garder seulement les 20 derniers échantillons
    }

    // Ajouter un avertissement si le chargement est lent
    if (duration > this.thresholds.pageLoad) {
      this._addWarning(
        "page_load_slow",
        `Chargement lent de la page "${pageName}" (${duration.toFixed(0)}ms)`,
        { pageName, duration, threshold: this.thresholds.pageLoad }
      );
    }
  }

  /**
   * Enregistre le rendu d'un composant
   * @param {string} componentName - Nom du composant
   * @param {number} duration - Durée du rendu en ms
   * @param {Object} props - Props du composant (optionnel)
   */
  recordComponentRender(componentName, duration, props = null) {
    if (!this.isMonitoring) return;

    if (!this.metrics.componentRenders[componentName]) {
      this.metrics.componentRenders[componentName] = {
        count: 0,
        totalDuration: 0,
        min: Infinity,
        max: 0,
        lastProps: null,
      };
    }

    const metrics = this.metrics.componentRenders[componentName];
    metrics.count++;
    metrics.totalDuration += duration;
    metrics.min = Math.min(metrics.min, duration);
    metrics.max = Math.max(metrics.max, duration);
    metrics.lastProps = props;

    // Ajouter un avertissement si le rendu est lent
    if (duration > this.thresholds.componentRender) {
      this._addWarning(
        "component_render_slow",
        `Rendu lent du composant "${componentName}" (${duration.toFixed(0)}ms)`,
        { componentName, duration, props }
      );

      // Suggérer une optimisation si c'est un problème récurrent
      if (
        metrics.count > 3 &&
        metrics.totalDuration / metrics.count > this.thresholds.componentRender
      ) {
        this._addOptimizationSuggestion(
          "component_optimization",
          `Optimiser le composant "${componentName}" avec React.memo ou useMemo`,
          { type: "component", componentName }
        );
      }
    }
  }

  /**
   * Enregistre un appel API
   * @param {string} endpoint - Point d'API appelé
   * @param {number} duration - Durée de l'appel en ms
   * @param {string} method - Méthode HTTP
   * @param {Object} metadata - Métadonnées supplémentaires
   */
  recordApiCall(endpoint, duration, method = "GET", metadata = {}) {
    if (!this.isMonitoring) return;

    const key = `${method}:${endpoint}`;

    if (!this.metrics.apiCalls[key]) {
      this.metrics.apiCalls[key] = {
        count: 0,
        totalDuration: 0,
        min: Infinity,
        max: 0,
        failures: 0,
        lastCalled: null,
      };
    }

    const metrics = this.metrics.apiCalls[key];
    metrics.count++;
    metrics.totalDuration += duration;
    metrics.min = Math.min(metrics.min, duration);
    metrics.max = Math.max(metrics.max, duration);
    metrics.lastCalled = Date.now();

    if (metadata.error) {
      metrics.failures++;
    }

    // Ajouter à la liste des métriques en attente de traitement
    this._metricBuffer.push({
      type: "api",
      key,
      duration,
      timestamp: Date.now(),
      metadata,
    });

    // Ajouter un avertissement si l'appel est lent
    if (duration > this.thresholds.apiCall) {
      this._addWarning(
        "api_call_slow",
        `Appel API lent vers "${endpoint}" (${duration.toFixed(0)}ms)`,
        { endpoint, method, duration }
      );

      // Suggérer une optimisation si c'est un problème récurrent
      if (
        metrics.count > 2 &&
        metrics.totalDuration / metrics.count > this.thresholds.apiCall
      ) {
        this._addOptimizationSuggestion(
          "api_call_optimization",
          `Considérer la mise en cache des résultats pour "${endpoint}"`,
          { type: "api", endpoint, method }
        );
      }
    }
  }

  /**
   * Enregistre le chargement d'une ressource
   * @param {string} resourceUrl - URL de la ressource
   * @param {number} duration - Durée du chargement en ms
   * @param {string} resourceType - Type de ressource (script, style, image, etc.)
   * @param {Object} metadata - Métadonnées supplémentaires
   */
  recordResourceLoad(
    resourceUrl,
    duration,
    resourceType = "unknown",
    metadata = {}
  ) {
    if (!this.isMonitoring) return;

    const urlKey = resourceUrl.split("?")[0]; // Ignorer les paramètres de requête

    if (!this.metrics.resourceLoads[urlKey]) {
      this.metrics.resourceLoads[urlKey] = {
        type: resourceType,
        count: 0,
        totalDuration: 0,
        min: Infinity,
        max: 0,
      };
    }

    const metrics = this.metrics.resourceLoads[urlKey];
    metrics.count++;
    metrics.totalDuration += duration;
    metrics.min = Math.min(metrics.min, duration);
    metrics.max = Math.max(metrics.max, duration);

    // Ajouter un avertissement si le chargement est lent
    if (duration > this.thresholds.resourceLoad) {
      this._addWarning(
        "resource_load_slow",
        `Chargement lent de la ressource ${resourceType} (${duration.toFixed(
          0
        )}ms)`,
        { url: resourceUrl, type: resourceType, duration }
      );
    }
  }

  /**
   * Enregistre une tâche longue qui bloque le thread principal
   * @param {number} duration - Durée de la tâche en ms
   * @param {string} source - Source de la tâche (si connue)
   */
  recordLongTask(duration, source = "unknown") {
    if (!this.isMonitoring) return;

    this.metrics.longTasks.push({
      duration,
      timestamp: Date.now(),
      source,
    });

    // Limiter le nombre de tâches longues conservées
    if (this.metrics.longTasks.length > 50) {
      this.metrics.longTasks.shift();
    }

    // Ajouter un avertissement si la tâche est particulièrement longue
    if (duration > this.thresholds.longTask) {
      this._addWarning(
        "long_task",
        `Tâche bloquante détectée (${duration.toFixed(0)}ms)`,
        { duration, source }
      );

      // Si plusieurs tâches longues sont détectées, suggérer des optimisations
      if (this.metrics.longTasks.length > 5) {
        this._addOptimizationSuggestion(
          "long_tasks_optimization",
          `Plusieurs tâches bloquantes détectées. Considérer l'utilisation de Web Workers ou le découpage du travail.`,
          { type: "performance" }
        );
      }
    }
  }

  /**
   * Récupère un rapport de performance complet
   * @returns {Object} - Rapport de performance
   */
  getReport() {
    // Calculer des métriques dérivées
    const pageLoadStats = this._calculateAggregateStats(this.metrics.pageLoads);
    const apiCallStats = this._calculateAggregateStats(this.metrics.apiCalls);
    const componentStats = this._calculateAggregateStats(
      this.metrics.componentRenders
    );

    // Identifier les composants les plus lents
    const slowestComponents = Object.entries(this.metrics.componentRenders)
      .map(([name, data]) => ({
        name,
        avgDuration: data.totalDuration / data.count,
        renderCount: data.count,
      }))
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, 5);

    // Identifier les appels API les plus lents
    const slowestApiCalls = Object.entries(this.metrics.apiCalls)
      .map(([endpoint, data]) => ({
        endpoint,
        avgDuration: data.totalDuration / data.count,
        callCount: data.count,
        failureRate: data.failures / data.count,
      }))
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, 5);

    return {
      session: {
        id: this.session.id,
        duration: Date.now() - this.session.startTime,
        startTime: this.session.startTime,
        userAgent: this.session.userAgent,
      },
      summary: {
        pageLoads: pageLoadStats,
        apiCalls: apiCallStats,
        componentRenders: componentStats,
        longTasks: this.metrics.longTasks.length,
        resourcesLoaded: Object.keys(this.metrics.resourceLoads).length,
        warnings: this.session.warnings.length,
        optimizationSuggestions: this.session.optimizationSuggestions.length,
      },
      details: {
        slowestComponents,
        slowestApiCalls,
        longTasks: this.metrics.longTasks.slice(0, 10),
        warnings: this.session.warnings,
        optimizationSuggestions: this.session.optimizationSuggestions,
      },
    };
  }

  /**
   * Réinitialise toutes les métriques collectées
   */
  reset() {
    this.metrics = {
      pageLoads: {},
      componentRenders: {},
      apiCalls: {},
      resourceLoads: {},
      longTasks: [],
    };

    this.session = {
      startTime: Date.now(),
      id: this._generateSessionId(),
      userAgent:
        typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
      warnings: [],
      optimizationSuggestions: [],
    };

    this._marks = new Map();
    this._measures = [];
    this._pendingLogs = [];
    this._metricBuffer = [];

    console.log(`[PerformanceMonitor] Métriques réinitialisées`);
  }

  /**
   * Obtient des suggestions d'optimisation basées sur les métriques collectées
   * @returns {Array} - Liste de suggestions d'optimisation
   */
  getOptimizationSuggestions() {
    return this.session.optimizationSuggestions;
  }

  /**
   * Initialise les observateurs de performance Web API
   * @private
   */
  _initPerformanceObservers() {
    if (typeof window === "undefined" || !window.PerformanceObserver) return;

    try {
      // Observer les ressources chargées
      this._resourceObserver = new PerformanceObserver((entries) => {
        entries.getEntries().forEach((entry) => {
          if (entry.initiatorType && entry.duration) {
            this.recordResourceLoad(
              entry.name,
              entry.duration,
              entry.initiatorType,
              { size: entry.transferSize }
            );
          }
        });
      });
      this._resourceObserver.observe({ entryTypes: ["resource"] });

      // Observer la navigation (chargement de page)
      this._navigationObserver = new PerformanceObserver((entries) => {
        entries.getEntries().forEach((entry) => {
          const pageName = window.location.pathname;
          this.recordPageLoad(pageName, entry.duration, {
            dnsTime: entry.domainLookupEnd - entry.domainLookupStart,
            connectTime: entry.connectEnd - entry.connectStart,
            ttfb: entry.responseStart - entry.requestStart,
            domContentLoaded:
              entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
            loadEvent: entry.loadEventEnd - entry.loadEventStart,
          });
        });
      });
      this._navigationObserver.observe({ entryTypes: ["navigation"] });

      // Observer les tâches longues
      if (
        PerformanceObserver.supportedEntryTypes &&
        PerformanceObserver.supportedEntryTypes.includes("longtask")
      ) {
        this._longTaskObserver = new PerformanceObserver((entries) => {
          entries.getEntries().forEach((entry) => {
            this.recordLongTask(
              entry.duration,
              entry.attribution[0]?.name || "unknown"
            );
          });
        });
        this._longTaskObserver.observe({ entryTypes: ["longtask"] });
      }

      // Observer les interactions utilisateur (FID)
      if (
        PerformanceObserver.supportedEntryTypes &&
        PerformanceObserver.supportedEntryTypes.includes("first-input")
      ) {
        this._fidObserver = new PerformanceObserver((entries) => {
          entries.getEntries().forEach((entry) => {
            // First Input Delay
            const delay = entry.processingStart - entry.startTime;
            if (delay > 100) {
              this._addWarning(
                "fid_high",
                `Délai de première interaction élevé (${delay.toFixed(0)}ms)`,
                { delay }
              );
            }
          });
        });
        this._fidObserver.observe({
          entryTypes: ["first-input"],
          buffered: true,
        });
      }
    } catch (err) {
      console.error(
        "[PerformanceMonitor] Erreur lors de l'initialisation des observateurs:",
        err
      );
    }
  }

  /**
   * Déconnecte tous les observateurs de performance
   * @private
   */
  _disconnectObservers() {
    if (this._resourceObserver) {
      this._resourceObserver.disconnect();
      this._resourceObserver = null;
    }

    if (this._navigationObserver) {
      this._navigationObserver.disconnect();
      this._navigationObserver = null;
    }

    if (this._longTaskObserver) {
      this._longTaskObserver.disconnect();
      this._longTaskObserver = null;
    }

    if (this._fidObserver) {
      this._fidObserver.disconnect();
      this._fidObserver = null;
    }
  }

  /**
   * Calcule des statistiques agrégées pour un ensemble de métriques
   * @param {Object} metricsObj - Objet de métriques
   * @returns {Object} - Statistiques calculées
   * @private
   */
  _calculateAggregateStats(metricsObj) {
    const entries = Object.entries(metricsObj);

    if (entries.length === 0) {
      return {
        count: 0,
        avgDuration: 0,
        totalItems: 0,
      };
    }

    let totalCount = 0;
    let totalDuration = 0;
    let minDuration = Infinity;
    let maxDuration = 0;

    entries.forEach(([key, data]) => {
      totalCount += data.count;
      totalDuration += data.totalDuration;
      minDuration = Math.min(minDuration, data.min);
      maxDuration = Math.max(maxDuration, data.max);
    });

    return {
      count: entries.length,
      totalItems: totalCount,
      avgDuration: totalCount > 0 ? totalDuration / totalCount : 0,
      minDuration: minDuration === Infinity ? 0 : minDuration,
      maxDuration,
    };
  }

  /**
   * Vide périodiquement les métriques en mémoire
   * @private
   */
  _flushMetrics() {
    // Analyser les métriques en buffer pour des patterns
    this._analyzeMetrics();

    // Vider les buffers
    this._metricBuffer = [];

    // Ne pas conserver trop de mesures
    if (this._measures.length > 100) {
      this._measures = this._measures.slice(-100);
    }
  }

  /**
   * Analyse les métriques pour détecter des problèmes et générer des suggestions
   * @private
   */
  _analyzeMetrics() {
    // Analyser les appels API répétés en peu de temps
    const apiCallsByEndpoint = {};
    this._metricBuffer.forEach((metric) => {
      if (metric.type === "api") {
        if (!apiCallsByEndpoint[metric.key]) {
          apiCallsByEndpoint[metric.key] = [];
        }
        apiCallsByEndpoint[metric.key].push(metric);
      }
    });

    // Détecter les appels répétés qui pourraient être mis en cache
    Object.entries(apiCallsByEndpoint).forEach(([endpoint, calls]) => {
      if (calls.length > 3) {
        // Vérifier si les appels sont rapprochés dans le temps (moins de 5 secondes)
        const timestamps = calls.map((c) => c.timestamp).sort();
        const timeSpan = timestamps[timestamps.length - 1] - timestamps[0];

        if (timeSpan < 5000) {
          this._addOptimizationSuggestion(
            "api_duplicate_calls",
            `Plusieurs appels (${
              calls.length
            }) à "${endpoint}" en peu de temps (${(timeSpan / 1000).toFixed(
              1
            )}s)`,
            { type: "api", endpoint, callCount: calls.length, timeSpan }
          );
        }
      }
    });
  }

  /**
   * Ajoute un avertissement à la session
   * @param {string} code - Code de l'avertissement
   * @param {string} message - Message d'avertissement
   * @param {Object} data - Données associées
   * @private
   */
  _addWarning(code, message, data = {}) {
    // Éviter les doublons
    const existingWarning = this.session.warnings.find(
      (w) => w.code === code && JSON.stringify(w.data) === JSON.stringify(data)
    );

    if (!existingWarning) {
      this.session.warnings.push({
        code,
        message,
        timestamp: Date.now(),
        data,
      });

      // Limiter le nombre d'avertissements
      if (this.session.warnings.length > 100) {
        this.session.warnings.shift();
      }
    }
  }

  /**
   * Ajoute une suggestion d'optimisation
   * @param {string} code - Code de la suggestion
   * @param {string} message - Message de suggestion
   * @param {Object} data - Données associées
   * @private
   */
  _addOptimizationSuggestion(code, message, data = {}) {
    // Éviter les doublons exactement identiques pour la même session
    const existingSuggestion = this.session.optimizationSuggestions.find(
      (s) => s.code === code && JSON.stringify(s.data) === JSON.stringify(data)
    );

    if (!existingSuggestion) {
      this.session.optimizationSuggestions.push({
        code,
        message,
        timestamp: Date.now(),
        data,
      });

      // Limiter le nombre de suggestions
      if (this.session.optimizationSuggestions.length > 20) {
        this.session.optimizationSuggestions.shift();
      }
    }
  }

  /**
   * Génère un identifiant unique pour la session
   * @returns {string} - ID de session
   * @private
   */
  _generateSessionId() {
    const random = Math.random().toString(36).substring(2, 10);
    const timestamp = Date.now().toString(36);
    return `perf_${timestamp}_${random}`;
  }
}

// Exporter une instance singleton
const performanceMonitor = new PerformanceMonitor();
export default performanceMonitor;

// Fonction utilitaire pour utilisation comme décorateur ou HOC
export function measurePerformance(target, key, descriptor) {
  // S'il est utilisé comme décorateur de méthode
  if (descriptor && typeof descriptor.value === "function") {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args) {
      const startMark = `${key}_start_${Date.now()}`;
      performanceMonitor.mark(startMark);

      try {
        const result = originalMethod.apply(this, args);

        // Gérer à la fois les valeurs synchrones et les promesses
        if (result instanceof Promise) {
          return result.finally(() => {
            const duration = performanceMonitor.measure(
              `${key}_execution`,
              startMark
            );
            if (key.includes("api") || key.includes("fetch")) {
              performanceMonitor.recordApiCall(key, duration);
            } else {
              performanceMonitor.recordLongTask(duration, key);
            }
          });
        } else {
          const duration = performanceMonitor.measure(
            `${key}_execution`,
            startMark
          );
          if (duration > 10) {
            // N'enregistrer que si c'est significatif
            performanceMonitor.recordLongTask(duration, key);
          }
          return result;
        }
      } catch (error) {
        const duration = performanceMonitor.measure(
          `${key}_execution_error`,
          startMark
        );
        performanceMonitor.recordLongTask(duration, `${key}_error`);
        throw error;
      }
    };

    return descriptor;
  }

  // S'il est utilisé comme décorateur de composant ou HOC
  return (Component) => {
    const componentName =
      Component.displayName || Component.name || "AnonymousComponent";

    if (typeof Component === "function") {
      // Pour les composants fonctionnels et classes
      const WrappedComponent = (props) => {
        const startTime = performance.now ? performance.now() : Date.now();

        // Pour les hooks dans les composants fonctionnels React
        React.useEffect(() => {
          const endTime = performance.now ? performance.now() : Date.now();
          const duration = endTime - startTime;
          performanceMonitor.recordComponentRender(
            componentName,
            duration,
            props
          );
        }, []);

        return <Component {...props} />;
      };

      WrappedComponent.displayName = `PerformanceMeasured(${componentName})`;
      return WrappedComponent;
    }

    return Component;
  };
}
