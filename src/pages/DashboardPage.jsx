import React from "react";
import { Link } from "react-router-dom";
import { useDashboardPlanets } from "../hooks/usePlanets";
import { StatusView } from "../components/StatusView";
import { CachedDataBadge } from "../components/CachedDataBadge";
import { usePwa } from "../context/PwaContext";
import {
  BarChart3,
  Globe,
  Sparkles,
  Thermometer,
  Compass,
  Telescope,
  Filter,
  ArrowRight,
  TrendingUp,
  Layers,
  Award
} from "lucide-react";

export const DashboardPage = () => {
  const {
    stats,
    classBreakdown,
    missionBreakdown,
    filters,
    isCached,
    cachedAt,
    isLoading,
    isError,
    error: queryError,
    refetch,
    setMission,
    setHabitability,
    resetFilters
  } = useDashboardPlanets();
  const { isOnline } = usePwa();
  const error = isError ? (queryError || "Ошибка загрузки данных аналитики") : null;
  const { selectedMission, selectedHabitability } = filters;

  return (
    <div className="dashboard-page-wrap">
      {/* Заголовок страницы */}
      <div className="page-header-row">
        <div>
          <div className="hero-badge">
            <BarChart3 size={15} /> Аналитический сектор
          </div>
          <h1 className="page-heading">Астрофизический дашборд</h1>
          <p className="page-subheading">
            Сводная аналитика, вычисляемая на основе телеметрии API в реальном времени
          </p>
        </div>

        <Link to="/planets" className="btn btn-primary" style={{ textDecoration: "none" }}>
          <Compass size={16} /> В каталог планет <ArrowRight size={16} />
        </Link>
      </div>

      {!isLoading && !error && (
        <CachedDataBadge
          isCached={isCached}
          cachedAt={cachedAt}
          isOnline={isOnline}
        />
      )}

      {isLoading && <StatusView type="loading" />}
      {!isLoading && error && <StatusView type="error" message={error} onRetry={refetch} />}

      {!isLoading && !error && (
        <>
          {/* Интерактивная панель фильтров, влияющих на статистику */}
          <section className="dashboard-filter-bar">
            <div className="dashboard-filter-title">
              <Filter size={18} />
              <span>Интерактивный срез выборки:</span>
            </div>

            <div className="dashboard-filter-controls">
              {/* Фильтр 1: По миссии */}
              <div className="control-group">
                <label className="control-label">Миссия:</label>
                <select
                  className="select-input"
                  value={selectedMission}
                  onChange={(e) => setMission(e.target.value)}
                >
                  <option value="ALL">Все миссии (NASA/ESA)</option>
                  <option value="Kepler">Kepler Telescope</option>
                  <option value="TESS">TESS Survey</option>
                  <option value="James Webb">James Webb (JWST)</option>
                  <option value="Spitzer">Spitzer Space</option>
                  <option value="Hubble">Hubble Space</option>
                </select>
              </div>

              {/* Фильтр 2: По зоне обитаемости */}
              <div className="control-group">
                <label className="control-label">Условия:</label>
                <select
                  className="select-input"
                  value={selectedHabitability}
                  onChange={(e) => setHabitability(e.target.value)}
                >
                  <option value="ALL">Все условия среды</option>
                  <option value="YES">Только зона жизни</option>
                  <option value="NO">Только экстремальные</option>
                </select>
              </div>

              {(selectedMission !== "ALL" || selectedHabitability !== "ALL") && (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={resetFilters}
                >
                  Сбросить срез
                </button>
              )}
            </div>
          </section>

          {/* 4+ Ключевые карточки статистики */}
          <section className="dashboard-stats-grid">
            {/* Метрика 1: Всего объектов */}
            <div className="stat-card" style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: 16,
              padding: "1.5rem"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Всего объектов в срезе</span>
                <Globe size={20} color="var(--accent-cyan)" />
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 800 }}>{stats.total}</div>
              <small style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
                Из 105 доступных в базе
              </small>
            </div>

            {/* Метрика 2: Зона обитаемости */}
            <div className="stat-card" style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: 16,
              padding: "1.5rem"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Обитаемые миры</span>
                <Sparkles size={20} color="var(--accent-emerald)" />
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent-emerald)" }}>
                {stats.habitableCount} <span style={{ fontSize: "1rem", color: "var(--text-secondary)" }}>({stats.habitablePercent}%)</span>
              </div>
              <small style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
                В пределах зоны Златовласки
              </small>
            </div>

            {/* Метрика 3: Средняя температура */}
            <div className="stat-card" style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: 16,
              padding: "1.5rem"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Средняя температура</span>
                <Thermometer size={20} color="var(--accent-amber)" />
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent-amber)" }}>
                {stats.avgTempCelsius}°C
              </div>
              <small style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
                Равновесная климатическая норма
              </small>
            </div>

            {/* Метрика 4: Среднее расстояние */}
            <div className="stat-card" style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: 16,
              padding: "1.5rem"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Среднее удаление</span>
                <Compass size={20} color="var(--accent-indigo)" />
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 800 }}>
                {stats.avgDistance} <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>св. лет</span>
              </div>
              <small style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
                Дистанция от Солнечной системы
              </small>
            </div>
          </section>

          {/* Рекордные планеты с прямыми ссылками на Item Details (/planets/:id) */}
          <section className="dashboard-records-grid">
            {stats.nearestPlanet && (
              <div style={{
                background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(18, 24, 43, 0.8))",
                border: "1px solid rgba(99, 102, 241, 0.4)",
                borderRadius: 16,
                padding: "1.5rem"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--accent-cyan)", marginBottom: "0.5rem" }}>
                  <Award size={18} />
                  <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Ближайший к Земле мир в выборке:</span>
                </div>
                <h3 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "0.4rem" }}>
                  {stats.nearestPlanet.name}
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "1rem" }}>
                  Удаленность всего {stats.nearestPlanet.distanceLightYears} св. лет ({stats.nearestPlanet.type})
                </p>
                <Link
                  to={`/planets/${stats.nearestPlanet.id}`}
                  className="btn btn-secondary"
                  style={{ textDecoration: "none", fontSize: "0.85rem", padding: "0.45rem 0.9rem" }}
                >
                  Открыть паспорт планеты →
                </Link>
              </div>
            )}

            {stats.mostMassive && (
              <div style={{
                background: "linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(18, 24, 43, 0.8))",
                border: "1px solid rgba(245, 158, 11, 0.4)",
                borderRadius: 16,
                padding: "1.5rem"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--accent-amber)", marginBottom: "0.5rem" }}>
                  <TrendingUp size={18} />
                  <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Самый массивный мир в выборке:</span>
                </div>
                <h3 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "0.4rem" }}>
                  {stats.mostMassive.name}
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "1rem" }}>
                  Масса составляет {stats.mostMassive.massEarths} масс Земли ({stats.mostMassive.type})
                </p>
                <Link
                  to={`/planets/${stats.mostMassive.id}`}
                  className="btn btn-secondary"
                  style={{ textDecoration: "none", fontSize: "0.85rem", padding: "0.45rem 0.9rem" }}
                >
                  Открыть паспорт планеты →
                </Link>
              </div>
            )}
          </section>

          {/* Секция 2+ Разделений данных (Data Breakdowns) */}
          <section className="dashboard-breakdowns-grid">
            {/* Breakdown 1: По классам планет */}
            <div className="dashboard-breakdown-card">
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.5rem" }}>
                <Layers size={22} color="var(--accent-cyan)" />
                <div>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Разбивка по классам планет</h3>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                    Кликните класс для быстрого перехода в каталог
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {classBreakdown.map((item) => (
                  <div key={item.type}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", marginBottom: "0.35rem" }}>
                      <Link
                        to={`/planets?type=${encodeURIComponent(item.type)}`}
                        style={{ color: "var(--text-primary)", textDecoration: "none", fontWeight: 600 }}
                      >
                        {item.type} ↗
                      </Link>
                      <span style={{ color: "var(--text-secondary)" }}>
                        {item.count} планет ({item.percent}%)
                      </span>
                    </div>

                    {/* Прогресс-бар */}
                    <div style={{ width: "100%", height: 8, background: "rgba(255, 255, 255, 0.08)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{
                        width: `${item.percent}%`,
                        height: "100%",
                        background: "linear-gradient(90deg, var(--accent-indigo), var(--accent-cyan))",
                        borderRadius: 4,
                        transition: "width 0.4s ease"
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Breakdown 2: По космическим миссиям */}
            <div className="dashboard-breakdown-card">
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.5rem" }}>
                <Telescope size={22} color="var(--accent-indigo)" />
                <div>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Разбивка по обсерваториям</h3>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                    Доля открытий различными телескопами
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {missionBreakdown.map((item) => (
                  <div key={item.mission}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", marginBottom: "0.35rem" }}>
                      <span style={{ fontWeight: 600 }}>{item.mission} Space Mission</span>
                      <span style={{ color: "var(--text-secondary)" }}>
                        {item.count} миров ({item.percent}%)
                      </span>
                    </div>

                    <div style={{ width: "100%", height: 8, background: "rgba(255, 255, 255, 0.08)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{
                        width: `${item.percent}%`,
                        height: "100%",
                        background: "linear-gradient(90deg, var(--accent-emerald), var(--accent-cyan))",
                        borderRadius: 4,
                        transition: "width 0.4s ease"
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
