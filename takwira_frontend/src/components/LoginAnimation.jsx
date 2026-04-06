import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

const LoginAnimation = ({ isLoading }) => {
  return (
    <div className="auth-animation-content">
      <div className="animation-scene login-scene">
        {/* Goal Net */}
        <svg viewBox="0 0 200 100" className="goal-svg">
          <path d="M 10,100 L 10,20 L 190,20 L 190,100" fill="none" stroke="#ddd" strokeWidth="2" />
          <path d="M 10,20 Q 100,5 190,20" fill="none" stroke="#ddd" strokeWidth="2" />
          <motion.path 
            d="M 10,20 L 40,50 L 80,20 L 120,50 L 160,20 L 190,50" 
            fill="none" 
            stroke="rgba(200,200,200,0.3)" 
            strokeWidth="1"
            animate={{ y: isLoading ? [0, 5, 0] : 0 }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        </svg>

        {/* Striker Silhouette */}
        <motion.div 
          className="striker"
          initial={{ x: -60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <svg viewBox="0 0 64 64" width="60" height="60">
            <path d="M32 8c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm16 10H16c-2.21 0-4 1.79-4 4v16c0 1.1.9 2 2 2h4l2 20h16l2-20h4c1.1 0 2-.9 2-2V22c0-2.21-1.79-4-4-4z" fill="var(--green-dark)" />
          </svg>
        </motion.div>

        {/* The Ball */}
        <motion.div 
          className="ball"
          initial={{ x: 20, y: 0 }}
          animate={isLoading ? {
            x: [20, 160, 20],
            y: [0, -40, 0],
            rotate: [0, 360, 720]
          } : {
            x: [20, 160],
            y: [0, -40],
            rotate: [0, 360],
            scale: [1, 0.8]
          }}
          transition={{ 
            repeat: isLoading ? Infinity : 0, 
            duration: 1.2,
            ease: "easeInOut"
          }}
        >
          <div className="ball-inner"></div>
        </motion.div>
      </div>

      <motion.div 
        className="animation-text"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Trophy size={20} />
        <span>Connexion en cours...</span>
      </motion.div>
    </div>
  );
};

export default LoginAnimation;
