import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import { requestPasswordReset } from "../services/passwordApi";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    // Validation de l'email avant envoi
    if (!email || !email.includes("@")) {
      setIsError(true);
      setMessage("Veuillez entrer une adresse email valide.");
      return;
    }

    setIsLoading(true);

    try {
      // Utilise la vraie fonction API pour demander la réinitialisation
      await requestPasswordReset(email);

      setIsSubmitted(true);
      setMessage(
        "Un email de réinitialisation a été envoyé si l'adresse existe dans notre système.",
      );
      setIsError(false);
    } catch (error: any) {
      console.error("Error in password reset request:", error);
      setIsError(true);
      
      // Gestion spécifique des erreurs
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message;
        if (errorMessage?.includes("domain")) {
          setMessage("L'adresse email est invalide ou le domaine ne peut pas recevoir d'emails.");
        } else if (errorMessage?.includes("not found")) {
          setMessage("Aucun compte n'est associé à cette adresse email.");
        } else {
          setMessage("Veuillez vérifier l'adresse email saisie.");
        }
      } else {
        setMessage("Une erreur est survenue. Veuillez réessayer plus tard.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Mot de passe oublié</h2>

      {message && (
        <p className={isError ? "error-message" : "success-message"}>
          {message}
        </p>
      )}

      {!isSubmitted ? (
        <>
          <p className="auth-description">
            Entrez votre adresse email et nous vous enverrons un lien pour
            réinitialiser votre mot de passe.
          </p>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />

            <button type="submit" disabled={isLoading}>
              {isLoading ? "Traitement en cours..." : "Envoyer le lien"}
            </button>
          </form>
        </>
      ) : (
        <div className="confirmation-message">
          <p>
            Un email a été envoyé avec les instructions pour réinitialiser votre
            mot de passe. Vérifiez votre boîte de réception (et éventuellement
            vos spams).
          </p>
          <button onClick={() => navigate("/login")} className="back-to-login">
            Retour à la connexion
          </button>
        </div>
      )}

      <p>
        <a href="/login">Retour à la connexion</a>
      </p>
    </div>
  );
};

export default ForgotPassword;