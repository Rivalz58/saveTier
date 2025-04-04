/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CategoryCard from "../components/CategoryCard";
import "../styles/AllAlbum.css";
import { getPublicTierlists } from "../services/tierlist-api";
import { getAlbumInfoForContent } from "../services/album-api-extended";

interface TierlistsProps {
  user: string | null;
}

type FormattedTierlist = {
  id: string;
  name: string;
  image: string;
  creator: string;
  creatorId: string;
  categories: string[];
  createdAt: string;
  likes: number; // Simulation de popularité
};

type TierlistCategory = {
  title: string;
  tierlists: FormattedTierlist[];
};

const Tierlists: React.FC<TierlistsProps> = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour stocker les données formatées
  const [allTierlists, setAllTierlists] = useState<FormattedTierlist[]>([]);
  const [tierlistCategories, setTierlistCategories] = useState<Map<string, FormattedTierlist[]>>(new Map());
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  // Détecter si on arrive via un "Voir plus" spécifique à une catégorie
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get('category');
    if (category) {
      setSelectedCategory(category);
    }
  }, [location]);

  // Charger les données des tierlists depuis l'API
  useEffect(() => {
    const loadTierlists = async () => {
      try {
        setIsLoading(true);
        
        // Récupérer les tierlists publiques
        const publicTierlists = await getPublicTierlists();
        
        // Formater les données et récupérer les infos d'album
        const formattedTierlists: FormattedTierlist[] = [];
        const categoriesMap = new Map<string, FormattedTierlist[]>();
        const allCategories = new Set<string>();
        
        for (const tierlist of publicTierlists) {
          // Récupérer les catégories et l'image de l'album
          const albumInfo = await getAlbumInfoForContent(tierlist.album.id);
          
          // Créer un objet tierlist formaté
          const formattedTierlist: FormattedTierlist = {
            id: tierlist.id.toString(),
            name: tierlist.name,
            image: albumInfo.imagePath,
            creator: tierlist.author.username,
            creatorId: tierlist.author.id.toString(),
            categories: albumInfo.categories,
            createdAt: tierlist.createdAt,
            // Simuler un nombre de likes basé sur la date (plus récent = plus populaire pour le moment)
            likes: Math.floor(Math.random() * 1000) + 100,
          };
          
          formattedTierlists.push(formattedTierlist);
          
          // Ajouter aux catégories
          albumInfo.categories.forEach(category => {
            allCategories.add(category);
            
            if (!categoriesMap.has(category)) {
              categoriesMap.set(category, []);
            }
            categoriesMap.get(category)?.push(formattedTierlist);
          });
        }
        
        // Trier les tierlists par likes dans chaque catégorie
        categoriesMap.forEach((tierlists, category) => {
          categoriesMap.set(category, tierlists.sort((a, b) => b.likes - a.likes));
        });
        
        // Mettre à jour les états
        setAllTierlists(formattedTierlists.sort((a, b) => b.likes - a.likes));
        setTierlistCategories(categoriesMap);
        setAvailableCategories(Array.from(allCategories));
        
      } catch (err) {
        console.error("Erreur lors du chargement des tierlists:", err);
        setError("Impossible de charger les tierlists. Veuillez réessayer plus tard.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTierlists();
  }, []);

  // Filtrer les tierlists en fonction de la recherche et de la catégorie
  const getFilteredTierlists = (): FormattedTierlist[] => {
    const searchLower = searchQuery.toLowerCase();
    
    // Filtrer par texte de recherche
    let filtered = allTierlists.filter(tierlist => 
      tierlist.name.toLowerCase().includes(searchLower) || 
      tierlist.creator.toLowerCase().includes(searchLower)
    );
    
    // Filtrer par catégorie si une est sélectionnée
    if (selectedCategory) {
      filtered = filtered.filter(tierlist => 
        tierlist.categories.includes(selectedCategory)
      );
    }
    
    return filtered;
  };

  // Récupérer les tierlists filtrées
  const filteredTierlists = getFilteredTierlists();

  // Gérer le clic sur une tierlist
  const handleTierlistClick = (tierlist: FormattedTierlist) => {
    // Rediriger vers la page de détail de la tierlist
    navigate(`/tierlists/${tierlist.id}`);
  };

  // Gérer la création d'une nouvelle tierlist - rediriger vers les albums
  const handleCreateTierlist = () => {
    // Rediriger vers la page des albums pour choisir un album
    navigate("/allalbum");
  };

  // Affichage pendant le chargement
  if (isLoading) {
    return (
      <div className="all-album-container">
        <h1 className="all-album-title">Toutes les Tierlists</h1>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement des tierlists...</p>
        </div>
      </div>
    );
  }

  // Affichage en cas d'erreur
  if (error) {
    return (
      <div className="all-album-container">
        <h1 className="all-album-title">Toutes les Tierlists</h1>
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Réessayer</button>
        </div>
      </div>
    );
  }

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
      
      {filteredTierlists.length === 0 ? (
        <div className="no-results">
          <p>Aucune tierlist ne correspond à votre recherche</p>
        </div>
      ) : (
        <div className="all-albums-section">
          <div>
            <h2 className="category-title">{selectedCategory || "Tierlists les plus populaires"}</h2>
            <div className="all-albums-grid">
              {filteredTierlists.map((tierlist, index) => (
                <div 
                  key={index} 
                  className="album-card-container"
                  onClick={() => handleTierlistClick(tierlist)}
                >
                  <div className="album-usage-count">{tierlist.likes} likes</div>
                  <CategoryCard 
                    name={tierlist.name} 
                    image={tierlist.image} 
                    categories={tierlist.categories}
                    authorName={tierlist.creator}
                  />
                </div>
              ))}
            </div>
          </div>
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