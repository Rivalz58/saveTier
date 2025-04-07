import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/AlbumEditor.css";
import ImageEditModal from "../components/ImageEditModal";

interface AlbumEditorProps {
  user: string | null;
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

const AlbumEditor: React.FC<AlbumEditorProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

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
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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
        }
      } catch (error) {
        console.error("Error fetching album:", error);
        setError("Failed to load album. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAlbum();
  }, [id, user, navigate]);

  // Check if user is the album owner
  useEffect(() => {
    if (album && user) {
      // If user is not the author, redirect to profile page
      if (album.author.username !== user) {
        navigate("/profile");
      }
    }
  }, [album, user, navigate]);

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
      navigate("/profile");
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
    // Create a fake File object from the image URL
    fetch(image.path_image)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], `image-${image.id}.jpg`, { type: 'image/jpeg' });
        
        setSelectedImage({
          id: image.id.toString(),
          file: file,
          previewUrl: image.path_image,
          name: image.name,
          description: image.description || "",
          url: image.url || ""
        });
        
        setIsImageModalOpen(true);
      })
      .catch(err => {
        console.error("Error preparing image for edit:", err);
        alert("Could not prepare image for editing. Please try again.");
      });
  };

  // Handle image update
  const handleUpdateImage = async (updatedImage: any) => {
    if (!updatedImage.id) return;
    
    try {
      // We can only update name, description, and URL (not the image file itself)
      await api.put(`/image/${updatedImage.id}`, {
        name: updatedImage.name,
        description: updatedImage.description || null,
        url: updatedImage.url || null
      });
      
      // Update local album state
      setAlbum(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          image: prev.image.map(img => 
            img.id.toString() === updatedImage.id 
              ? {
                  ...img,
                  name: updatedImage.name,
                  description: updatedImage.description || null,
                  url: updatedImage.url || null
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
    if (!imageToDelete) return;
    
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
    setImageToDelete(image);
    setShowImageDeleteModal(true);
  };

  // Handle image selection for upload
  const handleImageSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewImages(Array.from(e.target.files));
    }
  };

  // Handle image upload
  const handleUploadImages = async () => {
    if (newImages.length === 0 || !album) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    const totalImages = newImages.length;
    let successCount = 0;
    
    for (let i = 0; i < totalImages; i++) {
      try {
        const formData = new FormData();
        formData.append('file', newImages[i]);
        formData.append('name', newImages[i].name.split('.')[0]); // Use filename without extension as name
        formData.append('id_album', album.id.toString());
        
        // Upload the image
        const response = await api.post('/image', formData);
        
        if (response.data && response.data.data) {
          // Add the new image to the album locally
          setAlbum(prev => {
            if (!prev) return null;
            
            return {
              ...prev,
              image: [...prev.image, response.data.data]
            };
          });
          
          successCount++;
        }
      } catch (error) {
        console.error(`Error uploading image ${i + 1}:`, error);
      }
      
      // Update progress
      setUploadProgress(Math.round(((i + 1) / totalImages) * 100));
    }
    
    setUploading(false);
    setNewImages([]);
    
    if (successCount === 0) {
      alert("Failed to upload images. Please try again.");
    } else if (successCount < totalImages) {
      alert(`Uploaded ${successCount} out of ${totalImages} images.`);
    } else {
      alert("All images uploaded successfully!");
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
          <button onClick={() => navigate("/profile")} className="primary-button">
            Return to Profile
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
          <button onClick={() => navigate("/profile")} className="primary-button">
            Return to Profile
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
                className="edit-button"
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
          <button onClick={() => navigate(`/profile`)} className="back-button">
            Back to Profile
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
            />
            <span className="selected-files">
              {newImages.length > 0 ? `${newImages.length} files selected` : 'No files selected'}
            </span>
            {newImages.length > 0 && (
              <button onClick={handleUploadImages} className="upload-button" disabled={uploading}>
                {uploading ? `Uploading (${uploadProgress}%)` : 'Upload Images'}
              </button>
            )}
          </div>
          
          {uploading && (
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
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