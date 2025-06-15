import React, { useState } from "react";
import Modal from "react-modal";
import "../styles/AlbumModal.css";
import "../styles/ImageEditModal.css";

Modal.setAppElement("#root"); // Nécessaire pour l'accessibilité

interface ImageEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: {
    id?: string;
    file: File;
    previewUrl: string;
    name: string;
    description?: string;
    url?: string;
  };
  onSave: (updatedImage: {
    id?: string;
    file: File;
    previewUrl: string;
    name: string;
    description: string;
    url: string;
  }) => void;
}

const ImageEditModal: React.FC<ImageEditModalProps> = ({
  isOpen,
  onClose,
  image,
  onSave,
}) => {
  // États locaux pour les champs modifiables
  const [name, setName] = useState(image.name);
  const [description, setDescription] = useState(image.description || "");
  const [url, setUrl] = useState(image.url || "");

  // Fonction pour réinitialiser les valeurs en cas d'annulation
  const handleCancel = () => {
    setName(image.name);
    setDescription(image.description || "");
    setUrl(image.url || "");
    onClose();
  };

  // Fonction pour enregistrer les modifications
  const handleSave = () => {
    // Valider que le nom n'est pas vide
    if (!name.trim()) {
      alert("Le nom de l'image ne peut pas être vide.");
      return;
    }

    // Créer un objet mis à jour avec les nouvelles valeurs
    const updatedImage = {
      ...image,
      name: name.trim(),
      description: description.trim(),
      url: url.trim(),
    };

    // Appeler la fonction de callback pour enregistrer les modifications
    onSave(updatedImage);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleCancel}
      className="album-modal-content image-edit-modal"
      overlayClassName="album-modal-overlay"
    >
      <div className="album-modal-header">
        <h2>Modifier l'image</h2>
        <button className="close-button" onClick={handleCancel}>
          ×
        </button>
      </div>

      <div className="image-edit-content">
        <div className="image-preview-container">
          <img src={image.previewUrl} alt={name} className="image-preview" />
          <p className="file-name">{image.file.name}</p>
        </div>

        <div className="image-edit-form">
          <div className="form-group">
            <label htmlFor="image-name">Nom de l'image</label>
            <input
              type="text"
              id="image-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom de l'image"
              maxLength={25}
            />
          </div>

          <div className="form-group">
            <label htmlFor="image-description">Description (optionnelle)</label>
            <textarea
              id="image-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez cette image..."
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="form-group">
            <label htmlFor="image-url">URL (optionnelle)</label>
            <input
              type="url"
              id="image-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://exemple.com/page-de-limage"
            />
          </div>
        </div>
      </div>

      <div className="album-modal-actions">
        <button className="cancel-button" onClick={handleCancel}>
          Annuler
        </button>
        <button className="create-button" onClick={handleSave}>
          Enregistrer
        </button>
      </div>
    </Modal>
  );
};

export default ImageEditModal;
