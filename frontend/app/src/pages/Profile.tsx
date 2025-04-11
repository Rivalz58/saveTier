/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import "../styles/Profile.css";
import profil from "../assets/ProfileUser.jpg";
import CategoryCard from "../components/CategoryCard";
//import AlbumModal from "../components/AlbumModal";
import api, { revokeToken, isTokenValid, getCurrentUser } from "../services/api";

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
  
  //const [modalOpen, setModalOpen] = useState(false);
  //const [selectedAlbum, setSelectedAlbum] = useState<AlbumItem | null>(null);
  const [memberSince, setMemberSince] = useState<string>("26 mars 2025");

  // Rediriger si non connecté
  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  // Récupérer les informations de l'utilisateur
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!user) return;
      
      try {
        const response = await getCurrentUser();
        if (response && response.data) {
          setUsername(response.data.username || user);
          setUserID(response.data.id.toString());
          
          // Formater la date d'inscription
          const registerDate = new Date(response.data.createdAt);
          setMemberSince(registerDate.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }));
        }
      } catch (err) {
        console.warn("Impossible de récupérer les informations utilisateur:", err);
      }
    };
    
    fetchUserInfo();
  }, [user]);

  // Charger les données de contenu de l'utilisateur
  useEffect(() => {
    const fetchUserContent = async () => {
      if (!user || !userID) return;
      
      setLoading(true);
      setError(false);
      
      try {
        // 1. Récupérer les albums (tous, puis filtrer ceux de l'utilisateur)
        try {
          const albumsResponse = await api.get("/album");
          if (albumsResponse.data && albumsResponse.data.data) {
            // Filtrer seulement les albums de l'utilisateur actuel
            const userAlbums = albumsResponse.data.data
              .filter((album: any) => album.author && album.author.id.toString() === userID)
              .map((album: any) => ({
                id: album.id.toString(),
                name: album.name,
                image: album.image && album.image.length > 0 ? album.image[0].path_image : '/default-image.jpg',
                isPublic: album.status === 'public',
                usageCount: Math.floor(Math.random() * 100) + 10, // Simuler un nombre d'utilisations
                categories: album.categories.map((cat: any) => cat.name)
              }));
            
            setAlbums(userAlbums);
          }
        } catch (err) {
          console.warn("Erreur lors de la récupération des albums:", err);
          // Ne pas utiliser de données par défaut, laisser le tableau vide
        }
        
        // 2. Récupérer les tierlists (tous, puis filtrer ceux de l'utilisateur)
        try {
          const tierlistsResponse = await api.get("/tierlist");
          if (tierlistsResponse.data && tierlistsResponse.data.data) {
            // Filtrer seulement les tierlists de l'utilisateur actuel
            const userTierlists = tierlistsResponse.data.data
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .filter((tierlist: any) => tierlist.author && tierlist.author.id.toString() === userID)
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .map((tierlist: any) => ({
                id: tierlist.id.toString(),
                name: tierlist.name,
                image: tierlist.album && tierlist.album.image && tierlist.album.image.length > 0 
                  ? tierlist.album.image[0].path_image : '/default-image.jpg',
                isPublic: !tierlist.private,
                categories: tierlist.album && tierlist.album.categories 
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ? tierlist.album.categories.map((cat: any) => cat.name) 
                  : []
              }));
            
            setTierlists(userTierlists);
          }
        } catch (err) {
          console.warn("Erreur lors de la récupération des tierlists:", err);
          // Laisser le tableau vide
        }
        
        // 3. Récupérer les tournois (tous, puis filtrer ceux de l'utilisateur)
        try {
          const tournoisResponse = await api.get("/tournament");
          if (tournoisResponse.data && tournoisResponse.data.data) {
            // Filtrer seulement les tournois de l'utilisateur actuel
            const userTournois = tournoisResponse.data.data
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .filter((tournoi: any) => tournoi.author && tournoi.author.id.toString() === userID)
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .map((tournoi: any) => ({
                id: tournoi.id.toString(),
                name: tournoi.name,
                image: tournoi.album && tournoi.album.image && tournoi.album.image.length > 0 
                  ? tournoi.album.image[0].path_image : '/default-image.jpg',
                isPublic: !tournoi.private,
                categories: tournoi.album && tournoi.album.categories 
                  ? tournoi.album.categories.map((cat: any) => cat.name) 
                  : []
              }));
            
            setTournois(userTournois);
          }
        } catch (err) {
          console.warn("Erreur lors de la récupération des tournois:", err);
          // Laisser le tableau vide
        }
        
        // 4. Récupérer les classements (tous, puis filtrer ceux de l'utilisateur)
        try {
          const classementsResponse = await api.get("/ranking");
          if (classementsResponse.data && classementsResponse.data.data) {
            // Filtrer seulement les classements de l'utilisateur actuel
            const userClassements = classementsResponse.data.data
              .filter((classement: any) => classement.author && classement.author.id.toString() === userID)
              .map((classement: any) => ({
                id: classement.id.toString(),
                name: classement.name,
                image: classement.album && classement.album.image && classement.album.image.length > 0 
                  ? classement.album.image[0].path_image : '/default-image.jpg',
                isPublic: !classement.private,
                categories: classement.album && classement.album.categories 
                  ? classement.album.categories.map((cat: any) => cat.name) 
                  : []
              }));
            
            setClassements(userClassements);
          }
        } catch (err) {
          console.warn("Erreur lors de la récupération des classements:", err);
          // Laisser le tableau vide
        }
        
      } catch (err) {
        console.error("Erreur lors de la récupération du contenu:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserContent();
  }, [user, userID]);

  // Déconnexion et révocation du token
  const confirmLogout = async () => {
    try {
      // Tenter de révoquer le token via l'API
      if (isTokenValid()) {
        await revokeToken();
      }
    } catch (err) {
      console.error("Erreur lors de la révocation du token:", err);
    } finally {
      // Toujours supprimer le token et rediriger, même en cas d'échec de l'API
      localStorage.removeItem("token");
      setUser(null);
      setLogoutModalOpen(false);
      navigate("/login");
    }
  };

  // Sauvegarder le nouveau pseudo
  const saveUsername = async () => {
    if (!newUsername.trim() || newUsername === username) {
      setNameModalOpen(false);
      return;
    }
    
    try {
      // Appel à l'API pour mettre à jour le nom d'utilisateur
      await api.put("/me", { username: newUsername });
      setUsername(newUsername);
      setNameModalOpen(false);
      alert("Votre pseudo a été modifié avec succès.");
    } catch (err) {
      console.error("Erreur lors de la mise à jour du pseudo:", err);
      alert("Une erreur est survenue lors de la modification du pseudo.");
    }
  };

  // Changer le mot de passe
  const changePassword = async () => {
    // Réinitialiser le message d'erreur
    setPasswordError("");
    
    // Valider les mots de passe
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Veuillez remplir tous les champs.");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    
    try {
      // Appel à l'API pour changer le mot de passe
      await api.put("/new-password", {
        current_password: currentPassword,
        new_password: newPassword
      });
      
      alert("Votre mot de passe a été modifié avec succès.");
      setPasswordModalOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      // Déconnecter l'utilisateur après changement de mot de passe pour la sécurité
      setTimeout(() => {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("Erreur lors du changement de mot de passe:", err);
      setPasswordError("Erreur: Mot de passe actuel incorrect ou problème de connexion.");
    }
  };

  // Modifier la visibilité d'un élément
  const toggleItemPrivacy = async (id: string, type: "album" | "tierlist" | "tournoi" | "classement") => {
    try {
      // Convertir le type interne aux endpoints API
      const endpoint = type === "tierlist" ? "/tierlist/" : 
                       type === "tournoi" ? "/tournament/" :
                       type === "classement" ? "/ranking/" : "/album/";
      
      // Déterminer l'élément actuel et son état de visibilité
      let currentItem;
      switch (type) {
        case "album":
          currentItem = albums.find(item => item.id === id);
          if (currentItem) {
            // Pour les albums, le statut est "public" ou "private"
            await api.put(`${endpoint}${id}`, { status: currentItem.isPublic ? 'private' : 'public' });
            setAlbums(albums.map(album => album.id === id ? { ...album, isPublic: !album.isPublic } : album));
          }
          break;
        case "tierlist":
          currentItem = tierlists.find(item => item.id === id);
          if (currentItem) {
            // Pour les tierlists, tournois et classements, c'est une propriété "private" (booléen)
            await api.put(`${endpoint}${id}`, { private: !currentItem.isPublic });
            setTierlists(tierlists.map(item => item.id === id ? { ...item, isPublic: !item.isPublic } : item));
          }
          break;
        case "tournoi":
          currentItem = tournois.find(item => item.id === id);
          if (currentItem) {
            await api.put(`${endpoint}${id}`, { private: !currentItem.isPublic });
            setTournois(tournois.map(item => item.id === id ? { ...item, isPublic: !item.isPublic } : item));
          }
          break;
        case "classement":
          currentItem = classements.find(item => item.id === id);
          if (currentItem) {
            await api.put(`${endpoint}${id}`, { private: !currentItem.isPublic });
            setClassements(classements.map(item => item.id === id ? { ...item, isPublic: !item.isPublic } : item));
          }
          break;
      }
    } catch (err) {
      console.error(`Erreur lors de la modification de la visibilité pour ${type}:`, err);
      alert("Une erreur est survenue lors de la modification de la visibilité.");
    }
  };

  // Modifier pour naviguer vers l'éditeur d'album
  const handleAlbumClick = (album: AlbumItem) => {
    // Rediriger vers la page d'édition de l'album
    navigate(`/album/edit/${album.id}`);
  };

  const handleItemClick = (item: ContentItem, type: string) => {
    // Rediriger vers la page appropriée selon le type
    switch (type) {
      case "Tierlist":
        // Option pour visualiser ou modifier
        //const confirmEdit = window.confirm("Souhaitez-vous modifier cette tierlist ? Cliquez sur Annuler pour simplement la visualiser.");
        //if (confirmEdit) {
          // Rediriger vers l'éditeur
          navigate(`/tierlists/edit/${item.id}`);
        //} else {
          // Rediriger vers la page de visualisation
        //  navigate(`/tierlists/${item.id}`);
        //}
        break;
      case "Tournoi":
        navigate(`/tournois/${item.id}`);
        break;
      case "Classement":
        navigate(`/classements/${item.id}`);
        break;
    }
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
              <button className="create-btn" onClick={() => navigate("/allalbum")}>
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
              <button className="create-btn" onClick={() => navigate("/allalbum")}>
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
              <button className="create-btn" onClick={() => navigate("/allalbum")}>
                Créer un classement
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal pour changer le pseudo */}
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
          <button className="cancel-btn" onClick={() => setPasswordModalOpen(false)}>
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
          <button className="cancel-btn" onClick={() => setLogoutModalOpen(false)}>
            Annuler
          </button>
          <button className="confirm-btn" onClick={confirmLogout}>
            Confirmer
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;