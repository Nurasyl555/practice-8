const USER_PLANETS_KEY = "cosmodex_user_planets_v1";
const BASE_URL = import.meta.env.BASE_URL || "/";

const getUserPlanets = () => {
  try {
    const raw = localStorage.getItem(USER_PLANETS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveUserPlanets = (planets) => {
  localStorage.setItem(USER_PLANETS_KEY, JSON.stringify(planets));
};

const parseCacheMeta = (response) => {
  const isCached = response.headers.get("X-Cosmodex-Cache") === "HIT";
  const cachedAtHeader = response.headers.get("X-Cosmodex-Cached-At");
  const cachedAt = cachedAtHeader ? Number(cachedAtHeader) : null;
  return { isCached, cachedAt };
};

export const api = {
  async getPlanets({
    search = "",
    type = "ALL",
    habitable = "ALL",
    mission = "ALL",
    sortBy = "name",
    sortOrder = "asc",
    page = 1,
    limit = 12
  } = {}, { signal } = {}) {
    const url = `${BASE_URL}api/planets.json`;
    let response;
    try {
      response = await fetch(url, { signal });
    } catch (err) {
      if (err?.name === "AbortError") throw err;
      throw new Error("Нет подключения к сети и отсутствуют кэшированные данные каталога.");
    }

    if (!response.ok) {
      let errMsg = `Ошибка загрузки каталога (${response.status})`;
      try {
        const body = await response.json();
        if (body?.error) errMsg = body.error;
      } catch {
        // Use default message
      }
      throw new Error(errMsg);
    }

    const { isCached, cachedAt } = parseCacheMeta(response);
    const basePlanets = await response.json();
    const userPlanets = getUserPlanets();
    let list = [...userPlanets, ...(Array.isArray(basePlanets) ? basePlanets : [])];

    if (search.trim()) {
      const query = search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.hostStar.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    if (type !== "ALL") {
      list = list.filter((p) => p.type === type);
    }

    if (habitable === "YES") {
      list = list.filter((p) => p.habitable === true);
    } else if (habitable === "NO") {
      list = list.filter((p) => p.habitable === false);
    }

    if (mission !== "ALL") {
      list = list.filter((p) => p.mission === mission);
    }

    list.sort((a, b) => {
      const valA = a[sortBy];
      const valB = b[sortBy];

      if (typeof valA === "string") {
        const comp = valA.localeCompare(valB);
        return sortOrder === "asc" ? comp : -comp;
      }
      return sortOrder === "asc" ? valA - valB : valB - valA;
    });

    const totalRecords = list.length;
    const totalPages = Math.ceil(totalRecords / limit) || 1;
    const safePage = Math.max(1, Math.min(page, totalPages));
    const startIndex = (safePage - 1) * limit;
    const paginatedItems = list.slice(startIndex, startIndex + limit);

    return {
      data: paginatedItems,
      pagination: {
        total: totalRecords,
        page: safePage,
        totalPages,
        limit
      },
      isCached,
      cachedAt
    };
  },

  async getPlanetById(id, { signal } = {}) {
    if (String(id).startsWith("exo-user-")) {
      const userPlanets = getUserPlanets();
      const foundUser = userPlanets.find((p) => p.id === id);
      if (foundUser) {
        return { ...foundUser, _isCached: !navigator.onLine, _cachedAt: null };
      }
      throw new Error(`Планета с идентификатором ${id} не найдена`);
    }

    const url = `${BASE_URL}api/planets/${encodeURIComponent(id)}.json`;
    let response;
    try {
      response = await fetch(url, { signal });
    } catch (err) {
      if (err?.name === "AbortError") throw err;
      throw new Error("Нет подключения к сети и данные этой планеты ещё не были кэшированы.");
    }

    if (!response.ok) {
      let errMsg = `Планета с идентификатором ${id} не найдена`;
      try {
        const body = await response.json();
        if (body?.error) errMsg = body.error;
      } catch {
        // Use default message
      }
      throw new Error(errMsg);
    }

    const { isCached, cachedAt } = parseCacheMeta(response);
    const planet = await response.json();
    return {
      ...planet,
      _isCached: isCached,
      _cachedAt: cachedAt
    };
  },

  async createPlanet(planetData) {
    if (!planetData.name || !planetData.type) {
      throw new Error("Поля 'Название' и 'Тип' обязательны для заполнения");
    }

    const userPlanets = getUserPlanets();
    const newRecord = {
      ...planetData,
      id: `exo-user-${Date.now()}`,
      discoveryYear: Number(planetData.discoveryYear) || new Date().getFullYear(),
      distanceLightYears: Number(planetData.distanceLightYears) || 10,
      surfaceTempKelvin: Number(planetData.surfaceTempKelvin) || 280,
      massEarths: Number(planetData.massEarths) || 1.0,
      orbitalPeriodDays: Number(planetData.orbitalPeriodDays) || 365,
      discoveryMethod: planetData.discoveryMethod || "Transit",
      spectralType: planetData.spectralType || "G2V",
      habitable: Boolean(planetData.habitable)
    };

    saveUserPlanets([newRecord, ...userPlanets]);
    return newRecord;
  },

  async resetToDefaults() {
    localStorage.removeItem(USER_PLANETS_KEY);
    const res = await this.getPlanets({ limit: 1000 });
    return res.data;
  }
};
