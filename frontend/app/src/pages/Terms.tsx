import React from "react";
import "../styles/LegalPages.css";

const Terms: React.FC = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1>Conditions d'utilisation</h1>
        <p className="last-updated">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

        <section>
          <h2>1. Acceptation des conditions</h2>
          <p>
            En accédant et en utilisant TierHub, vous acceptez d'être lié par ces conditions d'utilisation. 
            Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
          </p>
        </section>

        <section>
          <h2>2. Description du service</h2>
          <p>
            TierHub est une plateforme permettant aux utilisateurs de créer, partager et découvrir des tierlists, 
            tournois et classements pour leurs passions. Notre service inclut :
          </p>
          <ul>
            <li>La création et gestion d'albums d'images</li>
            <li>La création de tierlists personnalisées</li>
            <li>L'organisation de tournois entre images</li>
            <li>La création de classements progressifs</li>
            <li>Le partage de contenus avec la communauté</li>
          </ul>
        </section>

        <section>
          <h2>3. Compte utilisateur</h2>
          <p>
            Pour utiliser certaines fonctionnalités de TierHub, vous devez créer un compte. Vous êtes responsable de :
          </p>
          <ul>
            <li>Maintenir la confidentialité de vos informations de connexion</li>
            <li>Toutes les activités qui se produisent sous votre compte</li>
            <li>Nous notifier immédiatement de toute utilisation non autorisée</li>
          </ul>
        </section>

        <section>
          <h2>4. Contenu utilisateur</h2>
          <p>
            Vous conservez la propriété de votre contenu, mais accordez à TierHub une licence pour l'utiliser, 
            l'afficher et le partager sur notre plateforme. Vous vous engagez à ne pas publier de contenu qui :
          </p>
          <ul>
            <li>Viole les droits d'auteur ou autres droits de propriété intellectuelle</li>
            <li>Est illégal, nuisible, menaçant, abusif ou haineux</li>
            <li>Contient des virus ou autres codes malveillants</li>
            <li>Fait la promotion d'activités illégales</li>
          </ul>
        </section>

        <section>
          <h2>5. Utilisation acceptable</h2>
          <p>Vous acceptez de ne pas :</p>
          <ul>
            <li>Utiliser le service à des fins illégales ou non autorisées</li>
            <li>Interférer avec le fonctionnement du service</li>
            <li>Tenter d'accéder aux comptes d'autres utilisateurs</li>
            <li>Publier du spam ou du contenu non sollicité</li>
            <li>Utiliser des robots ou autres moyens automatisés non autorisés</li>
          </ul>
        </section>

        <section>
          <h2>6. Propriété intellectuelle</h2>
          <p>
            TierHub et ses contenus (design, logos, textes, code) sont protégés par les droits d'auteur et 
            autres droits de propriété intellectuelle. Vous ne pouvez pas copier, modifier ou distribuer 
            notre contenu sans autorisation écrite.
          </p>
        </section>

        <section>
          <h2>7. Confidentialité</h2>
          <p>
            Votre vie privée est importante pour nous. Consultez notre 
            <a href="/privacy" className="legal-link"> Politique de confidentialité</a> 
            pour comprendre comment nous collectons et utilisons vos informations.
          </p>
        </section>

        <section>
          <h2>8. Modification du service</h2>
          <p>
            Nous nous réservons le droit de modifier, suspendre ou arrêter tout ou partie du service 
            à tout moment, avec ou sans préavis. Nous ne serons pas responsables envers vous ou 
            des tiers pour toute modification, suspension ou arrêt du service.
          </p>
        </section>

        <section>
          <h2>9. Limitation de responsabilité</h2>
          <p>
            TierHub est fourni "tel quel" sans garanties d'aucune sorte. Nous ne serons pas responsables 
            des dommages directs, indirects, accessoires ou consécutifs résultant de l'utilisation du service.
          </p>
        </section>

        <section>
          <h2>10. Résiliation</h2>
          <p>
            Nous pouvons résilier ou suspendre votre accès au service immédiatement, sans préavis, 
            pour toute raison, y compris en cas de violation de ces conditions.
          </p>
        </section>

        <section>
          <h2>11. Droit applicable</h2>
          <p>
            Ces conditions sont régies par le droit français. Tout litige sera soumis à la juridiction 
            exclusive des tribunaux français.
          </p>
        </section>

        <section>
          <h2>12. Contact</h2>
          <p>
            Pour toute question concernant ces conditions d'utilisation, contactez-nous à : 
            <a href="mailto:contact@tierhub.com" className="legal-link"> contact@tierhub.com</a>
          </p>
        </section>
      </div>
    </div>
  );
};

export default Terms;