import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AddAlbum.css";

interface AddAlbumProps {
  user: string | null;
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

const AddAlbum: React.FC<AddAlbumProps> = ({ user }) => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Redirect if not logged in
  React.useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      
      // Create preview URLs
      const newPreviewUrls = fileArray.map(file => URL.createObjectURL(file));
      
      setImages(prev => [...prev, ...fileArray]);
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
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
      
      // Create preview URLs
      const newPreviewUrls = fileArray.map(file => URL.createObjectURL(file));
      
      setImages(prev => [...prev, ...fileArray]);
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };

  const removeImage = (index: number) => {
    // Release object URL to avoid memory leaks
    URL.revokeObjectURL(previewUrls[index]);
    
    // Remove image and preview
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
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
      } else {
        alert("Vous ne pouvez pas sélectionner plus de 3 catégories.");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérifier qu'au moins une catégorie est sélectionnée
    if (selectedCategories.length === 0) {
      alert("Veuillez sélectionner au moins une catégorie !");
      return;
    }
    
    // Normally you would upload the images and send the form data to your backend
    console.log("Album submitted:", { name, categories: selectedCategories, description, images });
    
    // Show success message
    alert("Album ajouté avec succès !");
    
    // Redirect to homepage
    navigate("/");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="add-album-container">
      <h1 className="add-album-title">Ajouter un Album</h1>
      
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
          
          {previewUrls.length > 0 && (
            <div className="image-previews">
              {previewUrls.map((url, index) => (
                <div key={index} className="preview-container">
                  <img 
                    src={url} 
                    alt={`Preview ${index + 1}`} 
                    className="image-preview" 
                  />
                  <button 
                    type="button" 
                    className="remove-image"
                    onClick={() => removeImage(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={() => navigate("/")}>
            Annuler
          </button>
          <button type="submit" className="submit-btn">
            Créer l'Album
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAlbum;