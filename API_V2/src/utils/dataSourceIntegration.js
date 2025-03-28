/**
 * Utilitaires pour l'intégration avec les sources de données
 * Implémente le point 7.5 du roadmap - Intégration avec Sources de Données
 */

/**
 * Détecte automatiquement le format de données en analysant le contenu
 * @param {string} content - Contenu du fichier à analyser
 * @returns {Object} Information sur le format détecté et le type de données
 */
export const detectDataFormat = (content) => {
  if (!content) {
    return { format: "unknown", dataType: null, confidence: 0 };
  }

  // Extraire les 5 premières lignes pour l'analyse
  const lines = content.split("\n").slice(0, 5);
  const firstLine = lines[0].trim();
  const nonEmptyLines = lines.filter((line) => line.trim().length > 0);

  // Vérifier si c'est du CSV
  if (firstLine.includes(",") && nonEmptyLines.length > 1) {
    // Compter le nombre de virgules dans chaque ligne
    const commaCount = nonEmptyLines.map(
      (line) => (line.match(/,/g) || []).length
    );

    // Si toutes les lignes ont le même nombre de virgules, c'est probablement du CSV
    const isConsistentCSV =
      commaCount.every((count) => count === commaCount[0]) && commaCount[0] > 0;

    if (isConsistentCSV) {
      // Analyser les en-têtes pour détecter le type de données
      const headers = firstLine.split(",").map((h) => h.trim().toLowerCase());

      // Détection par mots-clés dans les en-têtes
      const dataType = detectDataTypeFromHeaders(headers);

      return {
        format: "csv",
        dataType,
        headers,
        confidence: 0.9,
        delimiter: ",",
      };
    }
  }

  // Vérifier si c'est du JSON
  if (
    (firstLine.startsWith("{") && content.trim().endsWith("}")) ||
    (firstLine.startsWith("[") && content.trim().endsWith("]"))
  ) {
    try {
      // Tenter de parser le JSON
      const parsedJson = JSON.parse(content);

      // Déterminer s'il s'agit d'un tableau ou d'un objet
      const isArray = Array.isArray(parsedJson);

      // Si c'est un tableau, examiner le premier élément pour le type de données
      let dataType = "unknown";
      if (isArray && parsedJson.length > 0) {
        const sampleObject = parsedJson[0];
        const keys = Object.keys(sampleObject).map((k) => k.toLowerCase());
        dataType = detectDataTypeFromHeaders(keys);
      }

      return {
        format: "json",
        dataType,
        isArray,
        sampleKeys:
          isArray && parsedJson.length > 0 ? Object.keys(parsedJson[0]) : [],
        confidence: 0.95,
      };
    } catch (e) {
      // Pas un JSON valide
      return {
        format: "unknown",
        dataType: null,
        confidence: 0,
        error: "Invalid JSON",
      };
    }
  }

  // Vérifier si c'est du TSV
  if (firstLine.includes("\t") && nonEmptyLines.length > 1) {
    const tabCount = nonEmptyLines.map(
      (line) => (line.match(/\t/g) || []).length
    );
    const isConsistentTSV =
      tabCount.every((count) => count === tabCount[0]) && tabCount[0] > 0;

    if (isConsistentTSV) {
      const headers = firstLine.split("\t").map((h) => h.trim().toLowerCase());
      const dataType = detectDataTypeFromHeaders(headers);

      return {
        format: "tsv",
        dataType,
        headers,
        confidence: 0.85,
        delimiter: "\t",
      };
    }
  }

  // Vérifier si c'est du XML
  if (firstLine.startsWith("<?xml") || firstLine.match(/<[^>]+>/)) {
    return { format: "xml", dataType: "unknown", confidence: 0.7 };
  }

  // Format inconnu
  return { format: "unknown", dataType: null, confidence: 0.3 };
};

/**
 * Détecte le type de données en analysant les en-têtes
 * @param {Array} headers - Liste des en-têtes de colonnes
 * @returns {string} Type de données détecté
 */
