import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Admin.css";
import CategoryCard from "../components/CategoryCard";

type TabType = "users" | "tierlists" | "tournaments" | "rankings" | "albums";

interface AdminProps {
  user: string | null;
  isAdmin: boolean;
}

interface User {
  id: string;
  username: string;
  joinDate: string;
  status: "active" | "quarantined";
  email?: string;
  lastLogin?: string;
}

interface ContentItem {
  id: string;
  name: string;
  creator: string;
  creatorId: string;
  image: string;
  categories: string[];
  status: "public" | "private";
  created: string;
  usageCount: number;
}

interface Album {
  id: string;
  name: string;
  creator: string;
  creatorId: string;
  image: string;
  categories: string[];
  status: "public" | "private" | "quarantined";
  itemCount: number;
  created: string;
  usageCount: number;
}

const mockUsers: User[] = [
  { id: "user-001", username: "User1", joinDate: "2023-10-15", status: "active", email: "user1@example.com", lastLogin: "2024-03-10" },
  { id: "user-002", username: "User2", joinDate: "2023-11-20", status: "active", email: "user2@example.com", lastLogin: "2024-03-12" },
  { id: "user-003", username: "User3", joinDate: "2024-01-05", status: "quarantined", email: "user3@example.com", lastLogin: "2024-02-20" },
  { id: "user-004", username: "User4", joinDate: "2024-02-10", status: "active", email: "user4@example.com", lastLogin: "2024-03-15" },
  { id: "user-005", username: "Admin", joinDate: "2023-09-01", status: "active", email: "admin@tierhub.com", lastLogin: "2024-03-18" },
];

const mockTierlists: ContentItem[] = [
  { id: "tierlist-001", name: "Tierlist One Piece", creator: "User1", creatorId: "user-001", image: "/assets/onepiece.jpg", categories: ["Manga", "Animation"], status: "public", created: "2024-02-15", usageCount: 45 },
  { id: "tierlist-002", name: "Tierlist Naruto", creator: "User2", creatorId: "user-002", image: "/assets/naruto.jpg", categories: ["Manga"], status: "public", created: "2024-02-20", usageCount: 32 },
  { id: "tierlist-003", name: "Tierlist Disney", creator: "User3", creatorId: "user-003", image: "/assets/disney.jpg", categories: ["Animation", "Films"], status: "private", created: "2024-03-01", usageCount: 12 },
  { id: "tierlist-004", name: "Tierlist Marvel", creator: "User1", creatorId: "user-001", image: "/assets/marvel.jpg", categories: ["Films", "Autres"], status: "public", created: "2024-03-10", usageCount: 28 },
];

const mockTournaments: ContentItem[] = [
  { id: "tournament-001", name: "Tournoi Naruto", creator: "User2", creatorId: "user-002", image: "/assets/naruto.jpg", categories: ["Manga", "Animation"], status: "public", created: "2024-02-10", usageCount: 75 },
  { id: "tournament-002", name: "Tournoi Disney", creator: "User1", creatorId: "user-001", image: "/assets/disney.jpg", categories: ["Animation", "Films"], status: "public", created: "2024-02-25", usageCount: 60 },
  { id: "tournament-003", name: "Tournoi One Piece", creator: "User4", creatorId: "user-004", image: "/assets/onepiece.jpg", categories: ["Manga"], status: "private", created: "2024-03-05", usageCount: 25 },
];

const mockRankings: ContentItem[] = [
  { id: "ranking-001", name: "Classement acteurs", creator: "User3", creatorId: "user-003", image: "/assets/dicaprio.jpg", categories: ["Films", "Autres"], status: "public", created: "2024-01-20", usageCount: 90 },
  { id: "ranking-002", name: "Classement animes", creator: "User2", creatorId: "user-002", image: "/assets/anime.jpg", categories: ["Animation", "Manga"], status: "public", created: "2024-02-05", usageCount: 65 },
  { id: "ranking-003", name: "Classement films Marvel", creator: "User1", creatorId: "user-001", image: "/assets/marvel.jpg", categories: ["Films"], status: "public", created: "2024-03-08", usageCount: 42 }
];

