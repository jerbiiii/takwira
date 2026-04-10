import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Confetti particle ─── */
const Particle = ({ x, y, color, size, dx, dy, rot }) => (
  <motion.div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: size,
      height: size * 0.5,
      background: color,
      borderRadius: 2,
      zIndex: 35,
    }}
    initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
    animate={{ x: dx, y: dy, opacity: 0, rotate: rot }}
    transition={{ duration: 1.4, ease: 'easeOut' }}
  />
);

/* ─── Goal-net SVG ─── */
const GoalNet = ({ ripple }) => (
  <motion.g
    animate={ripple ? {
      scaleX: [1, 1.07, 0.96, 1.03, 1],
      scaleY: [1, 0.96, 1.05, 0.98, 1],
    } : {}}
    transition={{ duration: 0.7, ease: 'easeOut' }}
    style={{ transformOrigin: '50% 100%' }}
  >
    {/* Goal posts */}
    <rect x="290" y="148" width="6" height="90" fill="#e0e0e0" rx="2" />
    <rect x="430" y="148" width="6" height="90" fill="#e0e0e0" rx="2" />
    <rect x="290" y="148" width="146" height="6" fill="#e0e0e0" rx="2" />

    {/* Back of net — vertical lines */}
    {[300, 320, 340, 360, 380, 400, 420].map((x, i) => (
      <line key={i} x1={x} y1="154" x2={x} y2="238" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
    ))}
    {/* Back of net — horizontal lines */}
    {[170, 188, 206, 224].map((y, i) => (
      <line key={i} x1="296" y1={y} x2="430" y2={y} stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
    ))}
    {/* Net base line */}
    <line x1="290" y1="238" x2="436" y2="238" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
  </motion.g>
);

