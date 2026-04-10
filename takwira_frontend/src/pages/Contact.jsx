import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Send, MessageSquare, ExternalLink, Share2, AtSign } from 'lucide-react';
import './StaticPage.css';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: 'easeOut' },
  }),
};

const channels = [
  { icon: <Mail size={22} />, title: 'Email', value: 'contact@takwira.tn', sub: 'Réponse sous 24h', color: '#2e8b4a' },
  { icon: <Phone size={22} />, title: 'Téléphone', value: '+216 71 000 000', sub: 'Lun–Ven, 9h–18h', color: '#3498db' },
];

const faqs = [
  { q: 'Comment réserver un terrain ?', a: 'Créez un compte, parcourez les terrains disponibles et choisissez votre créneau en quelques clics. Le paiement est sécurisé via notre plateforme.' },
  { q: 'Puis-je annuler une réservation ?', a: 'Oui, les annulations sont possibles jusqu\'à 24h avant le début de la session. Des frais peuvent s\'appliquer selon la politique du terrain.' },
  { q: 'Comment devenir terrain partenaire ?', a: 'Contactez-nous par email ou téléphone. Notre équipe vous accompagnera pour intégrer votre terrain sur la plateforme.' },
  { q: 'Quels modes de paiement sont acceptés ?', a: 'Nous acceptons les cartes bancaires (Visa, Mastercard) ainsi que le paiement sur place selon le terrain choisi.' },
];

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [open, setOpen] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="static-page">
      {/* ── Hero ── */}
      <section className="sp-hero">
        <div className="sp-hero-glow" />
        <div className="sp-hero-glow sp-hero-glow-2" />
        <div className="container">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="sp-hero-inner">
            <span className="sp-tag">Contact</span>
            <h1 className="sp-hero-title">
              Nous sommes là<br /><span>pour vous aider</span>
            </h1>
            <p className="sp-hero-sub">
              Une question, un partenariat, un retour ? Notre équipe vous répondra dans les meilleurs délais.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Channels ── */}
      <section className="sp-section sp-light">
        <div className="container">
          <div className="sp-channels-grid">
            {channels.map(({ icon, title, value, sub, color }, i) => (
              <motion.div
                key={title}
                className="sp-channel-card"
                variants={fadeUp}
                custom={i * 0.3}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="sp-channel-icon" style={{ background: color + '22', color }}>{icon}</div>
                <h3>{title}</h3>
                <p className="sp-channel-val">{value}</p>
                <span className="sp-channel-sub">{sub}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Form + FAQ ── */}
      <section className="sp-section sp-dark">
        <div className="container">
          <div className="sp-contact-two-col">
            {/* Form */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <h2 className="sp-section-title" style={{ marginBottom: '1.5rem' }}>Envoyez-nous un message</h2>
              {sent ? (
                <motion.div
                  className="sp-success-box"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <span style={{ fontSize: 48 }}>✅</span>
                  <h3>Message envoyé !</h3>
                  <p>Nous vous répondrons dans les 24 heures.</p>
                  <button className="sp-btn" onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}>
                    Envoyer un autre message
                  </button>
                </motion.div>
              ) : (
                <form className="sp-contact-form" onSubmit={handleSubmit}>
                  <div className="sp-form-row">
                    <div className="sp-form-group">
                      <label>Nom complet</label>
                      <input required type="text" placeholder="Votre nom" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div className="sp-form-group">
                      <label>Email</label>
                      <input required type="email" placeholder="votre@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                    </div>
                  </div>
                  <div className="sp-form-group">
                    <label>Sujet</label>
                    <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required>
                      <option value="">Choisissez un sujet</option>
                      <option>Réservation</option>
                      <option>Partenariat terrain</option>
                      <option>Problème technique</option>
                      <option>Facturation</option>
                      <option>Autre</option>
                    </select>
                  </div>
                  <div className="sp-form-group">
                    <label>Message</label>
                    <textarea rows={5} required placeholder="Décrivez votre demande en détail…" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
                  </div>
                  <motion.button type="submit" className="sp-btn sp-btn-full" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                    <Send size={16} /> Envoyer le message
                  </motion.button>
                </form>
              )}
            </motion.div>

            {/* FAQ */}
            <motion.div variants={fadeUp} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <h2 className="sp-section-title" style={{ marginBottom: '1.5rem' }}>Questions fréquentes</h2>
              <div className="sp-faq">
                {faqs.map(({ q, a }, i) => (
                  <div key={i} className={`sp-faq-item ${open === i ? 'open' : ''}`} onClick={() => setOpen(open === i ? null : i)}>
                    <div className="sp-faq-q">
                      <MessageSquare size={16} />
                      <span>{q}</span>
                      <span className="sp-faq-arrow">{open === i ? '▲' : '▼'}</span>
                    </div>
                    {open === i && (
                      <motion.p
                        className="sp-faq-a"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        {a}
                      </motion.p>
                    )}
                  </div>
                ))}
              </div>

              <div className="sp-social-row" style={{ marginTop: '2.5rem' }}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: '1rem' }}>Suivez-nous sur les réseaux</p>
                <div className="sp-social-icons">
                  {[{ icon: <AtSign size={20} />, label: 'Instagram' }, { icon: <Share2 size={20} />, label: 'Facebook' }, { icon: <ExternalLink size={20} />, label: 'Twitter' }].map(({ icon, label }) => (
                    <motion.a key={label} href="#" className="sp-social-btn" whileHover={{ scale: 1.1, y: -3 }} aria-label={label}>{icon}</motion.a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
