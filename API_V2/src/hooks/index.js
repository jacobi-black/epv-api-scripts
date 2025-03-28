// Exporter tous les hooks customisés
import useDataFetching, { useMultiDataFetching } from "./useDataFetching";
import useToggle from "./useToggle";
import useLocalStorage from "./useLocalStorage";
import useWindowSize from "./useWindowSize";
import useMediaQuery from "./useMediaQuery";
import useDebounce from "./useDebounce";
import usePrevious from "./usePrevious";

// Exporter les hooks par défaut
export {
  useDataFetching,
  useMultiDataFetching,
  useToggle,
  useLocalStorage,
  useWindowSize,
  useMediaQuery,
  useDebounce,
  usePrevious,
};

/**
 * Hooks liés au chargement des données
 */
export const dataHooks = {
  useDataFetching,
  useMultiDataFetching,
};

/**
 * Hooks d'interface utilisateur
 */
export const uiHooks = {
  useToggle,
  useWindowSize,
  useMediaQuery,
  useDebounce,
};

/**
 * Hooks de persistance
 */
export const storageHooks = {
  useLocalStorage,
};

/**
 * Hooks d'utilité
 */
export const utilityHooks = {
  usePrevious,
};

export default {
  dataHooks,
  uiHooks,
  storageHooks,
  utilityHooks,
};
