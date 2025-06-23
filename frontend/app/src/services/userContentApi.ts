// src/services/user-content-api.ts
import api from "./api";

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
  roles: Array<{ id: number; libelle: string }>;
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
export const changePassword = async (
  currentPassword: string,
  newPassword: string,
) => {
  try {
    const response = await api.put("/new-password", {
      current_password: currentPassword,
      new_password: newPassword,
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

// Récupérer les albums de l'utilisateur à partir de /me
export const getUserAlbums = async (): Promise<AlbumItem[]> => {
  try {
    const response = await api.get("/me");
    const albums = response.data.data.albums || [];
    
    const userAlbums = await Promise.all(
      albums.map(async (album: any) => {
        let image = "/default-image.jpg";
        let categories: string[] = [];
        
        try {
          // Récupérer les détails de l'album pour obtenir l'image et les catégories
          const albumResponse = await api.get(`/album/${album.id}`);
          const albumDetails = albumResponse.data.data;
          
          if (albumDetails.images && albumDetails.images.length > 0) {
            image = albumDetails.images[0].path_image;
          }
          
          if (albumDetails.categories) {
            categories = albumDetails.categories.map((cat: any) => cat.name);
          }
        } catch (error) {
          // Ignore error, use default values
        }
        
        return {
          id: album.id.toString(),
          name: album.name,
          image,
          isPublic: album.status === "public",
          categories,
          usageCount: Math.floor(Math.random() * 100) + 10,
          createdAt: album.createdAt,
        };
      })
    );

    return userAlbums;
  } catch (error) {
    console.error("Error fetching user albums:", error);
    return [];
  }
};

// Récupérer les tierlists de l'utilisateur à partir de /me
export const getUserTierlists = async (): Promise<ContentItem[]> => {
  try {
    const response = await api.get("/me");
    const tierlists = response.data.data.tierlists || [];
    
    const userTierlists = await Promise.all(
      tierlists.map(async (tierlist: any) => {
        let image = "/default-image.jpg";
        let albumName = "";
        let albumId = "";
        let categories: string[] = [];
        
        try {
          // Récupérer les détails de la tierlist pour obtenir l'album associé
          const tierlistResponse = await api.get(`/tierlist/${tierlist.id}`);
          const tierlistDetails = tierlistResponse.data.data;
          
          if (tierlistDetails.album) {
            albumName = tierlistDetails.album.name;
            albumId = tierlistDetails.album.id.toString();
            
            // Récupérer les détails de l'album pour l'image
            try {
              const albumResponse = await api.get(`/album/${tierlistDetails.album.id}`);
              const albumDetails = albumResponse.data.data;
              
              if (albumDetails.images && albumDetails.images.length > 0) {
                image = albumDetails.images[0].path_image;
              }
              
              if (albumDetails.categories) {
                categories = albumDetails.categories.map((cat: any) => cat.name);
              }
            } catch (albumError) {
              // Ignore error, use default values
            }
          }
        } catch (error) {
          // Ignore error, use default values
        }
        
        return {
          id: tierlist.id.toString(),
          name: tierlist.name,
          image,
          isPublic: !tierlist.private,
          description: tierlist.description || "",
          createdAt: tierlist.createdAt,
          albumName,
          albumId,
          categories,
        };
      })
    );

    return userTierlists;
  } catch (error) {
    console.error("Error fetching user tierlists:", error);
    return [];
  }
};

// Récupérer les tournois de l'utilisateur à partir de /me
export const getUserTournaments = async (): Promise<ContentItem[]> => {
  try {
    const response = await api.get("/me");
    const tournaments = response.data.data.tournaments || [];
    
    const userTournaments = await Promise.all(
      tournaments.map(async (tournament: any) => {
        let image = "/default-image.jpg";
        let albumName = "";
        let albumId = "";
        let categories: string[] = [];
        
        try {
          // Récupérer les détails du tournoi pour obtenir l'album associé
          const tournamentResponse = await api.get(`/tournament/${tournament.id}`);
          const tournamentDetails = tournamentResponse.data.data;
          
          if (tournamentDetails.album) {
            albumName = tournamentDetails.album.name;
            albumId = tournamentDetails.album.id.toString();
            
            // Récupérer les détails de l'album pour l'image
            try {
              const albumResponse = await api.get(`/album/${tournamentDetails.album.id}`);
              const albumDetails = albumResponse.data.data;
              
              if (albumDetails.images && albumDetails.images.length > 0) {
                image = albumDetails.images[0].path_image;
              }
              
              if (albumDetails.categories) {
                categories = albumDetails.categories.map((cat: any) => cat.name);
              }
            } catch (albumError) {
              // Ignore error, use default values
            }
          }
        } catch (error) {
          // Ignore error, use default values
        }
        
        return {
          id: tournament.id.toString(),
          name: tournament.name,
          image,
          isPublic: !tournament.private,
          description: tournament.description || "",
          createdAt: tournament.createdAt,
          albumName,
          albumId,
          categories,
        };
      })
    );

    return userTournaments;
  } catch (error) {
    console.error("Error fetching user tournaments:", error);
    return [];
  }
};

// Récupérer les classements de l'utilisateur à partir de /me
export const getUserRankings = async (): Promise<ContentItem[]> => {
  try {
    const response = await api.get("/me");
    const rankings = response.data.data.rankings || [];
    
    const userRankings = await Promise.all(
      rankings.map(async (ranking: any) => {
        let image = "/default-image.jpg";
        let albumName = "";
        let albumId = "";
        let categories: string[] = [];
        
        try {
          // Récupérer les détails du classement pour obtenir l'album associé
          const rankingResponse = await api.get(`/ranking/${ranking.id}`);
          const rankingDetails = rankingResponse.data.data;
          
          if (rankingDetails.album) {
            albumName = rankingDetails.album.name;
            albumId = rankingDetails.album.id.toString();
            
            // Récupérer les détails de l'album pour l'image
            try {
              const albumResponse = await api.get(`/album/${rankingDetails.album.id}`);
              const albumDetails = albumResponse.data.data;
              
              if (albumDetails.images && albumDetails.images.length > 0) {
                image = albumDetails.images[0].path_image;
              }
              
              if (albumDetails.categories) {
                categories = albumDetails.categories.map((cat: any) => cat.name);
              }
            } catch (albumError) {
              // Ignore error, use default values
            }
          }
        } catch (error) {
          // Ignore error, use default values
        }
        
        return {
          id: ranking.id.toString(),
          name: ranking.name,
          image,
          isPublic: !ranking.private,
          description: ranking.description || "",
          createdAt: ranking.createdAt,
          albumName,
          albumId,
          categories,
        };
      })
    );

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
  newPrivacyStatus: boolean,
) => {
  try {
    // Les endpoints et données de requête varient selon le type de contenu
    const endpoints = {
      album: `/album/${id}`,
      tierlist: `/tierlist/${id}`,
      tournament: `/tournament/${id}`,
      ranking: `/ranking/${id}`,
    };

    const requestData =
      type === "album"
        ? { status: newPrivacyStatus ? "public" : "private" } // Pour les albums
        : { private: !newPrivacyStatus }; // Pour les tierlists, tournois, classements

    // Appel API pour mettre à jour la visibilité
    const response = await api.put(endpoints[type], requestData);
    return response.data;
  } catch (error) {
    console.error(`Error toggling privacy for ${type}:`, error);
    throw error;
  }
};

// Fonction optimisée pour récupérer tout le contenu utilisateur avec mise en cache des albums
export const getUserContent = async (): Promise<{
  albums: AlbumItem[];
  tierlists: ContentItem[];
  tournaments: ContentItem[];
  rankings: ContentItem[];
}> => {
  try {
    const response = await api.get("/me");
    const userData = response.data.data;
    
    // Cache pour les détails des albums
    const albumDetailsCache: { [id: string]: any } = {};
    
    // Fonction helper pour récupérer les détails d'un album avec cache
    const getAlbumDetails = async (albumId: string) => {
      if (!albumDetailsCache[albumId]) {
        try {
          const albumResponse = await api.get(`/album/${albumId}`);
          albumDetailsCache[albumId] = albumResponse.data.data;
        } catch (error) {
          albumDetailsCache[albumId] = null;
        }
      }
      return albumDetailsCache[albumId];
    };
    
    // Récupérer les albums
    const albums = await Promise.all(
      (userData.albums || []).map(async (album: any) => {
        const albumDetails = await getAlbumDetails(album.id.toString());
        
        return {
          id: album.id.toString(),
          name: album.name,
          image: albumDetails?.images?.[0]?.path_image || "/default-image.jpg",
          isPublic: album.status === "public",
          categories: albumDetails?.categories?.map((cat: any) => cat.name) || [],
          usageCount: Math.floor(Math.random() * 100) + 10,
          createdAt: album.createdAt,
        };
      })
    );
    
    // Récupérer les tierlists
    const tierlists = await Promise.all(
      (userData.tierlists || []).map(async (tierlist: any) => {
        let image = "/default-image.jpg";
        let albumName = "";
        let albumId = "";
        let categories: string[] = [];
        
        try {
          const tierlistResponse = await api.get(`/tierlist/${tierlist.id}`);
          const tierlistDetails = tierlistResponse.data.data;
          
          if (tierlistDetails.album) {
            albumName = tierlistDetails.album.name;
            albumId = tierlistDetails.album.id.toString();
            
            const albumDetails = await getAlbumDetails(albumId);
            if (albumDetails) {
              image = albumDetails.images?.[0]?.path_image || "/default-image.jpg";
              categories = albumDetails.categories?.map((cat: any) => cat.name) || [];
            }
          }
        } catch (error) {
          // Use default values
        }
        
        return {
          id: tierlist.id.toString(),
          name: tierlist.name,
          image,
          isPublic: !tierlist.private,
          description: tierlist.description || "",
          createdAt: tierlist.createdAt,
          albumName,
          albumId,
          categories,
        };
      })
    );
    
    // Récupérer les tournaments
    const tournaments = await Promise.all(
      (userData.tournaments || []).map(async (tournament: any) => {
        let image = "/default-image.jpg";
        let albumName = "";
        let albumId = "";
        let categories: string[] = [];
        
        try {
          const tournamentResponse = await api.get(`/tournament/${tournament.id}`);
          const tournamentDetails = tournamentResponse.data.data;
          
          if (tournamentDetails.album) {
            albumName = tournamentDetails.album.name;
            albumId = tournamentDetails.album.id.toString();
            
            const albumDetails = await getAlbumDetails(albumId);
            if (albumDetails) {
              image = albumDetails.images?.[0]?.path_image || "/default-image.jpg";
              categories = albumDetails.categories?.map((cat: any) => cat.name) || [];
            }
          }
        } catch (error) {
          // Use default values
        }
        
        return {
          id: tournament.id.toString(),
          name: tournament.name,
          image,
          isPublic: !tournament.private,
          description: tournament.description || "",
          createdAt: tournament.createdAt,
          albumName,
          albumId,
          categories,
        };
      })
    );
    
    // Récupérer les rankings
    const rankings = await Promise.all(
      (userData.rankings || []).map(async (ranking: any) => {
        let image = "/default-image.jpg";
        let albumName = "";
        let albumId = "";
        let categories: string[] = [];
        
        try {
          const rankingResponse = await api.get(`/ranking/${ranking.id}`);
          const rankingDetails = rankingResponse.data.data;
          
          if (rankingDetails.album) {
            albumName = rankingDetails.album.name;
            albumId = rankingDetails.album.id.toString();
            
            const albumDetails = await getAlbumDetails(albumId);
            if (albumDetails) {
              image = albumDetails.images?.[0]?.path_image || "/default-image.jpg";
              categories = albumDetails.categories?.map((cat: any) => cat.name) || [];
            }
          }
        } catch (error) {
          // Use default values
        }
        
        return {
          id: ranking.id.toString(),
          name: ranking.name,
          image,
          isPublic: !ranking.private,
          description: ranking.description || "",
          createdAt: ranking.createdAt,
          albumName,
          albumId,
          categories,
        };
      })
    );
    
    return {
      albums,
      tierlists,
      tournaments,
      rankings,
    };
  } catch (error) {
    console.error("Error fetching user content:", error);
    return {
      albums: [],
      tierlists: [],
      tournaments: [],
      rankings: [],
    };
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
  getUserContent,
  toggleItemPrivacy,
};
