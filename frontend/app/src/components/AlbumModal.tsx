import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import '../styles/AlbumModal.css';

Modal.setAppElement('#root'); // Nécessaire pour l'accessibilité

interface AlbumModalProps {
  isOpen: boolean;
  onClose: () => void;
  albumName: string;
  albumId: string;
  isUserLoggedIn?: boolean; // Optionnel avec valeur par défaut
  categories?: string[]; // Catégories de l'album (nouveau)
}

const AlbumModal: React.FC<AlbumModalProps> = ({ 
  isOpen, 
  onClose, 
  albumName, 
  albumId, 
  isUserLoggedIn = true,
  categories = [] 
}) => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<'tierlist' | 'tournoi' | 'classement' | null>(null);
  const [customName, setCustomName] = useState('');

  // Générer un nom par défaut en fonction du type sélectionné
  const getDefaultName = () => {
    switch (selectedOption) {
      case 'tierlist':
        return `Tierlist ${albumName}`;
      case 'tournoi':
        return `Tournoi ${albumName}`;
      case 'classement':
        return `Classement ${albumName}`;
      default:
        return '';
    }
  };

  // Au changement de type, mise à jour du nom suggéré
  React.useEffect(() => {
    setCustomName(getDefaultName());
  }, [selectedOption, albumName]);

  const handleCreate = () => {
    if (!selectedOption) return;
    
    // Rediriger vers la page de configuration des images
    // Nous utilisons le type au pluriel pour les routes, mais au singulier pour l'affichage
    const typeMap = {
      'tierlist': 'tierlists',
      'tournoi': 'tournois',
      'classement': 'classements'
    };
    
    // Paramètres pour la page de sélection d'images
    const params = new URLSearchParams();
    params.append('album', albumId);
    params.append('type', typeMap[selectedOption]);
    params.append('name', customName);
    
    // Utilisation des catégories pour des traitements futurs si nécessaire
    if (categories && categories.length > 0) {
      console.log("Catégories utilisées:", categories);
      // Vous pourriez vouloir passer les catégories en paramètre dans le futur
      // params.append('categories', JSON.stringify(categories));
    }
    
    // Rediriger vers la page de sélection
    navigate(`/setup?${params.toString()}`);
    
    onClose();
  };

  const handleLogin = () => {
    // Rediriger vers la page de connexion
    navigate('/login');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="album-modal-content"
      overlayClassName="album-modal-overlay"
    >
      <div className="album-modal-header">
        <h2>Utiliser l'album "{albumName}"</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      <p className="album-modal-subtitle">Que souhaitez-vous créer avec cet album ?</p>
      
      <div className="album-options">
        <div 
          className={`album-option ${selectedOption === 'tierlist' ? 'selected' : ''}`}
          onClick={() => setSelectedOption('tierlist')}
        >
          <div className="option-icon tierlist-icon">📊</div>
          <span className="option-label">Tierlist</span>
        </div>
        
        <div 
          className={`album-option ${selectedOption === 'tournoi' ? 'selected' : ''}`}
          onClick={() => setSelectedOption('tournoi')}
        >
          <div className="option-icon tournoi-icon">🏆</div>
          <span className="option-label">Tournoi</span>
        </div>
        
        <div 
          className={`album-option ${selectedOption === 'classement' ? 'selected' : ''}`}
          onClick={() => setSelectedOption('classement')}
        >
          <div className="option-icon classement-icon">🏅</div>
          <span className="option-label">Classement</span>
        </div>
      </div>
      
      {/* Le champ de nom personnalisé apparaît pour tous les utilisateurs */}
      {selectedOption && (
        <div className="name-input-container">
          <label htmlFor="custom-name">Nom personnalisé :</label>
          <input
            type="text"
            id="custom-name"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder={`Entrez un nom pour votre ${selectedOption}`}
          />
        </div>
      )}
      
      {/* Message pour utilisateurs non connectés */}
      {!isUserLoggedIn && selectedOption && (
        <div className="login-message">
          <p>Vous n'êtes pas connecté ! Vous pourrez créer un {selectedOption} mais ne pourrez pas l'enregistrer.</p>
          <button className="login-button" onClick={handleLogin}>
            Se connecter
          </button>
        </div>
      )}
      
      <div className="album-modal-actions">
        <button className="cancel-button" onClick={onClose}>Annuler</button>
        <button 
          className="create-button" 
          onClick={handleCreate}
          disabled={!selectedOption}
        >
          Continuer
        </button>
      </div>
    </Modal>
  );
};

export default AlbumModal;