import api, { isTokenValid } from './api';
import imageService, { ImageVerificationResult } from './imageService';

// Interface pour créer un nouvel album
export interface CreateAlbumRequest {
  name: string;
  status: 'public' | 'private';
  description?: string;
}

// Interface pour la réponse de création d'album
export interface CreateAlbumResponse {
  status: string;
  message: string;
  data: {
    id: number;
    name: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    // Autres propriétés potentielles
  };
}

// Interface pour ajouter une image
export interface AddImageRequest {
  file: File;
  name: string;
  description?: string;
  url?: string;
  id_album: number;
}

// Interface pour la réponse d'ajout d'image
export interface AddImageResponse {
  status: string;
  message: string;
  data: {
    id: number;
    name: string;
    path_image: string;
    description: string | null;
    url: string | null;
    id_album: number;
    createdAt: string;
    updatedAt: string;
  };
}

// Interface pour les résultats de traitement d'image
export interface ProcessImageResult {
  success: boolean;
  file?: File;
  originalFileName: string;
  originalIndex: number;
  errorMessage?: string;
}

// Fonction pour créer un nouvel album
export const createAlbum = async (albumData: CreateAlbumRequest): Promise<CreateAlbumResponse> => {
  try {
    const response = await api.post<CreateAlbumResponse>('/album', albumData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création de l\'album:', error);
    throw error;
  }
};

// Fonction pour ajouter une image à un album
export const addImageToAlbum = async (imageData: AddImageRequest): Promise<AddImageResponse> => {
  try {
    // Vérifier si le token est valide avant de tenter l'upload
    if (!isTokenValid()) {
      throw new Error("Session expirée - Impossible d'ajouter l'image");
    }
    
    // Créer un FormData pour l'envoi de fichier
    const formData = new FormData();
    
    formData.append('file', imageData.file);
    formData.append('name', imageData.name);
    
    // Ajouter les champs optionnels s'ils sont définis
    if (imageData.description) {
      formData.append('description', imageData.description);
    }
    
    if (imageData.url) {
      formData.append('url', imageData.url);
    }
    
    formData.append('id_album', imageData.id_album.toString());
    
    // Envoyer la requête avec un timeout plus long pour les grands fichiers
    const response = await api.post<AddImageResponse>('/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 60000 // Timeout de 60 secondes pour les uploads
    });
    
    return response.data;
  } catch (error: any) {
    // Amélioration de la gestion des erreurs
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Erreur d'authentification
      throw new Error("Session expirée pendant l'upload. Veuillez vous reconnecter.");
    } else if (error.code === 'ECONNABORTED') {
      // Timeout
      throw new Error("L'upload a pris trop de temps et a été interrompu. Veuillez réessayer avec une image plus petite.");
    } else {
      // Autres erreurs
      console.error('Erreur lors de l\'ajout de l\'image:', error);
      throw error;
    }
  }
};

// Fonction pour ajouter des catégories à un album
export const addCategoriesToAlbum = async (albumId: number, categoryIds: (string | number)[]): Promise<unknown> => {
  try {
    // On doit faire une requête par catégorie
    const promises = categoryIds.map(categoryId => {
      // Vérifier si categoryId est un string (nom) ou un number (id)
      if (typeof categoryId === 'string') {
        return api.post(`/album/${albumId}/category`, { name: categoryId });
      } else {
        return api.post(`/album/${albumId}/category`, { id_category: categoryId });
      }
    });
    
    // Attendre que toutes les requêtes soient terminées
    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    console.error('Erreur lors de l\'ajout des catégories:', error);
    throw error;
  }
};

// Fonction pour obtenir les catégories disponibles
export const getCategories = async (): Promise<{id: number, name: string}[]> => {
  try {
    const response = await api.get('/category');
    return response.data.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    throw error;
  }
};

// Fonction pour traiter une image avant upload (avec gestion des erreurs)
export const processImageBeforeUpload = async (
  imageFile: File, 
  index: number
): Promise<ProcessImageResult> => {
  try {
    const result: ImageVerificationResult = await imageService.processImage(imageFile);
    
    if (!result.isValid || !result.file) {
      return {
        success: false,
        originalFileName: imageFile.name,
        originalIndex: index,
        errorMessage: result.errorMessage || 'Erreur inconnue lors du traitement de l\'image.'
      };
    }
    
    return {
      success: true,
      file: result.file,
      originalFileName: imageFile.name,
      originalIndex: index
    };
  } catch (error) {
    console.error(`Erreur lors du traitement de l'image ${imageFile.name}:`, error);
    
    return {
      success: false,
      originalFileName: imageFile.name,
      originalIndex: index,
      errorMessage: 'Une erreur est survenue lors du traitement de l\'image.'
    };
  }
};

export default {
  createAlbum,
  addImageToAlbum,
  addCategoriesToAlbum,
  getCategories,
  processImageBeforeUpload
};