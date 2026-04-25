import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap, Edit2, Check, X, Loader2, Activity, Clock, CheckCircle2 } from 'lucide-react';
import { tournamentsApi } from '../api/axios';
import { toast } from 'react-hot-toast';

const PHASE_ORDER = ['round_of_16', 'quarter', 'semi', 'final'];
const PHASE_LABELS = {
  round_of_16: 'Huitièmes',
  quarter: 'Quarts',
  semi: 'Demi-finales',
  third_place: '3ème place',
  final: 'Finale',
};

const TournamentBracket = ({ matches, isAdmin, onUpdateMatch }) => {
  // Filter only knockout matches
  const knockoutMatches = matches.filter(m => m.phase !== 'group');

  // Group by phase
  const phases = {};
  knockoutMatches.forEach(match => {
    const phase = match.phase || 'quarter';
    if (!phases[phase]) phases[phase] = [];
    phases[phase].push(match);
  });

  // Sort matches within each phase by order
  Object.keys(phases).forEach(phase => {
    phases[phase].sort((a, b) => a.order - b.order);
  });

  // Determine which phases to show (only those with matches)
  const activePhases = PHASE_ORDER.filter(p => phases[p] && phases[p].length > 0);
  
  // Add third_place if exists
  const hasThirdPlace = phases['third_place'] && phases['third_place'].length > 0;

  if (knockoutMatches.length === 0) {
    return (
      <div className="bracket-empty">
        <Trophy size={48} />
        <p>L'organigramme sera disponible après la phase de poules.</p>
      </div>
    );
  }

  return (
    <div className="bracket-wrapper">
      <div className="bracket-scroll">
        <div className="bracket-grid" style={{ '--num-rounds': activePhases.length }}>
          {activePhases.map((phase, roundIdx) => {
            const roundMatches = phases[phase] || [];
            const isLast = roundIdx === activePhases.length - 1;

            return (
              <div key={phase} className="bracket-round" data-round={roundIdx}>
                <div className="bracket-round-header">
                  <span className="bracket-round-label">{PHASE_LABELS[phase] || phase}</span>
                  <span className="bracket-round-count">{roundMatches.length} match{roundMatches.length > 1 ? 's' : ''}</span>
                </div>
                <div className="bracket-matches-col">
                  {roundMatches.map((match, mIdx) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      roundIdx={roundIdx}
                      matchIdx={mIdx}
                      isLast={isLast}
                      showConnectors={!isLast}
                      isAdmin={isAdmin}
                      onUpdateMatch={onUpdateMatch}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Third place match - shown below the bracket */}
        {hasThirdPlace && (
          <div className="bracket-third-place">
            <div className="bracket-round-header">
              <span className="bracket-round-label">Match pour la 3ème place</span>
            </div>
            {phases['third_place'].map(match => (
              <MatchCard
                key={match.id}
                match={match}
                roundIdx={0}
                matchIdx={0}
                isLast={true}
                showConnectors={false}
                isAdmin={isAdmin}
                onUpdateMatch={onUpdateMatch}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const MatchCard = ({ match, roundIdx, matchIdx, isLast, showConnectors, isAdmin, onUpdateMatch }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [s1, setS1] = React.useState(match.score1);
  const [s2, setS2] = React.useState(match.score2);
  const [status, setStatus] = React.useState(match.status);
  const [loading, setLoading] = React.useState(false);

  const isFinished = match.status === 'finished';
  const isLive = match.status === 'ongoing';
  const t1Won = isFinished && match.score1 > match.score2;
  const t2Won = isFinished && match.score2 > match.score1;
  const isFinal = match.phase === 'final';

  const handleSave = async () => {
    setLoading(true);
    try {
      await tournamentsApi.updateMatch(match.id, {
        score1: s1,
        score2: s2,
        status: status
      });
      toast.success("Match mis à jour !");
      setIsEditing(false);
      onUpdateMatch();
    } catch (err) {
      toast.error("Erreur de mise à jour.");
    } finally {
      setLoading(false);
    }
  };

  if (isEditing) {
    return (
      <div className="bracket-match bracket-match-edit-premium">
        <div className="bracket-edit-header">
          <span>Gestion du match</span>
          <button className="bracket-close-edit" onClick={() => setIsEditing(false)}><X size={14} /></button>
        </div>
        
        <div className="bracket-edit-body">
          <div className="bracket-edit-teams-grid">
            <div className="bracket-edit-team-col">
              <span className="bracket-edit-team-label">{match.team1_name || 'Équipe 1'}</span>
              <input type="number" value={s1} onChange={e => setS1(parseInt(e.target.value) || 0)} min="0" />
            </div>
            <div className="bracket-edit-sep">VS</div>
            <div className="bracket-edit-team-col">
              <span className="bracket-edit-team-label">{match.team2_name || 'Équipe 2'}</span>
              <input type="number" value={s2} onChange={e => setS2(parseInt(e.target.value) || 0)} min="0" />
            </div>
          </div>

          <div className="bracket-edit-status-row">
            <div className="bracket-status-options">
              <button className={`bracket-status-opt ${status === 'scheduled' ? 'active' : ''}`} onClick={() => setStatus('scheduled')}>À venir</button>
              <button className={`bracket-status-opt live ${status === 'ongoing' ? 'active' : ''}`} onClick={() => setStatus('ongoing')}>LIVE</button>
              <button className={`bracket-status-opt done ${status === 'finished' ? 'active' : ''}`} onClick={() => setStatus('finished')}>Terminé</button>
            </div>
          </div>

          <button className="bracket-save-btn-premium" onClick={handleSave} disabled={loading}>
            {loading ? <Loader2 size={14} className="tl-spin" /> : <Check size={14} />}
            {loading ? 'Mise à jour...' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    );
  }

  const getStatusLabel = (s) => {
    switch(s) {
      case 'ongoing': return <span className="bracket-status-tag live">LIVE</span>;
      case 'finished': return <span className="bracket-status-tag done">TERMINÉ</span>;
      default: return null;
    }
  };

  return (
    <div className="bracket-match-wrapper">
      <motion.div
        className={`bracket-match ${isLive ? 'bracket-match-live' : ''} ${isFinished ? 'bracket-match-done' : ''} ${isFinal ? 'bracket-match-final' : ''} ${isAdmin ? 'bracket-match-admin' : ''}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: roundIdx * 0.15 + matchIdx * 0.08, duration: 0.4 }}
      >
        {isAdmin && (
          <button className="bracket-edit-btn" onClick={() => setIsEditing(true)}>
            <Edit2 size={10} />
          </button>
        )}
        {/* Status indicator */}
        {getStatusLabel(match.status)}
        {isFinal && isFinished && (
          <div className="bracket-trophy-badge">
            <Trophy size={12} />
          </div>
        )}

        {/* Team 1 */}
        <div className={`bracket-team ${t1Won ? 'bracket-team-winner' : ''} ${isFinished && !t1Won ? 'bracket-team-loser' : ''}`}>
          <div className="bracket-team-info">
            {t1Won && <span className="bracket-winner-dot"></span>}
            <span className="bracket-team-name">{match.team1_name || 'À déterminer'}</span>
          </div>
          <span className={`bracket-team-score ${t1Won ? 'bracket-score-winner' : ''}`}>
            {match.score1}
          </span>
        </div>

        <div className="bracket-divider"></div>

        {/* Team 2 */}
        <div className={`bracket-team ${t2Won ? 'bracket-team-winner' : ''} ${isFinished && !t2Won ? 'bracket-team-loser' : ''}`}>
          <div className="bracket-team-info">
            {t2Won && <span className="bracket-winner-dot"></span>}
            <span className="bracket-team-name">{match.team2_name || 'À déterminer'}</span>
          </div>
          <span className={`bracket-team-score ${t2Won ? 'bracket-score-winner' : ''}`}>
            {match.score2}
          </span>
        </div>
      </motion.div>

      {/* Connector lines */}
      {showConnectors && (
        <div className="bracket-connector">
          <div className="bracket-connector-line bracket-connector-right"></div>
        </div>
      )}
    </div>
  );
};

export default TournamentBracket;
