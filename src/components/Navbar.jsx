import React, { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  Rocket,
  Compass,
  BarChart3,
  Info,
  LogIn,
  UserPlus,
  User,
  LogOut,
  Menu,
  X,
  Wifi,
  WifiOff,
  Download
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { usePwa } from "../context/PwaContext";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { isOnline, canInstall, promptInstall } = usePwa();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavClick = (e) => {
    if (e.target.closest("a")) {
      setMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setMenuOpen(false);
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-top-row">
          <Link to="/" className="brand-group" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="brand-icon-wrapper">
              <Rocket className="brand-icon" size={24} />
            </div>
            <div className="brand-text-wrap">
              <h1 className="brand-title">COSMODEX</h1>
              <p className="brand-subtitle">Астрофизический каталог экзопланет</p>
            </div>
          </Link>

          <div className="navbar-mobile-controls">
            <span
              className={`connectivity-chip ${isOnline ? "online" : "offline"}`}
              title={isOnline ? "Подключение к сети активно" : "Офлайн-режим"}
              aria-live="polite"
            >
              {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
              <span className="connectivity-label">{isOnline ? "Онлайн" : "Офлайн"}</span>
            </span>

            {canInstall && (
              <button
                type="button"
                className="btn-install-pwa"
                onClick={promptInstall}
                title="Установить приложение CosmoDex"
              >
                <Download size={15} />
                <span className="install-label">Установить</span>
              </button>
            )}

            <button
              type="button"
              className="menu-toggle-btn"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        <nav
          className={`nav-links ${menuOpen ? "open" : ""}`}
          aria-label="Основная навигация"
          onClick={handleNavClick}
        >
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            Главная
          </NavLink>

          <NavLink
            to="/planets"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <Compass size={16} className="icon-inline" />
            Планеты
          </NavLink>

          <NavLink
            to="/dashboard"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <BarChart3 size={16} className="icon-inline" />
            Дашборд
          </NavLink>

          <NavLink
            to="/about"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <Info size={16} className="icon-inline" />
            О проекте
          </NavLink>

          {user ? (
            <>
              <NavLink
                to="/profile"
                className={({ isActive }) => `nav-link profile-nav-link ${isActive ? "active" : ""}`}
              >
                <User size={16} className="icon-inline" />
                Профиль
              </NavLink>

              <button
                type="button"
                onClick={handleLogout}
                className="nav-link logout-nav-link"
                title="Выйти из аккаунта"
              >
                <LogOut size={16} className="icon-inline" />
                Выход
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) => `nav-link login-nav-link ${isActive ? "active" : ""}`}
              >
                <LogIn size={16} className="icon-inline" />
                Вход
              </NavLink>

              <NavLink
                to="/signup"
                className={({ isActive }) => `nav-link signup-nav-link ${isActive ? "active" : ""}`}
              >
                <UserPlus size={16} className="icon-inline" />
                Регистрация
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
