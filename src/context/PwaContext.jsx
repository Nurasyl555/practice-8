import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const PwaContext = createContext(null);

export const PwaProvider = ({ children, onReconnect }) => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [waitingWorker, setWaitingWorker] = useState(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [isInstalled, setIsInstalled] = useState(
    () =>
      typeof window !== "undefined" &&
      Boolean(window.matchMedia?.("(display-mode: standalone)")?.matches)
  );
  const refreshingRef = useRef(false);

  const checkConnection = useCallback(async () => {
    const baseUrl = import.meta.env.BASE_URL || "/";
    try {
      const res = await fetch(`${baseUrl}manifest.json?ping=${Date.now()}`, {
        cache: "no-store"
      });
      if (res.ok) {
        setIsOnline(true);
        if (typeof onReconnect === "function") {
          onReconnect();
        }
        return true;
      }
      setIsOnline(false);
      return false;
    } catch {
      setIsOnline(false);
      return false;
    }
  }, [onReconnect]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (typeof onReconnect === "function") {
        onReconnect();
      }
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [onReconnect]);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPromptEvent(e);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setInstallPromptEvent(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let registrationRef = null;
    const baseUrl = import.meta.env.BASE_URL || "/";
    const swUrl = `${baseUrl}sw.js`;

    const attachWaitingWatcher = (reg) => {
      if (reg.waiting) {
        setWaitingWorker(reg.waiting);
        setUpdateAvailable(true);
      }

      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            setWaitingWorker(newWorker);
            setUpdateAvailable(true);
          }
        });
      });
    };

    const handleControllerChange = () => {
      if (refreshingRef.current) return;
      refreshingRef.current = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);

    navigator.serviceWorker
      .register(swUrl, { scope: baseUrl })
      .then((reg) => {
        registrationRef = reg;
        attachWaitingWatcher(reg);
      })
      .catch((err) => {
        console.warn("Service Worker registration failed:", err);
      });

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible" && registrationRef) {
        registrationRef.update().catch(() => {});
      }
    };

    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
    };
  }, []);

  const applyUpdate = useCallback(() => {
    if (!waitingWorker) return;
    setIsUpdating(true);
    waitingWorker.postMessage({ type: "SKIP_WAITING" });
  }, [waitingWorker]);

  const promptInstall = useCallback(async () => {
    if (!installPromptEvent) return false;
    installPromptEvent.prompt();
    const { outcome } = await installPromptEvent.userChoice;
    setInstallPromptEvent(null);
    return outcome === "accepted";
  }, [installPromptEvent]);

  const notifyVisitedRoute = useCallback((url) => {
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "CACHE_ROUTE",
        url
      });
    }
  }, []);

  const value = {
    isOnline,
    updateAvailable,
    isUpdating,
    applyUpdate,
    canInstall: Boolean(installPromptEvent) && !isInstalled,
    isInstalled,
    promptInstall,
    checkConnection,
    notifyVisitedRoute
  };

  return <PwaContext.Provider value={value}>{children}</PwaContext.Provider>;
};

export const usePwa = () => {
  const ctx = useContext(PwaContext);
  if (!ctx) {
    throw new Error("usePwa должен использоваться внутри PwaProvider");
  }
  return ctx;
};
