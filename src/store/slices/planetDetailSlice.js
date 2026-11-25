import { createSlice } from "@reduxjs/toolkit";
import { createPlanet, fetchPlanetById, resetPlanets } from "../thunks/planetThunks";

const initialState = {
  byId: {},
  activeId: null,
  status: "idle", // "idle" | "loading" | "succeeded" | "failed"
  error: null,
  currentRequestId: null,
  invalidateVersion: 0
};

const planetDetailSlice = createSlice({
  name: "planetDetail",
  initialState,
  reducers: {
    setActivePlanetId(state, action) {
      const nextId = action.payload;
      state.activeId = nextId;
      if (nextId && state.byId[nextId]) {
        state.status = "succeeded";
        state.error = null;
      }
    },
    clearPlanetDetailError(state) {
      state.error = null;
    },
    invalidatePlanetDetails(state) {
      state.byId = {};
      state.status = "idle";
      state.error = null;
      state.invalidateVersion += 1;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlanetById.pending, (state, action) => {
        const id = typeof action.meta.arg === "object" ? action.meta.arg.id : action.meta.arg;
        state.activeId = id;
        state.status = "loading";
        state.error = null;
        state.currentRequestId = action.meta.requestId;
      })
      .addCase(fetchPlanetById.fulfilled, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return;
        const planet = action.payload;
        if (planet?.id) {
          state.byId[planet.id] = planet;
        }
        state.status = "succeeded";
        state.error = null;
        state.currentRequestId = null;
      })
      .addCase(fetchPlanetById.rejected, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return;
        state.currentRequestId = null;
        if (action.meta.aborted) {
          return;
        }
        state.status = "failed";
        state.error = action.payload || action.error?.message || "Объект не обнаружен";
      })
      .addCase(createPlanet.fulfilled, (state, action) => {
        const created = action.payload;
        if (created?.id) {
          state.byId[created.id] = created;
        }
      })
      .addCase(resetPlanets.fulfilled, (state) => {
        Object.keys(state.byId).forEach((key) => {
          if (String(key).startsWith("exo-user-")) {
            delete state.byId[key];
          }
        });
      });
  }
});

export const {
  setActivePlanetId,
  clearPlanetDetailError,
  invalidatePlanetDetails
} = planetDetailSlice.actions;

export default planetDetailSlice.reducer;
