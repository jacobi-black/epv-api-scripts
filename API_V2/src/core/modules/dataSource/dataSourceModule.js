/**
 * Module pour la gestion des sources de données
 * Gère le chargement, la validation et la transformation des données
 */

import { registerModule } from "../../state/store";

// Types d'actions
export const DATA_SOURCE_TYPES = {
  // Actions de gestion des sources
  ADD_SOURCE: "dataSource/ADD_SOURCE",
  REMOVE_SOURCE: "dataSource/REMOVE_SOURCE",
  UPDATE_SOURCE: "dataSource/UPDATE_SOURCE",
  SET_ACTIVE_SOURCE: "dataSource/SET_ACTIVE_SOURCE",

  // Actions de chargement de données
  LOAD_REQUEST: "dataSource/LOAD_REQUEST",
  LOAD_SUCCESS: "dataSource/LOAD_SUCCESS",
  LOAD_FAILURE: "dataSource/LOAD_FAILURE",

  // Actions de transformation des données
  TRANSFORM_DATA: "dataSource/TRANSFORM_DATA",

  // Actions de validation
  VALIDATE_SOURCE: "dataSource/VALIDATE_SOURCE",
  VALIDATION_RESULT: "dataSource/VALIDATION_RESULT",

  // Actions de métadonnées
  UPDATE_METADATA: "dataSource/UPDATE_METADATA",

  // Actions d'état de synchronisation
  SET_SYNCED: "dataSource/SET_SYNCED",
  SET_DIRTY: "dataSource/SET_DIRTY",
};

// État initial
const initialState = {
  sources: {},
  activeSourceId: null,
  loading: false,
  error: null,
  data: {},
  metadata: {},
  transformations: {},
  validationResults: {},
  syncStatus: {},
};

/**
 * Reducer pour le module dataSource
 */
function dataSourceReducer(state = initialState, action) {
  switch (action.type) {
    case DATA_SOURCE_TYPES.ADD_SOURCE:
      return {
        ...state,
        sources: {
          ...state.sources,
          [action.payload.id]: {
            ...action.payload,
            createdAt: new Date().toISOString(),
          },
        },
        // Si c'est la première source, la définir comme active
        activeSourceId: state.activeSourceId || action.payload.id,
      };

    case DATA_SOURCE_TYPES.REMOVE_SOURCE: {
      const { [action.payload]: removedSource, ...remainingSources } =
        state.sources;

      // Si la source supprimée était active, définir la première source disponible comme active
      let newActiveSourceId = state.activeSourceId;
      if (state.activeSourceId === action.payload) {
        const sourceIds = Object.keys(remainingSources);
        newActiveSourceId = sourceIds.length > 0 ? sourceIds[0] : null;
      }

      return {
        ...state,
        sources: remainingSources,
        activeSourceId: newActiveSourceId,
      };
    }

    case DATA_SOURCE_TYPES.UPDATE_SOURCE: {
      const { id, updates } = action.payload;

      // Vérifier que la source existe
      if (!state.sources[id]) {
        console.warn(
          `Tentative de mise à jour d'une source inexistante: ${id}`
        );
        return state;
      }

      return {
        ...state,
        sources: {
          ...state.sources,
          [id]: {
            ...state.sources[id],
            ...updates,
            updatedAt: new Date().toISOString(),
          },
        },
      };
    }

    case DATA_SOURCE_TYPES.SET_ACTIVE_SOURCE:
      return {
        ...state,
        activeSourceId: action.payload,
      };

    case DATA_SOURCE_TYPES.LOAD_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case DATA_SOURCE_TYPES.LOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        data: {
          ...state.data,
          [action.payload.sourceId]: action.payload.data,
        },
        metadata: {
          ...state.metadata,
          [action.payload.sourceId]: {
            ...state.metadata[action.payload.sourceId],
            lastLoaded: new Date().toISOString(),
            rowCount: Array.isArray(action.payload.data)
              ? action.payload.data.length
              : 0,
            ...(action.payload.metadata || {}),
          },
        },
        syncStatus: {
          ...state.syncStatus,
          [action.payload.sourceId]: "synced",
        },
      };

    case DATA_SOURCE_TYPES.LOAD_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
        metadata: {
          ...state.metadata,
          [action.payload.sourceId]: {
            ...state.metadata[action.payload.sourceId],
            lastError: action.payload.error,
            lastErrorTime: new Date().toISOString(),
          },
        },
      };

    case DATA_SOURCE_TYPES.TRANSFORM_DATA:
      const { sourceId, transformationId, transformedData } = action.payload;
      return {
        ...state,
        transformations: {
          ...state.transformations,
          [sourceId]: {
            ...state.transformations[sourceId],
            [transformationId]: transformedData,
          },
        },
      };

    case DATA_SOURCE_TYPES.VALIDATE_SOURCE:
      return {
        ...state,
        validationResults: {
          ...state.validationResults,
          [action.payload.sourceId]: {
            ...state.validationResults[action.payload.sourceId],
            inProgress: true,
            lastValidated: new Date().toISOString(),
          },
        },
      };

    case DATA_SOURCE_TYPES.VALIDATION_RESULT:
      return {
        ...state,
        validationResults: {
          ...state.validationResults,
          [action.payload.sourceId]: {
            inProgress: false,
            results: action.payload.results,
            valid: action.payload.valid,
            lastValidated: new Date().toISOString(),
          },
        },
      };

    case DATA_SOURCE_TYPES.UPDATE_METADATA:
      return {
        ...state,
        metadata: {
          ...state.metadata,
          [action.payload.sourceId]: {
            ...state.metadata[action.payload.sourceId],
            ...action.payload.metadata,
          },
        },
      };

    case DATA_SOURCE_TYPES.SET_SYNCED:
      return {
        ...state,
        syncStatus: {
          ...state.syncStatus,
          [action.payload.sourceId]: "synced",
        },
      };

    case DATA_SOURCE_TYPES.SET_DIRTY:
      return {
        ...state,
        syncStatus: {
          ...state.syncStatus,
          [action.payload.sourceId]: "dirty",
        },
      };

    default:
      return state;
  }
}

