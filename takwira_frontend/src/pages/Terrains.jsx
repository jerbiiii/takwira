import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Users, Zap, Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import BookingModal from '../components/BookingModal';
import CreateTerrainModal from '../components/CreateTerrainModal';
import './Terrains.css';

const Terrains = () => {
  const [terrains, setTerrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTerrain, setSelectedTerrain] = useState(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [editingTerrain, setEditingTerrain] = useState(null);
  const { user } = useAuth();

  const fetchTerrains = async () => {
    try {
      const res = await api.get('terrains/');
      setTerrains(res.data);
    } catch (err) {
      console.error("Error fetching terrains:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTerrains();
  }, []);

  const handleBookClick = (terrain) => {
    setSelectedTerrain(terrain);
    setIsBookingOpen(true);
  };

  const handleEdit = (terrain) => {
    setEditingTerrain(terrain);
    setIsManageOpen(true);
  };

  const handleCreate = () => {
    setEditingTerrain(null);
    setIsManageOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce terrain ?")) {
      try {
        await api.delete(`terrains/${id}/`);
        fetchTerrains();
        toast.success('Terrain supprimé.');
      } catch (err) {
        toast.error('Erreur lors de la suppression.');
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  if (loading) {
    return <div className="loading-screen">Chargement des terrains...</div>;
  }

  return (
    <div className="terrains-page">
      <section className="terrains-header">
        <div className="container header-flex-admin">
          <motion.div 
            className="header-content"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="section-title">Explorez les Terrains</h1>
            <p className="section-sub">Trouvez le terrain idéal pour votre prochain match en Tunisie.</p>
          </motion.div>
          {user && user.role === 'admin' && (
            <motion.button 
              className="btn-add-terrain" 
              onClick={handleCreate}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Plus size={20} /> Ajouter un terrain
            </motion.button>
          )}
        </div>
      </section>

      <section className="terrains-list">
        <div className="container">
          <motion.div 
            className="terrains-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {terrains.map((terrain) => (
              <motion.div 
                key={terrain.id} 
                className="terrain-card"
                variants={itemVariants}
                whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
              >
                <div className="terrain-image">
                  <div className="image-placeholder">
                    <Zap size={40} color="rgba(255,255,255,0.3)" />
                  </div>
                  <div className="terrain-price">{terrain.price_per_hour} TND/h</div>
                  
                  {user && user.role === 'admin' && (
                    <div className="admin-actions-overlay">
                      <button className="admin-btn edit" onClick={() => handleEdit(terrain)} title="Modifier">
                        <Edit2 size={16} />
                      </button>
                      <button className="admin-btn delete" onClick={() => handleDelete(terrain.id)} title="Supprimer">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="terrain-info">
                  <div className="terrain-type">{terrain.surface_type}</div>
                  <h3>{terrain.name}</h3>
                  <div className="terrain-meta">
                    <span><MapPin size={14} /> {terrain.city}</span>
                    <span><Users size={14} /> {terrain.capacity} joueurs</span>
                  </div>
                  {user ? (
                    user.role === 'player' ? (
                      <button 
                        className="btn-book"
                        onClick={() => handleBookClick(terrain)}
                      >
                        Réserver
                      </button>
                    ) : (
                      <div className="admin-msg small">Mode Admin : Réservations ouvertes</div>
                    )
                  ) : (
                    <Link to="/login" className="btn-book outline">
                      S'identifier pour réserver
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <AnimatePresence>
        {isBookingOpen && selectedTerrain && (
          <BookingModal 
            terrain={selectedTerrain} 
            isOpen={isBookingOpen} 
            onClose={() => setIsBookingOpen(false)} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isManageOpen && (
          <CreateTerrainModal 
            isOpen={isManageOpen} 
            onClose={() => setIsManageOpen(false)} 
            onSuccess={fetchTerrains} 
            editingTerrain={editingTerrain}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Terrains;
