import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface TokenExpirationHandlerProps {
  setUser: (user: string | null) => void;
  setIsAdmin: (isAdmin: boolean) => void;
}

/**
 * Composant pour gérer l'expiration du token d'authentification.
 * Ce composant n'affiche rien, il écoute simplement les événements d'expiration du token
 * et met à jour l'état de l'application en conséquence.
 */
const TokenExpirationHandler: React.FC<TokenExpirationHandlerProps> = ({
  setUser,
  setIsAdmin,
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Gestionnaire d'événement pour l'expiration du token
    const handleTokenExpired = () => {
      console.log("Événement d'expiration du token détecté");
      setUser(null);
      setIsAdmin(false);

      // Rediriger vers la page de connexion si nécessaire
      const currentPath = window.location.pathname;
      if (
        currentPath.includes("/profile") ||
        currentPath.includes("/admin") ||
        currentPath.includes("/add-album")
      ) {
        navigate("/login", { replace: true });
      }
    };

    // Écouter l'événement personnalisé d'expiration du token
    window.addEventListener("tokenExpired", handleTokenExpired);

    // Nettoyage
    return () => {
      window.removeEventListener("tokenExpired", handleTokenExpired);
    };
  }, [navigate, setUser, setIsAdmin]);

  // Ce composant ne rend rien
  return null;
};

export default TokenExpirationHandler;
