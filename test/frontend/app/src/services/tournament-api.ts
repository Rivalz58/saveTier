import api from './api';

// Interface pour les données de tournoi
export interface TournamentAuthor {
  id: number;
  username: string;
  nametag: string;
  email: string;
  status: string;
  last_connexion: string;
  createdAt: string;
  updatedAt: string;
}

export interface TournamentAlbum {
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
    last_connexion: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface Tournament {
  id: number;
  name: string;
  description: string;
  turn: number;
  private: boolean;
  createdAt: string;
  updatedAt: string;
  author: TournamentAuthor;
  album: TournamentAlbum;
  tournamentImage: unknown[]; // Ajuster selon les données réelles
}

export interface TournamentsResponse {
  status: string;
  message: string;
  data: Tournament[];
}

// Fonction pour récupérer tous les tournois
export const getAllTournaments = async (): Promise<Tournament[]> => {
  try {
    const response = await api.get<TournamentsResponse>('/tournament');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    return [];
  }
};

// Fonction pour obtenir uniquement les tournois publics
export const getPublicTournaments = async (): Promise<Tournament[]> => {
  try {
    const tournaments = await getAllTournaments();
    return tournaments.filter(tournament => !tournament.private);
  } catch (error) {
    console.error('Error fetching public tournaments:', error);
    return [];
  }
};

// Fonction pour récupérer un tournoi spécifique par ID
export const getTournamentById = async (id: number): Promise<Tournament | null> => {
  try {
    const response = await api.get<{ status: string; message: string; data: Tournament }>(`/tournament/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching tournament ${id}:`, error);
    return null;
  }
};