import { configureStore } from "@reduxjs/toolkit";
import planetsReducer from "./slices/planetsSlice";
import planetDetailReducer from "./slices/planetDetailSlice";
import dashboardReducer from "./slices/dashboardSlice";

export const store = configureStore({
  reducer: {
    planets: planetsReducer,
    planetDetail: planetDetailReducer,
    dashboard: dashboardReducer
  }
});

export default store;
