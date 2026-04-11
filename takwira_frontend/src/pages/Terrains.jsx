import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Users, Zap, Plus, Edit2, Trash2, Crosshair, Map as MapIcon, List, Star, MessageSquare } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import BookingModal from '../components/BookingModal';
import CreateTerrainModal from '../components/CreateTerrainModal';
import ReviewsModal from '../components/ReviewsModal';
import './Terrains.css';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Helper component to center map
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

const Terrains = () => {
  const [terrains, setTerrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTerrain, setSelectedTerrain] = useState(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [editingTerrain, setEditingTerrain] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isMapVisible, setIsMapVisible] = useState(true);
  const [reviewsTerrain, setReviewsTerrain] = useState(null);
  const { user } = useAuth();

  const fetchTerrains = async (lat, lng) => {
    try {
      let url = 'terrains/';
      if (lat && lng) {
        url += `?lat=${lat}&lng=${lng}&dist=30`; // 30km radius
      }
      const res = await api.get(url);
      setTerrains(res.data);
    } catch (err) {
      console.error("Error fetching terrains:", err);
    } finally {
      setLoading(false);
    }
  };

  const getGeolocation = () => {
    if (!navigator.geolocation) {
      toast.error("La géolocalisation n'est pas supportée par votre navigateur.");
      fetchTerrains();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        fetchTerrains(latitude, longitude);
        toast.success("Localisation réussie !");
      },
      () => {
        toast.error("Impossible d'accéder à votre position. Affichage global.");
        fetchTerrains();
      }
    );
  };

  useEffect(() => {
    // 1. Fetch all terrains immediately
    fetchTerrains();

    // 2. Silently get location just for the blue dot, no filtering
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
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
          
          <div className="terrains-controls">
            <button className="btn-control" onClick={() => setIsMapVisible(!isMapVisible)}>
              {isMapVisible ? <><List size={18} /> Liste</> : <><MapIcon size={18} /> Carte</>}
            </button>
            <button className="btn-control highlight" onClick={getGeolocation}>
              <Crosshair size={18} /> Me localiser
            </button>
            {user && (user.role === 'admin' || user.can_manage_terrain) && (
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
        </div>
      </section>

      {/* Map Section */}
      <AnimatePresence>
        {isMapVisible && (
          <motion.section 
            className="terrains-map-sec"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: '450px' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="container map-wrapper">
              <MapContainer 
                center={userLocation ? [userLocation.lat, userLocation.lng] : [36.8065, 10.1815]} 
                zoom={12} 
                scrollWheelZoom={true}
                className="main-map"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {userLocation && (
                  <Marker 
                    position={[userLocation.lat, userLocation.lng]}
                    icon={L.divIcon({
                      className: 'user-location-marker',
                      html: '<div class="pulse"></div><div class="dot"></div>',
                      iconSize: [20, 20],
                      iconAnchor: [10, 10]
                    })}
                  >
                    <Popup><b>Vous êtes ici</b></Popup>
                  </Marker>
                )}

                {terrains.map(t => (
                  t.latitude && t.longitude && (
                    <Marker key={t.id} position={[t.latitude, t.longitude]}>
                      <Popup className="map-popup">
                        <div className="popup-content">
                          <strong>{t.name}</strong>
                          <span>{t.price_per_hour} TND/h</span>
                          <button onClick={() => handleBookClick(t)} className="btn-book-mini">
                            Détails / Réserver
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  )
                ))}

                {userLocation && <ChangeView center={[userLocation.lat, userLocation.lng]} zoom={13} />}
              </MapContainer>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <section className="terrains-list">
        <div className="container">
          <motion.div 
            className="terrains-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {terrains.map((terrain, index) => (
              <motion.div 
                key={terrain.id} 
                className="terrain-card"
                variants={itemVariants}
                whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
              >
                <div className="terrain-image">
                  {terrain.images && terrain.images.length > 0 ? (
                    <img 
                      src={terrain.images[0].image} 
                      alt={terrain.name} 
                      className="terrain-img-main"
                    />
                  ) : (
                    <img 
                      src={`/images/${["pitch_default.png", "stadium_default.png"][index % 2]}`} 
                      alt={terrain.name} 
                      className="terrain-img-main placeholder-filter"
                    />
                  )}
                  <div className="terrain-price">{terrain.price_per_hour} TND/h</div>
                  
                  {user && (user.role === 'admin' || (user.can_manage_terrain && terrain.owner === (user.user_id || user.id))) && (
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
                  <div className="terrain-rating-row" onClick={() => setReviewsTerrain(terrain)}>
                    <div className="terrain-stars">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={14} className={`mini-star ${s <= Math.round(terrain.average_rating || 0) ? 'filled' : ''}`} />
                      ))}
                    </div>
                    <span className="terrain-rating-num">{terrain.average_rating ? terrain.average_rating.toFixed(1) : '—'}</span>
                    <span className="terrain-reviews-count">({terrain.reviews_count || 0} avis)</span>
                    <MessageSquare size={13} className="reviews-link-icon" />
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

      <AnimatePresence>
        {reviewsTerrain && (
          <ReviewsModal
            terrain={reviewsTerrain}
            isOpen={!!reviewsTerrain}
            onClose={() => { setReviewsTerrain(null); fetchTerrains(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Terrains;
