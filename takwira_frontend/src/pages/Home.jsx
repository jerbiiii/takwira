import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, CheckCircle, Trophy, ArrowRight, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { user } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-container">
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="hero-tag">🏟 Plateforme N°1 en Tunisie</div>
            <h1>YOU WANT TO PLAY<br /><span>LET'S PLAY!</span></h1>
            <p>Trouvez, réservez et gérez des terrains de football près de chez vous en quelques clics. Créez vos tournois, invitez vos amis, jouez.</p>
            <div className="hero-btns">
              {user ? (
                <>
                  <Link to="/terrains" className="btn-primary">Trouver un terrain</Link>
                  <Link to="/tournaments" className="btn-secondary">Gérer mes tournois</Link>
                </>
              ) : (
                <>
                  <Link to="/terrains" className="btn-primary">Trouver un terrain</Link>
                  <Link to="/tournaments" className="btn-secondary">Voir les tournois</Link>
                </>
              )}
            </div>
          </motion.div>
          <motion.div
            className="hero-badge"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <div className="badge-item">
              <span className="num">200+</span>
              <span className="label">Terrains disponibles</span>
            </div>
            <div className="badge-item">
              <span className="num">5K+</span>
              <span className="label">Joueurs actifs</span>
            </div>
            <div className="badge-item">
              <span className="num">50+</span>
              <span className="label">Tournois organisés</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="container stats-container">
          <div className="stat-item"><div className="num">200+</div><div className="label">Terrains</div></div>
          <div className="stat-item"><div className="num">5 000+</div><div className="label">Joueurs</div></div>
          <div className="stat-item"><div className="num">50+</div><div className="label">Tournois</div></div>
          <div className="stat-item"><div className="num">10</div><div className="label">Gouvernorats</div></div>
        </div>
      </div>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="section-tag">Fonctionnalités</div>
          <h2 className="section-title">TOUT CE DONT VOUS AVEZ BESOIN</h2>
          <p className="section-sub">Une plateforme complète pour les amateurs de football en Tunisie.</p>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feat-icon"><MapPin size={24} /></div>
              <h3>Géolocalisation des terrains</h3>
              <p>Trouvez les terrains disponibles autour de vous grâce à la carte interactive en temps réel.</p>
            </div>
            <div className="feature-card">
              <div className="feat-icon"><Calendar size={24} /></div>
              <h3>Disponibilités en temps réel</h3>
              <p>Consultez les créneaux libres de chaque terrain et réservez instantanément sans appel.</p>
            </div>
            <div className="feature-card">
              <div className="feat-icon"><CheckCircle size={24} /></div>
              <h3>Réservation en ligne</h3>
              <p>Réservez votre terrain directement depuis le site, payez en ligne et recevez votre confirmation.</p>
            </div>
            <div className="feature-card">
              <div className="feat-icon"><Trophy size={24} /></div>
              <h3>Gestion de tournois</h3>
              <p>Créez vos propres tournois, gérez les équipes, les scores et les résultats facilement.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section - Reverted to Original HTML Style */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-tag">Comment ça marche</div>
          <h2 className="section-title">EN 3 ÉTAPES SIMPLES</h2>
          
          <motion.div 
            className="steps-original-layout"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div className="step" variants={stepVariants}>
              <div className="step-num">1</div>
              <h3>Recherchez</h3>
              <p>Entrez votre ville ou activez la géolocalisation pour voir les terrains proches de vous.</p>
            </motion.div>
            
            <div className="step-connector">→</div>
            
            <motion.div className="step" variants={stepVariants}>
              <div className="step-num">2</div>
              <h3>Choisissez</h3>
              <p>Sélectionnez votre terrain, vérifiez les disponibilités et choisissez votre créneau.</p>
            </motion.div>
            
            <div className="step-connector">→</div>
            
            <motion.div className="step" variants={stepVariants}>
              <div className="step-num">3</div>
              <h3>Jouez !</h3>
              <p>Payez en ligne, recevez votre confirmation et profitez du terrain. C'est aussi simple que ça.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section - Only show to non-logged users */}
      {!user && (
        <section className="pricing">
          <div className="container">
            <div className="section-tag">Tarifs</div>
            <h2 className="section-title">NOS FORMULES</h2>
            <p className="section-sub">Pour les joueurs occasionnels comme pour les clubs professionnels.</p>

            <div className="pricing-grid">
              <div className="plan">
                <div className="plan-name">Gratuit</div>
                <div className="plan-price">0 <span>TND/mois</span></div>
                <p className="plan-desc">Pour commencer à explorer Takwira</p>
                <ul className="plan-features">
                  <li>Recherche de terrains</li>
                  <li>3 réservations/mois</li>
                  <li>Profil joueur</li>
                  <li>Accès aux tournois publics</li>
                </ul>
                <Link to="/register" className="plan-btn">Commencer gratuitement</Link>
              </div>

              <div className="plan popular">
                <div className="popular-badge">Le plus populaire</div>
                <div className="plan-name">Pro</div>
                <div className="plan-price">29 <span>TND/mois</span></div>
                <p className="plan-desc">Pour les joueurs réguliers et équipes</p>
                <ul className="plan-features">
                  <li>Réservations illimitées</li>
                  <li>Création de tournois</li>
                  <li>Gestion d'équipe</li>
                  <li>Paiement en ligne sécurisé</li>
                  <li>Notifications prioritaires</li>
                </ul>
                <Link to="/register" className="plan-btn">Choisir Pro</Link>
              </div>

              <div className="plan">
                <div className="plan-name">Club</div>
                <div className="plan-price">79 <span>TND/mois</span></div>
                <p className="plan-desc">Pour les propriétaires de terrains et clubs</p>
                <ul className="plan-features">
                  <li>Tout le plan Pro</li>
                  <li>Gestion de terrain (propriétaire)</li>
                  <li>Tableau de bord analytics</li>
                  <li>Support prioritaire</li>
                  <li>Promotion sur la plateforme</li>
                </ul>
                <Link to="/register" className="plan-btn">Choisir Club</Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - Show different content if logged in */}
      <div className="cta-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {user ? (
              <>
                <h2>PRÊT POUR LE PROCHAIN MATCH ?</h2>
                <p>Vos amis vous attendent sur le terrain. Organisez un tournoi dès aujourd'hui.</p>
                <Link to="/tournaments" className="cta-btn">Créer un tournoi</Link>
              </>
            ) : (
              <>
                <h2>PRÊT À JOUER ?</h2>
                <p>Rejoignez des milliers de joueurs qui réservent déjà leurs terrains sur Takwira.</p>
                <Link to="/terrains" className="cta-btn">Réserver un terrain maintenant</Link>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Home;
