import api from './api';

// Interface pour les données de tierlist
export interface TierlistAuthor {
  id: number;
  username: string;
  nametag: string;
  email: string;
  status: string;
  last_connection: string;
  createdAt: string;
  updatedAt: string;
}

export interface TierlistAlbum {
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

export interface Tierlist {
  id: number;
  name: string;
  description: string;
  private: boolean;
  createdAt: string;
  updatedAt: string;
  author: TierlistAuthor;
  album: TierlistAlbum;
  tierlistLine: unknown[]; // Ajuster selon les données réelles
}

export interface TierlistsResponse {
  status: string;
  message: string;
  data: Tierlist[];
}

// Fonction pour récupérer toutes les tierlists
export const getAllTierlists = async (): Promise<Tierlist[]> => {
  try {
    const response = await api.get<TierlistsResponse>('/tierlist');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching tierlists:', error);
    return [];
  }
};

// Fonction pour obtenir uniquement les tierlists publiques
export const getPublicTierlists = async (): Promise<Tierlist[]> => {
  try {
    const tierlists = await getAllTierlists();
    return tierlists.filter(tierlist => !tierlist.private);
  } catch (error) {
    console.error('Error fetching public tierlists:', error);
    return [];
  }
};

// Fonction pour récupérer une tierlist spécifique par ID
export const getTierlistById = async (id: number): Promise<Tierlist | null> => {
  try {
    const response = await api.get<{ status: string; message: string; data: Tierlist }>(`/tierlist/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching tierlist ${id}:`, error);
    return null;
  }
};