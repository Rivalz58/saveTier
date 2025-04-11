import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Modal from "react-modal";
import "../styles/TournamentEditor.css";
import tournamentService from "../services/tournament-service.ts";
/* eslint-disable @typescript-eslint/no-unused-vars */
Modal.setAppElement("#root"); // Necessary for accessibility

interface TournamentEditorProps {
  user: string | null;
}

interface TournamentImage {
  id: string;
  src: string;
  name: string;
  score: number;
}

const TournamentEditor: React.FC<TournamentEditorProps> = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State
  const [allImages, setAllImages] = useState<TournamentImage[]>([]);
  const [displayedImages, setDisplayedImages] = useState<TournamentImage[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [binome, setBinome] = useState<number>(0);
  const [trinome, setTrinome] = useState<number>(0);
  const [currentRoundImages, setCurrentRoundImages] = useState<TournamentImage[]>([]);
  const [roundWinners, setRoundWinners] = useState<TournamentImage[]>([]);
  const [tournamentFinished, setTournamentFinished] = useState<boolean>(false);
  const [winner, setWinner] = useState<TournamentImage | null>(null);
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [targetScore, setTargetScore] = useState<number>(0);
  const [maxRoundValue, setMaxRoundValue] = useState<number>(0);
  const [currentMaxScore, setCurrentMaxScore] = useState<number>(0);
  const [duelsCompleted, setDuelsCompleted] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  
  // Tournament info
  const [tournamentName, setTournamentName] = useState<string>("");
  const [tournamentDescription, setTournamentDescription] = useState<string>("");
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [albumId, setAlbumId] = useState<string>("");
  const [albumName, setAlbumName] = useState<string>("");
  const [hasSaved, setHasSaved] = useState(false);
  // UI state
  const [showInfoModal, setShowInfoModal] = useState<boolean>(() => {
    const hasSeenInfoModal = localStorage.getItem('tournamentInfoModalShown');
    return !hasSeenInfoModal;
  });
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Load images and params from URL
  useEffect(() => {
    if (isInitialized) return; // Empêche une réinitialisation multiple
  
    // Tenter de restaurer l'état sauvegardé depuis le localStorage
    const savedState = localStorage.getItem('tournamentEditorState');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        setAlbumId(state.albumId);
        setAllImages(state.allImages);
        setDisplayedImages(state.displayedImages);
        setSelectedImageId(state.selectedImageId);
        setBinome(state.binome);
        setTrinome(state.trinome);
        setCurrentRoundImages(state.currentRoundImages);
        setRoundWinners(state.roundWinners);
        setTournamentFinished(state.tournamentFinished);
        setWinner(state.winner);
        setCurrentRound(state.currentRound);
        setTargetScore(state.targetScore);
        setMaxRoundValue(state.maxRoundValue);
        setCurrentMaxScore(state.currentMaxScore);
        setDuelsCompleted(state.duelsCompleted);
        setTournamentName(state.tournamentName);
        setTournamentDescription(state.tournamentDescription);
        setIsPublic(state.isPublic);
        setIsInitialized(true);
        console.log("État restauré depuis le localStorage");
        return; // Si on a restauré l'état, ne pas continuer l'initialisation
      } catch (error) {
        console.error("Erreur lors de la restauration de l'état sauvegardé", error);
        localStorage.removeItem('tournamentEditorState');
      }
    }
  
    // Aucun état sauvegardé trouvé, on procède à l'initialisation classique
    const searchParams = new URLSearchParams(location.search);
    const albumParam = searchParams.get('album');
    const imagesParam = searchParams.get('images');
    const nameParam = searchParams.get('name');
  
    if (!albumParam || !imagesParam) {
      navigate('/allalbum');
      return;
    }
    
    setAlbumId(albumParam);
    if (nameParam) {
      setTournamentName(nameParam);
    }
    
    const loadImagesFromApi = async () => {
      try {
        const imageIds = JSON.parse(imagesParam);
        const albumInfo = await tournamentService.getAlbumInfo(albumParam);
        setAlbumName(albumInfo.name);
        
        const albumImages = await tournamentService.getAlbumImages(albumParam);
        const selectedImages = albumImages
          .filter(img => imageIds.includes(img.id))
          .map(img => ({
            id: img.id,
            src: img.src,
            name: img.name,
            score: 0  // Score initialisé à 0
          }));
        
        if (selectedImages.length === 0) {
          throw new Error("Aucune image sélectionnée");
        }
        
        console.log("Images avant démarrage du tournoi:", selectedImages);
        
        setAllImages(selectedImages);
        startNewTournament(selectedImages);  // Votre fonction modifiée qui démarre le tournoi
        setIsInitialized(true);
        
      } catch (error) {
        console.error("Erreur lors du chargement des images:", error);
        alert("Erreur lors du chargement des images. Redirection vers la page d'albums.");
        navigate('/allalbum');
      }
    };
    
    loadImagesFromApi();
  }, [location, navigate, isInitialized]);
  
  
  // Save state to localStorage
  useEffect(() => {
    if (allImages.length > 0) {
      const state = {
        albumId,
        allImages,
        displayedImages,
        selectedImageId,
        binome,
        trinome,
        currentRoundImages,
        roundWinners,
        tournamentFinished,
        winner,
        currentRound,
        targetScore,
        maxRoundValue,
        currentMaxScore,
        duelsCompleted,
        tournamentName,
        tournamentDescription,
        isPublic
      };
      
      localStorage.setItem('tournamentEditorState', JSON.stringify(state));
    }
  }, [
    albumId,
    allImages, 
    displayedImages, 
    selectedImageId, 
    binome, 
    trinome, 
    currentRoundImages, 
    roundWinners, 
    tournamentFinished, 
    winner, 
    currentRound, 
    targetScore, 
    maxRoundValue, 
    currentMaxScore, 
    duelsCompleted,
    tournamentName,
    tournamentDescription,
    isPublic
  ]);
  
  // Start next round when all duels are completed
  useEffect(() => {
    if (duelsCompleted && !tournamentFinished) {
      // Small delay to see the result of the last duel
      const timeoutId = setTimeout(() => {
        startNextRound();
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [duelsCompleted, tournamentFinished]);
  
  // Calculate round number based on number of images
  const calculRound = (bank: number) => {
    let round = 0;
    let max = 1;
    while (max * 2 < bank) {
      max *= 2;
      round += 1;
    }
    return round;
  };

  // Find maximum score among all images
  const scoreMax = (images: TournamentImage[]) => {
    if (images.length === 0) return 0;
    return images.reduce((max, img) => {
      return img.score > max ? img.score : max;
    }, images[0].score);
  };

  // Calculate maximum possible rounds
  const getMaxRounds = (imageCount: number) => {
    let round = 0;
    let max = 1;
    while (max * 2 < imageCount) {
      max *= 2;
      round += 1;
    }
    return round;
  };

  // Calculate duels for the current round
  const calculateDuels = (imgArray: TournamentImage[]) => {
    const bank = imgArray.length;
    let max = 1;

    while (max * 4 <= bank) {
      max *= 2;
    }

    let newBinome = 0;
    let newTrinome = 0;

    if (bank === 2 * max) {
      newBinome = bank / 2;
    } else if (bank === 3 * max) {
      newTrinome = bank / 3;
    } else if (bank < 3 * max) {
      newBinome = 3 * max - bank;
      newTrinome = max - newBinome;
    } else if (bank > 3 * max) {
      if (bank % 3 === 0) {
        newTrinome = bank / 3;
      } else if (bank % 3 === 1) {
        newTrinome = (bank - 4) / 3;
        newBinome = 2;
      } else if (bank % 3 === 2) {
        newTrinome = (bank - 2) / 3;
        newBinome = 1;
      }
    }

    return { newBinome, newTrinome };
  };

  // Setup the next duel
  const setupNextDuel = (
    roundImages: TournamentImage[],
    currentBinome: number,
    currentTrinome: number
  ) => {
    let nextDisplayedImages: TournamentImage[] = [];
    let updatedBinome = currentBinome;
    let updatedTrinome = currentTrinome;

    if (
      roundImages.length === 0 &&
      currentBinome === 0 &&
      currentTrinome === 0
    ) {
      setDuelsCompleted(true);
      return;
    }

    if (currentBinome > 0) {
      nextDisplayedImages = roundImages.splice(0, 2);
      updatedBinome -= 1;
    } else if (currentTrinome > 0) {
      nextDisplayedImages = roundImages.splice(0, 3);
      updatedTrinome -= 1;
    }

    setDisplayedImages(nextDisplayedImages);
    setCurrentRoundImages(roundImages);
    setBinome(updatedBinome);
    setTrinome(updatedTrinome);
    setSelectedImageId(null);
    setDuelsCompleted(false);
  };

  // Start a new tournament with provided images
  const startNewTournament = (images: TournamentImage[]) => {
    const resetImages = images.map(img => ({ ...img, score: 0 }));
    console.log("reset", resetImages, "allimages:", allImages);
    
    // Réinitialisation des états
    setAllImages(resetImages);
    setRoundWinners([]);
    setTournamentFinished(false);
    setWinner(null);
    setCurrentRound(0);
    setTargetScore(0);
    setMaxRoundValue(0);
    setCurrentMaxScore(0);
    setDuelsCompleted(false);
    setDisplayedImages([]);
    setSelectedImageId(null);
    setCurrentRoundImages([]);
    setBinome(0);
    setTrinome(0);
  
    console.log("after reset", resetImages, "allimages:", allImages);
    
    // Appel de la fonction en passant resetImages directement
    startNextRoundWithImages(resetImages);
  };
  
  const startNextRoundWithImages = (images: TournamentImage[]) => {
    // Utiliser 'images' au lieu de 'allImages' pour les calculs initiaux
    setDuelsCompleted(false);
  
    const maxRounds = getMaxRounds(images.length);
    setMaxRoundValue(maxRounds);
    
    const maxScore = scoreMax(images);
    setCurrentMaxScore(maxScore);
    
    let nextRoundImages: TournamentImage[];
    
    // Pour le premier round, utilisez toutes les images
    if (currentRound === 0) {
      nextRoundImages = images.map(img => ({ ...img, score: 0 }));
    } else {
      nextRoundImages = images.filter((img) => img.score === maxScore);
    }
    
    const winnerImage = images.find((img) => img.score >= maxRounds);
    if ((nextRoundImages.length < 2 && currentRound > 0) || winnerImage) {
      setTournamentFinished(true);
      setWinner(winnerImage || nextRoundImages[0] || null);
      return;
    }
    
    const newCurrentRound = calculRound(nextRoundImages.length);
    setCurrentRound(newCurrentRound);
    setTargetScore(newCurrentRound);
    
    const { newBinome, newTrinome } = calculateDuels(nextRoundImages);
    setBinome(newBinome);
    setTrinome(newTrinome);
    
    setCurrentRoundImages([...nextRoundImages]);
    setRoundWinners([]);
    
    setupNextDuel([...nextRoundImages], newBinome, newTrinome);
  };
  

  // Start the next round
  const startNextRound = () => {
    // Reset duel state
    setDuelsCompleted(false);
  
    // Calculer le nombre maximum de rounds théoriques
    const maxRounds = getMaxRounds(allImages.length);
    setMaxRoundValue(maxRounds);
  
    // Obtenir le score maximum actuel parmi toutes les images
    const maxScore = scoreMax(allImages);
    setCurrentMaxScore(maxScore);
  
    // Sélectionner les images pour le prochain round
    let nextRoundImages: TournamentImage[];
  
    // Pour le premier tour, utiliser toutes les images
    // Avec des scores réinitialisés à 0
    console.log("currentRound :"+currentRound)
    if (currentRound === 0) {
      nextRoundImages = allImages.map(img => ({ ...img, score: 0 }));
      console.log("image"+allImages)
    } else {
      // Pour les tours suivants, filtrer les images avec le score max
      console.log("max:"+maxScore)
      nextRoundImages = allImages.filter((img) => img.score === maxScore);
      console.log(
        `Round ${currentRound}: Selecting ${nextRoundImages.length} images with score ${maxScore}`
      );
    }
  
    // Vérifier si un gagnant existe ou s'il ne reste qu'une seule image
    const winnerImage = allImages.find((img) => img.score >= maxRounds);
    console.log("l'image vainqueur : "+winnerImage+nextRoundImages.length);
    if ((nextRoundImages.length < 2 && currentRound > 0) || winnerImage) {
      setTournamentFinished(true);
      setWinner(winnerImage || nextRoundImages[0] || null);
      return;
    }

  
    // Calculer le numéro du prochain round
    const newCurrentRound = calculRound(nextRoundImages.length);
    setCurrentRound(newCurrentRound);
    setTargetScore(newCurrentRound);
  
    // Calculer les duels
    const { newBinome, newTrinome } = calculateDuels(nextRoundImages);
    setBinome(newBinome);
    setTrinome(newTrinome);
  
    setCurrentRoundImages([...nextRoundImages]);
    setRoundWinners([]);
  
    // Configurer le prochain duel
    setupNextDuel([...nextRoundImages], newBinome, newTrinome);
  };

  // Select a winner for the current duel
  const selectWinner = (imageId: string) => {
    setSelectedImageId(imageId);
  };

  // Proceed to next duel after selection
  const nextDuel = () => {
    if (!selectedImageId) return;

    const winner = displayedImages.find((img) => img.id === selectedImageId);
    if (winner) {
      // Update winner's score in all images
      const updatedAllImages = allImages.map((img) =>
        img.id === winner.id ? { ...img, score: img.score + 1 } : img
      );

      setAllImages(updatedAllImages);

      // Update max score
      const newMaxScore = scoreMax(updatedAllImages);
      setCurrentMaxScore(newMaxScore);

      // Update round winners for display
      const updatedRoundWinners = [...roundWinners];
      const existingWinnerIndex = updatedRoundWinners.findIndex(
        (w) => w.id === winner.id
      );

      if (existingWinnerIndex !== -1) {
        updatedRoundWinners[existingWinnerIndex].score += 1;
      } else {
        updatedRoundWinners.push({ ...winner, score: winner.score + 1 });
      }

      setRoundWinners(updatedRoundWinners);

      // Check if more duels remain in current round
      if (currentRoundImages.length > 0 || binome > 0 || trinome > 0) {
        setupNextDuel(currentRoundImages, binome, trinome);
      } else {
        // All duels in current round are completed
        setDuelsCompleted(true);
      }
    }
  };

  // Restart the tournament
  const restartTournament = () => {
    // Reset all image scores
    const resetImages = allImages.map(img => ({ ...img, score: 0 }));
    
    setAllImages(resetImages);
    setDisplayedImages([]);
    setSelectedImageId(null);
    setCurrentRoundImages([]);
    setRoundWinners([]);
    setBinome(0);
    setTrinome(0);
    setTournamentFinished(false);
    setWinner(null);
    setCurrentRound(0);
    setTargetScore(0);
    setMaxRoundValue(0);
    setCurrentMaxScore(0);
    setDuelsCompleted(false);
    
    // Clear saved state
    localStorage.removeItem('tournamentEditorState');
    
    // Start new tournament
    startNextRound();
  };

  // Group images by round lost for final results display
  const getImagesByRoundLost = () => {
    const maxRounds = getMaxRounds(allImages.length);
    const imagesByRound: { [key: number]: TournamentImage[] } = {};
    
    // Initialize all possible rounds with empty arrays
    for (let i = 0; i <= maxRounds; i++) {
      imagesByRound[i] = [];
    }
    
    // Group images by round lost
    // Images with higher scores survived longer in the tournament
    allImages.forEach(img => {
      // If the image is the winner (highest score), it goes in group 0
      // Otherwise, group by how many rounds they survived (maxRounds - score)
      const roundLost = (img.id === winner?.id) ? 0 : maxRounds - img.score;
      imagesByRound[roundLost].push(img);
    });
    
    return imagesByRound;
  };

  // Toggle sidebar display
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };
  
  // Close the info modal
  const closeInfoModal = () => {
    setShowInfoModal(false);
    localStorage.setItem('tournamentInfoModalShown', 'true');
  };
  
  // Save tournament
  const handleSaveTournament = async () => {
    // Vérifier que le nom du tournoi n'est pas vide
    if (!tournamentName.trim()) {
      alert("Please give your tournament a name.");
      return;
    }
    
    if (hasSaved) {
      // Empêcher une double sauvegarde
      alert("Tournament has already been saved. Please restart to save again.");
      return;
    }
    
    // Si l'utilisateur n'est pas connecté, alerter
    if (!user) {
      alert("You need to be logged in to save a tournament.");
      return;
    }
    
    setIsSaving(true);
    try {
      // Préparer les données du tournoi (selon votre structure)
      const tournamentData = {
        name: tournamentName.trim(),
        description: tournamentDescription || "",
        private: !isPublic,
        id_album: Number(albumId)
      };
      console.log("Tournament data to save:", tournamentData);
      
      // Appel à votre service de sauvegarde qui renvoie l'ID du tournoi (ou un résultat)
      const tournamentId = await tournamentService.saveTournament(
        tournamentData,
        allImages,
        winner ? winner.id : ""
      );
      
      console.log("Tournament saved successfully. Tournament ID:", tournamentId);
      // Mettez à jour l'état pour indiquer que le tournoi a été sauvegardé
      setHasSaved(true);
      
      // Affichez un message de succès ou mettez à jour une partie de l'UI
      alert("Tournament saved successfully!");
      
      // IMPORTANT : PAS de redirection via navigate ici,
      // on reste sur la même page.
    } catch (error) {
      console.error("Error saving tournament:", error);
      alert("Error saving tournament. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  
  
  // Handle cancel button
  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel? Your progress will be lost.")) {
      localStorage.removeItem('tournamentEditorState');
      navigate("/allalbum");
    }
  };

  // Vérifie si c'est le round final
  const isFinalRound = () => {
    if (!allImages.length) return false;
    // On est en finale si le nombre d'images à comparer est de 2 ou 3 
    // et que ces images ont le score maximal atteint jusqu'à présent
    const maxScore = scoreMax(allImages);
    const imagesWithMaxScore = allImages.filter(img => img.score === maxScore);
    return (imagesWithMaxScore.length === 2 || imagesWithMaxScore.length === 3) && 
           currentRound === calculRound(imagesWithMaxScore.length);
  };

  return (
    <div className="tournament-editor">
      {/* Info Modal */}
      {showInfoModal && (
        <div className="info-modal-overlay">
          <div className="info-modal-content">
            <h2>How to Use the Tournament Editor</h2>
            <div className="info-content">
              <p>Welcome to the TierHub Tournament Editor!</p>
              <ul>
                <li>
                  <strong>Tournament Format:</strong> Images compete in head-to-head matches
                </li>
                <li>
                  <strong>Selection:</strong> Click on your favorite image in each match
                </li>
                <li>
                  <strong>Rounds:</strong> Continue through rounds until a winner emerges
                </li>
                <li>
                  <strong>Customization:</strong> Click on the edit button to change tournament details
                </li>
                <li>
                  <strong>Results:</strong> View final rankings when the tournament is complete
                </li>
              </ul>
              <p>Remember to fill in tournament information and save your tournament!</p>
            </div>
            <button className="info-close-btn" onClick={closeInfoModal}>
              Begin
            </button>
          </div>
        </div>
      )}
  
      {/* Compact Header */}
      <div className="tournament-compact-header">
        <div className="tournament-title">
          <h1>{tournamentName || "New Tournament"}</h1>
          <button
            className="edit-info-button"
            onClick={toggleSidebar}
            title="Edit tournament information"
          >
            ✎
          </button>
        </div>
        <div className="tournament-actions">
          <button
            className="restart-button"
            onClick={() => {
              restartTournament();
              setHasSaved(false); // Réinitialisation de l'état de sauvegarde lors du restart
            }}
          >
            Restart
          </button>
          {tournamentFinished && (
            <button
              className="save-button"
              onClick={handleSaveTournament}
              disabled={isSaving || !tournamentName.trim() || hasSaved}
            >
              {isSaving ? "Saving..." : hasSaved ? "Tournament Saved" : "Save Tournament"}
            </button>
          )}
          <button className="cancel-button" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </button>
        </div>
      </div>
  
      {/* Sidebar */}
      <div className={`tournament-sidebar ${showSidebar ? "active" : ""}`}>
        <div className="sidebar-header">
          <h2>Tournament Information</h2>
          <button className="close-sidebar" onClick={toggleSidebar}>
            ×
          </button>
        </div>
        <div className="sidebar-content">
          <div className="form-group">
            <label htmlFor="tournament-name">Tournament Name</label>
            <input
              type="text"
              id="tournament-name"
              value={tournamentName}
              onChange={(e) => setTournamentName(e.target.value)}
              placeholder="Give your tournament a name"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="tournament-description">Description (optional)</label>
            <textarea
              id="tournament-description"
              value={tournamentDescription}
              onChange={(e) => setTournamentDescription(e.target.value)}
              placeholder="Describe your tournament..."
              rows={4}
            />
          </div>
          <div className="form-group privacy-setting">
            <label>Privacy</label>
            <div className="privacy-toggle">
              <span className={!isPublic ? "active" : ""}>Private</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={() => setIsPublic(!isPublic)}
                />
                <span className="slider"></span>
              </label>
              <span className={isPublic ? "active" : ""}>Public</span>
            </div>
          </div>
          <div className="sidebar-help">
            <h3>Help</h3>
            <ul>
              <li>Click on images to select winners</li>
              <li>Winners advance to the next round</li>
              <li>All images get scores based on performance</li>
              <li>The tournament ends when a champion is determined</li>
            </ul>
          </div>
          {/* Aucun bouton Save dans la sidebar */}
        </div>
      </div>
  
      {/* Main Tournament Content */}
      <div className={`tournament-main-content ${showSidebar ? "with-sidebar" : ""}`}>
        {!tournamentFinished ? (
          <div className="tournament-active">
            <div className="tournament-stats-row">
              <div className="tournament-stats">
                <div className="round-indicator">
                  {isFinalRound() ? (
                    <span className="final-round">FINAL</span>
                  ) : (
                    <>
                      <span className="round-label">ROUND</span>
                      <span className="round-value">{currentRound}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="duel-area">
              <div className="duel-instructions">
                {displayedImages.length > 0 ? (
                  selectedImageId ? (
                    <p>Click "Next" to continue</p>
                  ) : (
                    <p>Click on your favorite image to select the winner</p>
                  )
                ) : duelsCompleted ? (
                  <p>Round complete! Click "Next Round" to continue</p>
                ) : (
                  <p>Setting up next match...</p>
                )}
              </div>
              <div className="duel-container">
                <div className="images-group">
                  {displayedImages.map((image) => (
                    <div
                      key={image.id}
                      className={`image-item ${selectedImageId === image.id ? "selected" : ""}`}
                      onClick={() => selectWinner(image.id)}
                    >
                      <img src={image.src} alt={image.name} />
                      <div className="image-info">
                        <p className="image-name">{image.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="large-next-button-container">
                  {!duelsCompleted ? (
                    <button
                      onClick={nextDuel}
                      disabled={!selectedImageId}
                      className="large-next-button"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={startNextRound}
                      className="large-next-round-button"
                    >
                      Next Round
                    </button>
                  )}
                </div>
              </div>
            </div>
            {roundWinners.length > 0 && (
              <div className="winners-section">
                <h3>Round Winners</h3>
                <div className="winners-grid">
                  {roundWinners.map((winner) => (
                    <div key={winner.id} className="winner-item">
                      <img src={winner.src} alt={winner.name} />
                      <p className="winner-name">{winner.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="tournament-results">
            <h2>Tournament Complete!</h2>
            {winner && (
              <div className="winner-card">
                <h3>Champion</h3>
                <div className="winner-image">
                  <img src={winner.src} alt={winner.name} />
                  <p className="winner-name">{winner.name}</p>
                </div>
              </div>
            )}
            <h3>Final Rankings</h3>
            <div className="rankings-container">
              {/* Insérez ici votre code d'affichage des classements finaux */}
            </div>
            {/* Le bouton Save n'est plus affiché ici afin de le centraliser dans le header */}
          </div>
        )}
      </div>
    </div>
  );  
  
}  

export default TournamentEditor;