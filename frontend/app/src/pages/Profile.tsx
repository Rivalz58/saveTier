import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import "../styles/Profile.css";
import profil from "../assets/ProfileUser.jpg";
import filmsImage from "../assets/films.jpg";
import CategoryCard from "../components/CategoryCard";
import AlbumModal from "../components/AlbumModal";

Modal.setAppElement("#root");

interface ProfileProps {
  user: string | null;
  setUser: (user: string | null) => void;
}

interface ContentItem {
  id: string;
  name: string;
  image: string;
  isPublic: boolean;
}

interface AlbumItem extends ContentItem {
  usageCount: number;
}

const mockAlbums: AlbumItem[] = [
  { id: "album-001", name: "Films Français", image: filmsImage, usageCount: 210, isPublic: true },
  { id: "album-002", name: "Anime favoris", image: filmsImage, usageCount: 180, isPublic: false },
  { id: "album-003", name: "Personnages Naruto", image: filmsImage, usageCount: 150, isPublic: true },
];

const mockTierlists: ContentItem[] = [
  { id: "tierlist-001", name: "Top 10 Personnages Naruto", image: filmsImage, isPublic: true },
  { id: "tierlist-002", name: "Tierlist One Piece", image: filmsImage, isPublic: false },
];

const mockTournois: ContentItem[] = [
  { id: "tournoi-001", name: "Tournoi Naruto", image: filmsImage, isPublic: true },
  { id: "tournoi-002", name: "Tournoi Disney", image: filmsImage, isPublic: true },
];

const mockClassements: ContentItem[] = [
  { id: "classement-001", name: "Classement acteurs", image: filmsImage, isPublic: false },
  { id: "classement-002", name: "Classement animes", image: filmsImage, isPublic: true },
];

const userStats = {
  memberSince: "15 janvier 2024"
};

