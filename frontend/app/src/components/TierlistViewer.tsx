/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/TierListEditor.css"; // Réutilisation du CSS existant
import tierlistService from "../services/tierlist-service";
import ImageDetailsModal from "../components/ImageDetailsModal";
interface TierlistViewerProps {
  user: string | null;
}

const TierlistViewer: React.FC<TierlistViewerProps> = ({ user }) => {
  // 2. Ajoutez ces états pour gérer le modal:
  const [imageDetailsModalOpen, setImageDetailsModalOpen] =
    useState<boolean>(false);
  const [selectedImageDetails, setSelectedImageDetails] =
    useState<AlbumImage | null>(null);

  // 3. Ajoutez ces fonctions pour ouvrir et fermer le modal:
  const openImageDetailsModal = (image: AlbumImage) => {
    setSelectedImageDetails(image);
    setImageDetailsModalOpen(true);
  };

  const closeImageDetailsModal = () => {
    setImageDetailsModalOpen(false);
    setSelectedImageDetails(null);
  };
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // États pour les données de tierlist
  const [tierlistName, setTierlistName] = useState<string>("");
  const [tierlistDescription, setTierlistDescription] = useState<string>("");
  const [, /*tierlist*/ setTierlist] = useState<any>(null);
  const [tierLines, setTierLines] = useState<any[]>([]);
  const [unclassifiedImages, setUnclassifiedImages] = useState<any[]>([]);
  const [, /*albumId*/ setAlbumId] = useState<number | null>(null);
  const [albumName, setAlbumName] = useState<string>("");
  const [authorName, setAuthorName] = useState<string>("");
  const [, /*isPrivate*/ setIsPrivate] = useState<boolean>(false);
  const [isAuthor, setIsAuthor] = useState<boolean>(false);

  // États UI
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Chargement des données de la tierlist
  useEffect(() => {
    const fetchTierlistData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        // Récupérer les détails de la tierlist
        const response = await tierlistService.getTierlistWithDetails(
          parseInt(id),
        );

        if (!response || !response.tierlist) {
          throw new Error("Tierlist not found");
        }

        // Mettre à jour les états avec les données reçues
        setTierlist(response.tierlist);
        setTierlistName(response.tierlist.name);
        setTierlistDescription(response.tierlist.description || "");
        setIsPrivate(response.tierlist.private);
        setAlbumId(response.tierlist.id_album);

        // Afficher les données reçues pour le débogage
        console.log("Tierlist détails:", response);
        console.log("Lignes reçues:", response.lines);

        // Séparer les tiers normaux du tier "Non classé"
        const normalTiers = [];
        let unclassifiedTier = null;

        // Parcourir toutes les lignes pour identifier le tier "Non classé"
        for (const line of response.lines) {
          // Vérifier si c'est le tier "Non classé" par placement ou label
          console.log(
            `Analyse de la ligne ${line.id}, placement: ${line.placement}, label: ${line.label}`,
          );

          if (line.placement === 0 || line.label === "Non classé") {
            console.log("Tier Non classé détecté:", line);
            unclassifiedTier = line;
          } else {
            normalTiers.push(line);
          }
        }

        // Trier les tiers normaux par placement
        const sortedLines = normalTiers.sort(
          (a, b) => a.placement - b.placement,
        );
        setTierLines(sortedLines);

        // Définir les images non classées si elles existent
        if (unclassifiedTier && unclassifiedTier.images) {
          console.log(
            "Images non classées détectées:",
            unclassifiedTier.images.length,
          );
          setUnclassifiedImages(unclassifiedTier.images);
        } else {
          console.log("Aucune image non classée trouvée");
          setUnclassifiedImages([]);
        }

        // Récupérer les détails de l'album
        try {
          const albumResponse = await tierlistService.getAlbumImages(
            response.tierlist.id_album.toString(),
          );
          if (albumResponse && albumResponse.length > 0) {
            // L'API ne donne pas directement le nom de l'album, essayons de l'obtenir différemment
            const albumInfo = await fetch(
              `/api/album/${response.tierlist.id_album}`,
            ).then((res) => res.json());
            if (albumInfo && albumInfo.data) {
              setAlbumName(albumInfo.data.name);
              setAuthorName(albumInfo.data.author.username);

              // Vérifier si l'utilisateur actuel est l'auteur
              setIsAuthor(user === albumInfo.data.author.username);
            }
          }
        } catch (albumError) {
          console.error("Error fetching album details:", albumError);
          // Non bloquant, continuer sans ces détails
        }
      } catch (err) {
        console.error("Error loading tierlist:", err);
        setError(
          "Impossible de charger la tierlist. Elle n'existe pas ou vous n'avez pas les permissions nécessaires.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTierlistData();
  }, [id, user]);

  // Gérer le retour à la page précédente
  const handleBack = () => {
    navigate(-1);
  };

  // Gérer l'édition de la tierlist
  const handleEdit = () => {
    // Rediriger vers l'éditeur de tierlist avec l'ID
    navigate(`/tierlists/edit/${id}`);
  };

  // Si chargement en cours
  if (loading) {
    return (
      <div className="tierlist-editor">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement de la tierlist...</p>
        </div>
      </div>
    );
  }

  // Si erreur
  if (error) {
    return (
      <div className="tierlist-editor">
        <div className="error-message">
          <h2>Erreur</h2>
          <p>{error}</p>
          <button onClick={handleBack} className="back-button">
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tierlist-editor">
      {/* En-tête */}
      <div className="tierlist-compact-header">
        <div className="tierlist-title">
          <h1>{tierlistName || "Tierlist sans nom"}</h1>
        </div>

        <div className="tierlist-actions">
          <button className="cancel-button" onClick={handleBack}>
            Retour
          </button>
          {isAuthor && (
            <button className="edit-button" onClick={handleEdit}>
              Modifier
            </button>
          )}
        </div>
      </div>

      {/* Informations de la tierlist */}
      <div className="tierlist-info-panel">
        <div className="tierlist-metadata">
          <p>
            <strong>Album:</strong> {albumName}
          </p>
          <p>
            <strong>Créateur:</strong> {authorName}
          </p>
          {tierlistDescription && (
            <div className="tierlist-description">
              <p>
                <strong>Description:</strong>
              </p>
              <p>{tierlistDescription}</p>
            </div>
          )}
        </div>
      </div>

      {/* Contenu principal de la tierlist (tiers normaux) */}
      <div className="tiers-container">
        {tierLines.map((tier, index) => (
          <div key={tier.id} className="tier">
            <div
              className="tier-label"
              style={{ backgroundColor: `#${tier.color}` }}
            >
              {tier.label || `Tier ${index + 1}`}
            </div>

            <div className="tier-content">
              {tier.images.map((image: any) => (
                <div
                  key={image.id}
                  className="tier-image"
                  title={`${image.name} (Cliquez pour voir les détails)`}
                  onClick={() => openImageDetailsModal(image)}
                  style={{ cursor: "pointer" }}
                >
                  <img src={image.src} alt={image.name} />
                  <div className="image-name">{image.name}</div>
                </div>
              ))}
              {tier.images.length === 0 && (
                <div className="empty-tier-message">
                  Aucune image dans ce tier
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Section pour les images non classées, similaire à TierListEditor */}
      {unclassifiedImages.length > 0 && (
        <div className="unclassified-container">
          <h3>Images non classées</h3>
          <div className="unclassified-images">
            {unclassifiedImages.map((image: any) => (
              <div
                key={image.id}
                className="tier-image"
                title={`${image.name} (Cliquez pour voir les détails)`}
                onClick={() => openImageDetailsModal(image)}
                style={{ cursor: "pointer" }}
              >
                <img src={image.src} alt={image.name} />
                <div className="image-name">{image.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <ImageDetailsModal
        isOpen={imageDetailsModalOpen}
        onClose={closeImageDetailsModal}
        image={selectedImageDetails}
      />
    </div>
  );
};

export default TierlistViewer;
