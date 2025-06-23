import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import CategoryCard from "../components/CategoryCard";
import AlbumModal from "../components/AlbumModal";
import "../styles/Homepage.css";
import {
  getPopularAlbumsByCategory,
  getAlbumsByPopularity,
  AlbumUsageStats,
} from "../services/albumApiPopularity";

interface HomepageProps {
  user: string | null;
}

const INITIAL_CATEGORIES_TO_SHOW = 2; // Nombre initial de catégories à afficher
const CATEGORIES_PER_LOAD = 2; // Nombre de catégories à charger à chaque fois

const Homepage: React.FC<HomepageProps> = ({ user }) => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumUsageStats | null>(
    null,
  );

  // États pour stocker les données d'albums
  const [popularAlbums, setPopularAlbums] = useState<AlbumUsageStats[]>([]);
  const [allCategorySections, setAllCategorySections] = useState<
    { title: string; albums: AlbumUsageStats[] }[]
  >([]);
  const [visibleCategorySections, setVisibleCategorySections] = useState<
    { title: string; albums: AlbumUsageStats[] }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Référence pour l'observateur d'intersection
  const loaderRef = useRef<HTMLDivElement>(null);

  // Chargement des données au montage du composant
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Récupérer les albums les plus populaires (triés par nombre d'utilisations)
        const popularAlbumsData = await getAlbumsByPopularity(7);
        setPopularAlbums(popularAlbumsData);

        try {
          // Récupérer tous les albums par catégorie, triés par popularité
          const albumsByCategory = await getPopularAlbumsByCategory();

          // Créer les sections de catégories
          const sections = Array.from(albumsByCategory.entries())
            .map(([title, albums]) => ({
              title,
              albums,
            }))
            .filter((section) => section.albums.length > 0); // Filtrer les catégories vides

          setAllCategorySections(sections);
          // Initialiser avec seulement les premières catégories
          setVisibleCategorySections(
            sections.slice(0, INITIAL_CATEGORIES_TO_SHOW),
          );
        } catch (categoryError) {
          console.error(
            "Erreur lors de la récupération des albums par catégorie:",
            categoryError,
          );
          // Ne pas bloquer l'affichage des albums populaires si les catégories échouent
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Erreur lors de la récupération des albums:", err);
        setError(
          "Impossible de charger les albums. Veuillez réessayer plus tard.",
        );
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fonction pour charger plus de catégories
  const loadMoreCategories = useCallback(() => {
    setVisibleCategorySections((prev) => {
      const currentLength = prev.length;
      const nextCategories = allCategorySections.slice(
        currentLength,
        currentLength + CATEGORIES_PER_LOAD,
      );
      return [...prev, ...nextCategories];
    });
  }, [allCategorySections]);

  // Configuration de l'Intersection Observer
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (
        entry.isIntersecting &&
        visibleCategorySections.length < allCategorySections.length
      ) {
        loadMoreCategories();
      }
    }, options);

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [
    loaderRef,
    visibleCategorySections.length,
    allCategorySections.length,
    loadMoreCategories,
  ]);

  // Fonction pour naviguer vers AllAlbum avec un filtrage de catégorie
  const navigateToCategory = (category: string | null) => {
    if (category) {
      navigate(`/allalbum?category=${encodeURIComponent(category)}`);
    } else {
      navigate("/allalbum");
    }
  };

  // Gestionnaire de clic sur un album
  const handleAlbumClick = (album: AlbumUsageStats) => {
    setSelectedAlbum(album);
    setModalOpen(true);
  };

  // Affichage pendant le chargement
  if (isLoading) {
    return (
      <div className="homepage">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement des albums...</p>
        </div>
      </div>
    );
  }

  // Affichage en cas d'erreur
  if (error) {
    return (
      <div className="homepage">
        <div className="error-container">
          <h2>Erreur</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Réessayer</button>
        </div>
      </div>
    );
  }

  return (
    <div className="homepage">
      {/* Section Albums Populaires */}
      <div className="album-populaire-header">
        <h2 className="section-title">Albums Populaires</h2>
        <button className="view-more" onClick={() => navigateToCategory(null)}>
          Voir tout
        </button>
      </div>

      {popularAlbums.length > 0 ? (
        <div className="categories">
          {popularAlbums.map((album, index) => (
            <div
              key={`popular-${album.id}-${index}`}
              onClick={() => handleAlbumClick(album)}
              className="category-container"
            >
              <div className="album-usage-count">
                {album.imageCount}{" "}
                {album.imageCount === 1 ? "image" : "images"}
              </div>
              <CategoryCard
                name={album.name}
                image={album.imagePath}
                categories={album.categories}
                authorName={album.authorName}
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="no-items">Aucun album populaire disponible</p>
      )}

      {/* Sections de catégories chargées progressivement */}
      {visibleCategorySections.map((section, index) => (
        <div key={`section-${section.title}-${index}`}>
          <div className="section-header">
            <h3 className="section-title">{section.title}</h3>
            <button
              onClick={() => navigateToCategory(section.title)}
              className="view-more"
            >
              Voir Plus
            </button>
          </div>
          <div className="categories">
            {section.albums.map((album, idx) => (
              <div
                key={`category-${album.id}-${idx}`}
                onClick={() => handleAlbumClick(album)}
                className="category-container"
              >
                <div className="album-usage-count">
                  {album.imageCount}{" "}
                  {album.imageCount === 1 ? "image" : "images"}
                </div>
                <CategoryCard
                  name={album.name}
                  image={album.imagePath}
                  categories={album.categories}
                  authorName={album.authorName}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Indicateur de chargement pour les catégories supplémentaires */}
      {visibleCategorySections.length < allCategorySections.length && (
        <div ref={loaderRef} className="category-loader">
          <div className="loading-spinner-small"></div>
          <p>Chargement de plus de catégories...</p>
        </div>
      )}

      {/* Afficher un message si aucune catégorie n'est disponible */}
      {popularAlbums.length > 0 && allCategorySections.length === 0 && (
        <div className="no-categories-message">
          <p>Aucune catégorie d'album n'est disponible pour le moment.</p>
        </div>
      )}

      {/* Modal pour créer tierlist/tournoi/classement */}
      {selectedAlbum && (
        <AlbumModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          albumName={selectedAlbum.name}
          albumId={selectedAlbum.id.toString()}
          isUserLoggedIn={user !== null}
          categories={selectedAlbum.categories}
        />
      )}
    </div>
  );
};

export default Homepage;
