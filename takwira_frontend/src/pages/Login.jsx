import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import LoginAnimation from '../components/LoginAnimation';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsAnimating(true);
    setLoading(true);

    const startTime = Date.now();
    const result = await login(email, password);
    const endTime = Date.now();
    const duration = endTime - startTime;
    const minDuration = 2000; // Show animation for at least 2 seconds

    if (result.success) {
      setLoading(false); // Stop the "loading" part of animation (looping)
      const remainingTime = Math.max(0, minDuration - duration);
      
      setTimeout(() => {
        navigate(from, { replace: true });
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
              <LoginAnimation isLoading={loading} />
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="auth-title">Connexion</h2>
              <p className="auth-subtitle">Heureux de vous revoir sur Takwira !</p>
              
              <form onSubmit={handleSubmit} className="auth-form">
                {error && <div className="auth-error">{error}</div>}
                
                <div className="form-group">
                  <label>Email</label>
                  <input 
                    type="email" 
                    placeholder="votre@email.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label>Mot de passe</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </div>
                
                <button type="submit" className="auth-btn">Se connecter</button>
              </form>
              
              <p className="auth-footer">
                Pas encore de compte ? <Link to="/register" state={{ from }}>S'inscrire</Link>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Login;
