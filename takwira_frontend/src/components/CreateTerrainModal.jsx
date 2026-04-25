import { useState, useEffect } from 'react';
import { X, MapPin, Users, Zap, DollarSign, Type } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import './CreateTournamentModal.css'; // Re-using modal styles

const TUNISIAN_GOVERNORATES = [
  "Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès", "Gafsa", "Jendouba", 
  "Kairouan", "Kasserine", "Kébili", "Kef", "Mahdia", "Manouba", "Médenine", 
  "Monastir", "Nabeul", "Sfax", "Sidi Bouzid", "Siliana", "Sousse", 
  "Tataouine", "Tozeur", "Tunis", "Zaghouan"
];

const CreateTerrainModal = ({ isOpen, onClose, onSuccess, editingTerrain = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    address: '',
    price_per_hour: 0,
    surface_type: 'synthetic',
    capacity: 10,
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editingTerrain) {
        setFormData({
          name: editingTerrain.name,
          city: editingTerrain.city,
          address: editingTerrain.address,
          price_per_hour: editingTerrain.price_per_hour,
          surface_type: editingTerrain.surface_type,
          capacity: editingTerrain.capacity,
          is_active: editingTerrain.is_active
        });
      } else {
        setFormData({
          name: '',
          city: '',
          address: '',
          price_per_hour: 0,
          surface_type: 'synthetic',
          capacity: 10,
          is_active: true
        });
      }
    }
  }, [isOpen, editingTerrain]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (editingTerrain) {
        await api.put(`terrains/${editingTerrain.id}/`, formData);
        toast.success('Terrain mis à jour !');
      } else {
        await api.post('terrains/', formData);
        toast.success('Terrain ajouté avec succès !');
      }
      onSuccess();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Une erreur est survenue lors de l\'enregistrement du terrain.';
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
        className="modal-content tournament-modal modal-white"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <div className="modal-header">
          <div className="header-title">
            <Zap className="icon-gold" />
            <h2>{editingTerrain ? 'Modifier le Terrain' : 'Ajouter un Terrain'}</h2>
          </div>
          <button className="close-btn" onClick={onClose}><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="tournament-form">
          {error && <div className="form-error">{error}</div>}
          
          <div className="form-row">
            <div className="form-group">
              <label><Zap size={16} /> Nom du terrain</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="Ex: Stade El Mansoura"
                required 
              />
            </div>
          </div>

          <div className="form-row split">
            <div className="form-group">
              <label><MapPin size={16} /> Gouvernorat</label>
              <select 
                name="city" 
                value={formData.city} 
                onChange={handleChange} 
                required
              >
                <option value="" disabled>Sélectionnez un gouvernorat</option>
                {TUNISIAN_GOVERNORATES.map(gov => (
                  <option key={gov} value={gov}>{gov}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label><MapPin size={16} /> Adresse</label>
              <input 
                type="text" 
                name="address" 
                value={formData.address} 
                onChange={handleChange} 
                placeholder="Ex: Rue 123"
                required 
              />
            </div>
          </div>

          <div className="form-row split">
            <div className="form-group">
              <label><Type size={16} /> Type de surface</label>
              <select name="surface_type" value={formData.surface_type} onChange={handleChange} required>
                <option value="synthetic">Synthétique</option>
                <option value="grass">Gazon</option>
                <option value="concrete">Dur (Béton)</option>
              </select>
            </div>
            <div className="form-group">
              <label><Users size={16} /> Capacité (Joueurs)</label>
              <input 
                type="number" 
                name="capacity" 
                value={formData.capacity} 
                onChange={handleChange} 
                min="2"
                required 
              />
            </div>
          </div>

          <div className="form-row split">
            <div className="form-group">
              <label><DollarSign size={16} /> Prix par heure (TND)</label>
              <input 
                type="number" 
                name="price_per_hour" 
                value={formData.price_per_hour} 
                onChange={handleChange} 
                min="0"
                step="0.01"
                required 
              />
            </div>
            <div className="form-group checkbox-group">
              <label>
                <input 
                  type="checkbox" 
                  name="is_active" 
                  checked={formData.is_active} 
                  onChange={handleChange} 
                />
                Terrain Actif
              </label>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Enregistrement...' : editingTerrain ? 'Mettre à jour' : 'Ajouter le terrain'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>

  );
};

export default CreateTerrainModal;
