# ONEWAYTICKET

Application de billetterie événementielle moderne avec React, TypeScript, Supabase et Stripe.

## Caractéristiques

- Authentification utilisateur (Email/Password + OAuth Google)
- Gestion d'événements
- Système de billetterie avec QR codes
- Paiements sécurisés via Stripe
- Emails transactionnels via Resend
- Génération de PDF pour les billets
- Interface responsive et moderne
- Progressive Web App (PWA)

## Stack Technique

### Frontend
- **Vite** - Build tool ultra-rapide
- **React 18** - Bibliothèque UI
- **TypeScript** - Typage statique
- **Tailwind CSS 4** - Framework CSS utility-first
- **React Router** - Navigation
- **SWR** - Data fetching et cache

### Backend & Services
- **Supabase** - Base de données PostgreSQL, Auth, Storage
- **Stripe** - Paiements sécurisés
- **Resend** - Emails transactionnels
- **OpenAI GPT-4** - Génération de descriptions par IA

## Prérequis

- Node.js 18+
- npm ou yarn
- Compte Supabase (gratuit)
- Compte Stripe (mode test gratuit)
- Compte Resend (gratuit)
- Clé API OpenAI (optionnel, pour la génération IA)

## Installation

1. **Cloner le projet**
```bash
git clone <votre-repo>
cd onewayticket
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**

Le fichier `.env` est déjà configuré avec vos clés. Vérifiez qu'il contient :

```env
# Supabase
VITE_SUPABASE_URL="https://vnijdjjzgruujvagrihu.supabase.co"
VITE_SUPABASE_ANON_KEY="votre-clé-anon"

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY="votre-clé-publique"

# Resend
RESEND_API_KEY="votre-clé-resend"

# OpenAI (optionnel)
VITE_OPENAI_API_KEY="votre-clé-openai"
```

4. **Configurer la base de données Supabase**

a. Connectez-vous à votre dashboard Supabase : https://app.supabase.com

b. Allez dans **SQL Editor**

c. Copiez le contenu du fichier `supabase-schema.sql` et exécutez-le

d. Créez un bucket Storage nommé `event-images` :
   - Allez dans **Storage**
   - Cliquez sur **New bucket**
   - Nom : `event-images`
   - Public : Oui

5. **Configurer Stripe**

a. Créez un compte sur https://stripe.com

b. Activez le **mode test**

c. Récupérez vos clés dans **Developers > API keys**

d. Configurez un webhook :
   - URL : `https://votre-domaine.com/api/payments/webhook`
   - Événements : `payment_intent.succeeded`, `payment_intent.payment_failed`

## Démarrage

### Mode développement
```bash
npm run dev
```

L'application sera accessible sur http://localhost:5173

### Build production
```bash
npm run build
```

### Preview du build
```bash
npm run preview
```

## Structure du Projet

```
onewayticket/
├── src/
│   ├── components/          # Composants React réutilisables
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── contexts/            # Contextes React
│   │   └── AuthContext.tsx
│   ├── lib/                 # Utilitaires et helpers
│   │   ├── supabase.ts
│   │   ├── auth.ts
│   │   ├── qrcode.ts
│   │   └── pdf.ts
│   ├── pages/               # Pages de l'application
│   │   ├── HomePage.tsx
│   │   ├── EventsPage.tsx
│   │   ├── EventDetailPage.tsx
│   │   ├── MyTicketsPage.tsx
│   │   ├── AboutPage.tsx
│   │   ├── ContactPage.tsx
│   │   └── auth/
│   │       ├── LoginPage.tsx
│   │       └── RegisterPage.tsx
│   ├── types/               # Types TypeScript
│   │   └── database.ts
│   ├── App.tsx              # Composant principal
│   └── main.tsx             # Point d'entrée
├── supabase-schema.sql      # Schéma de la base de données
├── .env                     # Variables d'environnement
└── package.json             # Dépendances
```

## Base de Données

Le schéma comprend 12 tables :

1. **users** - Utilisateurs
2. **categories** - Catégories d'événements
3. **events** - Événements
4. **ticket_types** - Types de billets
5. **tickets** - Billets achetés
6. **payments** - Paiements
7. **payment_tickets** - Liaison paiements-billets
8. **reviews** - Avis
9. **favorites** - Favoris
10. **ai_generations** - Historique IA

Toutes les tables ont **Row Level Security (RLS)** activé pour la sécurité.

## Fonctionnalités Principales

### Pour les Utilisateurs
- Recherche et filtrage d'événements
- Réservation et achat de billets
- Paiement sécurisé par carte
- Réception d'emails de confirmation
- Téléchargement de billets PDF avec QR code
- Dashboard personnel des billets

### Pour les Organisateurs
- Création et gestion d'événements
- Configuration de types de billets multiples
- Upload d'images
- Génération automatique de descriptions par IA
- Statistiques des ventes
- Gestion des participants

## Sécurité

- Authentification Supabase avec JWT
- Row Level Security (RLS) sur toutes les tables
- Paiements PCI-DSS compliant via Stripe
- HTTPS obligatoire en production
- Validation des données côté client et serveur
- Protection CSRF et XSS

## Déploiement

### Vercel (Recommandé)

1. Connectez votre repo GitHub à Vercel
2. Configurez les variables d'environnement
3. Déployez automatiquement

### Autres plateformes

Le projet fonctionne sur :
- Netlify
- Railway
- Render
- Tout hébergeur supportant Node.js

## Scripts npm

```bash
npm run dev          # Démarrage en mode dev
npm run build        # Build production
npm run preview      # Preview du build
npm run lint         # Linter ESLint
npm run typecheck    # Vérification TypeScript
```

## Contribuer

1. Fork le projet
2. Créez une branche (`git checkout -b feature/ma-fonctionnalite`)
3. Committez (`git commit -m 'Ajout de ma fonctionnalité'`)
4. Push (`git push origin feature/ma-fonctionnalite`)
5. Ouvrez une Pull Request

## Licence

MIT

## Support

Pour toute question ou problème :
- Email : contact@onewayticket.fr
- GitHub Issues : [Votre repo]

## Auteurs

Développé avec React, TypeScript et Supabase.

---

Fait avec ❤️ par l'équipe ONEWAYTICKET
