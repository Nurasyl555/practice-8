import { createSelector } from "@reduxjs/toolkit";

// Базовые селекторы (прямой доступ к срезам состояния)
export const selectPlanetsState = (state) => state.planets;
export const selectPlanetDetailState = (state) => state.planetDetail;
export const selectDashboardState = (state) => state.dashboard;

export const selectPlanetsList = (state) => state.planets.items;
export const selectPlanetsPagination = (state) => state.planets.pagination;
export const selectPlanetsMutationState = createSelector(
  [selectPlanetsState],
  (planets) => ({
    status: planets.mutationStatus,
    error: planets.mutationError
  })
);

export const selectActivePlanet = (state) => {
  const { activeId, byId } = state.planetDetail;
  return activeId ? byId[activeId] ?? null : null;
};

export const selectAllDashboardPlanets = (state) => state.dashboard.allPlanets;
export const selectDashboardFilters = (state) => state.dashboard.filters;

// Мемоизированный селектор 1: проверка пустого результата каталога
export const selectIsCatalogEmpty = createSelector(
  [selectPlanetsState],
  (planets) => planets.status === "succeeded" && planets.items.length === 0
);

// Мемоизированный селектор 2: фильтрация планет для Dashboard по миссии и обитаемости
export const selectFilteredDashboardPlanets = createSelector(
  [selectAllDashboardPlanets, selectDashboardFilters],
  (allPlanets, filters) => {
    const { selectedMission, selectedHabitability } = filters;
    return allPlanets.filter((p) => {
      const matchMission =
        selectedMission === "ALL" ||
        p.mission.toLowerCase().includes(selectedMission.toLowerCase());
      const matchHabitable =
        selectedHabitability === "ALL" ||
        (selectedHabitability === "YES" && p.habitable) ||
        (selectedHabitability === "NO" && !p.habitable);

      return matchMission && matchHabitable;
    });
  }
);

// Мемоизированный селектор 3: агрегированная статистика для карточек Dashboard
export const selectDashboardStats = createSelector(
  [selectFilteredDashboardPlanets],
  (filteredData) => {
    const total = filteredData.length;
    if (total === 0) {
      return {
        total: 0,
        habitableCount: 0,
        habitablePercent: 0,
        avgDistance: 0,
        avgTempCelsius: 0,
        nearestPlanet: null,
        mostMassive: null
      };
    }

    const habitableCount = filteredData.filter((p) => p.habitable).length;
    const habitablePercent = Math.round((habitableCount / total) * 100);

    const sumDistance = filteredData.reduce(
      (acc, p) => acc + (p.distanceLightYears || 0),
      0
    );
    const avgDistance = Math.round(sumDistance / total);

    const sumTemp = filteredData.reduce(
      (acc, p) => acc + (p.surfaceTempKelvin || 0),
      0
    );
    const avgTempKelvin = Math.round(sumTemp / total);
    const avgTempCelsius = Math.round(avgTempKelvin - 273.15);

    const nearestPlanet = [...filteredData].sort(
      (a, b) => a.distanceLightYears - b.distanceLightYears
    )[0];

    const mostMassive = [...filteredData].sort(
      (a, b) => b.massEarths - a.massEarths
    )[0];

    return {
      total,
      habitableCount,
      habitablePercent,
      avgDistance,
      avgTempCelsius,
      nearestPlanet,
      mostMassive
    };
  }
);

// Мемоизированный селектор 4: распределение планет по классам и миссиям
export const selectDashboardBreakdowns = createSelector(
  [selectFilteredDashboardPlanets],
  (filteredData) => {
    const classCounts = {
      Terrestrial: 0,
      "Super-Earth": 0,
      "Gas Giant": 0,
      "Neptune-like": 0
    };

    const missionCounts = {};

    filteredData.forEach((p) => {
      if (classCounts[p.type] !== undefined) {
        classCounts[p.type]++;
      }
      const shortName = p.mission.split(" ")[0];
      missionCounts[shortName] = (missionCounts[shortName] || 0) + 1;
    });

    const total = filteredData.length || 1;

    const classBreakdown = Object.entries(classCounts).map(([type, count]) => ({
      type,
      count,
      percent: Math.round((count / total) * 100)
    }));

    const missionBreakdown = Object.entries(missionCounts)
      .map(([mission, count]) => ({
        mission,
        count,
        percent: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.count - a.count);

    return { classBreakdown, missionBreakdown };
  }
);
