import api from "./api";

// Interface pour un album
export interface Album {
  id: number;
  name: string;
  status: "public" | "private" | "quarantined";
  author: {
    id: number;
    username: string;
    nametag: string;
  };
  categories: {
    id: number;
    name: string;
  }[];
  images: {
    id: number;
    name: string;
    path_image: string;
    description: string | null;
    url: string | null;
  }[];
  createdAt: string;
  updatedAt: string;
}

// Interface pour l'auteur (utilisateur connecté)
export interface User {
  id: number;
  username: string;
  nametag: string;
  roles?: {
    id: number;
    libelle: string;
  }[];
}

// Récupérer les détails d'un album avec ses images
export const getAlbumWithImages = async (albumId: string): Promise<Album> => {
  try {
    const response = await api.get(`/album/${albumId}`);
    if (!response.data || !response.data.data) {
      throw new Error("Album non trouvé");
    }
    return response.data.data;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'album:", error);
    throw error;
  }
};

// Récupérer l'utilisateur actuel
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await api.get("/me");
    if (!response.data || !response.data.data) {
      return null;
    }
    return response.data.data;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    return null;
  }
};

// Vérifier si l'utilisateur a accès à l'album
export const checkAlbumAccess = async (
  albumId: string,
): Promise<{
  hasAccess: boolean;
  album?: Album;
  user?: User | null;
  message?: string;
}> => {
  try {
    // Récupérer les détails de l'album
    const album = await getAlbumWithImages(albumId);

    // Si l'album est public, tout le monde y a accès
    if (album.status === "public") {
      return {
        hasAccess: true,
        album,
        message: "Album public",
      };
    }

    // Si l'album n'est pas public, l'utilisateur doit être connecté
    const user = await getCurrentUser();
    if (!user) {
      return {
        hasAccess: false,
        album,
        message:
          "Accès refusé: vous devez être connecté pour accéder à cet album privé",
      };
    }

    // Vérifier si l'utilisateur est l'auteur de l'album
    if (album.author.id === user.id) {
      return {
        hasAccess: true,
        album,
        user,
        message: "Propriétaire de l'album",
      };
    }

    // Vérifier si l'utilisateur est un administrateur
    const isAdmin =
      user.roles &&
      user.roles.some(
        (role) =>
          role.libelle.toLowerCase() === "admin" ||
          role.libelle.toLowerCase() === "modo",
      );

    if (isAdmin) {
      return {
        hasAccess: true,
        album,
        user,
        message: "Accès administrateur",
      };
    }

    // Si on arrive ici, l'utilisateur n'a pas accès
    return {
      hasAccess: false,
      album,
      user,
      message: "Accès refusé: album privé",
    };
  } catch (error) {
    console.error("Erreur lors de la vérification de l'accès:", error);
    return {
      hasAccess: false,
      message: "Erreur: impossible de vérifier l'accès à l'album",
    };
  }
};

export default {
  getAlbumWithImages,
  getCurrentUser,
  checkAlbumAccess,
};
