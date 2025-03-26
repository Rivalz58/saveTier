import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import { login, checkIsAdmin } from "../services/api";

interface LoginProps {
  setUser: (user: string) => void;
}

const Login: React.FC<LoginProps> = ({ setUser }) => {
  const [nametag, setNametag] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Appel à l'API de connexion
      const response = await login(nametag, password);
      
      // Vérifier si la connexion est réussie
      if (response && response.status === "success") {
        // Stocker le token dans localStorage
        localStorage.setItem('token', response.token);
        
        // Vérifier si l'utilisateur est admin
        const isAdmin = await checkIsAdmin();
        console.log("User logged in, admin status:", isAdmin);
        
        // Définir l'utilisateur avec son nametag
        setUser(nametag);
        
        // Rediriger vers la page d'accueil
        navigate("/");
      } else {
        setError("Une erreur est survenue lors de la connexion.");
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Erreur de connexion:", error);
      setError(error.response?.data?.message || "Identifiants incorrects ou serveur indisponible");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Connexion</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Nom d'utilisateur"
          value={nametag}
          onChange={(e) => setNametag(e.target.value)}
          required
          disabled={isLoading}
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />
        <div className="form-links">
          <a href="/forgot-password" className="forgot-password-link">
            Mot de passe oublié ?
          </a>
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Connexion en cours..." : "Se connecter"}
        </button>
      </form>
      <p>
        Pas encore de compte ? <a href="/register">S'inscrire</a>
      </p>
    </div>
  );
};

export default Login;