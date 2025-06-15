import api from "./api";

// Types for ranking operations
export interface RankingImage {
  id: string;
  src: string;
  name: string;
  description?: string | null;
  url?: string | null;
  score?: number;
  viewed?: number;
}

export interface Ranking {
  id?: number;
  name: string;
  description: string | null;
  private: boolean;
  id_album: number;
}

export interface AlbumInfo {
  id: number;
  name: string;
  status: string;
  images: Array<{
    id: number;
    name: string;
    path_image: string;
    description: string | null;
    url: string | null;
  }>;
  author: {
    id: number;
    username: string;
  };
  categories: Array<{
    id: number;
    name: string;
  }>;
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

// Get album information
export const getAlbumInfo = async (
  albumId: string,
): Promise<{ id: number; name: string }> => {
  try {
    console.log(
      `[rankingService] Récupération des infos de l'album ${albumId}`,
    );
    const response = await api.get<ApiResponse<AlbumInfo>>(`/album/${albumId}`);
    console.log(
      `[rankingService] Infos d'album reçues:`,
      response.data.data,
    );
    return {
      id: response.data.data.id,
      name: response.data.data.name,
    };
  } catch (error) {
    console.error(
      `[rankingService] Erreur lors de la récupération des infos de l'album ${albumId}:`,
      error,
    );
    throw error;
  }
};

// Get album images
export const getAlbumImages = async (
  albumId: string,
): Promise<RankingImage[]> => {
  try {
    console.log(
      `[rankingService] Récupération des images de l'album ${albumId}`,
    );
    const response = await api.get<ApiResponse<AlbumInfo>>(`/album/${albumId}`);

    if (!response.data.data.images || response.data.data.images.length === 0) {
      console.warn(
        `[rankingService] Aucune image trouvée pour l'album ${albumId}`,
      );
      return [];
    }

    const images = response.data.data.images.map((img) => ({
      id: img.id.toString(),
      src: img.path_image,
      name: img.name,
      description: img.description,
      url: img.url,
      score: 0,
      viewed: 0,
    }));
    console.log(`[rankingService] Images récupérées:`, images);
    return images;
  } catch (error) {
    console.error(
      `[rankingService] Erreur lors de la récupération des images de l'album ${albumId}:`,
      error,
    );
    throw error;
  }
};

// Create a new ranking
export const createRanking = async (
  ranking: Ranking,
): Promise<number> => {
  try {
    const formattedRanking = {
      name: ranking.name,
      description: ranking.description || "",
      private: Boolean(ranking.private),
      id_album: Number(ranking.id_album),
    };

    console.log(
      "[rankingService] Création du classement avec les données:",
      formattedRanking,
    );

    const response = await api.post<ApiResponse<{ id: number }>>(
      "/ranking",
      formattedRanking,
    );
    console.log(
      "[rankingService] Classement créé. Réponse du serveur:",
      response.data.data,
    );
    return response.data.data.id;
  } catch (error) {
    console.error(
      "[rankingService] Erreur lors de la création du classement:",
      error,
    );
    throw error;
  }
};

// Add ranking image
export const addRankingImage = async (
  rankingId: number,
  imageId: number,
  points: number,
  score: number,
): Promise<void> => {
  try {
    const apiData = {
      id_image: Number(imageId),
      id_ranking: Number(rankingId),
      points: Number(points), // Use points instead of rank
      // Note: viewed will be set from the image data
    };

    console.log(
      `[rankingService] Ajout de l'image ${imageId} au classement ${rankingId} avec le payload:`,
      apiData,
    );
    await api.post("/ranking/image", apiData);
    console.log(
      `[rankingService] Image ${imageId} ajoutée avec succès au classement ${rankingId}`,
    );
  } catch (error) {
    console.error(
      `[rankingService] Erreur lors de l'ajout de l'image ${imageId} au classement ${rankingId}:`,
      error,
    );
    throw error;
  }
};

// Save complete ranking with all images
export const saveRanking = async (
  rankingData: Ranking,
  images: RankingImage[],
): Promise<number> => {
  try {
    console.log(
      `[rankingService] Début de la sauvegarde complète du classement.`,
    );

    // 1. Créer le classement
    const rankingId = await createRanking(rankingData);
    console.log(`[rankingService] Classement créé avec l'ID ${rankingId}.`);

    // 2. Ajouter les images avec leur rang final
    const rankedImages = images.filter((img) => img.score && img.score < 0);
    
    for (const image of rankedImages) {
      const points = Math.abs(image.score!); // Convert negative score to positive points
      await addRankingImage(rankingId, Number(image.id), points, image.score!);
    }

    console.log(
      `[rankingService] Toutes les images ont été ajoutées au classement ${rankingId}.`,
    );

    return rankingId;
  } catch (error) {
    console.error(
      "[rankingService] Erreur lors de la sauvegarde complète du classement:",
      error,
    );
    throw error;
  }
};

// Get ranking by ID
export const getRankingById = async (id: number): Promise<any> => {
  try {
    console.log(`[rankingService] Récupération du classement avec l'ID ${id}.`);
    const response = await api.get<ApiResponse<any>>(
      `/ranking/${id}`,
    );
    return response.data.data;
  } catch (error) {
    console.error(
      `[rankingService] Erreur lors de la récupération du classement ${id}:`,
      error,
    );
    throw error;
  }
};

// Get ranking images
export const getRankingImages = async (
  rankingId: number,
): Promise<RankingImage[]> => {
  try {
    console.log(
      `[rankingService] Récupération des images pour le classement ${rankingId}.`,
    );
    const response = await api.get<
      ApiResponse<
        Array<{
          id: number;
          rank: number;
          score: number;
          id_image: number;
          id_ranking: number;
          image: {
            id: number;
            name: string;
            path_image: string;
            description: string | null;
            url: string | null;
          };
        }>
      >
    >(`/ranking/${rankingId}/image`);

    const rankingImages = response.data.data.map((item) => ({
      id: item.id_image.toString(),
      src: item.image.path_image,
      name: item.image.name,
      description: item.image.description,
      url: item.image.url,
      score: item.score,
    }));
    console.log(
      `[rankingService] Images récupérées pour le classement ${rankingId}:`,
      rankingImages,
    );
    return rankingImages;
  } catch (error) {
    console.error(
      `[rankingService] Erreur lors de la récupération des images pour le classement ${rankingId}:`,
      error,
    );
    throw error;
  }
};

// Update existing ranking
export const updateRanking = async (
  id: number,
  rankingData: Ranking,
  images: RankingImage[],
): Promise<number> => {
  try {
    console.log(`[rankingService] Mise à jour du classement ${id}.`);

    // Update ranking metadata
    const formattedRanking = {
      name: rankingData.name,
      description: rankingData.description || "",
      private: Boolean(rankingData.private),
      id_album: Number(rankingData.id_album),
    };

    await api.put(`/ranking/${id}`, formattedRanking);
    console.log(`[rankingService] Métadonnées du classement ${id} mises à jour.`);

    // Delete existing ranking images
    try {
      await api.delete(`/ranking/${id}/images`);
      console.log(`[rankingService] Images existantes supprimées pour le classement ${id}.`);
    } catch (error) {
      console.warn("Erreur lors de la suppression des images existantes:", error);
    }

    // Add new ranking images
    const rankedImages = images.filter((img) => img.score && img.score < 0);
    
    for (const image of rankedImages) {
      const points = Math.abs(image.score!); // Convert negative score to positive points
      await addRankingImage(id, Number(image.id), points, image.score!);
    }

    console.log(`[rankingService] Classement ${id} mis à jour avec succès.`);
    return id;
  } catch (error) {
    console.error(
      `[rankingService] Erreur lors de la mise à jour du classement ${id}:`,
      error,
    );
    throw error;
  }
};
export const deleteRanking = async (rankingId: number): Promise<void> => {
  try {
    console.log(`[rankingService] Suppression du classement ${rankingId}`);
    await api.delete(`/ranking/${rankingId}`);
    console.log(`[rankingService] Classement ${rankingId} supprimé avec succès`);
  } catch (error) {
    console.error(
      `[rankingService] Erreur lors de la suppression du classement ${rankingId}:`,
      error,
    );
    throw error;
  }
};
const rankingService = {
  getAlbumInfo,
  getAlbumImages,
  createRanking,
  addRankingImage,
  saveRanking,
  updateRanking,
  getRankingById,
  getRankingImages,
  deleteRanking,
};

export default rankingService;