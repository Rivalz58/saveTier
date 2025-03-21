import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CategoryCard from "../components/CategoryCard";
import "../styles/AllAlbum.css";
import { getPublicRankings } from "../services/ranking-api";
import { getAlbumInfoForContent } from "../services/album-api-extended";

interface ClassementsProps {
  user: string | null;
}

type FormattedRanking = {
  id: string;
  name: string;
  image: string;
  creator: string;
  creatorId: string;
  categories: string[];
  createdAt: string;
  votes: number; // Simuler les votes
};

const Classements: React.FC<ClassementsProps> = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour stocker les données formatées
  const [allRankings, setAllRankings] = useState<FormattedRanking[]>([]);
  const [rankingCategories, setRankingCategories] = useState<Map<string, FormattedRanking[]>>(new Map());
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  // Détecter si on arrive via un "Voir plus" spécifique à une catégorie
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get('category');
    if (category) {
      setSelectedCategory(category);
    }
  }, [location]);

  // Charger les données des classements depuis l'API
  useEffect(() => {
    const loadRankings = async () => {
      try {
        setIsLoading(true);
        
        // Récupérer les classements publics
        const publicRankings = await getPublicRankings();
        
        // Formater les données et récupérer les infos d'album
        const formattedRankings: FormattedRanking[] = [];
        const categoriesMap = new Map<string, FormattedRanking[]>();
        const allCategories = new Set<string>();
        
        for (const ranking of publicRankings) {
          // Récupérer les catégories et l'image de l'album
          const albumInfo = await getAlbumInfoForContent(ranking.album.id);
          
          // Créer un objet ranking formaté
          const formattedRanking: FormattedRanking = {
            id: ranking.id.toString(),
            name: ranking.name,
            image: albumInfo.imagePath,
            creator: ranking.author.username,
            creatorId: ranking.author.id.toString(),
            categories: albumInfo.categories,
            createdAt: ranking.createdAt,
            // Simuler un nombre de votes
            votes: Math.floor(Math.random() * 1000) + 100,
          };
          
          formattedRankings.push(formattedRanking);
          
          // Ajouter aux catégories
          albumInfo.categories.forEach(category => {
            allCategories.add(category);
            
            if (!categoriesMap.has(category)) {
              categoriesMap.set(category, []);
            }
            categoriesMap.get(category)?.push(formattedRanking);
          });
        }
        
        // Trier les classements par votes dans chaque catégorie
        categoriesMap.forEach((rankings, category) => {
          categoriesMap.set(category, rankings.sort((a, b) => b.votes - a.votes));
        });
        
        // Mettre à jour les états
        setAllRankings(formattedRankings.sort((a, b) => b.votes - a.votes));
        setRankingCategories(categoriesMap);
        setAvailableCategories(Array.from(allCategories));
        
      } catch (err) {
        console.error("Erreur lors du chargement des classements:", err);
        setError("Impossible de charger les classements. Veuillez réessayer plus tard.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadRankings();
  }, []);

  // Filtrer les classements en fonction de la recherche et de la catégorie
  const getFilteredRankings = (): FormattedRanking[] => {
    const searchLower = searchQuery.toLowerCase();
    
    // Filtrer par texte de recherche
    let filtered = allRankings.filter(ranking => 
      ranking.name.toLowerCase().includes(searchLower) || 
      ranking.creator.toLowerCase().includes(searchLower)
    );
    
    // Filtrer par catégorie si une est sélectionnée
    if (selectedCategory) {
      filtered = filtered.filter(ranking => 
        ranking.categories.includes(selectedCategory)
      );
    }
    
    return filtered;
  };

  // Récupérer les classements filtrés
  const filteredRankings = getFilteredRankings();

  // Gérer le clic sur un classement
  const handleRankingClick = (ranking: FormattedRanking) => {
    // Rediriger vers la page de détail du classement
    navigate(`/classements/${ranking.id}`);
  };

  // Gérer la création d'un nouveau classement - rediriger vers les albums
  const handleCreateRanking = () => {
    // Rediriger vers la page des albums pour choisir un album
    navigate("/allalbum");
  };

  // Affichage pendant le chargement
  if (isLoading) {
    return (
      <div className="all-album-container">
        <h1 className="all-album-title">Tous les Classements</h1>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement des classements...</p>
        </div>
      </div>
    );
  }

  // Affichage en cas d'erreur
  if (error) {
    return (
      <div className="all-album-container">
        <h1 className="all-album-title">Tous les Classements</h1>
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Réessayer</button>
        </div>
      </div>
    );
  }

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
          
          {availableCategories.map((title, index) => (
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
      
      {filteredRankings.length === 0 ? (
        <div className="no-results">
          <p>Aucun classement ne correspond à votre recherche</p>
        </div>
      ) : (
        <div className="all-albums-section">
          <div>
            <h2 className="category-title">{selectedCategory || "Classements les plus populaires"}</h2>
            <div className="all-albums-grid">
              {filteredRankings.map((ranking, index) => (
                <div 
                  key={index} 
                  className="album-card-container"
                  onClick={() => handleRankingClick(ranking)}
                >
                  <div className="album-usage-count">{ranking.votes} votes</div>
                  <CategoryCard 
                    name={ranking.name} 
                    image={ranking.image}
                    categories={ranking.categories}
                    authorName={ranking.creator}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className="create-album-prompt">
        <p>Vous souhaitez créer votre propre Classement ?</p>
        <button 
          className="create-album-btn"
          onClick={handleCreateRanking}
        >
          Créer un nouveau Classement
        </button>
      </div>
    </div>
  );
};

export default Classements;