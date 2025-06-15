/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./api";

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
  path_image: string; // CORRIGÉ : path_image au lieu de path_images
  description: string | null;
  url: string | null;
}

interface AlbumResponse {
  id: number;
  name: string;
  images: AlbumImage[];
  // Autres propriétés de l'album
}

// Fonction pour récupérer les images d'un album
export const getAlbumImages = async (
  albumId: string,
): Promise<TierlistImage[]> => {
  try {
    console.log("🔍 VÉRIFICATION ALBUM/IMAGES");
    console.log("Album ID demandé:", albumId);
    
    const response = await api.get<ApiResponse<AlbumResponse>>(`/album/${albumId}`);
    
    console.log("✅ Album récupéré:", {
      id: response.data.data.id,
      name: response.data.data.name,
      nbImages: response.data.data.images?.length
    });

    if (!response.data.data.images || response.data.data.images.length === 0) {
      console.warn('Aucune image trouvée dans l\'album');
      return [];
    }

    // LOG CRUCIAL : Vérifier chaque image
    console.log("📋 IMAGES DE L'ALBUM:");
    response.data.data.images.forEach((img, index) => {
      console.log(`Image ${index + 1}:`, {
        id: img.id,
        name: img.name,
        // Attention : vérifiez si l'API retourne l'id_album de l'image
        // Si oui, décommentez la ligne suivante :
        // id_album: img.id_album
      });
    });

    // Conversion des images
    const tierlistImages = response.data.data.images.map((img) => ({
      id: img.id.toString(),
      id_image: img.id,
      src: img.path_image,
      alt: img.name,
      name: img.name,
      description: img.description,
      url: img.url,
    }));

    console.log("🎯 RÉSUMÉ:");
    console.log(`Album ID: ${albumId}`);
    console.log(`Images trouvées: ${tierlistImages.map(img => img.id).join(', ')}`);
    
    return tierlistImages;
  } catch (error) {
    console.error("❌ Erreur getAlbumImages:", error);
    throw error;
  }
};

// Fonction pour créer une nouvelle tierlist
export const createTierlist = async (tierlist: Tierlist): Promise<number> => {
  try {
    const formattedTierlist = {
      name: tierlist.name,
      description: tierlist.description || "",
      private: Boolean(tierlist.private),
      id_album: Number(tierlist.id_album),
    };

    console.log("🔵 API CALL: POST /tierlist");
    console.log("📤 BODY:", JSON.stringify(formattedTierlist, null, 2));

    const response = await api.post<ApiResponse<{ id: number }>>(
      "/tierlist",
      formattedTierlist,
    );

    console.log("✅ RESPONSE:", response.status, response.data);
    return response.data.data.id;
  } catch (error: any) {
    console.error("❌ ERROR POST /tierlist");
    console.error("📤 BODY SENT:", JSON.stringify({
      name: tierlist.name,
      description: tierlist.description || "",
      private: Boolean(tierlist.private),
      id_album: Number(tierlist.id_album),
    }, null, 2));
    if (error.response) {
      console.error("📥 ERROR RESPONSE:", error.response.status, error.response.data);
    }
    throw error;
  }
};

// Fonction pour créer une ligne de tierlist
export const createTierlistLine = async (
  line: TierlistLine,
): Promise<number> => {
  try {
    const apiData = {
      label: line.label || "",
      placement: Number(line.placement),
      color: line.color.replace("#", ""),
      id_tierlist: Number(line.id_tierlist),
    };

    console.log("🔵 API CALL: POST /tierlist/line");
    console.log("📤 BODY:", JSON.stringify(apiData, null, 2));

    const response = await api.post<ApiResponse<{ id: number }>>(
      "/tierlist/line",
      apiData,
    );

    console.log("✅ RESPONSE:", response.status, response.data);
    return response.data.data.id;
  } catch (error: any) {
    console.error("❌ ERROR POST /tierlist/line");
    console.error("📤 BODY SENT:", JSON.stringify({
      label: line.label || "",
      placement: Number(line.placement),
      color: line.color.replace("#", ""),
      id_tierlist: Number(line.id_tierlist),
    }, null, 2));
    if (error.response) {
      console.error("📥 ERROR RESPONSE:", error.response.status, error.response.data);
    }
    throw error;
  }
};

