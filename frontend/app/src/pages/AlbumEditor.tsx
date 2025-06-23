/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import "../styles/AlbumEditor.css";
import albumService, {
  AddImageRequest,
  AddImageResponse,
  ProcessImageResult,
} from "../services/albumService";
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
  status: "public" | "private" | "quarantined";
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
  id?: string;
  file: File;
  previewUrl: string;
  name: string;
  description?: string;
  url?: string;
}

// Interface pour les informations des images en cours d'upload
interface UploadingImage {
  file: File;
  name: string;
  previewUrl: string;
  status: "pending" | "processing" | "success" | "error";
  progress: number;
  errorMessage?: string;
}

const AlbumEditor: React.FC<AlbumEditorProps> = ({ user, isAdmin }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine if we're coming from admin panel based on location.state or path
  const isFromAdmin =
    Boolean(location.state?.fromAdmin) ||
    isAdmin ||
    location.pathname.includes("admin");

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
    failedImages: { name: string; reason: string }[];
  }>({
    successful: 0,
    failed: 0,
    failedImages: [],
  });

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
        setError(null);
        
        const response = await api.get(`/album/${id}`);
        
        console.log("Album API Response:", response.data);
        
        if (response.data && response.data.data) {
          const albumData = response.data.data;
          
          const formattedAlbum: Album = {
            id: albumData.id,
            name: albumData.name,
            status: albumData.status,
            createdAt: albumData.createdAt,
            updatedAt: albumData.updatedAt,
            categories: albumData.categories || [],
            author: albumData.author || { id: 0, username: "Unknown", nametag: "unknown" },
            image: albumData.images || albumData.image || []
          };
          
          setAlbum(formattedAlbum);
          setAlbumName(formattedAlbum.name);
          setIsPublic(formattedAlbum.status === "public");
          
          console.log("Album data loaded successfully:", formattedAlbum);
        } else {
          throw new Error("Structure de réponse inattendue");
        }
      } catch (error: any) {
        console.error("Error fetching album:", error);
        
        if (error.response?.status === 404) {
          setError("Album introuvable ou vous n'avez pas les permissions nécessaires.");
        } else if (error.response?.status === 403) {
          setError("Vous n'avez pas les permissions pour éditer cet album.");
        } else if (error.response?.status === 401) {
          setError("Vous devez être connecté pour accéder à cette page.");
        } else {
          setError("Erreur lors du chargement de l'album. Veuillez réessayer plus tard.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAlbum();
  }, [id, user, navigate]);

  // Fonction pour mettre à jour le nom de l'album
  const handleUpdateAlbumName = async () => {
    if (!album || !albumName.trim()) return;

    try {
      const response = await api.put(`/album/${album.id}`, {
        name: albumName.trim()
      });
      
      if (response.data) {
        setAlbum(prev => prev ? { ...prev, name: albumName.trim() } : null);
        setIsNameEditing(false);
        console.log("Album name updated successfully");
      }
    } catch (error) {
      console.error("Error updating album name:", error);
      alert("Erreur lors de la mise à jour du nom de l'album");
      setAlbumName(album.name);
    }
  };

  // Fonction pour changer la visibilité de l'album
  const handleTogglePrivacy = async () => {
    if (!album) return;

    const newStatus = isPublic ? "private" : "public";
    
    try {
      const response = await api.put(`/album/${album.id}`, {
        status: newStatus
      });
      
      if (response.data) {
        setIsPublic(!isPublic);
        setAlbum(prev => prev ? { ...prev, status: newStatus } : null);
        console.log("Album privacy updated successfully");
      }
    } catch (error) {
      console.error("Error updating album privacy:", error);
      alert("Erreur lors de la modification de la visibilité");
    }
  };

  // Handle album deletion
  const handleDeleteAlbum = async () => {
    if (!album) return;

    setIsDeleting(true);

    try {
      const response = await api.delete(`/album/${album.id}`);
      
      if (response.data) {
        console.log("Album deleted successfully");
        alert("Album supprimé avec succès");
        handleNavigateBack();
      }
    } catch (error) {
      console.error("Error deleting album:", error);
      alert("Erreur lors de la suppression de l'album");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Handle navigation back
  const handleNavigateBack = () => {
    if (isFromAdmin) {
      navigate("/admin", { state: { activeTab: "albums" } });
    } else {
      navigate("/profile");
    }
  };

  // Handle image selection for edit
  const handleEditImage = (image: Image) => {
    const file = new File([], image.name, { type: "image/jpeg" });

    setSelectedImage({
      id: image.id.toString(),
      file: file,
      previewUrl: image.path_image,
      name: image.name,
      description: image.description || "",
      url: image.url || "",
    });

    setIsImageModalOpen(true);
  };

  // Handle image update
  const handleUpdateImage = async (updatedImage: any) => {
    if (!updatedImage.id) return;

    try {
      const apiPayload: any = {
        name: updatedImage.name,
        description: updatedImage.description || "",
      };

      if (updatedImage.url && updatedImage.url.trim() !== "") {
        const urlPattern =
          /^(https?:\/\/)(www\.)?[a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)$/;
        if (urlPattern.test(updatedImage.url)) {
          apiPayload.url = updatedImage.url;
        } else {
          alert("L'URL fournie n'est pas valide. Le champ URL sera ignoré.");
        }
      }

      console.log("Données envoyées à l'API:", apiPayload);

      const response = await api.put(`/image/${updatedImage.id}`, apiPayload);

      setAlbum((prev) => {
        if (!prev) return null;

        return {
          ...prev,
          image: prev.image.map((img) =>
            img.id.toString() === updatedImage.id
              ? {
                  ...img,
                  name: updatedImage.name,
                  description: updatedImage.description || "",
                  url: apiPayload.url || img.url,
                }
              : img,
          ),
        };
      });

      setIsImageModalOpen(false);
      setSelectedImage(null);
    } catch (error) {
      console.error("Error updating image:", error);
      alert("Erreur lors de la mise à jour de l'image");
    }
  };

  // Fonction pour supprimer une image
  const handleDeleteImage = async (imageId: number) => {
    if (!album) return;

    try {
      setIsDeleting(true);
      
      const response = await api.delete(`/image/${imageId}`);
      
      if (response.data) {
        setAlbum(prev => {
          if (!prev) return null;
          return {
            ...prev,
            image: prev.image.filter(img => img.id !== imageId)
          };
        });
        
        setShowImageDeleteModal(false);
        setImageToDelete(null);
        console.log("Image deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      alert("Erreur lors de la suppression de l'image");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle image deletion
  const handleDeleteImageClick = (image: Image) => {
    if (album && album.image.length <= 3) {
      alert(
        "Impossible de supprimer cette image. Un album doit contenir au minimum 3 images.",
      );
      return;
    }

    setImageToDelete(image);
    setShowImageDeleteModal(true);
  };

  // Fonction utilitaire : formater le nom de fichier
  const formatFileName = (fileName: string): string => {
    let formatted = fileName.replace(/\.[^/.]+$/, "");
    formatted = formatted.replace(/[_-]/g, " ");
    formatted = formatted.replace(/\b\w/g, (char) => char.toUpperCase());
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

      const uploading: UploadingImage[] = fileArray.map((file) => ({
        file,
        name: formatFileName(file.name),
        previewUrl: URL.createObjectURL(file),
        status: "pending",
        progress: 0,
      }));

      setUploadingImages(uploading);
    }
  };



  // Traiter une image pour l'upload
  const processAndUploadImage = async (
    image: UploadingImage,
    index: number,
  ): Promise<{ success: boolean; errorMessage?: string }> => {
    try {
      if (!album) {
        return {
          success: false,
          errorMessage: "Album non trouvé",
        };
      }

      setUploadingImages((prev) =>
        prev.map((img, i) =>
          i === index ? { ...img, status: "processing", progress: 10 } : img,
        ),
      );

      const processResult = await albumService.processImageBeforeUpload(
        image.file,
        index,
      );

      if (!processResult.success || !processResult.file) {
        setUploadingImages((prev) =>
          prev.map((img, i) =>
            i === index
              ? {
                  ...img,
                  status: "error",
                  errorMessage: processResult.errorMessage,
                  progress: 100,
                }
              : img,
          ),
        );

        return {
          success: false,
          errorMessage:
            processResult.errorMessage ||
            "Erreur lors du traitement de l'image",
        };
      }

      setUploadingImages((prev) =>
        prev.map((img, i) => (i === index ? { ...img, progress: 50 } : img)),
      );

      // Préparer les données pour l'upload exactement comme AddAlbum
      const imageData: AddImageRequest = {
        file: processResult.file,
        name: image.name,
        id_album: album.id,
      };

      // Utilise exactement la même méthode que AddAlbum (albumService.addImageToAlbum)
      const uploadResponse = await albumService.addImageToAlbum(imageData);

      setUploadingImages((prev) =>
        prev.map((img, i) =>
          i === index ? { ...img, status: "success", progress: 100 } : img,
        ),
      );

      setAlbum((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          image: [...prev.image, uploadResponse.data],
        };
      });

      return { success: true };
    } catch (error: any) {
      const errorMessage =
        error.message || "Erreur lors de l'upload de l'image";

      setUploadingImages((prev) =>
        prev.map((img, i) =>
          i === index
            ? {
                ...img,
                status: "error",
                errorMessage: errorMessage,
                progress: 100,
              }
            : img,
        ),
      );

      return {
        success: false,
        errorMessage: errorMessage,
      };
    }
  };

  // Handle image upload
  const handleUploadImages = async () => {
    if (uploadingImages.length === 0 || !album) return;

    setUploading(true);
    setUploadProgress(0);

    setUploadResults({
      successful: 0,
      failed: 0,
      failedImages: [],
    });

    const totalImages = uploadingImages.length;
    let successful = 0;
    let failed = 0;
    const failedImages: { name: string; reason: string }[] = [];

    for (let i = 0; i < uploadingImages.length; i++) {
      const image = uploadingImages[i];

      try {
        const result = await processAndUploadImage(image, i);

        if (result.success) {
          successful++;
        } else {
          failed++;
          failedImages.push({
            name: image.name,
            reason: result.errorMessage || "Erreur inconnue",
          });
        }
      } catch (error) {
        failed++;
        failedImages.push({
          name: image.name,
          reason: "Erreur lors du traitement",
        });
      }

      const progress = ((i + 1) / totalImages) * 100;
      setUploadProgress(progress);
    }

    setUploadResults({
      successful,
      failed,
      failedImages,
    });

    setUploading(false);

    if (failed > 0 && successful === 0) {
      alert(
        "Aucune image n'a pu être uploadée. Veuillez réessayer.",
      );
    } else if (successful < totalImages) {
      alert(
        `Upload partiel : ${successful} sur ${totalImages} images uploadées avec succès.`,
      );
    } else {
      alert("Toutes les images ont été uploadées avec succès !");
      setNewImages([]);
      setUploadingImages([]);
    }
  };

  // Nettoyer les ressources et annuler l'upload
  const handleCancelUpload = () => {
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
      failedImages: [],
    });
  };

  // Obtenir la couleur et l'icône du statut
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "processing":
        return "#e6a700";
      case "success":
        return "#00a65a";
      case "error":
        return "#dd4b39";
      default:
        return "transparent";
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case "processing":
        return "⏳";
      case "success":
        return "✓";
      case "error":
        return "✗";
      default:
        return "";
    }
  };

  // If loading
  if (loading) {
    return (
      <div className="album-editor-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement de l'album...</p>
        </div>
      </div>
    );
  }

  // If error
  if (error) {
    return (
      <div className="album-editor-container">
        <div className="error-message">
          <h2>Erreur</h2>
          <p>{error}</p>
          <button onClick={handleNavigateBack} className="primary-button">
            {isFromAdmin ? "Retour au panneau admin" : "Retour au profil"}
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
          <h2>Album introuvable</h2>
          <p>
            L'album que vous cherchez n'existe pas ou vous n'avez pas les
            permissions pour le visualiser.
          </p>
          <button onClick={handleNavigateBack} className="primary-button">
            {isFromAdmin ? "Retour au panneau admin" : "Retour au profil"}
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
                placeholder="Nom de l'album"
                maxLength={64}
                autoFocus
              />
              <div className="edit-actions">
                <button onClick={handleUpdateAlbumName} className="save-button">
                  Sauvegarder
                </button>
                <button
                  onClick={() => {
                    setAlbumName(album.name);
                    setIsNameEditing(false);
                  }}
                  className="cancel-button"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <h1>
              {album.name}
              <button
                onClick={() => setIsNameEditing(true)}
                className="edit-info-button"
                title="Modifier le nom de l'album"
              >
                ✎
              </button>
            </h1>
          )}
          <div className="album-meta">
            <p>Créé: {new Date(album.createdAt).toLocaleDateString()}</p>
            <p>Images: {album.image.length}</p>
            <div className="privacy-toggle">
              <span className={!isPublic ? "active" : ""}>Privé</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={handleTogglePrivacy}
                />
                <span className="slider"></span>
              </label>
              <span className={isPublic ? "active" : ""}>Public</span>
            </div>
          </div>
        </div>

        <div className="album-actions">
          <button onClick={handleNavigateBack} className="back-button">
            {isFromAdmin ? "Retour au panneau admin" : "Retour au profil"}
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="delete-button"
          >
            Supprimer l'album
          </button>
        </div>
      </div>

      <div className="album-editor-content">
        {!isFromAdmin && (
          <div className="upload-section">
            <h2>Ajouter de nouvelles images</h2>
          <div className="file-upload">
            <label htmlFor="image-upload" className="file-upload-label">
              Sélectionner des images
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelection}
              style={{ display: "none" }}
              disabled={uploading}
            />
            <span className="selected-files">
              {newImages.length > 0
                ? `${newImages.length} fichier(s) sélectionné(s)`
                : "Aucun fichier sélectionné"}
            </span>
            {newImages.length > 0 && (
              <div className="upload-actions">
                <button
                  onClick={handleUploadImages}
                  className="upload-button"
                  disabled={uploading}
                >
                  {uploading
                    ? `Upload en cours... ${Math.round(uploadProgress)}%`
                    : "Uploader les images"}
                </button>
                {uploading && (
                  <button
                    onClick={handleCancelUpload}
                    className="cancel-upload-button"
                  >
                    Annuler
                  </button>
                )}
              </div>
            )}
          </div>

          {uploading && (
            <div className="upload-progress-container">
              <div className="upload-progress-bar">
                <div
                  className="upload-progress"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p>Upload en cours: {Math.round(uploadProgress)}%</p>
            </div>
          )}

          {/* Aperçu des images en cours d'upload */}
          {uploadingImages.length > 0 && (
            <div className="uploading-images-preview">
              {uploadingImages.map((image, index) => (
                <div key={index} className="uploading-image-item">
                  <div
                    className="image-status-indicator"
                    style={{ backgroundColor: getStatusColor(image.status) }}
                  >
                    {getStatusIcon(image.status)}
                  </div>
                  <div className="image-preview-small">
                    <img src={image.previewUrl} alt={image.name} />
                  </div>
                  <div className="image-details">
                    <h4 className="image-name-small">{image.name}</h4>
                    <div className="image-progress-bar">
                      <div
                        className="image-progress"
                        style={{ width: `${image.progress}%` }}
                      />
                    </div>
                    {image.status === "error" && (
                      <p className="error-message-small">{image.errorMessage}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Résultats d'upload */}
          {(uploadResults.successful > 0 || uploadResults.failed > 0) && (
            <div className="upload-results-summary">
              <h3>Résultats de l'upload</h3>
              {uploadResults.successful > 0 && (
                <p className="success-count">
                  ✅ {uploadResults.successful} image(s) uploadée(s) avec succès
                </p>
              )}
              {uploadResults.failed > 0 && (
                <p className="failed-count">
                  ❌ {uploadResults.failed} image(s) ont échoué
                </p>
              )}
              {uploadResults.failedImages.length > 0 && (
                <details className="failed-images-list">
                  <summary>Voir les détails des échecs</summary>
                  <ul>
                    {uploadResults.failedImages.map((failedImage, index) => (
                      <li key={index}>
                        <strong>{failedImage.name}</strong>: {failedImage.reason}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
        </div>
        )}

        {/* Images existantes */}
        <div className="existing-images-section">
          <h2>Images de l'album ({album.image.length})</h2>
          {album.image.length > 0 ? (
            <div className="images-grid">
              {album.image.map((image) => (
                <div key={image.id} className="image-card">
                  <div className="image-preview-existing">
                    <img src={image.path_image} alt={image.name} />
                  </div>
                  <div className="image-info">
                    <h3>{image.name}</h3>
                  </div>
                  <div className="image-actions">
                    <button
                      onClick={() => handleEditImage(image)}
                      className="edit-image-button"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteImageClick(image)}
                      className="delete-image-button"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>Aucune image dans cet album.</p>
          )}
        </div>
      </div>

      {/* Image Edit Modal */}
      {isImageModalOpen && selectedImage && (
        <ImageEditModal
          isOpen={isImageModalOpen}
          onClose={() => {
            setIsImageModalOpen(false);
            setSelectedImage(null);
          }}
          image={selectedImage}
          onSave={handleUpdateImage}
        />
      )}

      {/* Delete Album Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Supprimer l'album</h2>
            <p>
              Êtes-vous sûr de vouloir supprimer cet album ? Cette action est
              irréversible et supprimera également toutes les images qu'il contient.
            </p>
            <div className="modal-actions">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="cancel-button"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteAlbum}
                className="confirm-delete-button"
                disabled={isDeleting}
              >
                {isDeleting ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Image Modal */}
      {showImageDeleteModal && imageToDelete && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Supprimer l'image</h2>
            <p>
              Êtes-vous sûr de vouloir supprimer l'image "{imageToDelete.name}" ?
              Cette action est irréversible.
            </p>
            <div className="image-preview-in-modal">
              <img src={imageToDelete.path_image} alt={imageToDelete.name} />
            </div>
            <div className="modal-actions">
              <button
                onClick={() => {
                  setShowImageDeleteModal(false);
                  setImageToDelete(null);
                }}
                className="cancel-button"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteImage(imageToDelete.id)}
                className="confirm-delete-button"
                disabled={isDeleting}
              >
                {isDeleting ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlbumEditor;