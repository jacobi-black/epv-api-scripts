/**
 * Composant LazyLoader pour gérer le chargement différé des composants
 * Permet d'optimiser les performances en ne chargeant les composants
 * que lorsqu'ils sont nécessaires
 */

import React, { Suspense, useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import performanceService from "../services/PerformanceService";

// Composant de fallback par défaut
const DefaultFallback = ({ name }) => (
  <div className="lazy-loader-fallback">
    <div className="lazy-loader-spinner"></div>
    <div className="lazy-loader-text">
      Chargement {name ? `de ${name}` : "..."}
    </div>
  </div>
);

DefaultFallback.propTypes = {
  name: PropTypes.string,
};

/**
 * Composant pour charger de manière différée un composant React
 * @param {Object} props - Propriétés du composant
 * @param {React.LazyExoticComponent} props.component - Composant React à charger de manière différée (via React.lazy)
 * @param {React.ReactNode} props.fallback - Composant affiché pendant le chargement
 * @param {string} props.name - Nom du composant pour le tracking
 * @param {number} props.timeout - Délai en ms avant d'afficher une erreur de timeout
 * @param {Function} props.onLoad - Callback appelé quand le composant est chargé
 * @param {Function} props.onError - Callback appelé en cas d'erreur
 * @param {boolean} props.trackPerformance - Si true, mesure les performances de chargement
 * @param {Object} props.errorComponent - Composant à afficher en cas d'erreur
 * @returns {React.ReactElement} Composant lazy-loadé avec Suspense
 */
const LazyLoader = ({
  component: Component,
  fallback = null,
  name = "composant",
  timeout = 10000,
  onLoad,
  onError,
  trackPerformance = true,
  errorComponent: ErrorComponent = null,
  ...props
}) => {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  // Créer un fallback par défaut si non fourni
  const fallbackComponent = fallback || <DefaultFallback name={name} />;

  // Handler pour gérer le chargement réussi
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (onLoad) {
      onLoad();
    }
  }, [timeoutId, onLoad]);

  // Handler pour gérer les erreurs
  const handleError = useCallback(
    (err) => {
      setError(err);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (onError) {
        onError(err);
      }

      if (trackPerformance) {
        performanceService.recordLongTask(`LazyLoad Error: ${name}`, 0, false);
      }
    },
    [timeoutId, onError, name, trackPerformance]
  );

  // Mesurer le temps de chargement et gérer le timeout
  useEffect(() => {
    const startTime = performance.now();

    // Définir un timeout pour le chargement
    const id = setTimeout(() => {
      if (!isLoaded) {
        const timeoutError = new Error(
          `Timeout lors du chargement du composant ${name}`
        );
        handleError(timeoutError);
      }
    }, timeout);

    setTimeoutId(id);

    return () => {
      clearTimeout(id);

      // Mesurer le temps de chargement total si activé
      if (trackPerformance) {
        const loadTime = performance.now() - startTime;
        performanceService.recordLongTask(`LazyLoad: ${name}`, loadTime);
      }
    };
  }, [name, timeout, isLoaded, trackPerformance, handleError]);

  // Afficher le composant d'erreur si une erreur s'est produite
  if (error) {
    return ErrorComponent ? (
      <ErrorComponent
        error={error}
        componentName={name}
        retry={() => setError(null)}
      />
    ) : (
      <div className="lazy-loader-error">
        <h3>Erreur de chargement</h3>
        <p>
          Impossible de charger {name}: {error.message}
        </p>
        <button onClick={() => setError(null)}>Réessayer</button>
      </div>
    );
  }

  return (
    <Suspense fallback={fallbackComponent}>
      {/* Wrapper le composant paresseux pour capturer son chargement */}
      <LazyComponentWrapper
        component={Component}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </Suspense>
  );
};

/**
 * Composant interne pour détecter quand un composant lazy a été chargé
 */
const LazyComponentWrapper = ({
  component: Component,
  onLoad,
  onError,
  ...props
}) => {
  useEffect(() => {
    try {
      onLoad();
    } catch (err) {
      onError(err);
    }
  }, [onLoad, onError]);

  return <Component {...props} />;
};

LazyLoader.propTypes = {
  component: PropTypes.oneOfType([
    PropTypes.elementType,
    PropTypes.object, // Pour les composants React.lazy
  ]).isRequired,
  fallback: PropTypes.node,
  name: PropTypes.string,
  timeout: PropTypes.number,
  onLoad: PropTypes.func,
  onError: PropTypes.func,
  trackPerformance: PropTypes.bool,
  errorComponent: PropTypes.elementType,
};

LazyComponentWrapper.propTypes = {
  component: PropTypes.oneOfType([
    PropTypes.elementType,
    PropTypes.object, // Pour les composants React.lazy
  ]).isRequired,
  onLoad: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

export default LazyLoader;

/**
 * Fonction utilitaire pour créer un composant chargé de manière différée
 * @param {Function} importFn - Fonction d'import dynamique (ex: () => import('./MonComposant'))
 * @param {Object} options - Options pour LazyLoader
 * @returns {React.LazyExoticComponent} Composant différé
 */
export const createLazyComponent = (importFn, options = {}) => {
  const lazyComponent = React.lazy(importFn);

  return (props) => (
    <LazyLoader component={lazyComponent} {...options} {...props} />
  );
};
