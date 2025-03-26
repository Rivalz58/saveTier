import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
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
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NewPassword from "./pages/NewPassword";
import { getCurrentUser, checkIsAdmin, isTokenValid } from "./services/api";
import "./styles/theme.css";

function App() {
  const [user, setUser] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true); // Nouveau state pour suivre le chargement initial

  useEffect(() => {
    const loadUser = async () => {
      setLoading(true); // Commencer le chargement
      
      // Vérifier si un token existe dans localStorage
      if (!isTokenValid()) {
        setUser(null);
        setIsAdmin(false);
        setLoading(false); // Finir le chargement
        return;
      }

      try {
        // Récupérer les informations de l'utilisateur actuel
        const response = await getCurrentUser();
        
        if (response && response.user) {
          setUser(response.user.nametag);
          
          // Vérifier si l'utilisateur est administrateur
          const adminStatus = await checkIsAdmin();
          setIsAdmin(adminStatus);
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l'utilisateur:", error);
        // En cas d'erreur, déconnecter l'utilisateur
        setUser(null);
        setIsAdmin(false);
        localStorage.removeItem("token");
      } finally {
        setLoading(false); // Finir le chargement, que ce soit un succès ou une erreur
      }
    };

    loadUser();
  }, []);

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
      <Navbar user={user} onLogout={() => setUser(null)} isAdmin={isAdmin} />
      <Routes>
        <Route path="/" element={<Homepage user={user} />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register setUser={setUser} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/new-password" element={<NewPassword />} />
        
        {/* Routes protégées qui nécessitent une authentification */}
        <Route 
          path="/profile" 
          element={user ? <Profile user={user} setUser={setUser} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/admin" 
          element={user && isAdmin ? <Admin user={user} isAdmin={isAdmin} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/add-album" 
          element={user ? <AddAlbum user={user} /> : <Navigate to="/login" />} 
        />
        
        {/* Routes accessibles à tous */}
        <Route path="/allalbum" element={<AllAlbum user={user} />} />
        <Route path="/tierlists" element={<Tierlists user={user} />} />
        <Route path="/tournois" element={<Tournois user={user} />} />
        <Route path="/classements" element={<Classements user={user} />} />
        <Route path="/setup" element={<SetupItemSelection user={user} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;