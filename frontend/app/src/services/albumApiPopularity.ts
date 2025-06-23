import api from "./api";
import { Album, AlbumsResponse } from "./album-api";

// Interface pour les statistiques d'album avec nombre d'images
export interface AlbumUsageStats {
  id: number;
  name: string;
  tierlistCount: number;
  tournamentCount: number;
  rankingCount: number;
  totalUsageCount: number;
  imageCount: number; // Nouveau champ pour le nombre réel d'images
  categories: string[];
  imagePath: string;
  authorName: string;
}

// Fonction pour récupérer les statistiques d'utilisation d'un album de manière sécurisée
// Fonction pour récupérer les statistiques d'utilisation d'un album de manière sécurisée
export const getAlbumUsageStats = async (
  albumId: number,
): Promise<AlbumUsageStats | null> => {
  try {
    // Récupérer l'album de base
    const albumResponse = await api.get<{
      status: string;
      message: string;
      data: Album;
    }>(`/album/${albumId}`);
    const album = albumResponse.data.data;

    if (!album) return null;

    // Variables pour stocker les compteurs
    let tierlistCount = 0;
    let tournamentCount = 0;
    let rankingCount = 0;

    /*
    // Exemples de récupération sécurisée des counts, à décommenter si besoin
    try {
      const tierlistsResponse = await api.get(`/album/${albumId}/tierlist`);
      tierlistCount = (tierlistsResponse.data.data || []).length;
    } catch (err) {
      console.log(`Impossible de charger les tierlists pour l'album ${albumId}, utilisation de 0 par défaut`);
    }

    try {
      const tournamentsResponse = await api.get(`/album/${albumId}/tournament`);
      tournamentCount = (tournamentsResponse.data.data || []).length;
    } catch (err) {
      console.log(`Impossible de charger les tournois pour l'album ${albumId}, utilisation de 0 par défaut`);
    }

    try {
      const rankingsResponse = await api.get(`/album/${albumId}/ranking`);
      rankingCount = (rankingsResponse.data.data || []).length;
    } catch (err) {
      console.log(`Impossible de charger les classements pour l'album ${albumId}, utilisation de 0 par défaut`);
    }
    */

    // Calculer le nombre total d'utilisations réelles
    const totalUsageCount = tierlistCount + tournamentCount + rankingCount;

    // Calculer le nombre réel d'images dans l'album
    const imageCount = album.images ? album.images.length : 0;

    // Construire l'objet de statistiques avec le vrai nombre d'images
    return {
      id: album.id,
      name: album.name,
      tierlistCount,
      tournamentCount,
      rankingCount,
      totalUsageCount, // Utilise le vrai nombre sans simulation
      imageCount, // Nombre réel d'images
      categories: album.categories.map((cat) => cat.name),
      imagePath:
        album.images && album.images.length > 0
          ? album.images[0].path_image
          : "/default-image.jpg",
      authorName: album.author.username,
    };
  } catch (error) {
    console.warn(
      `Erreur lors de la récupération des statistiques pour l'album ${albumId}:`,
      error,
    );
    return null;
  }
};


// Fonction pour récupérer les albums les plus riches en images
export const getAlbumsByPopularity = async (
  limit: number = 10,
): Promise<AlbumUsageStats[]> => {
  try {
    // Récupérer tous les albums publics
    const albumsResponse = await api.get<AlbumsResponse>("/album");
    const albums = albumsResponse.data.data.filter(
      (album) => album.status === "public",
    );

    // Récupérer les statistiques pour chaque album
    const albumStats: AlbumUsageStats[] = [];

    for (const album of albums) {
      try {
        const stats = await getAlbumUsageStats(album.id);
        if (stats) {
          albumStats.push(stats);
        }
      } catch (err) {
        console.warn(
          `Erreur lors de la récupération des statistiques pour l'album ${album.id}:`,
          err,
        );
        // Continuer avec l'album suivant
      }
    }

    // Trier par nombre d'images, du plus riche au moins riche
    albumStats.sort((a, b) => b.imageCount - a.imageCount);

    // Retourner le nombre d'albums demandé
    return albumStats.slice(0, limit);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des albums par richesse en images:",
      error,
    );
    return [];
  }
};

// Fonction pour récupérer les albums les plus riches en images par catégorie
export const getPopularAlbumsByCategory = async (): Promise<
  Map<string, AlbumUsageStats[]>
> => {
  try {
    // Récupérer tous les albums avec leurs statistiques
    const allAlbums = await api.get<AlbumsResponse>("/album");
    const publicAlbums = allAlbums.data.data.filter(
      (album) => album.status === "public",
    );
console.log(publicAlbums);
    // Map pour stocker les albums par catégorie
    const albumsByCategory = new Map<string, AlbumUsageStats[]>();

    // Parcourir chaque album
    for (const album of publicAlbums) {
      try {
        // Obtenir les statistiques d'utilisation
        const stats = await getAlbumUsageStats(album.id);

        if (stats) {
          // Ajouter l'album à chaque catégorie qu'il possède
          for (const category of stats.categories) {
            if (!albumsByCategory.has(category)) {
              albumsByCategory.set(category, []);
            }

            albumsByCategory.get(category)?.push(stats);
          }
        }
      } catch (err) {
        console.warn(
          `Erreur lors de la récupération des statistiques pour l'album ${album.id}:`,
          err,
        );
        // Continuer avec l'album suivant
      }
    }

    // Trier les albums dans chaque catégorie par nombre d'images
    albumsByCategory.forEach((albums, category) => {
      albums.sort((a, b) => b.imageCount - a.imageCount);
      // Limiter à 8 albums par catégorie
      albumsByCategory.set(category, albums.slice(0, 8));
    });

    return albumsByCategory;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des albums riches en images par catégorie:",
      error,
    );
    return new Map();
  }
};
