// Cache pour stocker les données parsées
const cache = new Map();

export const setCache = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
};

export const getCache = (key, maxAge = 5 * 60 * 1000) => {
  // 5 minutes par défaut
  const cached = cache.get(key);
  if (!cached) return null;

  const age = Date.now() - cached.timestamp;
  if (age > maxAge) {
    cache.delete(key);
    return null;
  }

  return cached.data;
};

export const clearCache = () => {
  cache.clear();
};
