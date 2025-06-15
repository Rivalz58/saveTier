import api from "./api";
import { Album, AlbumsResponse } from "./album-api";

// Réexporter les types importés pour qu'ils soient disponibles aux importateurs
export type { Album, AlbumsResponse } from "./album-api";

// Interface pour paramètres de pagination et filtrage
export interface AlbumQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sortBy?: "popular"; // Simplifié pour n'avoir que 'popular'
}

// Interface pour résultat paginé
export interface PaginatedAlbums {
  albums: Album[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

// Fonction pour obtenir les albums paginés
export const getPaginatedAlbums = async (
  params: AlbumQueryParams,
): Promise<PaginatedAlbums> => {
  try {
    // Paramètres par défaut
    const page = params.page || 1;
    const limit = params.limit || 21;

    // Pour l'instant, on récupère tous les albums puis on les filtre en client
    // À terme, l'API gérera la pagination côté serveur
    const response = await api.get<AlbumsResponse>("/album");
    let albums = response.data.data;

    // Filtrage pour ne garder que les albums publics
    albums = albums.filter((album) => album.status === "public");

    // Filtrage par catégorie si spécifié
    if (params.category) {
      albums = albums.filter((album) =>
        album.categories.some((cat) => cat.name === params.category),
      );
    }

    // Recherche par nom si spécifiée
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      albums = albums.filter((album) =>
        album.name.toLowerCase().includes(searchLower),
      );
    }

    // Tri des résultats (toujours par popularité - pour l'instant basé sur la date)
    // Pour l'instant, on utilise la date comme approximation
    // À terme, on utilisera les statistiques de vues
    albums.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    // Code futur pour le tri par popularité :
    // albums.sort((a, b) => (b.stats?.views || 0) - (a.stats?.views || 0));

    // Calcul du nombre total de pages
    const total = albums.length;
    const totalPages = Math.ceil(total / limit);

    // Pagination (à remplacer par une pagination côté serveur)
    const startIndex = (page - 1) * limit;
    const paginatedAlbums = albums.slice(startIndex, startIndex + limit);

    return {
      albums: paginatedAlbums,
      total,
      page,
      totalPages,
      hasMore: page < totalPages,
    };
  } catch (error) {
    console.error("Error fetching paginated albums:", error);
    return {
      albums: [],
      total: 0,
      page: params.page || 1,
      totalPages: 0,
      hasMore: false,
    };
  }
};

// Fonction pour obtenir toutes les catégories disponibles avec leur nombre d'albums
export const getCategoriesWithCount = async (): Promise<
  { name: string; count: number }[]
> => {
  try {
    const publicAlbums = await getPublicAlbums();
    const categoryCountMap = new Map<string, number>();

    // Compter les albums par catégorie
    publicAlbums.forEach((album) => {
      album.categories.forEach((category) => {
        const count = categoryCountMap.get(category.name) || 0;
        categoryCountMap.set(category.name, count + 1);
      });
    });

    // Convertir la map en tableau et trier par nombre d'albums décroissant
    return Array.from(categoryCountMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error("Error fetching categories with count:", error);
    return [];
  }
};

// Fonction pour obtenir tous les albums publics (réutilisée de album-api.ts)
export const getPublicAlbums = async (): Promise<Album[]> => {
  try {
    const response = await api.get<AlbumsResponse>("/album");
    return response.data.data.filter((album) => album.status === "public");
  } catch (error) {
    console.error("Error fetching public albums:", error);
    return [];
  }
};
