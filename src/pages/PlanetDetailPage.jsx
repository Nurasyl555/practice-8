import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { usePlanetDetailQuery } from "../hooks/usePlanets";
import { StatusView } from "../components/StatusView";
import { CachedDataBadge } from "../components/CachedDataBadge";
import { usePwa } from "../context/PwaContext";
import {
  ArrowLeft,
  Compass,
  Sparkles,
  Thermometer,
  Weight,
  Calendar,
  Orbit,
  Telescope,
  AlertCircle,
  FileText,
  ShieldCheck,
  Sun
} from "lucide-react";

export const PlanetDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isOnline } = usePwa();

  const {
    planet,
    isLoading,
    isError,
    error: queryError,
    refetch
  } = usePlanetDetailQuery(id);

  const error = isError ? (queryError || `Астрономический объект с ID "${id}" не найден в базе данных.`) : null;
  const tempCelsius = planet ? Math.round(planet.surfaceTempKelvin - 273.15) : null;

  return (
    <div className="detail-page-wrap">
      <nav className="detail-top-nav">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-secondary"
          style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
        >
          <ArrowLeft size={16} /> Назад
        </button>

        <Link
          to="/planets"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            color: "var(--accent-cyan)",
            textDecoration: "none",
            fontSize: "0.95rem",
            fontWeight: 500
          }}
        >
          <Compass size={18} /> Ко всем планетам каталога
        </Link>
      </nav>

      {isLoading && <StatusView type="loading" />}

      {!isLoading && error && (
        <div style={{
          background: "var(--bg-card)",
          border: "1px solid var(--accent-rose)",
          borderRadius: 20,
          padding: "3rem 2rem",
          textAlign: "center"
        }}>
          <div style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "rgba(244, 63, 94, 0.15)",
            color: "var(--accent-rose)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem auto"
          }}>
            <AlertCircle size={32} />
          </div>
          <h2 style={{ fontSize: "1.8rem", marginBottom: "0.8rem" }}>Объект не обнаружен</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", maxWidth: 500, margin: "0 auto 2rem" }}>
            {error}
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <button type="button" className="btn btn-secondary" onClick={() => refetch()}>
              Повторить
            </button>
            <Link to="/planets" className="btn btn-primary" style={{ textDecoration: "none" }}>
              <Compass size={16} /> Вернуться в каталог
            </Link>
          </div>
        </div>
      )}

      {!isLoading && !error && planet && (
        <>
          <CachedDataBadge
            isCached={Boolean(planet._isCached)}
            cachedAt={planet._cachedAt || null}
            isOnline={isOnline}
          />
          <article className="detail-article">
            <div className="detail-header">
              <div>
                <div className="detail-title-row">
                  <h1 className="detail-title">{planet.name}</h1>
                  <span className={`badge badge-${planet.type.toLowerCase().replace(/_/g, "-").replace(/\s+/g, "-")}`}>
                    {planet.type.replace(/_/g, " ")}
                  </span>
                </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem" }}>
                Материнская звезда: <strong style={{ color: "var(--text-primary)" }}>{planet.hostStar}</strong>
              </p>
            </div>

            <div>
              {planet.habitable ? (
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: "rgba(16, 185, 129, 0.15)",
                  border: "1px solid var(--accent-emerald)",
                  color: "var(--accent-emerald)",
                  padding: "0.6rem 1.2rem",
                  borderRadius: 12,
                  fontWeight: 600,
                  fontSize: "0.95rem"
                }}>
                  <ShieldCheck size={20} /> В зоне обитаемости (Habitable)
                </div>
              ) : (
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: "rgba(100, 116, 139, 0.15)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-muted)",
                  padding: "0.6rem 1.2rem",
                  borderRadius: 12,
                  fontWeight: 500,
                  fontSize: "0.95rem"
                }}>
                  Вне зоны обитаемости
                </div>
              )}
            </div>
          </div>

          <div className="detail-metrics-grid">
            <div className="card" style={{ padding: "1.2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "0.4rem" }}>
                <Compass size={16} /> Расстояние от Земли
              </div>
              <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--accent-cyan)" }}>
                {planet.distanceLightYears.toLocaleString()} <span style={{ fontSize: "0.9rem", fontWeight: 400 }}>св. лет</span>
              </div>
            </div>

            <div className="card" style={{ padding: "1.2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "0.4rem" }}>
                <Thermometer size={16} /> Температура поверхности
              </div>
              <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--accent-amber)" }}>
                {planet.surfaceTempKelvin} K <span style={{ fontSize: "0.9rem", fontWeight: 400 }}>({tempCelsius}°C)</span>
              </div>
            </div>

            <div className="card" style={{ padding: "1.2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "0.4rem" }}>
                <Weight size={16} /> Масса (в земных)
              </div>
              <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--accent-purple)" }}>
                {planet.massEarths} <span style={{ fontSize: "0.9rem", fontWeight: 400 }}>M⊕</span>
              </div>
            </div>

            <div className="card" style={{ padding: "1.2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "0.4rem" }}>
                <Calendar size={16} /> Год открытия
              </div>
              <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)" }}>
                {planet.discoveryYear}
              </div>
            </div>

            <div className="card" style={{ padding: "1.2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "0.4rem" }}>
                <Orbit size={16} /> Орбитальный период
              </div>
              <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)" }}>
                {planet.orbitalPeriodDays ?? "—"} <span style={{ fontSize: "0.9rem", fontWeight: 400 }}>дней</span>
              </div>
            </div>

            <div className="card" style={{ padding: "1.2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "0.4rem" }}>
                <Telescope size={16} /> Метод обнаружения
              </div>
              <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text-primary)", paddingTop: "0.2rem" }}>
                {planet.discoveryMethod || "Транзит / Спектроскопия"}
              </div>
            </div>

            <div className="card" style={{ padding: "1.2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "0.4rem" }}>
                <Sun size={16} /> Спектральный класс
              </div>
              <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--accent-cyan)" }}>
                {planet.spectralType || planet.starType || "G2V"}
              </div>
            </div>

            <div className="card" style={{ padding: "1.2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "0.4rem" }}>
                <Sparkles size={16} /> Исследовательская миссия
              </div>
              <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--accent-indigo)" }}>
                {planet.mission}
              </div>
            </div>
          </div>

          <div className="detail-description-box">
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "0.8rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FileText size={18} color="var(--accent-cyan)" /> Астрофизическое описание
            </h3>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, fontSize: "1rem" }}>
              {planet.description}
            </p>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Link to="/planets" className="btn btn-secondary" style={{ textDecoration: "none" }}>
              <Compass size={16} /> Вернуться в каталог
            </Link>
          </div>
          </article>
        </>
      )}
    </div>
  );
};

export default PlanetDetailPage;