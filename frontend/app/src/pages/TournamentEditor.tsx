import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Modal from "react-modal";
import "../styles/TournamentEditor.css";
import tournamentService from "../services/tournament-service.ts";
import ImageDetailsModal from "../components/ImageDetailsModal";

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
  const [imageDetailsModalOpen, setImageDetailsModalOpen] = useState<boolean>(false);
const [selectedImageDetails, setSelectedImageDetails] = useState<TournamentImage | null>(null);

// 3. Ajoutez ces fonctions pour ouvrir et fermer le modal:
const openImageDetailsModal = (image: TournamentImage) => {
  setSelectedImageDetails(image);
  setImageDetailsModalOpen(true);
};

const closeImageDetailsModal = () => {
  setImageDetailsModalOpen(false);
  setSelectedImageDetails(null);
};

  // UI state
  const [showInfoModal, setShowInfoModal] = useState<boolean>(() => {
    const hasSeenInfoModal = localStorage.getItem('tournamentInfoModalShown');
    return !hasSeenInfoModal;
  });
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Load images and params from URL
// Load images and params from URL
useEffect(() => {
  if (isInitialized) return; // Prevent multiple initializations

  const searchParams = new URLSearchParams(location.search);
  const albumParam = searchParams.get('album');
  const imagesParam = searchParams.get('images');
  const nameParam = searchParams.get('name');

  if (!albumParam) {
    navigate('/allalbum');
    return;
  }
  
  setAlbumId(albumParam);
  
  // Si images est dans les paramètres d'URL, c'est une nouvelle sélection d'images
  // On doit donc nettoyer le cache précédent
  if (imagesParam) {
    localStorage.removeItem(`tournamentEditorState_${albumParam}`);
    console.log("Previous cache cleared for album:", albumParam);
  }
  
  // Try to restore saved state for this specific album
  const savedState = localStorage.getItem(`tournamentEditorState_${albumParam}`);
  if (savedState) {
    try {
      const state = JSON.parse(savedState);
      // Check if this is the same album and has images
      if (state.albumId === albumParam && state.allImages && state.allImages.length > 0) {
        // Restaurer tous les états du tournoi
        setAllImages(state.allImages);
        setDisplayedImages(state.displayedImages || []);
        setSelectedImageId(state.selectedImageId);
        setBinome(state.binome || 0);
        setTrinome(state.trinome || 0);
        setCurrentRoundImages(state.currentRoundImages || []);
        setRoundWinners(state.roundWinners || []);
        setTournamentFinished(state.tournamentFinished || false);
        setWinner(state.winner);
        setCurrentRound(state.currentRound || 0);
        setTargetScore(state.targetScore || 0);
        setMaxRoundValue(state.maxRoundValue || 0);
        setCurrentMaxScore(state.currentMaxScore || 0);
        setDuelsCompleted(state.duelsCompleted || false);
        setTournamentName(state.tournamentName || nameParam || "");
        setTournamentDescription(state.tournamentDescription || "");
        setIsPublic(state.isPublic !== undefined ? state.isPublic : true);
        
        // Marquer comme initialisé
        setIsInitialized(true);
        console.log("State successfully restored from localStorage for album", albumParam);
        
        // Simplify URL after restoring data from localStorage
        if (imagesParam || nameParam) {
          const cleanUrl = `${window.location.pathname}?album=${albumParam}`;
          window.history.replaceState({}, document.title, cleanUrl);
        }
        
        return; // If we restored state, don't continue initialization
      }
    } catch (error) {
      console.error("Error restoring saved state", error);
      localStorage.removeItem(`tournamentEditorState_${albumParam}`);
    }
  }

  // No saved state found or error during restoration, proceed with standard initialization
  if (nameParam) {
    setTournamentName(nameParam);
  }
  
  if (!imagesParam) {
    navigate('/allalbum');
    return;
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
        score: 0    // OK
      }));
    
      
      if (selectedImages.length === 0) {
        throw new Error("No images selected");
      }
      
      console.log("Images loaded for new tournament:", selectedImages);
      
      // Initialiser les images et démarrer le tournoi
      setAllImages(selectedImages);
      startNewTournament(selectedImages);
      
      // Marquer comme initialisé
      setIsInitialized(true);
      
      // Nettoyer l'URL
      const cleanUrl = `${window.location.pathname}?album=${albumParam}`;
      window.history.replaceState({}, document.title, cleanUrl);
    } catch (error) {
      console.error("Error loading images:", error);
      alert("Error loading images. Redirecting to album page.");
      navigate('/allalbum');
    }
  };
  
  loadImagesFromApi();
}, [location, navigate, isInitialized]);
  
  
  // Save state to localStorage
