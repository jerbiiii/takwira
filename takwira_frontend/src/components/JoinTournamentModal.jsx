import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Trophy, Users, Edit3 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import './CreateTournamentModal.css'; // Re-use modal styling

const JoinTournamentModal = ({ tournament, isOpen, onClose, onSuccess }) => {
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post(`tournaments/${tournament.id}/join/`, { team_name: teamName });
      toast.success(`Équipe "${teamName}" inscrite !`);
      onSuccess();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Une erreur est survenue lors de l\'inscription.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <motion.div 
        className="modal-content tournament-modal small"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >

        <div className="modal-header">
          <div className="header-title">
            <Trophy size={20} className="icon-gold" />
            <h2>S'inscrire au Tournoi</h2>
          </div>
          <button className="close-btn" onClick={onClose}><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="tournament-form">
          <p className="modal-desc">
            Vous allez inscrire une équipe au tournoi <strong>{tournament.name}</strong>.
          </p>
          
          {error && <div className="form-error">{error}</div>}
          
          <div className="form-group">
            <label><Users size={16} /> Nom de votre équipe</label>
            <input 
              type="text" 
              value={teamName} 
              onChange={(e) => setTeamName(e.target.value)} 
              placeholder="Ex: Les Lions de Carthage"
              required 
              autoFocus
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Inscription...' : 'Confirmer l\'inscription'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};


export default JoinTournamentModal;
