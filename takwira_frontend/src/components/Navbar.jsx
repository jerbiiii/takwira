import { Link } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="logo">
          <div className="logo-icon">
            <Trophy size={24} color="white" />
          </div>
          <span className="logo-text">TAKWIRA</span>
        </Link>
        <ul className="nav-links">
          <li><Link to="/">Accueil</Link></li>
          <li><Link to="/terrains">Terrains</Link></li>
          <li><Link to="/tournaments">Tournois</Link></li>
          <li><Link to="/pricing">Tarifs</Link></li>
        </ul>
        <div className="nav-auth">
          <Link to="/terrains" className="btn-nav">Réserver maintenant</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
