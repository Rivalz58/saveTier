import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/Admin.css';
import { getAlbumInfoForContent } from '../services/album-api-extended';

interface ContentItem {
  id: number;
  name: string;
  description: string;
  private: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    id: number;
    username: string;
  };
  album: {
    id: number;
    name: string;
  };
}

interface ContentItemFormatted {
  id: string;
  name: string;
  creator: string;
  creatorId: string;
  albumId: string;
  albumName: string;
  image: string;
  categories: string[];
  status: 'public' | 'private';
  created: string;
  description: string;
}

interface ContentResponse {
  status: string;
  message: string;
  data: ContentItem[];
}

interface ContentProps {
  contentType: 'tierlist' | 'ranking' | 'tournament';
  contentTypeName: string;
}

const AdminContentManagement: React.FC<ContentProps> = ({ contentType, contentTypeName }) => {
  const [contentItems, setContentItems] = useState<ContentItemFormatted[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  
  // États pour la modal
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<'privacy' | 'delete'>('privacy');
  const [selectedItem, setSelectedItem] = useState<ContentItemFormatted | null>(null);

  // Formatter les données du contenu
  const formatContentData = async (items: ContentItem[]): Promise<ContentItemFormatted[]> => {
    const formattedItems: ContentItemFormatted[] = [];
    const allCategories = new Set<string>();
    
    for (const item of items) {
      // Récupérer les informations de l'album associé
      const albumInfo = await getAlbumInfoForContent(item.album.id);
      
      // Ajouter les catégories au set global
      albumInfo.categories.forEach(category => allCategories.add(category));
      
      // Créer l'objet formaté
      formattedItems.push({
        id: item.id.toString(),
        name: item.name,
        creator: item.author.username,
        creatorId: item.author.id.toString(),
        albumId: item.album.id.toString(),
        albumName: item.album.name,
        image: albumInfo.imagePath,
        categories: albumInfo.categories,
        status: item.private ? 'private' : 'public',
        created: item.createdAt,
        description: item.description
      });
    }
    
    // Mettre à jour les catégories disponibles
    setAvailableCategories(Array.from(allCategories));
    
    return formattedItems;
  };

  // Charger les données du contenu
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Déterminer l'endpoint API en fonction du type de contenu
        const endpoint = `/${contentType}`;
        
        const response = await api.get<ContentResponse>(endpoint);
        const formattedData = await formatContentData(response.data.data);
        setContentItems(formattedData);
      } catch (err) {
        console.error(`Erreur lors du chargement des ${contentTypeName}:`, err);
        setError(`Impossible de charger les ${contentTypeName}. Veuillez réessayer plus tard.`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchContent();
  }, [contentType, contentTypeName]);

  // Filtrer et trier le contenu
  const getFilteredContent = () => {
    return contentItems
      .filter(item => {
        // Filtre de recherche
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = item.name.toLowerCase().includes(searchLower) || 
                          item.creator.toLowerCase().includes(searchLower) ||
                          item.albumName.toLowerCase().includes(searchLower);
        
        // Filtre de statut
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
        
        // Filtre de catégorie
        const matchesCategory = categoryFilter === 'all' || 
                              item.categories.includes(categoryFilter);
        
        return matchesSearch && matchesStatus && matchesCategory;
      })
      .sort((a, b) => {
        // Tri
        switch (sortBy) {
          case 'newest':
            return new Date(b.created).getTime() - new Date(a.created).getTime();
          case 'oldest':
            return new Date(a.created).getTime() - new Date(b.created).getTime();
          case 'alphabetical':
            return a.name.localeCompare(b.name);
          default:
            return 0;
        }
      });
  };

  // Modifier la visibilité d'un élément (public/privé)
  const handleTogglePrivacy = async (item: ContentItemFormatted) => {
    try {
      const newPrivacy = item.status === 'public';
      
      await api.put(`/${contentType}/${item.id}`, {
        private: newPrivacy
      });
      
      // Mettre à jour l'état local
      setContentItems(contentItems.map(content => 
        content.id === item.id ? { ...content, status: newPrivacy ? 'private' : 'public' } : content
      ));
      
      alert(`La visibilité de "${item.name}" a été modifiée avec succès.`);
    } catch (err) {
      console.error('Erreur lors de la modification de la visibilité:', err);
      alert('Une erreur est survenue lors de la modification de la visibilité.');
    } finally {
      setShowModal(false);
      setSelectedItem(null);
    }
  };

  // Supprimer un élément
  const handleDeleteContent = async (item: ContentItemFormatted) => {
    try {
      await api.delete(`/${contentType}/${item.id}`);
      
      // Mettre à jour l'état local
      setContentItems(contentItems.filter(content => content.id !== item.id));
      
      alert(`"${item.name}" a été supprimé avec succès.`);
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      alert('Une erreur est survenue lors de la suppression.');
    } finally {
      setShowModal(false);
      setSelectedItem(null);
    }
  };

  // Ouvrir la modal de confirmation
  const openConfirmationModal = (action: 'privacy' | 'delete', item: ContentItemFormatted) => {
    setSelectedItem(item);
    setModalAction(action);
    setShowModal(true);
  };

  // Traiter l'action confirmée dans la modal
  const handleConfirmAction = () => {
    if (!selectedItem) return;
    
    switch (modalAction) {
      case 'privacy':
        handleTogglePrivacy(selectedItem);
        break;
      case 'delete':
        handleDeleteContent(selectedItem);
        break;
    }
  };

  // Afficher les badges de catégorie
  const renderCategoryTags = (categories: string[]) => (
    <div className="category-tags">
      {categories.map((category, index) => (
        <span key={index} className="category-tag">{category}</span>
      ))}
    </div>
  );

  // Rendu du contenu filtré
  const filteredContent = getFilteredContent();

  if (loading) {
    return <div className="loading-container"><div className="loading-spinner"></div></div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="admin-table-container">
      <div className="admin-toolbar">
        <div className="admin-search-container">
          <input
            type="text"
            placeholder={`Rechercher un ${contentTypeName.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-search"
          />
        </div>
        <div className="admin-filters">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)} 
            className="admin-filter-select"
          >
            <option value="all">Tous les statuts</option>
            <option value="public">Public</option>
            <option value="private">Privé</option>
          </select>
          
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)} 
            className="admin-filter-select"
          >
            <option value="all">Toutes les catégories</option>
            {availableCategories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)} 
            className="admin-filter-select"
          >
            <option value="newest">Plus récents</option>
            <option value="oldest">Plus anciens</option>
            <option value="alphabetical">Alphabétique</option>
          </select>
        </div>
      </div>
      
      {filteredContent.length === 0 ? (
        <div className="no-results">
          <p>Aucun {contentTypeName.toLowerCase()} ne correspond à votre recherche</p>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>Créateur</th>
              <th>Album</th>
              <th>Catégories</th>
              <th>Date de création</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredContent.map((item) => (
              <tr key={item.id}>
                <td className="id-cell">{item.id}</td>
                <td title={item.description}>{item.name}</td>
                <td>{item.creator}</td>
                <td>{item.albumName}</td>
                <td>{renderCategoryTags(item.categories)}</td>
                <td>{new Date(item.created).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge ${item.status}`}>
                    {item.status === "public" ? "Public" : "Privé"}
                  </span>
                </td>
                <td className="actions-cell">
                  <button
                    className="admin-action-btn privacy"
                    onClick={() => openConfirmationModal('privacy', item)}
                  >
                    {item.status === "private" ? "Rendre Public" : "Rendre Privé"}
                  </button>
                  <button
                    className="admin-action-btn delete"
                    onClick={() => openConfirmationModal('delete', item)}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      {/* Modal de confirmation */}
      {showModal && selectedItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Confirmation</h2>
            {modalAction === 'privacy' ? (
              <p>
                Êtes-vous sûr de vouloir rendre <strong>{selectedItem.name}</strong> {selectedItem.status === 'public' ? 'privé' : 'public'} ?
              </p>
            ) : (
              <p>
                Êtes-vous sûr de vouloir supprimer <strong>{selectedItem.name}</strong> ? Cette action est irréversible.
              </p>
            )}
            <div className="modal-actions">
              <button onClick={() => setShowModal(false)}>Annuler</button>
              <button 
                className={`confirm-${modalAction}`} 
                onClick={handleConfirmAction}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContentManagement;