import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, CreditCard, Lock, User as UserIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import DatePicker from './DatePicker';
import TimePicker from './TimePicker';
import './BookingModal.css';

const BookingModal = ({ terrain, isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [occupationData, setOccupationData] = useState({});

  const occupiedSlots = useMemo(() => {
    if (!date || !occupationData[date]) return [];
    return occupationData[date].slots || [];
  }, [date, occupationData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      await api.post('reservations/', {
        terrain: terrain.id,
        date: date,
        start_time: startTime,
        player_name: playerName,
        status: 'confirmed'
      });
      setSuccess(true);
      toast.success('Terrain réservé avec succès !');
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Ce créneau est probablement déjà occupé.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={onClose}>
        <motion.div 
          className="modal-content booking-modal-wide"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
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
                <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                  <label><UserIcon size={16} /> Nom du Joueur / Équipe</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Team Amine ou Mohamed..."
                    className="form-input"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label><Calendar size={16} /> Choisissez une date</label>
                  <DatePicker 
                    terrainId={terrain.id} 
                    value={date} 
                    onChange={setDate} 
                    onOccupiedInfo={setOccupationData}
                  />
                  {date && (
                    <div className="selected-date-badge">
                      📅 {new Date(date + 'T00:00:00').toLocaleDateString('fr-FR', { 
                        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
                      })}
                    </div>
                  )}
                </div>
                
                <div className="form-group" style={{ marginTop: '0.5rem' }}>
                  <label><Clock size={16} /> Heure de début</label>
                  <TimePicker 
                    value={startTime}
                    onChange={setStartTime}
                    occupiedSlots={occupiedSlots}
                  />
                </div>

                <div className="booking-summary">
                  <div className="summary-row">
                    <span>Durée du match</span>
                    <span>2 Heures</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total à payer</span>
                    <span>{parseFloat(terrain.price_per_hour * 2).toFixed(2)} TND</span>
                  </div>
                </div>

                <button type="submit" className="btn-confirm" disabled={loading || !date || !startTime || !playerName}>
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
