import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Navbar.css";
import logo from "../assets/Logo.png";
import profilePic from "../assets/profile.png";
import ThemeToggle from "./ThemeToggle";
import { isTokenValid } from "../services/api";

interface NavbarProps {
  user: string | null;
  onLogout: () => void;
  isAdmin: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, isAdmin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isTokenExpired, setIsTokenExpired] = useState(false);

  // Vérifier si le token est toujours valide
  useEffect(() => {
    const checkTokenValidity = () => {
      const tokenValid = isTokenValid();
      if (!tokenValid && user) {
        setIsTokenExpired(true);
      } else {
        setIsTokenExpired(false);
      }
    };

    // Vérification initiale
    checkTokenValidity();

    // Vérification périodique (toutes les minutes)
    const tokenCheckInterval = setInterval(checkTokenValidity, 60 * 1000);

    return () => {
      clearInterval(tokenCheckInterval);
    };
  }, [user]);

  // Si le token est expiré, déconnecter l'utilisateur
  useEffect(() => {
    if (isTokenExpired && user) {
      console.log("Token expiré détecté dans Navbar, déconnexion...");
      handleLogout();
    }
  }, [isTokenExpired, user]);

  const handleLogout = () => {
    onLogout();
    // Forcer un rechargement complet de l'application
    window.location.href = "/";
  };

  return (
    <div className="navbar-bg">
      <div className="navbar">
        <img
          src={logo}
          alt="TierHub Logo"
          className="logo"
          onClick={() => navigate("/")}
        />
        <div className={`nav-links ${showMobileMenu ? "active" : ""}`}>
          <button
            className={location.pathname === "/tierlists" ? "active" : ""}
            onClick={() => navigate("/tierlists")}
          >
            TierList
          </button>
          <button
            className={location.pathname === "/classements" ? "active" : ""}
            onClick={() => navigate("/classements")}
          >
            Classement
          </button>
          <button
            className={location.pathname === "/tournois" ? "active" : ""}
            onClick={() => navigate("/tournois")}
          >
            Tournois
          </button>
          <button
            className={location.pathname === "/allalbum" ? "active" : ""}
            onClick={() => navigate("/allalbum")}
          >
            Albums
          </button>
          {isAdmin && user && (
            <button
              className={`admin ${location.pathname === "/admin" ? "active" : ""}`}
              onClick={() => navigate("/admin")}
            >
              ADMIN
            </button>
          )}
        </div>
        <div className="nav-actions">
          <ThemeToggle position="navbar" />
          {user ? (
            <>
              <button
                className="add-album-button"
                onClick={() => navigate("/add-album")}
              >
                Add Album
              </button>
              <img
                src={profilePic}
                alt="Profil"
                className="profile-pic square"
                onClick={() => navigate("/profile")}
              />
              <div className="profile-dropdown">
                <div className="dropdown-content">
                  <div className="dropdown-user-info">
                    <p className="dropdown-username">{user}</p>
                    <p>{isAdmin ? "Administrateur" : "Utilisateur"}</p>
                  </div>
                  <button onClick={() => navigate("/profile")}>
                    Mon profil
                  </button>
                  <button onClick={() => navigate("/add-album")}>
                    Ajouter un album
                  </button>
                  <button className="logout-button" onClick={handleLogout}>
                    Se déconnecter
                  </button>
                </div>
              </div>
            </>
          ) : (
            <button onClick={() => navigate("/login")} className="login-button">
              Connexion
            </button>
          )}
        </div>
        <button
          className="mobile-menu-toggle"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          <div className={`hamburger ${showMobileMenu ? "active" : ""}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Navbar;
