import { createSlice } from "@reduxjs/toolkit";
import { createPlanet, fetchPlanets, resetPlanets } from "../thunks/planetThunks";

const initialState = {
  items: [],
  pagination: {
    total: 0,
    page: 1,
    totalPages: 1,
    limit: 12
  },
  isCached: false,
  cachedAt: null,
  status: "idle", // "idle" | "loading" | "succeeded" | "failed"
  error: null,
  currentRequestId: null,
  lastParams: null,
  mutationStatus: "idle", // "idle" | "loading" | "succeeded" | "failed"
  mutationError: null,
  invalidateVersion: 0
};

const planetsSlice = createSlice({
  name: "planets",
  initialState,
  reducers: {
    clearPlanetsError(state) {
      state.error = null;
    },
    clearMutationState(state) {
      state.mutationStatus = "idle";
      state.mutationError = null;
    },
    invalidatePlanetsCache(state) {
      state.invalidateVersion += 1;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlanets.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.currentRequestId = action.meta.requestId;
        state.lastParams = action.meta.arg ?? null;
      })
      .addCase(fetchPlanets.fulfilled, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return;
        state.status = "succeeded";
        state.items = action.payload.data || [];
        state.pagination = action.payload.pagination || initialState.pagination;
        state.isCached = Boolean(action.payload.isCached);
        state.cachedAt = action.payload.cachedAt ?? null;
        state.error = null;
        state.currentRequestId = null;
      })
      .addCase(fetchPlanets.rejected, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return;
        state.currentRequestId = null;
        if (action.meta.aborted) {
          return;
        }
        state.status = "failed";
        state.error = action.payload || action.error?.message || "Ошибка загрузки данных из каталога";
      })
      .addCase(createPlanet.pending, (state) => {
        state.mutationStatus = "loading";
        state.mutationError = null;
      })
      .addCase(createPlanet.fulfilled, (state) => {
        state.mutationStatus = "succeeded";
        state.mutationError = null;
        state.invalidateVersion += 1;
      })
      .addCase(createPlanet.rejected, (state, action) => {
        state.mutationStatus = "failed";
        state.mutationError = action.payload || action.error?.message || "Ошибка добавления планеты";
      })
      .addCase(resetPlanets.pending, (state) => {
        state.mutationStatus = "loading";
        state.mutationError = null;
      })
      .addCase(resetPlanets.fulfilled, (state) => {
        state.mutationStatus = "succeeded";
        state.mutationError = null;
        state.invalidateVersion += 1;
      })
      .addCase(resetPlanets.rejected, (state, action) => {
        state.mutationStatus = "failed";
        state.mutationError = action.payload || action.error?.message || "Ошибка сброса каталога";
      });
  }
});

export const {
  clearPlanetsError,
  clearMutationState,
  invalidatePlanetsCache
} = planetsSlice.actions;

export default planetsSlice.reducer;
