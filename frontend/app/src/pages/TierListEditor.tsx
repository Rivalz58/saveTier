/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Modal from "react-modal";
import "../styles/TierListEditor.css";
import tierlistService, {
  TierlistImage,
  TierlistLine,
} from "../services/tierlistService";
import { useParams } from "react-router-dom";
import ImageDetailsModal from "../components/ImageDetailsModal";

Modal.setAppElement("#root"); // Nécessaire pour l'accessibilité

interface TierListEditorProps {
  user: string | null;
}

type Image = TierlistImage;

type Tier = {
  id: string;
  name: string;
  color: string;
  images: Image[];
};

type TierList = Tier[];

interface DragInfo {
  imageId: string;
  sourceTier: string | "unclassified";
  sourceIndex: number;
}

// Tiers par défaut (S, A, B, C, D)
const DEFAULT_TIERS = [
  { id: "tierS", name: "S", color: "#FF7F7F", images: [] },
  { id: "tierA", name: "A", color: "#FFBF7F", images: [] },
  { id: "tierB", name: "B", color: "#FFFF7F", images: [] },
  { id: "tierC", name: "C", color: "#7FFF7F", images: [] },
  { id: "tierD", name: "D", color: "#7F7FFF", images: [] },
];

const TierListEditor: React.FC<TierListEditorProps> = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: tierlistId } = useParams<{ id?: string }>();
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false); // Ajoutez cet état

  // Autres états existants...

  // États
  const [tierlistName, setTierlistName] = useState<string>("");
  const [tierlistDescription, setTierlistDescription] = useState<string>("");
  const [unclassifiedImages, setUnclassifiedImages] = useState<Image[]>([]);
  const [albumId, setAlbumId] = useState<string>("");
  const [tierList, setTierList] = useState<TierList>(DEFAULT_TIERS);
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [dragInfo, setDragInfo] = useState<DragInfo | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    tierId: string | null;
    position: "before" | "after" | null;
    imageId: string | null;
  } | null>(null);
  const [editingTierId, setEditingTierId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({ name: "", color: "" });
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(() => {
    const hasSeenInfoModal = localStorage.getItem("tierListInfoModalShown");
    return !hasSeenInfoModal;
  });
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [isDropTargetUnclassified, setIsDropTargetUnclassified] =
    useState<boolean>(false);

  // État pour la modal de détails d'image
  const [imageDetailsModalOpen, setImageDetailsModalOpen] =
    useState<boolean>(false);
  const [selectedImageDetails, setSelectedImageDetails] =
    useState<Image | null>(null);

  // Constantes pour la sauvegarde locale
  const STORAGE_KEY_TIERLIST_STATE = `tierlist_editor_${albumId}`;
  const SAVE_INTERVAL_MS = 5000; // Sauvegarde automatique toutes les 5 secondes

  // Fonction pour sauvegarder l'état dans localStorage
  const saveStateToLocalStorage = () => {
    try {
      const stateToSave = {
        tierlistName,
        tierlistDescription,
        unclassifiedImages,
        tierList,
        isPublic,
        mainImage,
        lastSaved: new Date().toISOString(),
      };

      localStorage.setItem(
        STORAGE_KEY_TIERLIST_STATE,
        JSON.stringify(stateToSave),
      );
      console.log(
        "État de la tierlist sauvegardé localement:",
        new Date().toLocaleTimeString(),
      );
    } catch (error) {
      console.error("Erreur lors de la sauvegarde locale:", error);
    }
  };

  // Fonction pour charger l'état depuis localStorage
  const loadStateFromLocalStorage = () => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY_TIERLIST_STATE);

      if (!savedState) {
        console.log("Aucun état sauvegardé trouvé pour cette tier-list");
        return false;
      }

      const parsedState = JSON.parse(savedState);

      // Mettre à jour tous les états avec les données sauvegardées
      setTierlistName(parsedState.tierlistName || "");
      setTierlistDescription(parsedState.tierlistDescription || "");
      setUnclassifiedImages(parsedState.unclassifiedImages || []);
      setTierList(parsedState.tierList || DEFAULT_TIERS);
      setIsPublic(
        parsedState.isPublic !== undefined ? parsedState.isPublic : true,
      );
      setMainImage(parsedState.mainImage || null);

      console.log(
        "État de la tierlist restauré depuis la sauvegarde locale du:",
        new Date(parsedState.lastSaved).toLocaleString(),
      );

      return true;
    } catch (error) {
      console.error("Erreur lors du chargement de l'état sauvegardé:", error);
      return false;
    }
  };

  // Fonction pour effacer l'état sauvegardé
  const clearSavedState = () => {
    localStorage.removeItem(STORAGE_KEY_TIERLIST_STATE);
    console.log("État sauvegardé effacé");
  };

  // Chargement des données depuis localStorage d'abord, puis depuis URL
  // Chargement des données depuis localStorage d'abord, puis depuis URL
  useEffect(() => {
    // Si nous sommes en mode édition (tierlistId existe), on ne fait rien ici
    if (tierlistId) {
      return;
    }

    // Récupérer les paramètres de l'URL
    const params = new URLSearchParams(location.search);
    const albumIdParam = params.get("album");
    const imagesParam = params.get("images");
    const name = params.get("name");
    const mainImgParam = params.get("main");

    if (!albumIdParam) {
      // Rediriger si paramètres manquants et qu'on n'est pas en mode édition
      navigate("/allalbum");
      return;
    }

    // Définir l'ID de l'album
    setAlbumId(albumIdParam);

    // Essayer de charger l'état sauvegardé localement d'abord
    // Utiliser la clé spécifique à cet album
    const storageKey = `tierlist_editor_${albumIdParam}`;

    // MODIFIEZ LE CODE PRÉCÉDENT POUR AJOUTER CECI JUSTE APRÈS:

    // Nettoyer le cache précédent si on vient de sélectionner de nouvelles images
    clearCacheForAlbum(albumIdParam);

    // Le reste du code reste identique...
    const savedState = localStorage.getItem(storageKey);

    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);

        // Mettre à jour tous les états avec les données sauvegardées
        setTierlistName(parsedState.tierlistName || "");
        setTierlistDescription(parsedState.tierlistDescription || "");
        setUnclassifiedImages(parsedState.unclassifiedImages || []);
        setTierList(parsedState.tierList || DEFAULT_TIERS);
        setIsPublic(
          parsedState.isPublic !== undefined ? parsedState.isPublic : true,
        );
        setMainImage(parsedState.mainImage || null);

        console.log(
          "État de la tierlist restauré depuis la sauvegarde locale du:",
          new Date(parsedState.lastSaved).toLocaleString(),
        );

        // Simplifier l'URL après avoir restauré les données du localStorage
        if (imagesParam || name || mainImgParam) {
          const cleanUrl = `${window.location.pathname}?album=${albumIdParam}`;
          window.history.replaceState({}, document.title, cleanUrl);
        }

        return; // Si on a restauré un état, on ne charge pas depuis l'URL
      } catch (error) {
        console.error("Erreur lors du chargement de l'état sauvegardé:", error);
        // En cas d'erreur, continuer et charger depuis l'URL
      }
    }

    // Si aucun état sauvegardé n'a été trouvé ou a échoué, on procède comme avant

    // Définir le nom initial de la tierlist
    if (name) {
      setTierlistName(name);
    }

    // Essayer de récupérer les images depuis les paramètres d'URL
    let selectedImageIds: string[] = [];

    if (imagesParam) {
      try {
        console.log('Raw Images Param:', imagesParam);
        
        // Décoder le paramètre d'URL
        const decodedImagesParam = decodeURIComponent(imagesParam);
        console.log('Decoded Images Param:', decodedImagesParam);
        
        // Parser le JSON
        selectedImageIds = JSON.parse(decodedImagesParam);
        console.log('Parsed Selected Image IDs:', selectedImageIds);
      } catch (error) {
        console.error("Erreur lors du parsing des images depuis l'URL:", error);
        // Fallback: essayer de récupérer depuis localStorage
        const storedImages = localStorage.getItem("tierlistImages");
        if (storedImages) {
          try {
            selectedImageIds = JSON.parse(storedImages);
          } catch (innerError) {
            console.error(
              "Erreur lors du parsing des images depuis localStorage:",
              innerError,
            );
          }
        }
      }
    } else {
      // Pas de paramètre URL, essayer localStorage
      const storedImages = localStorage.getItem("tierlistImages");
      if (storedImages) {
        try {
          selectedImageIds = JSON.parse(storedImages);
        } catch (innerError) {
          console.error(
            "Erreur lors du parsing des images depuis localStorage:",
            innerError,
          );
        }
      }
    }
    
    if (selectedImageIds.length === 0) {
      // Si toujours pas d'images, rediriger
      navigate("/allalbum");
      return;
    }
    
    // Charger les vraies images depuis l'API
