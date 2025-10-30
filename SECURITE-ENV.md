# 🔒 GUIDE DE SÉCURITÉ - Variables d'Environnement

## 🚨 PROBLÈME IDENTIFIÉ

Lors de l'audit, des clés API sensibles ont été détectées dans le fichier `.env`. Voici comment sécuriser votre application.

---

## ⚠️ CE QUI NE VA PAS

### **Risques Actuels**

1. **Clés API Exposées**
   ```bash
   # ❌ PROBLÈME : Ces clés sont visibles
   RESEND_API_KEY="re_iQVM3ro5_43gNqNoX5PpEXbGPpaosfz6P"
   STRIPE_SECRET_KEY="sk_test_51•••••NbL"
   ```

2. **Conséquences Potentielles**
   - ❌ Quelqu'un peut utiliser votre compte Resend pour envoyer des emails
   - ❌ Accès non autorisé à votre compte Stripe
   - ❌ Coûts financiers imprévus
   - ❌ Vol de données clients

---

## ✅ SOLUTION EN 5 ÉTAPES

### **ÉTAPE 1 : Vérifier que .env est dans .gitignore**

✅ **DÉJÀ FAIT !** Le fichier `.gitignore` contient bien `.env` (ligne 23)

```bash
# Vérification
cat .gitignore | grep .env
# Résultat : .env ✓
```

### **ÉTAPE 2 : Retirer .env du Git (si déjà committé)**

Si vous avez déjà committé le fichier `.env` dans Git, suivez ces étapes :

```bash
# 1. Supprimer .env de l'historique Git (mais garder le fichier local)
git rm --cached .env

# 2. Commit la suppression
git commit -m "Remove .env file from git tracking"

# 3. Vérifier que .env n'est plus tracké
git status
# Vous devriez voir ".env" sous "Untracked files"

# 4. Push les changements
git push origin main
```

### **ÉTAPE 3 : Régénérer les Clés API Compromises**

#### **A. Resend (Emails)**

1. Allez sur https://resend.com/api-keys
2. Supprimez l'ancienne clé `re_iQVM3ro5_43gNqNoX5PpEXbGPpaosfz6P`
3. Créez une nouvelle clé API
4. Copiez la nouvelle clé

#### **B. Stripe (Paiements)**

1. Allez sur https://dashboard.stripe.com/apikeys
2. Si en mode TEST :
   - Régénérez la clé secrète de test (sk_test_...)
3. Si en mode LIVE (production) :
   - **URGENT** : Régénérez immédiatement la clé live (sk_live_...)
   - Désactivez l'ancienne clé

### **ÉTAPE 4 : Mettre à Jour Localement**

Modifiez votre fichier `.env` **LOCAL** avec les nouvelles clés :

```bash
# ============================================
# .env (LOCAL UNIQUEMENT - NE PAS COMMITER)
# ============================================

# 1. SUPABASE
VITE_SUPABASE_URL=https://rgwweaoitrxgfxpywths.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnd3dlYW9pdHJ4Z2Z4cHl3dGhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NzkyMzYsImV4cCI6MjA3NzI1NTIzNn0.qeEM53XIXuMsoRPdPUocTqJKv62iKuq_Uzb_j4zJyLM

# 2. STRIPE (Mode TEST)
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_51SMflRPDE9kZux1kLaG0VHYNdTSyADU4smOzAQHvaT1iHWxVaM7cbUW0PXp9agczTHmE10rsZG6xLnq2dqBQHweX00s3NdA9Yo"
STRIPE_SECRET_KEY="sk_test_VOTRE_NOUVELLE_CLE_ICI"

# 3. RESEND (Nouvelle clé générée)
RESEND_API_KEY="re_VOTRE_NOUVELLE_CLE_ICI"

# 4. WEBHOOK STRIPE (si vous avez configuré)
STRIPE_WEBHOOK_SECRET="whsec_VOTRE_SECRET_ICI"

# 5. APPLICATION
VITE_APP_URL="http://localhost:5173"
NODE_ENV="development"
```

### **ÉTAPE 5 : Configurer les Secrets Supabase (Edge Functions)**

Les Edge Functions ont besoin des clés API. Configurez-les **directement dans Supabase** :

