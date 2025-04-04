import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/TierListEditor.css';

interface TierListEditorProps {
  user: string | null;
}

type Image = { 
  id: string; 
  src: string; 
  alt: string;
  name: string;
};

type Tier = {
  id: string;
  name: string;
  color: string;
  images: Image[];
};

type TierList = Tier[];

interface DragInfo {
  imageId: string;
  sourceTier: string | 'unclassified';
  sourceIndex: number;
}

const DEFAULT_TIERS = [
  { id: "tierS", name: "S", color: "#FF7F7F", images: [] },
  { id: "tierA", name: "A", color: "#FFBF7F", images: [] },
  { id: "tierB", name: "B", color: "#FFFF7F", images: [] },
  { id: "tierC", name: "C", color: "#7FFF7F", images: [] },
  { id: "tierD", name: "D", color: "#7F7FFF", images: [] },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TierListEditor: React.FC<TierListEditorProps> = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
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
    position: 'before' | 'after' | null;
    imageId: string | null;
  } | null>(null);
  const [editingTierId, setEditingTierId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({ name: '', color: '' });
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(true);
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [isDropTargetUnclassified, setIsDropTargetUnclassified] = useState<boolean>(false);
  
  // Chargement des données depuis URL ou localStorage
  useEffect(() => {
    // Récupérer les paramètres de l'URL
    const params = new URLSearchParams(location.search);
    const albumId = params.get('album');
    const imagesParam = params.get('images');
    const name = params.get('name');
    const mainImgParam = params.get('main'); // Récupérer l'image principale
    
    if (!albumId) {
      // Rediriger si paramètres manquants
      navigate('/allalbum');
      return;
    }
    
    // Définir l'ID de l'album
    setAlbumId(albumId);
    
    // Définir le nom initial de la tierlist
    if (name) {
      setTierlistName(name);
    }
    
    // Essayer de récupérer les images depuis les paramètres d'URL
    let selectedImageIds: string[] = [];
    
    if (imagesParam) {
      try {
        selectedImageIds = JSON.parse(imagesParam);
      } catch (error) {
        console.error("Erreur lors du parsing des images depuis l'URL:", error);
        // Fallback: essayer de récupérer depuis localStorage
        const storedImages = localStorage.getItem('tierlistImages');
        if (storedImages) {
          try {
            selectedImageIds = JSON.parse(storedImages);
          } catch (innerError) {
            console.error("Erreur lors du parsing des images depuis localStorage:", innerError);
          }
        }
      }
    } else {
      // Pas de paramètre URL, essayer localStorage
      const storedImages = localStorage.getItem('tierlistImages');
      if (storedImages) {
        try {
          selectedImageIds = JSON.parse(storedImages);
        } catch (innerError) {
          console.error("Erreur lors du parsing des images depuis localStorage:", innerError);
        }
      }
    }
    
    if (selectedImageIds.length === 0) {
      // Si toujours pas d'images, rediriger
      navigate('/allalbum');
      return;
    }
    
    // Créer un tableau d'images (à remplacer par des données réelles)
    const loadedImages: Image[] = selectedImageIds.map((id: string, index: number) => ({
      id,
      src: `/api/placeholder/150/150`, // Utiliser un placeholder pour l'artifact
      alt: `Image ${index + 1}`,
      name: `Image ${index + 1}`
    }));
    
    // Définir les images non classées
    setUnclassifiedImages(loadedImages);
    
    // Définir l'image principale si présente
    if (mainImgParam) {
      setMainImage(mainImgParam);
    } else if (loadedImages.length > 0) {
      // Sinon prendre la première image
      setMainImage(loadedImages[0].id);
    }
    
    // Nettoyer localStorage si nécessaire
    if (imagesParam) {
      localStorage.removeItem('tierlistImages');
    }
  }, [location, navigate]);

  // Fonction pour trouver une image par son ID
  const findImageById = (id: string): { image: Image; tier: string | 'unclassified'; index: number } | null => {
    // Chercher dans les images non classées
    const unclassifiedIndex = unclassifiedImages.findIndex(img => img.id === id);
    if (unclassifiedIndex !== -1) {
      return {
        image: unclassifiedImages[unclassifiedIndex],
        tier: 'unclassified',
        index: unclassifiedIndex
      };
    }

    // Chercher dans les tiers
    for (const tier of tierList) {
      const index = tier.images.findIndex(img => img.id === id);
      if (index !== -1) {
        return {
          image: tier.images[index],
          tier: tier.id,
          index
        };
      }
    }

    return null;
  };
  
  // Fonction pour déplacer un tier vers le haut
  const moveTierUp = (tierId: string) => {
    // Trouver l'index du tier à déplacer
    const tierIndex = tierList.findIndex(tier => tier.id === tierId);
    
    // Vérifier si on peut le déplacer vers le haut
    if (tierIndex <= 0) return;
    
    // Créer une copie du tableau des tiers
    const newTierList = [...tierList];
    
    // Échanger le tier avec celui au-dessus
    [newTierList[tierIndex], newTierList[tierIndex - 1]] = 
    [newTierList[tierIndex - 1], newTierList[tierIndex]];
    
    // Mettre à jour l'état
    setTierList(newTierList);
  };
  
  // Fonction pour déplacer un tier vers le bas
  const moveTierDown = (tierId: string) => {
    // Trouver l'index du tier à déplacer
    const tierIndex = tierList.findIndex(tier => tier.id === tierId);
    
    // Vérifier si on peut le déplacer vers le bas
    if (tierIndex >= tierList.length - 1) return;
    
    // Créer une copie du tableau des tiers
    const newTierList = [...tierList];
    
    // Échanger le tier avec celui en-dessous
    [newTierList[tierIndex], newTierList[tierIndex + 1]] = 
    [newTierList[tierIndex + 1], newTierList[tierIndex]];
    
    // Mettre à jour l'état
    setTierList(newTierList);
  };
  
  // Fonction pour commencer l'édition d'un tier
  const handleEditTier = (tier: Tier) => {
    setEditingTierId(tier.id);
    setEditFormData({
      name: tier.name,
      color: tier.color
    });
  };
  
  // Fonction pour sauvegarder les modifications d'un tier
  const handleSaveTier = () => {
    if (!editingTierId) return;
    
    // Vérifier si le nom n'est pas vide
    if (!editFormData.name.trim()) {
      alert("Le nom du tier ne peut pas être vide.");
      return;
    }
    
    setTierList(prev => 
      prev.map(tier => 
        tier.id === editingTierId 
          ? { ...tier, name: editFormData.name.trim(), color: editFormData.color }
          : tier
      )
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
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Commencer le drag and drop
  const handleDragStart = (e: React.DragEvent, imageId: string, sourceTier: string | 'unclassified', sourceIndex: number) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ imageId, sourceTier, sourceIndex }));
    setDragInfo({ imageId, sourceTier, sourceIndex });
  };

  // Gérer le survol d'une image cible
  const handleDragOver = (e: React.DragEvent, tierId: string, imageId?: string) => {
    e.preventDefault();
    
    if (!dragInfo) return;
    
    // Réinitialiser l'état de survol de la zone non classée
    setIsDropTargetUnclassified(false);
    
    // Déterminer si on est avant ou après l'image
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX;
    const middle = rect.left + rect.width / 2;
    const position = mouseX < middle ? 'before' : 'after';
    
    setDropTarget({
        tierId,
        position,
        imageId: imageId ?? null
      });
  };

  // Gérer le survol d'un tier vide
  const handleTierDragOver = (e: React.DragEvent, tierId: string) => {
    e.preventDefault();
    
    if (!dragInfo) return;
    
    // Réinitialiser l'état de survol de la zone non classée
    setIsDropTargetUnclassified(false);
    
    // Trouver le tier
    const tier = tierList.find(t => t.id === tierId);
    if (!tier) return;
    
    // Si on survole un tier vide, positionner à la fin
    if (tier.images.length === 0) {
      setDropTarget({
        tierId,
        position: null,
        imageId: null
      });
    }
  };
  
  // Gérer le survol de la zone des images non classées
  const handleUnclassifiedDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (!dragInfo || dragInfo.sourceTier === 'unclassified') return;
    
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
  const handleDrop = (e: React.DragEvent, targetTierId: string, targetImageId?: string) => {
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
    if (dragInfo.sourceTier === 'unclassified') {
      newUnclassifiedImages = newUnclassifiedImages.filter(img => img.id !== dragInfo.imageId);
    } else {
      // Trouver l'index du tier source
      const sourceTierIndex = newTierList.findIndex(tier => tier.id === dragInfo.sourceTier);
      if (sourceTierIndex !== -1) {
        // Filtrer l'image du tier source
        newTierList[sourceTierIndex].images = newTierList[sourceTierIndex].images.filter(
          img => img.id !== dragInfo.imageId
        );
      }
    }
    
    // 2. Trouver le tier cible
    const targetTierIndex = newTierList.findIndex(tier => tier.id === targetTierId);
    if (targetTierIndex === -1) {
      console.error("Tier cible non trouvé:", targetTierId);
      return;
    }
    
    // 3. Déterminer la position d'insertion
    if (targetImageId && dropTarget?.position) {
      const targetIndex = newTierList[targetTierIndex].images.findIndex(img => img.id === targetImageId);
      
      if (targetIndex !== -1) {
        // Calculer l'index d'insertion basé sur la position (avant/après)
        const insertIndex = dropTarget.position === 'after' ? targetIndex + 1 : targetIndex;
        
        // Insérer l'image à la bonne position
        newTierList[targetTierIndex].images.splice(insertIndex, 0, draggedImageInfo.image);
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
    
    if (!dragInfo || dragInfo.sourceTier === 'unclassified') return;
    
    // Récupérer les informations de l'image déplacée
    const draggedImageInfo = findImageById(dragInfo.imageId);
    if (!draggedImageInfo) {
      console.error("Image non trouvée:", dragInfo.imageId);
      return;
    }
    
    // Créer une copie de l'image à déplacer dans les non classées
    const imageCopy = { ...draggedImageInfo.image };
    
    // Retirer l'image du tier source
    setTierList(prev => 
      prev.map(tier => {
        if (tier.id === dragInfo.sourceTier) {
          return {
            ...tier,
            images: tier.images.filter(img => img.id !== dragInfo.imageId)
          };
        }
        return tier;
      })
    );
    
    // Ajouter l'image aux non classées
    setUnclassifiedImages(prev => [...prev, imageCopy]);
    
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
        const nonDraggedImage = unclassifiedImages.find(img => img.id !== dragInfo.imageId);
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
    const tierIndex = tierList.findIndex(tier => tier.id === fromTierId);
    if (tierIndex === -1) return;
    
    const imageIndex = tierList[tierIndex].images.findIndex(img => img.id === imageId);
    if (imageIndex === -1) return;
    
    // Copier l'image pour éviter les problèmes de référence
    const imageToMove = JSON.parse(JSON.stringify(tierList[tierIndex].images[imageIndex]));
    
    // Mettre à jour les états
    setTierList(prev => {
      const newTierList = [...prev];
      newTierList[tierIndex] = {
        ...newTierList[tierIndex],
        images: newTierList[tierIndex].images.filter(img => img.id !== imageId)
      };
      return newTierList;
    });
    
    setUnclassifiedImages(prev => [...prev, imageToMove]);
    
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
    if (window.confirm("Êtes-vous sûr de vouloir réinitialiser toutes les images ? Cette action ne peut pas être annulée.")) {
      // Collecter toutes les images des tiers
      const allImages: Image[] = [];
      tierList.forEach(tier => {
        allImages.push(...tier.images);
      });
      
      // Réinitialiser les tiers mais conserver les noms et couleurs personnalisés
      const newTierList = [...tierList].map(tier => ({ ...tier, images: [] }));
      
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
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`, // Couleur aléatoire
      images: []
    };
    
    setTierList(prev => [...prev, newTier]);
  };
  
  // Supprimer un tier
  const handleDeleteTier = (tierId: string) => {
    // Vérifier qu'on garde au moins 2 tiers
    if (tierList.length <= 2) {
      alert("Vous devez conserver au moins 2 tiers.");
      return;
    }
    
    const tierToDelete = tierList.find(tier => tier.id === tierId);
    if (!tierToDelete) return;
    
    // Récupérer toutes les images du tier à supprimer
    const imagesToRecover = [...tierToDelete.images];
    
    // Supprimer le tier
    setTierList(prev => prev.filter(tier => tier.id !== tierId));
    
    // Ajouter les images aux images non classées
    if (imagesToRecover.length > 0) {
      setUnclassifiedImages(prev => [...prev, ...imagesToRecover]);
    }
    
    // Fermer le formulaire d'édition
    setEditingTierId(null);
  };
  
  // Sauvegarder la tierlist
  const handleSaveTierlist = async () => {
    // Vérifier que le nom n'est pas vide
    if (!tierlistName.trim()) {
      alert("Veuillez donner un nom à votre tierlist.");
      return;
    }
    
    // Vérifier que toutes les images sont classées
    if (unclassifiedImages.length > 0) {
      if (!window.confirm("Il reste des images non classées. Êtes-vous sûr de vouloir continuer ?")) {
        return;
      }
    }
    
    setIsSaving(true);
    
    try {
      // Créer la structure de données pour l'API
      const tierlistData = {
        name: tierlistName,
        description: tierlistDescription,
        albumId,
        private: !isPublic,
        tiers: tierList.map(tier => ({
          name: tier.name,
          color: tier.color,
          images: tier.images.map(img => ({
            id: img.id,
            order: tier.images.indexOf(img)
          }))
        }))
      };
      
      // Simuler la sauvegarde (à remplacer par un appel à l'API réelle)
      console.log("Sauvegarde de la tierlist:", tierlistData);
      
      // Attendre un délai pour simuler l'appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Rediriger vers la page de la tierlist
      alert("Tierlist sauvegardée avec succès!");
      navigate("/tierlists");
      
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de la tierlist:", error);
      alert("Une erreur est survenue lors de la sauvegarde. Veuillez réessayer.");
    } finally {
      setIsSaving(false);
    }
  };
  
  // Revenir à la sélection d'images
  const handleCancel = () => {
    if (window.confirm("Êtes-vous sûr de vouloir annuler ? Vos modifications seront perdues.")) {
      // Rediriger vers la page d'albums
      navigate("/allalbum");
    }
  };
  
  // Fermer le modal d'information
  const closeInfoModal = () => {
    setShowInfoModal(false);
  };

  // Basculer l'affichage de la barre latérale
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <div className="tierlist-editor">
      {/* Modal d'information sur l'utilisation */}
      {showInfoModal && (
        <div className="info-modal-overlay">
          <div className="info-modal-content">
            <h2>Comment utiliser l'éditeur de Tierlist</h2>
            <div className="info-content">
              <p>Bienvenue dans l'éditeur de Tierlist de TierHub!</p>
              <ul>
                <li><strong>Glisser-déposer</strong> : Faites glisser les images vers les tiers de votre choix</li>
                <li><strong>Double-clic</strong> : Double-cliquez sur une image pour la retirer d'un tier</li>
                <li><strong>Personnalisation</strong> : Cliquez sur le nom d'un tier pour changer son nom et sa couleur</li>
                <li><strong>Réorganisation</strong> : Utilisez les flèches ↑↓ pour monter ou descendre un tier</li>
                <li><strong>Ajout/Suppression</strong> : Utilisez les boutons pour ajouter ou supprimer des tiers</li>
              </ul>
              <p>N'oubliez pas de remplir les informations et de sauvegarder votre tierlist!</p>
            </div>
            <button className="info-close-btn" onClick={closeInfoModal}>Commencer</button>
          </div>
        </div>
      )}
      
      {/* En-tête compact avec les informations essentielles */}
      <div className="tierlist-compact-header">
        <div className="tierlist-title">
          <h1>{tierlistName || "Nouvelle Tierlist"}</h1>
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
            title={tierList.length >= 15 ? "Limite de 15 tiers atteinte" : "Ajouter un nouveau tier"}
          >
            Ajouter Tier ({tierList.length}/15)
          </button>
          <button className="reset-button" onClick={handleResetAll}>
            Réinitialiser
          </button>
          <button 
            className="save-button" 
            onClick={handleSaveTierlist} 
            disabled={isSaving || !tierlistName.trim()}
          >
            {isSaving ? "Sauvegarde en cours..." : "Sauvegarder"}
          </button>
          <button className="cancel-button" onClick={handleCancel} disabled={isSaving}>
            Annuler
          </button>
        </div>
      </div>
      
      {/* Barre latérale pour les informations détaillées (cachée par défaut) */}
      <div className={`tierlist-sidebar ${showSidebar ? 'active' : ''}`}>
        <div className="sidebar-header">
          <h2>Informations de la Tierlist</h2>
          <button className="close-sidebar" onClick={toggleSidebar}>×</button>
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
            <label htmlFor="tierlist-description">Description (optionnelle)</label>
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
              <li>Glissez les images vers les tiers souhaités</li>
              <li>Double-cliquez sur une image pour la retirer</li>
              <li>Vous pouvez aussi faire glisser une image vers la zone "Images non classées"</li>
              <li>Cliquez sur le nom d'un tier pour le modifier</li>
              <li>Utilisez les flèches pour réordonner les tiers</li>
            </ul>
          </div>
          
          <button 
            className="sidebar-save-button" 
            onClick={handleSaveTierlist} 
            disabled={isSaving || !tierlistName.trim()}
          >
            {isSaving ? "Sauvegarde en cours..." : "Sauvegarder la Tierlist"}
          </button>
        </div>
      </div>
      
      {/* Zone principale avec la TierList */}
      <div className={`tierlist-main-content ${showSidebar ? 'with-sidebar' : ''}`}>
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
                <div className="tier-label-edit" style={{ backgroundColor: editFormData.color }}>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditFormChange}
                    className="edit-name-input"
                    maxLength={15}
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
                    <button onClick={handleSaveTier} className="save-button" title="Sauvegarder">✓</button>
                    <button onClick={handleCancelEdit} className="cancel-button" title="Annuler">✕</button>
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
                  {tier.name}
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
                        : ''
                    }`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, image.id, tier.id, tier.images.indexOf(image))}
                    onDragOver={(e) => handleDragOver(e, tier.id, image.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, tier.id, image.id)}
                    onDoubleClick={() => handleResetImage(image.id, tier.id)}
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
          className={`unclassified-container ${isDropTargetUnclassified ? 'drop-target' : ''}`}
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
                  onDragStart={(e) => handleDragStart(e, image.id, 'unclassified', unclassifiedImages.indexOf(image))}
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