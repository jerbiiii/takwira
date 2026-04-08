import { Link } from 'react-router-dom';
import { Trophy, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();

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
          {!user && <li><Link to="/pricing">Tarifs</Link></li>}
        </ul>
        <div className="nav-auth">
          {user ? (
            <div className="user-menu">
              <div className="user-info-nav">
                <span className="user-name">{user.username}</span>
                <span className="user-role-badge">{user.role === 'admin' ? 'Coach (Admin)' : 'Buteur (Joueur)'}</span>
              </div>
              <button onClick={logout} className="btn-logout" title="Déconnexion">
                <LogOut size={20} />
              </button>
            </div>
          ) : (

            <>
              <Link to="/login" className="btn-login-outline">S'identifier</Link>
              <Link to="/register" className="btn-nav">Réserver maintenant</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

