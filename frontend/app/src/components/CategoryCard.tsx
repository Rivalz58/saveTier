import React from "react";
import "../styles/CategoryCard.css";

type CategoryProps = {
  name: string;
  image: string;
  categories?: string[]; // Tableau de catégories de l'album
  authorName?: string; // Nom de l'auteur de l'album (optionnel)
};

const CategoryCard: React.FC<CategoryProps> = ({
  name,
  image,
  categories = [],
  authorName,
}) => {
  // Vérifier si l'URL de l'image est valide
  const isValidImageUrl = (url: string) => {
    return url && (url.startsWith("http") || url.startsWith("/"));
  };

  // Image par défaut en cas d'URL invalide
  const defaultImage = "/assets/default-image.jpg";

  // URL de l'image à utiliser
  const imageUrl = isValidImageUrl(image) ? image : defaultImage;

  // Gestion des erreurs lors du chargement de l'image
  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    e.currentTarget.src = defaultImage;
  };

  return (
    <div className="category-card">
      <img src={imageUrl} alt={name} onError={handleImageError} />
      <h3>{name}</h3>

      {/* Afficher les badges de catégories si elles sont fournies */}
      {categories && categories.length > 0 && (
        <div className="card-categories">
          {categories.slice(0, 2).map((category, index) => (
            <span key={index} className="card-category-badge">
              {category}
            </span>
          ))}
          {categories.length > 2 && (
            <span className="card-category-badge">
              +{categories.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Afficher le nom de l'auteur si fourni */}
      {authorName && (
        <div className="card-author">
          <span>Par {authorName}</span>
        </div>
      )}

      {/* Espace pour les futurs compteurs de vues/utilisations */}
      <div className="card-stats">
        {/* 
          Ces éléments seront activés quand l'API fournira les statistiques
          <span className="card-views">
            <i className="views-icon"></i> {views} vues
          </span>
          <span className="card-uses">
            <i className="uses-icon"></i> {uses} utilisations
          </span>
        */}
      </div>
    </div>
  );
};

export default CategoryCard;
