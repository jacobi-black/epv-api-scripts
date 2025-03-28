/**
 * Plugin de source de données pour l'importation de fichiers CSV
 * Fournit des fonctionnalités pour charger, parser et valider des données CSV
 */

import Papa from "papaparse";
import { PLUGIN_TYPES } from "../PluginRegistry";

/**
 * Plugin pour l'importation et l'exportation de données CSV
 */
const CsvDataSourcePlugin = {
  // Métadonnées du plugin
  id: "cyberark-csv-datasource",
  name: "CyberArk CSV Data Source",
  description: "Plugin pour importer des données depuis des fichiers CSV",
  version: "1.0.0",
  author: "CyberArk",
  type: PLUGIN_TYPES.DATA_SOURCE,

  // Formats supportés
  supportedFormats: ["csv", "text/csv"],

  // Configuration par défaut
  defaultConfig: {
    delimiter: ",",
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    comments: "#",
    trimHeaders: true,
    transform: undefined,
  },

  // Configuration actuelle
  config: null,

  /**
   * Initialisation du plugin
   */
  initialize() {
    this.config = { ...this.defaultConfig };
    console.log(`${this.name} initialisé avec la configuration par défaut`);
  },

  /**
   * Configure le plugin avec de nouveaux paramètres
   * @param {Object} config - Nouvelle configuration
   */
  configure(config) {
    this.config = {
      ...this.defaultConfig,
      ...config,
    };
    console.log(`${this.name} reconfiguré avec de nouveaux paramètres`);
  },

  /**
   * Charge les données depuis une source CSV
   * @param {File|string} source - Fichier CSV ou contenu CSV en chaîne
   * @param {Object} options - Options supplémentaires pour le parsing
   * @returns {Promise<Object>} Données parsées avec métadonnées
   */
  async loadData(source, options = {}) {
    // Vérifier si la source est valide
    if (!source) {
      throw new Error("Source CSV non spécifiée");
    }

    // Options de parsing
    const parseOptions = {
      ...this.config,
      ...options,
    };

    try {
      let result;

      // Parser selon le type de source
      if (typeof source === "string") {
        // Source est une chaîne CSV
        result = await this._parseFromString(source, parseOptions);
      } else if (source instanceof File) {
        // Source est un objet File
        if (!this.validateFile(source)) {
          throw new Error("Format de fichier non supporté");
        }
        result = await this._parseFromFile(source, parseOptions);
      } else {
        throw new Error(
          "Type de source non supporté. Utilisez une chaîne ou un objet File"
        );
      }

      return this._processResults(result);
    } catch (error) {
      console.error("Erreur lors du parsing CSV:", error);
      throw error;
    }
  },

  /**
   * Vérifie si un fichier est un CSV valide
   * @param {File} file - Fichier à vérifier
   * @returns {boolean} Validité du fichier
   */
  validateFile(file) {
    if (!file) return false;

    // Vérifier l'extension
    const extension = file.name.split(".").pop().toLowerCase();
    if (extension !== "csv") return false;

    // Vérifier le type MIME
    if (
      file.type &&
      !["text/csv", "application/csv", "text/plain"].includes(file.type)
    ) {
      return false;
    }

    return true;
  },

  /**
   * Extrait les informations de schéma d'un fichier CSV
   * @param {File|string} source - Fichier CSV ou contenu CSV
   * @returns {Promise<Object>} Informations sur le schéma
   */
  async getSchema(source) {
    try {
      // Charger un échantillon des données pour déterminer le schéma
      const parseResult = await this.loadData(source, { preview: 5 });
      const data = parseResult.data;

      if (!data || !data.length) {
        return { fields: [], sample: [] };
      }

      // Analyser la première ligne pour déterminer les types
      const columns = Object.keys(data[0]);
      const sampleRow = data[0];

      const fields = columns.map((col) => {
        // Collecter les types de données pour cette colonne
        const types = data
          .map((row) => typeof row[col])
          .filter((value, index, self) => self.indexOf(value) === index);

        // Déterminer si la colonne peut être null
        const hasNulls = data.some(
          (row) => row[col] === null || row[col] === undefined
        );

        return {
          name: col,
          type: this._getMostCommonType(types),
          nullable: hasNulls,
          sample: sampleRow[col],
        };
      });

      return {
        fields,
        sample: data.slice(0, 3),
      };
    } catch (error) {
      console.error("Erreur lors de la récupération du schéma:", error);
      throw error;
    }
  },

  /**
   * Convertit des données en format CSV
   * @param {Array} data - Données à convertir
   * @param {Object} options - Options d'export
   * @returns {string} Contenu CSV
   */
  exportToCsv(data, options = {}) {
    if (!data || !Array.isArray(data)) {
      throw new Error("Les données à exporter doivent être un tableau");
    }

    const exportOptions = {
      ...this.config,
      ...options,
    };

    try {
      // Nettoyer les données de métadonnées avant l'export
      const cleanData = data.map((row) => {
        if (row && typeof row === "object") {
          // Création d'un nouvel objet sans la propriété _meta
          const { _meta, ...cleanRow } = row;
          return cleanRow;
        }
        return row;
      });

      return Papa.unparse(cleanData, exportOptions);
    } catch (error) {
      console.error("Erreur lors de l'export CSV:", error);
      throw error;
    }
  },

  /**
   * Hook appelé après le chargement des données
   * @param {Object} data - Données chargées
   * @returns {Object} Données potentiellement modifiées
   */
  onDataLoad(data) {
    // Ajouter des informations sur la source
    if (!data) return data;

    return {
      ...data,
      metadata: {
        sourceType: "csv",
        loadedAt: new Date().toISOString(),
        plugin: this.id,
        version: this.version,
      },
    };
  },

  /**
   * Parse un contenu CSV depuis une chaîne
   * @param {string} content - Contenu CSV
   * @param {Object} options - Options de parsing
   * @returns {Promise<Object>} Résultat du parsing
   * @private
   */
  _parseFromString(content, options) {
    return new Promise((resolve, reject) => {
      try {
        Papa.parse(content, {
          ...options,
          complete: (results) => {
            if (results.errors && results.errors.length > 0) {
              // Si les erreurs sont non-fatales, on continue avec un warning
              if (!results.data || results.data.length === 0) {
                reject(
                  new Error(
                    `Erreur de parsing CSV: ${results.errors[0].message}`
                  )
                );
                return;
              }
              console.warn("Warnings lors du parsing CSV:", results.errors);
            }
            resolve(results);
          },
          error: (error) => {
            reject(error);
          },
        });
      } catch (error) {
        reject(error);
      }
    });
  },

  /**
   * Parse un contenu CSV depuis un fichier
   * @param {File} file - Fichier CSV
   * @param {Object} options - Options de parsing
   * @returns {Promise<Object>} Résultat du parsing
   * @private
   */
  _parseFromFile(file, options) {
    return new Promise((resolve, reject) => {
      try {
        Papa.parse(file, {
          ...options,
          complete: (results) => {
            if (results.errors && results.errors.length > 0) {
              // Si les erreurs sont non-fatales, on continue avec un warning
              if (!results.data || results.data.length === 0) {
                reject(
                  new Error(
                    `Erreur de parsing du fichier CSV: ${results.errors[0].message}`
                  )
                );
                return;
              }
              console.warn(
                "Warnings lors du parsing du fichier CSV:",
                results.errors
              );
            }
            resolve(results);
          },
          error: (error) => {
            reject(error);
          },
        });
      } catch (error) {
        reject(error);
      }
    });
  },

  /**
   * Traite les résultats du parsing
   * @param {Object} result - Résultat du parsing
   * @returns {Object} Données traitées avec métadonnées séparées
   * @private
   */
  _processResults(result) {
    if (!result || !result.data) {
      return { data: [], metadata: {} };
    }

    const data = result.data;

    // Créer un objet de métadonnées séparé au lieu de modifier le tableau de données directement
    const metadata = {
      rowCount: data.length,
      fields: result.meta && result.meta.fields ? result.meta.fields : [],
      errors: result.errors || [],
      delimiter: result.meta && result.meta.delimiter,
      importedAt: new Date().toISOString(),
    };

    return {
      data,
      metadata,
    };
  },

  /**
   * Détermine le type de données le plus courant dans un tableau de types
   * @param {Array<string>} types - Types à analyser
   * @returns {string} Type le plus commun
   * @private
   */
  _getMostCommonType(types) {
    if (!types || types.length === 0) return "unknown";

    // Si un seul type, le retourner
    if (types.length === 1) return types[0];

    // Compter les occurrences de chaque type
    const typeCounts = types.reduce((counts, type) => {
      counts[type] = (counts[type] || 0) + 1;
      return counts;
    }, {});

    // Trouver le type avec le plus d'occurrences
    let maxCount = 0;
    let maxType = "unknown";

    for (const type in typeCounts) {
      if (typeCounts[type] > maxCount) {
        maxCount = typeCounts[type];
        maxType = type;
      }
    }

    return maxType;
  },
};

export default CsvDataSourcePlugin;
