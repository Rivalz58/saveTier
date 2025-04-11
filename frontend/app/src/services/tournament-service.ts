import api from './api';

// Types for tournament operations
export interface TournamentImage {
  id: string;
  src: string;
  name: string;
  description?: string | null;
  url?: string | null;
  score?: number;
}

export interface Tournament {
  id?: number;
  name: string;
  description: string | null;
  private: boolean;
  id_album: number;
  turn?: number;
  winner_id?: string | null;
}

export interface AlbumInfo {
  id: number;
  name: string;
  status: string;
  image: Array<{
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
export const getAlbumInfo = async (albumId: string): Promise<{ id: number; name: string }> => {
  try {
    console.log(`[tournamentService] Récupération des infos de l'album ${albumId}`);
    const response = await api.get<ApiResponse<AlbumInfo>>(`/album/${albumId}`);
    console.log(`[tournamentService] Infos d'album reçues:`, response.data.data);
    return {
      id: response.data.data.id,
      name: response.data.data.name
    };
  } catch (error) {
    console.error(`[tournamentService] Erreur lors de la récupération des infos de l'album ${albumId}:`, error);
    throw error;
  }
};

// Get album images
export const getAlbumImages = async (albumId: string): Promise<TournamentImage[]> => {
  try {
    console.log(`[tournamentService] Récupération des images de l'album ${albumId}`);
    const response = await api.get<ApiResponse<AlbumInfo>>(`/album/${albumId}`);
    
    if (!response.data.data.image || response.data.data.image.length === 0) {
      console.warn(`[tournamentService] Aucune image trouvée pour l'album ${albumId}`);
      return [];
    }
    
    const images = response.data.data.image.map(img => ({
      id: img.id.toString(),
      src: img.path_image,
      name: img.name,
      description: img.description,
      url: img.url
    }));
    console.log(`[tournamentService] Images récupérées:`, images);
    return images;
  } catch (error) {
    console.error(`[tournamentService] Erreur lors de la récupération des images de l'album ${albumId}:`, error);
    throw error;
  }
};

// Create a new tournament
export const createTournament = async (tournament: Tournament): Promise<number> => {
    try {
      // Si tournament.description est null ou une chaîne vide, on envoie ""
      const formattedTournament = {
        name: tournament.name,
        description: tournament.description || "",
        private: Boolean(tournament.private),
        id_album: Number(tournament.id_album),
        turn: tournament.turn || 1
      };
      
      console.log('[tournamentService] Création du tournoi avec les données:', formattedTournament);
      
      const response = await api.post<ApiResponse<{ id: number }>>('/tournament', formattedTournament);
      console.log('[tournamentService] Tournoi créé. Réponse du serveur:', response.data.data);
      return response.data.data.id;
    } catch (error) {
      console.error('[tournamentService] Erreur lors de la création du tournoi:', error);
      throw error;
    }
  };
  
// Add tournament image
export const addTournamentImage = async (
  tournamentId: number,
  imageId: number,
  placement: number = 0,
  score: number = 0,
  isWinner: boolean = false
): Promise<void> => {
  try {
    const apiData = {
      id_image: Number(imageId),
      id_tournament: Number(tournamentId),
      placement: Number(placement),
      score: Number(score),
      isWinner: Boolean(isWinner)
    };
    
    console.log(`[tournamentService] Ajout de l'image ${imageId} au tournoi ${tournamentId} avec le payload:`, apiData);
    await api.post('/tournament/image', apiData);
    console.log(`[tournamentService] Image ${imageId} ajoutée avec succès au tournoi ${tournamentId}`);
  } catch (error) {
    console.error(`[tournamentService] Erreur lors de l'ajout de l'image ${imageId} au tournoi ${tournamentId}:`, error);
    throw error;
  }
};

// Save complete tournament with all images
export const saveTournament = async (
  tournamentData: Tournament,
  images: TournamentImage[],
  winnerId: string | ""
): Promise<number> => {
  try {
    console.log(`[tournamentService] Début de la sauvegarde complète du tournoi.`);
    // 1. Créer le tournoi
    const tournamentId = await createTournament({
      ...tournamentData,
      turn: images.length // On utilise le nombre d'images pour le turn
    });
    console.log(`[tournamentService] Tournoi créé avec l'ID ${tournamentId}.`);
    
    // 2. Ajouter chaque image avec son score
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const isWinner = winnerId === image.id;
      console.log(`[tournamentService] Traitement de l'image ${image.id} (placement ${i + 1}, score ${image.score || 0}, isWinner=${isWinner}).`);
      try {
        await addTournamentImage(
          tournamentId,
          parseInt(image.id),
          i + 1, // placement (commence à 1)
          image.score || 0,
          isWinner
        );
      } catch (imgError) {
        console.error(`[tournamentService] Échec lors de l'ajout de l'image ${image.id}. Erreur:`, imgError);
        // Continuer malgré l'erreur sur cette image
      }
    }
    
    // 3. Mettre à jour le tournoi pour enregistrer le vainqueur, si un vainqueur est défini
    if (winnerId) {
      console.log(`[tournamentService] Mise à jour du tournoi ${tournamentId} avec le vainqueur ${winnerId}.`);
      try {
        await api.put(`/tournament/${tournamentId}`, {
          winner_id: parseInt(winnerId)
        });
        console.log(`[tournamentService] Vainqueur mis à jour avec succès pour le tournoi ${tournamentId}.`);
      } catch (winnerError) {
        console.error(`[tournamentService] Erreur lors de la mise à jour du vainqueur pour le tournoi ${tournamentId}:`, winnerError);
        // Erreur non bloquante : continuer même si la mise à jour échoue
      }
    }
    
    console.log(`[tournamentService] Sauvegarde complète du tournoi ${tournamentId} terminée avec succès.`);
    return tournamentId;
  } catch (error) {
    console.error('[tournamentService] Erreur lors de la sauvegarde complète du tournoi:', error);
    throw error;
  }
};

// Get tournament by ID
export const getTournamentById = async (id: number): Promise<Tournament> => {
  try {
    console.log(`[tournamentService] Récupération du tournoi avec l'ID ${id}.`);
    const response = await api.get<ApiResponse<Tournament>>(`/tournament/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`[tournamentService] Erreur lors de la récupération du tournoi ${id}:`, error);
    throw error;
  }
};

// Get tournament images
export const getTournamentImages = async (tournamentId: number): Promise<TournamentImage[]> => {
  try {
    console.log(`[tournamentService] Récupération des images pour le tournoi ${tournamentId}.`);
    const response = await api.get<ApiResponse<Array<{
      id: number;
      placement: number;
      score: number;
      id_image: number;
      id_tournament: number;
      image: {
        id: number;
        name: string;
        path_image: string;
        description: string | null;
        url: string | null;
      }
    }>>>(`/tournament/${tournamentId}/image`);
    
    const tournamentImages = response.data.data.map(item => ({
      id: item.id_image.toString(),
      src: item.image.path_image,
      name: item.image.name,
      description: item.image.description,
      url: item.image.url,
      score: item.score
    }));
    console.log(`[tournamentService] Images récupérées pour le tournoi ${tournamentId}:`, tournamentImages);
    return tournamentImages;
  } catch (error) {
    console.error(`[tournamentService] Erreur lors de la récupération des images pour le tournoi ${tournamentId}:`, error);
    throw error;
  }
};

export default {
  getAlbumInfo,
  getAlbumImages,
  createTournament,
  addTournamentImage,
  saveTournament,
  getTournamentById,
  getTournamentImages
};
