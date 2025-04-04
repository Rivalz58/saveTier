import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CategoryCard from "../components/CategoryCard";
import AlbumModal from "../components/AlbumModal";
import "../styles/AllAlbum.css";
import { getPaginatedAlbums, getCategoriesWithCount, Album, AlbumQueryParams } from "../services/album-api-pagination.js";

// Type pour les items formatés pour l'affichage
type CategoryItem = {
  id: string;
  name: string;
  image: string;
  categories: string[];
  authorName: string;
  // Pour les futures statistiques
  views?: number;
  uses?: number;
};

interface AllAlbumProps {
  user: string | null;
}

const AllAlbum: React.FC<AllAlbumProps> = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // États pour la recherche et le filtrage
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // La valeur par défaut est toujours 'popular' et ne change pas
  const sortBy = 'popular' as const;

  // États pour les données
  const [albums, setAlbums] = useState<CategoryItem[]>([]);
  const [categories, setCategories] = useState<{name: string, count: number}[]>([]);
  
  // États pour la pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // États pour le chargement et les erreurs
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // État pour la modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<CategoryItem | null>(null);

  // Fonction pour convertir un album de l'API en CategoryItem
  const albumToCategoryItem = (album: Album): CategoryItem => {
    return {
      id: album.id.toString(),
      name: album.name,
      image: album.image && album.image.length > 0 ? album.image[0].path_image : '/default-image.jpg',
      categories: album.categories.map((cat: { name: string }) => cat.name),
      authorName: album.author.username,
      // Pour les futures statistiques
      views: album.stats?.views,
      uses: album.stats?.uses
    };
  };

  // Effet pour le debounce de la recherche
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      // Réinitialiser la pagination lors d'une nouvelle recherche
      setPage(1);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Effet pour détecter le paramètre de catégorie dans l'URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get('category');
    if (category) {
      setSelectedCategory(category);
    }
  }, [location]);

  // Fonction pour charger les albums avec pagination
  const loadAlbums = useCallback(async (pageToLoad: number, resetCurrentAlbums: boolean = false) => {
    try {
      setIsLoadingMore(pageToLoad > 1);
      if (pageToLoad === 1) setIsLoading(true);

      // Préparer les paramètres de requête
      const queryParams: AlbumQueryParams = {
        page: pageToLoad,
        limit: 12,
        sortBy: sortBy
      };

      if (selectedCategory) {
        queryParams.category = selectedCategory;
      }

      if (debouncedSearchQuery) {
        queryParams.search = debouncedSearchQuery;
      }

      // Récupérer les albums paginés
      const result = await getPaginatedAlbums(queryParams);
      
      // Convertir les albums pour l'affichage
      const formattedAlbums = result.albums.map(albumToCategoryItem);

      // Mettre à jour les albums (soit ajouter à la liste existante, soit réinitialiser)
      if (resetCurrentAlbums) {
        setAlbums(formattedAlbums);
      } else {
        setAlbums(prev => [...prev, ...formattedAlbums]);
      }

      // Mettre à jour les informations de pagination
      setHasMore(result.hasMore);
    } catch (err) {
      console.error("Erreur lors du chargement des albums:", err);
      setError("Impossible de charger les albums. Veuillez réessayer plus tard.");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [selectedCategory, debouncedSearchQuery, sortBy]);

  // Effet pour charger les catégories disponibles
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesWithCount = await getCategoriesWithCount();
        setCategories(categoriesWithCount);
      } catch (err) {
        console.error("Erreur lors du chargement des catégories:", err);
      }
    };

    loadCategories();
  }, []);

  // Effet pour charger les albums lorsque les filtres changent
  useEffect(() => {
    loadAlbums(1, true);
  }, [loadAlbums, selectedCategory, debouncedSearchQuery]);

  // Fonction pour charger plus d'albums
  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadAlbums(nextPage);
    }
  };

  // Fonction pour gérer le changement de catégorie
  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    setPage(1);
  };

  // Gestionnaire de clic sur un album
  const handleAlbumClick = (album: CategoryItem) => {
    setSelectedAlbum(album);
    setModalOpen(true);
  };

  // Affichage pendant le chargement initial
  if (isLoading && page === 1) {
    return (
      <div className="all-album-container">
        <h1 className="all-album-title">Tous les Albums</h1>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement des albums...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="all-album-container">
      <h1 className="all-album-title">Tous les Albums</h1>
      
      {/* Barre de recherche et filtres */}
      <div className="album-filters">
        <div className="search-container">
          <input
            type="text"
            placeholder="Rechercher un album..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="album-search"
          />
        </div>
        
        {/* Filtres de catégories */}
        <div className="category-filters">
          <button 
            className={`category-filter ${selectedCategory === null ? 'active' : ''}`}
            onClick={() => handleCategoryChange(null)}
          >
            Par popularité
          </button>
          
          {categories.map((category, index) => (
            <button
              key={index}
              className={`category-filter ${selectedCategory === category.name ? 'active' : ''}`}
              onClick={() => handleCategoryChange(category.name)}
            >
              {category.name} <span className="category-count">({category.count})</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Message si aucun résultat */}
      {albums.length === 0 && !isLoading ? (
        <div className="no-results">
          <p>Aucun album ne correspond à votre recherche</p>
        </div>
      ) : (
        <div className="all-albums-section">
          <div className="all-albums-grid">
            {albums.map((album, index) => (
              <div 
                key={album.id + "-" + index} 
                className="album-card-container"
                onClick={() => handleAlbumClick(album)}
              >
                {/*{/* Ajouter un badge pour les vues futures */}
                <div className="album-usage-count">
                  {/* Afficher les vues ou utilisations quand disponibles */}
                  {/* {album.views ? `${album.views} vues` : `${album.uses || 0} utilisations`} */}
                  {/*{selectedCategory ? `Par ${album.authorName}` : album.categories.slice(0, 1).join(", ")*/}
                </div>
                <CategoryCard 
                  name={album.name} 
                  image={album.image} 
                  categories={album.categories}
                />
              </div>
            ))}
          </div>
          
          {/* Bouton "Charger plus" */}
          {hasMore && (
            <div className="load-more-container">
              <button 
                className="load-more-button" 
                onClick={handleLoadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <>
                    <span className="load-more-spinner"></span>
                    Chargement...
                  </>
                ) : (
                  "Charger plus d'albums"
                )}
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Prompt pour créer un album si connecté */}
      {user && (
        <div className="create-album-prompt">
          <p>Vous ne trouvez pas ce que vous cherchez ?</p>
          <button 
            className="create-album-btn"
            onClick={() => navigate("/add-album")}
          >
            Créer un nouvel album
          </button>
        </div>
      )}

      {/* Modal pour créer tierlist/tournoi/classement */}
      {selectedAlbum && (
        <AlbumModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          albumName={selectedAlbum.name}
          albumId={selectedAlbum.id}
          isUserLoggedIn={user !== null}
          categories={selectedAlbum.categories}
        />
      )}
      
      {/* Message d'erreur */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => loadAlbums(1, true)}>Réessayer</button>
        </div>
      )}
    </div>
  );
};

export default AllAlbum;