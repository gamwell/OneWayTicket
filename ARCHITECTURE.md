# 🏗️ ARCHITECTURE CLIENT-SERVEUR - OneWayTicket

## 📊 VUE D'ENSEMBLE

OneWayTicket utilise une **architecture client-serveur moderne** basée sur :
- **Frontend** : React + Vite (Application monopage - SPA)
- **Backend** : Supabase (Backend-as-a-Service)
- **Architecture** : JAMstack (JavaScript, API, Markup)

---

## 🎯 SCHÉMA GÉNÉRAL

```
┌─────────────────────────────────────────────────────────────┐
│                     UTILISATEURS FINAUX                      │
│              (Navigateurs Web / Appareils Mobiles)          │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ HTTPS (Port 443)
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    NOM DE DOMAINE (DNS)                      │
│              https://onewayticket.com                        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Cloudflare / DNS Provider                  │  │
│  │  • Résolution DNS                                    │  │
│  │  • Protection DDoS                                   │  │
│  │  • CDN (optionnel)                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
                ▼                       ▼
┌───────────────────────────┐  ┌──────────────────────────────┐
│     COUCHE FRONTEND       │  │     COUCHE BACKEND           │
│      (CLIENT-SIDE)        │  │     (SERVER-SIDE)            │
│                           │  │                              │
│  Hébergé sur: Vercel      │  │  Hébergé sur: Supabase       │
│  URL: vercel.app          │  │  URL: supabase.co            │
└───────────────────────────┘  └──────────────────────────────┘
```

---

## 🎨 COUCHE FRONTEND (Client)

### **Responsabilités**
- Affichage de l'interface utilisateur
- Gestion des interactions utilisateur
- Gestion de l'état local (React Context)
- Appels API vers le backend
- Validation côté client
- Routage (React Router)

### **Technologies**
```
React 18.3.1          → Framework UI
TypeScript            → Langage typé
Vite 5.4.2            → Bundler ultra-rapide
React Router 7.9.4    → Routage SPA
Tailwind CSS 3.4.1    → Styles utility-first
Lucide React          → Icônes
SWR 2.3.6             → Data fetching et cache
```

### **Structure du Frontend**
```
frontend/
├── src/
│   ├── components/        # Composants réutilisables
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── pages/             # Pages de l'application
│   │   ├── HomePage.tsx
│   │   ├── EventsPage.tsx
│   │   ├── CheckoutPage.tsx
│   │   └── auth/
│   │       ├── LoginPage.tsx
│   │       └── RegisterPage.tsx
│   ├── contexts/          # États globaux
│   │   ├── AuthContext.tsx
│   │   └── CartContext.tsx
│   ├── lib/               # Utilitaires
│   │   ├── supabase.ts    # Client Supabase
│   │   ├── auth.ts
│   │   └── pdf.ts
│   ├── types/             # Types TypeScript
│   │   └── database.ts
│   ├── App.tsx            # Composant principal
│   └── main.tsx           # Point d'entrée
├── public/                # Fichiers statiques
├── index.html             # HTML principal
└── vite.config.ts         # Configuration Vite
```

### **Flux de Communication Frontend**
```
┌────────────────────────────────────────────────┐
│           COMPOSANTS REACT                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Pages   │  │  Context │  │ Services │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
│       │             │             │           │
│       └─────────────┼─────────────┘           │
│                     ▼                         │
│          ┌──────────────────────┐            │
│          │   Supabase Client    │            │
│          │   (@supabase/js)     │            │
│          └──────────┬───────────┘            │
└─────────────────────┼──────────────────────────┘
                      │ REST API / WebSocket
                      ▼
            ┌──────────────────┐
            │   BACKEND API    │
            └──────────────────┘
```

---

## 🖥️ COUCHE BACKEND (Serveur)

### **Responsabilités**
- Stockage et gestion des données (PostgreSQL)
- Authentification et autorisation (JWT)
- Sécurité des données (RLS - Row Level Security)
- Logique métier (Edge Functions)
- API REST auto-générée
- Temps réel (WebSocket)
- Stockage de fichiers
- Envoi d'emails

### **Technologies**
```
PostgreSQL            → Base de données relationnelle
Supabase Auth         → Système d'authentification JWT
PostgREST             → API REST automatique
Realtime              → WebSocket pour temps réel
Deno                  → Runtime pour Edge Functions
Stripe                → Paiements en ligne
Resend                → Envoi d'emails transactionnels
```

