import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CategoryCard from "../components/CategoryCard";
import "../styles/AllAlbum.css";

// Import de l'image depuis le dossier assets
import filmsImage from "../assets/films.jpg";

interface ClassementsProps {
  user: string | null;
}

type Classement = {
  id: string;
  name: string;
  image: string;
  creator: string;
  creatorId: string;
  category: string;
  createdAt: string;
  isPublic: boolean;
  votes: number;
};

type ClassementCategory = {
  title: string;
  classements: Classement[];
};

// Données exemple des classements
const classementCategories: ClassementCategory[] = [
  {
    title: "Manga",
    classements: [
      { id: "classement-001", name: "Meilleurs personnages One Piece", image: filmsImage, creator: "User1", creatorId: "user-001", category: "Manga", createdAt: "2024-02-15", isPublic: true, votes: 2156 },
      { id: "classement-002", name: "Meilleurs personnages Naruto", image: filmsImage, creator: "User2", creatorId: "user-002", category: "Manga", createdAt: "2024-01-20", isPublic: true, votes: 1842 },
      { id: "classement-003", name: "Meilleurs arcs de Bleach", image: filmsImage, creator: "User3", creatorId: "user-003", category: "Manga", createdAt: "2024-02-05", isPublic: true, votes: 1320 },
      { id: "classement-004", name: "Top 10 scènes My Hero Academia", image: filmsImage, creator: "User1", creatorId: "user-001", category: "Manga", createdAt: "2024-03-10", isPublic: true, votes: 923 },
    ],
  },
  {
    title: "Films",
    classements: [
      { id: "classement-005", name: "Meilleurs films Marvel", image: filmsImage, creator: "User2", creatorId: "user-002", category: "Films", createdAt: "2024-02-10", isPublic: true, votes: 1734 },
      { id: "classement-006", name: "Top 10 films Disney", image: filmsImage, creator: "User3", creatorId: "user-003", category: "Films", createdAt: "2024-01-15", isPublic: true, votes: 1523 },
      { id: "classement-007", name: "Classement des films DC", image: filmsImage, creator: "User1", creatorId: "user-001", category: "Films", createdAt: "2024-03-05", isPublic: true, votes: 921 },
    ],
  },
  {
    title: "Jeux Vidéo",
    classements: [
      { id: "classement-008", name: "Top jeux Zelda", image: filmsImage, creator: "User3", creatorId: "user-003", category: "Jeux Vidéo", createdAt: "2024-01-25", isPublic: true, votes: 1287 },
      { id: "classement-009", name: "Meilleures générations Pokémon", image: filmsImage, creator: "User2", creatorId: "user-002", category: "Jeux Vidéo", createdAt: "2024-02-20", isPublic: true, votes: 1132 },
      { id: "classement-010", name: "Classement Final Fantasy", image: filmsImage, creator: "Admin", creatorId: "user-005", category: "Jeux Vidéo", createdAt: "2024-03-01", isPublic: true, votes: 976 },
    ],
  },
  {
    title: "Musique",
    classements: [
      { id: "classement-011", name: "Meilleurs albums Rock", image: filmsImage, creator: "User1", creatorId: "user-001", category: "Musique", createdAt: "2024-01-10", isPublic: true, votes: 845 },
      { id: "classement-012", name: "Top albums Hip-Hop", image: filmsImage, creator: "User4", creatorId: "user-004", category: "Musique", createdAt: "2024-02-08", isPublic: true, votes: 702 },
      { id: "classement-013", name: "Meilleures chansons K-Pop", image: filmsImage, creator: "User2", creatorId: "user-002", category: "Musique", createdAt: "2024-03-12", isPublic: true, votes: 645 },
    ],
  },
];

// Fonction pour obtenir tous les classements, triés par popularité
const getAllClassementsSortedByPopularity = (): Classement[] => {
  const allClassements: Classement[] = [];
  
  classementCategories.forEach(category => {
    allClassements.push(...category.classements);
  });
  
  return allClassements.sort((a, b) => b.votes - a.votes);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Classements: React.FC<ClassementsProps> = () => {
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

  // Obtenir la liste de tous les classements, soit par catégorie, soit tous triés par popularité
  const getFilteredClassements = () => {
    if (!selectedCategory) {
      // Si aucune catégorie n'est sélectionnée, montrer tous les classements par popularité
      const allClassements = getAllClassementsSortedByPopularity();
      return allClassements.filter(classement => 
        classement.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else {
      // Sinon, filtrer par catégorie sélectionnée
      const categoryData = classementCategories.find(cat => cat.title === selectedCategory);
      if (!categoryData) return [];
      
      return categoryData.classements
        .filter(classement => classement.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => b.votes - a.votes); // Toujours trier par popularité
    }
  };

  // Liste filtrée de classements
  const filteredClassements = getFilteredClassements();
  
  // Générer la liste de toutes les catégories disponibles
  const categoryTitles = classementCategories.map(category => category.title);

  // Gérer le clic sur un classement
  const handleClassementClick = (classement: Classement) => {
    // Rediriger vers la page de détail du classement
    navigate(`/classements/${classement.id}`);
  };

  // Gérer la création d'un nouveau classement - rediriger vers les albums
  const handleCreateClassement = () => {
    // Rediriger vers la page des albums pour choisir un album
    // Même les utilisateurs non connectés peuvent y accéder
    navigate("/allalbum");
  };

  return (
    <div className="all-album-container">
      <h1 className="all-album-title">Tous les Classements</h1>
      
      <div className="album-filters">
        <div className="search-container">
          <input
            type="text"
            placeholder="Rechercher un classement..."
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
      
      {filteredClassements.length === 0 ? (
        <div className="no-results">
          <p>Aucun classement ne correspond à votre recherche</p>
        </div>
      ) : (
        <div className="all-albums-section">
          {!selectedCategory ? (
            // Vue "Plus Populaires"
            <div>
              <h2 className="category-title">Classements les plus populaires</h2>
              <div className="all-albums-grid">
                {filteredClassements.map((classement, index) => (
                  <div 
                    key={index} 
                    className="album-card-container"
                    onClick={() => handleClassementClick(classement)}
                  >
                    <div className="album-usage-count">{classement.votes} votes</div>
                    <CategoryCard name={classement.name} image={classement.image} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Vue par catégorie
            <div>
              <h2 className="category-title">{selectedCategory}</h2>
              <div className="all-albums-grid">
                {filteredClassements.map((classement, index) => (
                  <div 
                    key={index} 
                    className="album-card-container"
                    onClick={() => handleClassementClick(classement)}
                  >
                    <div className="album-usage-count">{classement.votes} votes</div>
                    <CategoryCard name={classement.name} image={classement.image} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="create-album-prompt">
        <p>Vous souhaitez créer votre propre Classement ?</p>
        <button 
          className="create-album-btn"
          onClick={handleCreateClassement}
        >
          Créer un nouveau Classement
        </button>
      </div>
    </div>
  );
};

export default Classements;