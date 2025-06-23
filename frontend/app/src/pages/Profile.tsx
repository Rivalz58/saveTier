import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import "../styles/Profile.css";
import profil from "../assets/profile.png";
import CategoryCard from "../components/CategoryCard";
import ViewerEditorModal from "../components/ViewerEditorModal";
import AlbumModal from "../components/AlbumModal";
import api, {
  revokeToken,
  isTokenValid,
  getCurrentUser,
} from "../services/api";
import { getUserContent, getUserInfo } from "../services/userContentApi";
import { changePassword as changePasswordApi } from "../services/passwordApi";

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
  categories?: string[];
}

interface AlbumItem extends ContentItem {
  usageCount: number;
}

const Profile: React.FC<ProfileProps> = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState(user || "");
  const [userID, setUserID] = useState<string | null>(null);
  const [isNameModalOpen, setNameModalOpen] = useState(false);
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState(username);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [albums, setAlbums] = useState<AlbumItem[]>([]);
  const [tierlists, setTierlists] = useState<ContentItem[]>([]);
  const [tournois, setTournois] = useState<ContentItem[]>([]);
  const [classements, setClassements] = useState<ContentItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [memberSince, setMemberSince] = useState<string>("26 mars 2025");

  // États pour les nouvelles modales
  const [albumMenuModalOpen, setAlbumMenuModalOpen] = useState(false);
  const [albumModalOpen, setAlbumModalOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumItem | null>(null);
  const [viewerEditorModalOpen, setViewerEditorModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    id: string;
    name: string;
    type: 'tierlist' | 'tournoi' | 'classement';
  } | null>(null);

  

  // Rediriger si non connecté
  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  // Récupérer les informations de l'utilisateur via /me
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!user) return;

      try {
        const userInfo = await getUserInfo();
        setUsername(userInfo.username || user);
        setUserID(userInfo.id.toString());

        // Formater la date d'inscription
        const registerDate = new Date(userInfo.createdAt);
        setMemberSince(
          registerDate.toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
        );
      } catch (err) {
        console.warn("Impossible de récupérer les informations utilisateur:", err);
      }
    };

    fetchUserInfo();
  }, [user]);

  // Charger les données de contenu de l'utilisateur via /me
  useEffect(() => {
    const fetchUserContent = async () => {
      if (!user) return;

      setLoading(true);
      setError(false);

      try {
        const content = await getUserContent();
        
        setAlbums(content.albums);
        setTierlists(content.tierlists);
        setTournois(content.tournaments);
        setClassements(content.rankings);
        
      } catch (globalErr) {
        console.error("Erreur lors de la récupération des données:", globalErr);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchUserContent();
  }, [user]);

  // Fonction pour recharger le contenu utilisateur (appelée après suppression)
  const refreshUserContent = async () => {
    if (!user) return;

    try {
      const content = await getUserContent();
      
      setAlbums(content.albums);
      setTierlists(content.tierlists);
      setTournois(content.tournaments);
      setClassements(content.rankings);
      
    } catch (err) {
      console.error("Erreur lors du rechargement du contenu:", err);
      setError(true);
    }
  };

  // Fonction pour sauvegarder le nom d'utilisateur
  const saveUsername = async () => {
    try {
      await api.put("/me", { username: newUsername });
      setUsername(newUsername);
      setUser(newUsername);
      setNameModalOpen(false);
      alert("Nom d'utilisateur mis à jour avec succès !");
    } catch (err) {
      console.error("Erreur lors de la mise à jour du nom:", err);
      alert("Erreur lors de la mise à jour du nom d'utilisateur.");
    }
  };

  // Fonction pour changer le mot de passe
  const changePassword = async () => {
    setPasswordError("");

    if (newPassword !== confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    try {
      await changePasswordApi(currentPassword, newPassword);
      setPasswordModalOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      alert("Mot de passe mis à jour avec succès !");
    } catch (err) {
      console.error("Erreur lors de la mise à jour du mot de passe:", err);
      setPasswordError("Erreur lors de la mise à jour du mot de passe.");
    }
  };

  // Fonction pour confirmer la déconnexion
  const confirmLogout = () => {
    setUser(null);
    revokeToken();
    setLogoutModalOpen(false);
    navigate("/");
  };

  // Fonction pour changer la visibilité d'un élément
  const toggleVisibility = async (id: string, type: string) => {
    console.log(`Tentative de modification de visibilité pour ${type} ID: ${id}`);
    
    try {
      switch (type) {
        case "album": {
          const albumItem = albums.find((item) => item.id === id);
          if (albumItem) {
            const newStatus = albumItem.isPublic ? "private" : "public";
            console.log(`Envoi requête album: PUT /album/${id}`, { status: newStatus });
            await api.put(`/album/${id}`, { status: newStatus });
            setAlbums(
              albums.map((album) =>
                album.id === id
                  ? { ...album, isPublic: !album.isPublic }
                  : album,
              ),
            );
          }
          break;
        }
        case "tierlist": {
          const tierlistItem = tierlists.find((item) => item.id === id);
          if (tierlistItem) {
            // Si isPublic=true, on veut le rendre privé (private=true)
            // Si isPublic=false, on veut le rendre public (private=false)
            const privateValue = tierlistItem.isPublic;
            console.log(`État actuel: isPublic=${tierlistItem.isPublic}, envoi private=${privateValue}`);
            console.log(`Envoi requête tierlist: PUT /tierlist/${id}`, { private: privateValue });
            const response = await api.put(`/tierlist/${id}`, {
              private: privateValue,
            });
            console.log('Réponse tierlist:', response.status, response.data);
            
            // Utiliser la réponse du serveur pour mettre à jour l'état
            if (response.data && response.data.data) {
              const updatedTierlist = response.data.data;
              setTierlists(
                tierlists.map((item) =>
                  item.id === id 
                    ? { ...item, isPublic: !updatedTierlist.private }
                    : item,
                ),
              );
              console.log(`Nouvel état: isPublic=${!updatedTierlist.private}`);
            }
          }
          break;
        }
        case "tournoi": {
          const tournoiItem = tournois.find((item) => item.id === id);
          if (tournoiItem) {
            // Si isPublic=true, on veut le rendre privé (private=true)
            // Si isPublic=false, on veut le rendre public (private=false)
            const privateValue = tournoiItem.isPublic;
            console.log(`État actuel tournoi: isPublic=${tournoiItem.isPublic}, envoi private=${privateValue}`);
            const response = await api.put(`/tournament/${id}`, {
              private: privateValue,
            });
            console.log('Réponse tournament:', response.status, response.data);
            
            // Utiliser la réponse du serveur pour mettre à jour l'état
            if (response.data && response.data.data) {
              const updatedTournament = response.data.data;
              console.log('Données du tournoi dans la réponse:', updatedTournament);
              console.log('updatedTournament.private =', updatedTournament.private);
              setTournois(
                tournois.map((item) =>
                  item.id === id 
                    ? { ...item, isPublic: !updatedTournament.private }
                    : item,
                ),
              );
              console.log(`Nouvel état tournoi: isPublic=${!updatedTournament.private}`);
            }
          }
          break;
        }
        case "classement": {
          const classementItem = classements.find((item) => item.id === id);
          if (classementItem) {
            // Si isPublic=true, on veut le rendre privé (private=true)
            // Si isPublic=false, on veut le rendre public (private=false)
            const privateValue = classementItem.isPublic;
            console.log(`État actuel classement: isPublic=${classementItem.isPublic}, envoi private=${privateValue}`);
            const response = await api.put(`/ranking/${id}`, {
              private: privateValue,
            });
            console.log('Réponse ranking:', response.status, response.data);
            
            // Utiliser la réponse du serveur pour mettre à jour l'état
            if (response.data && response.data.data) {
              const updatedRanking = response.data.data;
              setClassements(
                classements.map((item) =>
                  item.id === id 
                    ? { ...item, isPublic: !updatedRanking.private }
                    : item,
                ),
              );
              console.log(`Nouvel état classement: isPublic=${!updatedRanking.private}`);
            }
          }
          break;
        }
      }
    } catch (err) {
      console.error(
        `Erreur lors de la modification de la visibilité pour ${type}:`,
        err,
      );
      
      // Recharger le contenu en cas d'erreur pour remettre l'état correct
      await refreshUserContent();
      
      alert(
        "Une erreur est survenue lors de la modification de la visibilité.",
      );
    }
  };

  // Gestionnaire pour le clic sur un album
  const handleAlbumClick = (album: AlbumItem) => {
    setSelectedAlbum(album);
    setAlbumMenuModalOpen(true);
  };

  // Gestionnaires pour les actions d'album
  const handleEditAlbum = () => {
    if (selectedAlbum) {
      navigate(`/album/edit/${selectedAlbum.id}`);
      setAlbumMenuModalOpen(false);
    }
  };

  const handleCreateFromAlbum = () => {
    if (selectedAlbum) {
      setAlbumMenuModalOpen(false);
      // Ouvrir l'AlbumModal pour choisir le type de tri
      setAlbumModalOpen(true);
    }
  };

  // Gestionnaire pour le clic sur un contenu (tierlist, tournoi, classement)
  const handleItemClick = (item: ContentItem, type: string) => {
    const itemType = type.toLowerCase() as 'tierlist' | 'tournoi' | 'classement';
    
    setSelectedItem({
      id: item.id,
      name: item.name,
      type: itemType === 'tierlist' ? 'tierlist' : itemType
    });
    setViewerEditorModalOpen(true);
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar-container">
          <img src={profil} alt="Avatar du profil" className="profile-avatar" />
        </div>
        <div className="profile-info">
          <h2 className="profile-username">{username}</h2>
          <p className="profile-member-since">Membre depuis {memberSince}</p>
          <div className="profile-actions">
            <button
              className="profile-btn edit"
              onClick={() => setNameModalOpen(true)}
            >
              Modifier le pseudo
            </button>
            <button
              className="profile-btn password"
              onClick={() => setPasswordModalOpen(true)}
            >
              Changer mot de passe
            </button>
            <button
              className="profile-btn logout"
              onClick={() => setLogoutModalOpen(true)}
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          Impossible de charger vos données. Veuillez réessayer plus tard.
          <button onClick={() => window.location.reload()}>Réessayer</button>
        </div>
      )}

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
                    <span className="privacy-status">
                      {album.isPublic ? "Public" : "Privé"}
                    </span>
                    <label className="switch small">
                      <input
                        type="checkbox"
                        checked={album.isPublic}
                        onChange={() => toggleVisibility(album.id, "album")}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div onClick={() => handleAlbumClick(album)}>
                    <CategoryCard
                      name={album.name}
                      image={album.image}
                      categories={album.categories}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-section">
              <p>Vous n'avez pas encore créé d'albums</p>
              <button
                className="create-btn"
                onClick={() => navigate("/add-album")}
              >
                Créer votre premier album
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
                    <span className="privacy-status">
                      {tierlist.isPublic ? "Public" : "Privé"}
                    </span>
                    <label className="switch small">
                      <input
                        type="checkbox"
                        checked={tierlist.isPublic}
                        onChange={() => toggleVisibility(tierlist.id, "tierlist")}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div onClick={() => handleItemClick(tierlist, "Tierlist")}>
                    <CategoryCard
                      name={tierlist.name}
                      image={tierlist.image}
                      categories={tierlist.categories}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-section">
              <p>Vous n'avez pas encore créé de tierlists</p>
              <button
                className="create-btn"
                onClick={() => navigate("/allalbum")}
              >
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
                    <span className="privacy-status">
                      {tournoi.isPublic ? "Public" : "Privé"}
                    </span>
                    <label className="switch small">
                      <input
                        type="checkbox"
                        checked={tournoi.isPublic}
                        onChange={() => toggleVisibility(tournoi.id, "tournoi")}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div onClick={() => handleItemClick(tournoi, "Tournoi")}>
                    <CategoryCard
                      name={tournoi.name}
                      image={tournoi.image}
                      categories={tournoi.categories}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-section">
              <p>Vous n'avez pas encore créé de tournois</p>
              <button
                className="create-btn"
                onClick={() => navigate("/allalbum")}
              >
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
                    <span className="privacy-status">
                      {classement.isPublic ? "Public" : "Privé"}
                    </span>
                    <label className="switch small">
                      <input
                        type="checkbox"
                        checked={classement.isPublic}
                        onChange={() => toggleVisibility(classement.id, "classement")}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div onClick={() => handleItemClick(classement, "Classement")}>
                    <CategoryCard
                      name={classement.name}
                      image={classement.image}
                      categories={classement.categories}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-section">
              <p>Vous n'avez pas encore créé de classements</p>
              <button
                className="create-btn"
                onClick={() => navigate("/allalbum")}
              >
                Créer un classement
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal pour changer le nom d'utilisateur */}
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
          <button
            className="cancel-btn"
            onClick={() => setNameModalOpen(false)}
          >
            Annuler
          </button>
          <button className="confirm-btn" onClick={saveUsername}>
            Enregistrer
          </button>
        </div>
      </Modal>

      {/* Modal pour changer le mot de passe */}
      <Modal
        isOpen={isPasswordModalOpen}
        onRequestClose={() => setPasswordModalOpen(false)}
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <h2>Changer votre mot de passe</h2>
        {passwordError && <p className="error-message">{passwordError}</p>}
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
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirmer le nouveau mot de passe"
          className="password-input"
        />
        <div className="modal-actions">
          <button
            className="cancel-btn"
            onClick={() => setPasswordModalOpen(false)}
          >
            Annuler
          </button>
          <button className="confirm-btn" onClick={changePassword}>
            Confirmer
          </button>
        </div>
      </Modal>

      {/* Modal de confirmation de déconnexion */}
      <Modal
        isOpen={isLogoutModalOpen}
        onRequestClose={() => setLogoutModalOpen(false)}
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <h2>Confirmation de déconnexion</h2>
        <p>Êtes-vous sûr de vouloir vous déconnecter ?</p>
        <div className="modal-actions">
          <button
            className="cancel-btn"
            onClick={() => setLogoutModalOpen(false)}
          >
            Annuler
          </button>
          <button className="confirm-btn" onClick={confirmLogout}>
            Confirmer
          </button>
        </div>
      </Modal>

      {/* Modale de menu pour les albums (créer/modifier) */}
      {albumMenuModalOpen && selectedAlbum && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Album "{selectedAlbum.name}"</h2>
            <p>Que souhaitez-vous faire avec cet album ?</p>
            <div className="modal-actions">
              <button className="confirm-btn" onClick={handleCreateFromAlbum}>
                Créer un nouveau tri
              </button>
              <button className="cancel-btn" onClick={handleEditAlbum}>
                Modifier l'album
              </button>
              <button className="cancel-btn" onClick={() => setAlbumMenuModalOpen(false)}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AlbumModal pour choisir le type de tri */}
      {albumModalOpen && selectedAlbum && (
        <AlbumModal
          isOpen={albumModalOpen}
          onClose={() => setAlbumModalOpen(false)}
          albumName={selectedAlbum.name}
          albumId={selectedAlbum.id}
          isUserLoggedIn={true}
          categories={selectedAlbum.categories || []}
        />
      )}

      {/* Modale viewer/editor */}
      {viewerEditorModalOpen && selectedItem && (
        <ViewerEditorModal
          isOpen={viewerEditorModalOpen}
          onClose={() => setViewerEditorModalOpen(false)}
          itemId={selectedItem.id}
          itemName={selectedItem.name}
          itemType={selectedItem.type}
          canEdit={true}
          onItemDeleted={refreshUserContent}
        />
      )}
    </div>
  );
};

export default Profile;