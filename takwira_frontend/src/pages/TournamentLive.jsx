import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Users, Calendar, MapPin, ChevronLeft, LayoutGrid, ListOrdered, Layers, Activity, Zap, Play, FastForward, Loader2, Star, PartyPopper } from 'lucide-react';
import { tournamentsApi } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { useRef } from 'react';
import TournamentBracket from '../components/TournamentBracket';
import TournamentStandings from '../components/TournamentStandings';
import GroupStage from '../components/GroupStage';
import './TournamentLive.css';

const TournamentLive = () => {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [standings, setStandings] = useState([]);
  const [groupStandings, setGroupStandings] = useState({});
  const [activeTab, setActiveTab] = useState('groups');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showWinner, setShowWinner] = useState(true);
  const hasSetInitialTab = useRef(false);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tournRes, standingsRes, groupRes] = await Promise.all([
          tournamentsApi.getDetail(id),
          tournamentsApi.getStandings(id),
          tournamentsApi.getGroupStandings(id).catch(() => ({ data: {} })),
        ]);
        setTournament(tournRes.data);
        setStandings(standingsRes.data);
        setGroupStandings(groupRes.data);

        // Determine best default tab (only once)
        if (!hasSetInitialTab.current) {
          const matches = tournRes.data.matches || [];
          const hasGroups = matches.some(m => m.phase === 'group');
          const hasKnockout = matches.some(m => m.phase !== 'group');

          if (hasKnockout && !hasGroups) {
            setActiveTab('bracket');
          } else if (hasGroups) {
            setActiveTab('groups');
          } else {
            setActiveTab('bracket');
          }
          hasSetInitialTab.current = true;
        }
      } catch (error) {
        console.error('Error fetching tournament data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [id]);

  const handleGenerateMatches = async () => {
    setActionLoading(true);
    try {
      const res = await tournamentsApi.generateMatches(id);
      toast.success(res.data.message);
      // Refresh
      const tournRes = await tournamentsApi.getDetail(id);
      setTournament(tournRes.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la génération.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdvancePhase = async () => {
    setActionLoading(true);
    try {
      const res = await tournamentsApi.advancePhase(id);
      toast.success(res.data.message);
      // Refresh
      const tournRes = await tournamentsApi.getDetail(id);
      setTournament(tournRes.data);
    } catch (err) {
      toast.error('Erreur lors du passage à la phase suivante.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="tl-page tl-loading">
        <div className="tl-loader">
          <div className="tl-loader-ring"></div>
          <p>Chargement du tournoi...</p>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="tl-page tl-error">
        <Trophy size={48} />
        <h2>Tournoi non trouvé</h2>
        <Link to="/tournaments" className="tl-back-link">Retour aux tournois</Link>
      </div>
    );
  }

  const statusMap = {
    open: { label: 'Inscriptions ouvertes', cls: 'tl-status-open', icon: <Zap size={14} /> },
    ongoing: { label: 'En cours', cls: 'tl-status-live', icon: <Activity size={14} /> },
    finished: { label: 'Terminé', cls: 'tl-status-done', icon: <Trophy size={14} /> },
  };
  const statusInfo = statusMap[tournament.status] || statusMap.open;

  const matches = tournament.matches || [];
  const hasGroups = matches.some(m => m.phase === 'group');
  const hasKnockout = matches.some(m => m.phase !== 'group');

  // Count live matches
  const liveCount = matches.filter(m => m.status === 'ongoing').length;

  // Progress Bar Logic
  const phases_in_tournament = [];
  if (hasGroups) phases_in_tournament.push('group');
  
  // Check which knockout phases exist
  const knockoutPhases = ['round_of_16', 'quarter', 'semi', 'final'];
  knockoutPhases.forEach(p => {
    if (matches.some(m => m.phase === p)) phases_in_tournament.push(p);
  });

  const phaseLabels = {
    group: 'Poules',
    round_of_16: '1/8',
    quarter: 'Quarts',
    semi: 'Demis',
    final: 'Finale'
  };

  const getCurrentPhase = () => {
    for (let i = phases_in_tournament.length - 1; i >= 0; i--) {
      const p = phases_in_tournament[i];
      if (matches.some(m => m.phase === p && m.status !== 'scheduled')) return p;
    }
    return phases_in_tournament[0];
  };
  const currentPhase = getCurrentPhase();

  const tabs = [];
  if (hasGroups) {
    tabs.push({ id: 'groups', label: 'Phase de Poules', icon: <Layers size={16} /> });
  }
  tabs.push({ id: 'bracket', label: 'Phase Finale', icon: <LayoutGrid size={16} /> });
  tabs.push({ id: 'standings', label: 'Classement', icon: <ListOrdered size={16} /> });

  // Winner logic
  const finalMatch = matches.find(m => m.phase === 'final');
  const winnerName = finalMatch && finalMatch.status === 'finished'
    ? (finalMatch.score1 > finalMatch.score2 ? finalMatch.team1_name : finalMatch.team2_name)
    : null;

  return (
    <motion.div
      className="tl-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <AnimatePresence>
        {winnerName && showWinner && (
          <motion.div
            className="tl-winner-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="tl-winner-card"
              initial={{ scale: 0.5, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: "spring", damping: 15 }}
            >
              <div className="tl-winner-confetti">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="tl-confetti-particle"
                    initial={{ top: '50%', left: '50%' }}
                    animate={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      scale: [0, 1, 0],
                      rotate: 360
                    }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.1 }}
                  />
                ))}
              </div>
              <PartyPopper className="tl-winner-icon" size={60} />
              <div className="tl-winner-badge">CHAMPION</div>
              <h2 className="tl-winner-name">{winnerName}</h2>
              <p className="tl-winner-sub">Félicitations au grand vainqueur !</p>
              <div className="tl-winner-stars">
                <Star size={20} fill="#fbbf24" color="#fbbf24" />
                <Star size={28} fill="#fbbf24" color="#fbbf24" />
                <Star size={20} fill="#fbbf24" color="#fbbf24" />
              </div>
              <button className="tl-winner-close" onClick={() => setShowWinner(false)}>
                <Trophy size={16} /> Voir le tableau
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Back button */}
      <Link to="/tournaments" className="tl-back">
        <ChevronLeft size={20} /> Retour aux tournois
      </Link>

      {/* Hero Header */}
      <header className="tl-hero">
        <div className="tl-hero-bg"></div>
        <div className="tl-hero-content">
          <div className={`tl-status ${statusInfo.cls}`}>
            {statusInfo.icon} {statusInfo.label}
            {liveCount > 0 && <span className="tl-live-count">{liveCount} match{liveCount > 1 ? 's' : ''} en direct</span>}
          </div>
          <h1 className="tl-title">{tournament.name}</h1>
          <div className="tl-meta">
            <span className="tl-meta-item">
              <Calendar size={15} />
              {new Date(tournament.start_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              {' → '}
              {new Date(tournament.end_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span className="tl-meta-item">
              <MapPin size={15} /> {tournament.terrain_name}
            </span>
            <span className="tl-meta-item">
              <Users size={15} /> {tournament.teams?.length}/{tournament.max_teams} Équipes
            </span>
          </div>

          {/* ADMIN CONTROLS IN HERO */}
          {isAdmin && (
            <div className="tl-admin-controls">
              {matches.length === 0 && tournament.teams?.length >= 2 && (
                <button className="tl-admin-btn primary" onClick={handleGenerateMatches} disabled={actionLoading}>
                  {actionLoading ? <Loader2 size={16} className="tl-spin" /> : <Play size={16} />}
                  Lancer le tournoi (Générer Poules)
                </button>
              )}
              {matches.length > 0 && tournament.status !== 'finished' && (
                <button className="tl-admin-btn secondary" onClick={handleAdvancePhase} disabled={actionLoading}>
                  {actionLoading ? <Loader2 size={16} className="tl-spin" /> : <FastForward size={16} />}
                  Vérifier progression / Phase suivante
                </button>
              )}
            </div>
          )}

          {/* Dynamic Phase Progress Bar */}
          <div className="tl-progress">
            {phases_in_tournament.map((p, idx) => {
              const pMatches = matches.filter(m => m.phase === p);
              const isCompleted = pMatches.length > 0 && pMatches.every(m => m.status === 'finished');
              const isActive = p === currentPhase && !isCompleted;
              
              return (
                <React.Fragment key={p}>
                  <div className={`tl-progress-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                    <div className="tl-progress-dot"></div>
                    <span>{phaseLabels[p]}</span>
                  </div>
                  {idx < phases_in_tournament.length - 1 && <div className="tl-progress-line"></div>}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="tl-tabs-wrapper">
        <div className="tl-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tl-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="tl-content">
        <AnimatePresence mode="wait">
          {activeTab === 'groups' && (
            <motion.div
              key="groups"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 30, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <GroupStage
                matches={matches}
                groupStandings={groupStandings}
                isAdmin={isAdmin}
                onUpdateMatch={() => tournamentsApi.getDetail(id).then(res => setTournament(res.data))}
              />
            </motion.div>
          )}

          {activeTab === 'bracket' && (
            <motion.div
              key="bracket"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 30, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <TournamentBracket
                matches={matches}
                isAdmin={isAdmin}
                onUpdateMatch={() => tournamentsApi.getDetail(id).then(res => setTournament(res.data))}
              />
            </motion.div>
          )}

          {activeTab === 'standings' && (
            <motion.div
              key="standings"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <TournamentStandings standings={standings} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </motion.div>
  );
};

export default TournamentLive;
