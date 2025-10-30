# 🚨 ACTIONS DE SÉCURITÉ IMMÉDIATES

## ⚡ À FAIRE MAINTENANT (15 minutes)

### ✅ **Étape 1 : Vérifier .gitignore (FAIT)**

Le fichier `.env` est **déjà dans .gitignore** ligne 23. ✓

---

### 🔴 **Étape 2 : Si vous utilisez Git - Retirer .env**

**Si vous avez initialisé Git et committé .env, exécutez :**

```bash
# 1. Retirer .env du tracking Git (le fichier reste localement)
git rm --cached .env

# 2. Commit la suppression
git commit -m "security: remove .env from version control"

# 3. Push (si vous avez un remote)
git push origin main
```

**Si vous n'avez PAS encore initialisé Git :**
```bash
# Rien à faire, .env ne sera jamais committé grâce au .gitignore ✓
```

---

### 🔑 **Étape 3 : Régénérer les Clés API**

#### **A. Resend (Emails)**

1. Allez sur **https://resend.com/api-keys**
2. Cliquez sur la clé actuelle
3. Cliquez sur **"Delete"** ou **"Regenerate"**
4. Créez une **nouvelle clé API**
5. **Copiez** la nouvelle clé (vous ne pourrez plus la voir après)

#### **B. Stripe (Paiements)**

1. Allez sur **https://dashboard.stripe.com/test/apikeys**
2. Dans la section **"Secret key"** (mode TEST)
3. Cliquez sur **"Reveal test key"**
4. Cliquez sur les 3 points `...` > **"Roll key"** (regénérer)
5. Confirmez la régénération
6. **Copiez** la nouvelle clé `sk_test_...`

---

### 📝 **Étape 4 : Mettre à Jour .env LOCAL**

Éditez votre fichier `.env` **sur votre machine** :

```bash
# 1. SUPABASE (ne change pas)
VITE_SUPABASE_URL=https://rgwweaoitrxgfxpywths.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnd3dlYW9pdHJ4Z2Z4cHl3dGhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NzkyMzYsImV4cCI6MjA3NzI1NTIzNn0.qeEM53XIXuMsoRPdPUocTqJKv62iKuq_Uzb_j4zJyLM

# 2. STRIPE (ne change pas, clé publique)
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_51SMflRPDE9kZux1kLaG0VHYNdTSyADU4smOzAQHvaT1iHWxVaM7cbUW0PXp9agczTHmE10rsZG6xLnq2dqBQHweX00s3NdA9Yo"

# 3. APPLICATION
VITE_APP_URL="http://localhost:5173"
NODE_ENV="development"

# ⚠️ NE PAS METTRE CES CLÉS ICI :
# STRIPE_SECRET_KEY → Va dans Supabase Secrets
# RESEND_API_KEY → Va dans Supabase Secrets
# STRIPE_WEBHOOK_SECRET → Va dans Supabase Secrets
```

**Important :** Supprimez les lignes suivantes de votre `.env` local :
- `STRIPE_SECRET_KEY=...`
- `RESEND_API_KEY=...`
- `STRIPE_WEBHOOK_SECRET=...`

Ces clés doivent être **UNIQUEMENT** dans Supabase Secrets.

---

### 🔐 **Étape 5 : Configurer Supabase Secrets**

Les Edge Functions ont besoin des clés secrètes. Configurez-les dans Supabase :

#### **Via Interface Web (Recommandé)**

1. **Ouvrez** https://supabase.com/dashboard/project/rgwweaoitrxgfxpywths
2. Cliquez sur **⚙️ Settings** (en bas à gauche)
3. Cliquez sur **Edge Functions** dans le menu
4. Scrollez jusqu'à la section **"Secrets"**
5. **Ajoutez 3 secrets** :

```
Secret 1:
  Nom : STRIPE_SECRET_KEY
  Valeur : sk_test_VOTRE_NOUVELLE_CLE_STRIPE

Secret 2:
  Nom : RESEND_API_KEY
  Valeur : re_VOTRE_NOUVELLE_CLE_RESEND

Secret 3:
  Nom : STRIPE_WEBHOOK_SECRET
  Valeur : whsec_VOTRE_SECRET_WEBHOOK
```

