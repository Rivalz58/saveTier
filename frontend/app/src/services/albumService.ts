import api, { isTokenValid } from "./api";
import imageService, { ImageVerificationResult } from "./imageService";

// Interface pour créer un nouvel album
export interface CreateAlbumRequest {
  name: string;
  status: "public" | "private";
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
export const createAlbum = async (
  albumData: CreateAlbumRequest,
): Promise<CreateAlbumResponse> => {
  try {
    console.log("Création d'album avec les données:", albumData);
    const response = await api.post<CreateAlbumResponse>("/album", albumData);
    console.log("Réponse de création d'album:", response.data);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la création de l'album:", error);
    throw error;
  }
};

// Fonction pour supprimer un album
export const deleteAlbum = async (albumId: number): Promise<boolean> => {
  try {
    // Vérifier si le token est valide avant de tenter la suppression
    if (!isTokenValid()) {
      throw new Error("Session expirée - Impossible de supprimer l'album");
    }
    
    console.log(`Suppression de l'album: ${albumId}`);
    const response = await api.delete(`/album/${albumId}`);
    console.log(`Réponse de suppression d'album:`, response.data);
    return true;
  } catch (error) {
    console.error(`Erreur lors de la suppression de l'album ${albumId}:`, error);
    return false;
  }
};

// Fonction pour ajouter une image à un album
// Fonction pour ajouter une image à un album
export const addImageToAlbum = async (imageData: AddImageRequest): Promise<AddImageResponse> => {
  try {
    // Vérifier si le token est valide avant de tenter l'upload
    if (!isTokenValid()) {
      throw new Error("Session expirée - Impossible d'ajouter l'image");
    }

    // Créer un FormData pour l'envoi de fichier
    const formData = new FormData();
    
    // Convertir Blob en File si nécessaire
    let fileToUpload: File;
    
    // Si c'est un Blob mais pas un File, le convertir en File
    if (imageData.file instanceof Blob && !(imageData.file instanceof File)) {
      const blobFile = imageData.file as Blob;
      fileToUpload = new File([blobFile], "image.jpg", {
        type: blobFile.type || "image/jpeg"
      });
    } else {
      fileToUpload = imageData.file;
    }
    
    // Nettoyer le nom (enlever les caractères spéciaux)
    const cleanName = imageData.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    // Ajouter le fichier en premier (important pour certains parsers)
    formData.append("file", fileToUpload);
    formData.append("name", cleanName);
    formData.append("id_album", imageData.id_album.toString());

    // Ajouter uniquement les champs non vides
    if (imageData.description && imageData.description.trim()) {
      formData.append("description", imageData.description);
    }

    if (imageData.url && imageData.url.trim()) {
      formData.append("url", imageData.url);
    }

    console.log("Envoi à l'URL:", `/image`);
    
    // Envoyer la requête avec une configuration explicite
    const response = await api.post<AddImageResponse>("/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        // Pas d'autres en-têtes pour éviter les conflits
      },
      timeout: 60000,
    });

    return response.data;
  } catch (error: any) {
    console.error("Erreur lors de l'ajout de l'image:", error);
    console.error("Response data:", error.response?.data);
    console.error("Response status:", error.response?.status);
    throw error;
  }
};

// Fonction pour ajouter des catégories à un album
// Fonction modifiée pour convertir les noms de catégories en IDs
export const addCategoriesToAlbum = async (
  albumId: number,
  categoryNames: string[],
): Promise<unknown> => {
  try {
    console.log("Ajout des catégories à l'album", albumId, ":", categoryNames);
    
    // Récupérer d'abord toutes les catégories pour mapper les noms aux IDs
    const categoriesResponse = await api.get("/category");
    const categories = categoriesResponse.data.data;
    console.log("Catégories disponibles:", categories);
    
    // Mapper les noms aux IDs
    const promises = categoryNames.map(name => {
      const category = categories.find((cat: { name: string; }) => cat.name === name);
      if (!category) {
        console.warn(`Catégorie non trouvée: ${name}`);
        return null;
      }
      
      console.log(`Ajout de la catégorie ${name} (ID: ${category.id}) à l'album ${albumId}`);
      
      // Faire la requête avec l'ID de catégorie
      return api.post(`/album/${albumId}/category`, {
        id_category: category.id,
      });
    });

    // Filtrer les promesses nulles (catégories non trouvées)
    const validPromises = promises.filter(p => p !== null);
    
    // Attendre que toutes les requêtes soient terminées
    const results = await Promise.all(validPromises);
    console.log("Résultats d'ajout des catégories:", results);
    return results;
  } catch (error) {
    console.error("Erreur lors de l'ajout des catégories:", error);
    throw error;
  }
};

// Fonction pour obtenir les catégories disponibles
export const getCategories = async (): Promise<
  { id: number; name: string }[]
> => {
  try {
    const response = await api.get("/category");
    console.log("Catégories récupérées:", response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error);
    throw error;
  }
};

// Fonction pour traiter une image avant upload (avec gestion des erreurs)
export const processImageBeforeUpload = async (
  imageFile: File,
  index: number,
): Promise<ProcessImageResult> => {
  try {
    console.log(`Traitement de l'image ${imageFile.name} (index: ${index})`);
    const result: ImageVerificationResult =
      await imageService.processImage(imageFile);

    if (!result.isValid || !result.file) {
      console.error(`L'image ${imageFile.name} n'est pas valide:`, result.errorMessage);
      return {
        success: false,
        originalFileName: imageFile.name,
        originalIndex: index,
        errorMessage:
          result.errorMessage ||
          "Erreur inconnue lors du traitement de l'image.",
      };
    }

    console.log(`Image ${imageFile.name} traitée avec succès, taille finale: ${(result.file.size / 1024 / 1024).toFixed(2)} Mo`);
    return {
      success: true,
      file: result.file,
      originalFileName: imageFile.name,
      originalIndex: index,
    };
  } catch (error) {
    console.error(
      `Erreur lors du traitement de l'image ${imageFile.name}:`,
      error,
    );

    return {
      success: false,
      originalFileName: imageFile.name,
      originalIndex: index,
      errorMessage: "Une erreur est survenue lors du traitement de l'image.",
    };
  }
};

export default {
  createAlbum,
  deleteAlbum,
  addImageToAlbum,
  addCategoriesToAlbum,
  getCategories,
  processImageBeforeUpload,
};