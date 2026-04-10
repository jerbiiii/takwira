import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <span className="footer-logo">TAKWIRA</span>
        <div className="footer-links">
          <Link to="/about">À propos</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/privacy">Confidentialité</Link>
        </div>
        <span className="footer-copy">© 2026 Takwira. Tous droits réservés.</span>
      </div>
    </footer>
  );
};

export default Footer;
