import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/RankingViewer.css';

// Type pour les images du classement
type RankingImage = {
  id: string;
  src: string;
  name: string;
  place?: number;
  score?: number;
};

interface RankingViewerProps {
  user: string | null;
}

const RankingViewer: React.FC<RankingViewerProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // États
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [rankingName, setRankingName] = useState<string>("Classement");
  const [rankingDescription, setRankingDescription] = useState<string>("");
  const [authorName, setAuthorName] = useState<string>("");
  const [rankedImages, setRankedImages] = useState<RankingImage[]>([]);
  const [isAuthor, setIsAuthor] = useState<boolean>(false);
  
  // Charger les données du classement
  useEffect(() => {
    const loadRanking = async () => {
      try {
        setLoading(true);
        
        // Ici, vous implémenteriez l'appel à l'API pour récupérer les données du classement
        // Exemple: const data = await rankingService.getRankingById(id);
        
        // Pour le moment, nous utilisons des données fictives pour la démo
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simuler un délai de chargement
        
        // Données fictives
        setRankingName("Top Lieux de Vacances");
        setRankingDescription("Un classement des plus beaux endroits pour passer ses vacances.");
        setAuthorName("John Doe");
        
        // Déterminer si l'utilisateur actuel est l'auteur du classement
        setIsAuthor(user === "John Doe");
        
        // Images fictives pour la démo
        const mockImages: RankingImage[] = Array.from({ length: 10 }, (_, i) => ({
          id: (i + 1).toString(),
          src: `/api/placeholder/400/300`,
          name: `Place #${i + 1}`,
          place: i + 1,
          score: 10 - i
        }));
        
        setRankedImages(mockImages);
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement du classement:", err);
        setError("Impossible de charger ce classement. Il est peut-être privé ou a été supprimé.");
        setLoading(false);
      }
    };
    
    loadRanking();
  }, [id, user]);
  
  // Gestion des actions
  const handleEdit = () => {
    navigate(`/classements/edit/${id}`);
  };
  
  const handleBack = () => {
    navigate('/classements');
  };
  
  // Affichage pendant le chargement
  if (loading) {
    return (
      <div className="ranking-viewer">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement du classement...</p>
        </div>
      </div>
    );
  }
  
  // Affichage en cas d'erreur
  if (error) {
    return (
      <div className="ranking-viewer">
        <div className="error-message">
          <h2>Erreur</h2>
          <p>{error}</p>
          <button onClick={handleBack}>Retour aux classements</button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="ranking-viewer">
      <div className="ranking-header">
        <div className="ranking-title-section">
          <h1>{rankingName}</h1>
          <p className="ranking-description">{rankingDescription}</p>
          <p className="ranking-author">Créé par: {authorName}</p>
        </div>
        
        <div className="ranking-actions">
          <button onClick={handleBack} className="back-button">
            Retour aux classements
          </button>
          {isAuthor && (
            <button onClick={handleEdit} className="edit-button">
              Modifier
            </button>
          )}
        </div>
      </div>
      
      <div className="ranked-items-container">
        <h2>Classement final</h2>
        
        {rankedImages.length === 0 ? (
          <div className="no-items">
            <p>Ce classement ne contient aucun élément.</p>
          </div>
        ) : (
          <div className="ranked-items">
            {rankedImages.map((image) => (
              <div key={image.id} className="ranked-item">
                <div className="rank-badge">{image.place}</div>
                <div className="ranked-item-content">
                  <img src={image.src} alt={image.name} />
                  <div className="ranked-item-info">
                    <h3>{image.name}</h3>
                    {image.score !== undefined && (
                      <p className="score">Score: {image.score}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RankingViewer;