const mockAlbums: Album[] = [
  { id: "album-001", name: "Films Français", creator: "User1", creatorId: "user-001", image: "/assets/films.jpg", categories: ["Films", "Autres"], status: "public", itemCount: 25, created: "2024-01-15", usageCount: 210 },
  { id: "album-002", name: "Dessins Animés", creator: "Admin", creatorId: "user-005", image: "/assets/cartoons.jpg", categories: ["Animation"], status: "public", itemCount: 32, created: "2023-12-10", usageCount: 180 },
  { id: "album-003", name: "Mangas", creator: "User2", creatorId: "user-002", image: "/assets/manga.jpg", categories: ["Manga", "Animation"], status: "public", itemCount: 40, created: "2024-02-05", usageCount: 320 },
  { id: "album-004", name: "Personnages Naruto", creator: "User3", creatorId: "user-003", image: "/assets/naruto.jpg", categories: ["Manga"], status: "quarantined", itemCount: 18, created: "2024-01-28", usageCount: 150 },
  { id: "album-005", name: "Princesses Disney", creator: "User1", creatorId: "user-001", image: "/assets/disney.jpg", categories: ["Animation", "Films"], status: "public", itemCount: 15, created: "2024-02-15", usageCount: 110 },
  { id: "album-006", name: "One Piece", creator: "Admin", creatorId: "user-005", image: "/assets/onepiece.jpg", categories: ["Manga", "Animation"], status: "public", itemCount: 30, created: "2023-11-20", usageCount: 280 },
];

