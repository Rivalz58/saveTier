/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/SetupItemSelection.css";
import albumAccessService from "../services/albumAccessService.ts";
/* eslint-disable @typescript-eslint/no-explicit-any */
interface SetupItemSelectionProps {
  user: string | null;
}

// Type pour représenter une image d'album
type AlbumImage = {
  id: string;
  src: string;
  title: string;
  description: string | null;
  url: string | null;
  selected: boolean;
};

// Type pour les données d'album récupérées
type AlbumData = {
  id: string;
  name: string;
  categories: string[];
  images: AlbumImage[];
  authorId: number;
  authorName: string;
};

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
  
  // États de chargement et d'erreur
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Récupérer les paramètres de l'URL et charger les données
  useEffect(() => {
    const loadAlbumData = async () => {
      try {
        // Récupérer le type de contenu et l'ID de l'album depuis l'URL
        const params = new URLSearchParams(location.search);
        const albumId = params.get('album');
        const type = params.get('type'); // tierlists, tournois, classements
        const name = params.get('name');
        
        if (!albumId || !type) {
          // Rediriger vers la page d'albums si les paramètres sont manquants
          setError("Paramètres manquants dans l'URL");
          setTimeout(() => navigate("/allalbum"), 2000);
          return;
        }
        
        // Définir le type de contenu
        setContentType(type);
        
        // Définir le nom du contenu s'il existe
        if (name) {
          setContentName(name);
        }
        
        // Vérifier l'accès à l'album
        const accessCheck = await albumAccessService.checkAlbumAccess(albumId);
        
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
        
        // Formater les données de l'album
        const formattedAlbum: AlbumData = {
          id: album.id.toString(),
          name: album.name,
          categories: album.categories.map(cat => cat.name),
          authorId: album.author.id,
          authorName: album.author.username,
          images: album.image.map(img => ({
            id: img.id.toString(),
            src: img.path_image,
            title: img.name,
            description: img.description,
            url: img.url,
            selected: true // Toutes les images sont sélectionnées par défaut
          }))
        };
        
        setAlbumData(formattedAlbum);
        setSelectedImages(formattedAlbum.images);
        
        // Définir la première image comme principale par défaut si elle existe
        if (formattedAlbum.images.length > 0) {
          setMainImage(formattedAlbum.images[0].id);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError("Une erreur est survenue lors du chargement des données");
        setLoading(false);
      }
    };
    
    loadAlbumData();
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
  
  // Si erreur, afficher le message
  if (error) {
    return (
      <div className="setup-container">
        <div className="setup-error">
          <h2>Erreur</h2>
          <p>{error}</p>
          <button onClick={handleCancel} className="setup-button">Retour</button>
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
            <div className="stat-item">
              <span className="stat-label">Créateur:</span>
              <span className="stat-value">{albumData.authorName}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Catégories:</span>
              <span className="stat-value">{albumData.categories.join(", ")}</span>
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
          <h3>Images disponibles ({albumData.images.length})</h3>
          {albumData.images.length === 0 ? (
            <p className="no-images-message">Cet album ne contient aucune image.</p>
          ) : (
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
                  <div className="image-title" title={image.description || ""}>{image.title}</div>
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
          )}
        </div>
      </div>
    </div>
  );
};

export default SetupItemSelection;