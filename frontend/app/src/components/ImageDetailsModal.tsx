import React from "react";
import Modal from "react-modal";
import "../styles/ImageDetailsModal.css";

// Types pour les propriétés du modal
interface ImageDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: {
    id: string;
    src?: string;
    name?: string;
    alt?: string;
    description?: string | null;
    url?: string | null;
  } | null;
}

const ImageDetailsModal: React.FC<ImageDetailsModalProps> = ({
  isOpen,
  onClose,
  image
}) => {
  if (!image) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="image-details-modal"
      overlayClassName="image-details-modal-overlay"
      ariaHideApp={false} // Pour éviter l'avertissement d'accessibilité
    >
      <div className="image-details">
        <div className="image-details-header">
          <h2>{image.name || "Image Details"}</h2>
          <button className="close-details-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="image-details-content">
          <div className="image-preview-container">
            <img 
              src={image.src} 
              alt={image.alt || image.name || "Image"} 
              className="image-details-preview" 
            />
          </div>
          
          <div className="image-details-info">
            {image.name && (
              <div className="info-row">
                <span className="info-label">Nom:</span>
                <span className="info-value">{image.name}</span>
              </div>
            )}
            
            {image.description && (
              <div className="info-section">
                <h3>Description</h3>
                <p className="description-text">{image.description}</p>
              </div>
            )}
            
            {image.url && (
              <div className="info-section">
                <h3>URL</h3>
                <a 
                  href={image.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="url-link"
                >
                  {image.url}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ImageDetailsModal;