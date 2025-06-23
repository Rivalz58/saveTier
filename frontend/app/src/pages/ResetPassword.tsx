/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Login.css";
import { resetPassword, verifyResetToken } from "../services/passwordApi";

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(true);
  const [isResetSuccessful, setIsResetSuccessful] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Extract token from URL when component mounts
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const resetToken = searchParams.get("token");

    if (!resetToken) {
      setIsTokenValid(false);
      setIsError(true);
      setMessage(
        "Lien de réinitialisation invalide ou expiré. Veuillez demander un nouveau lien.",
      );
      return;
    }

    setToken(resetToken);

  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    // Validate passwords
    if (password !== confirmPassword) {
      setIsError(true);
      setMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    if (password.length < 8) {
      setIsError(true);
      setMessage("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setIsLoading(true);

    try {
      // Utilise la vraie fonction API pour réinitialiser le mot de passe
      await resetPassword(token, password);

      setIsResetSuccessful(true);
      setMessage("Votre mot de passe a été réinitialisé avec succès !");

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error: any) {
      console.error("Error resetting password:", error);
      setIsError(true);
      setMessage(
        error.response?.data?.message ||
          "Une erreur est survenue lors de la réinitialisation du mot de passe.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // If token is invalid, show error message
  if (!isTokenValid) {
    return (
      <div className="auth-container">
        <h2>Réinitialisation de mot de passe</h2>
        <p className="error-message">{message}</p>
        <button
          onClick={() => navigate("/forgot-password")}
          className="primary-button"
        >
          Demander un nouveau lien
        </button>
        <p>
          <a href="/login">Retour à la connexion</a>
        </p>
      </div>
    );
  }

  // If reset is successful, show success message
  if (isResetSuccessful) {
    return (
      <div className="auth-container">
        <h2>Réinitialisation réussie</h2>
        <p className="success-message">{message}</p>
        <p>Vous allez être redirigé vers la page de connexion...</p>
        <button onClick={() => navigate("/login")} className="primary-button">
          Aller à la connexion
        </button>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <h2>Réinitialisation de mot de passe</h2>

      {message && (
        <p className={isError ? "error-message" : "success-message"}>
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Nouveau mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
          minLength={8}
        />

        <input
          type="password"
          placeholder="Confirmer le nouveau mot de passe"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={isLoading}
          minLength={8}
        />

        <button type="submit" disabled={isLoading}>
          {isLoading
            ? "Réinitialisation en cours..."
            : "Réinitialiser le mot de passe"}
        </button>
      </form>

      <p>
        <a href="/login">Retour à la connexion</a>
      </p>
    </div>
  );
};

export default ResetPassword;