/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AddAlbum.css";
import ImageEditModal from "../components/ImageEditModal";
import albumService from "../services/albumService";

interface AddAlbumProps {
  user: string | null;
}

interface UploadedImage {
  file: File;
  previewUrl: string;
  name: string;
  description: string;
  url: string;
  isEditingName: boolean;
}

// Constante pour la limite de caractères du nom d'image
const IMAGE_NAME_MAX_LENGTH = 25;

const AddAlbum: React.FC<AddAlbumProps> = ({ user }) => {
  const navigate = useNavigate();
  
  // États principaux du formulaire
  const [name, setName] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  
  // États pour l'interface utilisateur
  const [isDragging, setIsDragging] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [totalImages, setTotalImages] = useState(0);
  
  // États pour le modal d'édition d'image
  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  
  // Données des catégories disponibles
  const [availableCategories, setAvailableCategories] = useState<string[]>([
    "Films", "Animation", "Manga", "Jeux Vidéo", "Musique", "Sport", "Autres"
  ]);

  // Redirection si non connecté
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    // Charger les catégories disponibles depuis l'API
    const loadCategories = async () => {
      try {
        const categories = await albumService.getCategories();
        setAvailableCategories(categories.map(cat => cat.name));
      } catch (error) {
        console.warn("Impossible de charger les catégories:", error);
        // Garder les catégories par défaut en cas d'erreur
      }
    };
    
    loadCategories();
  }, [user, navigate]);

  // Fonction utilitaire : extraire le nom du fichier sans l'extension
  const getFileNameWithoutExtension = (fileName: string): string => {
    return fileName.replace(/\.[^/.]+$/, "");
  };
  
  // Fonction utilitaire : formater le nom de fichier pour qu'il soit présentable
  const formatFileName = (fileName: string): string => {
    // Supprimer l'extension
    let formatted = getFileNameWithoutExtension(fileName);
    
    // Remplacer les underscores et tirets par des espaces
    formatted = formatted.replace(/[_-]/g, " ");
    
    // Mettre en majuscule la première lettre de chaque mot
    formatted = formatted.replace(/\b\w/g, char => char.toUpperCase());
    
    // Limiter la longueur du nom
    if (formatted.length > IMAGE_NAME_MAX_LENGTH) {
      formatted = formatted.substring(0, IMAGE_NAME_MAX_LENGTH);
    }
    
    return formatted;
  };

  // Gérer l'ajout d'images via le sélecteur de fichier
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      
      // Créer des objets UploadedImage pour chaque fichier
      const newImages: UploadedImage[] = fileArray.map(file => ({
        file,
        previewUrl: URL.createObjectURL(file),
        name: formatFileName(file.name),
        description: "",
        url: "",
        isEditingName: false
      }));
      
      setImages(prev => [...prev, ...newImages]);
    }
  };

  // Gérer le drag over pour la zone de drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // Gérer le drag leave pour la zone de drop
  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Gérer le drop d'images
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files) {
      const fileArray = Array.from(e.dataTransfer.files);
      
      // Filtrer pour ne garder que les fichiers image
      const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
      
      if (imageFiles.length === 0) {
        alert("Veuillez déposer uniquement des images.");
        return;
      }
      
      // Créer des objets UploadedImage pour chaque fichier
      const newImages: UploadedImage[] = imageFiles.map(file => ({
        file,
        previewUrl: URL.createObjectURL(file),
        name: formatFileName(file.name),
        description: "",
        url: "",
        isEditingName: false
      }));
      
      setImages(prev => [...prev, ...newImages]);
    }
  };

  // Supprimer une image
  const removeImage = (index: number) => {
    // Release object URL to avoid memory leaks
    URL.revokeObjectURL(images[index].previewUrl);
    
    // Remove image
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Ouvrir le modal d'édition d'image
  const openImageEditModal = (index: number) => {
    setSelectedImage(images[index]);
    setIsImageModalOpen(true);
  };

  // Éditer le nom d'une image directement dans la carte
  const startEditingImageName = (index: number) => {
    setImages(prev => 
      prev.map((img, i) => 
        i === index 
          ? { ...img, isEditingName: true } 
          : { ...img, isEditingName: false }
      )
    );
  };

  // Mettre à jour le nom d'une image pendant l'édition
  const updateImageName = (index: number, newName: string) => {
    // Limiter la longueur du nom lors de la saisie
    if (newName.length <= IMAGE_NAME_MAX_LENGTH) {
      setImages(prev => 
        prev.map((img, i) => 
          i === index 
            ? { ...img, name: newName } 
            : img
        )
      );
    }
  };

  // Terminer l'édition du nom d'une image
  const finishEditingImageName = (index: number) => {
    setImages(prev => 
      prev.map((img, i) => 
        i === index 
          ? { ...img, isEditingName: false } 
          : img
      )
    );
  };

  // Sauvegarder les modifications d'une image depuis le modal
  const saveImageChanges = (updatedImage: any) => {
    setImages(prev => 
      prev.map(img => 
        img.previewUrl === updatedImage.previewUrl 
          ? updatedImage 
          : img
      )
    );
  };

  // Gérer la sélection/désélection d'une catégorie
  const handleCategoryClick = (category: string) => {
    // Check if category is already selected
    if (selectedCategories.includes(category)) {
      // Remove category
      setSelectedCategories(prev => prev.filter(cat => cat !== category));
    } else {
      // Add category if less than 3 are selected
      if (selectedCategories.length < 3) {
        setSelectedCategories(prev => [...prev, category]);
      } else {
        // Si plus de 3 catégories, afficher un message d'information
        alert("Vous ne pouvez sélectionner que 3 catégories maximum.");
      }
    }
  };

  // Valider le formulaire avant soumission
  const validateForm = (): boolean => {
    const errors: string[] = [];
    
    if (!name.trim()) {
      errors.push("Le nom de l'album est requis");
    }
    
    if (selectedCategories.length === 0) {
      errors.push("Veuillez sélectionner au moins une catégorie");
    }
    
    if (images.length === 0) {
      errors.push("Veuillez ajouter au moins une image");
    }
    
    // Vérifiez que toutes les images ont un nom
    const emptyNameIndex = images.findIndex(img => !img.name.trim());
    if (emptyNameIndex !== -1) {
      errors.push(`L'image ${emptyNameIndex + 1} n'a pas de nom`);
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Soumettre le formulaire pour créer l'album et ajouter les images
// Soumettre le formulaire pour créer l'album et ajouter les images
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Valider le formulaire
  if (!validateForm()) {
    // Faire défiler jusqu'aux erreurs
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  
  try {
    setIsSubmitting(true);
    setCurrentProgress(0);
    setTotalImages(images.length);
    
    // 1. Créer l'album via le service
    const albumData = {
      name,
      status: (isPublic ? "public" : "private") as "public" | "private",
      description
    };
    
    const albumResponse = await albumService.createAlbum(albumData);
    
    if (!albumResponse || !albumResponse.data) {
      throw new Error("La création de l'album a échoué");
    }
    
    const albumId = albumResponse.data.id;
    
    // 2. Ajouter les images séquentiellement
    let processedImages = 0;
    
    for (const image of images) {
      try {
        // Préparer les données pour chaque image
        const imageData = {
          file: image.file,
          name: image.name,
          description: image.description,
          url: image.url,
          id_album: albumId
        };
        
        // Attendre que la requête précédente soit terminée avant d'envoyer la suivante
        await albumService.addImageToAlbum(imageData);
      } catch (imageError) {
        console.error(`Erreur lors de l'ajout de l'image ${image.name}:`, imageError);
        // Continuer avec les autres images même si une échoue
      } finally {
        // Mettre à jour la progression dans tous les cas
        processedImages++;
        setCurrentProgress(processedImages);
      }
    }
    
    // 3. Essayer d'ajouter les catégories à l'album
    try {
      // Utiliser directement les noms des catégories sélectionnées
      if (selectedCategories.length > 0) {
        await albumService.addCategoriesToAlbum(albumId, selectedCategories);
      }
    } catch (categoryError) {
      console.warn("Erreur lors de l'ajout des catégories:", categoryError);
      // On continue même si l'ajout des catégories échoue
    }
    
    // Afficher le message de succès
    alert("Album créé avec succès !");
    
    // Rediriger vers la page d'accueil
    navigate("/");
    
  } catch (error) {
    console.error("Erreur lors de la création de l'album:", error);
    alert("Une erreur est survenue lors de la création de l'album. Veuillez réessayer.");
  } finally {
    setIsSubmitting(false);
  }
};

  // Annuler et retourner à la page d'accueil
  const handleCancel = () => {
    // Nettoyer les URL des images avant de quitter
    images.forEach(image => {
      URL.revokeObjectURL(image.previewUrl);
    });
    
    navigate("/");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="add-album-container">
      <h1 className="add-album-title">Ajouter un Album</h1>
      
      {/* Affichage des erreurs de validation */}
      {validationErrors.length > 0 && (
        <div className="validation-errors">
          <h3>Veuillez corriger les erreurs suivantes :</h3>
          <ul>
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Barre de progression pendant la soumission */}
      {isSubmitting && (
        <div className="submission-progress">
          <p>Création de l'album en cours... ({currentProgress}/{totalImages} images)</p>
          <div className="progress-bar-container">
            <div 
              className="progress-bar" 
              style={{ width: `${(currentProgress / totalImages) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
      
      <form className="add-album-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Nom de l'album</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Films Marvel, Personnages de Naruto..."
            required
            disabled={isSubmitting}
          />
        </div>
        
        <div className="form-group privacy-setting">
          <label>Visibilité</label>
          <div className="privacy-toggle">
            <span className={!isPublic ? 'active' : ''}>Privé</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={() => setIsPublic(!isPublic)}
                disabled={isSubmitting}
              />
              <span className="slider"></span>
            </label>
            <span className={isPublic ? 'active' : ''}>Public</span>
          </div>
        </div>
        
        <div className="form-group">
          <label>Catégories (maximum 3)</label>
          <div className="category-selection-area">
            <div className="category-options">
              {availableCategories.map((category, index) => (
                <div
                  key={index}
                  className={`category-option ${selectedCategories.includes(category) ? 'selected' : ''}`}
                  onClick={() => !isSubmitting && handleCategoryClick(category)}
                >
                  {category}
                </div>
              ))}
            </div>
            
            <div className="selected-categories">
              {selectedCategories.length > 0 ? (
                selectedCategories.map((category, index) => (
                  <div key={index} className="selected-category">
                    {category}
                  </div>
                ))
              ) : (
                <div className="no-categories">Aucune catégorie sélectionnée</div>
              )}
            </div>
          </div>
        </div>
        
        <div className="form-group">
          <label>Images</label>
          <div 
            className={`drop-zone ${isDragging ? 'active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <p>Glissez vos images ici ou</p>
            <label className="file-input-label" htmlFor="file-input">
              Parcourir
            </label>
            <input
              type="file"
              id="file-input"
              onChange={handleImageChange}
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              disabled={isSubmitting}
            />
          </div>
          
          {/* Boutons d'action (uniquement au-dessus de la galerie d'images) */}
          {images.length > 0 && (
            <div className="form-actions-top">
              <div className="images-count">
                <span>{images.length} image{images.length > 1 ? 's' : ''} sélectionnée{images.length > 1 ? 's' : ''}</span>
              </div>
              
              <div className="action-buttons">
                <button 
                  type="button" 
                  className="cancel-btn" 
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Création en cours..." : "Créer l'Album"}
                </button>
              </div>
            </div>
          )}
          
          {/* Galerie d'images avec noms modifiables */}
          {images.length > 0 && (
            <div className="image-previews">
              {images.map((image, index) => (
                <div key={index} className="preview-container">
                  <img 
                    src={image.previewUrl} 
                    alt={`Preview ${index + 1}`} 
                    className="image-preview" 
                  />
                  
                  {/* Nom modifiable de l'image */}
                  <div className="image-name-container">
                    {image.isEditingName ? (
                      <input
                        type="text"
                        value={image.name}
                        onChange={(e) => updateImageName(index, e.target.value)}
                        onBlur={() => finishEditingImageName(index)}
                        onKeyDown={(e) => e.key === 'Enter' && finishEditingImageName(index)}
                        autoFocus
                        className="image-name-input"
                        maxLength={IMAGE_NAME_MAX_LENGTH}
                        disabled={isSubmitting}
                      />
                    ) : (
                      <div 
                        className="image-name" 
                        onClick={() => !isSubmitting && startEditingImageName(index)}
                        title="Cliquez pour modifier le nom"
                      >
                        {image.name || "Cliquez pour nommer cette image"}
                      </div>
                    )}
                  </div>
                  
                  <button 
                    type="button" 
                    className="remove-image"
                    onClick={() => !isSubmitting && removeImage(index)}
                    disabled={isSubmitting}
                  >
                    ×
                  </button>
                  
                  <button 
                    type="button" 
                    className="edit-image-name"
                    onClick={() => !isSubmitting && openImageEditModal(index)}
                    title="Modifier les détails"
                    disabled={isSubmitting}
                  >
                    ✎
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </form>
      
      {/* Modal d'édition d'image */}
      {selectedImage && (
        <ImageEditModal
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          image={selectedImage}
          onSave={saveImageChanges}
        />
      )}
    </div>
  );
};

export default AddAlbum;