#### **Via l'Interface Supabase**

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet `OneWayTicket`
3. Cliquez sur **Settings** (⚙️) dans la barre latérale
4. Cliquez sur **Edge Functions**
5. Descendez à la section **Secrets**
6. Ajoutez ces secrets :

```bash
Nom : STRIPE_SECRET_KEY
Valeur : sk_test_VOTRE_NOUVELLE_CLE

Nom : STRIPE_WEBHOOK_SECRET
Valeur : whsec_VOTRE_SECRET

Nom : RESEND_API_KEY
Valeur : re_VOTRE_NOUVELLE_CLE
```

7. Cliquez sur **Save** pour chaque secret

#### **Via CLI Supabase (Alternative)**

```bash
# Si vous avez Supabase CLI installé
supabase secrets set STRIPE_SECRET_KEY=sk_test_VOTRE_CLE
supabase secrets set RESEND_API_KEY=re_VOTRE_CLE
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_VOTRE_SECRET

# Vérifier que les secrets sont bien configurés
supabase secrets list
```

---

## 🎯 CONFIGURATION PAR ENVIRONNEMENT

### **DÉVELOPPEMENT LOCAL**

```bash
# .env (sur votre machine)
VITE_SUPABASE_URL=https://rgwweaoitrxgfxpywths.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_..."
VITE_APP_URL="http://localhost:5173"
NODE_ENV="development"

# Ces clés NE DOIVENT PAS être dans .env (elles sont dans Supabase)
# STRIPE_SECRET_KEY  → Dans Supabase Secrets
# RESEND_API_KEY     → Dans Supabase Secrets
```

### **PRODUCTION (Vercel/Netlify)**

#### **Sur Vercel**

1. Allez dans votre projet Vercel
2. **Settings** > **Environment Variables**
3. Ajoutez :

```bash
VITE_SUPABASE_URL = https://rgwweaoitrxgfxpywths.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGci...
VITE_STRIPE_PUBLISHABLE_KEY = pk_live_... (clé LIVE en prod !)
VITE_APP_URL = https://onewayticket.com
NODE_ENV = production
```

4. **Important** : Les clés serveur (STRIPE_SECRET_KEY, RESEND_API_KEY) restent dans Supabase Secrets

#### **Sur Netlify**

1. **Site settings** > **Build & deploy** > **Environment**
2. Ajoutez les mêmes variables que Vercel

---

## 🛡️ BONNES PRATIQUES DE SÉCURITÉ

### **✅ À FAIRE**

1. **Fichier .env**
   - ✅ Toujours dans `.gitignore`
   - ✅ Ne jamais le commiter sur Git
   - ✅ Ne jamais le partager par email/Slack
   - ✅ Utiliser `.env.example` comme template

2. **Clés API**
   - ✅ Utiliser des clés différentes pour dev/prod
   - ✅ Régénérer les clés compromises immédiatement
   - ✅ Mode TEST en développement
   - ✅ Mode LIVE uniquement en production

3. **Secrets Backend**
   - ✅ Stocker dans Supabase Secrets (pas dans .env)
   - ✅ Jamais exposer côté client
   - ✅ Rotation régulière des clés

4. **Git**
   - ✅ Double-vérifier avant chaque commit
   - ✅ Utiliser `git status` avant `git add`
   - ✅ Scanner avec `git secrets` (optionnel)

### **❌ À NE JAMAIS FAIRE**

- ❌ Commiter `.env` dans Git
- ❌ Partager des clés API par email/chat
- ❌ Hard-coder des clés dans le code
- ❌ Utiliser des clés LIVE en développement
- ❌ Exposer `SERVICE_ROLE_KEY` côté client
- ❌ Mettre des clés dans les screenshots
- ❌ Logger des clés en console

---

## 🔍 VÉRIFICATION DE SÉCURITÉ

### **Checklist Finale**

```bash
# 1. Vérifier que .env est ignoré
git check-ignore .env
# Doit retourner : .env

# 2. Vérifier que .env n'est pas tracké
git ls-files | grep .env
# Ne doit rien retourner

# 3. Vérifier les secrets Supabase
# Via dashboard : Settings > Edge Functions > Secrets
# Doit montrer : STRIPE_SECRET_KEY, RESEND_API_KEY, STRIPE_WEBHOOK_SECRET

# 4. Tester localement
npm run dev
# L'app doit fonctionner normalement

# 5. Tester les Edge Functions
# Créer une session checkout → doit fonctionner
```

