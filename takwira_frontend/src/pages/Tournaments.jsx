import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Calendar, Users, ArrowRight, Plus, Edit2, Trash2, CheckCircle, MapPin, Send } from 'lucide-react';
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

  useEffect(() => { fetchTournaments(); }, []);

  const handleEdit = (t) => { setSelectedTournament(t); setIsModalOpen(true); };
  const handleJoin = (t) => { setSelectedTournament(t); setIsJoinModalOpen(true); };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce tournoi ?")) {
      try {
        await api.delete(`tournaments/${id}/`);
        fetchTournaments();
        toast.success('Tournoi supprimé.');
      } catch { toast.error('Erreur lors de la suppression.'); }
    }
  };

  // Check if current user is already in a tournament
  const isUserInTournament = (tournament) => {
    if (!user) return false;
    return tournament.teams?.some(team => team.captain === user.user_id);
  };

  const getUserTeam = (tournament) => {
    if (!user) return null;
    return tournament.teams?.find(team => team.captain === user.user_id);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const statusLabels = {
    open: { label: 'Ouvert', cls: 'tag-open' },
    ongoing: { label: 'En cours', cls: 'tag-ongoing' },
    finished: { label: 'Terminé', cls: 'tag-finished' },
  };

  if (loading) return <div className="loading-screen">Chargement des tournois...</div>;

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
            <div className="section-tag">Compétitions</div>
            <h1 className="section-title">Tournois de la Communauté</h1>
            <p className="section-sub">Rejoignez la compétition, montrez votre talent et gagnez des récompenses.</p>
          </motion.div>
          <div className="header-actions">
            {user && user.role === 'admin' && (
              <motion.button
                className="btn-create-tournament"
                onClick={() => { setSelectedTournament(null); setIsModalOpen(true); }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Plus size={20} /> Créer un tournoi
              </motion.button>
            )}
            {user && user.role === 'player' && user.can_create_tournament && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
                <Link to="/request-tournament" className="btn-request-tournament">
                  <Send size={16} /> Proposer un tournoi
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      <section className="tournaments-list">
        <div className="container">
          {tournaments.length === 0 ? (
            <div className="empty-state">Aucun tournoi disponible pour le moment.</div>
          ) : (
            <motion.div
              className="tournaments-grid"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {tournaments.map((tournament) => {
                const enrolled = isUserInTournament(tournament);
                const myTeam = getUserTeam(tournament);
                const isFull = tournament.teams?.length >= tournament.max_teams;
                const statusInfo = statusLabels[tournament.status] || { label: tournament.status, cls: 'tag-open' };

                return (
                  <motion.div
                    key={tournament.id}
                    className={`tournament-card ${enrolled ? 'enrolled-card' : ''}`}
                    variants={itemVariants}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  >
                    {enrolled && (
                      <div className="enrolled-ribbon">
                        <CheckCircle size={12} /> Inscrit
                      </div>
                    )}

                    <div className={`tournament-tag ${statusInfo.cls}`}>{statusInfo.label}</div>

                    {user && user.role === 'admin' && (
                      <div className="admin-actions-overlay">
                        <button className="admin-btn edit" onClick={() => handleEdit(tournament)} title="Modifier"><Edit2 size={16} /></button>
                        <button className="admin-btn delete" onClick={() => handleDelete(tournament.id)} title="Supprimer"><Trash2 size={16} /></button>
                      </div>
                    )}

                    <div className="tournament-content">
                      <div className="tournament-icon"><Trophy size={30} /></div>
                      <h3>{tournament.name}</h3>

                      {tournament.description && (
                        <p className="tournament-description">{tournament.description}</p>
                      )}

                      <div className="tournament-info">
                        <div className="info-item"><Calendar size={14} /><span>{tournament.start_date} → {tournament.end_date}</span></div>
                        <div className="info-item"><Users size={14} /><span>{tournament.teams?.length || 0} / {tournament.max_teams} équipes</span></div>
                        {tournament.terrain_name && (
                          <div className="info-item"><MapPin size={14} /><span>{tournament.terrain_name}</span></div>
                        )}
                      </div>

                      <div className="tournament-fee">Frais : <span>{tournament.entry_fee} TND</span></div>

                      {/* Team fill bar */}
                      <div className="teams-bar">
                        <div
                          className="teams-bar-fill"
                          style={{ width: `${Math.min(100, ((tournament.teams?.length || 0) / tournament.max_teams) * 100)}%` }}
                        />
                      </div>

                      {/* My team badge */}
                      {enrolled && myTeam && (
                        <div className="my-enrollment">
                          <CheckCircle size={13} />
                          Votre équipe : <strong>{myTeam.name}</strong>
                        </div>
                      )}

                      {/* CTA */}
                      {user ? (
                        user.role === 'player' ? (
                          enrolled ? (
                            <div className="btn-enrolled">
                              <CheckCircle size={15} /> Inscrit à ce tournoi
                            </div>
                          ) : tournament.status === 'open' ? (
                            <button
                              className="btn-join"
                              onClick={() => handleJoin(tournament)}
                              disabled={isFull}
                            >
                              {isFull ? 'Complet' : "S'inscrire"} <ArrowRight size={15} />
                            </button>
                          ) : null
                        ) : (
                          <div className="admin-msg">Mode Admin</div>
                        )
                      ) : tournament.status === 'open' ? (
                        <Link to="/login" className="btn-join secondary">
                          Se connecter pour s'inscrire
                        </Link>
                      ) : null}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
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