const detectDataTypeFromHeaders = (headers) => {
  // Mots-clés pour chaque type de données
  const keywordMap = {
    accounts: [
      "account",
      "username",
      "password",
      "platform",
      "safe",
      "address",
      "credential",
    ],
    safes: ["safe", "vault", "member", "owner", "cpm", "permission"],
    systemHealth: [
      "cpu",
      "memory",
      "disk",
      "health",
      "status",
      "component",
      "server",
    ],
    users: ["user", "member", "role", "permission", "authentication"],
    platforms: ["platform", "target", "policy", "connection"],
    sessions: ["session", "duration", "connection", "psm", "recording"],
  };

  // Calculer le score pour chaque type
  const scores = {};

  Object.entries(keywordMap).forEach(([type, keywords]) => {
    scores[type] = headers.reduce((score, header) => {
      const matchingKeywords = keywords.filter((keyword) =>
        header.includes(keyword)
      );
      return score + matchingKeywords.length;
    }, 0);
  });

  // Trouver le type avec le score le plus élevé
  return (
    Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .filter(([_, score]) => score > 0)
      .map(([type]) => type)[0] || "unknown"
  );
};

/**
 * Valide les données importées selon les règles métier
 * @param {Array} data - Données à valider
 * @param {string} dataType - Type de données
 * @returns {Object} Résultat de la validation avec erreurs et avertissements
 */
export const validateData = (data, dataType) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return {
      valid: false,
      errors: ["Les données sont vides ou dans un format incorrect."],
      warnings: [],
      details: {},
    };
  }

  const errors = [];
  const warnings = [];
  const details = {
    records: data.length,
    nullFields: {},
  };

  // Validation générique pour tous les types
  const firstItem = data[0];
  const fields = Object.keys(firstItem);

  // Vérifier la cohérence des champs dans tous les enregistrements
  const inconsistentRecords = data.filter((item) => {
    const itemFields = Object.keys(item);
    return itemFields.length !== fields.length;
  });

  if (inconsistentRecords.length > 0) {
    warnings.push(
      `${inconsistentRecords.length} enregistrement(s) ont un nombre de champs incohérent.`
    );
  }

  // Vérifier les valeurs nulles/vides
  fields.forEach((field) => {
    const nullCount = data.filter(
      (item) =>
        item[field] === null || item[field] === undefined || item[field] === ""
    ).length;

    if (nullCount > 0) {
      details.nullFields[field] = nullCount;

      if (nullCount === data.length) {
        warnings.push(
          `Le champ '${field}' est vide dans tous les enregistrements.`
        );
      } else if (nullCount > data.length * 0.5) {
        warnings.push(
          `Le champ '${field}' est vide dans plus de 50% des enregistrements (${nullCount}/${data.length}).`
        );
      }
    }
  });

  // Validation spécifique par type de données
  switch (dataType) {
    case "accounts":
      validateAccountsData(data, errors, warnings, details);
      break;
    case "safes":
      validateSafesData(data, errors, warnings, details);
      break;
    case "systemHealth":
      validateSystemHealthData(data, errors, warnings, details);
      break;
    case "users":
      validateUsersData(data, errors, warnings, details);
      break;
    default:
      // Pas de validation spécifique pour les autres types
      break;
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    details,
  };
};

/**
 * Validation spécifique pour les données de comptes
 */
const validateAccountsData = (data, errors, warnings, details) => {
  // Vérifier les champs requis
  const requiredFields = ["username", "address", "safeName", "platform"];
  const missingFields = requiredFields.filter(
    (field) => !data[0] || data[0][field] === undefined
  );

  if (missingFields.length > 0) {
    errors.push(
      `Champs requis manquants pour les données de comptes: ${missingFields.join(
        ", "
      )}`
    );
  }

  // Vérifier les doublons potentiels
  const uniqueKeyCombinations = new Set();
  const duplicates = [];

  data.forEach((account, index) => {
    if (account.username && account.address && account.safeName) {
      const key = `${account.username}|${account.address}|${account.safeName}`;

      if (uniqueKeyCombinations.has(key)) {
        duplicates.push(index);
      } else {
        uniqueKeyCombinations.add(key);
      }
    }
  });

  if (duplicates.length > 0) {
    warnings.push(
      `${duplicates.length} comptes ont potentiellement des doublons (même nom d'utilisateur, adresse et coffre).`
    );
    details.duplicates = duplicates;
  }
};

/**
 * Validation spécifique pour les données de coffres-forts
 */
