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
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'yearly'

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
      const price = billingCycle === 'yearly' ? (plan.price_monthly * 10).toFixed(0) : plan.price_monthly;
      navigate(`/payment?planId=${plan.id}&planName=${encodeURIComponent(plan.name)}&price=${price}&cycle=${billingCycle}`);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="pricing-loader">
        <Loader className="animate-spin" size={40} />
        <p>Préparation des meilleures offres...</p>
      </div>
    );
  }

  const getIcon = (name) => {
    switch (name.toLowerCase()) {
      case 'free':
      case 'gratuit': return <Zap size={28} />;
      case 'pro': return <Star size={28} />;
      case 'club': return <Shield size={28} />;
      default: return <CheckCircle size={28} />;
    }
  };

  const comparisonFeatures = [
    { label: "Recherche de terrains", free: true, pro: true, club: true },
    { label: "Réservations mensuelles", free: "3 / mois", pro: "Illimitées", club: "Illimitées" },
    { label: "Création de tournois", free: false, pro: true, club: true },
    { label: "Gestion d'équipe", free: false, pro: true, club: true },
    { label: "Paiement en ligne", free: false, pro: true, club: true },
    { label: "Plusieurs terrains", free: false, pro: false, club: true },
    { label: "Analytics avancés", free: false, pro: false, club: true },
    { label: "Support client", free: "Standard", pro: "Prioritaire", club: "VIP 24/7" },
  ];

  return (
    <div className="pricing-page">
      <section className="pricing-hero">
        <div className="container">
          <motion.div
            className="pricing-hero-content"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="pricing-badge">Tarification</div>
            <h1 className="hero-title">Une offre pour chaque <span>Takwiriste</span></h1>
            <p className="hero-sub">Des options flexibles pour tous les types de pratiquants et de clubs.</p>
          </motion.div>
        </div>
      </section>

      <div className="billing-toggle-container">
        <div className="billing-toggle">
          <span className={billingCycle === 'monthly' ? 'active' : ''}>Mensuel</span>
          <button 
            className={`toggle-btn ${billingCycle}`} 
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
          >
            <div className="toggle-dot"></div>
          </button>
          <span className={billingCycle === 'yearly' ? 'active' : ''}>Annuel</span>
          <div className="yearly-save">2 mois offerts</div>
        </div>
      </div>

      <section className="pricing-cards-section">
        <div className="container">
          <div className="pricing-cards-grid">
            {plans.map((plan, idx) => {
              const isCurrentPlan = user?.subscription_plan === plan.id ||
                (user?.subscription_plan_name && user.subscription_plan_name.toLowerCase() === plan.name.toLowerCase());
              const features = PLAN_FEATURES[plan.name.toLowerCase()] || [];
              const isPopular = plan.name.toLowerCase() === 'pro';
              const displayPrice = billingCycle === 'yearly' ? (plan.price_monthly * 10) : plan.price_monthly;

              return (
                <motion.div
                  key={plan.id}
                  className={`premium-plan-card ${isPopular ? 'popular' : ''} ${isCurrentPlan ? 'current' : ''}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                >
                  {isPopular && <div className="card-popular-badge">Recommandé</div>}
                  {isCurrentPlan && <div className="card-current-badge">Plan Actuel</div>}
                  
                  <div className="card-header">
                    <div className="card-icon">{getIcon(plan.name)}</div>
                    <h3>{plan.name}</h3>
                    <div className="card-price">
                      <span className="currency">TND</span>
                      <span className="amount">{displayPrice}</span>
                      <span className="period">{billingCycle === 'yearly' ? '/an' : '/mois'}</span>
                    </div>
                  </div>

                  <div className="card-divider"></div>

                  <ul className="card-features">
                    {features.slice(0, 6).map((f, i) => (
                      <li key={i}><CheckCircle size={16} /> {f}</li>
                    ))}
                  </ul>

                  <button
                    className={`card-cta ${isPopular ? 'primary' : 'secondary'} ${isCurrentPlan ? 'disabled' : ''}`}
                    onClick={() => handleSubscribe(plan)}
                    disabled={isCurrentPlan || subscribingId === plan.id}
                  >
                    {subscribingId === plan.id ? (
                      <Loader className="animate-spin" size={20} />
                    ) : isCurrentPlan ? (
                      "Votre Plan Actuel"
                    ) : (
                      "Commencer"
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="pricing-comparison">
        <div className="container">
          <h2 className="comparison-title">Comparez les plans</h2>
          <div className="comparison-table-wrapper">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Fonctionnalités</th>
                  <th>Gratuit</th>
                  <th>Pro</th>
                  <th>Club</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((f, i) => (
                  <tr key={i}>
                    <td>{f.label}</td>
                    <td>{typeof f.free === 'boolean' ? (f.free ? <CheckCircle className="check" size={18} /> : <span className="dash">-</span>) : f.free}</td>
                    <td>{typeof f.pro === 'boolean' ? (f.pro ? <CheckCircle className="check" size={18} /> : <span className="dash">-</span>) : f.pro}</td>
                    <td>{typeof f.club === 'boolean' ? (f.club ? <CheckCircle className="check" size={18} /> : <span className="dash">-</span>) : f.club}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;