import React from 'react';
import { motion } from 'framer-motion';

const TournamentStandings = ({ standings }) => {
  if (!standings || standings.length === 0) {
    return (
      <div className="empty-state">
        <p>Le classement sera mis à jour dès la fin du premier match.</p>
      </div>
    );
  }

  return (
    <div className="standings-table-container">
      <table className="standings-table">
        <thead>
          <tr>
            <th>Pos</th>
            <th>Équipe</th>
            <th>P</th>
            <th>W</th>
            <th>D</th>
            <th>L</th>
            <th>GF</th>
            <th>GA</th>
            <th>GD</th>
            <th>Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((team, index) => (
            <motion.tr 
              key={team.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <td className="rank-cell">{index + 1}</td>
              <td className="team-cell">{team.name}</td>
              <td>{team.played}</td>
              <td>{team.won}</td>
              <td>{team.drawn}</td>
              <td>{team.lost}</td>
              <td>{team.gf}</td>
              <td>{team.ga}</td>
              <td>{team.gd}</td>
              <td className="pts-cell">{team.points}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TournamentStandings;
