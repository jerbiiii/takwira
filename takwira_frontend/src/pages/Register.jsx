import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import RegisterAnimation from '../components/RegisterAnimation';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    phone: '',
    password: '',
    role: 'player'
  });
  const [error, setError] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || '/';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsAnimating(true);
    setLoading(true);

    const startTime = Date.now();
    const result = await register(formData);
    const endTime = Date.now();
    const duration = endTime - startTime;
    const minDuration = 2500; // Registration animation takes a bit longer to look good

    if (result.success) {
      setLoading(false);
      const remainingTime = Math.max(0, minDuration - duration);
      
      setTimeout(() => {
        navigate('/login', { state: { from } });
      }, remainingTime);
    } else {
      setTimeout(() => {
        setIsAnimating(false);
        setLoading(false);
        setError(result.error);
      }, 1000);
    }
  };

  return (
    <div className="auth-page">
      <motion.div 
        className="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <AnimatePresence mode="wait">
          {isAnimating ? (
            <motion.div
              key="animation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <RegisterAnimation isLoading={loading} />
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="auth-title">Inscription</h2>
              <p className="auth-subtitle">Rejoignez la plus grande communauté de foot en Tunisie !</p>
              
              <form onSubmit={handleSubmit} className="auth-form">
                {error && <div className="auth-error">{typeof error === 'string' ? error : JSON.stringify(error)}</div>}
                
                <div className="form-group">
                  <label>Email</label>
                  <input 
                    type="email" 
                    name="email"
                    placeholder="votre@email.com" 
                    value={formData.email}
                    onChange={handleChange}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Nom d'utilisateur</label>
                  <input 
                    type="text" 
                    name="username"
                    placeholder="Pseudo" 
                    value={formData.username}
                    onChange={handleChange}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Téléphone</label>
                  <input 
                    type="text" 
                    name="phone"
                    placeholder="21 000 000" 
                    value={formData.phone}
                    onChange={handleChange}
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label>Mot de passe</label>
                  <input 
                    type="password" 
                    name="password"
                    placeholder="••••••••" 
                    value={formData.password}
                    onChange={handleChange}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Rôle</label>
                  <select name="role" value={formData.role} onChange={handleChange}>
                    <option value="player">Joueur</option>
                    <option value="owner">Propriétaire de terrain</option>
                  </select>
                </div>
                
                <button type="submit" className="auth-btn">S'inscrire</button>
              </form>
              
              <p className="auth-footer">
                Déjà un compte ? <Link to="/login" state={{ from }}>Se connecter</Link>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Register;
