/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import "../styles/AlbumEditor.css";
import albumService, { AddImageRequest, AddImageResponse, ProcessImageResult } from "../services/albumService";
import imageService from "../services/imageService";
import ImageEditModal from "../components/ImageEditModal";

interface AlbumEditorProps {
  user: string | null;
  isAdmin?: boolean;
}

interface Image {
  id: number;
  name: string;
  description: string | null;
  url: string | null;
  path_image: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Album {
  id: number;
  name: string;
  status: 'public' | 'private' | 'quarantined';
  createdAt: string;
  updatedAt: string;
  categories: {
    id: number;
    name: string;
  }[];
  author: {
    id: number;
    username: string;
    nametag: string;
  };
  image: Image[];
}

interface ImageToEdit {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  description: string;
  url: string;
}

// Interface pour les informations des images en cours d'upload
interface UploadingImage {
  file: File;
  name: string;
  previewUrl: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  progress: number;
  errorMessage?: string;
}

const AlbumEditor: React.FC<AlbumEditorProps> = ({ user, isAdmin }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine if we're coming from admin panel based on location.state or path
  const isFromAdmin = Boolean(location.state?.fromAdmin) || isAdmin || location.pathname.includes('admin');

  // Album state
  const [album, setAlbum] = useState<Album | null>(null);
  const [albumName, setAlbumName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isNameEditing, setIsNameEditing] = useState(false);

  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImageDeleteModal, setShowImageDeleteModal] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<Image | null>(null);
  
  // Image edit modal
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageToEdit | null>(null);

  // New image upload
  const [newImages, setNewImages] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState<UploadingImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // État pour les résultats d'upload
  const [uploadResults, setUploadResults] = useState<{
    successful: number;
    failed: number;
    failedImages: {name: string, reason: string}[];
  }>({
    successful: 0,
    failed: 0,
    failedImages: []
  });

  // État pour le chargement du modèle NSFW
  const [isNSFWModelLoaded, setIsNSFWModelLoaded] = useState(false);

