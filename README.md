# ⚽ Takwira — Plateforme de Réservation de Terrains de Football

**Takwira** est une application web full-stack permettant aux joueurs de football en Tunisie de rechercher, réserver des terrains de football et de participer à des tournois — le tout via une interface moderne, animée et responsive.

---

## 🎯 Fonctionnalités principales

### Pour les joueurs
- **Recherche de terrains** — Parcourez les terrains disponibles avec filtrage par ville/gouvernorat et carte interactive (Leaflet).
- **Réservation en ligne** — Consultez les créneaux disponibles via un calendrier dynamique et réservez instantanément.
- **Tournois** — Inscrivez-vous à des tournois publics ou demandez la création d'un tournoi personnalisé.
- **Dashboard joueur** — Suivez vos réservations, historique de matchs et inscriptions aux tournois.
- **Abonnements Premium** — Trois formules (Gratuit, Pro à 29 TND/mois, Club à 79 TND/mois) avec paiement en ligne sécurisé.

### Pour les administrateurs
- **Gestion des terrains** — Créer, modifier et supprimer des terrains depuis le panneau admin.
- **Gestion des tournois** — Créer des tournois, gérer les inscriptions et les résultats.
- **Gestion des réservations** — Valider, annuler et suivre toutes les réservations de la plateforme.
- **Demandes de tournois** — Examiner et approuver les demandes de création de tournois soumises par les joueurs.
- **Logs d'activité** — Consulter l'historique des actions effectuées sur la plateforme avec filtrage avancé.

---

## 🛠 Stack technique

| Couche | Technologies |
|--------|-------------|
| **Frontend** | React 19, Vite 8, React Router 7, Framer Motion, Axios, Lucide Icons, Leaflet / React-Leaflet |
| **Backend** | Django (Python), Django REST Framework |
| **Base de données** | SQLite (développement) — compatible PostgreSQL en production |
| **Styling** | Vanilla CSS avec design premium (glassmorphism, gradients, micro-animations, dark mode) |
| **Authentification** | JWT (JSON Web Tokens) via `jwt-decode` |

---

## 📁 Structure du projet

```
Marketing App/
├── takwira_backend/          # API Django
│   ├── apps/
│   │   ├── users/            # Authentification et gestion des utilisateurs
│   │   ├── terrains/         # CRUD terrains + statistiques plateforme
│   │   ├── reservations/     # Système de réservation
│   │   ├── tournaments/      # Gestion des tournois
│   │   ├── subscriptions/    # Plans d'abonnement et paiements
│   │   ├── logs/             # Journalisation des actions admin
│   │   └── utils/            # Utilitaires partagés
│   ├── takwira/              # Configuration Django (settings, urls, wsgi)
│   └── manage.py
│
├── takwira_frontend/         # Application React
│   └── src/
│       ├── pages/            # Pages de l'application
│       │   ├── Home.jsx          # Page d'accueil avec hero, stats, pricing
│       │   ├── Terrains.jsx      # Liste et carte des terrains
│       │   ├── Tournaments.jsx   # Liste des tournois
│       │   ├── Dashboard.jsx     # Espace joueur
│       │   ├── AdminDashboard.jsx # Panneau d'administration
│       │   ├── Login.jsx         # Connexion
│       │   ├── Register.jsx      # Inscription
│       │   ├── Pricing.jsx       # Page des tarifs
│       │   ├── Payment.jsx       # Paiement avec carte 3D interactive
│       │   ├── RequestTournament.jsx # Demande de tournoi
│       │   ├── About.jsx         # À propos
│       │   ├── Contact.jsx       # Contact
│       │   └── Privacy.jsx       # Politique de confidentialité
│       ├── components/       # Composants réutilisables
│       │   ├── Navbar.jsx        # Barre de navigation
│       │   ├── Footer.jsx        # Pied de page
│       │   ├── BookingModal.jsx   # Modal de réservation
│       │   ├── DatePicker.jsx     # Sélecteur de date custom
│       │   ├── TimePicker.jsx     # Sélecteur d'heure custom
│       │   ├── DateRangePicker.jsx # Sélecteur de plage de dates
│       │   ├── LoginAnimation.jsx # Animation d'authentification
│       │   └── ...
│       ├── context/          # Contextes React (AuthContext)
│       └── api/              # Configuration Axios
│
├── requirements.txt          # Dépendances Python
└── README.md
```

---

## 🚀 Installation et lancement

### Prérequis

- **Node.js** ≥ 20 et **npm**
- **Python** ≥ 3.11 et **pip**
- **Git**

### Backend (Django)

```bash
# Cloner le repo
git clone https://github.com/jerbiiii/takwira.git
cd "Marketing App"

# Créer un environnement virtuel
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

# Installer les dépendances
pip install -r requirements.txt

# Appliquer les migrations et démarrer le serveur
cd takwira_backend
python manage.py migrate
python manage.py runserver
```

Le serveur API sera disponible sur `http://127.0.0.1:8000/`.

### Frontend (React + Vite)

```bash
cd takwira_frontend
npm install
npm run dev
```

L'application sera accessible sur `http://localhost:5173/` et les appels API seront automatiquement redirigés vers le backend Django.

---

## 🎨 Design et UX

L'interface de Takwira met l'accent sur une expérience visuelle premium :

- **Glassmorphism** — Effets de verre dépoli sur les cartes et modals.
- **Animations Framer Motion** — Transitions de pages fluides, apparitions au scroll, animations d'authentification interactives (silhouette de joueur animée sur la page login).
- **Dark mode** — Thème sombre cohérent avec palette de verts (#00E676, #1B5E20).
- **Carte interactive** — Visualisation des terrains sur carte Leaflet avec géolocalisation.
- **Responsive** — Interface adaptée mobile, tablette et desktop.
- **Carte de paiement 3D** — Animation 3D interactive de carte bancaire lors du paiement.

---

## 📝 Licence

Ce projet est sous licence **MIT** — voir le fichier `LICENSE` pour plus de détails.

---

## 📬 Contact

Pour toute question ou suggestion, contactez l'équipe Takwira à `contact@takwira.io`.