6. Cliquez sur **"Add secret"** pour chaque
7. Les secrets sont maintenant disponibles pour toutes vos Edge Functions

---

### ✅ **Étape 6 : Vérifier que Tout Fonctionne**

```bash
# 1. Lancer l'app localement
npm run dev

# 2. Tester les fonctionnalités critiques :
# - Connexion utilisateur ✓
# - Affichage des événements ✓
# - Ajout au panier ✓
# - Page checkout (pas besoin de payer pour tester l'affichage) ✓

# 3. Vérifier la console browser (F12)
# - Pas d'erreurs liées aux variables d'environnement
```

---

## 📋 CHECKLIST FINALE

Cochez chaque étape :

- [ ] `.env` est dans `.gitignore` ✅ (déjà fait)
- [ ] Si Git initialisé : `git rm --cached .env` exécuté
- [ ] Nouvelle clé **RESEND_API_KEY** générée
- [ ] Nouvelle clé **STRIPE_SECRET_KEY** générée
- [ ] Fichier `.env` local mis à jour (sans clés secrètes)
- [ ] 3 secrets configurés dans Supabase Dashboard
- [ ] Application testée localement (`npm run dev`)
- [ ] Aucune erreur dans la console

---

## 🎯 RÉSUMÉ VISUEL

```
┌─────────────────────────────────────────────────┐
│  AVANT (❌ Non sécurisé)                        │
├─────────────────────────────────────────────────┤
│  .env (committé dans Git)                       │
│  ├── VITE_SUPABASE_URL                          │
│  ├── STRIPE_SECRET_KEY  ← ❌ Exposé !           │
│  └── RESEND_API_KEY     ← ❌ Exposé !           │
└─────────────────────────────────────────────────┘

                    ⬇️ MIGRATION

┌─────────────────────────────────────────────────┐
│  APRÈS (✅ Sécurisé)                            │
├─────────────────────────────────────────────────┤
│  .env (local uniquement, ignoré par Git)        │
│  ├── VITE_SUPABASE_URL                          │
│  └── VITE_STRIPE_PUBLISHABLE_KEY                │
│                                                  │
│  Supabase Secrets (Edge Functions)              │
│  ├── STRIPE_SECRET_KEY  ← ✅ Sécurisé           │
│  └── RESEND_API_KEY     ← ✅ Sécurisé           │
└─────────────────────────────────────────────────┘
```

---

## 💡 RÈGLE D'OR

```
🟢 Variables VITE_*
   → Frontend (React)
   → Publiques (visibles dans le navigateur)
   → Stockées dans : .env + Vercel/Netlify

🔴 Variables sans VITE_*
   → Backend (Edge Functions)
   → SECRÈTES (ne doivent JAMAIS être exposées)
   → Stockées dans : Supabase Secrets UNIQUEMENT
```

---

## 🆘 BESOIN D'AIDE ?

Si vous rencontrez des problèmes :

1. **L'application ne démarre pas**
   - Vérifiez que `.env` existe avec `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`
   - Essayez `rm -rf node_modules && npm install && npm run dev`

2. **Les paiements Stripe ne fonctionnent pas**
   - Vérifiez que `STRIPE_SECRET_KEY` est dans Supabase Secrets
   - Testez avec une carte de test : `4242 4242 4242 4242`

3. **Les emails ne sont pas envoyés**
   - Vérifiez que `RESEND_API_KEY` est dans Supabase Secrets
   - Vérifiez que le domaine est vérifié dans Resend

---

## 📞 CONTACTS

- **Documentation Supabase Secrets** : https://supabase.com/docs/guides/functions/secrets
- **Support Stripe** : https://support.stripe.com
- **Support Resend** : support@resend.com

---

**Temps estimé : 10-15 minutes**
**Difficulté : Facile** 🟢

Une fois ces étapes complétées, votre application sera **100% sécurisée** ! 🔒
