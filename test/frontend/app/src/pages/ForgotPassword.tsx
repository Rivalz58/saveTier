import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import api from "../services/api";

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
    setIsLoading(true);

    try {
      // This would be a real API call in production
      // Here we simulate a successful response
      await api.post("/forgot-password", { email });
      
      setIsSubmitted(true);
      setMessage("Un email de réinitialisation a été envoyé si l'adresse existe dans notre système.");
      setIsError(false);
      
      // In a real application, the API would handle sending the reset email
      // For demo/development, we just show a success message
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error in password reset request:", error);
      setMessage(error.response?.data?.message || "Une erreur est survenue. Veuillez réessayer plus tard.");
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Mot de passe oublié</h2>
      
      {message && <p className={isError ? "error-message" : "success-message"}>{message}</p>}
      
      {!isSubmitted ? (
        <>
          <p className="auth-description">
            Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
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
            Un email a été envoyé avec les instructions pour réinitialiser votre mot de passe.
            Vérifiez votre boîte de réception (et éventuellement vos spams).
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