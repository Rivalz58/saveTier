import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import api from "../services/api";

const NewPassword: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    // Validate passwords
    if (newPassword !== confirmPassword) {
      setIsError(true);
      setMessage("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }

    if (newPassword.length < 8) {
      setIsError(true);
      setMessage(
        "Le nouveau mot de passe doit contenir au moins 8 caractères.",
      );
      return;
    }

    if (currentPassword === newPassword) {
      setIsError(true);
      setMessage("Le nouveau mot de passe doit être différent de l'ancien.");
      return;
    }

    setIsLoading(true);

    try {
      // Call the API endpoint for changing password
      await api.put("/new-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });

      setMessage(
        "Votre mot de passe a été modifié avec succès. Veuillez vous reconnecter.",
      );
      setIsError(false);

      // Clear form fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Redirect to login after password change (as the token will be revoked)
      setTimeout(() => {
        // Logout the user
        localStorage.removeItem("token");
        navigate("/login");
      }, 3000);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error changing password:", error);
      setIsError(true);
      setMessage(
        error.response?.data?.message ||
          "Une erreur est survenue. Veuillez vérifier votre mot de passe actuel et réessayer.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Changer votre mot de passe</h2>

      {message && (
        <p className={isError ? "error-message" : "success-message"}>
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Mot de passe actuel"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          disabled={isLoading}
        />

        <input
          type="password"
          placeholder="Nouveau mot de passe"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
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
          {isLoading ? "Traitement en cours..." : "Changer le mot de passe"}
        </button>
      </form>

      <p>
        <a href="/profile">Retour au profil</a>
      </p>
    </div>
  );
};

export default NewPassword;