const loadImagesFromApi = async () => {
  try {
    console.log('[loadImagesFromApi] Album ID Param:', albumIdParam);
    
    // Vérifier que albumIdParam est correct
    if (!albumIdParam) {
      console.error('[loadImagesFromApi] No album ID provided');
      return;
    }

    // Récupérer les détails de l'album pour obtenir ses images
    const albumImages = await tierlistService.getAlbumImages(albumIdParam);
    console.log('[loadImagesFromApi] Album Images:', albumImages);

    // Filtrer pour ne garder que les images sélectionnées
    const filteredImages = albumImages.filter((img) =>
      selectedImageIds.includes(img.id.toString()),
    );
    
    console.log('[loadImagesFromApi] Filtered Images:', filteredImages);
    console.log('[loadImagesFromApi] Selected Image IDs:', selectedImageIds);
    console.log('[loadImagesFromApi] Available Image IDs:', albumImages.map(img => img.id.toString()));

    // Vérifier si des images ont été filtrées
    if (filteredImages.length === 0) {
      console.warn('[loadImagesFromApi] No matching images found!');
      console.warn('Selected Image IDs:', selectedImageIds);
      console.warn('Available Image IDs:', albumImages.map(img => img.id.toString()));
      
      // Fallback : si aucune image correspondante n'est trouvée, utiliser toutes les images de l'album
      if (albumImages.length > 0) {
        console.log('[loadImagesFromApi] Using all album images as fallback');
        setUnclassifiedImages(albumImages);
        if (albumImages.length > 0) {
          setMainImage(albumImages[0].id);
        }
        return;
      }
    }

    // Définir les images non classées
    const imagesWithDbId = filteredImages.map(img => ({
  ...img,
  id_image: parseInt(img.id)
}));
setUnclassifiedImages(imagesWithDbId);

    // Définir l'image principale
    if (mainImgParam && filteredImages.some(img => img.id === mainImgParam)) {
      setMainImage(mainImgParam);
    } else if (filteredImages.length > 0) {
      setMainImage(filteredImages[0].id);
    }

    console.log('[loadImagesFromApi] Images loaded successfully:', filteredImages.length);

  } catch (error) {
    console.error("[loadImagesFromApi] Error loading images:", error);
    
    // En cas d'erreur, essayer de charger toutes les images de l'album
    try {
      console.log('[loadImagesFromApi] Attempting fallback - loading all album images');
      const allAlbumImages = await tierlistService.getAlbumImages(albumIdParam);
      if (allAlbumImages.length > 0) {
        setUnclassifiedImages(allAlbumImages);
        setMainImage(allAlbumImages[0].id);
        console.log('[loadImagesFromApi] Fallback successful:', allAlbumImages.length);
      }
    } catch (fallbackError) {
      console.error('[loadImagesFromApi] Fallback also failed:', fallbackError);
      // Rediriger vers la sélection d'albums en cas d'échec complet
      alert("Impossible de charger les images. Redirection vers la sélection d'albums.");
      navigate("/allalbum");
    }
  }
};
    
    loadImagesFromApi();

    // Nettoyer localStorage si nécessaire
    if (imagesParam) {
      localStorage.removeItem("tierlistImages");
    }
    if (imagesParam || name || mainImgParam) {
      const cleanUrl = `${window.location.pathname}?album=${albumIdParam}`;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [location, navigate, tierlistId]);

  useEffect(() => {
    // Si on a un ID de tierlist, on est en mode édition
    if (tierlistId) {
      setIsEditMode(true);

      // Fonction pour charger la tierlist existante
      const loadExistingTierlist = async () => {
        try {
          setLoading(true);

          const { tierlist, lines } =
            await tierlistService.getTierlistWithDetails(parseInt(tierlistId));

          // Mettre à jour les états avec les données reçues
          setTierlistName(tierlist.name);
          setTierlistDescription(tierlist.description || "");
          setIsPublic(!tierlist.private);
          setAlbumId(tierlist.id_album.toString());

          // Séparer les tiers normaux et le tier "Non classé" basé sur placement = 0
          const normalTiers: Tier[] = [];
          let unclassifiedImagesFromTier: React.SetStateAction<
            TierlistImage[]
          > = [];

          for (const line of lines) {
            // Vérifier si c'est le tier "Non classé" par placement = 0
            if (line.placement === 0) {
              // Récupérer les images du tier "Non classé" pour les mettre dans unclassifiedImages
              unclassifiedImagesFromTier = line.images;
            } else {
              // Ajouter aux tiers normaux
              normalTiers.push({
                id:
                  line.id?.toString() ||
                  `tier_${normalTiers.length + 1}_${Date.now()}`,
                name: line.label || `Tier ${normalTiers.length + 1}`,
                color: `#${line.color}`,
                images: line.images,
              });
            }
          }

          // Mettre à jour le tierList avec uniquement les tiers normaux
          setTierList(normalTiers.length > 0 ? normalTiers : DEFAULT_TIERS);

          // Mettre les images du tier "Non classé" dans unclassifiedImages
          setUnclassifiedImages(unclassifiedImagesFromTier);
        } catch (error) {
          console.error("Error loading tierlist:", error);
          alert(
            "Impossible de charger la tierlist. Veuillez réessayer plus tard.",
          );
          navigate("/profile");
        } finally {
          setLoading(false);
        }
      };

      loadExistingTierlist();
    }
  }, [tierlistId, navigate]);

  // Sauvegarde automatique de l'état
  useEffect(() => {
    // Ne commencer la sauvegarde automatique que si l'albumId est défini
    if (!albumId) return;

    // Définir la clé de stockage spécifique à cet album
    const storageKey = `tierlist_editor_${albumId}`;

    // Fonction pour sauvegarder
    const saveState = () => {
      try {
        const stateToSave = {
          tierlistName,
          tierlistDescription,
          unclassifiedImages,
          tierList,
          isPublic,
          mainImage,
          lastSaved: new Date().toISOString(),
        };

        localStorage.setItem(storageKey, JSON.stringify(stateToSave));
        console.log("État sauvegardé:", new Date().toLocaleTimeString());
      } catch (error) {
        console.error("Erreur lors de la sauvegarde:", error);
      }
    };

    // Sauvegarder immédiatement pour capturer l'état initial ou changé
    saveState();

    // Configurer un intervalle pour sauvegarder périodiquement
    const interval = setInterval(saveState, SAVE_INTERVAL_MS);

    // Sauvegarder également lorsque l'utilisateur quitte la page ou change d'onglet
    const handleBeforeUnload = () => {
      saveState();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Nettoyer
    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [
    albumId,
    tierlistName,
    tierlistDescription,
    unclassifiedImages,
    tierList,
    isPublic,
    mainImage,
  ]);

  const clearCacheForAlbum = (albumIdToClean: string) => {
    // Si dans l'URL on a des paramètres 'images', c'est qu'on vient de sélectionner de nouvelles images
    // donc on doit nettoyer le cache précédent
    const params = new URLSearchParams(window.location.search);
    if (params.get("images")) {
      localStorage.removeItem(`tierlist_editor_${albumIdToClean}`);
      console.log("Cache précédent supprimé pour l'album:", albumIdToClean);
    }
  };

  // Fonction pour trouver une image par son ID
  const findImageById = (
    id: string,
  ): { image: Image; tier: string | "unclassified"; index: number } | null => {
    // Chercher dans les images non classées
    const unclassifiedIndex = unclassifiedImages.findIndex(
      (img) => img.id === id,
    );
    if (unclassifiedIndex !== -1) {
      return {
        image: unclassifiedImages[unclassifiedIndex],
        tier: "unclassified",
        index: unclassifiedIndex,
      };
    }

    // Chercher dans les tiers
    for (const tier of tierList) {
      const index = tier.images.findIndex((img) => img.id === id);
      if (index !== -1) {
        return {
          image: tier.images[index],
          tier: tier.id,
          index,
        };
      }
    }

    return null;
  };

  // Ouvrir la modal de détails d'image
  const openImageDetailsModal = (image: Image) => {
    setSelectedImageDetails(image);
    setImageDetailsModalOpen(true);
  };

  // Fermer la modal de détails d'image
  const closeImageDetailsModal = () => {
    setImageDetailsModalOpen(false);
    setSelectedImageDetails(null);
  };

  // Fonction pour déplacer un tier vers le haut
  const moveTierUp = (tierId: string) => {
    // Trouver l'index du tier à déplacer
    const tierIndex = tierList.findIndex((tier) => tier.id === tierId);

    // Vérifier si on peut le déplacer vers le haut
    if (tierIndex <= 0) return;

    // Créer une copie du tableau des tiers
    const newTierList = [...tierList];

    // Échanger le tier avec celui au-dessus
    [newTierList[tierIndex], newTierList[tierIndex - 1]] = [
      newTierList[tierIndex - 1],
      newTierList[tierIndex],
    ];

    // Mettre à jour l'état
    setTierList(newTierList);
  };

  // Fonction pour déplacer un tier vers le bas
  const moveTierDown = (tierId: string) => {
    // Trouver l'index du tier à déplacer
    const tierIndex = tierList.findIndex((tier) => tier.id === tierId);

    // Vérifier si on peut le déplacer vers le bas
    if (tierIndex >= tierList.length - 1) return;

    // Créer une copie du tableau des tiers
    const newTierList = [...tierList];

    // Échanger le tier avec celui en-dessous
    [newTierList[tierIndex], newTierList[tierIndex + 1]] = [
      newTierList[tierIndex + 1],
      newTierList[tierIndex],
    ];

    // Mettre à jour l'état
    setTierList(newTierList);
  };

  // Fonction pour commencer l'édition d'un tier
  const handleEditTier = (tier: Tier) => {
    setEditingTierId(tier.id);
    setEditFormData({
      name: tier.name,
      color: tier.color,
    });
  };

  // Fonction pour formater le nom de tier avec retour à la ligne
  const formatTierName = (name: string): string => {
    const maxLength = 37;
    const chunkSize = 12;
    
    // Limiter à 37 caractères
    const trimmedName = name.slice(0, maxLength);
    
    // Diviser en mots
    const words = trimmedName.split(' ');
    let formattedName = '';
    let currentLine = '';
    
    for (const word of words) {
      // Si le mot seul dépasse 12 caractères, le forcer sur une nouvelle ligne
      if (word.length > chunkSize) {
        if (currentLine) {
          formattedName += currentLine + '\n';
          currentLine = '';
        }
        // Couper le mot long par chunks de 12
        for (let i = 0; i < word.length; i += chunkSize) {
          const chunk = word.slice(i, i + chunkSize);
          formattedName += chunk + '\n';
        }
        continue;
      }
      
      // Vérifier si ajouter ce mot dépasserait 12 caractères
      const potentialLine = currentLine ? `${currentLine} ${word}` : word;
      
      if (potentialLine.length <= chunkSize) {
        currentLine = potentialLine;
      } else {
        // Ajouter la ligne actuelle et commencer une nouvelle ligne
        if (currentLine) {
          formattedName += currentLine + '\n';
        }
        currentLine = word;
      }
    }
    
    // Ajouter la dernière ligne
    if (currentLine) {
      formattedName += currentLine;
    }
    
    return formattedName.trim();
  };

  // Fonction pour sauvegarder les modifications d'un tier
  const handleSaveTier = () => {
    if (!editingTierId) return;

    // Vérifier si le nom n'est pas vide
    if (!editFormData.name.trim()) {
      alert("Le nom du tier ne peut pas être vide.");
      return;
    }

    setTierList((prev) =>
      prev.map((tier) =>
        tier.id === editingTierId
          ? {
              ...tier,
              name: editFormData.name.trim().slice(0, 37), // Limiter à 37 caractères
              color: editFormData.color,
            }
          : tier,
      ),
    );

    setEditingTierId(null);
  };

  // Fonction pour annuler l'édition
  const handleCancelEdit = () => {
    setEditingTierId(null);
  };

  // Gérer les changements dans le formulaire d'édition
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Commencer le drag and drop
  const handleDragStart = (
    e: React.DragEvent,
    imageId: string,
    sourceTier: string | "unclassified",
    sourceIndex: number,
  ) => {
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({ imageId, sourceTier, sourceIndex }),
    );
    setDragInfo({ imageId, sourceTier, sourceIndex });
  };

  // Gérer le survol d'une image cible
  const handleDragOver = (
    e: React.DragEvent,
    tierId: string,
    imageId?: string,
  ) => {
    e.preventDefault();

    if (!dragInfo) return;

    // Réinitialiser l'état de survol de la zone non classée
    setIsDropTargetUnclassified(false);

    // Déterminer si on est avant ou après l'image
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX;
    const middle = rect.left + rect.width / 2;
    const position = mouseX < middle ? "before" : "after";

    setDropTarget({
      tierId,
      position,
      imageId: imageId ?? null,
    });
  };

  // Gérer le survol d'un tier vide
  const handleTierDragOver = (e: React.DragEvent, tierId: string) => {
    e.preventDefault();

    if (!dragInfo) return;

    // Réinitialiser l'état de survol de la zone non classée
    setIsDropTargetUnclassified(false);

    // Trouver le tier
    const tier = tierList.find((t) => t.id === tierId);
    if (!tier) return;

    // Si on survole un tier vide, positionner à la fin
    if (tier.images.length === 0) {
      setDropTarget({
        tierId,
        position: null,
        imageId: null,
      });
    }
  };

  // Gérer le survol de la zone des images non classées
  const handleUnclassifiedDragOver = (e: React.DragEvent) => {
    e.preventDefault();

    if (!dragInfo || dragInfo.sourceTier === "unclassified") return;

    // Marquer la zone non classée comme cible de drop
    setIsDropTargetUnclassified(true);

    // Réinitialiser les autres cibles
    setDropTarget(null);
  };

  // Réinitialiser les indicateurs visuels quand on quitte une zone
  const handleDragLeave = (e: React.DragEvent) => {
    // Ne pas réinitialiser si on entre dans un enfant de l'élément actuel
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;

    setDropTarget(null);
    setIsDropTargetUnclassified(false);
  };

  // Gérer le dépôt d'une image
  const handleDrop = (
    e: React.DragEvent,
    targetTierId: string,
    targetImageId?: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!dragInfo) return;

    // Réinitialiser l'état de survol de la zone non classée
    setIsDropTargetUnclassified(false);

    // Récupérer les informations de l'image déplacée
    const draggedImageInfo = findImageById(dragInfo.imageId);
    if (!draggedImageInfo) {
      console.error("Image non trouvée:", dragInfo.imageId);
      return;
    }

    // Créer des copies de travail
    let newUnclassifiedImages = [...unclassifiedImages];
    const newTierList = JSON.parse(JSON.stringify(tierList)) as TierList;

    // 1. Retirer l'image de sa source
    if (dragInfo.sourceTier === "unclassified") {
      newUnclassifiedImages = newUnclassifiedImages.filter(
        (img) => img.id !== dragInfo.imageId,
      );
    } else {
      // Trouver l'index du tier source
      const sourceTierIndex = newTierList.findIndex(
        (tier) => tier.id === dragInfo.sourceTier,
      );
      if (sourceTierIndex !== -1) {
        // Filtrer l'image du tier source
        newTierList[sourceTierIndex].images = newTierList[
          sourceTierIndex
        ].images.filter((img) => img.id !== dragInfo.imageId);
      }
    }

    // 2. Trouver le tier cible
    const targetTierIndex = newTierList.findIndex(
      (tier) => tier.id === targetTierId,
    );
    if (targetTierIndex === -1) {
      console.error("Tier cible non trouvé:", targetTierId);
      return;
    }

    // 3. Déterminer la position d'insertion
    if (targetImageId && dropTarget?.position) {
      const targetIndex = newTierList[targetTierIndex].images.findIndex(
        (img) => img.id === targetImageId,
      );

      if (targetIndex !== -1) {
        // Calculer l'index d'insertion basé sur la position (avant/après)
        const insertIndex =
          dropTarget.position === "after" ? targetIndex + 1 : targetIndex;

        // Insérer l'image à la bonne position
        newTierList[targetTierIndex].images.splice(
          insertIndex,
          0,
          draggedImageInfo.image,
        );
      } else {
        // Si l'image cible n'est pas trouvée, ajouter à la fin
        newTierList[targetTierIndex].images.push(draggedImageInfo.image);
      }
    } else {
      // Ajouter à la fin du tier si pas d'image cible
      newTierList[targetTierIndex].images.push(draggedImageInfo.image);
    }

    // 4. Mettre à jour l'état
    setUnclassifiedImages(newUnclassifiedImages);
    setTierList(newTierList);
    setDragInfo(null);
    setDropTarget(null);
  };

  // Gérer le dépôt d'une image dans la zone non classée
  const handleDropToUnclassified = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!dragInfo || dragInfo.sourceTier === "unclassified") return;

    // Récupérer les informations de l'image déplacée
    const draggedImageInfo = findImageById(dragInfo.imageId);
    if (!draggedImageInfo) {
      console.error("Image non trouvée:", dragInfo.imageId);
      return;
    }

    // Créer une copie de l'image à déplacer dans les non classées
    const imageCopy = { ...draggedImageInfo.image };

    // Retirer l'image du tier source
    setTierList((prev) =>
      prev.map((tier) => {
        if (tier.id === dragInfo.sourceTier) {
          return {
            ...tier,
            images: tier.images.filter((img) => img.id !== dragInfo.imageId),
          };
        }
        return tier;
      }),
    );

    // Ajouter l'image aux non classées
    setUnclassifiedImages((prev) => [...prev, imageCopy]);

    // Réinitialiser les états
    setDragInfo(null);
    setDropTarget(null);
    setIsDropTargetUnclassified(false);

    // Mettre à jour l'image principale si nécessaire
    if (mainImage === dragInfo.imageId) {
      // Trouver une autre image à définir comme principale
      for (const tier of tierList) {
        if (tier.id !== dragInfo.sourceTier && tier.images.length > 0) {
          const firstImageId = tier.images[0].id;
          if (firstImageId !== dragInfo.imageId) {
            setMainImage(firstImageId);
            return;
          }
        }
      }

      // Si aucune autre image n'est trouvée dans les tiers, utiliser une autre image non classée
      if (unclassifiedImages.length > 0) {
        const nonDraggedImage = unclassifiedImages.find(
          (img) => img.id !== dragInfo.imageId,
        );
        if (nonDraggedImage) {
          setMainImage(nonDraggedImage.id);
        } else {
          setMainImage(null);
        }
      } else {
        setMainImage(null);
      }
    }
  };

  // Gérer le double-clic pour retirer une image d'un tier
  const handleResetImage = (imageId: string, fromTierId: string) => {
    // Trouver le tier et l'image
    const tierIndex = tierList.findIndex((tier) => tier.id === fromTierId);
    if (tierIndex === -1) return;

    const imageIndex = tierList[tierIndex].images.findIndex(
      (img) => img.id === imageId,
    );
    if (imageIndex === -1) return;

    // Copier l'image pour éviter les problèmes de référence
    const imageToMove = JSON.parse(
      JSON.stringify(tierList[tierIndex].images[imageIndex]),
    );

    // Mettre à jour les états
    setTierList((prev) => {
      const newTierList = [...prev];
      newTierList[tierIndex] = {
        ...newTierList[tierIndex],
        images: newTierList[tierIndex].images.filter(
          (img) => img.id !== imageId,
        ),
      };
      return newTierList;
    });

    setUnclassifiedImages((prev) => [...prev, imageToMove]);

    // Mettre à jour l'image principale si nécessaire
    if (mainImage === imageId) {
      // Trouver une autre image à définir comme principale
      for (const tier of tierList) {
        if (tier.id !== fromTierId && tier.images.length > 0) {
          setMainImage(tier.images[0].id);
          return;
        }
      }

      // Si aucune autre image n'est trouvée dans les tiers, utiliser la première non classée (s'il y en a)
      if (unclassifiedImages.length > 0) {
        setMainImage(unclassifiedImages[0].id);
      } else {
        setMainImage(null);
      }
    }
  };

  // Réinitialiser toutes les images
  const handleResetAll = () => {
    if (
      window.confirm(
        "Êtes-vous sûr de vouloir réinitialiser toutes les images ? Cette action ne peut pas être annulée.",
      )
    ) {
      // Collecter toutes les images des tiers
      const allImages: Image[] = [];
      tierList.forEach((tier) => {
        allImages.push(...tier.images);
      });

      // Réinitialiser les tiers mais conserver les noms et couleurs personnalisés
      const newTierList = [...tierList].map((tier) => ({
        ...tier,
        images: [],
      }));

      setTierList(newTierList);
      setUnclassifiedImages([...unclassifiedImages, ...allImages]);
    }
  };

  // Ajouter un nouveau tier
  const handleAddTier = () => {
    // Vérifier la limite de 15 tiers
    if (tierList.length >= 15) {
      alert("Vous avez atteint la limite maximale de 15 tiers.");
      return;
    }

    const newId = `tier${tierList.length + 1}_${Date.now()}`;
    const newTier: Tier = {
      id: newId,
      name: `Tier ${tierList.length + 1}`,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // Couleur aléatoire
      images: [],
    };

    setTierList((prev) => [...prev, newTier]);
  };

  const handleDeleteTierlist = async () => {
    // Demander confirmation avant de supprimer
    if (
      !window.confirm(
        "Êtes-vous sûr de vouloir supprimer définitivement cette tierlist ? Cette action ne peut pas être annulée.",
      )
    ) {
      return;
    }

    if (!tierlistId) {
      alert("Impossible de supprimer: ID de tierlist manquant.");
      return;
    }

    try {
      setIsSaving(true); // Utiliser le même indicateur de chargement

      // Utiliser la fonction du service pour supprimer la tierlist
      await tierlistService.deleteTierlist(parseInt(tierlistId));

      // Nettoyer le cache local
      clearSavedState();
      localStorage.removeItem("tierlistImages");

      // Informer l'utilisateur et rediriger
      alert("Tierlist supprimée avec succès");
      navigate("/profile"); // Redirection vers la page de profil ou une autre page appropriée
    } catch (error) {
      console.error("Erreur lors de la suppression de la tierlist:", error);
      alert(
        "Une erreur est survenue lors de la suppression. Veuillez réessayer.",
      );
    } finally {
      setIsSaving(false);
    }
  };
  const handleDeleteTier = (tierId: string) => {
    // Vérifier s'il reste au moins 1 tier
    if (tierList.length <= 1) {
      alert("Vous devez conserver au moins un tier.");
      return;
    }

    // Confirmer la suppression
    if (
      !window.confirm(
        "Êtes-vous sûr de vouloir supprimer ce tier ? Toutes les images qu'il contient seront déplacées vers les images non classées.",
      )
    ) {
      return;
    }

    // Trouver le tier à supprimer
    const tierToDelete = tierList.find((tier) => tier.id === tierId);
    if (!tierToDelete) return;

    // Récupérer les images du tier à supprimer
    const imagesToMove = [...tierToDelete.images];

    // Mettre à jour la liste des tiers (supprimer le tier)
    setTierList((prev) => prev.filter((tier) => tier.id !== tierId));

    // Déplacer les images vers les non classées
    if (imagesToMove.length > 0) {
      setUnclassifiedImages((prev) => [...prev, ...imagesToMove]);
    }

    // Fermer le mode édition si nécessaire
    if (editingTierId === tierId) {
      setEditingTierId(null);
    }
  };

  // Sauvegarder la tierlist
  // Fonction de sauvegarde corrigée
  // 1. Modification de la fonction de sauvegarde pour rediriger vers la page d'édition
  const handleSaveTierlist = async () => {
    // Vérifier que le nom n'est pas vide
    if (!tierlistName.trim()) {
      alert("Veuillez donner un nom à votre tierlist.");
      return;
    }

    setIsSaving(true);

    try {
      // Convertir les données pour l'API
      const albumIdInt = parseInt(albumId);
      if (isNaN(albumIdInt)) {
        throw new Error("ID d'album invalide");
      }

      // Préparation des données pour la tierlist
      const tierlistData = {
        name: tierlistName.trim(),
        description: tierlistDescription?.trim() || null,
        private: !isPublic,
        id_album: albumIdInt,
      };

      // Vérification supplémentaire des données
      if (!tierlistData.name) {
        throw new Error("Le nom de la tierlist ne peut pas être vide");
      }

      if (isNaN(tierlistData.id_album) || tierlistData.id_album <= 0) {
        throw new Error(
          `ID d'album invalide: ${albumId} (converti en ${tierlistData.id_album})`,
        );
      }

      console.log("Données de tierlist à sauvegarder:", tierlistData);

      // Préparer les lignes de tier pour l'API
      const tierLines = tierList.map((tier) => ({
        label: tier.name.trim(),
        placement: tierList.indexOf(tier) + 1, // Ordre basé sur l'index, commençant à 1
        color: tier.color.replace("#", ""), // Retirer le # du code couleur
        images: tier.images.map((img, imgIndex) => ({
          id: img.id,
          id_image: parseInt(img.id),
          placement: imgIndex + 1, // Ordre basé sur l'index, commençant à 1
          disable: false,
        })),
      }));

      console.log("Structure des tiers à sauvegarder:", tierLines);
      console.log("Images non classées:", unclassifiedImages.length);

      let tierlistIdResult;

      // Mode mise à jour ou création
      if (isEditMode && tierlistId) {
        // Mettre à jour la tierlist existante
        tierlistIdResult = await tierlistService.updateCompleteTierlist(
          parseInt(tierlistId),
          tierlistData,
          tierLines,
          unclassifiedImages,
        );

        // Afficher le succès et rester sur la même page
        alert("Tierlist mise à jour avec succès!");
        // Ne pas rediriger, on reste sur la page d'édition
      } else {
        // Créer une nouvelle tierlist
        tierlistIdResult = await tierlistService.saveTierlist(
          tierlistData,
          tierLines,
          unclassifiedImages,
        );

        // Effacer les données sauvegardées localement
        clearSavedState();

        // Supprimer aussi le cache de sélection d'image
        localStorage.removeItem("tierlistImages");

        // Afficher le succès
        alert("Tierlist sauvegardée avec succès!");

        // Rediriger vers la page d'édition au lieu de la visualisation
        navigate(`/tierlists/edit/${tierlistIdResult}`);
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de la tierlist:", error);
      alert(
        "Une erreur est survenue lors de la sauvegarde. Veuillez réessayer.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Revenir à la sélection d'images
  const handleCancel = () => {
    if (
      window.confirm(
        "Êtes-vous sûr de vouloir annuler ? Vos modifications seront perdues.",
      )
    ) {
      // Nettoyer les données sauvegardées
      clearSavedState();
      // Rediriger vers la page d'albums
      navigate("/allalbum");
    }
  };

  // Fermer le modal d'information
  const closeInfoModal = () => {
    setShowInfoModal(false);
    localStorage.setItem("tierListInfoModalShown", "true");
  };

  // Basculer l'affichage de la barre latérale
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <div className="tierlist-editor">
      {/* En-tête compact avec les informations essentielles */}
      <div className="tierlist-compact-header">
        <div className="tierlist-title">
          <h1>
            {tierlistName ||
              (isEditMode ? "Modifier la Tierlist" : "Nouvelle Tierlist")}
          </h1>
          <button
            className="edit-info-button"
            onClick={toggleSidebar}
            title="Modifier les informations"
          >
            ✎
          </button>
        </div>

        <div className="tierlist-actions">
          <button
            className="add-tier-button"
            onClick={handleAddTier}
            disabled={tierList.length >= 15}
            title={
              tierList.length >= 15
                ? "Limite de 15 tiers atteinte"
                : "Ajouter un nouveau tier"
            }
          >
            Ajouter Tier ({tierList.length}/15)
          </button>
          <button className="reset-button" onClick={handleResetAll}>
            Réinitialiser
          </button>
          {isEditMode && (
            <button
              className="cancel-button" // Réutilisation du style cancel-button pour le bouton de suppression
              onClick={handleDeleteTierlist}
              disabled={isSaving}
              style={{ backgroundColor: "#e74c3c", color: "white" }} // Juste une petite personnalisation pour le distinguer
            >
              {isSaving ? "Suppression..." : "Supprimer"}
            </button>
          )}
          <button
            className="save-button"
            onClick={handleSaveTierlist}
            disabled={isSaving || !tierlistName.trim()}
          >
            {isSaving
              ? "Sauvegarde en cours..."
              : isEditMode
                ? "Mettre à jour"
                : "Sauvegarder"}
          </button>
          <button
            className="cancel-button"
            onClick={handleCancel}
            disabled={isSaving}
          >
            Annuler
          </button>
        </div>
      </div>
      {/* Modal d'information sur l'utilisation */}
      {showInfoModal && (
        <div className="info-modal-overlay">
          <div className="info-modal-content">
            <h2>Comment utiliser l'éditeur de Tierlist</h2>
            <div className="info-content">
              <p>Bienvenue dans l'éditeur de Tierlist de TierHub!</p>
              <ul>
                <li>
                  <strong>Glisser-déposer</strong> : Faites glisser les images
                  vers les tiers de votre choix
                </li>
                <li>
                  <strong>Double-clic</strong> : Double-cliquez sur une image
                  pour la retirer d'un tier
                </li>
                <li>
                  <strong>Personnalisation</strong> : Cliquez sur le nom d'un
                  tier pour changer son nom et sa couleur
                </li>
                <li>
                  <strong>Réorganisation</strong> : Utilisez les flèches ↑↓ pour
                  monter ou descendre un tier
                </li>
                <li>
                  <strong>Ajout/Suppression</strong> : Utilisez les boutons pour
                  ajouter ou supprimer des tiers
                </li>
              </ul>
              <p>
                N'oubliez pas de remplir les informations et de sauvegarder
                votre tierlist!
              </p>
              <p>
                <strong>Note</strong>: Votre travail est automatiquement
                sauvegardé toutes les 5 secondes. Vous pouvez recharger la page
                sans perdre vos modifications.
              </p>
            </div>
            <button className="info-close-btn" onClick={closeInfoModal}>
              Commencer
            </button>
          </div>
        </div>
      )}

      {/* Modal pour afficher les détails d'une image */}
      <ImageDetailsModal
        isOpen={imageDetailsModalOpen}
        onClose={closeImageDetailsModal}
        image={selectedImageDetails}
      />
      {/* Barre latérale pour les informations détaillées (cachée par défaut) */}
      <div className={`tierlist-sidebar ${showSidebar ? "active" : ""}`}>
        <div className="sidebar-header">
          <h2>Informations de la Tierlist</h2>
          <button className="close-sidebar" onClick={toggleSidebar}>
            ×
          </button>
        </div>
        <div className="sidebar-content">
          <div className="form-group">
            <label htmlFor="tierlist-name">Nom de la Tierlist</label>
            <input
              type="text"
              id="tierlist-name"
              value={tierlistName}
              onChange={(e) => setTierlistName(e.target.value)}
              placeholder="Donnez un nom à votre tierlist"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="tierlist-description">
              Description (optionnelle)
            </label>
            <textarea
              id="tierlist-description"
              value={tierlistDescription}
              onChange={(e) => setTierlistDescription(e.target.value)}
              placeholder="Décrivez votre tierlist..."
              rows={4}
            />
          </div>

          <div className="form-group privacy-setting">
            <label>Confidentialité</label>
            <div className="privacy-toggle">
              <span className={!isPublic ? "active" : ""}>Privé</span>
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
            <h3>Aide</h3>
            <ul>
              <li>Glissez les images vers les tiers souhaités</li>
              <li>Double-cliquez sur une image pour la retirer</li>
              <li>
                Vous pouvez aussi faire glisser une image vers la zone "Images
                non classées"
              </li>
              <li>Cliquez sur le nom d'un tier pour le modifier</li>
              <li>Utilisez les flèches pour réordonner les tiers</li>
              <li>
                <strong>Sauvegarde auto</strong>: Votre travail est
                automatiquement sauvegardé toutes les 5 secondes
              </li>
            </ul>
          </div>

          <button
            className="sidebar-save-button"
            onClick={handleSaveTierlist}
            disabled={isSaving || !tierlistName.trim()}
          >
            {isSaving
              ? "Sauvegarde en cours..."
              : isEditMode
                ? "Mettre à jour la Tierlist"
                : "Sauvegarder la Tierlist"}
          </button>
        </div>
      </div>

      {/* Zone principale avec la TierList */}
      <div
        className={`tierlist-main-content ${showSidebar ? "with-sidebar" : ""}`}
      >
        <div className="tiers-container">
          {tierList.map((tier, index) => (
            <div
              key={tier.id}
              className="tier"
              onDragOver={(e) => handleTierDragOver(e, tier.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, tier.id)}
            >
              {/* Contrôles de déplacement du tier */}
              <div className="tier-controls">
                <button
                  className="tier-move-button up"
                  onClick={() => moveTierUp(tier.id)}
                  disabled={index === 0}
                  title="Monter ce tier"
                >
                  ↑
                </button>
                <button
                  className="tier-move-button down"
                  onClick={() => moveTierDown(tier.id)}
                  disabled={index === tierList.length - 1}
                  title="Descendre ce tier"
                >
                  ↓
                </button>
              </div>

              {editingTierId === tier.id ? (
                <div
                  className="tier-label-edit"
                  style={{ backgroundColor: editFormData.color }}
                >
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditFormChange}
                    className="edit-name-input"
                    maxLength={37}
                    autoFocus
                  />
                  <input
                    type="color"
                    name="color"
                    value={editFormData.color}
                    onChange={handleEditFormChange}
                    className="edit-color-input"
                  />
                  <div className="edit-buttons">
                    <button
                      onClick={handleSaveTier}
                      className="save-button"
                      title="Sauvegarder"
                    >
                      ✓
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="cancel-button"
                      title="Annuler"
                    >
                      ✕
                    </button>
                    <button
                      onClick={() => handleDeleteTier(tier.id)}
                      className="delete-button"
                      title="Supprimer tier"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="tier-label"
                  style={{ backgroundColor: tier.color }}
                  onClick={() => handleEditTier(tier)}
                >
                  {formatTierName(tier.name).split('\n').map((line, index) => (
                    <div key={index} className="tier-name-line">{line}</div>
                  ))}
                </div>
              )}

              <div
                className="tier-content"
                onDragOver={(e) => handleTierDragOver(e, tier.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, tier.id)}
              >
                {tier.images.map((image) => (
                  <div
                    key={image.id}
                    className={`tier-image ${
                      dropTarget?.imageId === image.id
                        ? `drop-indicator drop-${dropTarget.position}`
                        : ""
                    }`}
                    draggable
                    onDragStart={(e) =>
                      handleDragStart(
                        e,
                        image.id,
                        tier.id,
                        tier.images.indexOf(image),
                      )
                    }
                    onDragOver={(e) => handleDragOver(e, tier.id, image.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, tier.id, image.id)}
                    onDoubleClick={() => handleResetImage(image.id, tier.id)}
                    onClick={() => openImageDetailsModal(image)}
                    title={`${image.name} (Double-cliquez pour retirer)`}
                  >
                    <img src={image.src} alt={image.alt} />
                    <div className="image-name">{image.name}</div>
                  </div>
                ))}
                {tier.images.length === 0 && (
                  <div className="empty-tier-message">
                    Glissez des images ici
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div
          className={`unclassified-container ${isDropTargetUnclassified ? "drop-target" : ""}`}
          onDragOver={handleUnclassifiedDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDropToUnclassified}
        >
          <h3>Images non classées</h3>
          <div className="unclassified-images">
            {unclassifiedImages.length > 0 ? (
              unclassifiedImages.map((image) => (
                <div
                  key={image.id}
                  className="tier-image"
                  draggable
                  onDragStart={(e) =>
                    handleDragStart(
                      e,
                      image.id,
                      "unclassified",
                      unclassifiedImages.indexOf(image),
                    )
                  }
                  onClick={() => openImageDetailsModal(image)}
                  title={`${image.name} (Glissez dans un tier)`}
                >
                  <img src={image.src} alt={image.alt} />
                  <div className="image-name">{image.name}</div>
                </div>
              ))
            ) : (
              <div className="empty-unclassified-message">
                Toutes les images sont classées!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TierListEditor;
