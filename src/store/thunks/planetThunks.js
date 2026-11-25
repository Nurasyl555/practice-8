import { createAsyncThunk } from "@reduxjs/toolkit";
import { planetService } from "../../services/service";

export const fetchPlanets = createAsyncThunk(
  "planets/fetchPlanets",
  async (params, { signal, rejectWithValue }) => {
    try {
      return await planetService.getPlanets(params, { signal });
    } catch (err) {
      if (err?.name === "AbortError") {
        throw err;
      }
      return rejectWithValue(err.message || "Ошибка загрузки данных из каталога");
    }
  }
);

export const fetchPlanetById = createAsyncThunk(
  "planetDetail/fetchPlanetById",
  async (arg, { signal, rejectWithValue }) => {
    const id = typeof arg === "object" ? arg.id : arg;
    try {
      return await planetService.getPlanetById(id, { signal });
    } catch (err) {
      if (err?.name === "AbortError") {
        throw err;
      }
      return rejectWithValue(err.message || `Планета с идентификатором ${id} не найдена`);
    }
  },
  {
    condition: (arg, { getState }) => {
      const id = typeof arg === "object" ? arg.id : arg;
      const force = typeof arg === "object" ? Boolean(arg.force) : false;
      if (!id) return false;
      const { planetDetail } = getState();
      if (!force && planetDetail.byId[id]) {
        return false;
      }
      return true;
    }
  }
);

export const fetchAllPlanets = createAsyncThunk(
  "dashboard/fetchAllPlanets",
  async (_arg, { signal, rejectWithValue }) => {
    try {
      return await planetService.getAllPlanetsWithMeta({ signal });
    } catch (err) {
      if (err?.name === "AbortError") {
        throw err;
      }
      return rejectWithValue(err.message || "Ошибка загрузки данных аналитики");
    }
  },
  {
    condition: (arg, { getState }) => {
      const force = typeof arg === "object" ? Boolean(arg?.force) : false;
      const { dashboard } = getState();
      if (
        !force &&
        !dashboard.isStale &&
        dashboard.status === "succeeded" &&
        dashboard.allPlanets.length > 0
      ) {
        return false;
      }
      return true;
    }
  }
);

export const createPlanet = createAsyncThunk(
  "planets/createPlanet",
  async (newPlanetData, { rejectWithValue }) => {
    try {
      return await planetService.createPlanet(newPlanetData);
    } catch (err) {
      return rejectWithValue(err.message || "Ошибка добавления планеты");
    }
  }
);

export const resetPlanets = createAsyncThunk(
  "planets/resetPlanets",
  async (_arg, { rejectWithValue }) => {
    try {
      return await planetService.resetToDefaults();
    } catch (err) {
      return rejectWithValue(err.message || "Ошибка восстановления базы планет");
    }
  }
);
