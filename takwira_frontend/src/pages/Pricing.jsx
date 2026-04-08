import { useState, useEffect } from 'react';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { CheckCircle, Zap, Shield, Star } from 'lucide-react';
import './Pricing.css';

const Pricing = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await api.get('subscriptions/plans/');
        setPlans(res.data);
      } catch (err) {
        console.error("Error fetching plans:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  if (loading) {
    return <div className="loading-screen">Chargement des tarifs...</div>;
  }

  const getIcon = (name) => {
    switch (name.toLowerCase()) {
      case 'free':
      case 'gratuit':
        return <Zap size={24} />;
      case 'pro':
        return <Star size={24} />;
      case 'club':
        return <Shield size={24} />;
      default:
        return <CheckCircle size={24} />;
    }
  };

  return (
    <div className="pricing-page">
      <section className="pricing-header">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="section-title">Choisissez Votre Formule</h1>
            <p className="section-sub">Des options flexibles pour tous les types de pratiquants et de clubs.</p>
          </motion.div>
        </div>
      </section>

      <section className="pricing-list">
        <div className="container">
          <motion.div 
            className="pricing-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {plans.map((plan) => (
              <motion.div 
                key={plan.id} 
                className={`plan-card ${plan.name.toLowerCase() === 'pro' ? 'popular' : ''}`}
                variants={itemVariants}
                whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
              >
                {plan.name.toLowerCase() === 'pro' && <div className="popular-badge">Recommandé</div>}
                <div className="plan-icon">
                  {getIcon(plan.name)}
                </div>
                <h3>{plan.name}</h3>
                <div className="plan-price">
                  {plan.price_monthly} <span>TND/mois</span>
                </div>
                <ul className="plan-features">
                  <li><CheckCircle size={14} /> {plan.max_reservations} réservations/mois</li>
                  {plan.can_create_tournament && <li><CheckCircle size={14} /> Création de tournois</li>}
                  {plan.can_manage_terrain && <li><CheckCircle size={14} /> Gestion de terrains</li>}
                  <li><CheckCircle size={14} /> Support {plan.name.toLowerCase() === 'free' ? 'Standard' : 'Prioritaire'}</li>
                </ul>
                <button className="btn-select">S'abonner</button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
