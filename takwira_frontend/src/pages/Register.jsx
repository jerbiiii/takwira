import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import RegisterAnimation from '../components/RegisterAnimation';
import { Trophy } from 'lucide-react';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '', username: '', phone: '', password: '', role: 'player',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setSubmitted(true);

    const result = await register(formData);

    if (result.success) {
      setIsLoading(false);
      setIsSuccess(true);
      toast.success('Compte créé ! Bienvenue dans l\'équipe.');
      // Let the card reveal animation play fully (≈5s)
      setTimeout(() => navigate('/pricing'), 5500);
    } else {
      setTimeout(() => {
        setIsLoading(false);
        setIsSuccess(false);
        setSubmitted(false);
        const err = result.error;
        if (typeof err === 'object') {
          const msgs = Object.values(err).flat();
          const fullMessage = msgs.join(' ');
          setError(fullMessage);
          toast.error(fullMessage);
        } else {
          const fullMessage = err || 'Une erreur est survenue.';
          setError(fullMessage);
          toast.error(fullMessage);
        }
      }, 1200);
    }
  };

  return (
    <div className="auth-page">

      {/* ── Left: contract animation panel ── */}
      <div className="auth-scene-panel">
        <RegisterAnimation isLoading={isLoading} isSuccess={isSuccess} username={formData.username} />
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
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <h2 className="auth-title" style={{ marginBottom: '1rem' }}>
                  {isSuccess ? 'CONTRAT SIGNÉ !' : 'SIGNATURE...'}
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
                  {isSuccess
                    ? 'Compte créé avec succès. Redirection vers les plans…'
                    : 'Création de votre compte en cours…'}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <h2 className="auth-title">Inscription</h2>
                <p className="auth-subtitle">
                  Signez votre contrat !
                </p>

                <form onSubmit={handleSubmit} className="auth-form">
                  {error && (
                    <div className="auth-error">{error}</div>
                  )}

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


                  <motion.button
                    type="submit"
                    className="auth-btn"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    disabled={isLoading}
                  >
                    S'inscrire
                  </motion.button>
                </form>

                <p className="auth-footer">
                  Déjà un compte ?{' '}
                  <Link to="/login" state={{ from }}>Se connecter</Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Register;