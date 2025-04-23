import React, { useState, useEffect } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import "../styles/Admin.css";
import AdminUserManagement from "../components/AdminUserManagement";
import AdminCategoryManagement from "../components/AdminCategoryManagement";
import AdminContentManagement from "../components/AdminContentManagement";
import AdminAlbumManagement from "../components/AdminAlbumManagement";
import AlbumEditor from "../pages/AlbumEditor";

type TabType = "users" | "tierlists" | "tournaments" | "rankings" | "albums" | "categories";

interface AdminProps {
  user: string | null;
  isAdmin: boolean;
}

const Admin: React.FC<AdminProps> = ({ user, isAdmin }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("users");

  // Redirection si l'utilisateur n'est pas admin
  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
    }
  }, [isAdmin, navigate]);

  // Vérifier si la navigation a spécifié un onglet actif
  useEffect(() => {
    const state = window.history.state;
    if (state && state.usr && state.usr.activeTab) {
      setActiveTab(state.usr.activeTab);
    }
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case "users":
        return <AdminUserManagement />;
      case "categories":
        return <AdminCategoryManagement />;
      case "tierlists":
        return <AdminContentManagement contentType="tierlist" contentTypeName="Tierlist" />;
      case "tournaments":
        return <AdminContentManagement contentType="tournament" contentTypeName="Tournoi" />;
      case "rankings":
        return <AdminContentManagement contentType="ranking" contentTypeName="Classement" />;
      case "albums":
        return <AdminAlbumManagement />;
      default:
        return <div>Sélectionnez un onglet</div>;
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <Routes>
      <Route path="/" element={
        <div className="admin-container">
          <h1 className="admin-title">Panneau d'Administration</h1>
          <div className="admin-tabs">
            <button
              className={`admin-tab ${activeTab === "users" ? "active" : ""}`}
              onClick={() => setActiveTab("users")}
            >
              Utilisateurs
            </button>
            <button
              className={`admin-tab ${activeTab === "categories" ? "active" : ""}`}
              onClick={() => setActiveTab("categories")}
            >
              Catégories
            </button>
            <button
              className={`admin-tab ${activeTab === "tierlists" ? "active" : ""}`}
              onClick={() => setActiveTab("tierlists")}
            >
              Tierlists
            </button>
            <button
              className={`admin-tab ${activeTab === "tournaments" ? "active" : ""}`}
              onClick={() => setActiveTab("tournaments")}
            >
              Tournois
            </button>
            <button
              className={`admin-tab ${activeTab === "rankings" ? "active" : ""}`}
              onClick={() => setActiveTab("rankings")}
            >
              Classements
            </button>
            <button
              className={`admin-tab ${activeTab === "albums" ? "active" : ""}`}
              onClick={() => setActiveTab("albums")}
            >
              Albums
            </button>
          </div>
          <div className="admin-content">
            {renderTabContent()}
          </div>
        </div>
      } />
      
      {/* Route pour l'éditeur d'album depuis l'admin */}
      <Route path="/album/edit/:id" element={<AlbumEditor user={user} isAdmin={isAdmin} />} />
    </Routes>
  );
};

export default Admin;