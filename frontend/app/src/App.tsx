import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate
} from "react-router-dom";

import "./App.css";
import "./styles/theme.css";
import { getCurrentUser, revokeToken, checkIsAdmin } from "./services/api";
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
  const [isLoading, setIsLoading] = useState(false); // Modifié pour ne pas bloquer l'interface
  const [isAdmin, setIsAdmin] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Fonction pour mettre à jour le statut d'un utilisateur sans afficher le chargement
  const checkAndUpdateUserStatus = async (showLoading = false) => {
    const token = localStorage.getItem("token");
    
    // Afficher le chargement uniquement si demandé
    if (showLoading) {
      setIsLoading(true);
    }
    
    if (token) {
      try {
        // Récupérer les informations utilisateur
        const response = await getCurrentUser();
        if (response && response.user) {
          setUser(response.user.username);
          
          // Vérifier directement si l'utilisateur est admin
          const adminStatus = await checkIsAdmin();
          console.log("Admin status:", adminStatus);
          setIsAdmin(adminStatus);
        } else {
          // Si pas de réponse correcte, réinitialiser les états
          setUser(null);
          setIsAdmin(false);
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur:", error);
        setUser(null);
        setIsAdmin(false);
        localStorage.removeItem("token");
      } finally {
        if (showLoading) {
          setIsLoading(false);
        }
        setIsInitialized(true);
      }
    } else {
      // Si pas de token, réinitialiser les états
      setUser(null);
      setIsAdmin(false);
      if (showLoading) {
        setIsLoading(false);
      }
      setIsInitialized(true);
    }
  };

  // Vérifier le statut de l'utilisateur au chargement initial
  useEffect(() => {
    // Lors du chargement initial, nous voulons afficher le chargement
    checkAndUpdateUserStatus(true);
  }, []);

  // Fonction pour se connecter à un utilisateur
  const handleLogin = async (username: string) => {
    setUser(username);
    // Mettre à jour le statut admin après la connexion
    await checkAndUpdateUserStatus();
  };

  // Fonction pour se déconnecter
  const handleLogout = async () => {
    try {
      await revokeToken();
    } catch (error) {
      console.error("Erreur lors de la révocation:", error);
    } finally {
      // Réinitialiser tous les états
      localStorage.removeItem("token");
      setUser(null);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  // Afficher le chargement uniquement lors de l'initialisation de l'application
  if (isLoading && !isInitialized) {
    return <div>Chargement...</div>;
  }

  return (
    <Router>
      <MainLayout 
        user={user} 
        setUser={handleLogin} 
        onLogout={handleLogout} 
        isAdmin={isAdmin} 
        refreshUserStatus={checkAndUpdateUserStatus}
      />
    </Router>
  );
};

interface MainLayoutProps {
  user: string | null;
  setUser: (username: string) => void;
  onLogout: () => void;
  isAdmin: boolean;
  refreshUserStatus: (showLoading?: boolean) => Promise<void>;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  user, 
  setUser, 
  onLogout, 
  isAdmin,
  refreshUserStatus
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  
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

  // Rafraîchir le statut utilisateur lors du changement de route pour pages spécifiques
  // mais sans afficher le chargement
  useEffect(() => {
    if (location.pathname === "/admin") {
      refreshUserStatus(false);
    }
  }, [location.pathname, refreshUserStatus]);

  // Rediriger si l'utilisateur n'est pas connecté ou n'est pas admin
  useEffect(() => {
    if (location.pathname === "/admin" && !isAdmin && user !== null) {
      navigate("/");
    }
    
    if (location.pathname === "/profile" && !user) {
      navigate("/login");
    }
  }, [location.pathname, isAdmin, user, navigate]);

  return (
    <div className="container">
      {!shouldHideNavbar && (
        <Navbar 
          user={user} 
          onLogout={onLogout} 
          isAdmin={isAdmin} 
        />
      )}
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