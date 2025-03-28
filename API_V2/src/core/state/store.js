/**
 * Système de gestion d'état global et modulaire pour l'application
 * Implémente un pattern proche de Redux mais avec une architecture
 * adaptée aux besoins spécifiques de l'application
 */

import {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useCallback,
} from "react";

// Gestion du Store principal
let storeModules = {};
let combinedReducer = null;
let storeInstance = null;

// État initial global par défaut
const defaultInitialState = {
  app: {
    theme: "light",
    sidebarOpen: true,
    loading: false,
    error: null,
    notifications: [],
  },
};

// Reducer pour l'état global de l'application par défaut
const appReducer = (state = defaultInitialState.app, action) => {
  switch (action.type) {
    case "SET_THEME":
      return { ...state, theme: action.payload };
    case "TOGGLE_SIDEBAR":
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [
          ...state.notifications,
          {
            id: Date.now(),
            ...action.payload,
          },
        ],
      };
    case "REMOVE_NOTIFICATION":
      return {
        ...state,
        notifications: state.notifications.filter(
          (n) => n.id !== action.payload
        ),
      };
    case "CLEAR_NOTIFICATIONS":
      return { ...state, notifications: [] };
    default:
      return state;
  }
};

/**
 * Création d'un nouveau store
 * @returns {Object} Le store global
 */
export function createStore() {
  if (storeInstance) {
    return storeInstance;
  }

  // Enregistrer le module app par défaut
  storeModules = {
    app: {
      reducer: appReducer,
      initialState: defaultInitialState.app,
    },
  };

  // Créer le reducer combiné pour tous les modules
  combinedReducer = combineReducers(storeModules);

  // Créer l'instance du store avec l'état initial
  const initialState = getMergedInitialState();

  // Créer l'instance du store
  storeInstance = {
    getState: () => initialState,
    registerModule,
    unregisterModule,
    dispatch: (action) => {
      console.warn("Store not connected to a provider yet");
      return action;
    },
  };

  return storeInstance;
}

/**
 * Combine plusieurs reducers en un seul
 * @param {Object} modules - Modules de store à combiner
 * @returns {Function} Reducer combiné
 */
function combineReducers(modules) {
  return (state = {}, action) => {
    const newState = {};
    let hasChanged = false;

    for (const key in modules) {
      if (Object.prototype.hasOwnProperty.call(modules, key)) {
        const previousStateForKey = state[key] || modules[key].initialState;
        const nextStateForKey = modules[key].reducer(
          previousStateForKey,
          action
        );

        newState[key] = nextStateForKey;
        hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
      }
    }

    return hasChanged ? newState : state;
  };
}

/**
 * Récupère l'état initial fusionné de tous les modules
 * @returns {Object} État initial fusionné
 */
function getMergedInitialState() {
  const mergedState = {};

  for (const key in storeModules) {
    if (Object.prototype.hasOwnProperty.call(storeModules, key)) {
      mergedState[key] = storeModules[key].initialState;
    }
  }

  return mergedState;
}

/**
 * Enregistre un nouveau module dans le store
 * @param {string} name - Nom du module
 * @param {Function} reducer - Reducer du module
 * @param {Object} initialState - État initial du module
 */
export function registerModule(name, reducer, initialState = {}) {
  if (!storeInstance) {
    createStore();
  }

  if (storeModules[name]) {
    console.warn(`Module "${name}" est déjà enregistré dans le store`);
    return;
  }

  // Enregistrer le nouveau module
  storeModules[name] = {
    reducer,
    initialState,
  };

  // Mettre à jour le reducer combiné
  combinedReducer = combineReducers(storeModules);

  // Mettre à jour l'état initial global
  const newInitialState = getMergedInitialState();

  // Mettre à jour le store
  storeInstance.getState = () => newInitialState;

  console.log(`Module "${name}" enregistré dans le store`);
}

/**
 * Supprime un module du store
 * @param {string} name - Nom du module à supprimer
 */
