# 🚀 GUIDE DE DÉPLOIEMENT - OneWayTicket

Ce guide explique comment déployer votre application en production avec un nom de domaine.

---

## 📋 TABLE DES MATIÈRES

1. [Architecture Client-Serveur](#architecture-client-serveur)
2. [Prérequis](#prérequis)
3. [Configuration du Client (Frontend)](#configuration-du-client-frontend)
4. [Configuration du Serveur (Backend)](#configuration-du-serveur-backend)
5. [Déploiement du Frontend](#déploiement-du-frontend)
6. [Configuration du Nom de Domaine](#configuration-du-nom-de-domaine)
7. [Variables d'Environnement](#variables-denvironnement)
8. [Tests Post-Déploiement](#tests-post-déploiement)

---

## 🏗️ ARCHITECTURE CLIENT-SERVEUR

### **Votre application utilise déjà une architecture client-serveur moderne :**

```
┌─────────────────────────────────────────────────┐
│         CLIENT (Frontend React)                  │
│  • Interface utilisateur                        │
│  • Gestion de l'état (React Context)            │
│  • Appels API vers Supabase                     │
│  • Déployé sur: Vercel/Netlify/Cloudflare       │
└──────────────────┬──────────────────────────────┘
                   │
                   │ HTTPS / REST API
                   │
┌──────────────────▼──────────────────────────────┐
│      SERVEUR (Backend Supabase)                 │
│  • Base de données PostgreSQL                   │
│  • Authentification (Auth JWT)                  │
│  • Row Level Security (RLS)                     │
│  • Edge Functions (Serverless)                  │
│  • Storage & Real-time subscriptions            │
└─────────────────────────────────────────────────┘
```

### **Avantages de cette architecture :**
- ✅ Séparation claire entre client et serveur
- ✅ Scalabilité automatique (serverless)
- ✅ Sécurité renforcée (RLS + JWT)
- ✅ Coûts optimisés (paiement à l'usage)
- ✅ Déploiement simplifié

---

## 📦 PRÉREQUIS

Avant de déployer, assurez-vous d'avoir :

- [x] Un compte Supabase (déjà configuré)
- [ ] Un compte sur une plateforme de déploiement :
  - **Vercel** (recommandé pour React)
  - **Netlify** (alternative)
  - **Cloudflare Pages** (alternative)
- [ ] Un nom de domaine (ex: `onewayticket.com`)
- [ ] Accès au DNS de votre domaine

---

## 🎨 CONFIGURATION DU CLIENT (FRONTEND)

### **1. Préparer le Build de Production**

Le frontend est votre application React qui sera servie sous forme de fichiers statiques (HTML, CSS, JS).

**Fichiers importants :**
- `vite.config.ts` - Configuration Vite
- `.env` - Variables d'environnement (à ne PAS commiter)
- `.env.example` - Template des variables

### **2. Créer les Variables d'Environnement de Production**

Créez un fichier `.env.production` :

```bash
# Frontend - Production
VITE_SUPABASE_URL=https://rgwweaoitrxgfxpywths.supabase.co
VITE_SUPABASE_ANON_KEY=votre_anon_key_ici
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_votre_clé_live_ici
VITE_APP_URL=https://onewayticket.com
NODE_ENV=production
```

### **3. Optimiser pour la Production**

Modifiez `vite.config.ts` si nécessaire :

```typescript
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false, // Désactiver en prod
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
        }
      }
    }
  }
})
```

### **4. Tester le Build Local**

```bash
# Installer les dépendances
npm install

# Créer le build de production
npm run build

# Tester localement le build
npm run preview
```

---

## 🖥️ CONFIGURATION DU SERVEUR (BACKEND)

### **Votre Backend Supabase est DÉJÀ configuré !**

Supabase fournit automatiquement :
- **Base de données PostgreSQL** hébergée
- **API REST** auto-générée
- **API Real-time** pour les mises à jour en temps réel
- **Authentification** complète
- **Edge Functions** pour la logique serveur

### **Configuration Serveur à Vérifier :**

1. **URL du Projet Supabase**
   - URL: `https://rgwweaoitrxgfxpywths.supabase.co`
   - Cette URL est votre "serveur backend"

2. **Clés d'API**
   - `anon key` : Pour les appels depuis le frontend
   - `service_role key` : Pour les opérations admin (JAMAIS exposée)

3. **Edge Functions Déployées**
   - `create-checkout-session` : Gestion des paiements Stripe
   - `stripe-webhook` : Webhooks Stripe
   - `send-ticket-email` : Envoi d'emails

---

## 🚀 DÉPLOIEMENT DU FRONTEND

### **Option 1 : Vercel (Recommandé)**

**Pourquoi Vercel ?**
- Optimisé pour React/Vite
- Déploiement automatique depuis Git
- SSL gratuit
- CDN global
- Domaines personnalisés gratuits

**Étapes :**

1. **Créer un compte sur [Vercel](https://vercel.com)**

2. **Connecter votre repository Git**
   - GitHub / GitLab / Bitbucket

3. **Configurer le projet**
   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Ajouter les variables d'environnement**
   - Allez dans `Settings` > `Environment Variables`
   - Ajoutez toutes les variables `VITE_*` :
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_STRIPE_PUBLISHABLE_KEY`
     - `VITE_APP_URL`

5. **Déployer**
   ```bash
   # Via l'interface Vercel : cliquez sur "Deploy"
   # OU via CLI :
   npm i -g vercel
   vercel login
   vercel --prod
   ```

6. **URL de déploiement**
   - Vercel vous donne une URL : `https://onewayticket.vercel.app`

---

### **Option 2 : Netlify**

1. **Créer un compte sur [Netlify](https://netlify.com)**

2. **Créer un fichier `netlify.toml`**
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200

   [build.environment]
     NODE_VERSION = "18"
   ```

3. **Déployer**
   ```bash
   npm i -g netlify-cli
   netlify login
   netlify deploy --prod
   ```

---

### **Option 3 : Cloudflare Pages**

1. **Créer un compte sur [Cloudflare Pages](https://pages.cloudflare.com)**

2. **Connecter votre repository**

3. **Configuration**
   ```
   Build command: npm run build
   Build output directory: dist
   ```

---

## 🌐 CONFIGURATION DU NOM DE DOMAINE

### **Exemple : onewayticket.com**

### **Étape 1 : Acheter un Nom de Domaine**

Achetez votre domaine chez :
- **Namecheap** (recommandé)
- **OVH**
- **GoDaddy**
- **Cloudflare Registrar**

Prix : ~10-15€/an

---

### **Étape 2 : Configurer le DNS**

#### **A. Avec Vercel**

1. **Ajouter le domaine dans Vercel**
   - Allez dans `Settings` > `Domains`
   - Ajoutez `onewayticket.com` et `www.onewayticket.com`

2. **Configurer les DNS chez votre registrar**

   Ajoutez ces enregistrements DNS :

   ```
   Type   | Nom | Valeur                      | TTL
   -------|-----|-----------------------------|---------
   A      | @   | 76.76.21.21                | 3600
   CNAME  | www | cname.vercel-dns.com       | 3600
   ```

3. **Attendre la propagation** (5-60 minutes)

4. **Vérifier** : `https://onewayticket.com`

---

#### **B. Avec Netlify**

```
Type   | Nom | Valeur                      | TTL
-------|-----|-----------------------------|---------
A      | @   | 75.2.60.5                  | 3600
CNAME  | www | votre-site.netlify.app     | 3600
```

---

#### **C. Avec Cloudflare Pages**

1. **Transférer les nameservers vers Cloudflare**
   ```
   Nameserver 1: ns1.cloudflare.com
   Nameserver 2: ns2.cloudflare.com
   ```

2. **Cloudflare gère automatiquement le DNS**

---

### **Étape 3 : Activer HTTPS (SSL/TLS)**

Toutes les plateformes (Vercel, Netlify, Cloudflare) fournissent **SSL gratuit automatique** via Let's Encrypt.

✅ Votre site sera accessible en `https://` automatiquement.

---

## 🔐 VARIABLES D'ENVIRONNEMENT

### **Frontend (.env.production)**

```bash
# Supabase
VITE_SUPABASE_URL=https://rgwweaoitrxgfxpywths.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...

# Stripe (mode LIVE en production !)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# App
VITE_APP_URL=https://onewayticket.com
NODE_ENV=production
```

### **Backend (Supabase Edge Functions)**

Les Edge Functions ont déjà accès automatiquement à :
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Ajoutez manuellement dans Supabase Dashboard :
- `STRIPE_SECRET_KEY` (clé LIVE)
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`

**Comment ajouter des secrets Supabase :**
1. Allez dans `Project Settings` > `Edge Functions`
2. Section `Secrets`
3. Ajoutez vos variables

---

## 🔄 WORKFLOW DE DÉPLOIEMENT

### **Déploiement Continu (CI/CD)**

```
┌──────────────┐
│  Git Push    │  Developer pousse le code
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   GitHub     │  Code versionné
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    Vercel    │  Build automatique
│   (CI/CD)    │  • npm install
│              │  • npm run build
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Déploiement  │  Mise en ligne automatique
│ Production   │  https://onewayticket.com
└──────────────┘
```

---

## ✅ TESTS POST-DÉPLOIEMENT

### **Checklist de Vérification**

#### **1. Frontend**
- [ ] Site accessible : `https://onewayticket.com`
- [ ] Redirection `www` fonctionne
- [ ] HTTPS actif (cadenas vert)
- [ ] Pages principales chargent correctement :
  - [ ] `/` (Homepage)
  - [ ] `/events` (Liste des événements)
  - [ ] `/auth/login` (Connexion)
  - [ ] `/auth/register` (Inscription)
- [ ] Console browser sans erreurs

#### **2. Backend (Supabase)**
- [ ] Connexion à la base de données fonctionne
- [ ] Authentification fonctionne (login/register)
- [ ] Données s'affichent (événements, catégories)
- [ ] Edge Functions répondent

#### **3. Fonctionnalités Critiques**
- [ ] Inscription d'un utilisateur
- [ ] Connexion d'un utilisateur
- [ ] Affichage des événements
- [ ] Ajout au panier
- [ ] Processus de paiement Stripe (mode test)
- [ ] Envoi d'emails

#### **4. Performance**
- [ ] Temps de chargement < 3s
- [ ] Score Lighthouse > 80
- [ ] Images optimisées

---

## 🎯 RÉSUMÉ DE LA CONFIGURATION

### **Architecture Finale**

```
┌────────────────────────────────────────────────┐
│         UTILISATEURS (Navigateurs)             │
└─────────────────┬──────────────────────────────┘
                  │
                  │ HTTPS
                  ▼
┌────────────────────────────────────────────────┐
│        NOM DE DOMAINE                          │
│     https://onewayticket.com                   │
│     (DNS pointant vers Vercel)                 │
└─────────────────┬──────────────────────────────┘
                  │
                  │ CDN
                  ▼
┌────────────────────────────────────────────────┐
│    FRONTEND (Vercel)                           │
│    • React + Vite                              │
│    • Fichiers statiques (HTML/CSS/JS)          │
│    • SSL automatique                           │
└─────────────────┬──────────────────────────────┘
                  │
                  │ API REST / WebSocket
                  ▼
┌────────────────────────────────────────────────┐
│    BACKEND (Supabase)                          │
│    • PostgreSQL Database                       │
│    • Auth + RLS                                │
│    • Edge Functions                            │
│    • URL: rgwweaoitrxgfxpywths.supabase.co     │
└────────────────────────────────────────────────┘
```

---

## 📝 COMMANDES UTILES

```bash
# Développement local
npm run dev

# Build de production
npm run build

# Prévisualiser le build
npm run preview

# Déployer sur Vercel
vercel --prod

# Déployer sur Netlify
netlify deploy --prod

# Vérifier les erreurs TypeScript
npm run typecheck

# Linter le code
npm run lint
```

---

## 🆘 DÉPANNAGE

### **Erreur : "Failed to fetch"**
- Vérifiez que `VITE_SUPABASE_URL` est correct
- Vérifiez la connexion réseau
- Regardez la console browser (F12)

### **Erreur : "Unauthorized"**
- Vérifiez que `VITE_SUPABASE_ANON_KEY` est correct
- Vérifiez les policies RLS dans Supabase

### **Page blanche après déploiement**
- Vérifiez les variables d'environnement sur Vercel
- Regardez les logs de build
- Vérifiez le fichier `vercel.json` pour les redirections

### **Domaine ne fonctionne pas**
- Attendez 24-48h pour la propagation DNS
- Vérifiez les enregistrements DNS avec : `nslookup onewayticket.com`
- Testez avec : `https://dnschecker.org`

---

## 📚 RESSOURCES

- [Documentation Vercel](https://vercel.com/docs)
- [Documentation Netlify](https://docs.netlify.com)
- [Documentation Supabase](https://supabase.com/docs)
- [Documentation Vite](https://vitejs.dev)
- [Guide DNS](https://www.cloudflare.com/learning/dns/what-is-dns/)

---

## 🎉 FÉLICITATIONS !

Votre application OneWayTicket est maintenant déployée en production avec :
- ✅ Architecture client-serveur moderne
- ✅ Frontend déployé sur Vercel/Netlify
- ✅ Backend hébergé sur Supabase
- ✅ Nom de domaine personnalisé
- ✅ HTTPS/SSL activé
- ✅ Déploiement continu (CI/CD)

**Votre application est prête pour les utilisateurs !** 🚀
