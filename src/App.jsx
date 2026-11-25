import React, { lazy, Suspense, useCallback } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { invalidatePlanetsCache } from "./store/slices/planetsSlice";
import { invalidatePlanetDetails } from "./store/slices/planetDetailSlice";
import { invalidateDashboardCache } from "./store/slices/dashboardSlice";
import { RootLayout } from "./layouts/RootLayout";
import { HomePage } from "./pages/HomePage";
import { PlanetsPage } from "./pages/PlanetsPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { OfflinePage } from "./pages/OfflinePage";
import { Loader2 } from "lucide-react";
import { AuthProvider } from "./context/AuthContext";
import { PwaProvider } from "./context/PwaContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

const AboutPage = lazy(() => import("./pages/AboutPage"));
const PlanetDetailPage = lazy(() => import("./pages/PlanetDetailPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));

const PageLoader = () => (
  <div className="page-loader">
    <Loader2 className="spinner-icon" size={48} />
    <span className="page-loader-text">
      Загрузка астрофизического модуля...
    </span>
  </div>
);

export function App() {
  const handleReconnect = useCallback(() => {
    store.dispatch(invalidatePlanetsCache());
    store.dispatch(invalidatePlanetDetails());
    store.dispatch(invalidateDashboardCache());
  }, []);

  return (
    <Provider store={store}>
      <PwaProvider onReconnect={handleReconnect}>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <AuthProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<RootLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="planets" element={<PlanetsPage />} />
                  <Route path="planets/:id" element={<PlanetDetailPage />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="about" element={<AboutPage />} />
                  <Route path="offline" element={<OfflinePage />} />
                  <Route path="login" element={<LoginPage />} />
                  <Route path="signup" element={<SignupPage />} />
                  <Route
                    path="profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </PwaProvider>
    </Provider>
  );
}

export default App;
