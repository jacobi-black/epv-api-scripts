/**
 * Gestionnaire de cache stratégique pour l'application
 * Permet d'optimiser les performances en mettant en cache les données fréquemment utilisées
 * avec une gestion fine du cycle de vie des données en cache
 */

class CacheManager {
  constructor() {
    this.cache = new Map();
    this.priorities = {
      HIGH: { ttl: 3600000, maxSize: 50 }, // 1 heure pour les données critiques
      MEDIUM: { ttl: 1800000, maxSize: 100 }, // 30 minutes
      LOW: { ttl: 600000, maxSize: 200 }, // 10 minutes
    };
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
    };
    this.sizeLimits = {
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
    };

    // Démarrer le processus de nettoyage périodique
    this.cleanupInterval = setInterval(() => this.cleanup(), 300000); // Toutes les 5 minutes
  }

  /**
   * Stocke une valeur dans le cache
   * @param {string} key - Clé unique pour l'élément
   * @param {any} value - Valeur à stocker
   * @param {Object} options - Options de mise en cache
   * @param {string} options.priority - Priorité (HIGH, MEDIUM, LOW)
   * @param {number} options.ttl - Durée de vie en ms (écrase la valeur par défaut de la priorité)
   * @param {Function} options.validator - Fonction validant si la donnée est toujours valide
   */
  set(key, value, options = {}) {
    const priority = options.priority || "MEDIUM";
    const ttl = options.ttl || this.priorities[priority].ttl;

    // Vérifier si le cache pour cette priorité est plein
    if (this.isStorageFull(priority)) {
      this.evictLeastRecent(priority);
    }

    const entry = {
      key,
      value,
      priority,
      timestamp: Date.now(),
      expiry: Date.now() + ttl,
      lastAccessed: Date.now(),
      accessCount: 0,
      validator: options.validator,
      metadata: options.metadata || {},
    };

    this.cache.set(key, entry);
    this.sizeLimits[priority]++;

    return true;
  }

  /**
   * Récupère une valeur du cache
   * @param {string} key - Clé à récupérer
   * @param {Object} options - Options de récupération
   * @param {boolean} options.updateAccess - Mettre à jour les stats d'accès (défaut: true)
   * @param {boolean} options.skipValidation - Ignorer la validation (défaut: false)
   * @returns {any|null} - Valeur stockée ou null si absente/expirée
   */
  get(key, options = {}) {
    const updateAccess = options.updateAccess !== false;
    const skipValidation = options.skipValidation === true;

    if (!this.cache.has(key)) {
      this.stats.misses++;
      return null;
    }

    const entry = this.cache.get(key);

    // Vérifier si l'entrée est expirée
    if (Date.now() > entry.expiry) {
      this.remove(key);
      this.stats.misses++;
      return null;
    }

    // Vérifier si l'entrée est toujours valide via son validateur
    if (
      !skipValidation &&
      entry.validator &&
      !entry.validator(entry.value, entry.metadata)
    ) {
      this.remove(key);
      this.stats.misses++;
      return null;
    }

    // Mettre à jour les statistiques d'accès
    if (updateAccess) {
      entry.lastAccessed = Date.now();
      entry.accessCount++;
      this.cache.set(key, entry);
    }

    this.stats.hits++;
    return entry.value;
  }

  /**
   * Supprime une entrée du cache
   * @param {string} key - Clé à supprimer
   * @returns {boolean} - true si supprimé avec succès
   */
  remove(key) {
    if (this.cache.has(key)) {
      const entry = this.cache.get(key);
      this.sizeLimits[entry.priority]--;
      this.cache.delete(key);
      return true;
    }
    return false;
  }

  /**
   * Vérifie si une clé existe dans le cache et est valide
   * @param {string} key - Clé à vérifier
   * @returns {boolean} - true si la clé existe et est valide
   */
  has(key) {
    if (!this.cache.has(key)) {
      return false;
    }

    const entry = this.cache.get(key);

    // Vérifier expiration
    if (Date.now() > entry.expiry) {
      this.remove(key);
      return false;
    }

    // Vérifier validité
    if (entry.validator && !entry.validator(entry.value, entry.metadata)) {
      this.remove(key);
      return false;
    }

    return true;
  }

  /**
   * Vide intégralement le cache
   */
  clear() {
    this.cache.clear();
    this.sizeLimits = {
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
    };
  }

  /**
   * Rafraîchit le TTL d'une entrée
   * @param {string} key - Clé à rafraîchir
   * @param {number} ttl - Nouveau TTL en ms (optionnel)
   * @returns {boolean} - true si rafraîchi avec succès
   */
  refresh(key, ttl = null) {
    if (!this.cache.has(key)) {
      return false;
    }

    const entry = this.cache.get(key);

    // Si aucun TTL spécifié, utiliser celui par défaut de la priorité
    const newTtl = ttl || this.priorities[entry.priority].ttl;

    // Mettre à jour l'expiration
    entry.expiry = Date.now() + newTtl;
    entry.lastAccessed = Date.now();

    this.cache.set(key, entry);
    return true;
  }

  /**
   * Met à jour une valeur dans le cache si elle existe
   * @param {string} key - Clé à mettre à jour
   * @param {Function} updateFn - Fonction prenant l'ancienne valeur et retournant la nouvelle
   * @returns {boolean} - true si mis à jour avec succès
   */
  update(key, updateFn) {
    if (!this.cache.has(key)) {
      return false;
    }

    const entry = this.cache.get(key);

    // Appliquer la fonction de mise à jour
    entry.value = updateFn(entry.value);
    entry.lastAccessed = Date.now();

    this.cache.set(key, entry);
    return true;
  }

  /**
   * Supprime toutes les entrées expirées du cache
   */
  cleanup() {
    console.log("Nettoyage du cache...");
    const now = Date.now();
    let countRemoved = 0;

    this.cache.forEach((entry, key) => {
      if (now > entry.expiry) {
        this.remove(key);
        countRemoved++;
      } else if (
        entry.validator &&
        !entry.validator(entry.value, entry.metadata)
      ) {
        this.remove(key);
        countRemoved++;
      }
    });

    console.log(`Nettoyage terminé: ${countRemoved} entrées supprimées`);
  }

  /**
   * Vérifie si le stockage pour une priorité donnée est plein
   * @param {string} priority - Priorité à vérifier
   * @returns {boolean} - true si le stockage est plein
   */
  isStorageFull(priority) {
    return this.sizeLimits[priority] >= this.priorities[priority].maxSize;
  }

  /**
   * Supprime l'entrée la moins récemment utilisée pour une priorité donnée
   * @param {string} priority - Priorité pour laquelle éviction
   */
  evictLeastRecent(priority) {
    let oldestAccessTime = Infinity;
    let oldestKey = null;

    this.cache.forEach((entry, key) => {
      if (
        entry.priority === priority &&
        entry.lastAccessed < oldestAccessTime
      ) {
        oldestAccessTime = entry.lastAccessed;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.remove(oldestKey);
      this.stats.evictions++;
    }
  }

  /**
   * Récupère ou calcule une valeur, en utilisant une fonction si non présente dans le cache
   * @param {string} key - Clé à récupérer
   * @param {Function} computeFn - Fonction pour calculer la valeur si absente
   * @param {Object} options - Options de mise en cache
   * @returns {Promise<any>} - Valeur du cache ou calculée
   */
  async getOrCompute(key, computeFn, options = {}) {
    // Vérifier si la valeur est dans le cache
    const cachedValue = this.get(key);
    if (cachedValue !== null) {
      return cachedValue;
    }

    // Calculer la valeur car elle n'est pas dans le cache
    try {
      const computedValue = await computeFn();

      // Stocker dans le cache
      this.set(key, computedValue, options);

      return computedValue;
    } catch (error) {
      console.error(`Erreur lors du calcul pour la clé ${key}:`, error);
      throw error;
    }
  }

  /**
   * Précharge des données dans le cache
   * @param {Array<Object>} items - Tableau d'objets {key, valueFn, options} à précharger
   * @returns {Promise<Array>} - Résultats du préchargement
   */
  async preload(items) {
    const promises = items.map(async ({ key, valueFn, options }) => {
      try {
        const value = await valueFn();
        this.set(key, value, options);
        return { key, success: true };
      } catch (error) {
        console.error(`Erreur lors du préchargement de ${key}:`, error);
        return { key, success: false, error };
      }
    });

    return Promise.all(promises);
  }

  /**
   * Obtient des statistiques détaillées sur l'utilisation du cache
   * @returns {Object} - Statistiques du cache
   */
  getStats() {
    const totalEntries = this.cache.size;
    const hitRatio =
      totalEntries > 0
        ? (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100
        : 0;

    // Calculer l'utilisation par priorité
    const priorityStats = {};
    Object.keys(this.priorities).forEach((priority) => {
      priorityStats[priority] = {
        current: this.sizeLimits[priority],
        max: this.priorities[priority].maxSize,
        utilization:
          (this.sizeLimits[priority] / this.priorities[priority].maxSize) * 100,
      };
    });

    return {
      entries: totalEntries,
      hits: this.stats.hits,
      misses: this.stats.misses,
      evictions: this.stats.evictions,
      hitRatio: `${hitRatio.toFixed(2)}%`,
      byPriority: priorityStats,
      memoryEstimate: this.estimateMemoryUsage(),
    };
  }

  /**
   * Estime la mémoire utilisée par le cache (approximation)
   * @returns {string} - Estimation de la mémoire utilisée en format lisible
   */
  estimateMemoryUsage() {
    let totalSize = 0;

    this.cache.forEach((entry) => {
      // Estimation basique de la taille des données
      const valueSize = JSON.stringify(entry.value).length * 2; // approximation en octets
      const metadataSize = JSON.stringify(entry.metadata).length * 2;
      const entryOverhead = 200; // estimation des champs de métadonnées du cache

      totalSize += valueSize + metadataSize + entryOverhead;
    });

    // Convertir en format lisible
    if (totalSize < 1024) {
      return `${totalSize} octets`;
    } else if (totalSize < 1024 * 1024) {
      return `${(totalSize / 1024).toFixed(2)} Ko`;
    } else {
      return `${(totalSize / (1024 * 1024)).toFixed(2)} Mo`;
    }
  }

  /**
   * Arrête le gestionnaire de cache et libère les ressources
   */
  dispose() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }
}

// Exporter une instance singleton
const cacheInstance = new CacheManager();
export default cacheInstance;