// Save state to localStorage with album-specific key
useEffect(() => {
  // Ne sauvegarder que si nous avons des images et un ID d'album
  if (allImages.length > 0 && albumId && isInitialized) {
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
      isPublic,
      lastSaved: new Date().toISOString() // Ajout d'un timestamp pour le debug
    };
    
    try {
      localStorage.setItem(`tournamentEditorState_${albumId}`, JSON.stringify(state));
      console.log("Tournament state saved to localStorage at", new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Error saving tournament state to localStorage:", error);
    }
  }
}, [
  isInitialized, // Ajout de isInitialized pour éviter les sauvegardes avant initialisation complète
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

// Clean localStorage cache if new images are selected
const clearCacheForAlbum = (albumIdToClean: string) => {
  // If 'images' parameter is in URL, it means we're coming from a new image selection
  const params = new URLSearchParams(window.location.search);
  if (params.get('images')) {
    localStorage.removeItem(`tournamentEditorState_${albumIdToClean}`);
    console.log("Previous cache cleared for album:", albumIdToClean);
  }
};
  // Calculate maximum possible rounds
  const getMaxRounds = (imageCount: number) => {
    let round = 0;
    let max = 1;
    while (max * 2 <= imageCount) {
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
    // Copier les images pour éviter les modifications accidentelles
    const resetImages = images.map(img => ({ ...img, score: 0 }));
    
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
    
    // Réinitialiser l'état d'affichage
    setDisplayedImages([]);
    setSelectedImageId(null);
    setCurrentRoundImages([]);
    setBinome(0);
    setTrinome(0);
    
    console.log("Tournament initialized with images:", resetImages);
    
    // Démarrer directement le premier round
    startNextRoundWithImages(resetImages);
  };
  
  
  const startNextRoundWithImages = (images: TournamentImage[]) => {
    // S'assurer que nous travaillons avec une copie des images
    const workingImages = [...images];
    
    // Réinitialiser l'état du round
    setDuelsCompleted(false);
    
    // Calculer le nombre maximal de rounds théoriques
    const maxRounds = getMaxRounds(workingImages.length);
    setMaxRoundValue(maxRounds);
    
    // Obtenir le score maximum actuel
    const maxScore = scoreMax(workingImages);
    setCurrentMaxScore(maxScore);
    
    // Sélectionner les images pour ce round
    let nextRoundImages: TournamentImage[];
    
    // Pour le premier round, utiliser toutes les images (déjà réinitialisées)
    if (currentRound === 0) {
      nextRoundImages = [...workingImages];
    } else {
      // Pour les rounds suivants, filtrer les images ayant le score maximum
      nextRoundImages = workingImages.filter(img => img.score === maxScore);
    }
    
    // Vérifier s'il y a un gagnant ou si le tournoi doit se terminer
    const winnerImage = workingImages.find(img => img.score >= maxRounds);
    
    if ((nextRoundImages.length < 2 && currentRound > 0) || winnerImage) {
      console.log("Tournament finished condition met");
      setTournamentFinished(true);
      setWinner(winnerImage || nextRoundImages[0] || null);
      return;
    }
    
    // Calculer le numéro du round actuel
    const newCurrentRound = calculRound(nextRoundImages.length);
    setCurrentRound(newCurrentRound);
    setTargetScore(newCurrentRound);
    
    // Calculer les duels pour ce round
    const { newBinome, newTrinome } = calculateDuels(nextRoundImages);
    setBinome(newBinome);
    setTrinome(newTrinome);
    
    // Préparer les images pour ce round
    setCurrentRoundImages([...nextRoundImages]);
    setRoundWinners([]);
    
    // Lancer le premier duel du round
    setupNextDuel([...nextRoundImages], newBinome, newTrinome);
    
    console.log(`Round ${newCurrentRound} started with ${nextRoundImages.length} images, ${newBinome} binomes, ${newTrinome} trinomes`);
  };
  

  // Start the next round
 // Start the next round
 const startNextRound = () => {
  // Réinitialiser l'état des duels
  setDuelsCompleted(false);

  // Calculer le nombre maximum de rounds théoriques
  const maxRounds = getMaxRounds(allImages.length);
  setMaxRoundValue(maxRounds);

  // Obtenir le score maximum parmi toutes les images
  const maxScore = scoreMax(allImages);
  setCurrentMaxScore(maxScore);

  // Sélectionner les images pour le prochain round
  let nextRoundImages: TournamentImage[];

  // Pour le premier round, utiliser toutes les images en réinitialisant leur score
  if (currentRound === 0) {
    nextRoundImages = allImages.map(img => ({ ...img, score: 0 }));
  } else {
    // Pour les rounds suivants, filtrer les images ayant le score maximum
    nextRoundImages = allImages.filter(img => img.score === maxScore);
  }

  // Vérifier si une image a atteint le score maximum théorique
  // ou s'il ne reste plus d'au moins 2 images pour continuer le tournoi.
  console.log("\n\nallimage\n\n"+ allImages.find(img => img.score));
  const winnerImage = allImages.find(img => img.score >= maxRounds);

  // Condition modifiée :
  // Terminer le tournoi seulement s'il reste moins de 2 images (donc 0 ou 1 image)
  // ou si une image a atteint le score maximum théorique.
  if (nextRoundImages.length < 2 || winnerImage) {
    setTournamentFinished(true);
    setWinner(winnerImage || nextRoundImages[0] || null);
    return;
  }

  // Calculer le numéro pour le prochain round
  const newCurrentRound = calculRound(nextRoundImages.length);
  setCurrentRound(newCurrentRound);
  setTargetScore(newCurrentRound);

  // Calculer le nombre de duels pour le round : binomes et trinomes
  const { newBinome, newTrinome } = calculateDuels(nextRoundImages);
  setBinome(newBinome);
  setTrinome(newTrinome);

  setCurrentRoundImages([...nextRoundImages]);
  setRoundWinners([]);

  // Lancer le prochain duel
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
 // Restart the tournament
 const restartTournament = () => {
  if (!confirm("Voulez-vous vraiment redémarrer le tournoi ? Toute progression non sauvegardée sera perdue.")) {
    return;
  }
  
  // Reset all image scores
  const resetImages = allImages.map(img => ({ ...img, score: 0 }));
  
  // Réinitialiser tous les états
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
  setHasSaved(false); // Réinitialiser l'état de sauvegarde
  
  // Clear saved state for this specific album
  localStorage.removeItem(`tournamentEditorState_${albumId}`);
  console.log("Tournament restarted and cache cleared");
  
  // Appeler startNewTournament au lieu de startNextRound
  // C'est cette ligne qui posait problème
  startNewTournament(resetImages);
}

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
      // Préparer les données du tournoi avec les informations importantes
      const tournamentData = {
        name: tournamentName.trim(),
        description: tournamentDescription || "",
        private: !isPublic,
        id_album: Number(albumId),
        turn: currentRound + 1 // Ajout du nombre de rounds comme turn
      };
      console.log("Tournament data to save:", tournamentData);
      
      // Ensure we have the most up-to-date information for the winner
      const winnerImageId = winner ? winner.id : "";
      
      // Appel à votre service de sauvegarde qui renvoie l'ID du tournoi
      const tournamentId = await tournamentService.saveTournament(
        tournamentData,
        allImages,  // Passer toutes les images avec leurs scores
        winnerImageId
      );
      
      console.log("Tournament saved successfully. Tournament ID:", tournamentId);
      
      // Nettoyer le localStorage une fois sauvegardé avec succès
      clearLocalStorageAfterSave();
      
      // Mettez à jour l'état pour indiquer que le tournoi a été sauvegardé
      setHasSaved(true);
      
      // Affichez un message de succès
      alert("Tournament saved successfully!");
      
    } catch (error) {
      console.error("Error saving tournament:", error);
      alert("Error saving tournament. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  
  const clearLocalStorageAfterSave = () => {
    localStorage.removeItem(`tournamentEditorState_${albumId}`);
    console.log("Local tournament state cleared after successful save");
  };
  
  // Handle cancel button
  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel? Your progress will be lost.")) {
      localStorage.removeItem('tournamentEditorState');
      navigate("/allalbum");
    }
  };

/*  const loadTournament = async (tournamentId: string) => {
    try {
      // Fetch tournament data
      const tournamentData = await tournamentService.getTournamentById(Number(tournamentId));
      
      // Fetch tournament images with scores
      const tournamentImages = await tournamentService.getTournamentImages(Number(tournamentId));
      
      // Set tournament info
      setTournamentName(tournamentData.name);
      setTournamentDescription(tournamentData.description || "");
      setIsPublic(!tournamentData.private);
      
      // Set album ID if available
      if (tournamentData.id_album) {
        setAlbumId(tournamentData.id_album.toString());
        
        // Get album info if needed
        try {
          const albumInfo = await tournamentService.getAlbumInfo(tournamentData.id_album.toString());
          setAlbumName(albumInfo.name);
        } catch (albumError) {
          console.error("Error loading album info:", albumError);
        }
      }
      
      // Set all images with their scores
      setAllImages(tournamentImages);
      
      // Find and set winner if available
      if (tournamentData.winner_id) {
        const winnerImage = tournamentImages.find(img => img.id === tournamentData.winner_id);
        if (winnerImage) {
          setWinner(winnerImage);
        }
      }
      
      // Set tournament to finished state
      setTournamentFinished(true);
      
      // Calculate and set other tournament data
      const maxRounds = getMaxRounds(tournamentImages.length);
      setMaxRoundValue(maxRounds);
      
      const maxScore = scoreMax(tournamentImages);
      setCurrentMaxScore(maxScore);
      setCurrentRound(maxScore); // Set current round to max score
      
      // Mark as initialized
      setIsInitialized(true);
      
    } catch (error) {
      console.error("Error loading tournament:", error);
      alert("Error loading tournament. Redirecting to album page.");
      navigate('/allalbum');
    }
  };*/
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
        {tournamentFinished ? (
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
              {Object.entries(getImagesByRoundLost())
                .sort(([roundA], [roundB]) => parseInt(roundA) - parseInt(roundB)) // Champion d'abord
                .map(([round, images]) => {
                  if (images.length === 0) return null;
                  
                  let roundTitle = "";
                  const roundNumber = parseInt(round);
                  
                  // Déterminer le titre et la classe CSS selon le round
                  if (roundNumber === 0) {
                    roundTitle = "Champion";
                  } else if (roundNumber === 1) {
                    roundTitle = "Finalists";
                  } else if (roundNumber === 2) {
                    roundTitle = "Semi-Finalists";
                  } else {
                    roundTitle = `Round Eliminated: ${round}`;
                  }
                  
                  // Ajouter une classe de style spéciale selon le niveau d'élimination
                  let roundGroupClass = "round-group";
                  if (roundNumber === 0) {
                    roundGroupClass += " champion-group";
                  } else if (roundNumber === 1) {
                    roundGroupClass += " finalist-group";
                  } else if (roundNumber === 2) {
                    roundGroupClass += " semifinalist-group";
                  }
                  
                  return (
                    <div key={round} className={roundGroupClass}>
                      <h4 data-count={`${images.length} ${images.length === 1 ? 'image' : 'images'}`}>
                        {roundTitle}
                      </h4>
                      <div className="images-group">
  {images.map(image => (
    <div 
      key={image.id} 
      className="result-image"
      onClick={() => openImageDetailsModal(image)}
      style={{ cursor: 'pointer' }}
      title="Cliquez pour voir les détails"
    >
      <img src={image.src} alt={image.name} />
      <p>{image.name}</p>
    </div>
  ))}
</div>
                    </div>
                  );
                })}
            </div>
          </div>
        ) : (
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
      onDoubleClick={() => openImageDetailsModal(image)}
      title={`${image.name} (Double-cliquez pour voir les détails)`}
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
    <div 
      key={winner.id} 
      className="winner-item"
      onClick={() => openImageDetailsModal(winner)}
      style={{ cursor: 'pointer' }}
      title="Cliquez pour voir les détails"
    >
      <img src={winner.src} alt={winner.name} />
      <p className="winner-name">{winner.name}</p>
    </div>
  ))}
</div>
              </div>
            )}
          </div>
        )}
      </div>
      <ImageDetailsModal
  isOpen={imageDetailsModalOpen}
  onClose={closeImageDetailsModal}
  image={selectedImageDetails}
/>
    </div>
  );  
}  

export default TournamentEditor;