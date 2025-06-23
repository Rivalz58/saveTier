import React from "react";
import "../styles/LegalPages.css";

const Privacy: React.FC = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1>Politique de confidentialité</h1>
        <p className="last-updated">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

        <section>
          <h2>1. Introduction</h2>
          <p>
            Chez TierHub, nous respectons votre vie privée et nous nous engageons à protéger vos données personnelles. 
            Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations 
            lorsque vous utilisez notre service.
          </p>
        </section>

        <section>
          <h2>2. Informations que nous collectons</h2>
          
          <h3>2.1 Informations que vous nous fournissez</h3>
          <ul>
            <li><strong>Informations de compte :</strong> nom d'utilisateur, adresse e-mail, mot de passe</li>
            <li><strong>Contenu :</strong> images, tierlists, tournois, classements que vous créez</li>
            <li><strong>Communications :</strong> messages que vous nous envoyez</li>
          </ul>

          <h3>2.2 Informations collectées automatiquement</h3>
          <ul>
            <li><strong>Données d'utilisation :</strong> pages visitées, fonctionnalités utilisées, temps passé</li>
            <li><strong>Informations techniques :</strong> adresse IP, type de navigateur, système d'exploitation</li>
            <li><strong>Cookies :</strong> petits fichiers pour améliorer votre expérience</li>
          </ul>
        </section>

        <section>
          <h2>3. Comment nous utilisons vos informations</h2>
          <p>Nous utilisons vos données pour :</p>
          <ul>
            <li>Fournir et maintenir notre service</li>
            <li>Gérer votre compte et authentification</li>
            <li>Afficher votre contenu sur la plateforme</li>
            <li>Améliorer notre service et développer de nouvelles fonctionnalités</li>
            <li>Communiquer avec vous concernant votre compte</li>
            <li>Assurer la sécurité et prévenir les abus</li>
            <li>Respecter nos obligations légales</li>
          </ul>
        </section>

        <section>
          <h2>4. Partage de vos informations</h2>
          <p>Nous ne vendons pas vos données personnelles. Nous pouvons partager vos informations :</p>
          <ul>
            <li><strong>Contenu public :</strong> tierlists, tournois et classements que vous rendez publics</li>
            <li><strong>Fournisseurs de services :</strong> partenaires qui nous aident à fournir notre service</li>
            <li><strong>Conformité légale :</strong> si requis par la loi ou pour protéger nos droits</li>
            <li><strong>Transfert d'entreprise :</strong> en cas de fusion, acquisition ou vente d'actifs</li>
          </ul>
        </section>

        <section>
          <h2>5. Sécurité des données</h2>
          <p>
            Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données personnelles 
            contre l'accès non autorisé, la modification, la divulgation ou la destruction. Cependant, 
            aucune méthode de transmission sur Internet n'est 100% sécurisée.
          </p>
        </section>

        <section>
          <h2>6. Conservation des données</h2>
          <p>
            Nous conservons vos données personnelles aussi longtemps que nécessaire pour fournir notre service 
            et respecter nos obligations légales. Vous pouvez supprimer votre compte à tout moment, 
            ce qui entraînera la suppression de vos données personnelles.
          </p>
        </section>

        <section>
          <h2>7. Vos droits (RGPD)</h2>
          <p>Si vous résidez dans l'Union européenne, vous avez le droit de :</p>
          <ul>
            <li><strong>Accès :</strong> demander une copie de vos données personnelles</li>
            <li><strong>Rectification :</strong> corriger des données inexactes ou incomplètes</li>
            <li><strong>Effacement :</strong> demander la suppression de vos données</li>
            <li><strong>Limitation :</strong> restreindre le traitement de vos données</li>
            <li><strong>Portabilité :</strong> recevoir vos données dans un format structuré</li>
            <li><strong>Opposition :</strong> vous opposer au traitement de vos données</li>
          </ul>
        </section>

        <section>
          <h2>8. Cookies</h2>
          <p>
            Nous utilisons des cookies pour améliorer votre expérience sur TierHub. Les cookies nous aident à :
          </p>
          <ul>
            <li>Maintenir votre session de connexion</li>
            <li>Mémoriser vos préférences</li>
            <li>Analyser l'utilisation de notre service</li>
            <li>Améliorer les performances du site</li>
          </ul>
          <p>Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.</p>
        </section>

        <section>
          <h2>9. Services tiers</h2>
          <p>
            Notre service peut contenir des liens vers des sites web tiers. Nous ne sommes pas responsables 
            des pratiques de confidentialité de ces sites. Nous vous encourageons à lire leurs politiques 
            de confidentialité.
          </p>
        </section>

        <section>
          <h2>10. Utilisateurs mineurs</h2>
          <p>
            Notre service n'est pas destiné aux enfants de moins de 13 ans. Nous ne collectons pas 
            sciemment d'informations personnelles d'enfants de moins de 13 ans. Si vous êtes parent 
            et que vous découvrez que votre enfant nous a fourni des données personnelles, 
            contactez-nous pour les supprimer.
          </p>
        </section>

        <section>
          <h2>11. Modifications de cette politique</h2>
          <p>
            Nous pouvons mettre à jour cette politique de confidentialité de temps à autre. 
            Nous vous notifierons de tout changement important en publiant la nouvelle politique 
            sur cette page et en mettant à jour la date de "dernière mise à jour".
          </p>
        </section>

        <section>
          <h2>12. Contact</h2>
          <p>
            Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits, 
            contactez-nous à : 
            <a href="mailto:contact@tierhub.com" className="legal-link"> contact@tierhub.com</a>
          </p>
          <p>
            <strong>Délégué à la protection des données :</strong><br />
            TierHub - Service Confidentialité<br />
            contact@tierhub.com
          </p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;