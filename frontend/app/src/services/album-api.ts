import api from './api';
import axios from "axios";
// Types pour les données d'albums
export interface AlbumImage {
  id: number;
  name: string;
  path_image: string;
  description: string | null;
  url: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AlbumCategory {
  id: number;
  name: string;
  MPossessCategory: {
    id_album: number;
    id_category: number;
  };
}

export interface AlbumAuthor {
  id: number;
  username: string;
  nametag: string;
  email: string;
  status: string;
  last_connection: string;
  createdAt: string;
  updatedAt: string;
}

// Interface pour les statistiques (à compléter lorsque l'API fournira ces informations)
export interface AlbumStats {
  views?: number;
  uses?: number;
  likes?: number;
  favorites?: number;
}

export interface Album {
  id: number;
  name: string;
  status: 'public' | 'private' | 'quarantined';
  createdAt: string;
  updatedAt: string;
  categories: AlbumCategory[];
  author: AlbumAuthor;
  image: AlbumImage[];
  stats?: AlbumStats; // Propriété optionnelle pour les futures statistiques
}

export interface AlbumsResponse {
  status: string;
  message: string;
  data: Album[];
}

// Fonction pour récupérer tous les albums
export const getAllAlbums = async (): Promise<Album[]> => {
  try {
    const response = await api.get<AlbumsResponse>('/album');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching albums:', error);
    return [];
  }
};

// Fonction pour obtenir uniquement les albums publics
export const getPublicAlbums = async (): Promise<Album[]> => {
  try {
    const albums = await getAllAlbums();
    return albums.filter(album => album.status === 'public');
  } catch (error) {
    console.error('Error fetching public albums:', error);
    return [];
  }
};

// Fonction pour obtenir les albums par catégorie
export const getAlbumsByCategory = async (): Promise<Map<string, Album[]>> => {
  try {
    const publicAlbums = await getPublicAlbums();
    const albumsByCategory = new Map<string, Album[]>();
    
    // Parcourir tous les albums publics
    publicAlbums.forEach(album => {
      // Pour chaque catégorie dans l'album
      album.categories.forEach(category => {
        const categoryName = category.name;
        
        // Si la catégorie n'existe pas encore dans la map, l'initialiser
        if (!albumsByCategory.has(categoryName)) {
          albumsByCategory.set(categoryName, []);
        }
        
        // Ajouter l'album à cette catégorie
        albumsByCategory.get(categoryName)?.push(album);
      });
    });
    
    // Trier les albums dans chaque catégorie (préparé pour le tri par vues/popularité)
    albumsByCategory.forEach((albums) => {
      // TODO: À remplacer par un tri basé sur les vues quand disponible
      albums.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      // Futur code pour le tri par popularité:
      /*
      albums.sort((a, b) => (b.stats?.views || 0) - (a.stats?.views || 0));
      */
    });
    
    return albumsByCategory;
  } catch (error) {
    console.error('Error organizing albums by category:', error);
    return new Map<string, Album[]>();
  }
};

// Obtenir les albums les plus populaires (temporairement par date, mais préparé pour le tri par vues)
export const getPopularAlbums = async (limit: number = 5): Promise<Album[]> => {
  try {
    const publicAlbums = await getPublicAlbums();
    
    // TODO: À remplacer par un tri basé sur les vues quand l'API fournira cette information
    // Pour l'instant, on utilise la date de création comme approximation
    return publicAlbums
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
    
    // Code à utiliser lorsque l'API fournira des statistiques de vues:
    /*
    return publicAlbums
      .sort((a, b) => (b.stats?.views || 0) - (a.stats?.views || 0))
      .slice(0, limit);
    */
  } catch (error) {
    console.error('Error fetching popular albums:', error);
    return [];
  }
};

// Obtenir tous les noms de catégories disponibles
export const getAllCategoryNames = async (): Promise<string[]> => {
  try {
    const albumsByCategory = await getAlbumsByCategory();
    return Array.from(albumsByCategory.keys());
  } catch (error) {
    console.error('Error fetching category names:', error);
    return [];
  }
};

// Créer un album et renvoyer son ID
export async function createAlbum(data: {
  name: string;
  categories: string[];
  description: string;
}): Promise<string> {
  // Appel à votre backend
  // Par exemple: POST /api/albums
  // Le backend renvoie { _id: "<id_de_l_album>" }.
  const response = await axios.post("/api/albums", data);
  return response.data._id; 
}

// Uploader une image vers un album
export async function uploadImage(albumId: string, payload: FormData): Promise<void> {
  // Par exemple: POST /api/albums/:albumId/images
  await axios.post(`/api/albums/${albumId}/images`, payload);
}