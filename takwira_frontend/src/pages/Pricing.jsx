import { useState, useEffect } from 'react';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { CheckCircle, Zap, Shield, Star, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import './Pricing.css';

const PLAN_FEATURES = {
  free: [
    "Recherche de terrains",
    "3 réservations par mois",
    "Carte interactive",
    "Profil joueur",
    "Accès aux tournois publics",
    "Support standard",
  ],
  gratuit: [
    "Recherche de terrains",
    "3 réservations par mois",
    "Carte interactive",
    "Profil joueur",
    "Accès aux tournois publics",
    "Support standard",
  ],
  pro: [
    "Réservations illimitées",
    "Création de tournois",
    "Gestion d'équipe",
    "Paiement en ligne sécurisé",
    "Notifications prioritaires",
    "Historique complet des matchs",
    "Support prioritaire",
  ],
  club: [
    "Tout le plan Pro",
    "Gestion de terrain (propriétaire)",
    "Plusieurs terrains gérables",
    "Tableau de bord analytics",
    "Statistiques avancées",
    "Promotion sur la plateforme",
    "Support VIP 24/7",
  ],
};

const Pricing = () => {
  const { user, refreshUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribingId, setSubscribingId] = useState(null);

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

  const handleSubscribe = async (plan) => {
    if (!user) {
      toast.error("Veuillez vous connecter pour vous abonner");
      navigate('/login');
      return;
    }

    if (plan.price_monthly === 0 || plan.name.toLowerCase() === 'free' || plan.name.toLowerCase() === 'gratuit') {
      setSubscribingId(plan.id);
      try {
        const res = await api.post('subscriptions/subscribe/', { plan_id: plan.id });
        toast.success(res.data.status || "Abonnement réussi !");
        await refreshUser();
      } catch (err) {
        toast.error(err.response?.data?.detail || "Erreur lors de l'abonnement");
      } finally {
        setSubscribingId(null);
      }
    } else {
      navigate(`/payment?planId=${plan.id}&planName=${encodeURIComponent(plan.name)}&price=${plan.price_monthly}`);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  if (loading || authLoading) {
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

  const getFeatures = (name) => {
    return PLAN_FEATURES[name.toLowerCase()] || [];
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
            {plans.map((plan) => {
              const isCurrentPlan = user?.subscription_plan === plan.id ||
                (user?.subscription_plan_name && user.subscription_plan_name.toLowerCase() === plan.name.toLowerCase());
              const features = getFeatures(plan.name);

              return (
                <motion.div
                  key={plan.id}
                  className={`plan-card ${plan.name.toLowerCase() === 'pro' ? 'popular' : ''} ${isCurrentPlan ? 'active-plan' : ''}`}
                  variants={itemVariants}
                  style={{
                    scale: isCurrentPlan ? 1.15 : 1,
                    zIndex: isCurrentPlan ? 10 : 1
                  }}
                  whileHover={{
                    scale: isCurrentPlan ? 1.2 : 1.05,
                    transition: { duration: 0.2 }
                  }}
                >
                  {plan.name.toLowerCase() === 'pro' && <div className="popular-badge">Recommandé</div>}
                  {isCurrentPlan && <div className="active-badge">Votre Plan Actuel</div>}
                  <div className="plan-icon">
                    {getIcon(plan.name)}
                  </div>
                  <h3>{plan.name}</h3>
                  <div className="plan-price">
                    {plan.price_monthly} <span>TND/mois</span>
                  </div>
                  <ul className="plan-features">
                    {features.map((feature, index) => (
                      <li key={index}><CheckCircle size={14} /> {feature}</li>
                    ))}
                  </ul>
                  <button
                    className={`btn-select ${isCurrentPlan ? 'btn-active' : ''}`}
                    onClick={() => handleSubscribe(plan)}
                    disabled={isCurrentPlan || subscribingId === plan.id}
                  >
                    {subscribingId === plan.id ? (
                      <Loader className="animate-spin" size={20} />
                    ) : isCurrentPlan ? (
                      "Plan Actuel"
                    ) : (
                      "S'abonner"
                    )}
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;