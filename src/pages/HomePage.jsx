import React from "react";
import { Link } from "react-router-dom";
import { Compass, BarChart3, Info, Sparkles, ArrowRight, ShieldCheck, Database, Telescope } from "lucide-react";
import heroImg from "../assets/hero.png";

export const HomePage = () => {
  return (
    <div className="home-page">
      {/* Hero секция с интро, изображением и кнопками */}
      <section className="hero-section">
        {/* Левая колонка: Текст и навигация */}
        <div>
          <div className="hero-badge">
            <Sparkles size={16} /> Космическая астрофизическая база
          </div>

          <h1 className="hero-title">
            Исследуйте далекие миры и экзопланеты
          </h1>

          <p className="hero-description">
            Добро пожаловать в <strong>CosmoDex</strong> — интерактивную платформу для исследования подтвержденных экзопланет, открытых миссиями Kepler, TESS, James Webb и Hubble. Изучайте параметры атмосфер, пригодность для жизни и аналитику звездных систем.
          </p>

          {/* Навигационные ссылки */}
          <div className="hero-actions">
            <Link to="/planets" className="btn btn-primary hero-btn-primary" style={{ textDecoration: "none" }}>
              <Compass size={20} /> Перейти в каталог <ArrowRight size={18} />
            </Link>

            <Link to="/dashboard" className="btn btn-secondary hero-btn-secondary" style={{ textDecoration: "none" }}>
              <BarChart3 size={20} /> Дашборд аналитики
            </Link>

            <Link to="/about" className="btn btn-secondary hero-btn-secondary" style={{ textDecoration: "none" }}>
              <Info size={20} /> О проекте
            </Link>
          </div>
        </div>

        {/* Правая колонка: Изображение */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{
            position: "relative",
            width: "100%",
            maxWidth: 420,
            borderRadius: "20px",
            padding: "10px",
            background: "radial-gradient(circle, rgba(56, 189, 248, 0.2) 0%, transparent 70%)"
          }}>
            <img
              src={heroImg}
              alt="CosmoDex Exoplanet Explorer"
              style={{
                width: "100%",
                height: "auto",
                borderRadius: "16px",
                boxShadow: "0 10px 30px rgba(99, 102, 241, 0.3)",
                display: "block"
              }}
            />
          </div>
        </div>
      </section>

      {/* Информационные карточки под Hero */}
      <section className="home-features-grid">
        <div className="feature-card" style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: "16px",
          padding: "1.8rem",
          transition: "transform 0.2s"
        }}>
          <div style={{ background: "rgba(56, 189, 248, 0.15)", width: 44, height: 44, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-cyan)", marginBottom: "1rem" }}>
            <Database size={24} />
          </div>
          <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>100+ Экзопланет</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: 1.6 }}>
            Детализированные параметры: масса, радиус, температура поверхности, родительская звезда и световые года.
          </p>
        </div>

        <div className="feature-card" style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: "16px",
          padding: "1.8rem"
        }}>
          <div style={{ background: "rgba(99, 102, 241, 0.15)", width: 44, height: 44, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-indigo)", marginBottom: "1rem" }}>
            <Telescope size={24} />
          </div>
          <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>Космические миссии</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: 1.6 }}>
            Фильтрация открытий по космическим обсерваториям NASA и ESA: Kepler, TESS, James Webb.
          </p>
        </div>

        <div className="feature-card" style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: "16px",
          padding: "1.8rem"
        }}>
          <div style={{ background: "rgba(16, 185, 129, 0.15)", width: 44, height: 44, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-emerald)", marginBottom: "1rem" }}>
            <ShieldCheck size={24} />
          </div>
          <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>Обитаемая зона</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: 1.6 }}>
            Отбор потенциально пригодных для жизни миров с жидкой водой на поверхности.
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
