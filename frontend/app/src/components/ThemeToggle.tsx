import React, { useEffect, useState } from "react";
import "../styles/ThemeToggle.css";

interface ThemeToggleProps {
  position?: "navbar" | "sidebar";
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ position = "navbar" }) => {
  // Vérifiez si le thème est déjà stocké, sinon utilisez le thème sombre par défaut
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme ? savedTheme === "dark" : true; // Par défaut thème sombre
  });

  // Fonction pour changer le thème
  const toggleTheme = () => {
    const newTheme = !isDarkTheme;
    setIsDarkTheme(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
    document.documentElement.setAttribute(
      "data-theme",
      newTheme ? "dark" : "light",
    );
  };

  // Appliquer le thème au chargement du composant
  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      isDarkTheme ? "dark" : "light",
    );
  }, [isDarkTheme]);

  return (
    <div className={`theme-toggle ${position}`}>
      <button
        className="theme-toggle-button"
        onClick={toggleTheme}
        aria-label={
          isDarkTheme ? "Passer au thème clair" : "Passer au thème sombre"
        }
        title={isDarkTheme ? "Passer au thème clair" : "Passer au thème sombre"}
      >
        {isDarkTheme ? (
          // Icône pour passer au mode clair
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="theme-icon"
          >
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        ) : (
          // Icône pour passer au mode sombre
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="theme-icon"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        )}
      </button>
    </div>
  );
};

export default ThemeToggle;
