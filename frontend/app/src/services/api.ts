import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Ajout pour supporter les cookies CSRF
});

// Variable pour stocker le token CSRF
let csrfToken: string | null = null;

// Fonction pour récupérer un nouveau token CSRF
const fetchCsrfToken = async () => {
  try {
    const response = await axios.get(`${api.defaults.baseURL}/csrf-token`, {
      withCredentials: true,
    });
    csrfToken = response.data.csrfToken;
    return csrfToken;
  } catch (error) {
    console.error("Erreur lors de la récupération du token CSRF:", error);
    return null;
  }
};

// Récupérer le token CSRF au démarrage de l'application
fetchCsrfToken();

// Intercepteur pour ajouter le token JWT et CSRF à chaque requête
api.interceptors.request.use(async (config) => {
  // Ajout du token JWT d'authentification
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Ajout du token CSRF pour les méthodes qui modifient des données
  if (["post", "put", "delete"].includes(config.method?.toLowerCase() || "")) {
    // Si nous n'avons pas encore de token CSRF, on en récupère un
    if (!csrfToken) {
      csrfToken = await fetchCsrfToken();
    }

    // Ajout du token CSRF à l'en-tête
    if (csrfToken) {
      config.headers["x-csrf-token"] = csrfToken;
    }
  }

  return config;
});

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Si l'erreur est due à une expiration de token ou à une authentification invalide
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      console.log("Session expirée ou authentification invalide");
      // Supprimer le token du localStorage
      localStorage.removeItem("token");
      
      // Créer un événement personnalisé pour signaler l'expiration du token
      const event = new CustomEvent("tokenExpired");
      window.dispatchEvent(event);
      
      // Si nous ne sommes pas déjà sur la page de connexion, rediriger
      if (!window.location.pathname.includes("/login")) {
        alert("Votre session a expiré. Veuillez vous reconnecter.");
        window.location.href = "/login";
      }
    }
    
    // Gestion spécifique des erreurs CSRF
    if (
      error.response &&
      error.response.status === 403 &&
      error.response.data?.message?.includes("csrf")
    ) {
      // On récupère un nouveau token CSRF et on réessaie la requête
      csrfToken = await fetchCsrfToken();

      // On récupère la configuration de la requête originale
      const originalRequest = error.config;
      if (csrfToken) {
        originalRequest.headers["x-csrf-token"] = csrfToken;
        return axios(originalRequest);
      }
    }
    
    return Promise.reject(error);
  }
);

// Fonction pour rafraîchir manuellement le token CSRF
export const refreshCsrfToken = async () => {
  return await fetchCsrfToken();
};

// Fonction de connexion
export const login = async (identifier: string, password: string) => {
  try {
    const response = await api.post("/login", { identifier, password });
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

// Fonction d'inscription
export const register = async (
  username: string,
  nametag: string,
  email: string,
  password: string
) => {
  try {
    const response = await api.post("/register", { username, nametag, email, password });
    return response.data;
  } catch (error) {
    console.error("Register error:", error);
    throw error;
  }
};

// Fonction pour récupérer l'utilisateur courant
export const getCurrentUser = async () => {
  try {
    const response = await api.get("/me");
    return response.data;
  } catch (error) {
    console.error("Get current user error:", error);
    throw error;
  }
};

// Fonction pour vérifier si l'utilisateur est admin
export const checkIsAdmin = async (): Promise<boolean> => {
  try {
    const response = await api.get("/me");
    
    // Vérifier si la réponse contient les données utilisateur
    if (response.data && response.data.data && response.data.data.roles) {
      const roles = response.data.data.roles;
      // Rechercher un rôle "Admin" (insensible à la casse)
      return roles.some((role: { id: number; libelle: string }) => 
        role.libelle.toLowerCase() === "admin"
      );
    }
    
    return false;
  } catch (error) {
    console.error("Check admin error:", error);
    return false;
  }
};

// Fonction pour révoquer le token (déconnexion)
export const revokeToken = async (): Promise<unknown> => {
  try {
    const response = await api.post("/revocation", null);
    console.log("Token revoked successfully");
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la révocation du token:", error);
    throw error;
  }
};

// Fonction améliorée pour vérifier la validité du token
export const isTokenValid = (): boolean => {
  const token = localStorage.getItem("token");
  if (!token) {
    return false;
  }
  
  try {
    // Si vous utilisez des JWT, vous pouvez également vérifier l'expiration
    // en décodant le token (sans vérifier la signature)
    const base64Url = token.split('.')[1];
    if (!base64Url) return false;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const payload = JSON.parse(jsonPayload);
    
    // Vérifier si le token a expiré
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      console.log("Token expiré selon la date d'expiration");
      localStorage.removeItem("token"); // Supprimer le token expiré
      return false;
    }
    
    return true;
  } catch (e) {
    // Si une erreur se produit lors du décodage, considérer le token comme valide
    // et laisser les requêtes API déterminer sa validité réelle
    console.warn("Impossible de décoder le token JWT", e);
    return true;
  }
};

export default api;