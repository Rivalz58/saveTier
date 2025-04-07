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
    const response = await api.get<ApiResponse<AlbumInfo>>(`/album/${albumId}`);
    return {
      id: response.data.data.id,
      name: response.data.data.name
    };
  } catch (error) {
    console.error(`Error fetching album info for album ${albumId}:`, error);
    throw error;
  }
};

// Get album images
export const getAlbumImages = async (albumId: string): Promise<TournamentImage[]> => {
  try {
    const response = await api.get<ApiResponse<AlbumInfo>>(`/album/${albumId}`);
    
    if (!response.data.data.image || response.data.data.image.length === 0) {
      return [];
    }
    
    // Convert album images to tournament format
    return response.data.data.image.map(img => ({
      id: img.id.toString(),
      src: img.path_image,
      name: img.name,
      description: img.description,
      url: img.url
    }));
  } catch (error) {
    console.error(`Error fetching album images for album ${albumId}:`, error);
    throw error;
  }
};

// Create a new tournament
export const createTournament = async (tournament: Tournament): Promise<number> => {
  try {
    // Ensure all fields are properly formatted
    const formattedTournament = {
      name: tournament.name,
      description: tournament.description === "" ? null : tournament.description,
      private: Boolean(tournament.private),
      id_album: Number(tournament.id_album),
      turn: tournament.turn || 1
    };
    
    console.log('Tournament data to send:', formattedTournament);
    
    const response = await api.post<ApiResponse<{ id: number }>>('/tournament', formattedTournament);
    return response.data.data.id;
  } catch (error) {
    console.error('Error creating tournament:', error);
    throw error;
  }
};

// Add tournament images
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
    
    await api.post('/tournament/image', apiData);
  } catch (error) {
    console.error(`Error adding image ${imageId} to tournament ${tournamentId}:`, error);
    throw error;
  }
};

// Save complete tournament with all images
export const saveTournament = async (
  tournamentData: Tournament,
  images: TournamentImage[],
  winnerId: string | null = null
): Promise<number> => {
  try {
    // 1. Create the tournament
    const tournamentId = await createTournament({
      ...tournamentData,
      turn: images.length // Set turn count to image count
    });
    
    // 2. Add images with their scores
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      try {
        const isWinner = winnerId === image.id;
        await addTournamentImage(
          tournamentId,
          parseInt(image.id),
          i + 1, // Placement (starting at 1)
          image.score || 0,
          isWinner
        );
      } catch (imgError) {
        console.error(`Error adding image ${image.id} to tournament:`, imgError);
        // Continue with other images if one fails
      }
    }
    
    // 3. If there's a winner, update the tournament
    if (winnerId) {
      try {
        await api.put(`/tournament/${tournamentId}`, {
          winner_id: parseInt(winnerId)
        });
      } catch (winnerError) {
        console.error(`Error setting winner for tournament ${tournamentId}:`, winnerError);
        // Not critical, continue
      }
    }
    
    return tournamentId;
  } catch (error) {
    console.error('Error saving complete tournament:', error);
    throw error;
  }
};

// Get tournament by ID
export const getTournamentById = async (id: number): Promise<Tournament> => {
  try {
    const response = await api.get<ApiResponse<Tournament>>(`/tournament/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching tournament ${id}:`, error);
    throw error;
  }
};

// Get tournament images
export const getTournamentImages = async (tournamentId: number): Promise<TournamentImage[]> => {
  try {
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
    
    return response.data.data.map(item => ({
      id: item.id_image.toString(),
      src: item.image.path_image,
      name: item.image.name,
      description: item.image.description,
      url: item.image.url,
      score: item.score
    }));
  } catch (error) {
    console.error(`Error fetching images for tournament ${tournamentId}:`, error);
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