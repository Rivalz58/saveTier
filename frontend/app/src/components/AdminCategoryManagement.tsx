import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/Admin.css';

interface Category {
  id: number;
  name: string;
}

interface CategoriesResponse {
  status: string;
  message: string;
  data: Category[];
}

const AdminCategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // États pour la modal
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<'create' | 'edit' | 'delete'>('create');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");

  // Charger les catégories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get<CategoriesResponse>('/category');
        setCategories(response.data.data);
      } catch (err) {
        console.error('Erreur lors du chargement des catégories:', err);
        setError('Impossible de charger les catégories. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  // Filtrer les catégories
  const getFilteredCategories = () => {
    if (!searchQuery.trim()) return categories;
    
    const query = searchQuery.toLowerCase();
    return categories.filter(category => 
      category.name.toLowerCase().includes(query)
    );
  };

  // Créer une nouvelle catégorie
  const handleCreateCategory = async () => {
    try {
      if (!categoryName.trim()) {
        alert('Le nom de la catégorie ne peut pas être vide.');
        return;
      }
      
      const response = await api.post('/category', { name: categoryName });
      
      // Ajouter la nouvelle catégorie à l'état local
      if (response.data && response.data.data) {
        setCategories([...categories, response.data.data]);
        alert(`La catégorie "${categoryName}" a été créée avec succès.`);
      }
    } catch (err) {
      console.error('Erreur lors de la création de la catégorie:', err);
      alert('Une erreur est survenue lors de la création de la catégorie.');
    } finally {
      setShowModal(false);
      setCategoryName("");
    }
  };

  // Modifier une catégorie
  const handleUpdateCategory = async () => {
    try {
      if (!selectedCategory) return;
      
      if (!categoryName.trim()) {
        alert('Le nom de la catégorie ne peut pas être vide.');
        return;
      }
      
      const response = await api.put(`/category/${selectedCategory.id}`, { name: categoryName });
      
      // Mettre à jour l'état local
      if (response.data && response.data.data) {
        setCategories(categories.map(cat => 
          cat.id === selectedCategory.id ? response.data.data : cat
        ));
        alert(`La catégorie a été renommée en "${categoryName}" avec succès.`);
      }
    } catch (err) {
      console.error('Erreur lors de la modification de la catégorie:', err);
      alert('Une erreur est survenue lors de la modification de la catégorie.');
    } finally {
      setShowModal(false);
      setCategoryName("");
      setSelectedCategory(null);
    }
  };

  // Supprimer une catégorie
  const handleDeleteCategory = async () => {
    try {
      if (!selectedCategory) return;
      
      await api.delete(`/category/${selectedCategory.id}`);
      
      // Mettre à jour l'état local
      setCategories(categories.filter(cat => cat.id !== selectedCategory.id));
      alert(`La catégorie "${selectedCategory.name}" a été supprimée avec succès.`);
    } catch (err) {
      console.error('Erreur lors de la suppression de la catégorie:', err);
      alert('Une erreur est survenue lors de la suppression de la catégorie.');
    } finally {
      setShowModal(false);
      setSelectedCategory(null);
    }
  };

  // Ouvrir la modal pour créer une catégorie
  const openCreateModal = () => {
    setModalAction('create');
    setCategoryName("");
    setSelectedCategory(null);
    setShowModal(true);
  };

  // Ouvrir la modal pour modifier une catégorie
  const openEditModal = (category: Category) => {
    setModalAction('edit');
    setSelectedCategory(category);
    setCategoryName(category.name);
    setShowModal(true);
  };

  // Ouvrir la modal pour supprimer une catégorie
  const openDeleteModal = (category: Category) => {
    setModalAction('delete');
    setSelectedCategory(category);
    setShowModal(true);
  };

  // Gérer l'action confirmée dans la modal
  const handleConfirmAction = () => {
    switch (modalAction) {
      case 'create':
        handleCreateCategory();
        break;
      case 'edit':
        handleUpdateCategory();
        break;
      case 'delete':
        handleDeleteCategory();
        break;
    }
  };

  // Rendu des catégories filtrées
  const filteredCategories = getFilteredCategories();

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
            placeholder="Rechercher une catégorie..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-search"
          />
        </div>
        <div className="admin-filters">
          <button 
            className="admin-action-btn add" 
            onClick={openCreateModal}
          >
            Ajouter une catégorie
          </button>
        </div>
      </div>
      
      {filteredCategories.length === 0 ? (
        <div className="no-results">
          <p>Aucune catégorie ne correspond à votre recherche</p>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.map((category) => (
              <tr key={category.id}>
                <td className="id-cell">{category.id}</td>
                <td>{category.name}</td>
                <td className="actions-cell">
                  <button
                    className="admin-action-btn edit"
                    onClick={() => openEditModal(category)}
                  >
                    Modifier
                  </button>
                  <button
                    className="admin-action-btn delete"
                    onClick={() => openDeleteModal(category)}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>
              {modalAction === 'create' ? 'Créer une catégorie' : 
               modalAction === 'edit' ? 'Modifier la catégorie' : 
               'Supprimer la catégorie'}
            </h2>
            
            {modalAction === 'delete' ? (
              <p>
                Êtes-vous sûr de vouloir supprimer la catégorie <strong>{selectedCategory?.name}</strong> ? 
                Cette action est irréversible et supprimera cette catégorie de tous les albums associés.
              </p>
            ) : (
              <>
                <p>
                  {modalAction === 'create' ? 'Entrez le nom de la nouvelle catégorie :' : 'Modifiez le nom de la catégorie :'}
                </p>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Nom de la catégorie"
                  className="admin-input"
                />
              </>
            )}
            
            <div className="modal-actions">
              <button onClick={() => setShowModal(false)}>Annuler</button>
              <button 
                className={`confirm-${modalAction}`} 
                onClick={handleConfirmAction}
                disabled={modalAction !== 'delete' && !categoryName.trim()}
              >
                {modalAction === 'create' ? 'Créer' : 
                 modalAction === 'edit' ? 'Modifier' : 
                 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoryManagement;