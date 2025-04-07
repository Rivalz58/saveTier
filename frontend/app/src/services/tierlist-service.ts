import api from './api';

// Types pour les opérations de tierlist
export interface TierlistImage {
  id: string;
  id_image?: number;
  src?: string;
  alt?: string;
  name?: string;
  description?: string | null;
  url?: string | null;
  placement?: number;
  disable?: boolean;
}

export interface TierlistLine {
  id?: string;
  label: string;
  placement: number;
  color: string;
  id_tierlist?: number;
  images: TierlistImage[];
}

export interface Tierlist {
  id?: number;
  name: string;
  description: string | null;
  private: boolean;
  id_album: number;
  lines?: TierlistLine[];
}

// Réponses API
interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

// Interfaces pour les données précises d'API
interface AlbumImage {
  id: number;
  name: string;
  path_image: string;
  description: string | null;
  url: string | null;
}

interface AlbumResponse {
  id: number;
  name: string;
  image: AlbumImage[];
  // Autres propriétés de l'album
}

// Fonction pour récupérer les images d'un album
export const getAlbumImages = async (albumId: string): Promise<TierlistImage[]> => {
  try {
    const response = await api.get<ApiResponse<AlbumResponse>>(`/album/${albumId}`);
    
    if (!response.data.data.image || response.data.data.image.length === 0) {
      return [];
    }
    
    // Convertir les images de l'album en format TierlistImage
    return response.data.data.image.map(img => ({
      id: img.id.toString(),
      id_image: img.id,
      src: img.path_image,
      alt: img.name,
      name: img.name,
      description: img.description,
      url: img.url
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des images de l\'album:', error);
    throw error;
  }
};

// Fonction pour créer une nouvelle tierlist
export const createTierlist = async (tierlist: Tierlist): Promise<number> => {
  try {
    // S'assurer que tous les champs sont correctement formatés
    const formattedTierlist = {
      name: tierlist.name,
      description: tierlist.description === "" ? null : tierlist.description,
      private: Boolean(tierlist.private),
      id_album: Number(tierlist.id_album)
    };
    
    console.log('Données de tierlist à envoyer:', formattedTierlist);
    
    const response = await api.post<ApiResponse<{ id: number }>>('/tierlist', formattedTierlist);
    return response.data.data.id;
  } catch (error) {
    console.error('Erreur lors de la création de la tierlist:', error);
    //if (error.response && error.response.data) {
    //  console.error('Détails de l\'erreur:', error.response.data);
    //}
    throw error;
  }
};

// Fonction pour créer une ligne de tierlist
export const createTierlistLine = async (line: TierlistLine): Promise<number> => {
  try {
    // Formater les données pour l'API
    const apiData = {
      label: line.label || "",
      placement: Number(line.placement),
      color: line.color.replace('#', ''),  // Enlever le # pour le format de l'API
      id_tierlist: Number(line.id_tierlist)
    };
    
    console.log('Données de ligne à envoyer:', apiData);
    
    const response = await api.post<ApiResponse<{ id: number }>>('/tierlist/line', apiData);
    return response.data.data.id;
  } catch (error) {
    console.error('Erreur lors de la création de la ligne de tierlist:', error);
    //if (error.response && error.response.data) {
    //  console.error('Détails de l\'erreur:', error.response.data);
    //}
    throw error;
  }
};

// Fonction pour ajouter une image à une ligne de tierlist
export const addImageToTierlistLine = async (
  tierlistLineId: number, 
  imageId: number, 
  placement: number,
  disable: boolean = false
): Promise<void> => {
  try {
    const apiData = {
      id_image: Number(imageId),
      id_tierlist_line: Number(tierlistLineId),
      placement: Number(placement),
      disable: Boolean(disable)
    };
    
    console.log('Données d\'image à envoyer:', apiData);
    
    await api.post('/tierlist/line/image', apiData);
  } catch (error) {
    console.error(`Erreur lors de l'ajout de l'image ${imageId} à la ligne ${tierlistLineId}:`, error);
    //if (error.response && error.response.data) {
    //  console.error('Détails de l\'erreur:', error.response.data);
    //}
    throw error;
  }
};

// Fonction pour sauvegarder complètement une tierlist avec ses lignes et images
export const saveTierlist = async (
  tierlistData: Tierlist, 
  tierLines: TierlistLine[],
  unclassifiedImages: TierlistImage[] = []
): Promise<number> => {
  try {
    // 1. Créer la tierlist
    const tierlistId = await createTierlist(tierlistData);
    
    // 2. Créer les lignes de tier et ajouter les images
    for (let i = 0; i < tierLines.length; i++) {
      const line = tierLines[i];
      try {
        // Créer la ligne avec le bon placement (commençant à 1)
        const lineId = await createTierlistLine({
          ...line,
          id_tierlist: tierlistId,
          placement: i + 1
        });
        
        // Ajouter les images à cette ligne
        for (let j = 0; j < line.images.length; j++) {
          const image = line.images[j];
          try {
            await addImageToTierlistLine(
              lineId,
              parseInt(image.id),
              j + 1, // Position dans le tier (commençant à 1)
              image.disable || false
            );
          } catch (imgError) {
            console.error(`Erreur lors de l'ajout de l'image ${image.id} à la ligne:`, imgError);
            // Continuer avec les autres images
          }
        }
      } catch (lineError) {
        console.error(`Erreur lors de la création de la ligne ${line.label}:`, lineError);
        // Continuer avec les autres lignes
      }
    }
    
    // 3. Traiter les images non classées si nécessaire (tier ID 1)
    if (unclassifiedImages.length > 0) {
      try {
        // Créer une ligne spéciale pour les images non classées
        const unclassifiedLine: TierlistLine = {
          label: "Non classé",
          placement: tierLines.length + 1, // Placer après toutes les autres lignes
          color: "CCCCCC", // Gris clair sans #
          id_tierlist: tierlistId,
          images: []
        };
        
        const unclassifiedLineId = await createTierlistLine(unclassifiedLine);
        
        // Ajouter les images non classées à cette ligne
        for (let i = 0; i < unclassifiedImages.length; i++) {
          const image = unclassifiedImages[i];
          try {
            await addImageToTierlistLine(
              unclassifiedLineId,
              parseInt(image.id),
              i + 1,
              false
            );
          } catch (imgError) {
            console.error(`Erreur lors de l'ajout de l'image non classée ${image.id}:`, imgError);
          }
        }
      } catch (error) {
        console.error("Erreur lors de la création du tier pour les images non classées:", error);
      }
    }
    
    return tierlistId;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde complète de la tierlist:', error);
    throw error;
  }
};

// Fonction pour récupérer une tierlist complète par ID
export const getTierlistById = async (id: number): Promise<Tierlist> => {
  try {
    const response = await api.get<ApiResponse<Tierlist>>(`/tierlist/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération de la tierlist ${id}:`, error);
    throw error;
  }
};

// Fonction pour récupérer les lignes d'une tierlist
export const getTierlistLines = async (tierlistId: number): Promise<TierlistLine[]> => {
  try {
    const response = await api.get<ApiResponse<TierlistLine[]>>(`/tierlist/${tierlistId}/line`);
    return response.data.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération des lignes de la tierlist ${tierlistId}:`, error);
    // Si l'API spécifique n'existe pas, on renvoie un tableau vide
    return [];
  }
};

export default {
  getAlbumImages,
  createTierlist,
  createTierlistLine,
  addImageToTierlistLine,
  saveTierlist,
  getTierlistById,
  getTierlistLines
};