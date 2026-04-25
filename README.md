# Takwira - Plateforme de Gestion de Football ⚽

Takwira est une application web premium conçue pour simplifier la réservation de terrains de football, l'organisation de tournois et la gestion de clubs. Elle offre une expérience fluide tant pour les joueurs que pour les propriétaires de terrains.

## 🚀 Fonctionnalités Principales

### Pour les Joueurs
- **Réservation en ligne** : Interface intuitive pour réserver des terrains avec filtres par ville et surface.
- **Tournois** : Participation à des tournois (Knockout ou Ligue) avec suivi des scores en temps réel.
- **Gestion d'équipe** : Création et gestion d'équipes pour les compétitions.
- **Historique** : Accès aux statistiques personnelles et historique des matchs.

### Pour les Propriétaires (Plan Club)
- **Gestion de Terrains** : Ajout et modification de terrains.
- **Tableau de Bord Analytique** : Visualisation des revenus et taux d'occupation des terrains.
- **Validation des Réservations** : Contrôle total sur le planning des terrains.

### Pour l'Administrateur
- **Gestion des Tournois** : Création de compétitions complexes (Poules + Phases éliminatoires).
- **Modération** : Validation des demandes de création de tournois.
- **Statistiques Globales** : Vue d'ensemble de l'activité sur la plateforme.

## 🛠️ Stack Technique

- **Frontend** : React.js, Vite, Framer Motion (animations), Lucide React (icones).
- **Backend** : Django REST Framework (Python 3.x).
- **Base de Données** : MySQL / MariaDB.
- **Paiement** : Simulation de paiement sécurisé avec design de carte bancaire réaliste.

## 📥 Installation

### Backend
1. Naviguez vers le dossier backend :
   ```bash
   cd takwira_backend
   ```
2. Installez les dépendances :
   ```bash
   pip install -r requirements.txt
   ```
3. Configurez votre base de données dans `takwira/settings.py` ou via un fichier `.env`.
4. Lancez les migrations :
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
5. Populez la base de données avec des données de test massives :
   ```bash
   python populate_all.py
   ```
6. Lancez le serveur :
   ```bash
   python manage.py runserver
   ```

### Frontend
1. Naviguez vers le dossier frontend :
   ```bash
   cd takwira_frontend
   ```
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Lancez l'application :
   ```bash
   npm run dev
   ```

## 🔑 Identifiants de Test

| Rôle | Email | Mot de passe |
| :--- | :--- | :--- |
| **Admin** | `admin@takwira.tn` | `admin123` |
| **Club Owner** | `owner0@takwira.tn` | `owner123` |
| **Joueur Pro** | `ahmed0@takwira.tn` | `player123` |

## 💳 Plans d'Abonnement

- **Free** : 3 réservations par mois.
- **Pro** : Réservations illimitées + Création de tournois.
- **Club** : Toutes les fonctions Pro + Gestion de terrains + Analytiques avancées.

---
*Développé avec ❤️ par l'équipe Takwira.*
