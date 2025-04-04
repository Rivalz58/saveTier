// src/services/user-content-api.ts
import api from './api';

// TYPES
interface ContentItem {
  id: string;
  name: string;
  image: string;
  isPublic: boolean;
  description?: string;
  createdAt: string;
  albumName?: string;
  albumId?: string;
  categories?: string[];
}

interface AlbumItem extends ContentItem {
  usageCount: number;
}

interface UserInfo {
  id: number;
  username: string;
  nametag: string;
  email: string;
  status: string;
  last_connection: string;
  createdAt: string;
  updatedAt: string;
  roles: Array<{id: number, libelle: string}>;
}

// FONCTIONS D'INFORMATIONS UTILISATEUR

// Récupérer les informations de l'utilisateur actuel
export const getUserInfo = async (): Promise<UserInfo> => {
  try {
    const response = await api.get("/me");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching user info:", error);
    throw error;
  }
};

// Mettre à jour le nom d'utilisateur
export const updateUsername = async (username: string) => {
  try {
    const response = await api.put("/me", { username });
    return response.data;
  } catch (error) {
    console.error("Error updating username:", error);
    throw error;
  }
};

// Changer le mot de passe
export const changePassword = async (currentPassword: string, newPassword: string) => {
  try {
    const response = await api.put("/new-password", {
      current_password: currentPassword,
      new_password: newPassword
    });
    return response.data;
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
};

// Déconnexion (révocation du token)
export const logout = async () => {
  try {
    const response = await api.post("/revocation");
    return response.data;
  } catch (error) {
    console.error("Error during logout:", error);
    throw error;
  }
};

// FONCTIONS DE RÉCUPÉRATION DE CONTENU

// Récupérer les albums de l'utilisateur (en utilisant les routes existantes)
export const getUserAlbums = async (userID: string): Promise<AlbumItem[]> => {
  try {
    // Récupérer tous les albums puis filtrer par utilisateur
    const response = await api.get("/album");
    
    // Filtrer les albums qui appartiennent à l'utilisateur spécifié
    const userAlbums = response.data.data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((album: any) => album.author && album.author.id.toString() === userID)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((album: any) => ({
        id: album.id.toString(),
        name: album.name,
        image: album.image && album.image.length > 0 
          ? album.image[0].path_image 
          : '/default-image.jpg',
        isPublic: album.status === 'public',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        categories: album.categories.map((cat: any) => cat.name),
        usageCount: Math.floor(Math.random() * 100) + 10, // Simuler l'utilisation jusqu'à ce que l'API le fournisse
        createdAt: album.createdAt
      }));
    
    return userAlbums;
  } catch (error) {
    console.error("Error fetching user albums:", error);
    return [];
  }
};

// Récupérer les tierlists de l'utilisateur (en utilisant les routes existantes)
export const getUserTierlists = async (userID: string): Promise<ContentItem[]> => {
  try {
    // Récupérer toutes les tierlists puis filtrer par utilisateur
    const response = await api.get("/tierlist");
    
    // Filtrer les tierlists qui appartiennent à l'utilisateur spécifié
    const userTierlists = response.data.data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((tierlist: any) => tierlist.author && tierlist.author.id.toString() === userID)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((tierlist: any) => ({
        id: tierlist.id.toString(),
        name: tierlist.name,
        image: tierlist.album && tierlist.album.image && tierlist.album.image.length > 0 
          ? tierlist.album.image[0].path_image 
          : '/default-image.jpg',
        isPublic: !tierlist.private,
        description: tierlist.description || '',
        createdAt: tierlist.createdAt,
        albumName: tierlist.album ? tierlist.album.name : '',
        albumId: tierlist.album ? tierlist.album.id.toString() : '',
        categories: tierlist.album && tierlist.album.categories 
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? tierlist.album.categories.map((cat: any) => cat.name) 
          : []
      }));
    
    return userTierlists;
  } catch (error) {
    console.error("Error fetching user tierlists:", error);
    return [];
  }
};

// Récupérer les tournois de l'utilisateur (en utilisant les routes existantes)
export const getUserTournaments = async (userID: string): Promise<ContentItem[]> => {
  try {
    // Récupérer tous les tournois puis filtrer par utilisateur
    const response = await api.get("/tournament");
    
    // Filtrer les tournois qui appartiennent à l'utilisateur spécifié
    const userTournaments = response.data.data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((tournament: any) => tournament.author && tournament.author.id.toString() === userID)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((tournament: any) => ({
        id: tournament.id.toString(),
        name: tournament.name,
        image: tournament.album && tournament.album.image && tournament.album.image.length > 0 
          ? tournament.album.image[0].path_image 
          : '/default-image.jpg',
        isPublic: !tournament.private,
        description: tournament.description || '',
        createdAt: tournament.createdAt,
        albumName: tournament.album ? tournament.album.name : '',
        albumId: tournament.album ? tournament.album.id.toString() : '',
        categories: tournament.album && tournament.album.categories 
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? tournament.album.categories.map((cat: any) => cat.name) 
          : []
      }));
    
    return userTournaments;
  } catch (error) {
    console.error("Error fetching user tournaments:", error);
    return [];
  }
};

// Récupérer les classements de l'utilisateur (en utilisant les routes existantes)
export const getUserRankings = async (userID: string): Promise<ContentItem[]> => {
  try {
    // Récupérer tous les classements puis filtrer par utilisateur
    const response = await api.get("/ranking");
    
    // Filtrer les classements qui appartiennent à l'utilisateur spécifié
    const userRankings = response.data.data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((ranking: any) => ranking.author && ranking.author.id.toString() === userID)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((ranking: any) => ({
        id: ranking.id.toString(),
        name: ranking.name,
        image: ranking.album && ranking.album.image && ranking.album.image.length > 0 
          ? ranking.album.image[0].path_image 
          : '/default-image.jpg',
        isPublic: !ranking.private,
        description: ranking.description || '',
        createdAt: ranking.createdAt,
        albumName: ranking.album ? ranking.album.name : '',
        albumId: ranking.album ? ranking.album.id.toString() : '',
        categories: ranking.album && ranking.album.categories 
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? ranking.album.categories.map((cat: any) => cat.name) 
          : []
      }));
    
    return userRankings;
  } catch (error) {
    console.error("Error fetching user rankings:", error);
    return [];
  }
};

// FONCTIONS DE MODIFICATION DE CONTENU

// Modifier la visibilité d'un élément (public/privé)
export const toggleItemPrivacy = async (
  id: string, 
  type: "album" | "tierlist" | "tournament" | "ranking", 
  newPrivacyStatus: boolean
) => {
  try {
    // Les endpoints et données de requête varient selon le type de contenu
    const endpoints = {
      "album": `/album/${id}`,
      "tierlist": `/tierlist/${id}`,
      "tournament": `/tournament/${id}`,
      "ranking": `/ranking/${id}`
    };
    
    const requestData = type === 'album'
      ? { status: newPrivacyStatus ? 'public' : 'private' }  // Pour les albums
      : { private: !newPrivacyStatus };  // Pour les tierlists, tournois, classements
    
    // Appel API pour mettre à jour la visibilité
    const response = await api.put(endpoints[type], requestData);
    return response.data;
  } catch (error) {
    console.error(`Error toggling privacy for ${type}:`, error);
    throw error;
  }
};

export default {
  getUserInfo,
  updateUsername,
  changePassword,
  logout,
  getUserAlbums,
  getUserTierlists,
  getUserTournaments,
  getUserRankings,
  toggleItemPrivacy
};