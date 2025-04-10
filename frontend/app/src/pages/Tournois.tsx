/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CategoryCard from "../components/CategoryCard";
import "../styles/AllAlbum.css";
import { getPublicTournaments } from "../services/tournament-api";
import { getAlbumInfoForContent } from "../services/album-api-extended";

interface TournoisProps {
  user: string | null;
}

type FormattedTournament = {
  id: string;
  name: string;
  image: string;
  creator: string;
  creatorId: string;
  categories: string[];
  createdAt: string;
};

const Tournois: React.FC<TournoisProps> = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour stocker les données formatées
  const [allTournaments, setAllTournaments] = useState<FormattedTournament[]>([]);
  const [tournamentCategories, setTournamentCategories] = useState<Map<string, FormattedTournament[]>>(new Map());
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  // Détecter si on arrive via un "Voir plus" spécifique à une catégorie
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get('category');
    if (category) {
      setSelectedCategory(category);
    }
  }, [location]);

  // Charger les données des tournois depuis l'API
  useEffect(() => {
    const loadTournaments = async () => {
      try {
        setIsLoading(true);
        
        // Récupérer les tournois publics
        const publicTournaments = await getPublicTournaments();
        
        // Formater les données et récupérer les infos d'album
        const formattedTournaments: FormattedTournament[] = [];
        const categoriesMap = new Map<string, FormattedTournament[]>();
        const allCategories = new Set<string>();
        
        for (const tournament of publicTournaments) {
          // Récupérer les catégories et l'image de l'album
          const albumInfo = await getAlbumInfoForContent(tournament.album.id);
          
          // Créer un objet tournament formaté
          const formattedTournament: FormattedTournament = {
            id: tournament.id.toString(),
            name: tournament.name,
            image: albumInfo.imagePath,
            creator: tournament.author.username,
            creatorId: tournament.author.id.toString(),
            categories: albumInfo.categories,
            createdAt: tournament.createdAt,
          };
          
          formattedTournaments.push(formattedTournament);
          
          // Ajouter aux catégories
          albumInfo.categories.forEach(category => {
            allCategories.add(category);
            
            if (!categoriesMap.has(category)) {
              categoriesMap.set(category, []);
            }
            categoriesMap.get(category)?.push(formattedTournament);
          });
        }
        
        // Trier les tournois par nom dans chaque catégorie
        categoriesMap.forEach((tournaments, category) => {
          categoriesMap.set(category, tournaments.sort((a, b) => a.name.localeCompare(b.name)));
        });
        
        // Mettre à jour les états
        setAllTournaments(formattedTournaments.sort((a, b) => a.name.localeCompare(b.name)));
        setTournamentCategories(categoriesMap);
        setAvailableCategories(Array.from(allCategories));
        
      } catch (err) {
        console.error("Erreur lors du chargement des tournois:", err);
        setError("Impossible de charger les tournois. Veuillez réessayer plus tard.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTournaments();
  }, []);

  // Filtrer les tournois en fonction de la recherche et de la catégorie
  const getFilteredTournaments = (): FormattedTournament[] => {
    const searchLower = searchQuery.toLowerCase();
    
    // Filtrer par texte de recherche
    let filtered = allTournaments.filter(tournament => 
      tournament.name.toLowerCase().includes(searchLower) || 
      tournament.creator.toLowerCase().includes(searchLower)
    );
    
    // Filtrer par catégorie si une est sélectionnée
    if (selectedCategory) {
      filtered = filtered.filter(tournament => 
        tournament.categories.includes(selectedCategory)
      );
    }
    
    return filtered;
  };

  // Récupérer les tournois filtrés
  const filteredTournaments = getFilteredTournaments();

  // Gérer le clic sur un tournoi
  const handleTournamentClick = (tournament: FormattedTournament) => {
    // Rediriger vers la page de détail du tournoi
    navigate(`/tournois/${tournament.id}`);
  };

  // Gérer la création d'un nouveau tournoi - rediriger vers les albums
  const handleCreateTournament = () => {
    // Rediriger vers la page des albums pour choisir un album
    navigate("/allalbum");
  };

  // Affichage pendant le chargement
  if (isLoading) {
    return (
      <div className="all-album-container">
        <h1 className="all-album-title">Tous les Tournois</h1>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement des tournois...</p>
        </div>
      </div>
    );
  }

  // Affichage en cas d'erreur
  if (error) {
    return (
      <div className="all-album-container">
        <h1 className="all-album-title">Tous les Tournois</h1>
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Réessayer</button>
        </div>
      </div>
    );
  }

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
            Tous les Tournois
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
      
      {filteredTournaments.length === 0 ? (
        <div className="no-results">
          <p>Aucun tournoi ne correspond à votre recherche</p>
        </div>
      ) : (
        <div className="all-albums-section">
          <div>
            <h2 className="category-title">{selectedCategory || "Tous les Tournois"}</h2>
            <div className="all-albums-grid">
              {filteredTournaments.map((tournament, index) => (
                <div 
                  key={index} 
                  className="album-card-container"
                  onClick={() => handleTournamentClick(tournament)}
                >
                  <CategoryCard 
                    name={tournament.name} 
                    image={tournament.image} 
                    categories={tournament.categories}
                    authorName={tournament.creator}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className="create-album-prompt">
        <p>Vous souhaitez créer votre propre Tournoi ?</p>
        <button 
          className="create-album-btn"
          onClick={handleCreateTournament}
        >
          Créer un nouveau Tournoi
        </button>
      </div>
    </div>
  );
};

export default Tournois;