export function unregisterModule(name) {
  if (!storeInstance) {
    createStore();
  }

  if (!storeModules[name]) {
    console.warn(`Module "${name}" n'est pas enregistré dans le store`);
    return;
  }

  // Supprimer le module
  const { [name]: removedModule, ...remainingModules } = storeModules;
  storeModules = remainingModules;

  // Mettre à jour le reducer combiné
  combinedReducer = combineReducers(storeModules);

  // Mettre à jour l'état global
  const newState = getMergedInitialState();
  storeInstance.getState = () => newState;

  console.log(`Module "${name}" supprimé du store`);
}

// Créer le contexte React pour le store
export const StoreContext = createContext(null);

/**
 * Provider React pour le store global
 * @param {Object} props - Props du composant
 * @returns {React.Component} Provider du store
 */
export function StoreProvider({ children, initialState = {} }) {
  // S'assurer que le store est créé
  if (!storeInstance) {
    createStore();
  }

  // Fusionner l'état initial avec celui des modules
  const mergedInitialState = Object.keys(storeModules).reduce(
    (acc, key) => ({
      ...acc,
      [key]: {
        ...storeModules[key].initialState,
        ...(initialState[key] || {}),
      },
    }),
    {}
  );

  // Créer le reducer et l'état global
  const [state, dispatch] = useReducer(combinedReducer, mergedInitialState);

  // Mettre à jour la fonction getState du store
  storeInstance.getState = () => state;
  storeInstance.dispatch = dispatch;

  // Mémoriser le contexte pour éviter des re-renders inutiles
  const contextValue = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
}

/**
 * Hook pour accéder au store global
 * @returns {Object} État global et fonction dispatch
 */
export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error(
      "useStore doit être utilisé à l'intérieur d'un StoreProvider"
    );
  }
  return context;
}

/**
 * Hook pour accéder à un module spécifique du store
 * @param {string} moduleName - Nom du module
 * @returns {Object} État du module et fonction dispatch
 */
export function useModule(moduleName) {
  const { state, dispatch } = useStore();

  if (!state[moduleName]) {
    console.warn(`Module "${moduleName}" n'existe pas dans le store`);
    return { state: {}, dispatch };
  }

  return { state: state[moduleName], dispatch };
}

/**
 * Hook pour créer un sélecteur mémoïsé
 * @param {Function} selectorFn - Fonction de sélection
 * @param {Array} deps - Dépendances additionnelles
 * @returns {any} Valeur sélectionnée
 */
export function useSelector(selectorFn, deps = []) {
  const { state } = useStore();
  return useMemo(() => selectorFn(state), [state, selectorFn, ...deps]);
}

/**
 * Hook pour créer des action creators mémoïsés
 * @param {Object} actionCreators - Fonctions créatrices d'actions
 * @returns {Object} Actions mémoïsées
 */
export function useActions(actionCreators) {
  const { dispatch } = useStore();

  return useMemo(() => {
    const boundActionCreators = {};

    for (const key in actionCreators) {
      if (Object.prototype.hasOwnProperty.call(actionCreators, key)) {
        boundActionCreators[key] = (...args) => {
          const action = actionCreators[key](...args);
          if (typeof action === "function") {
            // Support pour les actions asynchrones (type redux-thunk)
            return action(dispatch, storeInstance.getState);
          }
          return dispatch(action);
        };
      }
    }

    return boundActionCreators;
  }, [dispatch, actionCreators]);
}

/**
 * Crée un action creator asynchrone
 * @param {Function} asyncFn - Fonction asynchrone à exécuter
 * @param {Object} options - Options supplémentaires
 * @returns {Function} Action creator
 */
export function createAsyncAction(asyncFn, options = {}) {
  const {
    pending = "PENDING",
    fulfilled = "FULFILLED",
    rejected = "REJECTED",
    mapPending = (data) => data,
    mapFulfilled = (data) => data,
    mapRejected = (error) => error.message,
  } = options;

  return (...args) =>
    async (dispatch, getState) => {
      try {
        // Dispatche l'action pending
        dispatch({ type: pending, payload: mapPending(args) });

        // Exécute la fonction asynchrone
        const result = await asyncFn(...args);

        // Dispatche l'action fulfilled
        dispatch({ type: fulfilled, payload: mapFulfilled(result) });

        return result;
      } catch (error) {
        // Dispatche l'action rejected
        dispatch({ type: rejected, payload: mapRejected(error), error: true });

        throw error;
      }
    };
}

// Initialiser le store
createStore();
