/**
 * Système de gestion des plugins pour l'application
 * Permet l'enregistrement, la configuration et l'utilisation de plugins
 * pour étendre les fonctionnalités de l'application
 */

// Types de plugins supportés
export const PLUGIN_TYPES = {
  DATA_SOURCE: "dataSource",
  UI_COMPONENT: "uiComponent",
  DATA_PROCESSOR: "dataProcessor",
  EXPORT: "export",
};

/**
 * Classe principale de gestion des plugins
 */
class PluginRegistry {
  constructor() {
    // Maps pour stocker les différents types de plugins
    this.plugins = new Map();
    this.dataSourcePlugins = new Map();
    this.uiPlugins = new Map();
    this.processorPlugins = new Map();
    this.exportPlugins = new Map();

    // Maps pour les hooks de plugins
    this.hooks = {
      onInit: new Map(),
      onDataLoad: new Map(),
      onDataTransform: new Map(),
      onExport: new Map(),
      onError: new Map(),
      onConfigChange: new Map(),
    };

    // État d'initialisation
    this.initialized = false;
  }

  /**
   * Enregistre un nouveau plugin dans le registre
   * @param {Object} plugin - Plugin à enregistrer
   * @returns {boolean} Succès de l'enregistrement
   */
  registerPlugin(plugin) {
    // Vérifier que le plugin a les propriétés requises
    if (!this._validatePlugin(plugin)) {
      console.error(`Plugin validation failed: ${plugin.id || "unknown"}`);
      return false;
    }

    // Vérifier si un plugin avec cet ID existe déjà
    if (this.plugins.has(plugin.id)) {
      console.warn(`Plugin ${plugin.id} already registered`);
      return false;
    }

    // Ajouter le plugin au registre général
    this.plugins.set(plugin.id, plugin);

    // Ajouter le plugin au registre spécifique selon son type
    switch (plugin.type) {
      case PLUGIN_TYPES.DATA_SOURCE:
        this.dataSourcePlugins.set(plugin.id, plugin);
        break;
      case PLUGIN_TYPES.UI_COMPONENT:
        this.uiPlugins.set(plugin.id, plugin);
        break;
      case PLUGIN_TYPES.DATA_PROCESSOR:
        this.processorPlugins.set(plugin.id, plugin);
        break;
      case PLUGIN_TYPES.EXPORT:
        this.exportPlugins.set(plugin.id, plugin);
        break;
      default:
        console.warn(`Unknown plugin type: ${plugin.type}`);
    }

    // Enregistrer les hooks du plugin
    this._registerPluginHooks(plugin);

    console.log(`Plugin ${plugin.id} registered successfully`);
    return true;
  }

  /**
   * Active un plugin
   * @param {string} pluginId - ID du plugin à activer
   * @returns {boolean} Succès de l'activation
   */
  enablePlugin(pluginId) {
    const plugin = this.plugins.get(pluginId);

    if (!plugin) {
      console.error(`Plugin ${pluginId} not found`);
      return false;
    }

    plugin.enabled = true;

    // Exécuter le hook onInit si le plugin n'a pas été initialisé
    if (this.initialized && !plugin.initialized && plugin.initialize) {
      try {
        plugin.initialize();
        plugin.initialized = true;
      } catch (error) {
        console.error(`Error initializing plugin ${pluginId}:`, error);
        plugin.enabled = false;
        return false;
      }
    }

    console.log(`Plugin ${pluginId} enabled`);
    return true;
  }

  /**
   * Désactive un plugin
   * @param {string} pluginId - ID du plugin à désactiver
   * @returns {boolean} Succès de la désactivation
   */
  disablePlugin(pluginId) {
    const plugin = this.plugins.get(pluginId);

    if (!plugin) {
      console.error(`Plugin ${pluginId} not found`);
      return false;
    }

    plugin.enabled = false;

    // Exécuter le hook de nettoyage si défini
    if (plugin.cleanup && typeof plugin.cleanup === "function") {
      try {
        plugin.cleanup();
      } catch (error) {
        console.error(`Error cleaning up plugin ${pluginId}:`, error);
      }
    }

    console.log(`Plugin ${pluginId} disabled`);
    return true;
  }

  /**
   * Récupère un plugin par son ID
   * @param {string} pluginId - ID du plugin
   * @returns {Object|null} Le plugin ou null si non trouvé
   */
  getPlugin(pluginId) {
    return this.plugins.get(pluginId) || null;
  }

