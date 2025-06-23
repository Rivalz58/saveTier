import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Modal from "react-modal";
import "../styles/RankingEditor.css";
import rankingService from "../services/rankingService";
import ImageDetailsModal from "../components/ImageDetailsModal";
import { getUserInfo } from "../services/userContentApi";

Modal.setAppElement("#root");

interface RankingEditorProps {
  user: string | null;
}

// Define the Image type matching the Ranking.tsx component
type Image = {
  id: string;
  src: string;
  name: string;
  score: number;
  viewed: number;
  description?: string | null;
  url?: string | null;
};

// Define the Save Data type
type SaveData = {
  allImages: Image[];
  rankedImages: Image[];
  currentImages: Image[];
  remainingImages: Image[];
  round: number;
  maxSelectable: number;
  initialDisplayCount: number;
  isQualificationPhase: boolean;
  rankingName: string;
  rankingDescription: string;
  isPublic: boolean;
  albumId: string;
  albumName: string;
};

const RankingEditor: React.FC<RankingEditorProps> = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: rankingId } = useParams<{ id?: string }>();
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Initial images array - this will be used only if no saved data exists
  const [initialImages, setInitialImages] = useState<Image[]>([]);

  // States
  const [allImages, setAllImages] = useState<Image[]>([]);
  const [currentImages, setCurrentImages] = useState<Image[]>([]);
  const [selectedImages, setSelectedImages] = useState<Image[]>([]);
  const [rankedImages, setRankedImages] = useState<Image[]>([]);
  const [remainingImages, setRemainingImages] = useState<Image[]>([]);
  const [round, setRound] = useState<number>(1);
  const [maxSelectable, setMaxSelectable] = useState<number>(3);
  const [initialDisplayCount, setInitialDisplayCount] = useState<number>(6);
  const [isQualificationPhase, setIsQualificationPhase] = useState<boolean>(false);

  // Ranking info
  const [rankingName, setRankingName] = useState<string>("");
  const [rankingDescription, setRankingDescription] = useState<string>("");
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [albumId, setAlbumId] = useState<string>("");
  const [albumName, setAlbumName] = useState<string>("");
  const [hasSaved, setHasSaved] = useState(false);
  const [savedRankingId, setSavedRankingId] = useState<number | null>(null);

  // UI state
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(() => {
    const hasSeenInfoModal = localStorage.getItem("rankingInfoModalShown");
    return !hasSeenInfoModal;
  });
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [imageDetailsModalOpen, setImageDetailsModalOpen] = useState<boolean>(false);
  const [selectedImageDetails, setSelectedImageDetails] = useState<Image | null>(null);

  // Local Storage key
  const STORAGE_KEY = "ranking-editor-save";

  // Helper function to merge album data with ranking data
  const mergeAlbumDataWithRanking = async (allAlbumImages: any[], rankingData: any): Promise<Image[]> => {
    console.log("Merging album data with ranking data...");
    
    // Extract ranking images from the main ranking data
    const rankingImages: any[] = [];
    if (rankingData.rankingImage && rankingData.rankingImage.length > 0) {
      console.log("Raw rankingImage data:", rankingData.rankingImage);
      
      rankingData.rankingImage.forEach((rankingImg: any) => {
        if (rankingImg.image) {
          // Points = score direct (négatif pour classé, positif pour en progression)
          const score = rankingImg.points;
          
          rankingImages.push({
            id: rankingImg.image.id.toString(),
            src: rankingImg.image.path_image,
            name: rankingImg.image.name,
            description: rankingImg.image.description,
            url: rankingImg.image.url,
            score: score, // Use score directly from DB
            points: rankingImg.points, // Keep original points for reference
            viewed: rankingImg.viewed || 0, // Use viewed count from DB
          });
          
          console.log(`Image ${rankingImg.image.name}: points/score=${score}, viewed=${rankingImg.viewed}, status=${score < 0 ? 'CLASSÉE' : score > 0 ? 'EN PROGRESSION' : 'NON CLASSÉE'}`);
        }
      });
    }
    

    // Convert ONLY images that have data in ranking (were originally selected)
    const convertedAllImages: Image[] = [];
    
    // Process only images that have ranking data (originally selected)
    rankingImages.forEach((rankedImage) => {
      const albumImage = allAlbumImages.find(img => img.id === rankedImage.id);
      if (albumImage) {
        const status = rankedImage.score < 0 ? 'CLASSÉE' : rankedImage.score > 0 ? 'EN PROGRESSION' : 'SÉLECTIONNÉE';
        console.log(`Adding ${status} image ${albumImage.name} with score ${rankedImage.score}`);
        convertedAllImages.push({
          id: albumImage.id,
          src: albumImage.src,
          name: albumImage.name,
          score: rankedImage.score, // Score direct from DB (peut être 0)
          viewed: rankedImage.viewed || 0, // Use viewed count from ranking
          description: albumImage.description,
          url: albumImage.url,
        });
      }
    });
    
    console.log(`Loaded ${convertedAllImages.length} originally selected images (from ${allAlbumImages.length} total album images)`);

    return convertedAllImages;
  };

  // Helper function to merge album data with cached session state
  const mergeAlbumDataWithCache = async (allAlbumImages: any[], rankingData: any, cachedState: SaveData): Promise<Image[]> => {
    console.log("Merging album data with cached session state...");
    
    // First get the base merge with ranking data
    const baseImages = await mergeAlbumDataWithRanking(allAlbumImages, rankingData);
    
    // Then apply cached state modifications (viewed counts, scores from active session)
    const finalImages = baseImages.map((baseImg) => {
      const cachedImg = cachedState.allImages.find(cached => cached.id === baseImg.id);
      
      if (cachedImg) {
        // Use the cached version's progress, but respect database ranking data for negative scores
        const finalScore = baseImg.score < 0 ? baseImg.score : cachedImg.score; // Database ranking wins over cache for ranked images
        console.log(`Merging cache for ${baseImg.name}: base score ${baseImg.score}, cached score ${cachedImg.score}, final score ${finalScore}`);
        return {
          ...baseImg,
          score: finalScore, // Database ranking data takes precedence for ranked images
          viewed: Math.max(baseImg.viewed, cachedImg.viewed), // Use the higher viewed count
        };
      }
      
      return baseImg;
    });

    console.log("Final merged images with cache applied:", finalImages.length);
    return finalImages;
  };

  // Load images and params from URL
  useEffect(() => {
    if (isInitialized) return; // Prevent multiple initializations

    // Check if we're in edit mode
    if (rankingId) {
      setIsEditMode(true);
      loadExistingRanking(rankingId);
      return;
    }

    const searchParams = new URLSearchParams(location.search);
    const albumParam = searchParams.get("album");
    const imagesParam = searchParams.get("images");
    const nameParam = searchParams.get("name");

    if (!albumParam) {
      navigate("/allalbum");
      return;
    }

    setAlbumId(albumParam);

    // Si images est dans les paramètres d'URL, c'est une nouvelle sélection d'images
    // On doit donc nettoyer le cache précédent
    if (imagesParam) {
      localStorage.removeItem(`${STORAGE_KEY}_${albumParam}`);
      console.log("Previous cache cleared for album:", albumParam);
    }

    // Try to restore saved state for this specific album (only if no new images param)
    const savedState = localStorage.getItem(`${STORAGE_KEY}_${albumParam}`);
    if (savedState && !imagesParam) { // Ne restaurer que si pas de nouveaux paramètres
      try {
        const state: SaveData = JSON.parse(savedState);
        // Check if this is the same album and has images
        if (
          state.albumId === albumParam &&
          state.allImages &&
          state.allImages.length > 0
        ) {
          // Restore all ranking states
          setAllImages(state.allImages);
          setCurrentImages(state.currentImages || []);
          setRankedImages(state.rankedImages || []);
          setRemainingImages(state.remainingImages || []);
          setRound(state.round || 1);
          setMaxSelectable(state.maxSelectable || 3);
          setInitialDisplayCount(state.initialDisplayCount || 6);
          setIsQualificationPhase(state.isQualificationPhase || false);
          setRankingName(state.rankingName || nameParam || "");
          setRankingDescription(state.rankingDescription || "");
          setIsPublic(state.isPublic !== undefined ? state.isPublic : true);
          setAlbumName(state.albumName || "");
          setInitialImages(state.allImages.map(img => ({ ...img, score: 0, viewed: 0 })));

          // Mark as initialized
          setIsInitialized(true);
          console.log("State successfully restored from localStorage for album", albumParam);

          // Clean URL after restoring data
          const cleanUrl = `${window.location.pathname}?album=${albumParam}`;
          window.history.replaceState({}, document.title, cleanUrl);

          return; // If we restored state, don't continue initialization
        }
      } catch (error) {
        console.error("Error restoring saved state", error);
        localStorage.removeItem(`${STORAGE_KEY}_${albumParam}`);
      }
    }

    // No saved state found, proceed with standard initialization
    if (nameParam) {
      setRankingName(nameParam);
    }

    if (!imagesParam) {
      navigate("/allalbum");
      return;
    }

    const loadImagesFromApi = async () => {
      try {
        const imageIds = JSON.parse(imagesParam);
        const albumInfo = await rankingService.getAlbumInfo(albumParam);
        setAlbumName(albumInfo.name);

        const albumImages = await rankingService.getAlbumImages(albumParam);
        const selectedImages = albumImages
          .filter((img) => imageIds.includes(img.id))
          .map((img) => ({
            id: img.id,
            src: img.src,
            name: img.name,
            score: 0,
            viewed: 0,
            description: img.description,
            url: img.url,
          }));

        if (selectedImages.length === 0) {
          throw new Error("No images selected");
        }

        console.log("Images loaded for new ranking:", selectedImages);

        // Initialize images and start ranking
        setInitialImages([...selectedImages]);
        startNewRanking(selectedImages);

        // Mark as initialized
        setIsInitialized(true);

        // Clean URL
        const cleanUrl = `${window.location.pathname}?album=${albumParam}`;
        window.history.replaceState({}, document.title, cleanUrl);
      } catch (error) {
        console.error("Error loading images:", error);
        alert("Error loading images. Redirecting to album page.");
        navigate("/allalbum");
      }
    };

    loadImagesFromApi();
  }, [location, navigate, isInitialized, rankingId]);

  // Load existing ranking for edit mode
  const loadExistingRanking = async (id: string) => {
    try {
      setLoading(true);
      console.log(`Loading existing ranking ${id} for edit mode`);

      // Check if we have cached state for this ranking ID first
      const cacheKey = `${STORAGE_KEY}_edit_${id}`;
      const cachedEditState = localStorage.getItem(cacheKey);
      
      // Get ranking data
      const rankingData = await rankingService.getRankingById(Number(id));
      console.log("Ranking data loaded:", rankingData);

      // Get current user info to compare with author
      try {
        const currentUser = await getUserInfo();
        const currentUserId = currentUser?.id?.toString();
        
        console.log("Current user ID:", currentUserId);
        console.log("Ranking author ID:", rankingData.author?.id?.toString());

        // Check if user owns this ranking
        if (!currentUserId || rankingData.author?.id?.toString() !== currentUserId) {
          alert("Vous n'êtes pas autorisé à modifier ce classement.");
          navigate(`/classements/${id}`);
          return;
        }
      } catch (userError) {
        console.error("Error getting current user:", userError);
        alert("Erreur lors de la vérification des autorisations.");
        navigate(`/classements/${id}`);
        return;
      }

      // Get album ID from ranking data
      let albumIdFromRanking: string;
      if (rankingData.album?.id) {
        albumIdFromRanking = rankingData.album.id.toString();
      } else if (rankingData.id_album) {
        albumIdFromRanking = rankingData.id_album.toString();
      } else {
        throw new Error("Cannot find album ID in ranking data");
      }

      console.log("Using album ID:", albumIdFromRanking);

      // Get album info and all album images
      const albumInfo = await rankingService.getAlbumInfo(albumIdFromRanking);
      setAlbumName(albumInfo.name);
      setAlbumId(albumIdFromRanking);

      // Set ranking metadata
      setRankingName(rankingData.name);
      setRankingDescription(rankingData.description || "");
      setIsPublic(!rankingData.private);
      setHasSaved(true);
      setSavedRankingId(Number(id));

      // Try to restore from cache first (if page reload during active session)
      if (cachedEditState) {
        try {
          const editState: SaveData = JSON.parse(cachedEditState);
          console.log("Found cached edit state for active session...");
          
          // Only restore if there was an active ranking session (currentImages exist)
          if (editState.currentImages && editState.currentImages.length > 0) {
            console.log("Restoring active ranking session from cache");
            
            // Get fresh album data first to merge with cached session
            const allAlbumImages = await rankingService.getAlbumImages(albumIdFromRanking);
            const mergedImages = await mergeAlbumDataWithCache(allAlbumImages, rankingData, editState);
            
            // Restore the active session state
            setAllImages(mergedImages);
            setCurrentImages(editState.currentImages);
            setRankedImages(editState.rankedImages || []);
            setRemainingImages(editState.remainingImages || []);
            setRound(editState.round || 1);
            setMaxSelectable(editState.maxSelectable || 3);
            setInitialDisplayCount(editState.initialDisplayCount || 6);
            setIsQualificationPhase(editState.isQualificationPhase || false);
            setSelectedImages([]); // Always reset selected images
            setInitialImages(allAlbumImages.map(img => ({ ...img, score: 0, viewed: 0 })));

            setIsInitialized(true);
            console.log("Active ranking session restored from cache");
            return;
          } else {
            console.log("Cache contains no active session, proceeding with fresh database load");
            localStorage.removeItem(cacheKey);
          }
        } catch (cacheError) {
          console.error("Error restoring cached edit state:", cacheError);
          localStorage.removeItem(cacheKey);
        }
      }

      // No cached state or error - load fresh from database
      console.log("Loading fresh data from database...");

      // Get ALL images from the album
      const allAlbumImages = await rankingService.getAlbumImages(albumIdFromRanking);
      console.log("All album images loaded:", allAlbumImages);
      
      // Process the ranking data and merge with album images
      const mergedImages = await mergeAlbumDataWithRanking(allAlbumImages, rankingData);

      // Setup the editor with merged data
      const rankedImgs = mergedImages.filter(img => img.score < 0);
      rankedImgs.sort((a, b) => a.score - b.score);
      const unrankedImages = mergedImages.filter(img => img.score >= 0);

      setAllImages(mergedImages);
      setRankedImages(rankedImgs);
      setInitialImages(allAlbumImages.map(img => ({ ...img, score: 0, viewed: 0 })));
      
      console.log("Edit mode setup completed:", {
        totalImages: mergedImages.length,
        rankedImages: rankedImgs.length,
        unrankedImages: unrankedImages.length,
        rankedImagesList: rankedImgs.map(img => ({ id: img.id, name: img.name, score: img.score })),
        unrankedImagesList: unrankedImages.map(img => ({ id: img.id, name: img.name, score: img.score }))
      });

      // Fresh load from database - show button to start ranking unranked images
      if (unrankedImages.length > 0) {
        console.log(`Fresh load: ${unrankedImages.length} unranked images - waiting for user to start`);
        
        // Configuration des paramètres sans démarrer le processus
        const { display, selectable } = determineDisplayAndSelectionCounts(unrankedImages.length);
        setMaxSelectable(selectable);
        setInitialDisplayCount(display);
        setRound(1);
        setIsQualificationPhase(false);
        
        // Laisser ces états vides - ils seront remplis quand l'utilisateur démarre
        setCurrentImages([]);
        setRemainingImages([]);
        setSelectedImages([]);
      } else {
        // All images are already ranked, just set the initial states
        console.log("All images are already ranked - no need to start ranking process");
        setCurrentImages([]);
        setRemainingImages([]);
        setSelectedImages([]);
        setRound(1);
        setIsQualificationPhase(false);
      }

      setIsInitialized(true);
    } catch (error) {
      console.error("Error loading existing ranking:", error);
      alert("Erreur lors du chargement du classement. Redirection vers la liste.");
      navigate("/profile");
    } finally {
      setLoading(false);
    }
  };

  // Start new ranking with loaded images (mode création)
  const startNewRanking = (images: Image[]) => {
    console.log(`startNewRanking called with ${images.length} images`);

    const { display, selectable } = determineDisplayAndSelectionCounts(images.length);
    
    // Shuffle images for randomness
    const shuffledImages = shuffleArray([...images]);
    const firstBatch = shuffledImages.slice(0, display);
    
    // Increment viewed count for first batch
    const firstBatchWithViewed = firstBatch.map((img) => ({
      ...img,
      viewed: img.viewed + 1,
    }));

    // Update allImages with viewed counts
    const updatedAllImages = images.map((img) => {
      const inFirstBatch = firstBatchWithViewed.find(
        (firstImg) => firstImg.id === img.id
      );
      return inFirstBatch || img;
    });

    setAllImages(updatedAllImages);
    setCurrentImages(firstBatchWithViewed);
    setRemainingImages(shuffledImages.slice(display));
    setRankedImages([]);
    setSelectedImages([]);
    setRound(1);
    setMaxSelectable(selectable);
    setInitialDisplayCount(display);
    setIsQualificationPhase(false);

    // Save initial state
    setTimeout(() => {
      saveGame();
    }, 0);
  };

  // NOUVELLE FONCTION: Démarrer le processus de classement en mode édition
  const startNewRankingInEditMode = () => {
    if (!isEditMode) return;
    
    console.log("Starting new ranking process in edit mode");
    
    // Get only unranked images from current allImages
    const unrankedImages = allImages.filter(img => img.score >= 0);
    
    if (unrankedImages.length === 0) {
      console.log("No unranked images to process");
      return;
    }

    const { display, selectable } = determineDisplayAndSelectionCounts(unrankedImages.length);
    
    // Shuffle unranked images for randomness
    const shuffledUnranked = shuffleArray([...unrankedImages]);
    const firstBatch = shuffledUnranked.slice(0, Math.min(display, shuffledUnranked.length));
    
    // Increment viewed count for first batch
    const firstBatchWithViewed = firstBatch.map((img) => ({
      ...img,
      viewed: img.viewed + 1,
    }));

    // Update allImages with viewed counts for the first batch only
    const updatedAllImages = allImages.map((img) => {
      const inFirstBatch = firstBatchWithViewed.find(
        (firstImg) => firstImg.id === img.id
      );
      return inFirstBatch || img;
    });

    setAllImages(updatedAllImages);
    setCurrentImages(firstBatchWithViewed);
    setRemainingImages(shuffledUnranked.slice(firstBatch.length));
    setSelectedImages([]);
    setRound(1);
    setMaxSelectable(selectable);
    setInitialDisplayCount(display);
    setIsQualificationPhase(false);

    console.log(`Started ranking process with ${firstBatch.length} current images and ${shuffledUnranked.slice(firstBatch.length).length} remaining`);
    
    // Save the session state for page reloads
    saveEditSession();
  };

  // Save edit session state to localStorage (different from game save)
  const saveEditSession = () => {
    if (!isEditMode || !rankingId) return;
    
    const editSessionData: SaveData = {
      allImages,
      rankedImages,
      currentImages,
      remainingImages,
      round,
      maxSelectable,
      initialDisplayCount,
      isQualificationPhase,
      rankingName,
      rankingDescription,
      isPublic,
      albumId,
      albumName,
    };
    
    const cacheKey = `${STORAGE_KEY}_edit_${rankingId}`;
    localStorage.setItem(cacheKey, JSON.stringify(editSessionData));
    console.log("Edit session saved for ranking", rankingId);
  };

  // Reset the ranking completely (mode édition)
  const resetRankingInEditMode = () => {
    if (!isEditMode || !rankingId) return;
    
    console.log("Resetting ranking in edit mode");
    
    // Reset all image scores and viewed counts
    const resetImages = initialImages.map((img) => ({
      ...img,
      score: 0,
      viewed: 0,
    }));

    // Reset all states
    setAllImages(resetImages);
    setRankedImages([]);
    setCurrentImages([]);
    setRemainingImages([]);
    setSelectedImages([]);
    setRound(1);
    setIsQualificationPhase(false);

    // Clear edit session cache
    const cacheKey = `${STORAGE_KEY}_edit_${rankingId}`;
    localStorage.removeItem(cacheKey);

    // Ne pas démarrer automatiquement - laisser l'utilisateur décider
    const { display, selectable } = determineDisplayAndSelectionCounts(resetImages.length);
    setMaxSelectable(selectable);
    setInitialDisplayCount(display);
  };

  // Shuffle array function
  const shuffleArray = (array: Image[]): Image[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Get random number between min and max (inclusive)
  const getRandomInt = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  // Determine display and selection counts based on total initial images count
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

    return { display, selectable };
  };

  // Get a batch size between 2-4 for qualified images
  const getQualificationBatchSize = (availableImages: number): number => {
    if (availableImages === 0) return 0;
    if (availableImages === 1) return 1;

    // Always return a random number between 2 and 4, with a max of the available images
    return getRandomInt(2, Math.min(4, availableImages));
  };

  // Save game state to local storage (uniquement en mode création)
  const saveGame = () => {
    if (isEditMode) return; // Ne pas sauvegarder en mode édition
    
    const saveData: SaveData = {
      allImages,
      rankedImages,
      currentImages,
      remainingImages,
      round,
      maxSelectable,
      initialDisplayCount,
      isQualificationPhase,
      rankingName,
      rankingDescription,
      isPublic,
      albumId,
      albumName,
    };
    localStorage.setItem(`${STORAGE_KEY}_${albumId}`, JSON.stringify(saveData));
    console.log("Ranking automatically saved");
  };

  // Auto-save when state changes (only in creation mode)
  useEffect(() => {
    if (isInitialized && allImages.length > 0 && !loading) {
      if (!isEditMode) {
        // Mode création - sauvegarde normale
        saveGame();
      } else if (currentImages.length > 0) {
        // Mode édition - sauvegarde de session seulement si classement actif
        saveEditSession();
      }
    }
  }, [
    allImages,
    rankedImages,
    currentImages,
    remainingImages,
    round,
    maxSelectable,
    initialDisplayCount,
    isQualificationPhase,
    rankingName,
    rankingDescription,
    isPublic,
    isInitialized,
    isEditMode,
    loading,
  ]);

  // Select an image
  const selectImage = (image: Image) => {
    const isAlreadySelected = selectedImages.some((img) => img.id === image.id);

    if (isAlreadySelected) {
      // Deselect the image
      setSelectedImages((prev) => prev.filter((img) => img.id !== image.id));
    } else if (selectedImages.length < maxSelectable) {
      // Select up to max selectable images
      setSelectedImages((prev) => [...prev, image]);
    }
  };

  // Validate selection and update scores
  const validateSelection = () => {
    if (selectedImages.length === 0) return;

    // Create a deep copy to avoid reference issues
    let updatedAllImagesTemp = JSON.parse(JSON.stringify(allImages));

    // Update scores for selected images
    updatedAllImagesTemp = updatedAllImagesTemp.map((img: Image) => {
      const isSelected = selectedImages.some(
        (selected) => selected.id === img.id
      );
      if (isSelected) {
        // Immediate and direct score increment
        return { ...img, score: img.score + 1 };
      }
      return img;
    });

    console.log(
      "Images after selection:",
      updatedAllImagesTemp.filter((img: Image) =>
        selectedImages.some((s) => s.id === img.id)
      )
    );

    // Identify images that have reached a score of 5
    let newlyRankedImages = updatedAllImagesTemp.filter(
      (img: Image) =>
        img.score >= 5 && !rankedImages.some((ranked) => ranked.id === img.id)
    );

    // Update ranked images
    if (newlyRankedImages.length > 0) {
      // Combine with already ranked images
      const newRankedImages = [...rankedImages, ...newlyRankedImages];

      // Assign negative ranks for ranked images
      const rankedWithNegativeScores = newRankedImages.map(
        (img: Image, index: number) => ({
          ...img,
          score: -(index + 1), // First rank = -1, second = -2, etc.
        })
      );

      console.log("Ranked images with negative scores:", rankedWithNegativeScores.map(img => ({ 
        id: img.id, 
        name: img.name, 
        score: img.score 
      })));

      // Update all images with negative scores (use the already calculated scores)
      updatedAllImagesTemp = updatedAllImagesTemp.map((img: Image) => {
        const rankedImg = rankedWithNegativeScores.find(
          (rankedImg) => rankedImg.id === img.id
        );
        if (rankedImg) {
          return { ...img, score: rankedImg.score }; // Use the already calculated negative score
        }
        return img;
      });

      // Update ranked images state
      setRankedImages(rankedWithNegativeScores);
    }

    // Update main images state
    setAllImages(updatedAllImagesTemp);

    // Update current images to reflect new scores
    const updatedCurrentImages = currentImages.map((img: Image) => {
      const updatedImg = updatedAllImagesTemp.find(
        (updated: Image) => updated.id === img.id
      );
      return updatedImg || img;
    });

    // Get unranked images (score >= 0)
    const unrankedImages = updatedAllImagesTemp.filter(
      (img: Image) => img.score >= 0
    );

    // Prepare next batch of images
    prepareNextBatch(updatedCurrentImages, remainingImages, unrankedImages, updatedAllImagesTemp);

    // Reset selected images
    setSelectedImages([]);
  };

  // Prepare the next batch of images to display
  const prepareNextBatch = (
    current: Image[],
    remaining: Image[],
    unrankedImages: Image[],
    updatedAllImgs: Image[]
  ) => {
    // First check if we're in the initial rounds or qualification phase
    if (remaining.length > 0 && !isQualificationPhase) {
      // Initial rounds - displaying images in batches
      const nextBatch = remaining.slice(
        0,
        Math.min(initialDisplayCount, remaining.length)
      );

      const nextBatchWithViewed = nextBatch.map((img) => {
        // Find the latest score for this image
        const latestImageData = updatedAllImgs.find(
          (updatedImg) => updatedImg.id === img.id
        );
        
        return {
          ...img,
          viewed: img.viewed + 1,
          // Use the latest score
          score: latestImageData ? latestImageData.score : img.score,
        };
      });

      // Update allImages with viewed counts and latest scores
      const newUpdatedAllImages = [...updatedAllImgs];
      nextBatchWithViewed.forEach((img) => {
        const index = newUpdatedAllImages.findIndex(
          (allImg) => allImg.id === img.id
        );
        if (index !== -1) {
          newUpdatedAllImages[index] = {
            ...newUpdatedAllImages[index],
            viewed: img.viewed,
          };
        }
      });

      setAllImages(newUpdatedAllImages);
      setCurrentImages(nextBatchWithViewed);
      setRemainingImages(
        remaining.slice(Math.min(initialDisplayCount, remaining.length))
      );

      // Increment round if remaining becomes empty
      if (remaining.length <= initialDisplayCount) {
        setRound((prev) => prev + 1);
      }
    } else {
      // If remaining is empty or we're already in qualification phase
      // Check if all images have been viewed at least twice
      const allViewedTwice = unrankedImages.every((img) => img.viewed >= 2);

      if (allViewedTwice || isQualificationPhase) {
        // Set qualification phase flag
        setIsQualificationPhase(true);

        // After two complete rounds, filter by score
        // Keep only images with score > 0
        const qualifiedImages = unrankedImages.filter((img) => img.score > 0);

        if (qualifiedImages.length > 0) {
          // Shuffle qualified images before sorting by views
          const shuffledQualified = shuffleArray([...qualifiedImages]);

          // Sort qualified images by view count (show least viewed first)
          const sortedQualified = [...shuffledQualified].sort(
            (a, b) => a.viewed - b.viewed
          );

          // Get a batch size between 2-4 for qualification phase
          const batchSize = getQualificationBatchSize(sortedQualified.length);

          // Set max selectable to batchSize - 1 (minimum 1)
          const newMaxSelectable = Math.max(1, batchSize - 1);
          setMaxSelectable(newMaxSelectable);

          // Get next batch of images
          const nextBatch = sortedQualified.slice(0, batchSize);

          const nextBatchWithViewed = nextBatch.map((img) => {
            // Find the latest score for this image
            const latestImageData = updatedAllImgs.find(
              (updatedImg) => updatedImg.id === img.id
            );
            
            return {
              ...img,
              viewed: img.viewed + 1,
              // Use the latest score
              score: latestImageData ? latestImageData.score : img.score,
            };
          });

          // Update allImages with viewed counts and latest scores
          const newUpdatedAllImages = [...updatedAllImgs];
          nextBatchWithViewed.forEach((img) => {
            const index = newUpdatedAllImages.findIndex(
              (allImg) => allImg.id === img.id
            );
            if (index !== -1) {
              newUpdatedAllImages[index] = {
                ...newUpdatedAllImages[index],
                viewed: img.viewed,
              };
            }
          });

          setAllImages(newUpdatedAllImages);
          setCurrentImages(nextBatchWithViewed);
          setRemainingImages(sortedQualified.slice(batchSize));
        } else {
          // If all images are either ranked (score >= 5) or eliminated (score == 0)
          // Continue with images of score 0
          const imagesWithZeroScore = unrankedImages.filter(
            (img) => img.score === 0
          );

          if (imagesWithZeroScore.length > 0) {
            // Shuffle images with zero score for variety
            const shuffledZeroScoreImages = shuffleArray([
              ...imagesWithZeroScore,
            ]);

            // Reset to initial phase
            setIsQualificationPhase(false);

            // Prepare next batch
            const nextBatch = shuffledZeroScoreImages.slice(
              0,
              Math.min(initialDisplayCount, shuffledZeroScoreImages.length)
            );

            const nextBatchWithViewed = nextBatch.map((img) => {
              // Find the latest score for this image
              const latestImageData = updatedAllImgs.find(
                (updatedImg) => updatedImg.id === img.id
              );
              
              return {
                ...img,
                viewed: img.viewed + 1,
                // Use the latest score (should still be 0)
                score: latestImageData ? latestImageData.score : img.score,
              };
            });

            // Update allImages with viewed counts and latest scores
            const newUpdatedAllImages = [...updatedAllImgs];
            nextBatchWithViewed.forEach((img) => {
              const index = newUpdatedAllImages.findIndex(
                (allImg) => allImg.id === img.id
              );
              if (index !== -1) {
                newUpdatedAllImages[index] = {
                  ...newUpdatedAllImages[index],
                  viewed: img.viewed,
                };
              }
            });

            // Restore default maxSelectable
            setMaxSelectable(initialDisplayCount - 1);

            setAllImages(newUpdatedAllImages);
            setCurrentImages(nextBatchWithViewed);
            setRemainingImages(
              shuffledZeroScoreImages.slice(
                Math.min(initialDisplayCount, shuffledZeroScoreImages.length)
              )
            );
            setRound(1); // Reset round counter
          } else {
            // Game is complete - all images ranked or eliminated
            setCurrentImages([]);
          }
        }
      } else {
        // Not yet two complete rounds, start next round
        setRound((prev) => prev + 1);

        // Shuffle the unranked images before sorting by view count
        const shuffledUnranked = shuffleArray([...unrankedImages]);

        // Sort unranked images by view count
        const sortedUnranked = [...shuffledUnranked].sort(
          (a, b) => a.viewed - b.viewed
        );

        const nextBatch = sortedUnranked.slice(
          0,
          Math.min(initialDisplayCount, sortedUnranked.length)
        );

        const nextBatchWithViewed = nextBatch.map((img) => {
          // Find the latest score for this image
          const latestImageData = updatedAllImgs.find(
            (updatedImg) => updatedImg.id === img.id
          );
          
          return {
            ...img,
            viewed: img.viewed + 1,
            // Use the latest score
            score: latestImageData ? latestImageData.score : img.score,
          };
        });

        // Update allImages with viewed counts and latest scores
        const newUpdatedAllImages = [...updatedAllImgs];
        nextBatchWithViewed.forEach((img) => {
          const index = newUpdatedAllImages.findIndex(
            (allImg) => allImg.id === img.id
          );
          if (index !== -1) {
            newUpdatedAllImages[index] = {
              ...newUpdatedAllImages[index],
              viewed: img.viewed,
            };
          }
        });

        setAllImages(newUpdatedAllImages);
        setCurrentImages(nextBatchWithViewed);
        setRemainingImages(
          sortedUnranked.slice(
            Math.min(initialDisplayCount, sortedUnranked.length)
          )
        );
      }
    }
  };

  // Reset the ranking completely (mode création)
  const resetRanking = () => {
    // Reset all image scores and viewed counts
    const resetImages = initialImages.map((img) => ({
      ...img,
      score: 0,
      viewed: 0,
    }));

    // Clear local storage
    localStorage.removeItem(`${STORAGE_KEY}_${albumId}`);

    // Reset all states
    setAllImages(resetImages);
    setRankedImages([]);
    setCurrentImages([]);
    setRemainingImages([]);
    setSelectedImages([]);
    setRound(1);

    // Start new ranking
    startNewRanking(resetImages);
  };

  // Save ranking to backend
  const saveRankingToBackend = async () => {
    if (!user || !rankingName.trim()) {
      alert("Veuillez vous connecter et donner un nom à votre classement.");
      return;
    }

    // Vérifier qu'il y a au moins une progression (score !== 0)
    const imagesWithProgress = allImages.filter(img => img.score !== 0);
    if (imagesWithProgress.length === 0) {
      alert("Aucune progression à sauvegarder. Sélectionnez au moins quelques images d'abord.");
      return;
    }

    try {
      setIsSaving(true);

      const rankingData = {
        name: rankingName.trim(),
        description: rankingDescription.trim() || null,
        private: !isPublic,
        id_album: Number(albumId),
      };

      let rankingIdResult: number;

      if (isEditMode && rankingId) {
        // Update existing ranking
        console.log("Updating existing ranking:", rankingId);
        rankingIdResult = await rankingService.updateRanking(Number(rankingId), rankingData, allImages);
      } else {
        // Create new ranking
        rankingIdResult = await rankingService.saveRanking(rankingData, allImages);
      }

      console.log("Classement sauvegardé avec succès, ID:", rankingIdResult);
      setHasSaved(true);
      setSavedRankingId(rankingIdResult);

      if (isEditMode) {
        // In edit mode, just show success message and stay
        alert("Classement mis à jour avec succès !");
      } else {
        // In creation mode, switch to edit mode and update URL
        setIsEditMode(true);
        
        // Clear localStorage after successful save
        localStorage.removeItem(`${STORAGE_KEY}_${albumId}`);
        
        // Update URL to edit mode without triggering navigation
        const newUrl = `/classements/edit/${rankingIdResult}`;
        window.history.pushState({}, document.title, newUrl);
        
        alert("Classement sauvegardé avec succès ! Vous pouvez maintenant continuer à le modifier.");
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      alert("Erreur lors de la sauvegarde du classement. Veuillez réessayer.");
    } finally {
      setIsSaving(false);
    }
  };

  // Open image details modal
  const openImageDetailsModal = (image: Image) => {
    setSelectedImageDetails(image);
    setImageDetailsModalOpen(true);
  };

  // Close image details modal
  const closeImageDetailsModal = () => {
    setImageDetailsModalOpen(false);
    setSelectedImageDetails(null);
  };

  // Show info modal after first images are loaded (better timing)
  useEffect(() => {
    // Pour les nouveaux classements, montrer la modal APRÈS avoir chargé les premières images
    if (!isEditMode && isInitialized && currentImages.length > 0 && round === 1) {
      const hasSeenInfoModal = localStorage.getItem("rankingInfoModalShown");
      if (!hasSeenInfoModal) {
        setShowInfoModal(true);
      }
    }
    // Pour les classements en édition, ne montrer que si jamais vue et qu'il y a du contenu
    else if (isEditMode && isInitialized) {
      const hasSeenInfoModal = localStorage.getItem("rankingInfoModalShown");
      if (!hasSeenInfoModal && allImages.length > 0) {
        setShowInfoModal(true);
      }
    }
  }, [isEditMode, isInitialized, currentImages.length, round, allImages.length]);

  const closeInfoModal = () => {
    setShowInfoModal(false);
    localStorage.setItem("rankingInfoModalShown", "true");
  };

  if (!isInitialized || loading) {
    return (
      <div className="ranking-editor-container">
        <div className="ranking-editor-loading">
          <div className="spinner"></div>
          <p>{loading ? "Chargement du classement..." : "Initialisation..."}</p>
        </div>
      </div>
    );
  }

  // Calculer les statistiques pour l'affichage
  const unrankedImagesCount = allImages.filter(img => img.score >= 0).length;
  const hasUnrankedImages = unrankedImagesCount > 0;
  const isRankingActive = currentImages.length > 0;

  return (
    <div className="ranking-editor-container">
      <div className="ranking-editor-header">
        <h1>{isEditMode ? "Modifier le Classement" : "Éditeur de Classement"}</h1>
        <div className="ranking-editor-actions">
          <button
            className="ranking-editor-button secondary"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            {showSidebar ? "Masquer" : "Paramètres"}
          </button>
          
          {/* Boutons spécifiques au mode édition */}
          {isEditMode && (
            <>
              {hasUnrankedImages && !isRankingActive && (
                <button
                  className="ranking-editor-button primary"
                  onClick={startNewRankingInEditMode}
                >
                  {rankedImages.length > 0 ? "Continuer le Classement" : "Commencer le Classement"}
                </button>
              )}
              {hasUnrankedImages && (
                <button
                  className="ranking-editor-button danger"
                  onClick={resetRankingInEditMode}
                >
                  Remettre à Zéro
                </button>
              )}
            </>
          )}
          
          {/* Bouton recommencer pour le mode création */}
          {!isEditMode && (
            <button
              className="ranking-editor-button danger"
              onClick={resetRanking}
            >
              Recommencer
            </button>
          )}
          
          {hasSaved && (
            <button
              className="ranking-editor-button secondary"
              onClick={() => navigate(`/classements/${savedRankingId || rankingId}`)}
            >
              Voir le Résultat
            </button>
          )}
          
          <button
            className="ranking-editor-button primary"
            onClick={saveRankingToBackend}
            disabled={isSaving || !user || allImages.filter(img => img.score !== 0).length === 0}
          >
            {isSaving 
              ? "Sauvegarde..." 
              : isEditMode 
                ? "Mettre à jour" 
                : rankedImages.length > 0 
                  ? "Sauvegarder Progression" 
                  : "Sauvegarder Progression"}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      {showSidebar && (
        <div className="ranking-editor-sidebar">
          <div className="sidebar-section">
            <h3>Informations du Classement</h3>
            <div className="input-group">
              <label>Nom du classement:</label>
              <input
                type="text"
                value={rankingName}
                onChange={(e) => setRankingName(e.target.value)}
                placeholder="Nom de votre classement"
              />
            </div>
            <div className="input-group">
              <label>Description (optionnelle):</label>
              <textarea
                value={rankingDescription}
                onChange={(e) => setRankingDescription(e.target.value)}
                placeholder="Description de votre classement"
                rows={3}
              />
            </div>
            <div className="input-group">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
                <span className="checkmark"></span>
                Classement public
              </label>
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Album: {albumName}</h3>
            <p>Images totales: {allImages.length}</p>
            <p>Images classées: {rankedImages.length}</p>
            <p>Images non classées: {unrankedImagesCount}</p>
            {isEditMode && (
              <p>Status: {isRankingActive ? "Classement en cours" : hasUnrankedImages ? "Prêt à classer" : "Classement terminé"}</p>
            )}
          </div>
        </div>
      )}

      {/* Information sur l'état du classement en mode édition */}
      {isEditMode && !isRankingActive && hasUnrankedImages && (
        <div className="ranking-status-info">
          <p>
            📝 Mode édition: {unrankedImagesCount} image{unrankedImagesCount > 1 ? 's' : ''} non classée{unrankedImagesCount > 1 ? 's' : ''}. 
            Cliquez sur "{rankedImages.length > 0 ? "Continuer le Classement" : "Commencer le Classement"}" pour {rankedImages.length > 0 ? "continuer" : "commencer"}.
          </p>
        </div>
      )}

      {/* Round Info */}
      {currentImages.length > 0 && (
        <div className="ranking-round-info">
          <p>Round: {round}</p>
          <p>
            Sélectionnez jusqu'à {maxSelectable} images ({selectedImages.length}/
            {maxSelectable})
          </p>
          <p>Affichage de {currentImages.length} images</p>
          <p>Restantes dans ce round: {remainingImages.length}</p>
          {isQualificationPhase && (
            <p className="qualification-phase">Phase de Qualification</p>
          )}
        </div>
      )}

      {/* Images Selection - Current Round */}
      {currentImages.length > 0 && (
        <div className="ranking-current-section">
          <h2>Images à Classer</h2>
          <div className="ranking-images-grid">
            {currentImages.map((image) => (
              <div
                key={image.id}
                className={`ranking-image-item ${
                  selectedImages.some((img) => img.id === image.id)
                    ? "selected"
                    : ""
                }`}
                onClick={() => selectImage(image)}
              >
                <img src={image.src} alt={`Image ${image.id}`} />
                <div className="ranking-image-info">
                  <p className="view-count">👁️ {image.viewed} vue{image.viewed > 1 ? 's' : ''}</p>
                </div>
                <button
                  className="ranking-image-details"
                  onClick={(e) => {
                    e.stopPropagation();
                    openImageDetailsModal(image);
                  }}
                >
                  i
                </button>
              </div>
            ))}
          </div>

          <div className="ranking-actions">
            <button
              className="ranking-validate-button"
              onClick={validateSelection}
              disabled={selectedImages.length === 0}
            >
              Valider la Sélection
            </button>
          </div>
        </div>
      )}

      {/* Ranked Images Section - Always at the bottom */}
      {rankedImages.length > 0 && (
        <div className="ranking-ranked-section">
          <div className="ranking-section-header">
            <h2>🏆 Images Classées (Score de 5+)</h2>
            <span className="ranking-count">{rankedImages.length} image{rankedImages.length > 1 ? 's' : ''} classée{rankedImages.length > 1 ? 's' : ''}</span>
          </div>
          <div className="ranking-ranked-grid">
            {rankedImages.map((image, index) => (
              <div 
                key={image.id} 
                className="ranking-ranked-item"
                onClick={() => openImageDetailsModal(image)}
              >
                <div className="ranking-position">
                  <span className="position-number">#{index + 1}</span>
                  {index < 3 && (
                    <span className="trophy-icon">
                      {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                    </span>
                  )}
                </div>
                <img src={image.src} alt={`Image ${image.id}`} />
                <div className="ranking-ranked-info">
                  <p className="image-name">{image.name}</p>
                  <div className="ranking-stats">
                    <span className="rank-badge">Rang #{index + 1}</span>
                    <span className="views">👁️ {image.viewed}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Modal */}
      {showInfoModal && (
        <div className="info-modal-overlay">
          <div className="info-modal-content">
            <h2>Comment fonctionne le Classement</h2>
            <div className="info-content">
              <h3>🎯 Comment fonctionne le classement ?</h3>
              <p>
                Vous voyez devant vous un lot d'images de votre album. 
                Votre mission : <strong>sélectionner vos préférées !</strong>
              </p>
              
              <h3>🎮 À chaque tour :</h3>
              <ul>
                <li>🖱️ <strong>Cliquez sur vos images favorites</strong> (vous pouvez en choisir plusieurs)</li>
                <li>⭐ Chaque image sélectionnée gagne <strong>1 point</strong></li>
                <li>🏆 Dès qu'une image atteint <strong>5 points</strong>, elle est automatiquement classée !</li>
                <li>🔄 Un nouveau lot d'images apparaît, et ça continue...</li>
              </ul>
              
              <h3>💡 Le truc en plus :</h3>
              <div className="ranking-modal-tip">
                <p>🔥 Plus vous avancez, plus le choix devient difficile car il ne reste que les meilleures images !</p>
                <p>💾 <strong>Vous pouvez sauvegarder à tout moment</strong> et reprendre plus tard depuis votre profil.</p>
              </div>
              
              <div className="ranking-modal-ready">
                <strong>🚀 Prêt(e) ? C'est parti !</strong>
              </div>
            </div>
            <button className="info-close-btn" onClick={closeInfoModal}>
              Commencer le Classement
            </button>
          </div>
        </div>
      )}

      {/* Image Details Modal */}
      {selectedImageDetails && (
        <ImageDetailsModal
          isOpen={imageDetailsModalOpen}
          onClose={closeImageDetailsModal}
          image={{
            ...selectedImageDetails,
            src: selectedImageDetails.src,
          }}
        />
      )}
    </div>
  );
};

export default RankingEditor;