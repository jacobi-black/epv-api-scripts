/**
 * Hook pour intégrer les fonctionnalités de performance dans les composants React
 */

import { useEffect, useRef, useCallback, useState } from "react";
import performanceService from "../services/PerformanceService";

/**
 * Hook pour mesurer les performances d'un composant
 * @param {string} componentName - Nom du composant
 * @param {Object} options - Options supplémentaires
 * @returns {Object} Fonctions utilitaires pour mesurer les performances
 */
export function usePerformance(componentName, options = {}) {
  const {
    trackRender = true,
    trackEvents = true,
    trackEffects = true,
    autoStartMonitoring = false,
  } = options;

  // Références pour le tracking
  const renderStartTime = useRef(0);
  const mountTime = useRef(0);
  const renderCount = useRef(0);
  const renderTimes = useRef([]);
  const isInitialRender = useRef(true);

  // État pour forcer des re-renders lors de la mise à jour des références
  const [_, setRenderCount] = useState(0);

  // Initialiser le temps de début de render
  useEffect(() => {
    renderStartTime.current = performance.now();
  });

  // Démarrer la surveillance des performances si demandé
  useEffect(() => {
    if (autoStartMonitoring && !performanceService.isMonitoring) {
      performanceService.startMonitoring();
    }

    return () => {
      // Ne pas arrêter le monitoring à la destruction du composant
      // car d'autres composants pourraient encore l'utiliser
    };
  }, [autoStartMonitoring]);

  // Mesurer le temps de montage du composant
  useEffect(() => {
    if (trackEffects) {
      mountTime.current = performance.now();

      return () => {
        const unmountTime = performance.now();
        const lifetimeDuration = unmountTime - mountTime.current;

        performanceService.recordLongTask(
          `${componentName} (lifetime)`,
          lifetimeDuration
        );
      };
    }
  }, [componentName, trackEffects]);

  // Mesurer le temps de render
  useEffect(() => {
    if (trackRender && renderStartTime.current > 0) {
      const renderTime = performance.now() - renderStartTime.current;
      renderTimes.current.push(renderTime);
      renderCount.current += 1;

      if (!isInitialRender.current) {
        performanceService.recordComponentRender(componentName, renderTime);
      } else {
        isInitialRender.current = false;
      }

      // Mise à jour du temps de début pour le prochain render
      renderStartTime.current = performance.now();
    }
  }, [trackRender, componentName]);

  // Fonction pour mesurer la performance d'une fonction
  const measureFn = useCallback(
    (fn, name) => {
      if (!trackEvents) return fn;

      return (...args) => {
        const eventName = name || `${componentName} event`;
        return performanceService.measure(() => fn(...args), eventName);
      };
    },
    [componentName, trackEvents]
  );

  // Fonction pour mesurer la performance d'une fonction asynchrone
  const measureAsyncFn = useCallback(
    (asyncFn, name) => {
      if (!trackEvents) return asyncFn;

      return async (...args) => {
        const eventName = name || `${componentName} async event`;
        return await performanceService.measureAsync(
          () => asyncFn(...args),
          eventName
        );
      };
    },
    [componentName, trackEvents]
  );

  // Fonction pour mesurer la performance d'un effet
  const measureEffect = useCallback(
    (effectFn, name) => {
      if (!trackEffects) return effectFn;

      return () => {
        const effectName = name || `${componentName} effect`;
        const startTime = performance.now();

        const cleanup = effectFn();
        const duration = performance.now() - startTime;

        performanceService.recordLongTask(effectName, duration);

        // Wrapper la fonction de cleanup si elle existe
        if (typeof cleanup === "function") {
          return () => {
            const cleanupStartTime = performance.now();
            cleanup();
            const cleanupDuration = performance.now() - cleanupStartTime;

            performanceService.recordLongTask(
              `${effectName} (cleanup)`,
              cleanupDuration
            );
          };
        }

        return cleanup;
      };
    },
    [componentName, trackEffects]
  );

  // Fonction pour enregistrer un appel API
  const trackApiCall = useCallback((endpoint, responseTime, success = true) => {
    performanceService.recordApiCall(endpoint, responseTime, success);
  }, []);

  // Construire l'objet rapport de performance
  const getPerformanceReport = useCallback(
    () => ({
      component: componentName,
      renderCount: renderCount.current,
      averageRenderTime: renderTimes.current.length
        ? renderTimes.current.reduce((sum, time) => sum + time, 0) /
          renderTimes.current.length
        : 0,
      lastRenderTime: renderTimes.current[renderTimes.current.length - 1] || 0,
      maxRenderTime: renderTimes.current.length
        ? Math.max(...renderTimes.current)
        : 0,
    }),
    [componentName, renderCount.current, renderTimes.current]
  );

  return {
    measureFn,
    measureAsyncFn,
    measureEffect,
    trackApiCall,
    renderCount: renderCount.current,
    renderTimes: renderTimes.current,
    getPerformanceReport,
    startMonitoring:
      performanceService.startMonitoring.bind(performanceService),
    stopMonitoring: performanceService.stopMonitoring.bind(performanceService),
    getMetrics: performanceService.getMetrics.bind(performanceService),
    analyzePerformance:
      performanceService.analyzePerformance.bind(performanceService),
  };
}

/**
 * Hook pour mesurer la performance d'une tâche spécifique
 * @param {string} taskName - Nom de la tâche
 * @returns {Function} Fonction pour mesurer une tâche
 */
export function usePerformanceTask(taskName) {
  return useCallback(
    (fn) => performanceService.measure(fn, taskName),
    [taskName]
  );
}

/**
 * Hook pour mesurer la performance d'une tâche asynchrone
 * @param {string} taskName - Nom de la tâche
 * @returns {Function} Fonction pour mesurer une tâche asynchrone
 */
export function usePerformanceTaskAsync(taskName) {
  return useCallback(
    async (asyncFn) => await performanceService.measureAsync(asyncFn, taskName),
    [taskName]
  );
}

/**
 * Hook pour mesurer la performance d'un appel API
 * @param {Object} options - Options supplémentaires
 * @returns {Function} Fonction pour effectuer et mesurer un appel API
 */
export function useApiPerformance(options = {}) {
  const { baseEndpoint = "" } = options;

  const trackFetch = useCallback(
    async (url, fetchOptions = {}) => {
      const endpoint = baseEndpoint + url;
      const startTime = performance.now();
      let success = true;

      try {
        const response = await fetch(endpoint, fetchOptions);
        success = response.ok;
        return response;
      } catch (error) {
        success = false;
        throw error;
      } finally {
        const duration = performance.now() - startTime;
        performanceService.recordApiCall(endpoint, duration, success);
      }
    },
    [baseEndpoint]
  );

  return { trackFetch };
}

export default usePerformance;
