import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CategoryCard from "../components/CategoryCard";
import AlbumModal from "../components/AlbumModal";
import "../styles/Homepage.css";
import { getPopularAlbums, getAlbumsByCategory, Album } from "../services/album-api";

// Type pour les items formatés pour l'affichage
type CategoryItem = {
  id: string;
  name: string;
  image: string;
  categories: string[];
  authorName: string;
  // Propriétés pour les futures statistiques
  views?: number;
  uses?: number;
};

interface HomepageProps {
  user: string | null;
}

const Homepage: React.FC<HomepageProps> = ({ user }) => {
  const navigate = useNavigate();
  // État pour gérer la modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<CategoryItem | null>(null);
  
  // États pour stocker les données d'albums
  const [popularAlbums, setPopularAlbums] = useState<CategoryItem[]>([]);
  const [categorySections, setCategorySections] = useState<{title: string, categories: CategoryItem[]}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour convertir un album de l'API en CategoryItem
  const albumToCategoryItem = (album: Album): CategoryItem => {
    return {
      id: album.id.toString(),
      name: album.name,
      // Utilise la première image de l'album, ou une image par défaut si aucune n'est disponible
      image: album.image && album.image.length > 0 ? album.image[0].path_image : '/default-image.jpg',
      // Extrait les noms des catégories
      categories: album.categories.map(cat => cat.name),
      authorName: album.author.username,
      // Ajouter les futures statistiques quand elles seront disponibles
      views: album.stats?.views,
      uses: album.stats?.uses
    };
  };

  // Chargement des données au montage du composant
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Récupérer les albums les plus populaires (triés par vues dans le futur)
        const popularAlbumsData = await getPopularAlbums(5);
        setPopularAlbums(popularAlbumsData.map(albumToCategoryItem));
        
        // Récupérer tous les albums par catégorie
        const albumsByCategory = await getAlbumsByCategory();
        
        // Créer les sections de catégories (limité à 7 albums par catégorie)
        const sections = Array.from(albumsByCategory.entries())
          .map(([title, albums]) => {
            // À l'avenir, on pourrait trier ici par popularité à l'intérieur de chaque catégorie
            // Pour l'instant, on garde l'ordre par défaut
            return {
              title,
              categories: albums
                .map(albumToCategoryItem)
                .slice(0, 7) // Limiter à 7 albums par catégorie
            };
          })
          .filter(section => section.categories.length > 0); // Filtrer les catégories vides
        
        setCategorySections(sections);
        setIsLoading(false);
      } catch (err) {
        console.error("Erreur lors de la récupération des albums:", err);
        setError("Impossible de charger les albums. Veuillez réessayer plus tard.");
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fonction pour naviguer vers AllAlbum avec un filtrage de catégorie
  const navigateToCategory = (category: string | null) => {
    if (category) {
      navigate(`/allalbum?category=${encodeURIComponent(category)}`);
    } else {
      navigate("/allalbum");
    }
  };

  // Gestionnaire de clic sur un album
  const handleAlbumClick = (album: CategoryItem) => {
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
      <h2 className="page-title">
        {user ? `Bienvenue, ${user} !` : "Bienvenue sur TierHub ! Connectez-vous pour plus de fonctionnalités."}
      </h2>
      
      {/* Section Albums Populaires */}
      <div className="album-populaire-header">
        <h2 className="section-title">Albums Populaires</h2>
        <button className="view-more" onClick={() => navigateToCategory(null)}>Voir tout</button>
      </div>
      
      {popularAlbums.length > 0 ? (
        <div className="categories">
          {popularAlbums.map((album, index) => (
            <div key={index} onClick={() => handleAlbumClick(album)} className="category-container">
              <CategoryCard 
                name={album.name} 
                image={album.image} 
                categories={album.categories}
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="no-items">Aucun album populaire disponible</p>
      )}

      {/* Sections de catégories */}
      {categorySections.map((section, index) => (
        <div key={index}>
          <div className="section-header">
            <h3 className="section-title">{section.title}</h3>
            <button onClick={() => navigateToCategory(section.title)} className="view-more">Voir Plus</button>
          </div>
          <div className="categories">
            {section.categories.map((album, idx) => (
              <div key={idx} onClick={() => handleAlbumClick(album)} className="category-container">
                <CategoryCard 
                  name={album.name} 
                  image={album.image} 
                  categories={album.categories}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

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
    </div>
  );
};

export default Homepage;