const Admin: React.FC<AdminProps> = ({ user, isAdmin }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("users");
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [actionType, setActionType] = useState<"quarantine" | "delete" | "private" | "public">("quarantine");
  
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("popular");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Redirection si l'utilisateur n'est pas admin
  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
    }
  }, [isAdmin, navigate]);

  const getMainCategories = () => {
    return ["Films", "Animation", "Manga", "Jeux Vidéo", "Musique", "Sport", "Autres"];
  };

  const applySorting = <T extends { created?: string; username?: string; name?: string; usageCount?: number }>(items: T[]): T[] => {
    return [...items].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created || "").getTime() - new Date(a.created || "").getTime();
        case "oldest":
          return new Date(a.created || "").getTime() - new Date(b.created || "").getTime();
        case "alphabetical":
          return (a.name || a.username || "").localeCompare(b.name || b.username || "");
        case "popular":
          return (b.usageCount || 0) - (a.usageCount || 0);
        default:
          return 0;
      }
    });
  };

  const applyStatusFilter = <T extends { status?: string }>(items: T[]): T[] => {
    if (statusFilter === "all") return items;
    return items.filter(item => item.status === statusFilter);
  };

  const applyCategoryFilter = <T extends { categories?: string[] }>(items: T[]): T[] => {
    if (categoryFilter === "all") return items;
    return items.filter(item => item.categories && item.categories.includes(categoryFilter));
  };

  const applySearchFilter = <T extends { name?: string; username?: string; creator?: string }>(items: T[]): T[] => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase().trim();
    return items.filter(item =>
      (item.name?.toLowerCase().includes(query)) ||
      (item.username?.toLowerCase().includes(query)) ||
      (item.creator?.toLowerCase().includes(query))
    );
  };

  const getFilteredItems = <T extends object>(items: T[]): T[] => {
    return applySorting(applyStatusFilter(applyCategoryFilter(applySearchFilter(items))));
  };

  const handleAction = () => {
    if (!selectedItem) return;
    
    console.log(`Action ${actionType} sur l'élément:`, selectedItem);
    
    let message = "";
    switch (actionType) {
      case "delete":
        message = `L'élément "${selectedItem.name || selectedItem.username}" a été supprimé avec succès.`;
        break;
      case "quarantine":
        message = selectedItem.status === "quarantined"
          ? `L'élément "${selectedItem.name || selectedItem.username}" a été réactivé.`
          : `L'élément "${selectedItem.name || selectedItem.username}" a été mis en quarantaine.`;
        break;
      case "private":
        message = `L'élément "${selectedItem.name}" est maintenant privé.`;
        break;
      case "public":
        message = `L'élément "${selectedItem.name}" est maintenant public.`;
        break;
    }
    
    setShowModal(false);
    alert(message);
  };

  const renderCategoryTags = (categories: string[]) => (
    <div className="category-tags">
      {categories.map((category, index) => (
        <span key={index} className="category-tag">{category}</span>
      ))}
    </div>
  );
  
  const renderTabContent = () => {
    const mainCategories = getMainCategories();
    switch (activeTab) {
      case "users": {
        const filteredUsers = getFilteredItems(mockUsers);
        return (
          <div className="admin-table-container">
            <div className="admin-toolbar">
              <div className="admin-search-container">
                <input
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="admin-search"
                />
              </div>
              <div className="admin-filters">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="admin-filter-select">
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actifs</option>
                  <option value="quarantined">En quarantaine</option>
                </select>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="admin-filter-select">
                  <option value="newest">Plus récents</option>
                  <option value="oldest">Plus anciens</option>
                  <option value="alphabetical">Alphabétique</option>
                </select>
              </div>
            </div>
            {filteredUsers.length === 0 ? (
              <div className="no-results">
                <p>Aucun utilisateur ne correspond à votre recherche</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nom d'utilisateur</th>
                    <th>Inscription</th>
                    <th>Dernière connexion</th>
                    <th>Email</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="id-cell">{user.id}</td>
                      <td>{user.username}</td>
                      <td>{new Date(user.joinDate).toLocaleDateString()}</td>
                      <td>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "N/A"}</td>
                      <td>{user.email || "N/A"}</td>
                      <td>
                        <span className={`status-badge ${user.status}`}>
                          {user.status === "active" ? "Actif" : "En quarantaine"}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button
                          className="admin-action-btn quarantine"
                          onClick={() => {
                            setSelectedItem(user);
                            setActionType("quarantine");
                            setShowModal(true);
                          }}
                          disabled={user.username === "Admin"}
                        >
                          {user.status === "quarantined" ? "Réactiver" : "Quarantaine"}
                        </button>
                        <button
                          className="admin-action-btn delete"
                          onClick={() => {
                            setSelectedItem(user);
                            setActionType("delete");
                            setShowModal(true);
                          }}
                          disabled={user.username === "Admin"}
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );
      }
      case "tierlists":
      case "tournaments":
      case "rankings": {
        const contentData = activeTab === "tierlists" ? mockTierlists : activeTab === "tournaments" ? mockTournaments : mockRankings;
        const filteredContent = getFilteredItems(contentData);
        return (
          <div className="admin-table-container">
            <div className="admin-toolbar">
              <div className="admin-search-container">
                <input
                  type="text"
                  placeholder={`Rechercher un ${
                    activeTab === "tierlists"
                      ? "tierlist"
                      : activeTab === "tournaments"
                      ? "tournoi"
                      : "classement"
                  }...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="admin-search"
                />
              </div>
              <div className="admin-filters">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="admin-filter-select">
                  <option value="all">Tous les statuts</option>
                  <option value="public">Public</option>
                  <option value="private">Privé</option>
                </select>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="admin-filter-select">
                  <option value="all">Toutes les catégories</option>
                  {mainCategories.map((category, idx) => (
                    <option key={idx} value={category}>{category}</option>
                  ))}
                </select>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="admin-filter-select">
                  <option value="popular">Plus utilisés</option>
                  <option value="newest">Plus récents</option>
                  <option value="oldest">Plus anciens</option>
                  <option value="alphabetical">Alphabétique</option>
                </select>
              </div>
            </div>
            {filteredContent.length === 0 ? (
              <div className="no-results">
                <p>Aucun {
                  activeTab === "tierlists"
                    ? "tierlist"
                    : activeTab === "tournaments"
                    ? "tournoi"
                    : "classement"
                } ne correspond à votre recherche</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nom</th>
                    <th>Créateur</th>
                    <th>Catégories</th>
                    <th>Date de création</th>
                    <th>Utilisations</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContent.map((item) => (
                    <tr key={item.id}>
                      <td className="id-cell">{item.id}</td>
                      <td>{item.name}</td>
                      <td>{item.creator}</td>
                      <td>{renderCategoryTags(item.categories)}</td>
                      <td>{new Date(item.created).toLocaleDateString()}</td>
                      <td>{item.usageCount}</td>
                      <td>
                        <span className={`status-badge ${item.status}`}>
                          {item.status === "public" ? "Public" : "Privé"}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button
                          className="admin-action-btn privacy"
                          onClick={() => {
                            setSelectedItem(item);
                            setActionType(item.status === "private" ? "public" : "private");
                            setShowModal(true);
                          }}
                        >
                          {item.status === "private" ? "Rendre Public" : "Rendre Privé"}
                        </button>
                        <button
                          className="admin-action-btn delete"
                          onClick={() => {
                            setSelectedItem(item);
                            setActionType("delete");
                            setShowModal(true);
                          }}
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );
      }
      case "albums": {
        const filteredAlbums = getFilteredItems(mockAlbums);
        return (
          <div>
            <div className="admin-toolbar">
              <div className="admin-search-container">
                <input
                  type="text"
                  placeholder="Rechercher un album..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="admin-search"
                />
              </div>
              <div className="admin-filters">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="admin-filter-select">
                  <option value="all">Tous les statuts</option>
                  <option value="public">Public</option>
                  <option value="private">Privé</option>
                  <option value="quarantined">En quarantaine</option>
                </select>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="admin-filter-select">
                  <option value="all">Toutes les catégories</option>
                  {mainCategories.map((category, idx) => (
                    <option key={idx} value={category}>{category}</option>
                  ))}
                </select>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="admin-filter-select">
                  <option value="popular">Plus utilisés</option>
                  <option value="newest">Plus récents</option>
                  <option value="oldest">Plus anciens</option>
                  <option value="alphabetical">Alphabétique</option>
                </select>
                <button className="admin-action-btn add" onClick={() => navigate("/add-album")}>
                  Ajouter un Album
                </button>
              </div>
            </div>
            {filteredAlbums.length === 0 ? (
              <div className="no-results">
                <p>Aucun album ne correspond à votre recherche</p>
              </div>
            ) : (
              <>
                <h3 className="admin-section-title">Albums ({filteredAlbums.length})</h3>
                <div className="admin-albums-grid">
                  {filteredAlbums.map((album) => (
                    <div key={album.id} className="admin-album-card">
                      <div className="album-id-badge">{album.id}</div>
                      <CategoryCard name={album.name} image={album.image} />
                      <div className="admin-album-overlay">
                        <div className="album-overlay-header">
                          <span className={`status-badge ${album.status}`}>
                            {album.status === "public"
                              ? "Public"
                              : album.status === "private"
                              ? "Privé"
                              : "En quarantaine"}
                          </span>
                        </div>
                        <div className="album-overlay-info">
                          <p><strong>Créateur:</strong> {album.creator}</p>
                          <p><strong>Catégories:</strong></p>
                          {renderCategoryTags(album.categories)}
                          <p><strong>Images:</strong> {album.itemCount}</p>
                          <p><strong>Utilisations:</strong> {album.usageCount}</p>
                          <p><strong>Créé le:</strong> {new Date(album.created).toLocaleDateString()}</p>
                        </div>
                        <div className="admin-album-actions">
                          <button
                            className="admin-action-btn delete"
                            onClick={() => {
                              setSelectedItem(album);
                              setActionType("delete");
                              setShowModal(true);
                            }}
                          >
                            Supprimer
                          </button>
                          <button
                            className="admin-action-btn privacy"
                            onClick={() => {
                              setSelectedItem(album);
                              setActionType(album.status === "private" ? "public" : "private");
                              setShowModal(true);
                            }}
                          >
                            {album.status === "private" ? "Rendre Public" : "Rendre Privé"}
                          </button>
                          <button
                            className="admin-action-btn quarantine"
                            onClick={() => {
                              setSelectedItem(album);
                              setActionType("quarantine");
                              setShowModal(true);
                            }}
                          >
                            {album.status === "quarantined" ? "Réactiver" : "Quarantaine"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        );
      }
      default:
        return <div>Sélectionnez un onglet</div>;
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="admin-container">
      <h1 className="admin-title">Panneau d'Administration</h1>
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === "users" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("users");
            setSearchQuery("");
            setStatusFilter("all");
            setSortBy("newest");
            setCategoryFilter("all");
          }}
        >
          Utilisateurs
        </button>
        <button
          className={`admin-tab ${activeTab === "tierlists" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("tierlists");
            setSearchQuery("");
            setStatusFilter("all");
            setSortBy("popular");
            setCategoryFilter("all");
          }}
        >
          Tierlists
        </button>
        <button
          className={`admin-tab ${activeTab === "tournaments" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("tournaments");
            setSearchQuery("");
            setStatusFilter("all");
            setSortBy("popular");
            setCategoryFilter("all");
          }}
        >
          Tournois
        </button>
        <button
          className={`admin-tab ${activeTab === "rankings" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("rankings");
            setSearchQuery("");
            setStatusFilter("all");
            setSortBy("popular");
            setCategoryFilter("all");
          }}
        >
          Classements
        </button>
        <button
          className={`admin-tab ${activeTab === "albums" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("albums");
            setSearchQuery("");
            setStatusFilter("all");
            setSortBy("popular");
            setCategoryFilter("all");
          }}
        >
          Albums
        </button>
      </div>
      <div className="admin-content">
        {renderTabContent()}
      </div>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Confirmation</h2>
            <p>
              {actionType === "delete" ? (
                <>Êtes-vous sûr de vouloir supprimer <strong>{selectedItem.name || selectedItem.username}</strong> ?</>
              ) : actionType === "quarantine" ? (
                <>Êtes-vous sûr de vouloir {selectedItem.status === "quarantined" ? "réactiver" : "mettre en quarantaine"} <strong>{selectedItem.name || selectedItem.username}</strong> ?</>
              ) : (
                <>Êtes-vous sûr de vouloir rendre <strong>{selectedItem.name}</strong> {actionType === "private" ? "privé" : "public"} ?</>
              )}
            </p>
            <div className="modal-actions">
              <button onClick={() => setShowModal(false)}>Annuler</button>
              <button className={`confirm-${actionType}`} onClick={handleAction}>
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
