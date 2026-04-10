import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, ShieldCheck, Lock, CheckCircle, 
  ArrowLeft, Loader, Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './Payment.css';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  
  // Get plan details from URL params
  const query = new URLSearchParams(location.search);
  const planId = query.get('planId');
  const planName = query.get('planName');
  const price = query.get('price');

  const currentYearLong = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => (currentYearLong + i).toString());
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));

  const [formData, setFormData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardBrand: 'card'
  });
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!planId) {
      navigate('/pricing');
    }
  }, [planId, navigate]);

  const validateForm = () => {
    const { cardNumber, cardHolder, expiryMonth, expiryYear, cvv } = formData;
    const cleanNumber = cardNumber.replace(/\s+/g, '');
    
    if (cleanNumber.length !== 16) {
      toast.error("Le numéro de carte doit comporter 16 chiffres");
      return false;
    }
    if (cardHolder.trim().length < 3) {
      toast.error("Veuillez entrer le nom complet du titulaire");
      return false;
    }
    if (!expiryMonth || !expiryYear) {
      toast.error("Veuillez sélectionner la date d'expiration");
      return false;
    }

    const month = parseInt(expiryMonth);
    const year = parseInt(expiryYear.substring(2));
    const now = new Date();
    const currentYear = parseInt(now.getFullYear().toString().substring(2));
    const currentMonth = now.getMonth() + 1;

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      toast.error("La carte est expirée");
      return false;
    }

    if (cvv.length < 3) {
      toast.error("Le CVV doit comporter 3 chiffres");
      return false;
    }
    return true;
  };

  const getCardBrand = (number) => {
    const cleaned = number.replace(/\s+/g, '');
    if (cleaned.startsWith('4')) return 'visa';
    if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    if (cleaned.length > 0) return 'other';
    return 'card';
  };

  const handleInputChange = (e) => {
    let { name, value } = e.target;
    
    if (name === 'cardNumber') {
      value = value.replace(/\D/g, '').substring(0, 16);
      const brand = getCardBrand(value);
      value = value.match(/.{1,4}/g)?.join(' ') || value;
      setFormData(prev => ({ ...prev, cardNumber: value, cardBrand: brand }));
      return;
    } else if (name === 'cvv') {
      value = value.replace(/\D/g, '').substring(0, 3);
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const renderBrandLogo = (brand, size = 'small') => {
    if (brand === 'visa') {
      return <span className={`visa-logo ${size}`}>VISA</span>;
    }
    if (brand === 'mastercard') {
      return (
        <div className={`mastercard-logo ${size}`}>
          <div className="mc-circle mc-red"></div>
          <div className="mc-circle mc-yellow"></div>
        </div>
      );
    }
    if (brand === 'amex') {
      return <span className={`amex-logo ${size}`}>AMEX</span>;
    }
    return <CreditCard size={size === 'small' ? 20 : 32} />;
  };

  const handleFocus = (e) => {
    if (e.target.name === 'cvv') setIsFlipped(true);
  };

  const handleBlur = () => {
    setIsFlipped(false);
  };

  const isExpired = () => {
    const { expiryMonth, expiryYear } = formData;
    if (!expiryMonth || !expiryYear) return false;
    
    const month = parseInt(expiryMonth);
    const year = parseInt(expiryYear.substring(2));
    const now = new Date();
    const curY = parseInt(now.getFullYear().toString().substring(2));
    const curM = now.getMonth() + 1;

    return year < curY || (year === curY && month < curM);
  };

  const isFormComplete = () => {
    const { cardNumber, cardHolder, expiryMonth, expiryYear, cvv } = formData;
    const cleanNumber = cardNumber.replace(/\s+/g, '');
    
    if (cleanNumber.length !== 16 || cardHolder.trim().length < 3 || !expiryMonth || !expiryYear || cvv.length !== 3) {
      return false;
    }

    const month = parseInt(expiryMonth);
    const year = parseInt(expiryYear.substring(2));
    const now = new Date();
    const currentYear = parseInt(now.getFullYear().toString().substring(2));
    const currentMonth = now.getMonth() + 1;

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    
    // Simulate payment processing
    setTimeout(async () => {
      try {
        // Now call the real backend to activate the subscription
        await api.post('subscriptions/subscribe/', { plan_id: planId });
        setSuccess(true);
        await refreshUser();
        
        // Final redirect to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } catch (err) {
        toast.error("Échec de l'activation du plan. Veuillez réessayer.");
        setLoading(false);
      }
    }, 2500);
  };

  if (!planId) return null;

  return (
    <div className="payment-page">
      <div className="container">
        <motion.div 
          className="payment-container"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <button className="btn-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> Retour
          </button>
          {/* Summary Sidebar */}
          <div className="payment-summary">
            <div className="summary-header">
              <h2>Récapitulatif</h2>
              <p>Activation immédiate après paiement</p>
            </div>

              <div className="pay-plan-details">
                <div className="pay-plan-name">Plan {planName}</div>
                <div className="pay-plan-price">{price} <span>TND/mois</span></div>
              </div>

            <div className="payment-trust">
              <div className="trust-item">
                <ShieldCheck size={18} />
                <span>Paiement 100% Sécurisé</span>
              </div>
              <div className="trust-item">
                <Lock size={18} />
                <span>SSL Encryption active</span>
              </div>
            </div>

            <div className="payment-info-box">
              <Info size={16} />
              <p>Il s'agit d'une simulation sécurisée. Aucune donnée réelle ne sera prélevée.</p>
            </div>
          </div>

          {/* Form Area */}
          <div className="payment-form-area">
            {success ? (
              <motion.div 
                className="success-overlay"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="success-icon">
                  <CheckCircle size={48} />
                </div>
                <h2>Abonnement Activé !</h2>
                <p>Bienvenue dans l'offre {planName}. Redirection vers votre dashboard...</p>
              </motion.div>
            ) : (
              <>
                <div className="card-visual-wrapper">
                  <motion.div 
                    className={`visual-card ${formData.cardBrand}`}
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    {/* Front Side */}
                    <div className="card-face card-front">
                      <div className="card-inner-design">
                        <div className="card-top">
                          <div className="card-chip">
                            <div className="chip-line"></div>
                            <div className="chip-line"></div>
                            <div className="chip-line"></div>
                            <div className="chip-line"></div>
                          </div>
                          <div className="contactless-icon">
                            <div className="wave"></div>
                            <div className="wave"></div>
                            <div className="wave"></div>
                          </div>
                        </div>
                        
                        <div className="card-number-display">
                          {formData.cardNumber || '•••• •••• •••• ••••'}
                        </div>
                        
                        <div className="card-bottom">
                          <div className="card-info-group">
                            <div className="card-holder-display">
                              <label>Titulaire</label>
                              <span>{formData.cardHolder || 'NOM SUR LA CARTE'}</span>
                            </div>
                            <div className={`card-expiry-display ${isExpired() ? 'invalid-date' : ''}`}>
                              <label>Expire</label>
                              <span>{formData.expiryMonth && formData.expiryYear ? `${formData.expiryMonth}/${formData.expiryYear.substring(2)}` : 'MM/YY'}</span>
                            </div>
                          </div>
                          <div className="card-brand-display">
                            {renderBrandLogo(formData.cardBrand, 'large')}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Back Side */}
                    <div className="card-face card-back">
                      <div className="magnetic-strip"></div>
                      <div className="signature-area">
                        <div className="cvv-display">
                          <label>CVV</label>
                          <span>{formData.cvv || '•••'}</span>
                        </div>
                      </div>
                      <div className="back-brand-logo">
                        {renderBrandLogo(formData.cardBrand, 'small')}
                      </div>
                    </div>
                  </motion.div>
                </div>

                <form onSubmit={handleSubmit} className="payment-form">
                  <div className="input-block">
                    <label>Nom sur la carte</label>
                    <input 
                      type="text" 
                      name="cardHolder"
                      placeholder="Ex: MOHAMED BEN ALI"
                      value={formData.cardHolder}
                      onChange={handleInputChange}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      required
                    />
                  </div>

                  <div className="input-block">
                    <label>Numéro de carte</label>
                    <div className="input-with-icon">
                      <input 
                        type="text" 
                        name="cardNumber"
                        placeholder="0000 0000 0000 0000"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        required
                      />
                      <div className={`brand-badge-input ${formData.cardBrand}`}>
                        {renderBrandLogo(formData.cardBrand, 'small')}
                      </div>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="input-block">
                      <label>Date d'expiration</label>
                      <div className={`expiry-selectors ${isExpired() ? 'invalid-date' : ''}`}>
                        <select 
                          name="expiryMonth" 
                          value={formData.expiryMonth} 
                          onChange={handleInputChange}
                          onFocus={handleFocus}
                          onBlur={handleBlur}
                          required
                        >
                          <option value="" disabled>Mois</option>
                          {months.map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                        <select 
                          name="expiryYear" 
                          value={formData.expiryYear} 
                          onChange={handleInputChange}
                          onFocus={handleFocus}
                          onBlur={handleBlur}
                          required
                        >
                          <option value="" disabled>Année</option>
                          {years.map(y => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="input-block">
                      <label>CVV / CVC</label>
                      <input 
                        type="password" 
                        name="cvv"
                        placeholder="•••"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        maxLength="3"
                        required
                      />
                    </div>
                  </div>

                  <button className="btn-pay" type="submit" disabled={loading || !isFormComplete()}>
                    {loading ? (
                      <>
                        <Loader className="animate-spin" size={20} />
                        Traitement en cours...
                      </>
                    ) : (
                      <>Payer {price} TND Maintenant</>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Payment;
