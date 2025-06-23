import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import '../styles/TournamentEditor.css'; // Import du CSS pour les styles
import api from "../services/api";
import { getAlbumInfoForContent } from "../services/albumApiExtended";
import ImageDetailsModal from "../components/ImageDetailsModal";

interface TournamentViewerProps {
  user: string | null;
}

// Types pour les données du tournoi
interface TournamentImage {
  id: string;
  name: string;
  description: string | null;
  url: string | null;
  path_image: string;
  score?: number;
  place?: number;
  turn?: number;
  lose?: boolean;
}

interface TournamentAuthor {
  id: number;
  username: string;
  nametag: string;
  status: string;
  last_connection: string;
  createdAt: string;
  updatedAt: string;
}

interface TournamentData {
  id: number;
  name: string;
  description: string;
  turn: number;
  private: boolean;
  createdAt: string;
  updatedAt: string;
  author: TournamentAuthor;
  album: {
    id: number;
    name: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    author: TournamentAuthor;
  };
  tournamentImage: Array<{
    id: number;
    lose: boolean;
    place: number;
    turn: number;
    disable: boolean;
    createdAt: string;
    updatedAt: string;
    image: TournamentImage;
    tournamentOponent: any[]; // Nous pouvons définir un type plus précis si nécessaire
  }>;
}

