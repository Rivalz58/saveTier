import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Fonction de connexion
export const login = async (nametag: string, password: string) => {
  try {
    const response = await api.post("/login", { nametag, password });
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
    if (response.data && response.data.user && response.data.user.roles) {
      const roles = response.data.user.roles;
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

// Fonction utilitaire pour vérifier la validité du token
export const isTokenValid = () => {
  const token = localStorage.getItem("token");
  return !!token;
};

export default api;