# Guide de Démarrage Rapide - ONEWAYTICKET

Ce guide vous aidera à lancer l'application ONEWAYTICKET en 5 minutes.

## Étape 1 : Configuration Supabase (5 minutes)

### 1.1 Créer le schéma de base de données

1. Ouvrez votre dashboard Supabase : https://app.supabase.com/project/vnijdjjzgruujvagrihu

2. Allez dans **SQL Editor** (icône de code dans le menu latéral)

3. Cliquez sur **New Query**

4. Copiez TOUT le contenu du fichier `supabase-schema.sql`

5. Collez-le dans l'éditeur SQL

6. Cliquez sur **Run** (ou Ctrl+Enter)

7. Attendez que tous les scripts s'exécutent (environ 10 secondes)

Vous devriez voir un message : "Schema ONEWAYTICKET créé avec succès !"

### 1.2 Créer le bucket Storage

1. Dans le menu latéral, cliquez sur **Storage**

2. Cliquez sur **New bucket**

3. Remplissez :
   - **Name** : `event-images`
   - **Public bucket** : ✅ Coché

4. Cliquez sur **Create bucket**

### 1.3 Configurer l'authentification Google (Optionnel)

1. Allez dans **Authentication** > **Providers**

2. Activez **Google**

3. Remplissez avec vos identifiants OAuth Google

## Étape 2 : Configuration Stripe (3 minutes)

### 2.1 Mode Test

Vos clés Stripe sont déjà configurées dans le fichier `.env` en mode test.

### 2.2 Configurer le Webhook (Important pour la production)

1. Allez sur https://dashboard.stripe.com/test/webhooks

2. Cliquez sur **Add endpoint**

3. URL de endpoint : `https://votre-domaine.com/api/payments/webhook`
   - En dev local : utilisez Stripe CLI ou ngrok

4. Sélectionnez les événements :
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`

5. Copiez le **Signing secret** (commence par `whsec_`)

6. Mettez-le dans `.env` :
```env
STRIPE_WEBHOOK_SECRET="whsec_votre_secret"
```

## Étape 3 : Configuration OpenAI (Optionnel)

Si vous voulez utiliser la génération automatique de descriptions :

1. Créez un compte sur https://platform.openai.com

2. Générez une clé API

3. Ajoutez-la dans `.env` :
```env
VITE_OPENAI_API_KEY="sk-votre-clé-openai"
```

## Étape 4 : Lancer l'application (30 secondes)

```bash
# Installer les dépendances (si pas déjà fait)
npm install

# Lancer en mode développement
npm run dev
```

L'application démarre sur **http://localhost:5173**

## Étape 5 : Tester l'application

### Test 1 : Inscription

1. Cliquez sur **Créer un compte**

2. Remplissez le formulaire :
   - Prénom : Jean
   - Nom : Dupont
   - Email : jean.dupont@test.com
   - Mot de passe : Test123456
   - Type : Client

3. Créez le compte

4. Vérifiez que vous êtes connecté (votre prénom apparaît en haut à droite)

### Test 2 : Créer un événement (avec compte Organisateur)

1. Créez un compte **Organisateur**

2. Allez sur la page d'accueil

3. L'interface pour créer des événements devrait être visible

### Test 3 : Consulter les événements

1. Cliquez sur **Événements** dans le menu

2. Les catégories par défaut sont créées automatiquement :
   - Concerts
   - Conférences
   - Spectacles
   - Sports
   - Festivals

## Problèmes Courants

### "Failed to connect to Supabase"

✅ Vérifiez que vos variables d'environnement sont correctes dans `.env`

✅ Vérifiez que le schéma SQL a bien été exécuté

### "Authentication error"

✅ Vérifiez que la table `users` existe dans Supabase

✅ Allez dans **Authentication** > **Policies** et vérifiez que RLS est activé

### "Storage bucket not found"

✅ Créez le bucket `event-images` dans Supabase Storage

✅ Vérifiez qu'il est bien **public**

### Erreurs Stripe en local

Si vous testez les paiements en local :

1. Installez Stripe CLI : https://stripe.com/docs/stripe-cli

2. Connectez-vous :
```bash
stripe login
```

3. Redirigez les webhooks :
```bash
stripe listen --forward-to localhost:5173/api/payments/webhook
```

## Prochaines Étapes

Maintenant que l'application fonctionne :

1. ✅ Créez des événements de test
2. ✅ Testez le processus d'achat complet
3. ✅ Personnalisez les couleurs et le branding
4. ✅ Configurez votre domaine personnalisé
5. ✅ Déployez en production sur Vercel

## Support

Besoin d'aide ? Consultez :
- README.md pour la documentation complète
- Cahier des charges PDF pour les spécifications

---

Bon développement ! 🚀
