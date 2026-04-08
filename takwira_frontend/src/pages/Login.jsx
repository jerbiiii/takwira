import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import LoginAnimation from '../components/LoginAnimation';
import { Trophy } from 'lucide-react';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [submitted, setSubmitted] = useState(false); // hide form while animating

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setIsError(false);
    setIsSuccess(false);
    setSubmitted(true);

    const result = await login(email, password);

    if (result.success) {
      // One final "goal" kick then redirect
      setIsLoading(false);
      setIsSuccess(true);
      toast.success('Bienvenue sur Takwira !');
      // Give the GOAL animation time to play (≈1.6 s)
      setTimeout(() => navigate(from, { replace: true }), 2200);
    } else {
      // Failed login: trigger the "missed" shot animation
      setIsLoading(false);
      setIsError(true);
      toast.error(result.error || 'Email ou mot de passe incorrect.');
      
      // Let the "missed goal" animation play, then restore form
      setTimeout(() => {
        setIsLoading(false);
        setIsSuccess(false);
        setIsError(false);
        setSubmitted(false);
        setError(result.error || 'Email ou mot de passe incorrect.');
      }, 2000);
    }
  };

  return (
    <div className="auth-page">

      {/* ── Left: stadium animation panel ── */}
      <div className="auth-scene-panel">
        <LoginAnimation isLoading={isLoading} isSuccess={isSuccess} isError={isError} />
      </div>

      {/* ── Right: form panel ── */}
      <div className="auth-form-panel">
        <div className="auth-card">

          {/* Brand */}
          <div className="auth-brand">
            <div className="auth-brand-icon">
              <Trophy size={22} color="#fff" />
            </div>
            <span className="auth-brand-name">TAKWIRA</span>
          </div>

          <AnimatePresence mode="wait">
            {submitted && !error ? (
              /* Loading state — minimal text, animation is in the left panel */
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.7 }}
              >
                <h2 className="auth-title" style={{ marginBottom: '1rem' }}>
                  {isSuccess ? 'GOAL !' : 'EN JEU...'}
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
                  {isSuccess
                    ? 'Connexion réussie. Redirection en cours…'
                    : 'Vérification de vos identifiants…'}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <h2 className="auth-title">Connexion</h2>
                <p className="auth-subtitle">
                  Heureux de vous revoir. Prêt pour le match ?
                </p>

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

                  <motion.button
                    type="submit"
                    className="auth-btn"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    disabled={isLoading}
                  >
                    ⚽ Se connecter
                  </motion.button>
                </form>

                <p className="auth-footer">
                  Pas encore de compte ?{' '}
                  <Link to="/register" state={{ from }}>S'inscrire</Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Login;