import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ViewerEditorModal.css';
import rankingService from '../services/ranking-service';
import tournamentService from '../services/tournament-service';
import tierlistService from '../services/tierlist-service';

interface ViewerEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  itemName: string;
  itemType: 'tierlist' | 'tournoi' | 'classement';
  canEdit: boolean; // Si l'utilisateur peut éditer (auteur)
  onItemDeleted?: () => void; // Callback appelé après suppression
}

const ViewerEditorModal: React.FC<ViewerEditorModalProps> = ({
  isOpen,
  onClose,
  itemId,
  itemName,
  itemType,
  canEdit,
  onItemDeleted
}) => {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleViewOnly = () => {
    // Rediriger vers le viewer
    const typeMap = {
      'tierlist': 'tierlists',
      'tournoi': 'tournois', 
      'classement': 'classements'
    };
    navigate(`/${typeMap[itemType]}/${itemId}`);
    onClose();
  };

  const handleContinue = () => {
    // Rediriger vers l'éditeur pour continuer le tri
    const typeMap = {
      'tierlist': 'tierlists',
      'tournoi': 'tournois',
      'classement': 'classements'
    };
    navigate(`/${typeMap[itemType]}/edit/${itemId}?continue=true`);
    onClose();
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setIsDeleting(true);
    try {
      const id = parseInt(itemId);
      
      switch (itemType) {
        case 'tierlist':
          await tierlistService.deleteTierlist(id);
          break;
        case 'tournoi':
          await tournamentService.deleteTournament(id);
          break;
        case 'classement':
          await rankingService.deleteRanking(id);
          break;
      }

      alert(`${itemType === 'tierlist' ? 'Tierlist' : itemType} supprimé(e) avec succès !`);
      
      // Appeler le callback de suppression si fourni
      if (onItemDeleted) {
        onItemDeleted();
      }
      
      onClose();
    } catch (error) {
      console.error(`Erreur lors de la suppression du ${itemType}:`, error);
      alert(`Erreur lors de la suppression. Veuillez réessayer.`);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content viewer-editor-modal">
        <div className="modal-header">
          <h2>"{itemName}"</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {!showDeleteConfirm ? (
            <>
              <p>Comment souhaitez-vous accéder à ce {itemType === 'tierlist' ? 'tierlist' : itemType} ?</p>
              
              <div className="modal-actions">
                <button 
                  className="modal-button primary"
                  onClick={handleViewOnly}
                >
                  👁️ Voir le résultat
                  <span className="button-description">Consulter le {itemType} terminé</span>
                </button>
                
                {canEdit && (
                  <>
                    {/* Masquer le bouton "Continuer" seulement pour les tournois */}
                    {itemType !== 'tournoi' && (
                      <button 
                        className="modal-button accent"
                        onClick={handleContinue}
                      >
                        🔄 Continuer/Recommencer le tri
                        <span className="button-description">
                          Reprendre le processus de tri depuis le début
                        </span>
                      </button>
                    )}
                    
                    <button 
                      className="modal-button danger"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      🗑️ Supprimer
                      <span className="button-description">
                        Supprimer définitivement ce {itemType}
                      </span>
                    </button>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <p className="delete-confirmation">
                ⚠️ Êtes-vous sûr de vouloir supprimer définitivement ce {itemType} ?
              </p>
              <p className="delete-warning">
                Cette action ne peut pas être annulée.
              </p>
              
              <div className="delete-actions">
                <button 
                  className="modal-button secondary"
                  onClick={cancelDelete}
                  disabled={isDeleting}
                >
                  Annuler
                </button>
                <button 
                  className="modal-button danger"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Suppression...' : 'Confirmer la suppression'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewerEditorModal;