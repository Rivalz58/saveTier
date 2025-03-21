import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CategoryCard from "../components/CategoryCard";
import "../styles/AllAlbum.css";

// Import de l'image depuis le dossier assets
import filmsImage from "../assets/films.jpg";

interface TierlistsProps {
  user: string | null;
}

type Tierlist = {
  id: string;
  name: string;
  image: string;
  creator: string;
  creatorId: string;
  categories: string[]; // Modifié pour supporter plusieurs catégories
  createdAt: string;
  isPublic: boolean;
  likes: number;
};

type TierlistCategory = {
  title: string;
  tierlists: Tierlist[];
};

// Données exemple des tierlists avec catégories multiples
const tierlistCategories: TierlistCategory[] = [
  {
    title: "Manga",
    tierlists: [
      { id: "tierlist-001", name: "Personnages One Piece", image: filmsImage, creator: "User1", creatorId: "user-001", categories: ["Manga", "Animation"], createdAt: "2024-02-15", isPublic: true, likes: 856 },
      { id: "tierlist-002", name: "Personnages Naruto", image: filmsImage, creator: "User2", creatorId: "user-002", categories: ["Manga"], createdAt: "2024-01-20", isPublic: true, likes: 742 },
      { id: "tierlist-003", name: "Meilleures arcs de Bleach", image: filmsImage, creator: "User3", creatorId: "user-003", categories: ["Manga", "Animation"], createdAt: "2024-02-05", isPublic: true, likes: 520 },
      { id: "tierlist-004", name: "Personnages My Hero Academia", image: filmsImage, creator: "User1", creatorId: "user-001", categories: ["Manga", "Animation"], createdAt: "2024-03-10", isPublic: true, likes: 423 },
      { id: "tierlist-005", name: "Arcs Dragon Ball Z", image: filmsImage, creator: "Admin", creatorId: "user-005", categories: ["Manga", "Animation"], createdAt: "2024-01-05", isPublic: true, likes: 398 },
    ],
  },
  {
    title: "Films",
    tierlists: [
      { id: "tierlist-006", name: "Films Marvel", image: filmsImage, creator: "User2", creatorId: "user-002", categories: ["Films", "Autres"], createdAt: "2024-02-10", isPublic: true, likes: 634 },
      { id: "tierlist-007", name: "Films Disney", image: filmsImage, creator: "User3", creatorId: "user-003", categories: ["Films", "Animation"], createdAt: "2024-01-15", isPublic: true, likes: 523 },
      { id: "tierlist-008", name: "Films DC", image: filmsImage, creator: "User1", creatorId: "user-001", categories: ["Films", "Autres"], createdAt: "2024-03-05", isPublic: true, likes: 321 },
      { id: "tierlist-009", name: "Films d'action", image: filmsImage, creator: "User4", creatorId: "user-004", categories: ["Films"], createdAt: "2024-02-25", isPublic: true, likes: 267 },
    ],
  },
  {
    title: "Jeux Vidéo",
    tierlists: [
      { id: "tierlist-010", name: "Jeux Zelda", image: filmsImage, creator: "User3", creatorId: "user-003", categories: ["Jeux Vidéo"], createdAt: "2024-01-25", isPublic: true, likes: 487 },
      { id: "tierlist-011", name: "Jeux Pokémon", image: filmsImage, creator: "User2", creatorId: "user-002", categories: ["Jeux Vidéo", "Animation"], createdAt: "2024-02-20", isPublic: true, likes: 432 },
      { id: "tierlist-012", name: "Jeux Final Fantasy", image: filmsImage, creator: "Admin", creatorId: "user-005", categories: ["Jeux Vidéo", "Manga"], createdAt: "2024-03-01", isPublic: true, likes: 376 },
    ],
  },
  {
    title: "Musique",
    tierlists: [
      { id: "tierlist-013", name: "Albums Rock", image: filmsImage, creator: "User1", creatorId: "user-001", categories: ["Musique"], createdAt: "2024-01-10", isPublic: true, likes: 345 },
      { id: "tierlist-014", name: "Albums Hip-Hop", image: filmsImage, creator: "User4", creatorId: "user-004", categories: ["Musique"], createdAt: "2024-02-08", isPublic: true, likes: 302 },
    ],
  },
];

