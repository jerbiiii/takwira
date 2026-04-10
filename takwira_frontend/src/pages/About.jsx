import { motion } from 'framer-motion';
import { Trophy, Users, MapPin, Zap, Shield, Heart, Star, Target } from 'lucide-react';
import './StaticPage.css';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: 'easeOut' },
  }),
};

const team = [
  { name: 'Yassine Ben Ammar', role: 'CEO & Co-Fondateur', emoji: '⚽', color: '#2e8b4a' },
  { name: 'Mehdi Mrad',        role: 'Co-Fondateur',        emoji: '💻', color: '#1a5c30' },
  { name: 'Abderrahmen Ben Azzouna', role: 'Co-Fondateur',  emoji: '🏆', color: '#e67e22' },
];

const values = [
  { icon: <Zap size={24} />, title: 'Simplicité', text: 'Réserver un terrain ne doit prendre que quelques secondes.', color: '#f1c40f' },
  { icon: <Shield size={24} />, title: 'Fiabilité', text: 'Vos réservations sont sécurisées et confirmées en temps réel.', color: '#2e8b4a' },
  { icon: <Heart size={24} />, title: 'Passion', text: 'Nous sommes des passionnés du football avant tout.', color: '#e74c3c' },
  { icon: <Users size={24} />, title: 'Communauté', text: 'Connecter les joueurs et créer des expériences mémorables.', color: '#3498db' },
];

const milestones = [
  { year: '2022', label: 'Fondation à Tunis' },
  { year: '2023', label: 'Lancement de la plateforme beta' },
  { year: '2024', label: '500+ terrains partenaires' },
  { year: '2025', label: '50 000 joueurs inscrits' },
];

const About = () => (
  <div className="static-page">
    {/* ── Hero ── */}
    <section className="sp-hero">
      <div className="sp-hero-glow" />
      <div className="sp-hero-glow sp-hero-glow-2" />
      <div className="container">
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="sp-hero-inner">
          <span className="sp-tag">À propos de nous</span>
          <h1 className="sp-hero-title">
            Révolutionner le<br /><span>Football Urbain</span>
          </h1>
          <p className="sp-hero-sub">
            Takwira est né d'une conviction simple : chaque joueur mérite un terrain de qualité,
            accessible en quelques clics. Depuis 2022, nous connectons des milliers de passionnés
            à travers la Tunisie.
          </p>
          <div className="sp-stats-row">
            {[['50K+', 'Joueurs'], ['500+', 'Terrains'], ['12', 'Villes'], ['4.9★', 'Note moyenne']].map(([n, l]) => (
              <div key={l} className="sp-stat">
                <span className="sp-stat-n">{n}</span>
                <span className="sp-stat-l">{l}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>

    {/* ── Mission ── */}
    <section className="sp-section sp-light">
      <div className="container">
        <div className="sp-two-col">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <span className="sp-tag-light">Notre Mission</span>
            <h2 className="sp-section-title dark">Rendre le football accessible à tous</h2>
            <p className="sp-body-text">
              Nous croyons que le sport a le pouvoir de rassembler les communautés. Takwira simplifie
              la recherche et la réservation de terrains de football à 5, 7 et 11 joueurs en Tunisie,
              tout en offrant un espace pour organiser des tournois amateur de haut niveau.
            </p>
            <p className="sp-body-text">
              Notre plateforme met en relation des gérants de terrains avec des milliers de joueurs,
              digitalisant un marché qui fonctionnait jusqu'ici uniquement par téléphone.
            </p>
          </motion.div>
          <motion.div
            variants={fadeUp}
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="sp-icon-grid"
          >
            {[
              { icon: <MapPin size={28} />, label: 'Tunis & régions' },
              { icon: <Target size={28} />, label: 'Tournois organisés' },
              { icon: <Trophy size={28} />, label: 'Abonnements Premium' },
              { icon: <Star size={28} />, label: 'Avis vérifiés' },
            ].map(({ icon, label }) => (
              <div key={label} className="sp-icon-card">
                <div className="sp-icon-wrap">{icon}</div>
                <span>{label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>

    {/* ── Values ── */}
    <section className="sp-section sp-dark">
      <div className="container">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="sp-section-head">
          <span className="sp-tag">Nos Valeurs</span>
          <h2 className="sp-section-title">Ce qui nous guide</h2>
        </motion.div>
        <div className="sp-values-grid">
          {values.map(({ icon, title, text, color }, i) => (
            <motion.div
              key={title}
              className="sp-value-card"
              variants={fadeUp}
              custom={i * 0.5}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ y: -6 }}
            >
              <div className="sp-value-icon" style={{ background: color + '22', color }}>{icon}</div>
              <h3>{title}</h3>
              <p>{text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* ── Timeline ── */}
    <section className="sp-section sp-light">
      <div className="container">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="sp-section-head">
          <span className="sp-tag-light">Notre Histoire</span>
          <h2 className="sp-section-title dark">De l'idée à la réalité</h2>
        </motion.div>
        <div className="sp-timeline">
          {milestones.map(({ year, label }, i) => (
            <motion.div
              key={year}
              className="sp-tl-item"
              variants={fadeUp}
              custom={i * 0.4}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="sp-tl-dot" />
              <div className="sp-tl-year">{year}</div>
              <div className="sp-tl-label">{label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* ── Team ── */}
    <section className="sp-section sp-dark">
      <div className="container">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="sp-section-head">
          <span className="sp-tag">L'équipe</span>
          <h2 className="sp-section-title">Les visages derrière Takwira</h2>
        </motion.div>
        <div className="sp-team-grid">
          {team.map(({ name, role, emoji, color }, i) => (
            <motion.div
              key={name}
              className="sp-team-card"
              variants={fadeUp}
              custom={i * 0.3}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ y: -6 }}
            >
              <div className="sp-team-avatar" style={{ background: color + '33', border: `2px solid ${color}55` }}>
                <span style={{ fontSize: 36 }}>{emoji}</span>
              </div>
              <h3>{name}</h3>
              <p>{role}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  </div>
);

export default About;
