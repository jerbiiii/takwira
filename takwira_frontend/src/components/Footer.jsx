import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <span className="footer-logo">TAKWIRA</span>
        <div className="footer-links">
          <Link to="#">À propos</Link>
          <Link to="#">Contact</Link>
          <Link to="#">Confidentialité</Link>
        </div>
        <span className="footer-copy">© 2025 Takwira. Tous droits réservés.</span>
      </div>
    </footer>
  );
};

export default Footer;
