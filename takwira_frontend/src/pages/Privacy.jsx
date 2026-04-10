import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database, UserCheck, Bell, Trash2, Globe } from 'lucide-react';
import './StaticPage.css';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: 'easeOut' },
  }),
};

const rights = [
  { icon: <Eye size={20} />, title: 'Droit d\'accès', text: 'Consultez toutes vos données personnelles stockées par Takwira à tout moment.' },
  { icon: <UserCheck size={20} />, title: 'Droit de rectification', text: 'Corrigez vos informations personnelles si elles sont inexactes ou incomplètes.' },
  { icon: <Trash2 size={20} />, title: 'Droit à l\'effacement', text: 'Demandez la suppression de vos données personnelles (droit à l\'oubli).' },
  { icon: <Lock size={20} />, title: 'Droit de limitation', text: 'Limitez le traitement de vos données dans certaines circonstances.' },
  { icon: <Globe size={20} />, title: 'Droit à la portabilité', text: 'Récupérez vos données dans un format structuré et lisible par machine.' },
  { icon: <Bell size={20} />, title: 'Droit d\'opposition', text: 'Opposez-vous au traitement de vos données à des fins de marketing.' },
];

const sections = [
  {
    icon: <Database size={22} />,
    title: '1. Données collectées',
    color: '#2e8b4a',
    content: [
      '**Données d\'inscription** : nom, prénom, adresse email, mot de passe chiffré, numéro de téléphone.',
      '**Données de réservation** : terrain choisi, créneau horaire, historique des réservations.',
      '**Données de paiement** : informations bancaires traitées via des prestataires certifiés PCI-DSS (jamais stockées chez nous).',
      '**Données de navigation** : pages visitées, durée des sessions, adresse IP, type de navigateur (via cookies analytiques).',
    ],
  },
  {
    icon: <Shield size={22} />,
    title: '2. Finalités du traitement',
    color: '#3498db',
    content: [
      'Création et gestion de votre compte utilisateur.',
      'Traitement et confirmation de vos réservations.',
      'Communication transactionnelle (confirmations, rappels, factures).',
      'Amélioration de nos services via l\'analyse anonymisée des usages.',
      'Prévention de la fraude et sécurité de la plateforme.',
    ],
  },
  {
    icon: <Lock size={22} />,
    title: '3. Sécurité des données',
    color: '#e67e22',
    content: [
      'Chiffrement SSL/TLS pour toutes les communications entre votre navigateur et nos serveurs.',
      'Mots de passe hachés avec bcrypt — jamais stockés en clair.',
      'Accès aux données restreint aux employés habilités via contrôle de rôles (RBAC).',
      'Audits de sécurité réguliers et tests de pénétration trimestriels.',
      'Sauvegardes chiffrées quotidiennes avec rétention de 30 jours.',
    ],
  },
  {
    icon: <UserCheck size={22} />,
    title: '4. Partage des données',
    color: '#8e44ad',
    content: [
      'Takwira **ne vend jamais** vos données personnelles à des tiers.',
      'Partage limité avec nos prestataires techniques (hébergement, paiement) sous contrat de confidentialité.',
      'Partage avec les gérants de terrains uniquement pour les informations nécessaires à votre réservation.',
      'Divulgation aux autorités uniquement sur demande légale conforme à la loi tunisienne.',
    ],
  },
  {
    icon: <Bell size={22} />,
    title: '5. Cookies et traceurs',
    color: '#e74c3c',
    content: [
      '**Cookies essentiels** : nécessaires au fonctionnement de la plateforme (authentification, session).',
      '**Cookies analytiques** : mesure d\'audience via des outils respectueux de la vie privée (opt-in).',
      '**Cookies de préférence** : mémorisation de vos choix d\'interface.',
      'Vous pouvez gérer vos préférences de cookies à tout moment depuis les paramètres de votre navigateur.',
    ],
  },
  {
    icon: <Globe size={22} />,
    title: '6. Transferts internationaux',
    color: '#1abc9c',
    content: [
      'Vos données sont principalement hébergées en Tunisie et dans l\'Union Européenne.',
      'Tout transfert hors UE est encadré par des clauses contractuelles types (CCT) conformes au RGPD.',
      'Nous garantissons un niveau de protection équivalent quel que soit le pays de traitement.',
    ],
  },
];

const Privacy = () => (
  <div className="static-page">
    {/* ── Hero ── */}
    <section className="sp-hero">
      <div className="sp-hero-glow" />
      <div className="sp-hero-glow sp-hero-glow-2" />
      <div className="container">
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="sp-hero-inner">
          <span className="sp-tag">Politique de confidentialité</span>
          <h1 className="sp-hero-title">
            Vos données,<br /><span>votre vie privée</span>
          </h1>
          <p className="sp-hero-sub">
            Chez Takwira, la protection de vos données personnelles est une priorité absolue.
            Cette politique explique comment nous collectons, utilisons et protégeons vos informations.
          </p>
          <div className="sp-privacy-meta">
            <span>📅 Dernière mise à jour : 1er janvier 2025</span>
            <span>📜 Version 2.1</span>
          </div>
        </motion.div>
      </div>
    </section>

    {/* ── Sections ── */}
    <section className="sp-section sp-light">
      <div className="container">
        <div className="sp-privacy-grid">
          {sections.map(({ icon, title, color, content }, i) => (
            <motion.div
              key={title}
              className="sp-privacy-card"
              variants={fadeUp}
              custom={i * 0.2}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="sp-privacy-card-head">
                <div className="sp-privacy-icon" style={{ background: color + '22', color }}>{icon}</div>
                <h3>{title}</h3>
              </div>
              <ul className="sp-privacy-list">
                {content.map((item, j) => (
                  <li key={j} dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* ── Your Rights ── */}
    <section className="sp-section sp-dark">
      <div className="container">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="sp-section-head">
          <span className="sp-tag">Vos droits</span>
          <h2 className="sp-section-title">Vous êtes en contrôle</h2>
          <p className="sp-section-sub">
            Conformément au RGPD et à la loi tunisienne n°2004-63, vous disposez des droits suivants :
          </p>
        </motion.div>
        <div className="sp-rights-grid">
          {rights.map(({ icon, title, text }, i) => (
            <motion.div
              key={title}
              className="sp-right-card"
              variants={fadeUp}
              custom={i * 0.2}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="sp-right-icon">{icon}</div>
              <h4>{title}</h4>
              <p>{text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* ── Contact DPO ── */}
    <section className="sp-section sp-light">
      <div className="container">
        <motion.div className="sp-dpo-box" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <Shield size={40} color="#2e8b4a" />
          <div>
            <h3>Délégué à la Protection des Données (DPO)</h3>
            <p>Pour exercer vos droits ou pour toute question relative à cette politique, contactez notre DPO :</p>
            <a href="mailto:dpo@takwira.tn" className="sp-dpo-email">dpo@takwira.tn</a>
          </div>
        </motion.div>
      </div>
    </section>
  </div>
);

export default Privacy;