const validateSafesData = (data, errors, warnings, details) => {
  // Vérifier les champs requis
  const requiredFields = ["safeName", "description"];
  const missingFields = requiredFields.filter(
    (field) => !data[0] || data[0][field] === undefined
  );

  if (missingFields.length > 0) {
    errors.push(
      `Champs requis manquants pour les données de coffres-forts: ${missingFields.join(
        ", "
      )}`
    );
  }

  // Vérifier les noms de coffres uniques
  const safeNames = new Set();
  const duplicates = [];

  data.forEach((safe, index) => {
    if (safe.safeName) {
      if (safeNames.has(safe.safeName)) {
        duplicates.push(index);
      } else {
        safeNames.add(safe.safeName);
      }
    }
  });

  if (duplicates.length > 0) {
    errors.push(
      `${duplicates.length} coffres-forts ont des noms en double. Les noms doivent être uniques.`
    );
    details.duplicateSafes = duplicates;
  }
};

/**
 * Validation spécifique pour les données de santé système
 */
const validateSystemHealthData = (data, errors, warnings, details) => {
  // Vérifier les champs numériques pour la santé du système
  const numericFields = ["cpuUsage", "memoryUsage", "diskUsage"];
  const invalidNumericRecords = {};

  numericFields.forEach((field) => {
    if (data[0] && data[0][field] !== undefined) {
      const invalidRecords = data
        .map((item, index) => ({ index, value: item[field] }))
        .filter(
          (item) =>
            item.value !== null &&
            item.value !== undefined &&
            (isNaN(parseFloat(item.value)) ||
              parseFloat(item.value) < 0 ||
              parseFloat(item.value) > 100)
        );

      if (invalidRecords.length > 0) {
        warnings.push(
          `${invalidRecords.length} enregistrements ont des valeurs invalides pour le champ '${field}' (attendu: nombre entre 0 et 100).`
        );
        invalidNumericRecords[field] = invalidRecords.map((r) => r.index);
      }
    }
  });

  if (Object.keys(invalidNumericRecords).length > 0) {
    details.invalidNumericRecords = invalidNumericRecords;
  }
};

/**
 * Validation spécifique pour les données utilisateurs
 */
const validateUsersData = (data, errors, warnings, details) => {
  // Vérifier les champs requis
  const requiredFields = ["username", "email"];
  const missingFields = requiredFields.filter(
    (field) => !data[0] || data[0][field] === undefined
  );

  if (missingFields.length > 0) {
    errors.push(
      `Champs requis manquants pour les données utilisateurs: ${missingFields.join(
        ", "
      )}`
    );
  }

  // Vérifier les adresses email valides
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const invalidEmails = data
    .map((user, index) => ({ index, email: user.email }))
    .filter((item) => item.email && !emailRegex.test(item.email));

  if (invalidEmails.length > 0) {
    warnings.push(
      `${invalidEmails.length} utilisateurs ont des adresses email dans un format invalide.`
    );
    details.invalidEmails = invalidEmails.map((e) => e.index);
  }
};

/**
 * Analyse et formate les données d'un fichier pour correspondre au format attendu
 * @param {string} content - Contenu du fichier
 * @param {Object} formatInfo - Information sur le format détecté
 * @returns {Array} Données formatées
 */
export const parseDataFromFile = (content, formatInfo) => {
  const { format, delimiter } = formatInfo;

  if (!content) {
    throw new Error("Contenu du fichier vide");
  }

  let parsedData;

  switch (format) {
    case "csv":
      parsedData = parseCSV(content, delimiter || ",");
      break;
    case "tsv":
      parsedData = parseCSV(content, delimiter || "\t");
      break;
    case "json":
      try {
        const jsonData = JSON.parse(content);
        parsedData = Array.isArray(jsonData) ? jsonData : [jsonData];
      } catch (e) {
        throw new Error(`Erreur lors du parsing JSON: ${e.message}`);
      }
      break;
    case "xml":
      throw new Error("Le format XML n'est pas pris en charge actuellement");
    default:
      throw new Error(`Format non reconnu: ${format}`);
  }

  // Normalisation des données
  return normalizeData(parsedData, formatInfo.dataType);
};

/**
 * Parse un fichier CSV/TSV en tableau d'objets
 * @param {string} content - Contenu CSV
 * @param {string} delimiter - Séparateur (virgule par défaut)
 * @returns {Array} Tableau d'objets
 */