const Profile: React.FC<ProfileProps> = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState(user || "");
  const [isNameModalOpen, setNameModalOpen] = useState(false);
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState(username);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [albums, setAlbums] = useState(mockAlbums);
  const [tierlists, setTierlists] = useState(mockTierlists);
  const [tournois, setTournois] = useState(mockTournois);
  const [classements, setClassements] = useState(mockClassements);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumItem | null>(null);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  // Fonction appelée lorsque l'utilisateur confirme la déconnexion
  const confirmLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setLogoutModalOpen(false);
    navigate("/login");
  };

  const saveUsername = () => {
    setUsername(newUsername);
    setNameModalOpen(false);
  };

  const changePassword = () => {
    if (currentPassword && newPassword) {
      alert("Votre mot de passe a été modifié.");
      setPasswordModalOpen(false);
      setCurrentPassword("");
      setNewPassword("");
    } else {
      alert("Veuillez remplir tous les champs.");
    }
  };

  const toggleItemPrivacy = (id: string, type: "album" | "tierlist" | "tournoi" | "classement") => {
    switch (type) {
      case "album":
        setAlbums(albums.map(album => album.id === id ? { ...album, isPublic: !album.isPublic } : album));
        break;
      case "tierlist":
        setTierlists(tierlists.map(tierlist => tierlist.id === id ? { ...tierlist, isPublic: !tierlist.isPublic } : tierlist));
        break;
      case "tournoi":
        setTournois(tournois.map(tournoi => tournoi.id === id ? { ...tournoi, isPublic: !tournoi.isPublic } : tournoi));
        break;
      case "classement":
        setClassements(classements.map(classement => classement.id === id ? { ...classement, isPublic: !classement.isPublic } : classement));
        break;
    }
  };

  const handleAlbumClick = (album: AlbumItem) => {
    setSelectedAlbum(album);
    setModalOpen(true);
  };

  const handleItemClick = (item: ContentItem, type: string) => {
    alert(`${type} "${item.name}" sélectionné!`);
  };

  if (!user) return null;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar-container">
          <img src={profil} alt="Avatar du profil" className="profile-avatar" />
        </div>
        <div className="profile-info">
          <h2 className="profile-username">{username}</h2>
          <p className="profile-member-since">Membre depuis {userStats.memberSince}</p>
          <div className="profile-actions">
            <button className="profile-btn edit" onClick={() => setNameModalOpen(true)}>
              Modifier le pseudo
            </button>
            <button className="profile-btn password" onClick={() => setPasswordModalOpen(true)}>
              Changer mot de passe
            </button>
            <button className="profile-btn logout" onClick={() => setLogoutModalOpen(true)}>
              Déconnexion
            </button>
          </div>
        </div>
      </div>
      
      <div className="profile-content">
        {/* Albums */}
        <div className="profile-section">
          <div className="section-header">
            <h3>Mes Albums</h3>
          </div>
          {albums.length > 0 ? (
            <div className="content-grid">
              {albums.map((album) => (
                <div key={album.id} className="content-card">
                  <div className="content-privacy-toggle">
                    <span className="privacy-status">{album.isPublic ? "Public" : "Privé"}</span>
                    <label className="switch small">
                      <input
                        type="checkbox"
                        checked={album.isPublic}
                        onChange={() => toggleItemPrivacy(album.id, "album")}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="usage-badge">{album.usageCount}</div>
                  <div onClick={() => handleAlbumClick(album)}>
                    <CategoryCard name={album.name} image={album.image} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-section">
              <p>Vous n'avez pas encore créé d'albums</p>
              <button className="create-btn" onClick={() => navigate("/add-album")}>
                Créer un album
              </button>
            </div>
          )}
        </div>
        
        {/* Tierlists */}
        <div className="profile-section">
          <div className="section-header">
            <h3>Mes Tierlists</h3>
          </div>
          {tierlists.length > 0 ? (
            <div className="content-grid">
              {tierlists.map((tierlist) => (
                <div key={tierlist.id} className="content-card">
                  <div className="content-privacy-toggle">
                    <span className="privacy-status">{tierlist.isPublic ? "Public" : "Privé"}</span>
                    <label className="switch small">
                      <input
                        type="checkbox"
                        checked={tierlist.isPublic}
                        onChange={() => toggleItemPrivacy(tierlist.id, "tierlist")}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div onClick={() => handleItemClick(tierlist, "Tierlist")}>
                    <CategoryCard name={tierlist.name} image={tierlist.image} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-section">
              <p>Vous n'avez pas encore créé de tierlists</p>
              <button className="create-btn" onClick={() => navigate("/tierlists")}>
                Créer une tierlist
              </button>
            </div>
          )}
        </div>
        
        {/* Tournois */}
        <div className="profile-section">
          <div className="section-header">
            <h3>Mes Tournois</h3>
          </div>
          {tournois.length > 0 ? (
            <div className="content-grid">
              {tournois.map((tournoi) => (
                <div key={tournoi.id} className="content-card">
                  <div className="content-privacy-toggle">
                    <span className="privacy-status">{tournoi.isPublic ? "Public" : "Privé"}</span>
                    <label className="switch small">
                      <input
                        type="checkbox"
                        checked={tournoi.isPublic}
                        onChange={() => toggleItemPrivacy(tournoi.id, "tournoi")}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div onClick={() => handleItemClick(tournoi, "Tournoi")}>
                    <CategoryCard name={tournoi.name} image={tournoi.image} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-section">
              <p>Vous n'avez pas encore créé de tournois</p>
              <button className="create-btn" onClick={() => navigate("/tournois")}>
                Créer un tournoi
              </button>
            </div>
          )}
        </div>
        
        {/* Classements */}
        <div className="profile-section">
          <div className="section-header">
            <h3>Mes Classements</h3>
          </div>
          {classements.length > 0 ? (
            <div className="content-grid">
              {classements.map((classement) => (
                <div key={classement.id} className="content-card">
                  <div className="content-privacy-toggle">
                    <span className="privacy-status">{classement.isPublic ? "Public" : "Privé"}</span>
                    <label className="switch small">
                      <input
                        type="checkbox"
                        checked={classement.isPublic}
                        onChange={() => toggleItemPrivacy(classement.id, "classement")}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div onClick={() => handleItemClick(classement, "Classement")}>
                    <CategoryCard name={classement.name} image={classement.image} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-section">
              <p>Vous n'avez pas encore créé de classements</p>
              <button className="create-btn" onClick={() => navigate("/classements")}>
                Créer un classement
              </button>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isNameModalOpen}
        onRequestClose={() => setNameModalOpen(false)}
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <h2>Changer votre pseudo</h2>
        <input
          type="text"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
          placeholder="Nouveau pseudo"
        />
        <div className="modal-actions">
          <button className="cancel-btn" onClick={() => setNameModalOpen(false)}>
            Annuler
          </button>
          <button className="confirm-btn" onClick={saveUsername}>
            Enregistrer
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={isPasswordModalOpen}
        onRequestClose={() => setPasswordModalOpen(false)}
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <h2>Changer votre mot de passe</h2>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Mot de passe actuel"
          className="password-input"
        />
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Nouveau mot de passe"
          className="password-input"
        />
        <div className="modal-actions">
          <button className="cancel-btn" onClick={() => setPasswordModalOpen(false)}>
            Annuler
          </button>
          <button className="confirm-btn" onClick={changePassword}>
            Confirmer
          </button>
        </div>
      </Modal>

      {/* Nouvelle popup de confirmation pour la déconnexion */}
      <Modal
        isOpen={isLogoutModalOpen}
        onRequestClose={() => setLogoutModalOpen(false)}
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <h2>Confirmation de déconnexion</h2>
        <p>Êtes-vous sûr de vouloir vous déconnecter ?</p>
        <div className="modal-actions">
          <button className="cancel-btn" onClick={() => setLogoutModalOpen(false)}>
            Annuler
          </button>
          <button className="confirm-btn" onClick={confirmLogout}>
            Confirmer
          </button>
        </div>
      </Modal>

      {selectedAlbum && (
        <AlbumModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          albumName={selectedAlbum.name}
          albumId={selectedAlbum.id}
          isUserLoggedIn={true}
          categories={selectedAlbum.categories}
        />
      )}
    </div>
  );
};

export default Profile;
