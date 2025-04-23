import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import AddAlbum from "./pages/AddAlbum";
import AllAlbum from "./pages/AllAlbum";
import Admin from "./pages/Admin";
import Tierlists from "./pages/Tierlists";
import Tournois from "./pages/Tournois";
import Classements from "./pages/Classements";
import SetupItemSelection from "./pages/SetupItemSelection";
import TierListEditor from "./pages/TierListEditor"; 
import TournamentEditor from "./pages/TournamentEditor";
import RankingEditor from "./pages/RankingEditor";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NewPassword from "./pages/NewPassword";
import AlbumEditor from "./pages/AlbumEditor";
import TokenExpirationHandler from "./components/TokenExpirationHandler";
import { getCurrentUser, checkIsAdmin, isTokenValid } from "./services/api";
import "./styles/theme.css";
import TierlistViewer from './components/TierlistViewer';
import TournamentViewer from './components/TournamentViewer';
import RankingViewer from './components/RankingViewer';
import "./App.css";

function App() {
  const [user, setUser] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fonction pour charger les informations de l'utilisateur
  const loadUser = async () => {
    // Vérifier si un token existe dans localStorage
    if (!isTokenValid()) {
      setUser(null);
      setIsAdmin(false);
      return;
    }

    try {
      // Récupérer les informations de l'utilisateur actuel
      const response = await getCurrentUser();
      
      if (response && response.data) {
        setUser(response.data.nametag);
        
        // Vérifier si l'utilisateur est administrateur
        const adminStatus = await checkIsAdmin();
        setIsAdmin(adminStatus);
      } else {
        // Si la réponse ne contient pas d'utilisateur, déconnexion
        setUser(null);
        setIsAdmin(false);
        localStorage.removeItem("token");
      }
    } catch (error) {
      console.error("Erreur lors du chargement de l'utilisateur:", error);
      // En cas d'erreur, déconnecter l'utilisateur
      setUser(null);
      setIsAdmin(false);
      localStorage.removeItem("token");
    }
  };

  // Effectuer le chargement initial de l'utilisateur
  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      await loadUser();
      setLoading(false);
    };

    initialLoad();
  }, []);

  // Écouter les changements dans le localStorage (déconnexion depuis un autre onglet)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token") {
        // Si le token a été modifié ou supprimé
        if (!e.newValue) {
          setUser(null);
          setIsAdmin(false);
        } else if (e.oldValue !== e.newValue) {
          // Si le token a été mis à jour, recharger l'utilisateur
          loadUser();
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Vérifier régulièrement la validité du token
  useEffect(() => {
    // Vérifier le token toutes les 5 minutes
    const tokenCheckInterval = setInterval(() => {
      if (!isTokenValid() && user !== null) {
        // Si le token n'est plus valide mais que l'utilisateur est considéré comme connecté
        console.log("Token expiré, déconnexion automatique");
        setUser(null);
        setIsAdmin(false);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      clearInterval(tokenCheckInterval);
    };
  }, [user]);

  // Fonction de déconnexion à passer à la navbar
  const handleLogout = () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem("token");
    // La redirection sera gérée par le composant qui appelle cette fonction
  };
  
  // Fonction pour mettre à jour l'état admin
  // Cette fonction sera passée aux composants Login et Register
  const updateUserStatus = async () => {
    try {
      const response = await getCurrentUser();
      if (response && response.data) {
        setUser(response.data.nametag);
        
        // Vérifier si l'utilisateur est administrateur
        const adminStatus = await checkIsAdmin();
        setIsAdmin(adminStatus);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut de l'utilisateur:", error);
    }
  };

  // Afficher un indicateur de chargement pendant la vérification de l'authentification
  if (loading) {
    return (
      <div className="loading-app">
        <div className="loading-spinner"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <TokenExpirationHandler setUser={setUser} setIsAdmin={setIsAdmin} />
      <Navbar user={user} onLogout={handleLogout} isAdmin={isAdmin} />
      <div className="page-content">
        <Routes>
          <Route path="/" element={<Homepage user={user} />} />
          <Route path="/login" element={<Login setUser={setUser} updateUserStatus={updateUserStatus} />} />
          <Route path="/register" element={<Register setUser={setUser} updateUserStatus={updateUserStatus} />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/new-password" element={<NewPassword />} />
          
          {/* Routes protégées qui nécessitent une authentification */}
          <Route 
            path="/profile" 
            element={user ? <Profile user={user} setUser={setUser} /> : <Navigate to="/login" />} 
          />
          
          {/* Routes pour l'administration */}
          <Route 
            path="/admin" 
            element={user && isAdmin ? <Admin user={user} isAdmin={isAdmin} /> : <Navigate to="/" />} 
          />
          
          {/* Route pour l'édition d'album depuis le panneau d'administration */}
          <Route 
            path="/admin/album/edit/:id" 
            element={user && isAdmin ? <AlbumEditor user={user} isAdmin={isAdmin} /> : <Navigate to="/" />} 
          />
          
          <Route 
            path="/add-album" 
            element={user ? <AddAlbum user={user} /> : <Navigate to="/login" />} 
          />
          
          {/* Route pour l'édition d'album depuis le profil utilisateur */}
          <Route 
            path="/album/edit/:id" 
            element={user ? <AlbumEditor user={user} /> : <Navigate to="/login" />} 
          />
          
          {/* Routes pour les éditeurs de contenu */}
          <Route path="/setup" element={<SetupItemSelection user={user} />} />
          <Route path="/tierlists/create/editor" element={<TierListEditor user={user} />} />
          <Route path="/tournois/create/editor" element={<TournamentEditor user={user} />} />
          <Route path="/classements/create/editor" element={<RankingEditor user={user} />} />
          
          {/* Routes pour visualiser et éditer les contenus existants */}
          <Route path="/tierlists/edit/:id" element={<TierListEditor user={user} />} />
          <Route path="/tierlists/:id" element={<TierlistViewer user={user} />} />
          
          <Route path="/tournois/edit/:id" element={<TournamentEditor user={user} />} />
          <Route path="/tournois/:id" element={<TournamentViewer user={user} />} />
          
          <Route path="/classements/edit/:id" element={<RankingEditor user={user} />} />
          <Route path="/classements/:id" element={<RankingViewer user={user} />} />
          
          {/* Routes accessibles à tous */}
          <Route path="/allalbum" element={<AllAlbum user={user} />} />
          <Route path="/tierlists" element={<Tierlists user={user} />} />
          <Route path="/tournois" element={<Tournois user={user} />} />
          <Route path="/classements" element={<Classements user={user} />} />
        </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  );
}

export default App;