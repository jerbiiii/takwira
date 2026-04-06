import { useState, useEffect } from 'react';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { Trophy, Calendar, Users, ArrowRight } from 'lucide-react';
import './Tournaments.css';

const Tournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchTournaments();
  }, []);

  if (loading) {
    return <div className="loading-screen">Chargement des tournois...</div>;
  }

  return (
    <div className="tournaments-page">
      <section className="tournaments-header">
        <div className="container">
          <h1 className="section-title">Tournois de la Communauté</h1>
          <p className="section-sub">Rejoignez la compétition, montrez votre talent et gagnez des récompenses.</p>
        </div>
      </section>

      <section className="tournaments-list">
        <div className="container">
          <div className="tournaments-grid">
            {tournaments.map((tournament) => (
              <motion.div 
                key={tournament.id} 
                className="tournament-card"
                whileHover={{ scale: 1.02 }}
              >
                <div className="tournament-tag">{tournament.status}</div>
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
                      <span>Max {tournament.max_teams} équipes</span>
                    </div>
                  </div>
                  <div className="tournament-fee">
                    Frais : <span>{tournament.entry_fee} TND</span>
                  </div>
                  <button className="btn-join">
                    S'inscrire <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Tournaments;
