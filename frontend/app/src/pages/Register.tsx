import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import { register, login, checkIsAdmin } from "../services/api";

interface RegisterProps {
  setUser: (user: string) => void;
}

const Register: React.FC<RegisterProps> = ({ setUser }) => {
  const [username, setUsername] = useState("");
  const [nametag, setNametag] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);
    setIsLoading(true);

    // Validation simple
    if (username.length < 3 || nametag.length < 3 || password.length < 8) {
      setMessage("Le nom d'utilisateur et nametag doivent contenir au moins 3 caractères, et le mot de passe au moins 8 caractères.");
      setIsError(true);
      setIsLoading(false);
      return;
    }

    try {
      // Appel à l'API d'inscription
      const registerResponse = await register(username, nametag, email, password);
      
      // Vérifier si l'inscription est réussie
      if (registerResponse && registerResponse.status === "success") {
        setMessage("Inscription réussie! Connexion en cours...");
        setIsError(false);
        
        try {
          // Connexion automatique après inscription réussie
          const loginResponse = await login(nametag, password);
          
          if (loginResponse && loginResponse.status === "success") {
            // Stocker le token dans localStorage
            localStorage.setItem('token', loginResponse.token);
            
            // Vérifier si l'utilisateur est admin (peu probable pour un nouvel utilisateur)
            await checkIsAdmin();
            
            // Définir l'utilisateur
            setUser(username);
            
            // Rediriger vers la page d'accueil
            setTimeout(() => {
              navigate("/");
            }, 1000); // Délai pour voir le message de succès
          }
        } catch (loginError) {
          console.error("Erreur de connexion après inscription:", loginError);
          setMessage("Inscription réussie, mais erreur lors de la connexion automatique. Veuillez vous connecter manuellement.");
          setIsError(true);
          
          // Rediriger vers la page de connexion après 2 secondes
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        }
      } else {
        setMessage("Une erreur est survenue lors de l'inscription.");
        setIsError(true);
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Erreur d'inscription:", error);
      setMessage(error.response?.data?.message || "Erreur lors de l'inscription. Veuillez réessayer.");
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Inscription</h2>
      {message && <p className={isError ? "error-message" : "success-message"}>{message}</p>}
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={isLoading}
        />
        <input
          type="text"
          placeholder="Nom d'utilisateur unique (nametag)"
          value={nametag}
          onChange={(e) => setNametag(e.target.value)}
          required
          disabled={isLoading}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          {isLoading ? "Inscription en cours..." : "S'inscrire"}
        </button>
      </form>
      <p>
        Déjà un compte ? <a href="/login">Se connecter</a>
      </p>
    </div>
  );
};

export default Register;