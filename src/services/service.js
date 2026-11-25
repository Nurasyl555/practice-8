import { api } from "./api";

export const planetService = {
  getPlanets: (params, options) => api.getPlanets(params, options),
  getPlanetById: (id, options) => api.getPlanetById(id, options),
  createPlanet: (data) => api.createPlanet(data),
  resetToDefaults: () => api.resetToDefaults(),
  getAllPlanetsWithMeta: async (options) => {
    const res = await api.getPlanets({ limit: 1000 }, options);
    return {
      items: res.data,
      isCached: Boolean(res.isCached),
      cachedAt: res.cachedAt ?? null
    };
  }
};

export default planetService;
