import api from './api';

// Interface pour les données de classement
export interface RankingAuthor {
  id: number;
  username: string;
  nametag: string;
  email: string;
  status: string;
  last_connection: string;
  createdAt: string;
  updatedAt: string;
}

export interface RankingAlbum {
  id: number;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: number;
    username: string;
    nametag: string;
    email: string;
    status: string;
    last_connection: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface Ranking {
  id: number;
  name: string;
  description: string;
  private: boolean;
  createdAt: string;
  updatedAt: string;
  author: RankingAuthor;
  album: RankingAlbum;
  rankingImage: unknown[]; // Ajuster selon les données réelles
}

export interface RankingsResponse {
  status: string;
  message: string;
  data: Ranking[];
}

// Fonction pour récupérer tous les classements
export const getAllRankings = async (): Promise<Ranking[]> => {
  try {
    // Cette fonction sera implémentée ultérieurement quand l'API sera disponible
    // const response = await api.get<RankingsResponse>('/ranking');
    // return response.data.data;
    
    // En attendant, nous retournons un tableau vide
    return [];
  } catch (error) {
    console.error('Error fetching rankings:', error);
    return [];
  }
};

// Fonction pour obtenir uniquement les classements publics
export const getPublicRankings = async (): Promise<Ranking[]> => {
  try {
    const rankings = await getAllRankings();
    return rankings.filter(ranking => !ranking.private);
  } catch (error) {
    console.error('Error fetching public rankings:', error);
    return [];
  }
};

// Fonction pour récupérer un classement spécifique par ID
export const getRankingById = async (id: number): Promise<Ranking | null> => {
  try {
    // Cette fonction sera implémentée ultérieurement quand l'API sera disponible
    // const response = await api.get<{ status: string; message: string; data: Ranking }>(`/ranking/${id}`);
    // return response.data.data;
    
    // En attendant, nous retournons null
    return null;
  } catch (error) {
    console.error(`Error fetching ranking ${id}:`, error);
    return null;
  }
};