const parseCSV = (content, delimiter = ",") => {
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    return [];
  }

  // Parse les headers
  const headers = lines[0].split(delimiter).map((header) => header.trim());

  // Parse les données
  return lines.slice(1).map((line) => {
    const values = line.split(delimiter);
    const obj = {};

    headers.forEach((header, index) => {
      obj[header] = values[index] ? values[index].trim() : "";
    });

    return obj;
  });
};

/**
 * Normalise les données selon le type
 * @param {Array} data - Données brutes
 * @param {string} dataType - Type de données
 * @returns {Array} Données normalisées
 */
const normalizeData = (data, dataType) => {
  if (!data || !Array.isArray(data)) {
    return [];
  }

  // Mapping des champs pour chaque type de données
  const fieldMappings = {
    accounts: {
      // Mappings standards pour les noms de colonnes des comptes
      account: "username",
      user: "username",
      login: "username",
      "account name": "username",
      "user name": "username",

      host: "address",
      server: "address",
      url: "address",
      "host address": "address",

      vault: "safeName",
      "safe name": "safeName",

      auto: "automaticManagement",
      "auto management": "automaticManagement",
      "automatic management": "automaticManagement",
    },
    safes: {
      name: "safeName",
      "safe name": "safeName",
      "safe id": "safeName",

      desc: "description",
      "safe description": "description",

      "cpm name": "managingCPM",
      cpm: "managingCPM",
    },
    systemHealth: {
      "cpu usage": "cpuUsage",
      "cpu utilization": "cpuUsage",
      "processor usage": "cpuUsage",

      "memory usage": "memoryUsage",
      "memory utilization": "memoryUsage",
      "ram usage": "memoryUsage",

      "disk usage": "diskUsage",
      "disk utilization": "diskUsage",
      "storage usage": "diskUsage",
    },
  };

  // Appliquer les mappings de champs et les conversions de types
  return data.map((item) => {
    const normalizedItem = { ...item };

    // Appliquer les mappings de champs si le type est connu
    if (dataType && fieldMappings[dataType]) {
      const mapping = fieldMappings[dataType];

      // Normaliser les noms de colonnes
      Object.entries(item).forEach(([key, value]) => {
        const lowerKey = key.toLowerCase();
        if (mapping[lowerKey] && lowerKey !== mapping[lowerKey]) {
          normalizedItem[mapping[lowerKey]] = value;
          delete normalizedItem[key];
        }
      });
    }

    // Conversions de types spécifiques selon le type de données
    switch (dataType) {
      case "accounts":
        // Conversion des booléens
        if ("automaticManagement" in normalizedItem) {
          normalizedItem.automaticManagement = convertToBoolean(
            normalizedItem.automaticManagement
          );
        }
        if ("disabled" in normalizedItem) {
          normalizedItem.disabled = convertToBoolean(normalizedItem.disabled);
        }
        break;

      case "systemHealth":
        // Conversion des pourcentages en nombres
        if ("cpuUsage" in normalizedItem) {
          normalizedItem.cpuUsage = convertToNumber(normalizedItem.cpuUsage);
        }
        if ("memoryUsage" in normalizedItem) {
          normalizedItem.memoryUsage = convertToNumber(
            normalizedItem.memoryUsage
          );
        }
        if ("diskUsage" in normalizedItem) {
          normalizedItem.diskUsage = convertToNumber(normalizedItem.diskUsage);
        }
        break;

      case "safes":
        // Conversion des booléens
        if ("isSystem" in normalizedItem) {
          normalizedItem.isSystem = convertToBoolean(normalizedItem.isSystem);
        }
        break;
    }

    return normalizedItem;
  });
};

/**
 * Convertit une chaîne en booléen
 * @param {any} value - Valeur à convertir
 * @returns {boolean} Valeur convertie
 */
const convertToBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value !== "string") return Boolean(value);

  const lowerValue = value.toLowerCase().trim();
  return ["true", "yes", "y", "1", "oui", "vrai"].includes(lowerValue);
};

/**
 * Convertit une chaîne en nombre
 * @param {any} value - Valeur à convertir
 * @returns {number} Valeur convertie
 */
const convertToNumber = (value) => {
  if (typeof value === "number") return value;
  if (!value) return 0;

  // Traiter les chaînes avec symbole de pourcentage
  if (typeof value === "string" && value.includes("%")) {
    return parseFloat(value.replace("%", "").trim());
  }

  return parseFloat(value);
};
