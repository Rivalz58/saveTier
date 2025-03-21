import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CategoryCard from "../components/CategoryCard";
import "../styles/AllAlbum.css";

// Import de l'image depuis le dossier assets
import filmsImage from "../assets/films.jpg";

interface TournoisProps {
  user: string | null;
}

type Tournoi = {
  id: string;
  name: string;
  image: string;
  creator: string;
  creatorId: string;
  category: string;
  createdAt: string;
  isPublic: boolean;
  participants: number;
};

type TournoiCategory = {
  title: string;
  tournois: Tournoi[];
};

// Données exemple des tournois
const tournoiCategories: TournoiCategory[] = [
  {
    title: "Manga",
    tournois: [
      { id: "tournoi-001", name: "Personnages One Piece", image: filmsImage, creator: "User1", creatorId: "user-001", category: "Manga", createdAt: "2024-02-15", isPublic: true, participants: 1256 },
      { id: "tournoi-002", name: "Personnages Naruto", image: filmsImage, creator: "User2", creatorId: "user-002", category: "Manga", createdAt: "2024-01-20", isPublic: true, participants: 942 },
      { id: "tournoi-003", name: "Meilleurs arcs de Bleach", image: filmsImage, creator: "User3", creatorId: "user-003", category: "Manga", createdAt: "2024-02-05", isPublic: true, participants: 620 },
      { id: "tournoi-004", name: "Personnages My Hero Academia", image: filmsImage, creator: "User1", creatorId: "user-001", category: "Manga", createdAt: "2024-03-10", isPublic: true, participants: 523 },
    ],
  },
  {
    title: "Films",
    tournois: [
      { id: "tournoi-005", name: "Films Marvel", image: filmsImage, creator: "User2", creatorId: "user-002", category: "Films", createdAt: "2024-02-10", isPublic: true, participants: 834 },
      { id: "tournoi-006", name: "Films Disney", image: filmsImage, creator: "User3", creatorId: "user-003", category: "Films", createdAt: "2024-01-15", isPublic: true, participants: 723 },
      { id: "tournoi-007", name: "Films DC", image: filmsImage, creator: "User1", creatorId: "user-001", category: "Films", createdAt: "2024-03-05", isPublic: true, participants: 421 },
    ],
  },
  {
    title: "Jeux Vidéo",
    tournois: [
      { id: "tournoi-008", name: "Jeux Zelda", image: filmsImage, creator: "User3", creatorId: "user-003", category: "Jeux Vidéo", createdAt: "2024-01-25", isPublic: true, participants: 587 },
      { id: "tournoi-009", name: "Jeux Pokémon", image: filmsImage, creator: "User2", creatorId: "user-002", category: "Jeux Vidéo", createdAt: "2024-02-20", isPublic: true, participants: 532 },
      { id: "tournoi-010", name: "Jeux Final Fantasy", image: filmsImage, creator: "Admin", creatorId: "user-005", category: "Jeux Vidéo", createdAt: "2024-03-01", isPublic: true, participants: 476 },
    ],
  },
  {
    title: "Musique",
    tournois: [
      { id: "tournoi-011", name: "Albums Rock", image: filmsImage, creator: "User1", creatorId: "user-001", category: "Musique", createdAt: "2024-01-10", isPublic: true, participants: 345 },
      { id: "tournoi-012", name: "Albums Hip-Hop", image: filmsImage, creator: "User4", creatorId: "user-004", category: "Musique", createdAt: "2024-02-08", isPublic: true, participants: 302 },
    ],
  },
];

// Fonction pour obtenir tous les tournois, triés par popularité
const getAllTournoisSortedByPopularity = (): Tournoi[] => {
  const allTournois: Tournoi[] = [];
  
  tournoiCategories.forEach(category => {
    allTournois.push(...category.tournois);
  });
  
  return allTournois.sort((a, b) => b.participants - a.participants);
};

const Tournois: React.FC<TournoisProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Détecter si on arrive via un "Voir plus" spécifique à une catégorie
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get('category');
    if (category) {
      setSelectedCategory(category);
    }
  }, [location]);

  // Obtenir la liste de tous les tournois, soit par catégorie, soit tous triés par popularité
  const getFilteredTournois = () => {
    if (!selectedCategory) {
      // Si aucune catégorie n'est sélectionnée, montrer tous les tournois par popularité
      const allTournois = getAllTournoisSortedByPopularity();
      return allTournois.filter(tournoi => 
        tournoi.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else {
      // Sinon, filtrer par catégorie sélectionnée
      const categoryData = tournoiCategories.find(cat => cat.title === selectedCategory);
      if (!categoryData) return [];
      
      return categoryData.tournois
        .filter(tournoi => tournoi.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => b.participants - a.participants); // Toujours trier par popularité
    }
  };

  // Liste filtrée de tournois
  const filteredTournois = getFilteredTournois();
  
  // Générer la liste de toutes les catégories disponibles
  const categoryTitles = tournoiCategories.map(category => category.title);

  // Gérer le clic sur un tournoi
  const handleTournoiClick = (tournoi: Tournoi) => {
    // Rediriger vers la page de détail du tournoi
    navigate(`/tournois/${tournoi.id}`);
  };

  // Gérer la création d'un nouveau tournoi - rediriger vers les albums
  const handleCreateTournoi = () => {
    // Rediriger vers la page des albums pour choisir un album
    // Même les utilisateurs non connectés peuvent y accéder
    navigate("/allalbum");
  };

  return (
    <div className="all-album-container">
      <h1 className="all-album-title">Tous les Tournois</h1>
      
      <div className="album-filters">
        <div className="search-container">
          <input
            type="text"
            placeholder="Rechercher un tournoi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="album-search"
          />
        </div>
        
        <div className="category-filters">
          <button 
            className={`category-filter ${selectedCategory === null ? 'active' : ''}`}
            onClick={() => setSelectedCategory(null)}
          >
            Plus Populaires
          </button>
          
          {categoryTitles.map((title, index) => (
            <button
              key={index}
              className={`category-filter ${selectedCategory === title ? 'active' : ''}`}
              onClick={() => setSelectedCategory(title)}
            >
              {title}
            </button>
          ))}
        </div>
      </div>
      
      {filteredTournois.length === 0 ? (
        <div className="no-results">
          <p>Aucun tournoi ne correspond à votre recherche</p>
        </div>
      ) : (
        <div className="all-albums-section">
          {!selectedCategory ? (
            // Vue "Plus Populaires"
            <div>
              <h2 className="category-title">Tournois les plus populaires</h2>
              <div className="all-albums-grid">
                {filteredTournois.map((tournoi, index) => (
                  <div 
                    key={index} 
                    className="album-card-container"
                    onClick={() => handleTournoiClick(tournoi)}
                  >
                    <div className="album-usage-count">{tournoi.participants} participants</div>
                    <CategoryCard name={tournoi.name} image={tournoi.image} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Vue par catégorie
            <div>
              <h2 className="category-title">{selectedCategory}</h2>
              <div className="all-albums-grid">
                {filteredTournois.map((tournoi, index) => (
                  <div 
                    key={index} 
                    className="album-card-container"
                    onClick={() => handleTournoiClick(tournoi)}
                  >
                    <div className="album-usage-count">{tournoi.participants} participants</div>
                    <CategoryCard name={tournoi.name} image={tournoi.image} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="create-album-prompt">
        <p>Vous souhaitez créer votre propre Tournoi ?</p>
        <button 
          className="create-album-btn"
          onClick={handleCreateTournoi}
        >
          Créer un nouveau Tournoi
        </button>
      </div>
    </div>
  );
};

export default Tournois;