/* ─── Player SVG silhouette ─── */
const Player = ({ state }) => {
  const isKicking = state === 'shooting' || state === 'miss';
  const isIdle = state === 'idle';
  const isWaiting = state === 'waiting';
  const isRunning = state === 'runup';

  return (
    <motion.g
      style={{ transformOrigin: '160px 240px' }}
      animate={isRunning ? { x: [-150, 0] } : { x: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Shadow */}
      <ellipse cx="165" cy="244" rx="22" ry="6" fill="rgba(0,0,0,0.35)" />

      {/* --- Standing (plant) leg --- */}
      <motion.g
        style={{ transformOrigin: '155px 210px' }}
        animate={isKicking ? { rotate: [-5, -10, -8] } : { rotate: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <motion.line x1="155" y1="210" x2="148" y2="230" stroke="#e8e8e8" strokeWidth="11" strokeLinecap="round" />
        <motion.line x1="148" y1="230" x2="144" y2="244" stroke="#c0392b" strokeWidth="9" strokeLinecap="round" />
        <ellipse cx="141" cy="246" rx="10" ry="5" fill="#1a1a1a" />
      </motion.g>

      {/* --- Kicking leg --- */}
      <motion.g
        style={{ transformOrigin: '165px 210px' }}
        animate={isKicking
          ? { rotate: [25, -80, -45] }
          : isWaiting
            ? { rotate: [0, 8, 0, 8, 0] }
            : isIdle
              ? { rotate: [0, 5, -5, 0] }
              : { rotate: 0 }
        }
        transition={isKicking
          ? { duration: 0.55, times: [0, 0.55, 1], ease: 'easeOut' }
          : isWaiting
            ? { duration: 1, repeat: Infinity, ease: 'easeInOut' }
            : isIdle
              ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
              : {}
        }
      >
        <line x1="165" y1="210" x2="172" y2="230" stroke="#e8e8e8" strokeWidth="11" strokeLinecap="round" />
        <motion.line
          x1="172" y1="230" x2="178" y2="244"
          stroke="#c0392b" strokeWidth="9" strokeLinecap="round"
          style={{ transformOrigin: '172px 230px' }}
          animate={isKicking ? { rotate: [0, -30, 20] } : {}}
          transition={isKicking ? { duration: 0.55, times: [0, 0.5, 1] } : {}}
        />
        <motion.ellipse
          cx="180" cy="246" rx="12" ry="5"
          fill="#1a1a1a"
          style={{ transformOrigin: '180px 246px' }}
          animate={isKicking ? { scaleX: [1, 1.3, 1] } : {}}
          transition={isKicking ? { duration: 0.2, delay: 0.28 } : {}}
        />
      </motion.g>

      {/* Body */}
      <motion.g
        style={{ transformOrigin: '160px 195px' }}
        animate={isKicking
          ? { rotate: [-5, 12, 8] }
          : isIdle || isWaiting
            ? { rotate: [0, 2, -2, 0] }
            : { rotate: 0 }
        }
        transition={isKicking
          ? { duration: 0.55, times: [0, 0.5, 1], ease: 'easeOut' }
          : isIdle || isWaiting
            ? { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }
            : {}
        }
      >
        <rect x="148" y="178" width="24" height="34" rx="8" fill="#2e8b4a" />
        <motion.line
          x1="149" y1="186" x2="134" y2="205"
          stroke="#e8e8e8" strokeWidth="8" strokeLinecap="round"
          style={{ transformOrigin: '149px 186px' }}
          animate={isKicking ? { rotate: [0, -35, -20] } : isIdle || isWaiting ? { rotate: [0, 10, -10, 0] } : {}}
          transition={isKicking ? { duration: 0.55 } : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.line
          x1="171" y1="186" x2="186" y2="200"
          stroke="#e8e8e8" strokeWidth="8" strokeLinecap="round"
          style={{ transformOrigin: '171px 186px' }}
          animate={isKicking ? { rotate: [0, 25, 15] } : isIdle || isWaiting ? { rotate: [0, -8, 8, 0] } : {}}
          transition={isKicking ? { duration: 0.55 } : { duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
        />

        <rect x="156" y="168" width="8" height="12" rx="4" fill="#d4a574" />
        <circle cx="160" cy="158" r="18" fill="#d4a574" />

        {/* Facial Features */}
        <circle cx="167" cy="158" r="2.5" fill="#fff" />
        <circle cx="167.8" cy="158" r="1.5" fill="#333" />
        <path d="M 172,158 Q 174,158 174,160" fill="none" stroke="#7e5a3c" strokeWidth="1" />
        <path d="M 166,166 Q 170,170 174,166" fill="none" stroke="#111" strokeWidth="1" />

        <ellipse cx="160" cy="142" rx="16" ry="8" fill="#1a1a1a" />
        <path d="M144,152 Q160,144 176,152" fill="none" stroke="#c0392b" strokeWidth="2.5" />
      </motion.g>

      <text x="155" y="201" fontSize="8" fill="rgba(255,255,255,0.6)" fontFamily="Bebas Neue, sans-serif" letterSpacing="1">10</text>
    </motion.g>
  );
};

const Football = () => (
  <g>
    <circle cx="0" cy="0" r="13" fill="#fff" stroke="#ddd" strokeWidth="0.5" />
    <circle cx="0" cy="0" r="5" fill="#222" />
    {[-1, 1].flatMap(sx => [-1, 1].map((sy, i) => (
      <circle key={`${sx}${sy}${i}`} cx={sx * 7} cy={sy * 7} r="3.5" fill="#222" style={{ opacity: 0.7 }} />
    )))}
  </g>
);

const CrowdRow = () => (
  <svg width="100%" height="60" viewBox="0 0 800 60" preserveAspectRatio="none">
    <path d="M0,60 L0,40 Q10,30 20,38 Q30,28 40,36 Q50,24 60,34 Q70,28 80,36 Q90,22 100,32 Q110,26 120,34 Q130,18 140,30 Q150,24 160,32 Q170,20 180,30 Q190,26 200,34 Q210,16 220,28 Q230,22 240,30 Q250,18 260,28 Q270,22 280,30 Q290,14 300,26 Q310,20 320,28 Q330,16 340,26 Q350,20 360,28 Q370,14 380,24 Q390,18 400,26 Q410,14 420,24 Q430,18 440,26 Q450,14 460,24 Q470,20 480,28 Q490,16 500,26 Q510,22 520,30 Q530,18 540,28 Q550,24 560,32 Q570,20 580,30 Q590,26 600,34 Q610,22 620,32 Q630,28 640,36 Q650,24 660,34 Q670,30 680,38 Q690,26 700,36 Q710,32 720,40 Q730,28 740,38 Q750,34 760,42 Q770,30 780,40 Q790,36 800,44 L800,60 Z" fill="rgba(20,40,25,0.8)" />
    {Array.from({ length: 30 }, (_, i) => (<circle key={i} cx={13 + i * 26 + (i % 2) * 6} cy={26 + (i % 3) * 5} r="4.5" fill={`rgba(${30 + i % 20},${50 + i % 30},${30 + i % 15},0.9)`} />))}
  </svg>
);

const LoginAnimation = ({ isLoading, isSuccess, isError }) => {
  const [ballState, setBallState] = useState('idle'); // idle | shooting | scored | miss
  const [ripple, setRipple] = useState(false);
  const [particles, setParticles] = useState([]);
  const [score, setScore] = useState(0);

  const ballStart = { x: 198, y: 228 };
  const ballEnd = { x: 362, y: 175 };
  const ballMiss = { x: 500, y: 120 };

  const ballVariants = {
    idle: {
      x: ballStart.x,
      y: ballStart.y,
      rotate: 0,
    },
    waiting: {
      x: ballStart.x,
      y: ballStart.y
    },
    shooting: {
      x: [ballStart.x, ballStart.x + 80, ballEnd.x],
      y: [ballStart.y, ballStart.y - 70, ballEnd.y],
      rotate: [0, 300, 720],
      transition: { duration: 0.65, times: [0, 0.45, 1], ease: [0.2, 0, 0.6, 1] },
    },
    miss: {
      x: [ballStart.x, ballStart.x + 120, ballMiss.x],
      y: [ballStart.y, ballStart.y - 120, ballMiss.y],
      rotate: [0, 400, 1000],
      scale: [1, 0.9, 0.7],
      opacity: [1, 1, 0],
      transition: { duration: 0.8, times: [0, 0.5, 1], ease: 'easeOut' },
    },
    scored: {
      x: ballEnd.x,
      y: ballEnd.y,
      rotate: 720
    },
  };

  const shadowVariants = {
    idle: { cx: ballStart.x, opacity: 0.3 },
    waiting: { cx: ballStart.x, opacity: 0.3 },
    shooting: {
      cx: [ballStart.x, ballStart.x + 80, ballEnd.x],
      opacity: [0.3, 0.1, 0],
      transition: { duration: 0.65 }
    },
    miss: {
      cx: [ballStart.x, ballStart.x + 80, ballMiss.x],
      opacity: [0.3, 0.1, 0],
      transition: { duration: 0.65 }
    },
    scored: { cx: ballEnd.x, opacity: 0 },
  };

  const spawnParticles = () => {
    const colors = ['#a8e6be', '#2e8b4a', '#f59e0b', '#fff', '#c0392b'];
    setParticles(Array.from({ length: 22 }, (_, i) => ({
      id: i, x: 300 + Math.random() * 180, y: 150 + Math.random() * 80, color: colors[i % colors.length], size: 6 + Math.random() * 8, dx: (Math.random() - 0.5) * 200, dy: -60 - Math.random() * 120, rot: (Math.random() - 0.5) * 720,
    })));
    setTimeout(() => setParticles([]), 1600);
  };

  useEffect(() => {
    if (isLoading) {
      setBallState('waiting');
    }
  }, [isLoading]);

  useEffect(() => {
    if (isSuccess) {
      setBallState('shooting');
      const timer = setTimeout(() => {
        setBallState('scored');
        setRipple(true);
        setTimeout(() => setRipple(false), 800);
        spawnParticles();
        setScore(s => s + 1);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  useEffect(() => {
    if (isError) {
      setBallState('miss');
    } else if (!isLoading && !isSuccess) {
      // Reset ball state when not performing any auth action
      setBallState('idle');
    }
  }, [isError, isLoading, isSuccess]);

  const playerState = isLoading ? 'runup' : isSuccess ? 'shooting' : isError ? 'miss' : ballState === 'waiting' ? 'waiting' : 'idle';

  return (
    <div className="stadium-scene">
      <div className="stadium-atmosphere" />
      <div className="floodlight left" />
      <div className="floodlight right" />
      <div className="floodlight-beam left" />
      <div className="floodlight-beam right" />
      <div className="scoreboard">
        <span>TUN</span>
        <span className="scoreboard-sep">·</span>
        <span style={{ color: '#a8e6be' }}>{score}</span>
        <span className="scoreboard-time">—</span>
        <span style={{ color: '#a8e6be' }}>0</span>
        <span className="scoreboard-sep">·</span>
        <span>ADV</span>
      </div>
      <div className="crowd-row top"><CrowdRow /></div>
      <div className="pitch-ground">
        <div className="pitch-stripes" />
        <div className="pitch-line-h" />
        <div className="pitch-arc" />
      </div>
      <svg viewBox="0 0 680 300" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '62%', zIndex: 5, overflow: 'visible' }}>
        <GoalNet ripple={ripple} />
        <Player state={playerState} />
        <motion.g
          variants={ballVariants}
          initial="idle"
          animate={ballState}
        >
          <Football />
        </motion.g>
        <motion.ellipse
          cx={ballStart.x}
          cy={ballStart.y + 14}
          rx="12"
          ry="4"
          fill="rgba(0,0,0,0.3)"
          animate={shadowVariants[ballState]}
        />
      </svg>
      <AnimatePresence>{ripple && (<motion.div className="goal-flash" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} />)}</AnimatePresence>
      <AnimatePresence>{ripple && (<motion.div className="goal-text" initial={{ scale: 0.2, opacity: 0 }} animate={{ scale: [0.2, 1.15, 1], opacity: [0, 1, 0.9] }} exit={{ scale: 1.3, opacity: 0 }} transition={{ duration: 0.8, times: [0, 0.5, 1] }}>GOAL!</motion.div>)}</AnimatePresence>
      {particles.map(p => (<Particle key={p.id} {...p} />))}
      <div className="scene-status-text">
        {isLoading ? <>Vérification<span className="pulse-dot" /></> : isSuccess ? 'BUUUUT !' : isError ? 'DOMMAGE...' : 'Prêt à tirer ?'}
      </div>
    </div>
  );
};

export default LoginAnimation;