// Fonction pour obtenir toutes les tierlists, triées par popularité
const getAllTierlistsSortedByPopularity = (): Tierlist[] => {
  const allTierlists: Tierlist[] = [];
  
  tierlistCategories.forEach(category => {
    allTierlists.push(...category.tierlists);
  });
  
  return allTierlists.sort((a, b) => b.likes - a.likes);
};

const Tierlists: React.FC<TierlistsProps> = () => {
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

  // Obtenir la liste de tous les tierlists, soit par catégorie, soit tous triés par popularité
  const getFilteredTierlists = () => {
    if (!selectedCategory) {
      // Si aucune catégorie n'est sélectionnée, montrer tous les tierlists par popularité
      const allTierlists = getAllTierlistsSortedByPopularity();
      return allTierlists.filter(tierlist => 
        tierlist.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else {
      // Sinon, filtrer par catégorie sélectionnée (un tierlist est affiché s'il contient la catégorie sélectionnée)
      const allTierlists = getAllTierlistsSortedByPopularity();
      return allTierlists
        .filter(tierlist => tierlist.categories.includes(selectedCategory))
        .filter(tierlist => tierlist.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
  };

  // Liste filtrée de tierlists
  const filteredTierlists = getFilteredTierlists();
  
  // Générer la liste de toutes les catégories disponibles
  const categoryTitles = tierlistCategories.map(category => category.title);

  // Gérer le clic sur une tierlist
  const handleTierlistClick = (tierlist: Tierlist) => {
    // Rediriger vers la page de détail de la tierlist
    navigate(`/tierlists/${tierlist.id}`);
  };

  // Gérer la création d'une nouvelle tierlist - rediriger vers les albums
  const handleCreateTierlist = () => {
    // Rediriger vers la page des albums pour choisir un album
    // Même les utilisateurs non connectés peuvent y accéder
    navigate("/allalbum");
  };

  return (
    <div className="all-album-container">
      <h1 className="all-album-title">Toutes les Tierlists</h1>
      
      <div className="album-filters">
        <div className="search-container">
          <input
            type="text"
            placeholder="Rechercher une tierlist..."
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
      
      {filteredTierlists.length === 0 ? (
        <div className="no-results">
          <p>Aucune tierlist ne correspond à votre recherche</p>
        </div>
      ) : (
        <div className="all-albums-section">
          {!selectedCategory ? (
            // Vue "Plus Populaires"
            <div>
              <h2 className="category-title">Tierlists les plus populaires</h2>
              <div className="all-albums-grid">
                {filteredTierlists.map((tierlist, index) => (
                  <div 
                    key={index} 
                    className="album-card-container"
                    onClick={() => handleTierlistClick(tierlist)}
                  >
                    <div className="album-usage-count">{tierlist.likes} likes</div>
                    <CategoryCard name={tierlist.name} image={tierlist.image} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Vue par catégorie
            <div>
              <h2 className="category-title">{selectedCategory}</h2>
              <div className="all-albums-grid">
                {filteredTierlists.map((tierlist, index) => (
                  <div 
                    key={index} 
                    className="album-card-container"
                    onClick={() => handleTierlistClick(tierlist)}
                  >
                    <div className="album-usage-count">{tierlist.likes} likes</div>
                    <CategoryCard name={tierlist.name} image={tierlist.image} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="create-album-prompt">
        <p>Vous souhaitez créer votre propre Tierlist ?</p>
        <button 
          className="create-album-btn"
          onClick={handleCreateTierlist}
        >
          Créer une nouvelle Tierlist
        </button>
      </div>
    </div>
  );
};

export default Tierlists;