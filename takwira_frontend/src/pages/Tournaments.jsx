import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Calendar, Users, ArrowRight, Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import CreateTournamentModal from '../components/CreateTournamentModal';
import JoinTournamentModal from '../components/JoinTournamentModal';
import './Tournaments.css';

const Tournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const { user } = useAuth();

  const fetchTournaments = async () => {
    try {
      const res = await api.get('tournaments/');
      setTournaments(res.data);
    } catch (err) {
      console.error("Error fetching tournaments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const handleEdit = (t) => {
    setSelectedTournament(t);
    setIsModalOpen(true);
  };

  const handleJoin = (t) => {
    setSelectedTournament(t);
    setIsJoinModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce tournoi ?")) {
      try {
        await api.delete(`tournaments/${id}/`);
        fetchTournaments();
        toast.success('Tournoi supprimé.');
      } catch (err) {
        toast.error('Erreur lors de la suppression.');
      }
    }
  };

  const handleCreateNew = () => {
    setSelectedTournament(null);
    setIsModalOpen(true);
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
    return <div className="loading-screen">Chargement des tournois...</div>;
  }

  return (
    <div className="tournaments-page">
      <section className="tournaments-header">
        <div className="container header-flex">
          <motion.div 
            className="header-text"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="section-title">Tournois de la Communauté</h1>
            <p className="section-sub">Rejoignez la compétition, montrez votre talent et gagnez des récompenses.</p>
          </motion.div>
          {user && user.role === 'admin' && (
            <motion.button 
              className="btn-create-tournament" 
              onClick={handleCreateNew}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Plus size={20} /> Créer un tournoi
            </motion.button>
          )}
        </div>
      </section>

      <section className="tournaments-list">
        <div className="container">
          <motion.div 
            className="tournaments-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {tournaments.length === 0 ? (
              <div className="empty-state">Aucun tournoi disponible pour le moment.</div>
            ) : (
              tournaments.map((tournament) => (
                <motion.div 
                  key={tournament.id} 
                  className="tournament-card"
                  variants={itemVariants}
                  whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                >
                  <div className={`tournament-tag ${tournament.status}`}>{tournament.status}</div>
                  
                  {user && user.role === 'admin' && (
                    <div className="admin-actions-overlay">
                      <button className="admin-btn edit" onClick={() => handleEdit(tournament)} title="Modifier">
                        <Edit2 size={16} />
                      </button>
                      <button className="admin-btn delete" onClick={() => handleDelete(tournament.id)} title="Supprimer">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}

                  <div className="tournament-content">
                    <div className="tournament-icon">
                      <Trophy size={32} />
                    </div>
                    <h3>{tournament.name}</h3>
                    <div className="tournament-info">
                      <div className="info-item">
                        <Calendar size={16} />
                        <span>{tournament.start_date}</span>
                      </div>
                      <div className="info-item">
                        <Users size={16} />
                        <span>{tournament.teams?.length || 0} / {tournament.max_teams} équipes</span>
                      </div>
                    </div>
                    <div className="tournament-fee">
                      Frais : <span>{tournament.entry_fee} TND</span>
                    </div>
                    {user ? (
                      user.role === 'player' ? (
                        <button 
                          className="btn-join" 
                          onClick={() => handleJoin(tournament)}
                          disabled={tournament.status !== 'open' || (tournament.teams?.length >= tournament.max_teams)}
                        >
                          {tournament.teams?.length >= tournament.max_teams ? 'Complet' : "S'inscrire"} <ArrowRight size={16} />
                        </button>
                      ) : (
                        <div className="admin-msg">Mode Admin : Inscriptions ouvertes</div>
                      )
                    ) : (
                      <Link to="/login" className="btn-join secondary">
                        Se connecter pour s'inscrire
                      </Link>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </section>

      <AnimatePresence>
        {isModalOpen && (
          <CreateTournamentModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onSuccess={fetchTournaments}
            editingTournament={selectedTournament}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isJoinModalOpen && selectedTournament && (
          <JoinTournamentModal 
            isOpen={isJoinModalOpen}
            onClose={() => setIsJoinModalOpen(false)}
            onSuccess={fetchTournaments}
            tournament={selectedTournament}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tournaments;
