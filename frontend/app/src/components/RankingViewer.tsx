import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/RankingViewer.css";
import api from "../services/api";
import { getAlbumInfoForContent } from "../services/album-api-extended";
import ImageDetailsModal from "../components/ImageDetailsModal";

interface RankingViewerProps {
  user: string | null;
}

// Types pour les données du classement
interface RankingImage {
  id: string;
  name: string;
  description: string | null;
  url: string | null;
  path_image: string;
  score?: number;
  rank?: number;
}

interface RankingAuthor {
  id: number;
  username: string;
  nametag: string;
  status: string;
  last_connection: string;
  createdAt: string;
  updatedAt: string;
}

interface RankingData {
  id: number;
  name: string;
  description: string;
  private: boolean;
  createdAt: string;
  updatedAt: string;
  author: RankingAuthor;
  album: {
    id: number;
    name: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    author: RankingAuthor;
  };
  rankingImage: Array<{
    id: number;
    rank: number;
    score: number;
    createdAt: string;
    updatedAt: string;
    image: RankingImage;
  }>;
}

const RankingViewer: React.FC<RankingViewerProps> = ({ user }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [imageDetailsModalOpen, setImageDetailsModalOpen] = useState<boolean>(false);
  const [selectedImageDetails, setSelectedImageDetails] = useState<RankingImage | null>(null);

  const openImageDetailsModal = (image: RankingImage) => {
    // Copier l'image et ajouter la propriété src
    const adaptedImage = {
      ...image,
      src: image.path_image,
    };

    setSelectedImageDetails(adaptedImage);
    setImageDetailsModalOpen(true);
  };

  const closeImageDetailsModal = () => {
    setImageDetailsModalOpen(false);
    setSelectedImageDetails(null);
  };

  // États
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [rankingData, setRankingData] = useState<RankingData | null>(null);
  const [albumInfo, setAlbumInfo] = useState<{
    categories: string[];
    imagePath: string;
  }>({
    categories: [],
    imagePath: "/default-image.jpg",
  });
  const [rankedImages, setRankedImages] = useState<RankingImage[]>([]);

  // Charger les données du classement
  useEffect(() => {
    const fetchRankingData = async () => {
      if (!id) {
        setError("ID du classement manquant");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Récupérer les données du classement
        const response = await api.get(`/ranking/${id}`);
        const data: RankingData = response.data.data;

        if (!data) {
          throw new Error("Classement introuvable");
        }

        // Vérifier si le classement est privé et si l'utilisateur est autorisé
        if (data.private && (!user || data.author.id.toString() !== user)) {
          setError("Ce classement est privé");
          setLoading(false);
          return;
        }

        setRankingData(data);

        // Récupérer les informations de l'album
        const albumInfoData = await getAlbumInfoForContent(data.album.id);
        setAlbumInfo(albumInfoData);

        // Traiter et trier les images du classement
        if (data.rankingImage && data.rankingImage.length > 0) {
          const sortedImages = data.rankingImage
            .map((rankingImg) => ({
              ...rankingImg.image,
              rank: rankingImg.rank,
              score: rankingImg.score,
            }))
            .sort((a, b) => a.rank - b.rank); // Trier par rang croissant

          setRankedImages(sortedImages);
        }

        console.log("Données du classement chargées:", data);
      } catch (err: any) {
        console.error("Erreur lors du chargement du classement:", err);
        if (err.response?.status === 404) {
          setError("Classement introuvable");
        } else if (err.response?.status === 403) {
          setError("Accès interdit à ce classement");
        } else {
          setError("Erreur lors du chargement du classement");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRankingData();
  }, [id, user]);

  // Gérer l'édition (seulement pour le propriétaire)
  const handleEdit = () => {
    if (rankingData && user && rankingData.author.id.toString() === user) {
      navigate(`/classements/edit/${id}`);
    }
  };

  // Gérer le retour à la liste
  const handleBackToList = () => {
    navigate("/classements");
  };

  // Fonction pour obtenir le podium (top 3)
  const getPodiumImages = () => {
    return rankedImages.slice(0, 3);
  };

  // Fonction pour obtenir les images après le podium
  const getRemainingImages = () => {
    return rankedImages.slice(3);
  };

  // Formatage de la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="ranking-viewer-container">
        <div className="ranking-viewer-loading">
          <div className="spinner"></div>
          <p>Chargement du classement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ranking-viewer-container">
        <div className="ranking-viewer-error">
          <h2>Erreur</h2>
          <p>{error}</p>
          <button className="ranking-viewer-button" onClick={handleBackToList}>
            Retour aux Classements
          </button>
        </div>
      </div>
    );
  }

  if (!rankingData) {
    return (
      <div className="ranking-viewer-container">
        <div className="ranking-viewer-error">
          <h2>Classement introuvable</h2>
          <button className="ranking-viewer-button" onClick={handleBackToList}>
            Retour aux Classements
          </button>
        </div>
      </div>
    );
  }

  const podiumImages = getPodiumImages();
  const remainingImages = getRemainingImages();

  return (
    <div className="ranking-viewer-container">
      {/* Header */}
      <div className="ranking-viewer-header">
        <div className="ranking-header-content">
          <div className="ranking-title-section">
            <h1>{rankingData.name}</h1>
            {rankingData.description && (
              <p className="ranking-description">{rankingData.description}</p>
            )}
          </div>
          <div className="ranking-actions">
            <button
              className="ranking-viewer-button secondary"
              onClick={handleBackToList}
            >
              Retour
            </button>
            {user && rankingData.author.id.toString() === user && (
              <button
                className="ranking-viewer-button primary"
                onClick={handleEdit}
              >
                Éditer
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Info section */}
      <div className="ranking-info-section">
        <div className="ranking-meta">
          <div className="ranking-author">
            <h3>Créateur</h3>
            <p>@{rankingData.author.nametag}</p>
          </div>
          <div className="ranking-album">
            <h3>Album</h3>
            <p>{rankingData.album.name}</p>
          </div>
          <div className="ranking-date">
            <h3>Créé le</h3>
            <p>{formatDate(rankingData.createdAt)}</p>
          </div>
          <div className="ranking-stats">
            <h3>Images classées</h3>
            <p>{rankedImages.length}</p>
          </div>
        </div>

        {albumInfo.categories.length > 0 && (
          <div className="ranking-categories">
            <h3>Catégories</h3>
            <div className="category-tags">
              {albumInfo.categories.map((category, index) => (
                <span key={index} className="category-tag">
                  {category}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Podium Section */}
      {podiumImages.length > 0 && (
        <div className="ranking-podium-section">
          <h2>Podium</h2>
          <div className="ranking-podium">
            {/* 2ème place */}
            {podiumImages[1] && (
              <div 
                className="podium-position second"
                onClick={() => openImageDetailsModal(podiumImages[1])}
              >
                <div className="podium-rank">2</div>
                <img 
                  src={podiumImages[1].path_image} 
                  alt={podiumImages[1].name}
                  className="podium-image"
                />
                <div className="podium-info">
                  <h3>{podiumImages[1].name}</h3>
                  <p>Score: {podiumImages[1].score}</p>
                </div>
              </div>
            )}

            {/* 1ère place */}
            {podiumImages[0] && (
              <div 
                className="podium-position first"
                onClick={() => openImageDetailsModal(podiumImages[0])}
              >
                <div className="podium-rank winner">1</div>
                <img 
                  src={podiumImages[0].path_image} 
                  alt={podiumImages[0].name}
                  className="podium-image"
                />
                <div className="podium-info">
                  <h3>{podiumImages[0].name}</h3>
                  <p>Score: {podiumImages[0].score}</p>
                </div>
              </div>
            )}

            {/* 3ème place */}
            {podiumImages[2] && (
              <div 
                className="podium-position third"
                onClick={() => openImageDetailsModal(podiumImages[2])}
              >
                <div className="podium-rank">3</div>
                <img 
                  src={podiumImages[2].path_image} 
                  alt={podiumImages[2].name}
                  className="podium-image"
                />
                <div className="podium-info">
                  <h3>{podiumImages[2].name}</h3>
                  <p>Score: {podiumImages[2].score}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Classement complet */}
      <div className="ranking-full-section">
        <h2>Classement Complet</h2>
        <div className="ranking-table">
          <div className="ranking-table-header">
            <span>Rang</span>
            <span>Image</span>
            <span>Nom</span>
            <span>Score</span>
          </div>
          {rankedImages.map((image, index) => (
            <div 
              key={image.id} 
              className={`ranking-table-row ${index < 3 ? 'podium-row' : ''}`}
              onClick={() => openImageDetailsModal(image)}
            >
              <span className="rank-number">
                {index + 1}
                {index === 0 && <span className="trophy">🏆</span>}
                {index === 1 && <span className="trophy">🥈</span>}
                {index === 2 && <span className="trophy">🥉</span>}
              </span>
              <div className="image-cell">
                <img 
                  src={image.path_image} 
                  alt={image.name}
                  className="table-image"
                />
              </div>
              <span className="name-cell">{image.name}</span>
              <span className="score-cell">{image.score}</span>
            </div>
          ))}
        </div>
      </div>

      {rankedImages.length === 0 && (
        <div className="ranking-no-results">
          <h2>Aucune image classée</h2>
          <p>Ce classement ne contient aucune image classée pour le moment.</p>
        </div>
      )}

      {/* Image Details Modal */}
      {selectedImageDetails && (
        <ImageDetailsModal
          isOpen={imageDetailsModalOpen}
          onClose={closeImageDetailsModal}
          image={{
            ...selectedImageDetails,
            src: selectedImageDetails.path_image,
          }}
        />
      )}
    </div>
  );
};

export default RankingViewer;