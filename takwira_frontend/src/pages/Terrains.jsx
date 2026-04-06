import { useState, useEffect } from 'react';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { MapPin, Users, Zap } from 'lucide-react';
import BookingModal from '../components/BookingModal';
import './Terrains.css';

const Terrains = () => {
  const [terrains, setTerrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTerrain, setSelectedTerrain] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
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
    fetchTerrains();
  }, []);

  const handleBookClick = (terrain) => {
    setSelectedTerrain(terrain);
    setIsModalOpen(true);
  };

  if (loading) {
    return <div className="loading-screen">Chargement des terrains...</div>;
  }

  return (
    <div className="terrains-page">
      <section className="terrains-header">
        <div className="container">
          <h1 className="section-title">Explorez les Terrains</h1>
          <p className="section-sub">Trouvez le terrain idéal pour votre prochain match en Tunisie.</p>
        </div>
      </section>

      <section className="terrains-list">
        <div className="container">
          <div className="terrains-grid">
            {terrains.map((terrain) => (
              <motion.div 
                key={terrain.id} 
                className="terrain-card"
                whileHover={{ translateY: -5 }}
              >
                <div className="terrain-image">
                  <div className="image-placeholder">
                    <Zap size={40} color="rgba(255,255,255,0.3)" />
                  </div>
                  <div className="terrain-price">{terrain.price_per_hour} TND/h</div>
                </div>
                <div className="terrain-info">
                  <div className="terrain-type">{terrain.surface_type}</div>
                  <h3>{terrain.name}</h3>
                  <div className="terrain-meta">
                    <span><MapPin size={14} /> {terrain.city}</span>
                    <span><Users size={14} /> {terrain.capacity} joueurs</span>
                  </div>
                  <button 
                    className="btn-book"
                    onClick={() => handleBookClick(terrain)}
                  >
                    Réserver
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {selectedTerrain && (
        <BookingModal 
          terrain={selectedTerrain} 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default Terrains;