const TournamentViewer: React.FC<TournamentViewerProps> = ({ user }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [imageDetailsModalOpen, setImageDetailsModalOpen] =
    useState<boolean>(false);
  const [selectedImageDetails, setSelectedImageDetails] =
    useState<TournamentImage | null>(null);
  const openImageDetailsModal = (image: TournamentImage) => {
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
  const [tournamentData, setTournamentData] = useState<TournamentData | null>(
    null,
  );
  const [albumInfo, setAlbumInfo] = useState<{
    categories: string[];
    imagePath: string;
  }>({
    categories: [],
    imagePath: "/default-image.jpg",
  });
  const [rankedImages, setRankedImages] = useState<{
    [round: number]: TournamentImage[];
  }>({});
  const [winner, setWinner] = useState<TournamentImage | null>(null);

  // Charger les données du tournoi
  useEffect(() => {
    const fetchTournamentData = async () => {
      try {
        setLoading(true);

        if (!id) {
          throw new Error("Tournament ID is missing");
        }

        // Récupérer les données du tournoi
        const response = await api.get(`/tournament/${id}`);
        if (!response.data || !response.data.data) {
          throw new Error("Tournament not found");
        }

        const tournament = response.data.data;
        setTournamentData(tournament);

        // Récupérer les informations de l'album associé
        try {
          const albumInformation = await getAlbumInfoForContent(
            tournament.album.id,
          );
          setAlbumInfo(albumInformation);
        } catch (albumError) {
          console.error("Error fetching album info:", albumError);
          // Non bloquant, on continue sans ces infos
        }

        // Traiter les images pour les organiser par round
        processImageRanking(tournament);
      } catch (err) {
        console.error("Error loading tournament:", err);
        setError(
          "Unable to load tournament data. It might not exist or you may not have permission to view it.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTournamentData();
  }, [id]);

  // Organiser les images par rounds et déterminer le vainqueur
  const processImageRanking = (tournament: TournamentData) => {
    if (
      !tournament ||
      !tournament.tournamentImage ||
      tournament.tournamentImage.length === 0
    ) {
      return;
    }

    // Créer un objet pour stocker les images par round
    const imagesByRound: { [round: number]: TournamentImage[] } = {};

    // Parcourir toutes les images du tournoi
    tournament.tournamentImage.forEach((item) => {
      const roundNumber = item.turn;

      if (!imagesByRound[roundNumber]) {
        imagesByRound[roundNumber] = [];
      }

      // Ajouter l'image avec ses métadonnées
      const imageData: TournamentImage = {
        ...item.image,
        id: item.image.id.toString(),
        score: roundNumber,
        place: item.place,
        turn: item.turn,
        lose: item.lose,
      };

      imagesByRound[roundNumber].push(imageData);
    });

    // Déterminer le vainqueur
    // Trouver l'image avec le plus haut score (turn le plus élevé) et qui n'a pas perdu
    let winnerImage: TournamentImage | null = null;
    let highestTurn = -1;

    Object.entries(imagesByRound).forEach(([round, images]) => {
      const roundNum = parseInt(round);

      if (roundNum > highestTurn) {
        // Trouver l'image qui n'a pas perdu dans ce round
        const potentialWinner = images.find((img) => !img.lose);

        if (potentialWinner) {
          winnerImage = potentialWinner;
          highestTurn = roundNum;
        }
      }
    });

    setWinner(winnerImage);
    setRankedImages(imagesByRound);
  };

  // Gérer le retour à la page précédente
  const handleBack = () => {
    navigate(-1);
  };

  // Si chargement en cours
  if (loading) {
    return (
      <div className="tournament-viewer">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading tournament...</p>
        </div>
      </div>
    );
  }

  // Si erreur
  if (error) {
    return (
      <div className="tournament-viewer">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={handleBack} className="back-button">
            Back
          </button>
        </div>
      </div>
    );
  }

  // Si aucune donnée
  if (!tournamentData) {
    return (
      <div className="tournament-viewer">
        <div className="error-message">
          <h2>Tournament Not Found</h2>
          <p>
            The tournament you are looking for does not exist or has been
            removed.
          </p>
          <button onClick={handleBack} className="back-button">
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tournament-viewer">
      {/* En-tête compact */}
      <div className="tournament-compact-header">
        <div className="tournament-title">
          <h1>{tournamentData.name}</h1>
        </div>
        <div className="tournament-actions">
          <button className="back-button" onClick={handleBack}>
            Back
          </button>
        </div>
      </div>

      {/* Informations sur le tournoi */}
      <div className="tournament-info-panel">
        <div className="tournament-metadata">
          <div className="album-info">
            <span className="album-label">Album:</span>
            <span className="album-name">{tournamentData.album.name}</span>
            <span className="album-author">par {tournamentData.album.author.username}</span>
          </div>
          <p>
            <strong>Creation date:</strong>{" "}
            {new Date(tournamentData.createdAt).toLocaleDateString()}
          </p>
          {tournamentData.description && (
            <div className="tournament-description">
              <p>
                <strong>Description:</strong>
              </p>
              <p>{tournamentData.description}</p>
            </div>
          )}
          {albumInfo.categories.length > 0 && (
            <div className="tournament-categories">
              <p>
                <strong>Categories:</strong> {albumInfo.categories.join(", ")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Résultats du tournoi */}
      <div className="tournament-results">
        <h2>Tournament Results</h2>

        {/* Affichage du vainqueur */}
        {winner && (
          <div className="winner-card">
            <h3>Champion</h3>
            <div className="winner-image">
              <img
                src={winner.path_image}
                alt={winner.name}
                onClick={() => openImageDetailsModal(winner)}
                style={{ cursor: "pointer" }}
                title="Cliquez pour voir les détails"
              />
              <p className="winner-name">{winner.name}</p>
            </div>
          </div>
        )}

        <h3>Final Rankings</h3>
        <div className="rankings-container">
          {/* Grouper par rounds, le champion est à 0, les finalistes à 1, etc. */}
          {Object.entries(rankedImages)
            .sort(([roundA], [roundB]) => parseInt(roundB) - parseInt(roundA)) // Trier par round décroissant
            .map(([round, images]) => {
              if (images.length === 0) return null;

              const roundNumber = parseInt(round);
              let roundTitle = "";
              let roundGroupClass = "round-group";

              // Attribuer les titres et classes selon le round
              if (roundNumber === tournamentData.turn) {
                roundTitle = "Champion";
                roundGroupClass += " champion-group";
              } else if (roundNumber === tournamentData.turn - 1) {
                roundTitle = "Finalists";
                roundGroupClass += " finalist-group";
              } else if (roundNumber === tournamentData.turn - 2) {
                roundTitle = "Semi-Finalists";
                roundGroupClass += " semifinalist-group";
              } else {
                roundTitle = `Round ${roundNumber}`;
              }

              return (
                <div key={round} className={roundGroupClass}>
                  <h4
                    data-count={`${images.length} ${images.length === 1 ? "image" : "images"}`}
                  >
                    {roundTitle}
                  </h4>
                  <div className="images-group">
                    {images.map((image) => (
                      <div
                        key={image.id}
                        className="result-image"
                        onClick={() => openImageDetailsModal(image)}
                        style={{ cursor: "pointer" }}
                        title="Cliquez pour voir les détails"
                      >
                        <img src={image.path_image} alt={image.name} />
                        <p>{image.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
      <ImageDetailsModal
        isOpen={imageDetailsModalOpen}
        onClose={closeImageDetailsModal}
        image={selectedImageDetails}
      />
    </div>
  );
};

export default TournamentViewer;
