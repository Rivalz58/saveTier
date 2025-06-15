import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import { login, checkIsAdmin } from "../services/api";

interface LoginProps {
  setUser: (user: string) => void;
  updateUserStatus?: () => Promise<void>; // Nouvelle prop pour mettre à jour le statut admin
}

const Login: React.FC<LoginProps> = ({ setUser, updateUserStatus }) => {
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
        localStorage.setItem("token", response.token);

        // Définir l'utilisateur avec son nametag
        setUser(nametag);

        // Mettre à jour le statut admin si la fonction est disponible
        if (updateUserStatus) {
          await updateUserStatus();
        } else {
          // Fallback si updateUserStatus n'est pas fourni
          const isAdmin = await checkIsAdmin();
          console.log("User logged in, admin status:", isAdmin);
        }

        // Rediriger vers la page d'accueil
        navigate("/");
      } else {
        setError("Une erreur est survenue lors de la connexion.");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Erreur de connexion:", error);
      setError(
        error.response?.data?.message ||
          "Identifiants incorrects ou serveur indisponible",
      );
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
          placeholder="Nom d'utilisateur ou Email"
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
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Connexion en cours..." : "Se connecter"}
        </button>
      </form>
      <p>
        <a href="/forgot-password">Mot de passe oublié?</a>
      </p>
      <p>
        Pas encore de compte ? <a href="/register">S'inscrire</a>
      </p>
    </div>
  );
};

export default Login;
