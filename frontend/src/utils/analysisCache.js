const CACHE_PREFIX = "analysis_";

export const getCacheKey = (userId, resumeId) =>
  `${CACHE_PREFIX}${userId || "guest"}_${resumeId}`;

export const clearAnalysisCacheForUser = (userId) => {
  if (!userId) return;
  const prefix = `${CACHE_PREFIX}${userId}_`;
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key));
};

export const getCachedAnalysis = (userId, resumeId, documentUpdatedAt) => {
  const cacheKey = getCacheKey(userId, resumeId);
  const raw = localStorage.getItem(cacheKey);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    const cachedAt = parsed.cachedAt ? new Date(parsed.cachedAt) : null;
    const docUpdated = documentUpdatedAt ? new Date(documentUpdatedAt) : null;

    if (cachedAt && docUpdated && cachedAt < docUpdated) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    const strengths = parsed.strengths || [];
    const weaknesses = parsed.weaknesses || [];
    const improvements = parsed.improvements || [];
    if (
      strengths.length === 0 &&
      weaknesses.length === 0 &&
      improvements.length === 0
    ) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    return parsed;
  } catch {
    localStorage.removeItem(cacheKey);
    return null;
  }
};

export const setCachedAnalysis = (userId, resumeId, analysis) => {
  const cacheKey = getCacheKey(userId, resumeId);
  localStorage.setItem(
    cacheKey,
    JSON.stringify({
      ...analysis,
      cachedAt: new Date().toISOString(),
    }),
  );
};