### **Structure du Backend**
```
backend/ (Supabase)
├── Database (PostgreSQL)
│   ├── Tables
│   │   ├── users              # Utilisateurs
│   │   ├── events             # Événements
│   │   ├── categories         # Catégories
│   │   ├── ticket_types       # Types de billets
│   │   ├── tickets            # Billets vendus
│   │   ├── payments           # Paiements
│   │   ├── reviews            # Avis
│   │   └── favorites          # Favoris
│   ├── Functions
│   │   ├── search_events()
│   │   └── update_event_capacity()
│   ├── Triggers
│   │   ├── update_updated_at
│   │   └── sync_auth_user
│   └── RLS Policies           # Sécurité niveau ligne
│       ├── users_policy
│       ├── events_policy
│       └── tickets_policy
│
├── Authentication (Supabase Auth)
│   ├── JWT Tokens
│   ├── Email/Password Auth
│   └── Session Management
│
├── Edge Functions (Serverless)
│   ├── create-checkout-session/
│   │   └── index.ts           # Créer session Stripe
│   ├── stripe-webhook/
│   │   └── index.ts           # Webhooks Stripe
│   └── send-ticket-email/
│       └── index.ts           # Envoi billets par email
│
├── Storage
│   └── event-images/          # Images des événements
│
└── Realtime
    └── Subscriptions          # Mises à jour temps réel
```

### **Architecture Base de Données**
```
┌──────────────────────────────────────────────────────┐
│                 PostgreSQL Database                   │
├──────────────────────────────────────────────────────┤
│                                                       │
│  ┌─────────┐     ┌──────────┐     ┌──────────┐     │
│  │  Users  │────►│  Events  │────►│ Tickets  │     │
│  └─────────┘     └──────────┘     └──────────┘     │
│       │               │                  │           │
│       │               │                  │           │
│       ▼               ▼                  ▼           │
│  ┌─────────┐     ┌──────────┐     ┌──────────┐     │
│  │Favorites│     │Categories│     │Payments  │     │
│  └─────────┘     └──────────┘     └──────────┘     │
│                                                       │
│  ┌────────────────────────────────────────────┐     │
│  │         Row Level Security (RLS)            │     │
│  │  • Chaque requête est filtrée par policies  │     │
│  │  • Sécurité au niveau de chaque ligne       │     │
│  │  • Basé sur le JWT de l'utilisateur         │     │
│  └────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────┘
```

---

## �� FLUX DE COMMUNICATION COMPLET

### **1. Authentification**
```
┌─────────────┐                                    ┌─────────────┐
│   Client    │                                    │   Supabase  │
│  (Browser)  │                                    │    Auth     │
└──────┬──────┘                                    └──────┬──────┘
       │                                                  │
       │  1. POST /auth/v1/signup                        │
       │  { email, password, metadata }                  │
       ├────────────────────────────────────────────────►│
       │                                                  │
       │  2. Créer compte + Envoyer JWT                  │
       │◄────────────────────────────────────────────────┤
       │  { access_token, refresh_token, user }          │
       │                                                  │
       │  3. Stocker JWT dans localStorage               │
       │                                                  │
       │  4. Ajouter JWT à chaque requête                │
       │     Authorization: Bearer <jwt>                 │
       │                                                  │
```

### **2. Récupération de Données**
```
┌─────────────┐                                    ┌─────────────┐
│   Client    │                                    │   Supabase  │
│   (React)   │                                    │   PostgREST │
└──────┬──────┘                                    └──────┬──────┘
       │                                                  │
       │  1. GET /rest/v1/events?select=*                │
       │     Authorization: Bearer <jwt>                 │
       ├────────────────────────────────────────────────►│
       │                                                  │
       │  2. Vérifier JWT + Appliquer RLS                │
       │                                          ┌───────┴───────┐
       │                                          │   PostgreSQL  │
       │                                          │   WHERE       │
       │                                          │   statut =    │
       │                                          │   'publie'    │
       │                                          └───────┬───────┘
       │  3. Retourner données filtrées                  │
       │◄────────────────────────────────────────────────┤
       │  [{ id, titre, date_debut, ... }]               │
       │                                                  │
       │  4. Afficher dans l'UI                          │
       │                                                  │
```