// Fonction pour ajouter une image à une ligne de tierlist
export const addImageToTierlistLine = async (
  tierlistLineId: number,
  imageId: number,
  placement: number,
  disable: boolean = false,
): Promise<void> => {
  try {
    const apiData = {
      id_image: Number(imageId),
      id_tierlist_line: Number(tierlistLineId),
      placement: Number(placement),
      disable: Boolean(disable),
    };

    console.log("🔵 API CALL: POST /tierlist/line/image");
    console.log("📤 BODY:", JSON.stringify(apiData, null, 2));

    const response = await api.post("/tierlist/line/image", apiData);

    console.log("✅ RESPONSE:", response.status, response.data);
  } catch (error: any) {
    console.error("❌ ERROR POST /tierlist/line/image");
    console.error("📤 BODY SENT:", JSON.stringify({
      id_image: Number(imageId),
      id_tierlist_line: Number(tierlistLineId),
      placement: Number(placement),
      disable: Boolean(disable),
    }, null, 2));
    if (error.response) {
      console.error("📥 ERROR RESPONSE:", error.response.status, error.response.data);
    }
    throw error;
  }
};

// Fonction pour sauvegarder complètement une tierlist avec ses lignes et images
export const saveTierlist = async (
  tierlistData: Tierlist,
  tierLines: TierlistLine[],
  unclassifiedImages: TierlistImage[] = [],
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
          placement: i + 1,
        });

        // Ajouter les images à cette ligne
        for (let j = 0; j < line.images.length; j++) {
          const image = line.images[j];
          try {
            await addImageToTierlistLine(
              lineId,
              image.id_image || parseInt(image.id),
              j + 1, // Position dans le tier (commençant à 1)
              image.disable || false,
            );
          } catch (imgError) {
            console.error(
              `Erreur lors de l'ajout de l'image ${image.id} à la ligne:`,
              imgError,
            );
            // Continuer avec les autres images
          }
        }
      } catch (lineError) {
        console.error(
          `Erreur lors de la création de la ligne ${line.label}:`,
          lineError,
        );
        // Continuer avec les autres lignes
      }
    }

    // 3. Traiter les images non classées si nécessaire
    if (unclassifiedImages.length > 0) {
      try {
        // Créer une ligne spéciale pour les images non classées
        const unclassifiedLine: TierlistLine = {
          label: "Non classé",
          placement: 0, // Utiliser 0 pour le tier non classé
          color: "CCCCCC", // Gris clair sans #
          id_tierlist: tierlistId,
          images: [],
        };

        const unclassifiedLineId = await createTierlistLine(unclassifiedLine);

        // Ajouter les images non classées à cette ligne
        for (let i = 0; i < unclassifiedImages.length; i++) {
          const image = unclassifiedImages[i];
          try {
            await addImageToTierlistLine(
              unclassifiedLineId,
              image.id_image || parseInt(image.id),
              i + 1,
              false,
            );
          } catch (imgError) {
            console.error(
              `Erreur lors de l'ajout de l'image non classée ${image.id}:`,
              imgError,
            );
          }
        }
      } catch (error) {
        console.error(
          "Erreur lors de la création du tier pour les images non classées:",
          error,
        );
      }
    }

    return tierlistId;
  } catch (error) {
    console.error(
      "Erreur lors de la sauvegarde complète de la tierlist:",
      error,
    );
    throw error;
  }
};

