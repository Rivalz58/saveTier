import api from './api';

// Types existants
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

export interface Album {
  id: number;
  name: string;
  status: 'public' | 'private' | 'quarantined';
  createdAt: string;
  updatedAt: string;
  categories: AlbumCategory[];
  author: AlbumAuthor;
  image: AlbumImage[];
  stats?: AlbumStats;
}

export interface AlbumStats {
  views?: number;
  uses?: number;
  likes?: number;
  favorites?: number;
}

export interface AlbumsResponse {
  status: string;
  message: string;
  data: Album[];
}

export interface AlbumResponse {
  status: string;
  message: string;
  data: Album;
}

// Fonction pour récupérer un album spécifique par ID
export const getAlbumById = async (id: number): Promise<Album | null> => {
  try {
    const response = await api.get<AlbumResponse>(`/album/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching album ${id}:`, error);
    return null;
  }
};

// Fonction pour extraire des informations d'album pour les tierlists, tournois et classements
export const getAlbumInfoForContent = async (albumId: number): Promise<{
  categories: string[];
  imagePath: string;
}> => {
  try {
    const defaultResult = {
      categories: [],
      imagePath: '/default-image.jpg'
    };
    
    if (!albumId) return defaultResult;
    
    const album = await getAlbumById(albumId);
    
    if (!album) return defaultResult;
    
    // Extraire les catégories
    const categories = album.categories.map(cat => cat.name);
    
    // Obtenir la première image ou utiliser une image par défaut
    const imagePath = album.image && album.image.length > 0 
      ? album.image[0].path_image 
      : '/default-image.jpg';
    
    return {
      categories,
      imagePath
    };
  } catch (error) {
    console.error(`Error getting album info for album ${albumId}:`, error);
    return {
      categories: [],
      imagePath: '/default-image.jpg'
    };
  }
};