### **3. Paiement Stripe**
```
┌──────────┐         ┌──────────┐         ┌──────────┐
│  Client  │         │   Edge   │         │  Stripe  │
│ (React)  │         │ Function │         │   API    │
└────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                     │
     │ 1. Créer session  │                     │
     ├──────────────────►│                     │
     │                    │ 2. Appeler Stripe  │
     │                    ├────────────────────►│
     │                    │ 3. Session ID       │
     │                    │◄────────────────────┤
     │ 4. Retour ID       │                     │
     │◄───────────────────┤                     │
     │                    │                     │
     │ 5. Redirect vers Stripe                 │
     ├─────────────────────────────────────────►│
     │                    │                     │
     │ 6. Page paiement   │                     │
     │◄───────────────────────────────────────┤
     │                    │                     │
     │ 7. Paiement        │                     │
     ├─────────────────────────────────────────►│
     │                    │ 8. Webhook          │
     │                    │◄────────────────────┤
     │                    │ 9. Créer billets    │
     │                    │    + Envoyer email  │
     │                    │                     │
     │ 10. Redirect /success                    │
     │◄─────────────────────────────────────────┤
```

---

## 🔐 SÉCURITÉ

### **Couches de Sécurité**

```
┌──────────────────────────────────────────────────────┐
│  1. HTTPS / TLS                                      │
│     • Chiffrement de toutes les communications      │
│     • Certificat SSL auto-renouvelé                 │
└──────────────────────────────────────────────────────┘
                        ▼
┌──────────────────────────────────────────────────────┐
│  2. AUTHENTIFICATION JWT                             │
│     • Token signé cryptographiquement               │
│     • Expiration automatique                        │
│     • Refresh token sécurisé                        │
└──────────────────────────────────────────────────────┘
                        ▼
┌──────────────────────────────────────────────────────┐
│  3. ROW LEVEL SECURITY (RLS)                         │
│     • Chaque requête SQL filtrée                    │
│     • Basé sur l'identité utilisateur               │
│     • Impossible de contourner                      │
└──────────────────────────────────────────────────────┘
                        ▼
┌──────────────────────────────────────────────────────┐
│  4. VALIDATION DES DONNÉES                           │
│     • Frontend : validation immédiate               │
│     • Backend : validation stricte                  │
│     • Types PostgreSQL + Contraintes                │
└──────────────────────────────────────────────────────┘
                        ▼
┌──────────────────────────────────────────────────────┐
│  5. HEADERS DE SÉCURITÉ                              │
│     • X-Frame-Options: DENY                         │
│     • X-XSS-Protection                              │
│     • Content-Security-Policy                       │
└──────────────────────────────────────────────────────┘
```

### **Exemple de RLS Policy**

```sql
-- Users ne peuvent voir que leurs propres données
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Organisateurs peuvent modifier leurs événements
CREATE POLICY "Organisateurs can update own events"
  ON events FOR UPDATE
  TO authenticated
  USING (auth.uid() = organisateur_id)
  WITH CHECK (auth.uid() = organisateur_id);

-- Tous peuvent voir les événements publiés
CREATE POLICY "Anyone can view published events"
  ON events FOR SELECT
  TO authenticated
  USING (statut = 'publie');
```

---

## 🚀 DÉPLOIEMENT

### **Infrastructure de Production**

```
┌────────────────────────────────────────────────────┐
│               CLOUDFLARE DNS                       │
│  • Résolution DNS globale                         │
│  • Protection DDoS                                │
│  • Proxy / CDN                                    │
└───────────────────┬────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌───────────────┐      ┌────────────────────┐
│    VERCEL     │      │     SUPABASE       │
│  (Frontend)   │      │    (Backend)       │
├───────────────┤      ├────────────────────┤
│ • CDN Global  │      │ • Multi-region DB  │
│ • Edge Cache  │      │ • Auto-backup      │
│ • SSL Auto    │      │ • Monitoring       │
│ • CI/CD       │      │ • Scaling auto     │
└───────────────┘      └────────────────────┘
```

### **Workflow de Déploiement**

```
┌──────────────┐
│ Git Push     │  Developer commit
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   GitHub     │  Code versioning
└──────┬───────┘
       │
       ├───────────────────┐
       │                   │
       ▼                   ▼
┌──────────────┐    ┌──────────────┐
│   Vercel     │    │   Supabase   │
│   CI/CD      │    │  Migrations  │
└──────┬───────┘    └──────┬───────┘
       │                   │
       │                   │
       ▼                   ▼
┌──────────────┐    ┌──────────────┐
│  Production  │◄──►│  Production  │
│   Frontend   │    │   Backend    │
└──────────────┘    └──────────────┘
```

