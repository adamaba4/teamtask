# 🗂️ TeamTask — Application web de gestion de tâches collaborative

TeamTask est une application web permettant à plusieurs utilisateurs de gérer et organiser leurs tâches au sein d'un espace partagé. L'objectif est de faciliter la planification du travail en groupe en offrant un calendrier commun, la gestion de tâches, un système de réunions et un espace de communication entre les membres.

## 🚀 Fonctionnalités

**Authentification**
- Inscription et connexion sécurisées (mots de passe hachés avec bcrypt)
- Gestion de session PHP

**Gestion de projets**
- Création de projets avec dates de début et de fin
- Système de rôles : chef de projet / membre
- Ajout de membres par email (réservé au chef de projet)
- Support multi-projets par utilisateur

**Tableau de bord**
- Calendrier interactif (vue mois) avec navigation
- Points colorés pour les deadlines et réunions
- Cartes statistiques (tâches en retard, en cours, terminées, réunions du mois)
- Panneau de détails au clic sur un jour
- Deadlines à venir avec compte à rebours

**Gestion des tâches**
- Création de tâches avec catégorie, priorité, dates et couleur
- Tâches publiques (visibles par tous) et privées (visibles uniquement par le créateur)
- Filtrage et consultation des tâches par projet ou par membre

**Réunions**
- Création de réunions avec titre, description, date, lieu
- Sélection des participants via checkboxes
- Affichage sur le calendrier partagé

**Messagerie**
- Chat privé entre membres
- Liste des contacts avec aperçu du dernier message
- Envoi et réception de messages en temps réel

**Forum**
- Publications liées au projet
- Système de likes et commentaires

## 🛠️ Stack technique

| Composant | Technologie |
|-----------|-------------|
| Frontend | HTML, CSS, JavaScript (vanilla) |
| Backend | PHP (architecture MVC) |
| Base de données | PostgreSQL |
| Communication | API REST (JSON) |
| Versioning | Git / GitLab |

## 📁 Structure du projet

```
teamtask/
├── accueil.html / .css / .js
├── connexion.html / .css / .js
├── inscription.html / .css / .js
├── projet.html / .css / .js
├── dashboard.html / .css / .js
├── messages.html / .css / .js
├── taches.html / .css / .js
├── forum.html / .css / .js
├── images/
└── backend/
    ├── config/
    │   ├── db.php
    │   └── tables.php
    ├── models/
    │   ├── User.php
    │   ├── Task.php
    │   ├── Projet.php
    │   └── Message.php
    └── controllers/
        ├── auth.php
        ├── user.php
        ├── taches.php
        ├── projet.php
        ├── message.php
        └── forum.php
```

## ⚙️ Installation

### Prérequis

- PHP 8.0+
- PostgreSQL 14+

### Étapes

1. **Cloner le projet**
```bash
git clone https://gitlab.sorbonne-paris-nord.fr/12301364/teamtask.git
cd teamtask
```

2. **Configurer la base de données**

Créer la base de données PostgreSQL :
```bash
psql -U votre_utilisateur -d postgres -c "CREATE DATABASE teamtask;"
```

Modifier les identifiants dans `backend/config/db.php` :
```php
$hostname = 'localhost';
$db_name = 'teamtask';
$user = 'votre_utilisateur';
$password = 'votre_mot_de_passe';
$port = '5432';
```

3. **Créer les tables**
```bash
php backend/config/tables.php
```

4. **Lancer le serveur**
```bash
php -S localhost:8000
```

5. **Accéder à l'application**

Ouvrir le navigateur sur `http://localhost:8000/accueil.html`

## 📊 Schéma de la base de données

```
users ──────────┬── projet (créateur)
                │   ├── projet_membre (user + rôle)
                │   ├── taches (user + projet)
                │   ├── reunion (user + projet)
                │   │   └── reunion_membre (participants)
                │   └── forum (user + projet)
                │       └── comments_forum
                ├── messages (sender ↔ receiver)
                └── notifications
```

## 👥 Équipe

| Membre | Rôle | Responsabilités |
|--------|------|-----------------|
| **Adama BA** | Backend & Dashboard | Architecture backend (PHP/MVC), modèles, contrôleurs, tableau de bord, calendrier, messagerie, page projets |
| **Nasifa Zabalmougamadou** | Frontend & Fonctions | Pages principales (accueil, connexion, inscription), page des tâches, forum, fonctions backend |

## 📄 Licence

Projet universitaire — Université Sorbonne Paris Nord — 2026