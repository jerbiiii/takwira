import { useState, useEffect } from 'react';
import { X, Trophy, Calendar, Users, DollarSign, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import DatePicker from './DatePicker';
import './CreateTournamentModal.css';

const CreateTournamentModal = ({ isOpen, onClose, onSuccess, editingTournament = null }) => {
  const [terrains, setTerrains] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    terrain: '',
    start_date: '',
    end_date: '',
    max_teams: 8,
    entry_fee: 0,
    status: 'open'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeDate, setActiveDate] = useState('start'); // 'start' or 'end'

  useEffect(() => {
    if (isOpen) {
      const fetchTerrains = async () => {
        try {
          const res = await api.get('terrains/');
          setTerrains(res.data);

          if (editingTournament) {
            setFormData({
              name: editingTournament.name,
              terrain: editingTournament.terrain,
              start_date: editingTournament.start_date,
              end_date: editingTournament.end_date,
              max_teams: editingTournament.max_teams,
              entry_fee: editingTournament.entry_fee,
              status: editingTournament.status || 'open'
            });
          } else if (res.data.length > 0) {
            setFormData(prev => ({ ...prev, terrain: res.data[0].id }));
          }
        } catch (err) {
          console.error("Error fetching terrains:", err);
        }
      };
      fetchTerrains();
    }
  }, [isOpen, editingTournament]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStartDateChange = (dateStr) => {
    setFormData(prev => {
      const newData = { ...prev, start_date: dateStr };
      // If end_date is before start_date, clear it
      if (prev.end_date && prev.end_date < dateStr) {
        newData.end_date = '';
      }
      return newData;
    });
  };

  const handleEndDateChange = (dateStr) => {
    setFormData(prev => ({ ...prev, end_date: dateStr }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (editingTournament) {
        await api.put(`tournaments/${editingTournament.id}/`, formData);
        toast.success('Tournoi mis à jour !');
      } else {
        await api.post('tournaments/', formData);
        toast.success('Tournoi créé avec succès !');
      }
      onSuccess();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Une erreur est survenue lors de l\'enregistrement du tournoi.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const formatDateFr = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  return (
    <div className="modal-overlay">
      <motion.div
        className="modal-content tournament-modal"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >

        <div className="modal-header">
          <div className="header-title">
            <Trophy className="icon-gold" />
            <h2>{editingTournament ? 'Modifier le Tournoi' : 'Créer un Tournoi'}</h2>
          </div>
          <button className="close-btn" onClick={onClose}><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="tournament-form">
          {error && <div className="form-error">{error}</div>}

          <div className="form-row">
            <div className="form-group">
              <label><Trophy size={16} /> Nom du tournoi</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ex: Coupe du Ramadan 2024"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label><MapPin size={16} /> Terrain</label>
              <select name="terrain" value={formData.terrain} onChange={handleChange} required>
                {terrains.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.city})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date selection tabs + Calendar */}
          <div className="form-row">
            <div className="form-group">
              <label><Calendar size={16} /> Dates du tournoi</label>

              <div className="date-tabs">
                <button
                  type="button"
                  className={`date-tab ${activeDate === 'start' ? 'date-tab--active' : ''}`}
                  onClick={() => setActiveDate('start')}
                >
                  <span className="date-tab__label">Début</span>
                  <span className="date-tab__value">{formatDateFr(formData.start_date)}</span>
                </button>
                <button
                  type="button"
                  className={`date-tab ${activeDate === 'end' ? 'date-tab--active' : ''}`}
                  onClick={() => setActiveDate('end')}
                >
                  <span className="date-tab__label">Fin</span>
                  <span className="date-tab__value">{formatDateFr(formData.end_date)}</span>
                </button>
              </div>

              {formData.terrain && (
                <DatePicker
                  terrainId={formData.terrain}
                  value={activeDate === 'start' ? formData.start_date : formData.end_date}
                  onChange={activeDate === 'start' ? handleStartDateChange : handleEndDateChange}
                  dark={true}
                />
              )}
            </div>
          </div>

          <div className="form-row split">
            <div className="form-group">
              <label><Users size={16} /> Max Équipes</label>
              <input
                type="number"
                name="max_teams"
                value={formData.max_teams}
                onChange={handleChange}
                min="2"
                required
              />
            </div>
            <div className="form-group">
              <label><DollarSign size={16} /> Frais (TND)</label>
              <input
                type="number"
                name="entry_fee"
                value={formData.entry_fee}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          {editingTournament && (
            <div className="form-row">
              <div className="form-group">
                <label>Statut</label>
                <select name="status" value={formData.status} onChange={handleChange}>
                  <option value="open">Ouvert</option>
                  <option value="ongoing">En cours</option>
                  <option value="finished">Terminé</option>
                </select>
              </div>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Annuler</button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading || !formData.start_date || !formData.end_date}
            >
              {loading ? 'Enregistrement...' : editingTournament ? 'Mettre à jour' : 'Créer le tournoi'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};


export default CreateTournamentModal;