---

## 📊 TABLEAU DES VARIABLES

| Variable | Stockée où ? | Accessible par | Type |
|----------|--------------|----------------|------|
| `VITE_SUPABASE_URL` | .env + Vercel | Frontend | Public |
| `VITE_SUPABASE_ANON_KEY` | .env + Vercel | Frontend | Public (limité par RLS) |
| `VITE_STRIPE_PUBLISHABLE_KEY` | .env + Vercel | Frontend | Public |
| `VITE_APP_URL` | .env + Vercel | Frontend | Public |
| `STRIPE_SECRET_KEY` | Supabase Secrets | Edge Functions | **SECRET** |
| `RESEND_API_KEY` | Supabase Secrets | Edge Functions | **SECRET** |
| `STRIPE_WEBHOOK_SECRET` | Supabase Secrets | Edge Functions | **SECRET** |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase (auto) | Edge Functions | **SECRET** |

### **Règle Simple**

```
📋 Variables VITE_* → Frontend → Dans .env et Vercel/Netlify
🔒 Variables sans VITE_ → Backend → Dans Supabase Secrets UNIQUEMENT
```

---

## 🚨 EN CAS DE FUITE DE CLÉS

### **Procédure d'Urgence**

1. **Immédiatement** (dans les 5 minutes)
   - Désactiver/supprimer la clé compromise
   - Générer une nouvelle clé
   - Mettre à jour tous les environnements

2. **Dans l'heure**
   - Vérifier les logs d'utilisation (Stripe Dashboard, Resend Dashboard)
   - Chercher des activités suspectes
   - Documenter l'incident

3. **Sous 24h**
   - Notifier votre équipe
   - Changer toutes les clés par précaution
   - Mettre à jour la documentation
   - Revoir les procédures de sécurité

### **Contacts d'Urgence**

- **Stripe Support** : https://support.stripe.com
- **Supabase Support** : https://supabase.com/support
- **Resend Support** : support@resend.com

---

## 📚 RESSOURCES

### **Documentation Officielle**

- [Supabase Secrets](https://supabase.com/docs/guides/functions/secrets)
- [Stripe API Keys](https://stripe.com/docs/keys)
- [Resend API Keys](https://resend.com/docs/api-reference/api-keys)
- [Environment Variables Best Practices](https://12factor.net/config)

### **Outils de Sécurité**

```bash
# Scanner les secrets dans Git
npm install -g git-secrets
git secrets --scan

# Vérifier les fichiers sensibles
git-secrets --list

# Alternative : truffleHog
pip install truffleHog
truffleHog --regex --entropy=False .
```

---

## ✅ RÉSUMÉ : ACTIONS À FAIRE MAINTENANT

### **Étapes Immédiates (15 minutes)**

1. [ ] Vérifier que `.env` est dans `.gitignore` ✅ (déjà fait)
2. [ ] Si .env est committé : `git rm --cached .env`
3. [ ] Régénérer `RESEND_API_KEY` sur https://resend.com
4. [ ] Régénérer `STRIPE_SECRET_KEY` sur https://dashboard.stripe.com
5. [ ] Mettre à jour `.env` local avec nouvelles clés
6. [ ] Configurer secrets Supabase (Settings > Edge Functions > Secrets)
7. [ ] Tester l'application localement (`npm run dev`)
8. [ ] Tester un paiement test

### **Vérification Finale**

```bash
# ✅ .env est ignoré par Git
[ -f .env ] && echo "✅ .env existe localement"
git check-ignore .env && echo "✅ .env est ignoré par Git"

# ✅ Secrets Supabase configurés
echo "Vérifier manuellement : https://supabase.com/dashboard"

# ✅ L'app fonctionne
npm run dev
```

---

## 🎯 CONCLUSION

Suivez ces étapes et votre application sera **100% sécurisée** :

1. ✅ `.env` jamais dans Git
2. ✅ Clés API régénérées
3. ✅ Secrets dans Supabase (pas dans .env)
4. ✅ Variables publiques dans Vercel/Netlify
5. ✅ Bonnes pratiques respectées

**Votre application est maintenant sécurisée !** 🔒
