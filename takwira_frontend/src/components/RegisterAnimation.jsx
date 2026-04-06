import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star, Zap, Award, ShieldCheck } from 'lucide-react';

/* ─── Pack Particle (Burst effect) ─── */
const Particle = ({ delay }) => (
  <motion.div
    className="burst-particle"
    initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
    animate={{ 
      scale: [0, 1.2, 0], 
      x: (Math.random() - 0.5) * 400, 
      y: (Math.random() - 0.5) * 400,
      opacity: [1, 1, 0] 
    }}
    transition={{ duration: 1.2, delay, ease: "easeOut" }}
  />
);

/* ─── The Football Pack ─── */
const FootballPack = ({ isLoading }) => {
  return (
    <motion.div
      className="football-pack"
      initial={{ y: 0, rotateY: 0, opacity: 1 }}
      animate={isLoading ? { 
        rotateY: [0, 15, -15, 0],
        scale: [1, 1.05, 1],
        y: [0, -10, 0]
      } : { 
        y: [0, -20, 0],
        rotateY: [0, 5, -5, 0]
      }}
      transition={isLoading ? { 
        duration: 0.2, 
        repeat: Infinity 
      } : { 
        duration: 3, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
    >
      {/* Pack Shadow */}
      <div className="pack-shadow" />
      
      {/* Pack Body */}
      <svg viewBox="0 0 180 260" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="5" width="170" height="250" rx="15" fill="#1a5c30" stroke="#ffd700" strokeWidth="4" />
        <path d="M5 50 Q90 10 175 50" stroke="#ffd700" strokeWidth="2" strokeDasharray="5 5" />
        <rect x="30" y="80" width="120" height="100" rx="4" fill="rgba(255,215,0,0.1)" stroke="#ffd700" strokeWidth="1" />
        <text x="90" y="140" textAnchor="middle" fill="#ffd700" fontSize="40" fontFamily="Bebas Neue, sans-serif">TFC</text>
        <path d="M5 210 Q90 250 175 210" stroke="#ffd700" strokeWidth="2" strokeDasharray="5 5" />
      </svg>

      {/* Shine effect */}
      <motion.div 
        className="reveal-glow" 
        animate={{ opacity: [0.1, 0.4, 0.1], scale: [1, 1.2, 1] }} 
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.div>
  );
};

/* ─── The Premium Player Card ─── */
const PlayerCard = ({ username }) => {
  return (
    <motion.div
      className="player-card"
      initial={{ scale: 0, rotateY: 180, opacity: 0 }}
      animate={{ scale: 1, rotateY: 0, opacity: 1 }}
      transition={{ duration: 0.8, type: "spring", damping: 15 }}
    >
      <div className="card-shimmer" />
      <div className="card-inner-border" />
      
      <div className="card-header">
        <div className="card-ovr">99</div>
        <div className="card-pos">NEW SIGNING</div>
      </div>

      <div className="card-name-section">
        <motion.div 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ delay: 0.5 }}
          className="card-name"
        >
          {username || "KOLOU"}
        </motion.div>
        <div className="card-status">TAKWIRA FOOTBALL CLUB</div>
      </div>

      <div className="card-footer-logo" style={{ bottom: '20px', left: '50%', transform: 'translateX(-50%)' }}>
        <ShieldCheck color="#ffd700" size={40} />
      </div>

      {/* Floating stats badges */}
      <motion.div 
        className="card-badge"
        style={{ position: 'absolute', top: '25%', right: '20px' }}
        animate={{ y: [0, -10, 0] }} 
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Award color="#ffd700" size={24} />
      </motion.div>
    </motion.div>
  );
};

/* ─── Main Animation Component ─── */
const RegisterAnimation = ({ isLoading, isSuccess, username }) => {
  const [showCard, setShowCard] = useState(false);
  const [burst, setBurst] = useState(false);

  useEffect(() => {
    if (isSuccess) {
      setBurst(true);
      setTimeout(() => {
        setShowCard(true);
        setBurst(false);
      }, 300);
    } else {
      setShowCard(false);
      setBurst(false);
    }
  }, [isSuccess]);

  return (
    <div className="pack-reveal-scene">
      {/* Background Atmosphere */}
      <motion.div 
        className="reveal-glow"
        animate={{ 
          scale: isLoading ? [1, 1.5, 1] : 1,
          opacity: isLoading ? [0.15, 0.4, 0.15] : 0.15 
        }} 
        transition={{ duration: 0.8, repeat: Infinity }}
      />
      
      <AnimatePresence mode="wait">
        {!showCard ? (
          <motion.div
            key="pack"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 2, opacity: 0, filter: 'blur(10px)' }}
            transition={{ duration: 0.5 }}
          >
            <FootballPack isLoading={isLoading} />
          </motion.div>
        ) : (
          <div key="card" className="player-card-container">
            <PlayerCard username={username} />
            
            {/* Burst effects on card reveal */}
            {Array.from({ length: 40 }).map((_, i) => (
              <Particle key={i} delay={i * 0.01} />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Floating Sparkles */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            style={{ 
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              y: [0, -30, 0] 
            }}
            transition={{ 
              duration: 2 + Math.random() * 2, 
              repeat: Infinity, 
              delay: Math.random() * 2 
            }}
          >
            <Sparkles color="#ffd700" size={14} />
          </motion.div>
        ))}
      </div>

      {/* Flash effect on success burst */}
      <AnimatePresence>
        {burst && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              inset: 0,
              background: '#fff',
              zIndex: 100,
              pointerEvents: 'none'
            }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      <div className="scene-status-text" style={{ bottom: '15%', color: '#ffd700' }}>
        {isLoading ? <>Préparation du transfert<span className="pulse-dot" /></> : isSuccess ? 'SIGNATURE RÉUSSIE !' : 'Prêt pour le recrutement ?'}
      </div>
    </div>
  );
};

export default RegisterAnimation;