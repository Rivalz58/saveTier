/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/Admin.css";

interface AlbumImage {
  id: number;
  name: string;
  path_image: string;
}

interface AlbumCategory {
  id: number;
  name: string;
}

interface Album {
  id: number;
  name: string;
  status: "public" | "private" | "quarantined";
  createdAt: string;
  updatedAt: string;
  author: {
    id: number;
    username: string;
  };
  categories: AlbumCategory[];
  images: AlbumImage[];  // CHANGÉ: images au lieu de image
}

interface AlbumFormatted {
  id: string;
  name: string;
  image: string;
  creator: string;
  creatorId: string;
  categories: string[];
  status: "public" | "private" | "quarantined";
  created: string;
  itemCount: number;
}

interface AlbumsResponse {
  status: string;
  message: string;
  data: Album[];
}


const AdminAlbumManagement: React.FC = () => {
  const navigate = useNavigate();
  const [albums, setAlbums] = useState<AlbumFormatted[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  // États pour la modal
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<"status" | "delete">("status");
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumFormatted | null>(
    null,
  );
  const [newStatus, setNewStatus] = useState<
    "public" | "private" | "quarantined"
  >("public");

  // Gérer la navigation vers l'éditeur d'album
  const handleEditAlbum = (albumId: string) => {
    navigate(`/album/edit/${albumId}`, { state: { fromAdmin: true } });
  };

  // Formatter les données des albums
const formatAlbumData = (albums: Album[]): AlbumFormatted[] => {
  const formattedAlbums: AlbumFormatted[] = [];
  const allCategories = new Set<string>();

  for (const album of albums) {
    // Ajouter les catégories au set global
    album.categories.forEach((category) => allCategories.add(category.name));

    // CORRECTION : Utiliser 'images' au lieu de 'image'
    formattedAlbums.push({
      id: album.id.toString(),
      name: album.name,
      image:
        album.images && album.images.length > 0  // CHANGÉ: images au lieu de image
          ? album.images[0].path_image            // CHANGÉ: images au lieu de image
          : "/default-image.jpg",
      creator: album.author.username,
      creatorId: album.author.id.toString(),
      categories: album.categories.map((cat) => cat.name),
      status: album.status,
      created: album.createdAt,
      itemCount: album.images.length,            // CHANGÉ: images au lieu de image
    });
  }

  // Mettre à jour les catégories disponibles
  setAvailableCategories(Array.from(allCategories));

  return formattedAlbums;
};


  // Charger les albums et les statistiques d'utilisation
  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get<AlbumsResponse>("/album");
        const formattedData = formatAlbumData(response.data.data);
        setAlbums(formattedData);

      } catch (err) {
        console.error("Erreur lors du chargement des albums:", err);
        setError(
          "Impossible de charger les albums. Veuillez réessayer plus tard.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, []);

  // Filtrer et trier les albums
  const getFilteredAlbums = () => {
    return albums
      .filter((album) => {
        // Filtre de recherche
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
          album.name.toLowerCase().includes(searchLower) ||
          album.creator.toLowerCase().includes(searchLower) ||
          album.id.includes(searchLower);

        // Filtre de statut
        const matchesStatus =
          statusFilter === "all" || album.status === statusFilter;

        // Filtre de catégorie
        const matchesCategory =
          categoryFilter === "all" || album.categories.includes(categoryFilter);

        return matchesSearch && matchesStatus && matchesCategory;
      })
      .sort((a, b) => {
        // Tri
        switch (sortBy) {
          case "newest":
            return (
              new Date(b.created).getTime() - new Date(a.created).getTime()
            );
          case "oldest":
            return (
              new Date(a.created).getTime() - new Date(b.created).getTime()
            );
          case "alphabetical":
            return a.name.localeCompare(b.name);
          default:
            return 0;
        }
      });
  };

  // Modifier le statut d'un album
  const handleChangeStatus = async () => {
    try {
      if (!selectedAlbum || !newStatus) return;

      console.log(`Changement de statut pour l'album ${selectedAlbum.id}: ${selectedAlbum.status} -> ${newStatus}`);
      
      const response = await api.put(`/album/${selectedAlbum.id}`, {
        status: newStatus,
      });

      console.log("Réponse du changement de statut:", response.data);

      // Mettre à jour l'état local
      setAlbums(
        albums.map((album) =>
          album.id === selectedAlbum.id
            ? { ...album, status: newStatus }
            : album,
        ),
      );

      alert(
        `Le statut de l'album "${selectedAlbum.name}" a été modifié en "${newStatus}".`,
      );
    } catch (err: any) {
      console.error("Erreur lors de la modification du statut:", err);
      console.error("Détails de l'erreur:", err.response?.data);
      
      const errorMessage = err.response?.data?.message || err.message || "Erreur inconnue";
      alert(`Erreur lors de la modification du statut: ${errorMessage}`);
    } finally {
      setShowModal(false);
      setSelectedAlbum(null);
    }
  };

  // Supprimer un album
  const handleDeleteAlbum = async () => {
    try {
      if (!selectedAlbum) return;

      await api.delete(`/album/${selectedAlbum.id}`);

      // Mettre à jour l'état local
      setAlbums(albums.filter((album) => album.id !== selectedAlbum.id));

      alert(`L'album "${selectedAlbum.name}" a été supprimé avec succès.`);
    } catch (err) {
      console.error("Erreur lors de la suppression de l'album:", err);
      alert("Une erreur est survenue lors de la suppression de l'album.");
    } finally {
      setShowModal(false);
      setSelectedAlbum(null);
    }
  };

  // Ouvrir la modal de statut
  const openStatusModal = (album: AlbumFormatted) => {
    setSelectedAlbum(album);
    setNewStatus(album.status);
    setModalAction("status");
    setShowModal(true);
  };

  // Ouvrir la modal de suppression
  const openDeleteModal = (album: AlbumFormatted) => {
    setSelectedAlbum(album);
    setModalAction("delete");
    setShowModal(true);
  };

  // Gérer l'action confirmée dans la modal
  const handleConfirmAction = () => {
    if (modalAction === "status") {
      handleChangeStatus();
    } else if (modalAction === "delete") {
      handleDeleteAlbum();
    }
  };

  // Rendu des badges de catégories
  const renderCategoryTags = (categories: string[]) => (
    <div className="category-tags">
      {categories.map((category, index) => (
        <span key={index} className="category-tag">
          {category}
        </span>
      ))}
    </div>
  );

  // Rendu des albums filtrés
  const filteredAlbums = getFilteredAlbums();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
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
            placeholder="Rechercher un album par nom, créateur ou ID..."
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
            <option value="quarantined">En quarantaine</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="admin-filter-select"
          >
            <option value="all">Toutes les catégories</option>
            {availableCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
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

      {filteredAlbums.length === 0 ? (
        <div className="no-results">
          <p>Aucun album ne correspond à votre recherche</p>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Miniature</th>
              <th>Nom</th>
              <th>Créateur</th>
              <th>Catégories</th>
              <th>Nb Images</th>
              <th>Date de création</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAlbums.map((album) => (
              <tr key={album.id}>
                <td className="id-cell">{album.id}</td>
                <td>
                  <div className="admin-album-thumbnail">
                    <img
                      src={album.image}
                      alt={album.name}
                      width="50"
                      height="50"
                    />
                  </div>
                </td>
                <td>{album.name}</td>
                <td>{album.creator}</td>
                <td>{renderCategoryTags(album.categories)}</td>
                <td>{album.itemCount}</td>
                <td>{new Date(album.created).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge ${album.status}`}>
                    {album.status === "public"
                      ? "Public"
                      : album.status === "private"
                        ? "Privé"
                        : "En quarantaine"}
                  </span>
                </td>
                <td className="actions-cell">
                  <button
                    className="admin-action-btn edit"
                    onClick={() => handleEditAlbum(album.id)}
                  >
                    Éditer
                  </button>
                  <button
                    className="admin-action-btn status"
                    onClick={() => openStatusModal(album)}
                  >
                    Changer statut
                  </button>
                  <button
                    className="admin-action-btn delete"
                    onClick={() => openDeleteModal(album)}
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
      {showModal && selectedAlbum && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Confirmation</h2>
            {modalAction === "status" ? (
              <>
                <p>
                  Modifier le statut de l'album{" "}
                  <strong>{selectedAlbum.name}</strong>:
                </p>
                <select
                  value={newStatus}
                  onChange={(e) =>
                    setNewStatus(
                      e.target.value as "public" | "private" | "quarantined",
                    )
                  }
                  className="status-select"
                >
                  <option value="public">Public</option>
                  <option value="private">Privé</option>
                  <option value="quarantined">En quarantaine</option>
                </select>
              </>
            ) : (
              <p>
                Êtes-vous sûr de vouloir supprimer l'album{" "}
                <strong>{selectedAlbum.name}</strong> ? Cette action est
                irréversible.
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

export default AdminAlbumManagement;
