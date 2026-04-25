import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, CheckCircle, Edit2, Check, X, Loader2, Activity, Clock, CheckCircle2 } from 'lucide-react';
import { tournamentsApi } from '../api/axios';
import { toast } from 'react-hot-toast';

const GroupStage = ({ matches, groupStandings, isAdmin, onUpdateMatch }) => {
  // Group matches by group_name
  const groupedMatches = matches
    .filter(m => m.phase === 'group')
    .reduce((acc, match) => {
      const group = match.group_name || 'Groupe A';
      if (!acc[group]) acc[group] = [];
      acc[group].push(match);
      return acc;
    }, {});

  const groupNames = Object.keys(groupedMatches).sort();

  if (groupNames.length === 0) {
    return (
      <div className="gs-empty">
        <Trophy size={48} />
        <p>La phase de poules sera disponible prochainement.</p>
      </div>
    );
  }

  const groupColors = {
    'Groupe A': '#22c55e',
    'Groupe B': '#3b82f6',
    'Groupe C': '#f59e0b',
    'Groupe D': '#ef4444',
    'Groupe E': '#8b5cf6',
    'Groupe F': '#ec4899',
    'Groupe G': '#14b8a6',
    'Groupe H': '#f97316',
  };

  return (
    <div className="gs-container">
      <div className="gs-grid">
        {groupNames.map((groupName, gIdx) => {
          const gMatches = groupedMatches[groupName];
          const gStandings = groupStandings?.[groupName] || [];
          const color = groupColors[groupName] || '#22c55e';

          return (
            <motion.div
              key={groupName}
              className="gs-group-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gIdx * 0.1, duration: 0.5 }}
            >
              {/* Group Header */}
              <div className="gs-group-header" style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}>
                <div className="gs-group-icon">
                  <Users size={18} />
                </div>
                <h3>{groupName}</h3>
                <span className="gs-team-count">{gStandings.length} équipes</span>
              </div>

              <div className="gs-group-body">
                {/* Mini Standings Table (Left) */}
              {gStandings.length > 0 && (
                <div className="gs-standings">
                  <div className="gs-section-title">Classement du groupe</div>
                  <table className="gs-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Équipe</th>
                        <th>MJ</th>
                        <th>V</th>
                        <th>N</th>
                        <th>D</th>
                        <th>DB</th>
                        <th>Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gStandings.map((team, idx) => (
                        <tr key={team.id} className={idx < 2 ? 'gs-qualified' : ''}>
                          <td className="gs-rank">
                            {idx < 2 ? (
                              <span className="gs-qualified-dot" style={{ background: color }}></span>
                            ) : (
                              <span>{idx + 1}</span>
                            )}
                          </td>
                          <td className="gs-team-name">
                            {team.name}
                            {idx < 2 && <CheckCircle size={12} className="gs-check" />}
                          </td>
                          <td>{team.played}</td>
                          <td className="gs-win">{team.won}</td>
                          <td>{team.drawn}</td>
                          <td className="gs-loss">{team.lost}</td>
                          <td>{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
                          <td className="gs-pts">{team.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Group Matches (Right) */}
              <div className="gs-matches">
                <div className="gs-matches-title">Matchs du groupe</div>
                {gMatches.map((match, mIdx) => {
                  const isFinished = match.status === 'finished';
                  const isLive = match.status === 'ongoing';
                  const t1Won = isFinished && match.score1 > match.score2;
                  const t2Won = isFinished && match.score2 > match.score1;

                  if (isAdmin) {
                    return (
                      <AdminMatchRow 
                        key={match.id} 
                        match={match} 
                        onUpdate={onUpdateMatch} 
                        delay={gIdx * 0.1 + mIdx * 0.03}
                      />
                    );
                  }

                  const getStatusBadge = (status) => {
                    switch (status) {
                      case 'finished': return <span className="gs-status-badge done"><CheckCircle2 size={10} /></span>;
                      case 'ongoing': return <span className="gs-status-badge live">LIVE</span>;
                      default: return null;
                    }
                  };

                  return (
                    <motion.div
                      key={match.id}
                      className={`gs-match ${isLive ? 'gs-match-live' : ''} ${isFinished ? 'gs-match-done' : ''}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: gIdx * 0.1 + mIdx * 0.03 }}
                    >
                      <div className="gs-match-main">
                        <div className={`gs-match-team ${t1Won ? 'gs-winner' : ''}`}>
                          <span className="gs-team-name-text">{match.team1_name || 'TBD'}</span>
                          <span className="gs-score">{match.score1}</span>
                        </div>
                        <div className="gs-match-vs">-</div>
                        <div className={`gs-match-team gs-match-team-right ${t2Won ? 'gs-winner' : ''}`}>
                          <span className="gs-score">{match.score2}</span>
                          <span className="gs-team-name-text">{match.team2_name || 'TBD'}</span>
                        </div>
                      </div>
                      {getStatusBadge(match.status)}
                    </motion.div>
                  );
                })}
              </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const AdminMatchRow = ({ match, onUpdate, delay }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [s1, setS1] = React.useState(match.score1);
  const [s2, setS2] = React.useState(match.score2);
  const [status, setStatus] = React.useState(match.status);
  const [loading, setLoading] = React.useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await tournamentsApi.updateMatch(match.id, {
        score1: s1,
        score2: s2,
        status: status
      });
      toast.success("Mis à jour !");
      setIsEditing(false);
      onUpdate();
    } catch (err) {
      toast.error("Erreur.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (s) => {
    switch(s) {
      case 'ongoing': return <span className="gs-adm-status live"><Activity size={10} /> LIVE</span>;
      case 'finished': return <span className="gs-adm-status done"><CheckCircle2 size={10} /> Terminé</span>;
      default: return <span className="gs-adm-status next"><Clock size={10} /> À venir</span>;
    }
  };

  if (!isEditing) {
    return (
      <motion.div
        className={`gs-match gs-match-admin status-${match.status}`}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay }}
      >
        <div className="gs-match-main">
          <div className="gs-match-team">
            <span className="gs-team-name-text">{match.team1_name || 'TBD'}</span>
            <span className="gs-score">{match.score1}</span>
          </div>
          <div className="gs-match-vs">-</div>
          <div className="gs-match-team gs-match-team-right">
            <span className="gs-score">{match.score2}</span>
            <span className="gs-team-name-text">{match.team2_name || 'TBD'}</span>
          </div>
        </div>
        <div className="gs-match-admin-side">
          {getStatusLabel(match.status)}
          <button className="gs-edit-btn" onClick={() => setIsEditing(true)} title="Gérer le match">
            <Edit2 size={12} />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div className="gs-match-edit-premium" initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
      <div className="gs-edit-header">
        <span>Gestion du match</span>
        <button className="gs-close-edit" onClick={() => setIsEditing(false)}><X size={14} /></button>
      </div>
      
      <div className="gs-edit-body">
        <div className="gs-edit-teams-grid">
          <div className="gs-edit-team-col">
            <span className="gs-edit-team-label">{match.team1_name || 'Équipe 1'}</span>
            <input type="number" value={s1} onChange={e => setS1(parseInt(e.target.value) || 0)} min="0" />
          </div>
          <div className="gs-edit-sep">VS</div>
          <div className="gs-edit-team-col">
            <span className="gs-edit-team-label">{match.team2_name || 'Équipe 2'}</span>
            <input type="number" value={s2} onChange={e => setS2(parseInt(e.target.value) || 0)} min="0" />
          </div>
        </div>

        <div className="gs-edit-status-row">
          <label>Statut :</label>
          <div className="gs-status-options">
            <button className={`gs-status-opt ${status === 'scheduled' ? 'active' : ''}`} onClick={() => setStatus('scheduled')}>À venir</button>
            <button className={`gs-status-opt live ${status === 'ongoing' ? 'active' : ''}`} onClick={() => setStatus('ongoing')}>LIVE</button>
            <button className={`gs-status-opt done ${status === 'finished' ? 'active' : ''}`} onClick={() => setStatus('finished')}>Terminé</button>
          </div>
        </div>

        <button className="gs-save-btn-premium" onClick={handleSave} disabled={loading}>
          {loading ? <Loader2 size={16} className="tl-spin" /> : <CheckCircle size={16} />}
          {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>
      </div>
    </motion.div>
  );
};

export default GroupStage;
