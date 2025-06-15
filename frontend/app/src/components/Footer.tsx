import React from "react";
import { Link } from "react-router-dom";
import "../styles/Footer.css";
import logo from "../assets/Logo.png";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-section about">
          <div className="footer-logo">
            <img src={logo} alt="TierHub Logo" />
          </div>
          <p>
            Créez et partagez des tierlist, tournois et classements pour vos
            passions.
          </p>
        </div>

        <div className="footer-section links">
          <h3>Liens rapides</h3>
          <ul>
            <li>
              <Link to="/tierlists">Tierlists</Link>
            </li>
            <li>
              <Link to="/tournois">Tournois</Link>
            </li>
            <li>
              <Link to="/classements">Classements</Link>
            </li>
            <li>
              <Link to="/allalbum">Albums</Link>
            </li>
          </ul>
        </div>

        <div className="footer-section contact">
          <h3>Contact</h3>
          <p>Des questions ou suggestions ?</p>
          <a href="mailto:contact@tierhub.com" className="contact-link">
            contact@tierhub.com
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} TierHub - Tous droits réservés</p>
        <div className="footer-legal">
          <Link to="/terms">Conditions d'utilisation</Link>
          <Link to="/privacy">Politique de confidentialité</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