/**
 * Action creators pour le module dataSource
 */
export const dataSourceActions = {
  // Actions pour les sources
  addSource: (source) => ({
    type: DATA_SOURCE_TYPES.ADD_SOURCE,
    payload: source,
  }),

  removeSource: (sourceId) => ({
    type: DATA_SOURCE_TYPES.REMOVE_SOURCE,
    payload: sourceId,
  }),

  updateSource: (id, updates) => ({
    type: DATA_SOURCE_TYPES.UPDATE_SOURCE,
    payload: { id, updates },
  }),

  setActiveSource: (sourceId) => ({
    type: DATA_SOURCE_TYPES.SET_ACTIVE_SOURCE,
    payload: sourceId,
  }),

  // Actions pour le chargement des données
  loadData: (sourceId, config) => async (dispatch, getState) => {
    try {
      dispatch({
        type: DATA_SOURCE_TYPES.LOAD_REQUEST,
        payload: { sourceId, config },
      });

      const state = getState();
      const source = state.dataSource.sources[sourceId];

      if (!source) {
        throw new Error(`Source with id "${sourceId}" not found`);
      }

      // Trouver et utiliser le plugin approprié pour charger les données
      const pluginRegistry = await import("../../plugins/PluginRegistry").then(
        (m) => m.pluginRegistry
      );

      // Récupérer le plugin de source de données correspondant au type de la source
      const plugin = pluginRegistry.getPlugin(source.pluginId || source.type);

      if (!plugin) {
        throw new Error(`Plugin for source type "${source.type}" not found`);
      }

      // Appeler la méthode loadData du plugin
      const result = await plugin.loadData(source.data, {
        ...config,
        ...(source.config || {}),
      });

      // Vérifier si le résultat est valide
      if (!result) {
        throw new Error("Plugin returned invalid data");
      }

      // Extraire les données et métadonnées du résultat
      const data = result.data || result;
      const metadata = result.metadata || {};

      dispatch({
        type: DATA_SOURCE_TYPES.LOAD_SUCCESS,
        payload: { sourceId, data, metadata },
      });

      return { data, metadata };
    } catch (error) {
      console.error("Error loading data:", error);

      dispatch({
        type: DATA_SOURCE_TYPES.LOAD_FAILURE,
        payload: { sourceId, error: error.message || "Unknown error" },
      });

      throw error;
    }
  },

  // Actions pour la transformation des données
  transformData: (sourceId, transformationId, transformedData) => ({
    type: DATA_SOURCE_TYPES.TRANSFORM_DATA,
    payload: { sourceId, transformationId, transformedData },
  }),

  // Actions pour la validation
  validateSource:
    (sourceId, validationConfig) => async (dispatch, getState) => {
      dispatch({
        type: DATA_SOURCE_TYPES.VALIDATE_SOURCE,
        payload: { sourceId, validationConfig },
      });

      try {
        const state = getState();
        const source = state.dataSource.sources[sourceId];
        const data = state.dataSource.data[sourceId];

        if (!source || !data) {
          throw new Error(`Source with id "${sourceId}" or its data not found`);
        }

        // Logique de validation (à implémenter dans un service)
        // Pour l'instant, nous utilisons une simple validation factice
        const validationResults = { valid: true, errors: [] };

        // Exemple de validation de base (à remplacer par une vraie validation)
        if (!Array.isArray(data) || data.length === 0) {
          validationResults.valid = false;
          validationResults.errors.push("Data must be a non-empty array");
        }

        dispatch({
          type: DATA_SOURCE_TYPES.VALIDATION_RESULT,
          payload: {
            sourceId,
            results: validationResults,
            valid: validationResults.valid,
          },
        });

        return validationResults;
      } catch (error) {
        console.error("Error validating source:", error);

        dispatch({
          type: DATA_SOURCE_TYPES.VALIDATION_RESULT,
          payload: {
            sourceId,
            results: {
              valid: false,
              errors: [error.message || "Unknown error"],
            },
            valid: false,
          },
        });

        throw error;
      }
    },

  // Actions pour les métadonnées
  updateMetadata: (sourceId, metadata) => ({
    type: DATA_SOURCE_TYPES.UPDATE_METADATA,
    payload: { sourceId, metadata },
  }),

  // Actions pour l'état de synchronisation
  setSynced: (sourceId) => ({
    type: DATA_SOURCE_TYPES.SET_SYNCED,
    payload: { sourceId },
  }),

  setDirty: (sourceId) => ({
    type: DATA_SOURCE_TYPES.SET_DIRTY,
    payload: { sourceId },
  }),
};

// Enregistrer le module dans le store global
registerModule("dataSource", dataSourceReducer, initialState);

export default {
  actions: dataSourceActions,
  types: DATA_SOURCE_TYPES,
};
