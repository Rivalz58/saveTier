import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";

import "./App.css";
import "./styles/theme.css";
import { getCurrentUser, revokeToken } from "./services/api";
import Navbar from "./components/Navbar";
import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import AddAlbum from "./pages/AddAlbum";
import AllAlbum from "./pages/AllAlbum";
import Tierlists from "./pages/Tierlists";
import Tournois from "./pages/Tournois";
import Classements from "./pages/Classements";
import SetupItemSelection from "./pages/SetupItemSelection";

const App: React.FC = () => {
  const [user, setUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const fetchUser = async () => {
        try {
          const response = await getCurrentUser();
          if (response && response.user) {
            const currentUser = response.user;
            setUser(currentUser.username);
            if (currentUser.roles && Array.isArray(currentUser.roles)) {
              // Si l'utilisateur a exactement un rôle "User", il n'est pas admin
              if (
                currentUser.roles.length === 1 &&
                currentUser.roles[0].libelle.toLowerCase() === "user"
              ) {
                setIsAdmin(false);
              } else if (
                currentUser.roles.some(
                  (role: { libelle: string }) => role.libelle.toLowerCase() === "admin"
                )
              ) {
                setIsAdmin(true);
              } else {
                setIsAdmin(false);
              }
            }
          }
        } catch (error) {
          console.error("Erreur lors de la récupération de l'utilisateur:", error);
          localStorage.removeItem("token");
        } finally {
          setIsLoading(false);
        }
      };
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await revokeToken();
    } catch (error) {
      console.error("Erreur lors de la révocation:", error);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <Router>
      <MainLayout user={user} setUser={setUser} onLogout={handleLogout} isAdmin={isAdmin} />
    </Router>
  );
};

const MainLayout: React.FC<{
  user: string | null;
  setUser: (u: string | null) => void;
  onLogout: () => void;
  isAdmin: boolean;
}> = ({ user, setUser, onLogout, isAdmin }) => {
  const location = useLocation();
  const hideNavbarPaths = [
    "/login",
    "/register",
    "/tierlists/create/editor",
    "/tournois/create/editor",
    "/classements/create/editor",
  ];
  const shouldHideNavbar = hideNavbarPaths.some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <div className="container">
      {!shouldHideNavbar && <Navbar user={user} onLogout={onLogout} isAdmin={isAdmin} />}
      <Routes>
        <Route path="/" element={<Homepage user={user} />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register setUser={setUser} />} />
        <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
        <Route path="/admin" element={<Admin user={user} isAdmin={isAdmin} />} />
        <Route path="/add-album" element={<AddAlbum user={user} />} />
        <Route path="/allalbum" element={<AllAlbum user={user} />} />
        <Route path="/tierlists" element={<Tierlists user={user} />} />
        <Route path="/classements" element={<Classements user={user} />} />
        <Route path="/tournois" element={<Tournois user={user} />} />
        <Route path="/setup" element={<SetupItemSelection user={user} />} />
        <Route path="/tierlists/create/editor" element={<div style={{ paddingTop: "100px", textAlign: "center" }}>Éditeur de Tierlist (à implémenter)</div>} />
        <Route path="/tierlists/:id" element={<div style={{ paddingTop: "100px", textAlign: "center" }}>Détail Tierlist (à implémenter)</div>} />
        <Route path="/tournois/create/editor" element={<div style={{ paddingTop: "100px", textAlign: "center" }}>Éditeur de Tournoi (à implémenter)</div>} />
        <Route path="/tournois/:id" element={<div style={{ paddingTop: "100px", textAlign: "center" }}>Détail Tournoi (à implémenter)</div>} />
        <Route path="/classements/create/editor" element={<div style={{ paddingTop: "100px", textAlign: "center" }}>Éditeur de Classement (à implémenter)</div>} />
        <Route path="/classements/:id" element={<div style={{ paddingTop: "100px", textAlign: "center" }}>Détail Classement (à implémenter)</div>} />
      </Routes>
    </div>
  );
};

export default App;
