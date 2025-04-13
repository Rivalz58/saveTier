// RankingEditor.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import Modal from 'react-modal';
import '../styles/RankingEditor.css';
import albumAccessService from '../services/albumAccessService.ts';

// Assurez-vous que Modal est configuré pour l'accessibilité
Modal.setAppElement('#root');

interface RankingEditorProps {
  user: string | null;
}

// Type pour représenter une image
type RankingImage = {
  id: string;
  src: string;
  name: string;
  score: number;
  viewed: number;
  description?: string | null;
  url?: string | null;
};

// Type pour les données de classement
interface RankingData {
  id?: string;
  name: string;
  description: string | null;
  private: boolean;
  id_album: number;
  images: RankingImage[];
}

const RankingEditor: React.FC<RankingEditorProps> = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: rankingId } = useParams<{ id?: string }>();
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  
  // États pour les données du classement
  const [rankingName, setRankingName] = useState<string>("");
  const [rankingDescription, setRankingDescription] = useState<string>("");
  const [albumId, setAlbumId] = useState<string>("");
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [allImages, setAllImages] = useState<RankingImage[]>([]);
  const [currentImages, setCurrentImages] = useState<RankingImage[]>([]);
  const [selectedImages, setSelectedImages] = useState<RankingImage[]>([]);
  const [rankedImages, setRankedImages] = useState<RankingImage[]>([]);
  const [remainingImages, setRemainingImages] = useState<RankingImage[]>([]);
  
  // États pour la mécanique du classement
  const [round, setRound] = useState<number>(1);
  const [maxSelectable, setMaxSelectable] = useState<number>(3);
  const [displayCount, setDisplayCount] = useState<number>(6);
  
  // États UI
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(() => {
    const hasSeenInfoModal = localStorage.getItem('rankingInfoModalShown');
    return !hasSeenInfoModal;
  });
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasSaved, setHasSaved] = useState(false);
  
  // Récupérer les paramètres de l'URL et charger les données
  useEffect(() => {
    const loadRankingData = async () => {
      try {
        setLoading(true);
        
        // Si nous avons un ID, nous sommes en mode édition
        if (rankingId) {
          setIsEditMode(true);
          // Ici vous implémenterez la logique pour charger un classement existant
          // Similaire à ce que vous avez fait pour les tierlists/tournois
          
          // Exemple de code à adapter:
          /*
          const { ranking, images } = await rankingService.getRankingWithDetails(parseInt(rankingId));
          setRankingName(ranking.name);
          setRankingDescription(ranking.description || "");
          setIsPublic(!ranking.private);
          setAlbumId(ranking.id_album.toString());
          setAllImages(images);
          */
          
          // Pour le moment, nous utilisons des données factices pour la démonstration
          setRankingName("Classement chargé");
          setRankingDescription("Description du classement chargé");
          setIsPublic(true);
          setAlbumId("1");
          
          // Initialiser avec quelques images factices
          initializeWithMockImages();
        } else {
          // Mode création - récupérer les informations depuis l'URL
          const params = new URLSearchParams(location.search);
          const albumIdParam = params.get('album');
          const imagesParam = params.get('images');
          const name = params.get('name');
          
          if (!albumIdParam || !imagesParam) {
            setError("Paramètres URL manquants");
            setTimeout(() => navigate("/allalbum"), 2000);
            return;
          }
          
          setAlbumId(albumIdParam);
          
          if (name) {
            setRankingName(name);
          }
          
          // Charger les images de l'album
          const imageIds = JSON.parse(imagesParam);
          
          try {
            // Vérifier l'accès à l'album
            const accessCheck = await albumAccessService.checkAlbumAccess(albumIdParam);
            
            if (!accessCheck.hasAccess) {
              setError(`Accès refusé à cet album. ${accessCheck.message}`);
              setTimeout(() => navigate("/allalbum"), 3000);
              return;
            }
            
            const album = accessCheck.album;
            if (!album) {
              setError("Album introuvable");
              setTimeout(() => navigate("/allalbum"), 2000);
              return;
            }
            
            // Filtrer les images sélectionnées
            const selectedAlbumImages = album.image
              .filter(img => imageIds.includes(img.id.toString()))
              .map(img => ({
                id: img.id.toString(),
                src: img.path_image,
                name: img.name,
                score: 0,
                viewed: 0,
                description: img.description,
                url: img.url
              }));
            
            if (selectedAlbumImages.length === 0) {
              setError("Aucune image sélectionnée pour ce classement");
              setTimeout(() => navigate("/allalbum"), 2000);
              return;
            }
            
            // Initialiser le jeu avec les images récupérées
            initializeGame(selectedAlbumImages);
          } catch (error) {
            console.error("Erreur lors du chargement des images:", error);
            setError("Erreur lors du chargement des images");
            
            // Utiliser des images factices pour la démonstration
            initializeWithMockImages();
          }
        }
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError("Une erreur est survenue lors du chargement");
      } finally {
        setLoading(false);
      }
    };
    
    loadRankingData();
  }, [rankingId, navigate, location]);
  
  // Initialiser avec des images factices pour la démonstration
  const initializeWithMockImages = () => {
    const mockImages: RankingImage[] = Array.from({ length: 20 }, (_, i) => ({
      id: (i + 1).toString(),
      src: `/api/placeholder/200/200`,
      name: `Image ${i + 1}`,
      score: 0,
      viewed: 0
    }));
    
    initializeGame(mockImages);
  };
  
  // Fonction pour mélanger un tableau
  const shuffleArray = (array: RankingImage[]): RankingImage[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  
  // Déterminer le nombre d'images à afficher et à sélectionner en fonction du nombre total d'images
  const determineDisplayAndSelectionCounts = (totalCount: number) => {
    let display: number;
    let selectable: number;
    
    if (totalCount <= 20) {
      display = 2;
      selectable = 1;
    } else if (totalCount <= 150) {
      display = 6;
      selectable = display - 1;
    } else if (totalCount <= 300) {
      display = 12;
      selectable = display - 1;
    } else {
      display = 20;
      selectable = display - 1;
    }
    
    setDisplayCount(display);
    setMaxSelectable(selectable);
    
    return { display, selectable };
  };
  
  // Initialiser le jeu avec les images fournies
  const initializeGame = (images: RankingImage[]) => {
    const shuffledImages = shuffleArray([...images]
      .map(img => ({ ...img, score: 0, viewed: 0 })));
    
    setAllImages(shuffledImages);
    
    // Déterminer le nombre d'images à afficher et à sélectionner
    const { display } = determineDisplayAndSelectionCounts(shuffledImages.length);
    
    // Sélectionner les premières images à afficher
    const firstBatch = shuffledImages.slice(0, display).map(img => ({
      ...img,
      viewed: 1
    }));
    
    // Mettre à jour allImages avec viewed = 1 pour le premier lot
    const updatedAllImages = [...shuffledImages];
    firstBatch.forEach(img => {
      const index = updatedAllImages.findIndex(i => i.id === img.id);
      if (index !== -1) {
        updatedAllImages[index] = { ...updatedAllImages[index], viewed: 1 };
      }
    });
    
    setAllImages(updatedAllImages);
    setRemainingImages(shuffledImages.slice(display));
    setRound(1);
    setCurrentImages(firstBatch);
    setSelectedImages([]);
    setRankedImages([]);
  };
  
  // Redémarrer le jeu
  const restartGame = () => {
    initializeGame(allImages);
  };
  
  // Sélectionner une image
  const selectImage = (image: RankingImage) => {
    const isAlreadySelected = selectedImages.some(img => img.id === image.id);
    
    if (isAlreadySelected) {
      // Désélectionner l'image
      setSelectedImages(prev => prev.filter(img => img.id !== image.id));
    } else if (selectedImages.length < maxSelectable) {
      // Sélectionner jusqu'à maxSelectable images
      setSelectedImages(prev => [...prev, image]);
    }
  };
  
  // Valider la sélection et passer au lot suivant
  const validateSelection = () => {
    if (selectedImages.length === 0) return;
    
    // Mettre à jour les scores des images sélectionnées
    let newlyRankedImages: RankingImage[] = [];
    
    const updatedAllImages = allImages.map(img => {
      // Si l'image est parmi les sélectionnées
      if (selectedImages.some(selected => selected.id === img.id)) {
        const newScore = img.score + 1;
        
        // Si l'image atteint un score de 5, elle est classée
        if (newScore >= 5) {
          newlyRankedImages.push({...img, score: newScore});
        }
        
        return { ...img, score: newScore };
      }
      return img;
    });
    
    // Si des images ont atteint un score de 5, les ajouter aux images classées
    if (newlyRankedImages.length > 0) {
      setRankedImages(prev => [...prev, ...newlyRankedImages]);
    }
    
    // Mise à jour des images actuelles pour refléter leur score incrémenté
    const updatedCurrentImages = currentImages.map(img => ({
      ...img,
      score: updatedAllImages.find(updated => updated.id === img.id)?.score || img.score
    }));
    
    // On garde les images qui n'ont pas encore été classées (score < 5)
    const unrankedImages = updatedAllImages.filter(img => img.score < 5);
    
    // Update the allImages state with the new scores
    setAllImages(updatedAllImages);
    
    // Préparer le prochain lot d'images
    prepareNextBatch(updatedCurrentImages, remainingImages, unrankedImages);
    
    // Reset selected images
    setSelectedImages([]);
  };
  
  // Préparer le prochain lot d'images à afficher
  const prepareNextBatch = (
    current: RankingImage[],
    remaining: RankingImage[], 
    unrankedImages: RankingImage[]
  ) => {
    if (remaining.length > 0) {
      // Il reste des images à afficher dans ce tour
      const nextBatch = remaining.slice(0, Math.min(displayCount, remaining.length))
        .map(img => ({
          ...img,
          viewed: img.viewed + 1
        }));
      
      // Mettre à jour allImages avec les compteurs viewed incrémentés
      const updatedAllImages = [...unrankedImages];
      nextBatch.forEach(img => {
        const index = updatedAllImages.findIndex(i => i.id === img.id);
        if (index !== -1) {
          updatedAllImages[index] = { ...updatedAllImages[index], viewed: img.viewed };
        }
      });
      
      setAllImages(updatedAllImages);
      setCurrentImages(nextBatch);
      setRemainingImages(remaining.slice(Math.min(displayCount, remaining.length)));
    } else {
      // Tous les images de ce tour ont été montrées
      // Vérifier si toutes les images ont été vues au moins deux fois
      const allViewedTwice = unrankedImages.every(img => img.viewed >= 2);
      
      if (allViewedTwice) {
        // Après deux tours complets, filtrer par score
        // Garder seulement les images avec score > 0
        const qualifiedImages = unrankedImages.filter(img => img.score > 0);
        
        if (qualifiedImages.length > 0) {
          // Shuffle qualified images before sorting by views
          const shuffledQualified = shuffleArray([...qualifiedImages]);
          
          // Trier les images qualifiées par nombre de vues (montrer d'abord les moins vues)
          const sortedQualified = [...shuffledQualified].sort((a, b) => a.viewed - b.viewed);
          
          const nextBatch = sortedQualified.slice(0, Math.min(displayCount, sortedQualified.length))
            .map(img => ({
              ...img,
              viewed: img.viewed + 1
            }));
          
          // Mettre à jour allImages avec les compteurs viewed incrémentés
          const updatedAllImages = [...unrankedImages];
          nextBatch.forEach(img => {
            const index = updatedAllImages.findIndex(i => i.id === img.id);
            if (index !== -1) {
              updatedAllImages[index] = { ...updatedAllImages[index], viewed: img.viewed };
            }
          });
          
          setAllImages(updatedAllImages);
          setCurrentImages(nextBatch);
          setRemainingImages(sortedQualified.slice(Math.min(displayCount, sortedQualified.length)));
        } else {
          // Si toutes les images sont soit classées (score >= 5) ou éliminées (score == 0)
          // Redémarrer avec les images à score 0
          const imagesWithZeroScore = unrankedImages.filter(img => img.score === 0);
          
          if (imagesWithZeroScore.length > 0) {
            // Shuffle images with zero score for variety
            const shuffledZeroScoreImages = shuffleArray([...imagesWithZeroScore]);
            
            // Réinitialiser le compteur viewed pour ces images
            const resetImages = shuffledZeroScoreImages.map(img => ({
              ...img,
              viewed: 0
            }));
            
            // Mettre à jour allImages avec les compteurs viewed réinitialisés
            const updatedAllImages = [...unrankedImages];
            resetImages.forEach(img => {
              const index = updatedAllImages.findIndex(i => i.id === img.id);
              if (index !== -1) {
                updatedAllImages[index] = { ...updatedAllImages[index], viewed: 0 };
              }
            });
            
            // Préparer le prochain lot
            const nextBatch = resetImages.slice(0, Math.min(displayCount, resetImages.length))
              .map(img => ({
                ...img,
                viewed: 1
              }));
            
            // Mettre à jour allImages pour le premier lot
            nextBatch.forEach(img => {
              const index = updatedAllImages.findIndex(i => i.id === img.id);
              if (index !== -1) {
                updatedAllImages[index] = { ...updatedAllImages[index], viewed: 1 };
              }
            });
            
            setAllImages(updatedAllImages);
            setCurrentImages(nextBatch);
            setRemainingImages(resetImages.slice(Math.min(displayCount, resetImages.length)));
            setRound(1); // Réinitialiser le compteur de tours
          } else {
            // Le jeu est terminé - toutes les images ont été classées ou éliminées
            setCurrentImages([]);
          }
        }
      } else {
        // Pas encore deux tours complets, commencer le tour suivant
        setRound(prev => prev + 1);
        
        // Shuffle the unranked images before sorting by view count
        const shuffledUnranked = shuffleArray([...unrankedImages]);
        
        // Trier les images non classées par nombre de vues
        const sortedUnranked = [...shuffledUnranked].sort((a, b) => a.viewed - b.viewed);
        
        const nextBatch = sortedUnranked.slice(0, Math.min(displayCount, sortedUnranked.length))
          .map(img => ({
            ...img,
            viewed: img.viewed + 1
          }));
        
        // Mettre à jour allImages avec les compteurs viewed incrémentés
        const updatedAllImages = [...unrankedImages];
        nextBatch.forEach(img => {
          const index = updatedAllImages.findIndex(i => i.id === img.id);
          if (index !== -1) {
            updatedAllImages[index] = { ...updatedAllImages[index], viewed: img.viewed };
          }
        });
        
        setAllImages(updatedAllImages);
        setCurrentImages(nextBatch);
        setRemainingImages(sortedUnranked.slice(Math.min(displayCount, sortedUnranked.length)));
      }
    }
  };
  
  // Fonction pour sauvegarder le classement
  const handleSaveRanking = async () => {
    if (!rankingName.trim()) {
      alert("Veuillez donner un nom à votre classement.");
      return;
    }
    
    if (hasSaved) {
      alert("Le classement a déjà été sauvegardé. Veuillez redémarrer pour sauvegarder à nouveau.");
      return;
    }
    
    // Si l'utilisateur n'est pas connecté, alerter
    if (!user) {
      alert("Vous devez être connecté pour sauvegarder un classement.");
      return;
    }
    
    setIsSaving(true);
    try {
      // Préparer les données du classement
      const rankingData: RankingData = {
        name: rankingName.trim(),
        description: rankingDescription || "",
        private: !isPublic,
        id_album: Number(albumId),
        images: [...rankedImages].sort((a, b) => b.score - a.score) // Trier par score décroissant
      };
      
      console.log("Données de classement à sauvegarder:", rankingData);
      
      // TODO: Implémenter le service de sauvegarde de classement
      // const rankingId = await rankingService.saveRanking(rankingData);
      
      // Simuler un délai pour la démonstration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Classement sauvegardé avec succès. (Simulation)");
      setHasSaved(true);
      
      alert("Classement sauvegardé avec succès!");
      
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du classement:", error);
      alert("Erreur lors de la sauvegarde. Veuillez réessayer.");
    } finally {
      setIsSaving(false);
    }
  };
  
  // Gérer l'annulation
  const handleCancel = () => {
    if (window.confirm("Êtes-vous sûr de vouloir annuler ? Vos modifications seront perdues.")) {
      navigate("/allalbum");
    }
  };
  
  // Fermer le modal d'information
  const closeInfoModal = () => {
    setShowInfoModal(false);
    localStorage.setItem('rankingInfoModalShown', 'true');
  };
  
  // Basculer l'affichage de la barre latérale
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };
  
  // Afficher un indicateur de chargement
  if (loading) {
    return (
      <div className="ranking-editor">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement du classement...</p>
        </div>
      </div>
    );
  }
  
  // Afficher un message d'erreur si nécessaire
  if (error) {
    return (
      <div className="ranking-editor">
        <div className="error-message">
          <h2>Erreur</h2>
          <p>{error}</p>
          <button onClick={() => navigate("/allalbum")}>Retour aux albums</button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="ranking-editor">
      {/* Modal d'information sur l'utilisation */}
      {showInfoModal && (
        <div className="info-modal-overlay">
          <div className="info-modal-content">
            <h2>Comment utiliser l'éditeur de classement</h2>
            <div className="info-content">
              <p>Bienvenue dans l'éditeur de classement de TierHub!</p>
              <ul>
                <li><strong>Sélection d'images:</strong> Choisissez vos images préférées à chaque tour</li>
                <li><strong>Progression:</strong> Les images gagnent des points à chaque sélection</li>
                <li><strong>Classement final:</strong> Les images qui atteignent 5 points ou plus sont classées</li>
                <li><strong>Personnalisation:</strong> Cliquez sur le bouton d'édition pour modifier les détails du classement</li>
              </ul>
              <p>N'oubliez pas de remplir les informations et de sauvegarder votre classement à la fin!</p>
            </div>
            <button className="info-close-btn" onClick={closeInfoModal}>Commencer</button>
          </div>
        </div>
      )}
      
      {/* En-tête compact avec les informations essentielles */}
      <div className="ranking-compact-header">
        <div className="ranking-title">
          <h1>{rankingName || (isEditMode ? "Modifier le classement" : "Nouveau classement")}</h1>
          <button 
            className="edit-info-button" 
            onClick={toggleSidebar}
            title="Modifier les informations"
          >
            ✎
          </button>
        </div>
        
        <div className="ranking-actions">
          <button 
            className="restart-button" 
            onClick={restartGame}
          >
            Redémarrer
          </button>
          {rankedImages.length > 0 && (
            <button 
              className="save-button" 
              onClick={handleSaveRanking} 
              disabled={isSaving || !rankingName.trim() || hasSaved}
            >
              {isSaving ? "Sauvegarde en cours..." : hasSaved ? "Classement sauvegardé" : "Sauvegarder"}
            </button>
          )}
          <button className="cancel-button" onClick={handleCancel} disabled={isSaving}>
            Annuler
          </button>
        </div>
      </div>
      
      {/* Barre latérale pour les informations détaillées (cachée par défaut) */}
      <div className={`ranking-sidebar ${showSidebar ? 'active' : ''}`}>
        <div className="sidebar-header">
          <h2>Informations du classement</h2>
          <button className="close-sidebar" onClick={toggleSidebar}>×</button>
        </div>
        <div className="sidebar-content">
          <div className="form-group">
            <label htmlFor="ranking-name">Nom du classement</label>
            <input
              type="text"
              id="ranking-name"
              value={rankingName}
              onChange={(e) => setRankingName(e.target.value)}
              placeholder="Donnez un nom à votre classement"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="ranking-description">Description (optionnelle)</label>
            <textarea
              id="ranking-description"
              value={rankingDescription}
              onChange={(e) => setRankingDescription(e.target.value)}
              placeholder="Décrivez votre classement..."
              rows={4}
            />
          </div>
          
          <div className="form-group privacy-setting">
            <label>Confidentialité</label>
            <div className="privacy-toggle">
              <span className={!isPublic ? 'active' : ''}>Privé</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={() => setIsPublic(!isPublic)}
                />
                <span className="slider"></span>
              </label>
              <span className={isPublic ? 'active' : ''}>Public</span>
            </div>
          </div>
          
          <div className="sidebar-help">
            <h3>Aide</h3>
            <ul>
              <li>Sélectionnez les images que vous préférez à chaque tour</li>
              <li>Les images gagnent un point à chaque sélection</li>
              <li>Les images qui atteignent 5 points sont ajoutées au classement final</li>
              <li>Le processus continue jusqu'à ce que toutes les images soient classées</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Contenu principal */}
      <div className={`ranking-main-content ${showSidebar ? 'with-sidebar' : ''}`}>
        <div className="ranking-container">
          {/* Information sur le tour en cours */}
          {currentImages.length > 0 && (
            <div className="round-info">
              <p>Tour: {round}</p>
              <p>Sélectionnez jusqu'à {maxSelectable} images ({selectedImages.length}/{maxSelectable})</p>
              <p>Images restantes dans ce tour: {remainingImages.length}</p>
            </div>
          )}
          
          {/* Section des images classées */}
          {rankedImages.length > 0 && (
            <div className="ranked-images-section">
              <h2>Images classées (Score de 5+)</h2>
              <div className="ranked-images">
                {rankedImages
                  .sort((a, b) => b.score - a.score)
                  .map((image, index) => (
                    <div key={image.id} className="ranked-image">
                      <img src={image.src} alt={image.name} />
                      <div className="ranked-image-info">
                        <p className="rank">#{index + 1}</p>
                        <p className="name">{image.name}</p>
                        <p className="score">Score: {image.score}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
          
          {/* Sélection des images */}
          {currentImages.length > 0 && (
            <>
              <div className="images-grid">
                {currentImages.map(image => (
                  <div 
                    key={image.id} 
                    className={`image-item ${selectedImages.some(img => img.id === image.id) ? 'selected' : ''}`}
                    onClick={() => selectImage(image)}
                  >
                    <img src={image.src} alt={image.name} />
                    <div className="image-info">
                      <p className="name">{image.name}</p>
                      <p className="score">Score: {image.score}</p>
                      <p className="views">Vues: {image.viewed}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="actions">
                <button 
                  onClick={validateSelection}
                  disabled={selectedImages.length === 0}
                  className="validate-button"
                >
                  Valider la sélection
                </button>
              </div>
            </>
          )}
          
          {/* Étape de finalisation */}
          {currentImages.length === 0 && !loading && (
            <div className="final-results">
              <h2>Processus de classement terminé</h2>
              <p>Toutes les images ont été évaluées.</p>
              
              <div className="final-actions">
                <button onClick={restartGame} className="restart-button">Recommencer</button>
                {rankedImages.length > 0 && (
                  <button 
                    onClick={handleSaveRanking} 
                    disabled={isSaving || !rankingName.trim() || hasSaved}
                    className="save-button"
                  >
                    {isSaving ? "Sauvegarde en cours..." : hasSaved ? "Classement sauvegardé" : "Sauvegarder"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RankingEditor;