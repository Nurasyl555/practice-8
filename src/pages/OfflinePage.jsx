import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { WifiOff, RefreshCw, Home, Compass, CheckCircle2 } from "lucide-react";
import { usePwa } from "../context/PwaContext";

export const OfflinePage = () => {
  const { isOnline, checkConnection } = usePwa();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleRetry = async () => {
    setChecking(true);
    setFeedback("Проверка соединения с сервером...");
    const ok = await checkConnection();
    setChecking(false);

    if (ok) {
      setFeedback("Соединение восстановлено! Возвращаемся в каталог...");
      setTimeout(() => navigate("/planets"), 700);
    } else {
      setFeedback("Сеть по-прежнему недоступна. Вы можете открыть ранее кэшированные разделы.");
    }
  };

  return (
    <div className="offline-page-wrap">
      <section className="offline-page-card">
        <div className={`offline-icon-box ${isOnline ? "online" : ""}`}>
          {isOnline ? <CheckCircle2 size={36} /> : <WifiOff size={36} />}
        </div>

        <span className={`connectivity-chip ${isOnline ? "online" : "offline"}`}>
          <span className="connectivity-dot" />
          {isOnline ? "Подключение восстановлено" : "Офлайн-режим"}
        </span>

        <h1 className="offline-page-title">
          {isOnline ? "Связь с орбитой активна" : "Нет подключения к интернету"}
        </h1>

        <p className="offline-page-desc">
          {isOnline
            ? "Устройство снова в сети. Вы можете вернуться к каталогу экзопланет или на главную страницу."
            : "Запрошенный ресурс пока не доступен без сети. Ранее посещённые страницы и кэшированные данные каталога остаются доступными в офлайн-режиме."}
        </p>

        <div className="offline-page-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleRetry}
            disabled={checking}
          >
            <RefreshCw size={16} className={checking ? "spinner-icon-inline" : ""} />
            {checking ? "Проверка..." : "Retry Connection"}
          </button>

          <Link to="/planets" className="btn btn-secondary" style={{ textDecoration: "none" }}>
            <Compass size={16} /> Каталог (кэш)
          </Link>

          <Link to="/" className="btn btn-outline" style={{ textDecoration: "none" }}>
            <Home size={16} /> На главную
          </Link>
        </div>

        {feedback && (
          <p className="offline-feedback" role="status" aria-live="polite">
            {feedback}
          </p>
        )}
      </section>
    </div>
  );
};

export default OfflinePage;
