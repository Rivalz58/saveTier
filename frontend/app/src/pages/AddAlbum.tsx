import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AddAlbum.css";

interface AddAlbumProps {
  user: string | null;
}

interface UploadedImage {
  file: File;
  previewUrl: string;
  name: string; // Ajout d'un champ pour stocker le nom modifiable de l'image
  isEditingName: boolean; // État pour savoir si l'utilisateur est en train d'éditer le nom
}

const categories = [
  "Films",
  "Animation",
  "Manga",
  "Jeux Vidéo",
  "Musique",
  "Sport",
  "Autres"
];

// Constante pour la limite de caractères du nom d'image
const IMAGE_NAME_MAX_LENGTH = 25;

const AddAlbum: React.FC<AddAlbumProps> = ({ user }) => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Extraire le nom du fichier sans l'extension
  const getFileNameWithoutExtension = (fileName: string): string => {
    // Supprimer l'extension
    return fileName.replace(/\.[^/.]+$/, "");
  };
  
  // Formater le nom de fichier pour qu'il soit présentable
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      
      // Créer des objets UploadedImage pour chaque fichier
      const newImages: UploadedImage[] = fileArray.map(file => ({
        file,
        previewUrl: URL.createObjectURL(file),
        name: formatFileName(file.name),
        isEditingName: false
      }));
      
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files) {
      const fileArray = Array.from(e.dataTransfer.files);
      
      // Créer des objets UploadedImage pour chaque fichier
      const newImages: UploadedImage[] = fileArray.map(file => ({
        file,
        previewUrl: URL.createObjectURL(file),
        name: formatFileName(file.name),
        isEditingName: false
      }));
      
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    // Release object URL to avoid memory leaks
    URL.revokeObjectURL(images[index].previewUrl);
    
    // Remove image
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Commencer à éditer le nom d'une image
  const startEditingImageName = (index: number) => {
    setImages(prev => 
      prev.map((img, i) => 
        i === index 
          ? { ...img, isEditingName: true } 
          : { ...img, isEditingName: false }
      )
    );
  };

  // Mettre à jour le nom d'une image
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

  const handleCategoryClick = (category: string) => {
    // Check if category is already selected
    if (selectedCategories.includes(category)) {
      // Remove category
      setSelectedCategories(prev => prev.filter(cat => cat !== category));
    } else {
      // Add category if less than 3 are selected
      if (selectedCategories.length < 3) {
        setSelectedCategories(prev => [...prev, category]);
      }
      // Si plus de 3 catégories, ne rien faire (pas d'alerte)
    }
  };

  // Valider le formulaire
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Valider le formulaire
    if (!validateForm()) {
      // Faire défiler jusqu'aux erreurs
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    // Préparer les données pour l'API
    const formData = {
      name,
      categories: selectedCategories,
      description,
      images: images.map(img => ({
        file: img.file,
        name: img.name
      }))
    };
    
    // Logs pour le développement
    console.log("Album à soumettre:", formData);
    
    // Dans une implémentation réelle, vous utiliseriez FormData pour les fichiers
    // const apiFormData = new FormData();
    // apiFormData.append('name', name);
    // selectedCategories.forEach(cat => apiFormData.append('categories[]', cat));
    // apiFormData.append('description', description);
    // images.forEach((img, index) => {
    //   apiFormData.append(`images[${index}][file]`, img.file);
    //   apiFormData.append(`images[${index}][name]`, img.name);
    // });
    
    // Afficher le message de succès
    alert("Album ajouté avec succès !");
    
    // Rediriger vers la page d'accueil
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
          />
        </div>
        
        <div className="form-group">
          <label>Catégories (maximum 3)</label>
          <div className="category-selection-area">
            <div className="category-options">
              {categories.map((category, index) => (
                <div
                  key={index}
                  className={`category-option ${selectedCategories.includes(category) ? 'selected' : ''}`}
                  onClick={() => handleCategoryClick(category)}
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
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez votre album..."
            rows={4}
          />
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
            />
          </div>
          
          {/* Boutons d'action (uniquement au-dessus de la galerie d'images) */}
          {images.length > 0 && (
            <div className="form-actions-top">
              <div className="images-count">
                <span>{images.length} image{images.length > 1 ? 's' : ''} sélectionnée{images.length > 1 ? 's' : ''}</span>
              </div>
              
              <div className="action-buttons">
                <button type="button" className="cancel-btn" onClick={() => navigate("/")}>
                  Annuler
                </button>
                <button type="submit" className="submit-btn">
                  Créer l'Album
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
                      />
                    ) : (
                      <div 
                        className="image-name" 
                        onClick={() => startEditingImageName(index)}
                        title="Cliquez pour modifier le nom"
                      >
                        {image.name || "Cliquez pour nommer cette image"}
                      </div>
                    )}
                  </div>
                  
                  <button 
                    type="button" 
                    className="remove-image"
                    onClick={() => removeImage(index)}
                  >
                    ×
                  </button>
                  
                  <button 
                    type="button" 
                    className="edit-image-name"
                    onClick={() => startEditingImageName(index)}
                    title="Modifier le nom"
                  >
                    ✎
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Les boutons du bas ont été supprimés pour éviter la duplication */}
      </form>
    </div>
  );
};

export default AddAlbum;