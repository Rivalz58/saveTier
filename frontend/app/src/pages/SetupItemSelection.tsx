import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/SetupItemSelection.css";

// Importation d'une image temporaire pour les tests
import filmsImage from "../assets/films.jpg";

interface SetupItemSelectionProps {
  user: string | null;
}

// Type pour représenter une image d'album
type AlbumImage = {
  id: string;
  src: string;
  title: string;
  selected: boolean;
};

// Type pour les données d'album récupérées
type AlbumData = {
  id: string;
  name: string;
  categories: string[];
  images: AlbumImage[];
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SetupItemSelection: React.FC<SetupItemSelectionProps> = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // État pour stocker les données de l'album
  const [albumData, setAlbumData] = useState<AlbumData | null>(null);
  
  // État pour stocker les images sélectionnées
  const [selectedImages, setSelectedImages] = useState<AlbumImage[]>([]);
  
  // État pour l'image principale (couverture)
  const [mainImage, setMainImage] = useState<string | null>(null);
  
  // État pour le type de contenu à créer (tierlists, tournois, classements)
  const [contentType, setContentType] = useState<string>("");
  
  // État pour le nom personnalisé
  const [contentName, setContentName] = useState<string>("");
  
  // État de chargement
  const [loading, setLoading] = useState<boolean>(true);
  
  // Récupérer les paramètres de l'URL et charger les données
  useEffect(() => {
    // Récupérer le type de contenu et l'ID de l'album depuis l'URL
    const params = new URLSearchParams(location.search);
    const albumId = params.get('album');
    const type = params.get('type'); // tierlists, tournois, classements
    const name = params.get('name');
    
    if (!albumId || !type) {
      // Rediriger vers la page d'albums si les paramètres sont manquants
      navigate("/allalbum");
      return;
    }
    
    // Définir le type de contenu
    setContentType(type);
    
    // Définir le nom du contenu s'il existe
    if (name) {
      setContentName(name);
    }
    
    // Simuler le chargement des données d'album depuis une API
    // Dans une application réelle, vous feriez un appel API ici
    setTimeout(() => {
      // Données fictives de l'album
      const mockAlbum: AlbumData = {
        id: albumId,
        name: "Album " + albumId,
        categories: ["Films", "Animation"],
        images: Array.from({ length: 20 }, (_, i) => ({
          id: `img-${i + 1}`,
          src: filmsImage, // Utiliser l'image importée pour tous les éléments
          title: `Image ${i + 1}`,
          selected: true // Toutes les images sont sélectionnées par défaut
        }))
      };
      
      setAlbumData(mockAlbum);
      setSelectedImages(mockAlbum.images);
      setMainImage(mockAlbum.images[0]?.id || null); // Définir la première image comme principale par défaut
      setLoading(false);
    }, 1000);
  }, [location, navigate]);
  
  // Basculer la sélection d'une image
  const toggleImageSelection = (imageId: string) => {
    if (!albumData) return;
    
    const updatedImages = albumData.images.map(img => 
      img.id === imageId ? { ...img, selected: !img.selected } : img
    );
    
    setAlbumData({
      ...albumData,
      images: updatedImages
    });
    
    setSelectedImages(updatedImages.filter(img => img.selected));
    
    // Si l'image principale est désélectionnée, mettre à jour mainImage
    if (mainImage === imageId && !updatedImages.find(img => img.id === imageId)?.selected) {
      const firstSelected = updatedImages.find(img => img.selected);
      setMainImage(firstSelected?.id || null);
    }
  };
  
  // Définir une image comme principale
  const setAsMainImage = (imageId: string) => {
    // Vérifier si l'image est sélectionnée
    if (albumData?.images.find(img => img.id === imageId)?.selected) {
      setMainImage(imageId);
    } else {
      // Si l'image n'est pas sélectionnée, l'activer d'abord
      toggleImageSelection(imageId);
      setMainImage(imageId);
    }
  };
  
  // Commencer la création
  const startCreation = () => {
    if (!albumData || !contentType || !mainImage || selectedImages.length === 0) {
      alert("Vous devez sélectionner au moins une image et définir une image principale!");
      return;
    }
    
    // Préparer les données pour la page suivante
    const selectedImageIds = selectedImages.map(img => img.id);
    
    // Rediriger vers la page de création correspondante avec les paramètres nécessaires
    if (contentType === 'tierlists') {
      // Pour les tierlists, rediriger vers le nouvel éditeur spécifique
      navigate(`/tierlists/create/editor?album=${albumData.id}&images=${JSON.stringify(selectedImageIds)}&main=${mainImage}&name=${encodeURIComponent(contentName)}`);
    } else {
      // Pour les autres types, utiliser la route générique
      navigate(`/${contentType}/create/editor?album=${albumData.id}&images=${JSON.stringify(selectedImageIds)}&main=${mainImage}&name=${encodeURIComponent(contentName)}`);
    }
  };
  
  // Annuler et retourner à la page précédente
  const handleCancel = () => {
    navigate(-1);
  };
  
  // Si en chargement, afficher un loader
  if (loading) {
    return (
      <div className="setup-container">
        <div className="setup-loader">
          <div className="spinner"></div>
          <p>Chargement de l'album...</p>
        </div>
      </div>
    );
  }
  
  // Si pas de données d'album, afficher un message d'erreur
  if (!albumData) {
    return (
      <div className="setup-container">
        <div className="setup-error">
          <h2>Erreur de chargement</h2>
          <p>Impossible de charger les données de l'album.</p>
          <button onClick={handleCancel} className="setup-button">Retour</button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="setup-container">
      <div className="setup-header">
        <h1>Préparer votre {
          contentType === 'tierlists' ? 'Tierlist' : 
          contentType === 'tournois' ? 'Tournoi' : 'Classement'
        }</h1>
        <p className="setup-description">
          Sélectionnez les images que vous souhaitez utiliser et choisissez une image principale 
          pour votre {
            contentType === 'tierlists' ? 'tierlist' : 
            contentType === 'tournois' ? 'tournoi' : 'classement'
          }.
        </p>
      </div>
      
      <div className="setup-content">
        <div className="setup-album-info">
          <h2>Album: {albumData.name}</h2>
          <div className="setup-stats">
            <div className="stat-item">
              <span className="stat-label">Images sélectionnées:</span>
              <span className="stat-value">{selectedImages.length} / {albumData.images.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Image principale:</span>
              <span className="stat-value">{mainImage ? albumData.images.find(img => img.id === mainImage)?.title : "Non définie"}</span>
            </div>
          </div>
          <div className="setup-actions">
            <button onClick={handleCancel} className="setup-button cancel">Annuler</button>
            <button 
              onClick={startCreation} 
              className="setup-button start"
              disabled={selectedImages.length === 0 || !mainImage}
            >
              Commencer la création
            </button>
          </div>
        </div>
        
        <div className="setup-images-container">
          <h3>Images disponibles</h3>
          <div className="setup-images-grid">
            {albumData.images.map((image) => (
              <div 
                key={image.id} 
                className={`setup-image-card ${image.selected ? 'selected' : ''} ${mainImage === image.id ? 'main-image' : ''}`}
              >
                <div className="image-container">
                  <img src={image.src} alt={image.title} />
                  {mainImage === image.id && (
                    <div className="main-image-badge">Image principale</div>
                  )}
                </div>
                <div className="image-title">{image.title}</div>
                <div className="image-actions">
                  <button 
                    className={`select-button ${image.selected ? 'selected' : ''}`}
                    onClick={() => toggleImageSelection(image.id)}
                  >
                    {image.selected ? 'Désélectionner' : 'Sélectionner'}
                  </button>
                  <button 
                    className={`main-button ${mainImage === image.id ? 'selected' : ''}`}
                    onClick={() => setAsMainImage(image.id)}
                    disabled={!image.selected && mainImage !== image.id}
                  >
                    Définir comme principale
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupItemSelection;