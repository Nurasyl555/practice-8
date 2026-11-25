import { createSlice } from "@reduxjs/toolkit";
import { createPlanet, fetchAllPlanets, resetPlanets } from "../thunks/planetThunks";

const initialState = {
  allPlanets: [],
  isCached: false,
  cachedAt: null,
  status: "idle", // "idle" | "loading" | "succeeded" | "failed"
  error: null,
  currentRequestId: null,
  filters: {
    selectedMission: "ALL",
    selectedHabitability: "ALL"
  },
  isStale: false,
  invalidateVersion: 0
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setDashboardMission(state, action) {
      state.filters.selectedMission = action.payload;
    },
    setDashboardHabitability(state, action) {
      state.filters.selectedHabitability = action.payload;
    },
    resetDashboardFilters(state) {
      state.filters.selectedMission = "ALL";
      state.filters.selectedHabitability = "ALL";
    },
    invalidateDashboardCache(state) {
      state.isStale = true;
      state.invalidateVersion += 1;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllPlanets.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.isStale = false;
        state.currentRequestId = action.meta.requestId;
      })
      .addCase(fetchAllPlanets.fulfilled, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return;
        state.status = "succeeded";
        state.allPlanets = action.payload.items || [];
        state.isCached = Boolean(action.payload.isCached);
        state.cachedAt = action.payload.cachedAt ?? null;
        state.error = null;
        state.currentRequestId = null;
      })
      .addCase(fetchAllPlanets.rejected, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return;
        state.currentRequestId = null;
        if (action.meta.aborted) {
          return;
        }
        state.status = "failed";
        state.error = action.payload || action.error?.message || "Ошибка загрузки данных аналитики";
      })
      .addCase(createPlanet.fulfilled, (state, action) => {
        if (state.status === "succeeded" && action.payload) {
          state.allPlanets.unshift(action.payload);
        } else {
          state.invalidateVersion += 1;
        }
      })
      .addCase(resetPlanets.fulfilled, (state, action) => {
        if (Array.isArray(action.payload)) {
          state.allPlanets = action.payload;
          state.status = "succeeded";
          state.error = null;
        } else {
          state.invalidateVersion += 1;
        }
      });
  }
});

export const {
  setDashboardMission,
  setDashboardHabitability,
  resetDashboardFilters,
  invalidateDashboardCache
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
