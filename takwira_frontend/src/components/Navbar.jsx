import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Trophy, LogOut, User, LayoutDashboard, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="logo">
          <div className="logo-icon"><Trophy size={24} color="white" /></div>
          <span className="logo-text">TAKWIRA</span>
        </Link>

        <ul className="nav-links">
          <li><Link to="/" className={location.pathname === '/' ? 'active' : ''}>Accueil</Link></li>
          <li><Link to="/terrains" className={location.pathname === '/terrains' ? 'active' : ''}>Terrains</Link></li>
          <li><Link to="/tournaments" className={location.pathname === '/tournaments' ? 'active' : ''}>Tournois</Link></li>
          {!user && <li><Link to="/pricing" className={location.pathname === '/pricing' ? 'active' : ''}>Tarifs</Link></li>}
          {user && user.role === 'player' && (
            <li>
              <Link to="/dashboard" className={`nav-dash-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                <LayoutDashboard size={14} /> Mon espace
              </Link>
            </li>
          )}
          {user && user.role === 'admin' && (
            <li>
              <Link to="/admin" className={`nav-admin-link ${location.pathname === '/admin' ? 'active' : ''}`}>
                <Shield size={14} /> Admin
              </Link>
            </li>
          )}
        </ul>

        <div className="nav-auth">
          {user ? (
            <div className="user-menu">
              <div className="user-info-nav">
                <span className="user-name">{user.username}</span>
                <div className="user-role-plan">
                  <span className={`user-role-badge ${user.role === 'admin' ? 'admin-badge' : ''}`}>
                    {user.role === 'admin' ? 'Admin' : 'Joueur'}
                  </span>
                  {user.subscription_plan_name && (
                    <span className={`user-plan-badge plan-${user.subscription_plan_name.toLowerCase()}`}>
                      • {user.subscription_plan_name}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={handleLogout} className="btn-logout" title="Déconnexion">
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