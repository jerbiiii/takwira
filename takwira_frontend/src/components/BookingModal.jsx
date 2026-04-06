import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, CreditCard, Lock } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './BookingModal.css';

const BookingModal = ({ terrain, isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return; // Should not happen if UI is protected correctly
    
    setLoading(true);
    try {
      await api.post('reservations/', {
        terrain: terrain.id,
        date: date,
        start_time: startTime,
        end_time: startTime, // Simple logic: assume 1 hour duration
        status: 'confirmed'
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      alert("Erreur lors de la réservation : " + (err.response?.data?.detail || "Vérifiez vos informations"));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={onClose}>
        <motion.div 
          className="modal-content"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="modal-close" onClick={onClose}><X /></button>
          
          {!user ? (
            <div className="auth-required-container">
              <div className="lock-icon"><Lock size={32} /></div>
              <h2>Connexion Requise</h2>
              <p>Vous devez être connecté pour réserver le terrain <strong>{terrain.name}</strong>.</p>
              
              <div className="auth-btns">
                <Link 
                  to="/login" 
                  state={{ from: location.pathname }}
                  className="btn-login"
                >
                  Se connecter
                </Link>
                <Link 
                  to="/register" 
                  state={{ from: location.pathname }}
                  className="btn-register"
                >
                  Créer un compte
                </Link>
              </div>
            </div>
          ) : success ? (
            <div className="booking-success">
              <div className="success-icon">✓</div>
              <h2>Réservation Réussie !</h2>
              <p>Votre créneau pour <strong>{terrain.name}</strong> a été réservé.</p>
            </div>
          ) : (
            <>
              <h2>Réserver {terrain.name}</h2>
              <p className="price-tag">{terrain.price_per_hour} TND / Heure</p>
              
              <form onSubmit={handleSubmit} className="booking-form">
                <div className="form-group">
                  <label><Calendar size={16} /> Date</label>
                  <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label><Clock size={16} /> Heure de début</label>
                  <input 
                    type="time" 
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required 
                  />
                </div>

                <div className="booking-summary">
                  <div className="summary-row">
                    <span>Durée</span>
                    <span>1 Heure</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total à payer</span>
                    <span>{terrain.price_per_hour} TND</span>
                  </div>
                </div>

                <button type="submit" className="btn-confirm" disabled={loading}>
                  {loading ? "Traitement..." : <><CreditCard size={18} /> Confirmer la réservation</>}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BookingModal;