  // Load album data
  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchAlbum = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/album/${id}`);
        if (response.data && response.data.data) {
          const albumData = response.data.data;
          setAlbum(albumData);
          setAlbumName(albumData.name);
          setIsPublic(albumData.status === 'public');
          console.log("Album data loaded:", albumData);
        }
      } catch (error) {
        console.error("Error fetching album:", error);
        setError("Failed to load album. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    // Charger le modèle NSFW
    const loadNSFWModel = async () => {
      try {
        await imageService.loadNSFWModel();
        setIsNSFWModelLoaded(true);
        console.log("Modèle NSFW chargé avec succès");
      } catch (error) {
        console.warn("Impossible de charger le modèle NSFW:", error);
      }
    };

    fetchAlbum();
    loadNSFWModel();
  }, [id, user, navigate]);

  // Check if user is the album owner (skip check if admin)
  useEffect(() => {
    if (album && user && !isAdmin && !isFromAdmin) {
      // Si l'utilisateur n'est pas l'auteur, rediriger vers la page de profil
      console.log("Comparing author:", album.author);
      console.log("Current user:", user);
      
      // Vérifier la correspondance avec le nametag ou le username
      if (album.author.nametag && album.author.nametag !== user && album.author.username !== user) {
        console.log("User is not the author, redirecting to profile");
        navigate("/profile");
      }
    }
  }, [album, user, navigate, isAdmin, isFromAdmin]);

  // Handle album name update
  const handleUpdateAlbumName = async () => {
    if (!album || albumName.trim() === album.name) {
      setIsNameEditing(false);
      return;
    }

    try {
      await api.put(`/album/${album.id}`, {
        name: albumName.trim()
      });
      
      // Update local album state
      setAlbum(prev => {
        if (!prev) return null;
        return {
          ...prev,
          name: albumName.trim()
        };
      });
      
      setIsNameEditing(false);
    } catch (error) {
      console.error("Error updating album name:", error);
      alert("Failed to update album name. Please try again.");
    }
  };

  // Handle toggle privacy
  const handleTogglePrivacy = async () => {
    if (!album) return;
    
    try {
      const newStatus = isPublic ? 'private' : 'public';
      await api.put(`/album/${album.id}`, {
        status: newStatus
      });
      
      // Update local album state
      setAlbum(prev => {
        if (!prev) return null;
        return {
          ...prev,
          status: newStatus
        };
      });
      
      setIsPublic(!isPublic);
    } catch (error) {
      console.error("Error updating album privacy:", error);
      alert("Failed to update album privacy. Please try again.");
    }
  };

  // Handle album deletion
  const handleDeleteAlbum = async () => {
    if (!album) return;
    
    setIsDeleting(true);
    
    try {
      await api.delete(`/album/${album.id}`);
      alert("Album deleted successfully");
      if (isFromAdmin) {
        navigate("/admin", { state: { activeTab: "albums" } });
      } else {
        navigate("/profile");
      }
    } catch (error) {
      console.error("Error deleting album:", error);
      alert("Failed to delete album. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Handle image selection for edit
  const handleEditImage = (image: Image) => {
    // Comme nous ne pouvons pas récupérer directement l'image à cause de CORS,
    // nous allons simplement utiliser un objet File vide mais conserver tous les métadonnées
    const file = new File([], image.name, { type: 'image/jpeg' });
    
    setSelectedImage({
      id: image.id.toString(),
      file: file,
      previewUrl: image.path_image,
      name: image.name,
      description: image.description || "",
      url: image.url || ""
    });
    
    setIsImageModalOpen(true);
  };

  // Handle image update
  const handleUpdateImage = async (updatedImage: any) => {
    if (!updatedImage.id) return;
    
    try {
      // Créer un objet de base avec les champs obligatoires
      const apiPayload: any = {
        name: updatedImage.name,
        description: updatedImage.description || ""
      };
      
      // N'ajouter l'URL que si elle n'est pas vide ET qu'elle est valide
      if (updatedImage.url && updatedImage.url.trim() !== "") {
        // Vérifier si l'URL est valide en utilisant une regex simple pour URL
        const urlPattern = /^(https?:\/\/)(www\.)?[a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)$/;
        if (urlPattern.test(updatedImage.url)) {
          apiPayload.url = updatedImage.url;
        } else {
          // Si l'URL est invalide mais non vide, afficher un message d'erreur
          alert("L'URL fournie n'est pas valide. Le champ URL sera ignoré.");
          // Continuer la mise à jour sans le champ URL
        }
      }
      // Si l'URL est vide, ne pas l'inclure du tout dans la requête
      
      console.log("Données envoyées à l'API:", apiPayload);
      
      // Envoi de la requête
      const response = await api.put(`/image/${updatedImage.id}`, apiPayload);
      
      // Mise à jour locale après succès
      setAlbum(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          image: prev.image.map(img => 
            img.id.toString() === updatedImage.id 
              ? {
                  ...img,
                  name: updatedImage.name,
                  description: updatedImage.description || "",
                  // Conserver l'URL locale uniquement si elle est valide
                  url: apiPayload.url || null
                }
              : img
          )
        };
      });
      
      alert("Image updated successfully");
    } catch (error) {
      console.error("Error updating image:", error);
      alert("Failed to update image. Please try again.");
    }
  };

  // Handle image deletion
  const handleConfirmImageDelete = async () => {
    if (!imageToDelete || !album) return;
    
    // Vérifier si c'est la dernière image de l'album
    if (album.image.length <= 1) {
      alert("Impossible de supprimer la dernière image de l'album. Un album doit contenir au moins une image.");
      setShowImageDeleteModal(false);
      setImageToDelete(null);
      return;
    }
    
    try {
      await api.delete(`/image/${imageToDelete.id}`);
      
      // Update local album state
      setAlbum(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          image: prev.image.filter(img => img.id !== imageToDelete.id)
        };
      });
      
      alert("Image deleted successfully");
    } catch (error) {
      console.error("Error deleting image:", error);
      alert("Failed to delete image. Please try again.");
    } finally {
      setShowImageDeleteModal(false);
      setImageToDelete(null);
    }
  };

  // Handle opening delete image modal
  const openDeleteImageModal = (image: Image) => {
    // Vérifier s'il ne reste qu'une seule image
    if (album && album.image.length <= 1) {
      alert("Impossible de supprimer la dernière image de l'album. Un album doit contenir au moins une image.");
      return;
    }
    
    setImageToDelete(image);
    setShowImageDeleteModal(true);
  };

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
    
    // Limiter la longueur du nom (à 25 caractères comme dans AddAlbum)
    const maxLength = 25;
    if (formatted.length > maxLength) {
      formatted = formatted.substring(0, maxLength);
    }
    
    return formatted;
  };

  // Handle image selection for upload
  const handleImageSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      setNewImages(fileArray);
      
      // Créer des aperçus pour chaque image
      const uploading: UploadingImage[] = fileArray.map(file => ({
        file,
        name: formatFileName(file.name),
        previewUrl: URL.createObjectURL(file),
        status: 'pending',
        progress: 0
      }));
      
      setUploadingImages(uploading);
    }
  };

  // Traiter une image pour l'upload
  const processAndUploadImage = async (
    image: UploadingImage, 
    index: number
  ): Promise<{success: boolean, errorMessage?: string}> => {
    try {
      if (!album) {
        return { 
          success: false, 
          errorMessage: "Album non trouvé" 
        };
      }
      
      // Mettre à jour le statut de l'image
      setUploadingImages(prev => 
        prev.map((img, i) => 
          i === index 
            ? { ...img, status: 'processing', progress: 10 } 
            : img
        )
      );

      // Traiter l'image (vérification NSFW, compression, etc.)
      const processResult = await albumService.processImageBeforeUpload(image.file, index);

      if (!processResult.success || !processResult.file) {
        // Mettre à jour le statut de l'image avec l'erreur
        setUploadingImages(prev => 
          prev.map((img, i) => 
            i === index 
              ? { ...img, status: 'error', errorMessage: processResult.errorMessage, progress: 100 } 
              : img
          )
        );

        return { 
          success: false, 
          errorMessage: processResult.errorMessage || "Erreur lors du traitement de l'image" 
        };
      }

      // Mettre à jour le statut et le progrès
      setUploadingImages(prev => 
        prev.map((img, i) => 
          i === index 
            ? { ...img, progress: 50 } 
            : img
        )
      );

      // Préparer les données pour l'upload
      const imageData: AddImageRequest = {
        file: processResult.file,
        name: image.name,
        id_album: album.id
      };

      // Uploader l'image
      const uploadResponse = await albumService.addImageToAlbum(imageData);

      // Mettre à jour le statut de l'image
      setUploadingImages(prev => 
        prev.map((img, i) => 
          i === index 
            ? { ...img, status: 'success', progress: 100 } 
            : img
        )
      );

      // Mettre à jour l'état de l'album avec la nouvelle image
      setAlbum(prev => {
        if (!prev) return null;
        return {
          ...prev,
          image: [...prev.image, uploadResponse.data]
        };
      });

      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || "Erreur lors de l'upload de l'image";
      
      // Mettre à jour le statut de l'image avec l'erreur
      setUploadingImages(prev => 
        prev.map((img, i) => 
          i === index 
            ? { ...img, status: 'error', errorMessage, progress: 100 } 
            : img
        )
      );

      return { success: false, errorMessage };
    }
  };

  // Handle upload images
  const handleUploadImages = async () => {
    if (uploadingImages.length === 0 || !album) return;
  
    setUploading(true);
    setUploadProgress(0);
  
    const totalImages = uploadingImages.length;
    let successCount = 0;
    let failCount = 0;
    const failedImages: {name: string, reason: string}[] = [];
  
    // Traiter les images par lots pour limiter la charge
    const batchSize = 3; // Traiter 3 images simultanément
    
    for (let i = 0; i < totalImages; i += batchSize) {
      const batch = uploadingImages.slice(i, Math.min(i + batchSize, totalImages));
      const batchPromises = batch.map((image, batchIndex) => 
        processAndUploadImage(image, i + batchIndex)
      );
      
      // Attendre que le lot soit traité
      const batchResults = await Promise.all(batchPromises);
      
      // Comptabiliser les résultats
      batchResults.forEach((result, index) => {
        const currentIndex = i + index;
        if (currentIndex < uploadingImages.length) {
          if (result.success) {
            successCount++;
          } else {
            failCount++;
            failedImages.push({
              name: uploadingImages[currentIndex].name,
              reason: result.errorMessage || "Erreur inconnue"
            });
          }
        }
      });
      
      // Mettre à jour le progrès global
      const newProgress = Math.round(((i + batch.length) / totalImages) * 100);
      setUploadProgress(newProgress);
      
      // Mettre à jour les résultats en temps réel
      setUploadResults({
        successful: successCount,
        failed: failCount,
        failedImages
      });
    }
  
    setUploading(false);
  
    // Message à l'utilisateur
    if (successCount === 0) {
      alert("Échec de l'upload de toutes les images. Veuillez réessayer.");
    } else if (successCount < totalImages) {
      alert(`Upload partiel : ${successCount} sur ${totalImages} images reçues.`);
    } else {
      alert("Toutes les images ont été uploadées avec succès !");
      // Réinitialiser les états après un upload réussi
      setNewImages([]);
      setUploadingImages([]);
    }
  };

  // Handle navigation back
  const handleNavigateBack = () => {
    if (isFromAdmin) {
      // Return to admin panel if coming from there
      navigate("/admin", { state: { activeTab: "albums" } });
    } else {
      // Return to profile otherwise
      navigate("/profile");
    }
  };

  // Nettoyer les ressources et annuler l'upload
  const handleCancelUpload = () => {
    // Nettoyer les URL des aperçus avant d'annuler
    uploadingImages.forEach((image) => {
      URL.revokeObjectURL(image.previewUrl);
    });
    
    setUploadingImages([]);
    setNewImages([]);
    setUploading(false);
    setUploadProgress(0);
    setUploadResults({
      successful: 0,
      failed: 0,
      failedImages: []
    });
  };

  // Obtenir la couleur du statut de l'image
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'processing':
        return '#e6a700'; // Orange
      case 'success':
        return '#00a65a'; // Vert
      case 'error':
        return '#dd4b39'; // Rouge
      default:
        return 'transparent';
    }
  };

  // Obtenir l'icône du statut de l'image
  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'processing':
        return '⏳'; // Sablier
      case 'success':
        return '✓'; // Coche
      case 'error':
        return '✗'; // Croix
      default:
        return '';
    }
  };

  // If loading
  if (loading) {
    return (
      <div className="album-editor-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading album...</p>
        </div>
      </div>
    );
  }

  // If error
  if (error) {
    return (
      <div className="album-editor-container">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={handleNavigateBack} className="primary-button">
            {isFromAdmin ? "Return to Admin Panel" : "Return to Profile"}
          </button>
        </div>
      </div>
    );
  }

  // If album not found
  if (!album) {
    return (
      <div className="album-editor-container">
        <div className="error-message">
          <h2>Album Not Found</h2>
          <p>The album you're looking for doesn't exist or you don't have permission to view it.</p>
          <button onClick={handleNavigateBack} className="primary-button">
            {isFromAdmin ? "Return to Admin Panel" : "Return to Profile"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="album-editor-container">
      <div className="album-editor-header">
        <div className="album-title-section">
          {isNameEditing ? (
            <div className="album-name-edit">
              <input
                type="text"
                value={albumName}
                onChange={(e) => setAlbumName(e.target.value)}
                placeholder="Album name"
                maxLength={64}
                autoFocus
              />
              <div className="edit-actions">
                <button onClick={handleUpdateAlbumName} className="save-button">Save</button>
                <button onClick={() => {
                  setAlbumName(album.name);
                  setIsNameEditing(false);
                }} className="cancel-button">Cancel</button>
              </div>
            </div>
          ) : (
            <h1>
              {album.name}
              <button 
                onClick={() => setIsNameEditing(true)} 
                className="edit-info-button"
                title="Edit album name"
              >
                ✎
              </button>
            </h1>
          )}
          <div className="album-meta">
            <p>Created: {new Date(album.createdAt).toLocaleDateString()}</p>
            <p>Images: {album.image.length}</p>
            <div className="privacy-toggle">
              <span className={!isPublic ? 'active' : ''}>Private</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={handleTogglePrivacy}
                />
                <span className="slider"></span>
              </label>
              <span className={isPublic ? 'active' : ''}>Public</span>
            </div>
          </div>
        </div>
        
        <div className="album-actions">
          <button onClick={handleNavigateBack} className="back-button">
            {isFromAdmin ? "Back to Admin Panel" : "Back to Profile"}
          </button>
          <button onClick={() => setShowDeleteModal(true)} className="delete-button">
            Delete Album
          </button>
        </div>
      </div>

      <div className="album-editor-content">
        <div className="upload-section">
          <h2>Add New Images</h2>
          <div className="file-upload">
            <label htmlFor="image-upload" className="file-upload-label">
              Select Images
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelection}
              style={{ display: 'none' }}
              disabled={uploading}
            />
            <span className="selected-files">
              {newImages.length > 0 ? `${newImages.length} files selected` : 'No files selected'}
            </span>
            {newImages.length > 0 && (
              <div className="upload-actions">
                <button onClick={handleUploadImages} className="upload-button" disabled={uploading}>
                  {uploading ? `Uploading (${uploadProgress}%)` : 'Upload Images'}
                </button>
                <button onClick={handleCancelUpload} className="cancel-upload-button" disabled={uploading}>
                  Cancel
                </button>
              </div>
            )}
          </div>
          
          {uploading && (
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
            </div>
          )}
          
          {/* Upload results summary */}
          {(uploadResults.successful > 0 || uploadResults.failed > 0) && (
            <div className="upload-results-summary">
              <p>
                <span className="success-count">{uploadResults.successful} successful</span>
                {uploadResults.failed > 0 && (
                  <span className="failed-count"> • {uploadResults.failed} failed</span>
                )}
              </p>
              
              {/* List of failed images */}
              {uploadResults.failedImages.length > 0 && (
                <div className="failed-images-list">
                  <details>
                    <summary>View failed uploads</summary>
                    <ul>
                      {uploadResults.failedImages.map((img, idx) => (
                        <li key={idx}>
                          <strong>{img.name}</strong>: {img.reason}
                        </li>
                      ))}
                    </ul>
                  </details>
                </div>
              )}
            </div>
          )}
          
          {/* Preview of images being uploaded */}
          {uploadingImages.length > 0 && (
            <div className="uploading-images-preview">
              {uploadingImages.map((image, index) => (
                <div key={index} className="uploading-image-item">
                  <div 
                    className="image-status-indicator" 
                    style={{ backgroundColor: getStatusColor(image.status) }}
                    title={image.status}
                  >
                    {getStatusIcon(image.status)}
                  </div>
                  
                  <div className="image-preview">
                    <img src={image.previewUrl} alt={`Preview of ${image.name}`} />
                  </div>
                  
                  <div className="image-details">
                    <p className="image-name">{image.name}</p>
                    {image.status === 'processing' && (
                      <div className="image-progress-bar">
                        <div 
                          className="image-progress" 
                          style={{ width: `${image.progress}%` }}
                        ></div>
                      </div>
                    )}
                    {image.status === 'error' && image.errorMessage && (
                      <p className="error-message">{image.errorMessage}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="images-grid-section">
          <h2>Album Images</h2>
          {album.image.length === 0 ? (
            <div className="no-images">
              <p>This album has no images yet. Upload some images to get started.</p>
            </div>
          ) : (
            <div className="images-grid">
              {album.image.map((image) => (
                <div key={image.id} className="image-card">
                  <div className="image-preview">
                    <img src={image.path_image} alt={image.name} />
                  </div>
                  <div className="image-info">
                    <h3>{image.name}</h3>
                    {image.description && <p className="image-description">{image.description}</p>}
                  </div>
                  <div className="image-actions">
                    <button 
                      onClick={() => handleEditImage(image)} 
                      className="edit-image-button"
                      title="Edit image details"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => openDeleteImageModal(image)} 
                      className="delete-image-button"
                      title="Delete this image"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Album Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Delete Album</h2>
            <p>Are you sure you want to delete this album? This action cannot be undone and all images in this album will be deleted.</p>
            <div className="modal-actions">
              <button onClick={() => setShowDeleteModal(false)} className="cancel-button">
                Cancel
              </button>
              <button 
                onClick={handleDeleteAlbum} 
                className="confirm-delete-button"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Album"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Image Modal */}
      {showImageDeleteModal && imageToDelete && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Delete Image</h2>
            <p>Are you sure you want to delete the image "{imageToDelete.name}"? This action cannot be undone.</p>
            <div className="image-preview-in-modal">
              <img src={imageToDelete.path_image} alt={imageToDelete.name} />
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowImageDeleteModal(false)} className="cancel-button">
                Cancel
              </button>
              <button onClick={handleConfirmImageDelete} className="confirm-delete-button">
                Delete Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Edit Modal */}
      {selectedImage && (
        <ImageEditModal
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          image={selectedImage}
          onSave={handleUpdateImage}
        />
      )}
    </div>
  );
};

export default AlbumEditor;