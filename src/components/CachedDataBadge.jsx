import React from "react";
import { DatabaseZap } from "lucide-react";

export const CachedDataBadge = ({ isCached, cachedAt, isOnline }) => {
  if (!isCached && isOnline) return null;

  const formattedTime = cachedAt
    ? new Date(cachedAt).toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit"
      })
    : null;

  return (
    <div className="cached-data-banner" role="status">
      <DatabaseZap size={18} className="cached-data-icon" />
      <div className="cached-data-text">
        <strong>Кэшированные данные</strong>
        <span>
          {isCached
            ? `Показана сохранённая копия из Service Worker${formattedTime ? ` (обновлено в ${formattedTime})` : ""}.`
            : "Вы сейчас офлайн — отображаются ранее загруженные данные из локального кэша."}
        </span>
      </div>
    </div>
  );
};

export default CachedDataBadge;