  /**
   * Récupère tous les plugins d'un type spécifique
   * @param {string} type - Type de plugins à récupérer
   * @returns {Array} Tableau de plugins
   */
  getPluginsByType(type) {
    switch (type) {
      case PLUGIN_TYPES.DATA_SOURCE:
        return Array.from(this.dataSourcePlugins.values());
      case PLUGIN_TYPES.UI_COMPONENT:
        return Array.from(this.uiPlugins.values());
      case PLUGIN_TYPES.DATA_PROCESSOR:
        return Array.from(this.processorPlugins.values());
      case PLUGIN_TYPES.EXPORT:
        return Array.from(this.exportPlugins.values());
      default:
        return [];
    }
  }

  /**
   * Récupère tous les plugins actifs
   * @returns {Array} Tableau de plugins actifs
   */
  getEnabledPlugins() {
    return Array.from(this.plugins.values()).filter((plugin) => plugin.enabled);
  }

  /**
   * Supprime un plugin du registre
   * @param {string} pluginId - ID du plugin à supprimer
   * @returns {boolean} Succès de la suppression
   */
  removePlugin(pluginId) {
    const plugin = this.plugins.get(pluginId);

    if (!plugin) {
      console.error(`Plugin ${pluginId} not found`);
      return false;
    }

    // Exécuter le hook de nettoyage si défini
    if (plugin.cleanup && typeof plugin.cleanup === "function") {
      try {
        plugin.cleanup();
      } catch (error) {
        console.error(`Error cleaning up plugin ${pluginId}:`, error);
      }
    }

    // Supprimer le plugin de tous les registres
    this.plugins.delete(pluginId);

    switch (plugin.type) {
      case PLUGIN_TYPES.DATA_SOURCE:
        this.dataSourcePlugins.delete(pluginId);
        break;
      case PLUGIN_TYPES.UI_COMPONENT:
        this.uiPlugins.delete(pluginId);
        break;
      case PLUGIN_TYPES.DATA_PROCESSOR:
        this.processorPlugins.delete(pluginId);
        break;
      case PLUGIN_TYPES.EXPORT:
        this.exportPlugins.delete(pluginId);
        break;
    }

    // Supprimer les hooks du plugin
    for (const hookType in this.hooks) {
      if (this.hooks.hasOwnProperty(hookType)) {
        this.hooks[hookType].delete(pluginId);
      }
    }

    console.log(`Plugin ${pluginId} removed successfully`);
    return true;
  }

  /**
   * Exécute un hook spécifique pour tous les plugins qui l'implémentent
   * @param {string} hookName - Nom du hook à exécuter
   * @param {any} data - Données à passer au hook
   * @returns {Array} Résultats de l'exécution du hook
   */
  executeHook(hookName, data) {
    if (!this.hooks[hookName]) {
      console.warn(`Hook ${hookName} not registered`);
      return [];
    }

    const results = [];

    // Exécuter le hook pour chaque plugin qui l'implémente
    for (const [pluginId, hookFn] of this.hooks[hookName].entries()) {
      const plugin = this.plugins.get(pluginId);

      // Ignorer les plugins désactivés
      if (!plugin || !plugin.enabled) {
        continue;
      }

      try {
        const result = hookFn(data, plugin);
        results.push({ pluginId, result });
      } catch (error) {
        console.error(
          `Error executing ${hookName} for plugin ${pluginId}:`,
          error
        );

        // Exécuter le hook onError si défini
        if (this.hooks.onError.has(pluginId)) {
          try {
            this.hooks.onError.get(pluginId)(
              {
                error,
                hookName,
                data,
              },
              plugin
            );
          } catch (errorHandlingError) {
            console.error(
              `Error in error handler for plugin ${pluginId}:`,
              errorHandlingError
            );
          }
        }
      }
    }

    return results;
  }

  /**
   * Récupère un processeur de données d'un plugin
   * @param {string} pluginId - ID du plugin
   * @param {string} processorName - Nom du processeur
   * @returns {Function|null} Fonction de traitement ou null si non trouvée
   */
  getDataProcessor(pluginId, processorName) {
    const plugin = this.plugins.get(pluginId);

    if (
      !plugin ||
      !plugin.enabled ||
      plugin.type !== PLUGIN_TYPES.DATA_PROCESSOR
    ) {
      return null;
    }

    return plugin.processors && plugin.processors[processorName];
  }