// Fonction pour récupérer une tierlist complète par ID
export const getTierlistById = async (id: number): Promise<Tierlist> => {
  try {
    const response = await api.get<ApiResponse<Tierlist>>(`/tierlist/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(
      `Erreur lors de la récupération de la tierlist ${id}:`,
      error,
    );
    throw error;
  }
};

// Fonction pour récupérer les lignes d'une tierlist
export const getTierlistLines = async (
  tierlistId: number,
): Promise<TierlistLine[]> => {
  try {
    const response = await api.get<ApiResponse<TierlistLine[]>>(
      `/tierlist/${tierlistId}/line`,
    );
    return response.data.data;
  } catch (error) {
    console.error(
      `Erreur lors de la récupération des lignes de la tierlist ${tierlistId}:`,
      error,
    );
    // Si l'API spécifique n'existe pas, on renvoie un tableau vide
    return [];
  }
};

export const getTierlistWithDetails = async (
  tierlistId: number,
): Promise<{
  tierlist: Tierlist;
  lines: TierlistLine[];
  allImages: TierlistImage[];
}> => {
  try {
    // Récupérer les détails de base de la tierlist
    const response = await api.get<ApiResponse<any>>(`/tierlist/${tierlistId}`);
    const tierlistData = response.data.data;

    if (!tierlistData) {
      throw new Error(`Tierlist with ID ${tierlistId} not found`);
    }

    // Extraire les lignes et les images
    const lines: TierlistLine[] = [];
    const allImages: TierlistImage[] = [];

    if (tierlistData.tierlistLine && Array.isArray(tierlistData.tierlistLine)) {
      tierlistData.tierlistLine.forEach((line: any) => {
        // Construire l'objet ligne
        const tierLine: TierlistLine = {
          id: line.id.toString(),
          label: line.label || "",
          placement: line.placement,
          color: line.color || "FFFFFF",
          id_tierlist: tierlistId,
          images: [],
        };

        // Ajouter les images à la ligne
        if (line.tierlistLineImage && Array.isArray(line.tierlistLineImage)) {
          tierLine.images = line.tierlistLineImage.map((lineImage: any) => {
            const image = lineImage.image;
            const imageObj: TierlistImage = {
              id: image.id.toString(),
              id_image: image.id,
              src: image.path_image,
              alt: image.name,
              name: image.name,
              description: image.description,
              url: image.url,
              placement: lineImage.placement,
              disable: lineImage.disable,
            };

            // Ajouter l'image à la liste complète des images
            allImages.push({ ...imageObj });

            return imageObj;
          });
        }

        lines.push(tierLine);
      });
    }

    // Construire l'objet tierlist
    const tierlist: Tierlist = {
      id: tierlistData.id,
      name: tierlistData.name,
      description: tierlistData.description,
      private: tierlistData.private,
      id_album: tierlistData.album.id,
    };

    return {
      tierlist,
      lines,
      allImages,
    };
  } catch (error) {
    console.error(
      `Error fetching tierlist details for ID ${tierlistId}:`,
      error,
    );
    throw error;
  }
};

// Fonction pour mettre à jour une tierlist existante
export const updateTierlist = async (
  tierlistId: number,
  tierlistData: {
    name?: string;
    description?: string | null;
    private?: boolean;
    id_album?: number; // Ajout optionnel de id_album
  },
): Promise<number> => {
  try {
    // Nettoyer les données avant l'envoi
    const formattedData: any = {};

    if (tierlistData.name !== undefined) {
      formattedData.name = tierlistData.name;
    }

    // CORRECTION CRITIQUE: Convertir null en chaîne vide pour description
    if (tierlistData.description !== undefined) {
      // Si description est null, envoyer une chaîne vide ""
      formattedData.description =
        tierlistData.description === null ? "" : tierlistData.description;
    }

    if (tierlistData.private !== undefined) {
      formattedData.private = Boolean(tierlistData.private);
    }

    // Ajouter l'id_album s'il est présent
    if (tierlistData.id_album !== undefined && tierlistData.id_album > 0) {
      formattedData.id_album = tierlistData.id_album;
    }

    console.log("Données formatées pour mise à jour:", formattedData);

    const response = await api.put<ApiResponse<{ id: number }>>(
      `/tierlist/${tierlistId}`,
      formattedData,
    );
    return response.data.data.id;
  } catch (error) {
    console.error(`Error updating tierlist ${tierlistId}:`, error);
    throw error;
  }
};

// Fonction pour mettre à jour une ligne de tierlist
export const updateTierlistLine = async (
  lineId: number,
  lineData: {
    label?: string;
    placement?: number;
    color?: string;
  },
): Promise<number> => {
  try {
    // Nettoyer les données avant l'envoi
    const formattedData: any = {};

    if (lineData.label !== undefined) {
      formattedData.label = lineData.label || "";
    }

    if (lineData.placement !== undefined) {
      formattedData.placement = Number(lineData.placement);
    }

    if (lineData.color !== undefined) {
      formattedData.color = lineData.color.replace("#", ""); // Enlever le # pour le format API
    }

    console.log("Mise à jour des données de ligne:", formattedData);

    const response = await api.put<ApiResponse<{ id: number }>>(
      `/tierlist/line/${lineId}`,
      formattedData,
    );
    return response.data.data.id;
  } catch (error) {
    console.error(`Error updating tierlist line ${lineId}:`, error);
    throw error;
  }
};

// Fonction pour mettre à jour une image dans une ligne
export const updateTierlistImage = async (
  imageLineId: number,
  imageData: {
    placement?: number;
    disable?: boolean;
    id_image?: number;
    id_tierlist_line?: number;
  },
): Promise<number> => {
  try {
    // Nettoyer les données avant l'envoi
    const formattedData: any = {};

    if (imageData.placement !== undefined) {
      formattedData.placement = Number(imageData.placement);
    }

    if (imageData.disable !== undefined) {
      formattedData.disable = Boolean(imageData.disable);
    }

    if (imageData.id_image !== undefined) {
      formattedData.id_image = Number(imageData.id_image);
    }

    if (imageData.id_tierlist_line !== undefined) {
      formattedData.id_tierlist_line = Number(imageData.id_tierlist_line);
    }

    console.log("Mise à jour des données d'image:", formattedData);

    const response = await api.put<ApiResponse<{ id: number }>>(
      `/tierlist/line/image/${imageLineId}`,
      formattedData,
    );
    return response.data.data.id;
  } catch (error) {
    console.error(`Error updating tierlist image ${imageLineId}:`, error);
    throw error;
  }
};

// Fonction pour supprimer une ligne (tier) de tierlist
export const deleteTierlistLine = async (lineId: number): Promise<void> => {
  try {
    console.log(`Suppression de la ligne ${lineId}`);
    await api.delete(`/tierlist/line/${lineId}`);
    console.log(`Ligne ${lineId} supprimée avec succès`);
  } catch (error) {
    console.error(
      `Erreur lors de la suppression de la ligne ${lineId}:`,
      error,
    );
    throw error;
  }
};

// Fonction pour mettre à jour complètement une tierlist existante avec ses tiers et images
export const updateCompleteTierlist = async (
  tierlistId: number,
  tierlistData: {
    name: string;
    description: string | null;
    private: boolean;
    id_album: number;
  },
  tierLines: TierlistLine[],
  unclassifiedImages: TierlistImage[] = [],
): Promise<number> => {
  try {
    console.log(
      "UpdateCompleteTierlist - Début de mise à jour pour ID:",
      tierlistId,
    );

    // 1. Mettre à jour les informations de base de la tierlist
    await updateTierlist(tierlistId, tierlistData);

    // 2. Récupérer les lignes existantes
    let existingLines: string | any[] = [];
    try {
      const tierlistDetails = await getTierlistWithDetails(tierlistId);
      existingLines = tierlistDetails.lines || [];
      console.log("Lignes existantes récupérées:", existingLines.length);
    } catch (getError) {
      console.error(
        "Erreur lors de la récupération des lignes existantes:",
        getError,
      );
      existingLines = [];
    }

    // 3. STRATÉGIE SIMPLIFIÉE : Supprimer TOUTES les lignes existantes et recréer
    for (const line of existingLines) {
      try {
        console.log(`Suppression de la ligne ${line.id}`);
        await deleteTierlistLine(parseInt(line.id));
      } catch (deleteError) {
        console.error(
          `Erreur lors de la suppression de la ligne ${line.id}:`,
          deleteError,
        );
      }
    }

    // 4. Créer toutes les nouvelles lignes
    // 4.1 Créer d'abord les tiers normaux
    for (let i = 0; i < tierLines.length; i++) {
      const line = tierLines[i];
      const placement = i + 1;

      try {
        // Créer la ligne
        const lineId = await createTierlistLine({
          label: line.label,
          placement: placement,
          color: line.color,
          id_tierlist: tierlistId,
          images: [],
        });

        // Ajouter les images à cette ligne
        for (let j = 0; j < line.images.length; j++) {
          const image = line.images[j];
          try {
            await addImageToTierlistLine(
              lineId,
              parseInt(image.id),
              j + 1,
              image.disable || false,
            );
          } catch (imgError) {
            console.error(
              `Erreur lors de l'ajout de l'image ${image.id} à la ligne:`,
              imgError,
            );
          }
        }
      } catch (lineError) {
        console.error(
          `Erreur lors de la création de la ligne ${line.label}:`,
          lineError,
        );
      }
    }

    // 4.2 Ensuite traiter les images non classées
    if (unclassifiedImages.length > 0) {
      try {
        // Créer la ligne pour les images non classées
        const unclassifiedLine: TierlistLine = {
          label: "Non classé",
          placement: 0,
          color: "CCCCCC",
          id_tierlist: tierlistId,
          images: [],
        };

        const unclassifiedLineId = await createTierlistLine(unclassifiedLine);

        // Ajouter les images non classées
        for (let i = 0; i < unclassifiedImages.length; i++) {
          const image = unclassifiedImages[i];
          try {
            await addImageToTierlistLine(
              unclassifiedLineId,
              parseInt(image.id),
              i + 1,
              false,
            );
          } catch (imgError) {
            console.error(
              `Erreur lors de l'ajout de l'image non classée ${image.id}:`,
              imgError,
            );
          }
        }
      } catch (error) {
        console.error(
          "Erreur lors du traitement des images non classées:",
          error,
        );
      }
    }

    console.log("Mise à jour complète terminée avec succès");
    return tierlistId;
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour complète de la tierlist:",
      error,
    );
    throw error;
  }
};
// Export des fonctions
// Fonction pour supprimer une tierlist
export const deleteTierlist = async (tierlistId: number): Promise<void> => {
  try {
    console.log(`Suppression de la tierlist ${tierlistId}`);
    await api.delete(`/tierlist/${tierlistId}`);
    console.log(`Tierlist ${tierlistId} supprimée avec succès`);
  } catch (error) {
    console.error(
      `Erreur lors de la suppression de la tierlist ${tierlistId}:`,
      error,
    );
    throw error;
  }
};

// N'oubliez pas d'exporter la fonction dans l'export par défaut à la fin du fichier
export default {
  getAlbumImages,
  createTierlist,
  createTierlistLine,
  addImageToTierlistLine,
  saveTierlist,
  getTierlistById,
  getTierlistLines,
  getTierlistWithDetails,
  updateTierlist,
  updateTierlistLine,
  updateTierlistImage,
  deleteTierlistLine,
  updateCompleteTierlist,
  deleteTierlist, // Ajouter cette ligne
};
