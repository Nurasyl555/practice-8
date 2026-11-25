import React, { useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { usePwa } from "../context/PwaContext";
import { Rocket, RefreshCw, WifiOff, ArrowUpCircle } from "lucide-react";

export const RootLayout = () => {
  const location = useLocation();
  const {
    isOnline,
    updateAvailable,
    isUpdating,
    applyUpdate,
    notifyVisitedRoute,
    checkConnection
  } = usePwa();

  useEffect(() => {
    notifyVisitedRoute(window.location.href);
  }, [location.pathname, location.search, notifyVisitedRoute]);

  return (
    <div className="app-layout">
      <Navbar />

      {updateAvailable && (
        <div className="pwa-banner pwa-banner-update" role="status" aria-live="polite">
          <div className="pwa-banner-inner">
            <div className="pwa-banner-info">
              <ArrowUpCircle size={18} />
              <span>Доступна новая версия CosmoDex. Обновите приложение, чтобы применить изменения.</span>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={applyUpdate}
              disabled={isUpdating}
            >
              <RefreshCw size={15} className={isUpdating ? "spinner-icon-inline" : ""} />
              {isUpdating ? "Обновление..." : "Обновить сейчас"}
            </button>
          </div>
        </div>
      )}

      {!isOnline && (
        <div className="pwa-banner pwa-banner-offline" role="status" aria-live="polite">
          <div className="pwa-banner-inner">
            <div className="pwa-banner-info">
              <WifiOff size={18} />
              <span>Офлайн-режим: доступны ранее посещённые разделы и кэшированный каталог.</span>
            </div>
            <div className="pwa-banner-actions">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={checkConnection}
              >
                <RefreshCw size={14} /> Проверить сеть
              </button>
              <Link to="/offline" className="btn btn-outline btn-sm" style={{ textDecoration: "none" }}>
                Статус /offline
              </Link>
            </div>
          </div>
        </div>
      )}

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <Rocket size={16} color="var(--accent-cyan)" />
            <span>
              <strong>CosmoDex</strong> &copy; {new Date().getFullYear()} — Исследовательский каталог экзопланет
            </span>
          </div>
          <div className="footer-meta">
            <span>PWA • Offline-Ready • React &amp; React Router v7</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RootLayout;