  /**
   * Récupère un composant UI d'un plugin
   * @param {string} pluginId - ID du plugin
   * @param {string} componentName - Nom du composant
   * @returns {React.Component|null} Composant React ou null si non trouvé
   */
  getUIComponent(pluginId, componentName) {
    const plugin = this.plugins.get(pluginId);

    if (
      !plugin ||
      !plugin.enabled ||
      plugin.type !== PLUGIN_TYPES.UI_COMPONENT
    ) {
      return null;
    }

    return plugin.components && plugin.components[componentName];
  }

  /**
   * Initialise tous les plugins enregistrés
   * @returns {boolean} Succès de l'initialisation
   */
  initialize() {
    if (this.initialized) {
      console.warn("Plugin registry already initialized");
      return true;
    }

    let success = true;

    // Initialiser chaque plugin activé
    for (const plugin of this.plugins.values()) {
      if (!plugin.enabled) {
        continue;
      }

      if (plugin.initialize && typeof plugin.initialize === "function") {
        try {
          plugin.initialize();
          plugin.initialized = true;
        } catch (error) {
          console.error(`Error initializing plugin ${plugin.id}:`, error);
          plugin.enabled = false;
          success = false;
        }
      } else {
        plugin.initialized = true;
      }
    }

    this.initialized = true;
    console.log("Plugin registry initialized");
    return success;
  }

  /**
   * Vérifie qu'un plugin a la structure requise
   * @param {Object} plugin - Plugin à valider
   * @returns {boolean} Validité du plugin
   * @private
   */
  _validatePlugin(plugin) {
    // Vérifier les propriétés obligatoires
    if (!plugin.id || typeof plugin.id !== "string") {
      console.error("Plugin must have a string id");
      return false;
    }

    if (!plugin.type || !Object.values(PLUGIN_TYPES).includes(plugin.type)) {
      console.error(`Plugin ${plugin.id} has invalid type: ${plugin.type}`);
      return false;
    }

    if (!plugin.name || typeof plugin.name !== "string") {
      console.error(`Plugin ${plugin.id} must have a string name`);
      return false;
    }

    if (!plugin.version || typeof plugin.version !== "string") {
      console.error(`Plugin ${plugin.id} must have a string version`);
      return false;
    }

    // Vérifications spécifiques selon le type
    switch (plugin.type) {
      case PLUGIN_TYPES.DATA_SOURCE:
        if (!plugin.loadData || typeof plugin.loadData !== "function") {
          console.error(
            `Data source plugin ${plugin.id} must have a loadData function`
          );
          return false;
        }
        break;

      case PLUGIN_TYPES.UI_COMPONENT:
        if (!plugin.components || typeof plugin.components !== "object") {
          console.error(
            `UI Component plugin ${plugin.id} must have a components object`
          );
          return false;
        }
        break;

      case PLUGIN_TYPES.DATA_PROCESSOR:
        if (!plugin.processors || typeof plugin.processors !== "object") {
          console.error(
            `Data processor plugin ${plugin.id} must have a processors object`
          );
          return false;
        }
        break;

      case PLUGIN_TYPES.EXPORT:
        if (!plugin.export || typeof plugin.export !== "function") {
          console.error(
            `Export plugin ${plugin.id} must have an export function`
          );
          return false;
        }
        break;
    }

    // Définir les valeurs par défaut
    plugin.enabled = plugin.enabled !== false;
    plugin.initialized = false;

    return true;
  }

  /**
   * Enregistre les hooks d'un plugin
   * @param {Object} plugin - Plugin dont les hooks doivent être enregistrés
   * @private
   */
  _registerPluginHooks(plugin) {
    // Enregistrer les hooks si définis
    for (const hookName in this.hooks) {
      if (
        this.hooks.hasOwnProperty(hookName) &&
        plugin[hookName] &&
        typeof plugin[hookName] === "function"
      ) {
        this.hooks[hookName].set(plugin.id, plugin[hookName].bind(plugin));
      }
    }
  }
}

// Exporter une instance singleton pour utilisation dans l'application
export const pluginRegistry = new PluginRegistry();

// Exporter la classe pour les tests
export default PluginRegistry;
