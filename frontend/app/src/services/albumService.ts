import api from './api';

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
    
    // Envoyer la requête
    const response = await api.post<AddImageResponse>('/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'image:', error);
    throw error;
  }
};

// Fonction pour ajouter des catégories à un album
export const addCategoriesToAlbum = async (albumId: number, categoryNames: string[]): Promise<unknown> => {
  try {
    // On doit faire une requête par catégorie
    const promises = categoryNames.map(categoryName => 
      api.post(`/album/${albumId}/category`, { name: categoryName })
    );
    
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

export default {
  createAlbum,
  addImageToAlbum,
  addCategoriesToAlbum,
  getCategories
};