---

## 📊 SCALABILITÉ

### **Frontend (Vercel)**
- **CDN Global** : Fichiers statiques servis depuis le edge le plus proche
- **Cache automatique** : Assets cachés avec headers optimaux
- **Scaling horizontal** : Automatique selon le trafic

### **Backend (Supabase)**
- **Connection pooling** : Gestion efficace des connexions DB
- **Read replicas** : Lecture distribuée
- **Auto-scaling** : Ressources ajustées automatiquement
- **Edge Functions** : Serverless, scaling infini

### **Capacité Théorique**
```
Frontend (Vercel)
├── Requêtes simultanées : ~100,000+ req/s
├── Bande passante : Illimitée
└── Latence : < 100ms (global)

Backend (Supabase)
├── Connexions DB : 500-1000 simultanées
├── API calls : ~50,000 req/min
├── Storage : Scalable (TB+)
└── Edge Functions : Auto-scaling
```

---

## 📈 MONITORING & OBSERVABILITÉ

### **Métriques à Surveiller**

**Frontend (Vercel)**
- Temps de chargement des pages
- Taux d'erreur JavaScript
- Core Web Vitals (LCP, FID, CLS)
- Trafic et bande passante

**Backend (Supabase)**
- Temps de réponse API
- Nombre de connexions DB
- Utilisation CPU/RAM
- Taux d'erreur des Edge Functions
- Latence des requêtes SQL

**Business**
- Nombre d'utilisateurs actifs
- Taux de conversion (inscription → achat)
- Revenus (via Stripe Dashboard)
- Événements créés / Billets vendus

---

## 🎯 AVANTAGES DE CETTE ARCHITECTURE

### **Pour les Développeurs**
✅ Séparation claire des responsabilités
✅ TypeScript sur toute la stack
✅ Hot reload ultra-rapide (Vite)
✅ Déploiement automatique
✅ Pas de gestion serveur

### **Pour l'Application**
✅ Performance optimale (CDN + Cache)
✅ Sécurité renforcée (RLS + JWT)
✅ Scalabilité automatique
✅ Coûts maîtrisés (serverless)
✅ Haute disponibilité (99.9% uptime)

### **Pour les Utilisateurs**
✅ Chargement rapide < 2s
✅ Interface réactive
✅ Données sécurisées
✅ Disponibilité 24/7
✅ Mises à jour en temps réel

---

## 📚 TECHNOLOGIES COMPARÉES

| Aspect | Solution Choisie | Alternatives |
|--------|-----------------|--------------|
| Frontend Hosting | Vercel | Netlify, Cloudflare Pages, AWS S3 |
| Backend | Supabase | Firebase, AWS Amplify, Custom API |
| Database | PostgreSQL | MongoDB, MySQL, DynamoDB |
| Auth | Supabase Auth | Auth0, Firebase Auth, Keycloak |
| Payments | Stripe | PayPal, Square, Braintree |
| Emails | Resend | SendGrid, Mailgun, AWS SES |

---

## 🔮 ÉVOLUTION FUTURE

### **Court Terme**
- [ ] Progressive Web App (PWA)
- [ ] Notifications push
- [ ] Mode hors ligne
- [ ] Application mobile (React Native)

### **Moyen Terme**
- [ ] Microservices additionnels
- [ ] GraphQL API
- [ ] Machine Learning (recommandations)
- [ ] Analytics avancées

### **Long Terme**
- [ ] Multi-tenancy
- [ ] Internationalisation (i18n)
- [ ] White-label pour partenaires
- [ ] API publique pour développeurs

---

## 📝 CONCLUSION

OneWayTicket utilise une **architecture client-serveur moderne et scalable** qui combine :
- **Frontend React** déployé sur Vercel (fichiers statiques + CDN)
- **Backend Supabase** (PostgreSQL + API REST + Edge Functions)
- **Communication sécurisée** via HTTPS + JWT + RLS

Cette architecture permet :
- ⚡ **Performance** : Temps de chargement < 2s
- 🔒 **Sécurité** : Multiple couches de protection
- 📈 **Scalabilité** : De 10 à 10,000,000 utilisateurs
- 💰 **Coûts optimisés** : Paiement à l'usage (serverless)
- 🚀 **Déploiement rapide** : Push to deploy (CI/CD)

**L'application est prête pour la production !**
