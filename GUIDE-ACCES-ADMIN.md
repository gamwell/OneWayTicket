# 🔐 GUIDE D'ACCÈS ADMINISTRATEUR - OneWayTicket

## ⚠️ SITUATION ACTUELLE

### **Problème Identifié**

Vous avez **2 comptes administrateurs dans la base de données** (`public.users`), mais **aucun compte correspondant dans le système d'authentification** (`auth.users`).

```sql
Comptes admin dans public.users :
✓ admin1@example.com (ID: 6a404eaf-e344-4fc0-a0e3-8406590de294)
✓ admin2@example.com (ID: b89857d2-d600-445e-acde-593ec1bfbd03)

Comptes dans auth.users :
✗ Aucun compte admin trouvé
```

**Conséquence** : Impossible de se connecter en tant qu'administrateur car il n'y a pas de compte d'authentification.

---

## ✅ SOLUTIONS

### **Solution 1 : Créer un Compte Admin via l'Interface (RECOMMANDÉ)**

C'est la méthode la plus sûre et la plus simple.

#### **Étapes :**

1. **Créer un compte normal via l'interface de l'application**
   - Allez sur `/register`
   - Créez un compte avec votre email
   - Vérifiez votre email (si la confirmation est activée)
   - Connectez-vous

2. **Promouvoir ce compte en administrateur via SQL**

   Une fois connecté, récupérez votre ID utilisateur et exécutez :

   ```sql
   -- Vérifier votre ID utilisateur
   SELECT id, email, role FROM users WHERE email = 'votre-email@example.com';

   -- Promouvoir en administrateur
   UPDATE users
   SET role = 'admin'
   WHERE email = 'votre-email@example.com';
   ```

3. **Déconnectez-vous et reconnectez-vous**
   - Les permissions admin seront actives

**Avantages :**
- ✅ Sécurisé
- ✅ Suit le flux normal d'authentification
- ✅ Trigger de synchronisation fonctionne correctement
- ✅ Mot de passe crypté dans auth.users

---

### **Solution 2 : Créer Directement dans Supabase Dashboard**

Si vous avez accès au dashboard Supabase :

#### **Étapes :**

1. **Aller dans Supabase Dashboard**
   - Ouvrez votre projet Supabase
   - Allez dans `Authentication` > `Users`

2. **Créer un nouveau utilisateur**
   ```
   Email: admin@onewayticket.fr
   Password: [choisissez un mot de passe fort]
   Auto Confirm User: Oui (coché)
   ```

3. **Le trigger créera automatiquement l'entrée dans `public.users`**
   - Rôle par défaut : `client`

4. **Promouvoir en administrateur**
   - Allez dans `SQL Editor`
   - Exécutez :
   ```sql
   UPDATE users
   SET role = 'admin'
   WHERE email = 'admin@onewayticket.fr';
   ```

5. **Se connecter**
   - Email : `admin@onewayticket.fr`
   - Mot de passe : celui que vous avez défini

**Avantages :**
- ✅ Rapide
- ✅ Contrôle total depuis le dashboard
- ✅ Mot de passe crypté

---

### **Solution 3 : Migration SQL pour Créer un Admin (AVANCÉ)**

Si vous voulez automatiser la création via migration :

#### **Créer le fichier de migration :**

```sql
/*
  # Create Admin User

  1. Create admin user in auth.users
  2. Update role to admin in public.users

  Note: Ce script utilise un mot de passe temporaire à changer immédiatement
*/

-- Cette solution nécessite l'extension pgcrypto pour crypter le mot de passe
-- Elle n'est PAS RECOMMANDÉE car elle expose un mot de passe en dur

-- IMPORTANT: Cette approche n'est PAS sécurisée pour la production
-- Utilisez plutôt la Solution 1 ou 2
```

**⚠️ ATTENTION** : Cette méthode n'est **PAS RECOMMANDÉE** car :
- Expose un mot de passe en clair dans le code
- Difficile à implémenter correctement
- Risques de sécurité

---

## 🎯 RECOMMANDATION FINALE

### **MÉTHODE RECOMMANDÉE : Solution 1**

```
┌─────────────────────────────────────────────┐
│  ÉTAPES RECOMMANDÉES                        │
├─────────────────────────────────────────────┤
│                                             │
│  1. Créer un compte via /register           │
│     ↓                                       │
│  2. Se connecter                            │
│     ↓                                       │
│  3. Exécuter SQL pour promouvoir en admin   │
│     ↓                                       │
│  4. Se déconnecter / reconnecter            │
│     ↓                                       │
│  5. Accès admin activé ✅                    │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🔐 PERMISSIONS ADMINISTRATEUR

Une fois votre compte promu en administrateur, vous aurez accès à :

### **Fonctionnalités Admin**

```typescript
// Dans l'application, vérification du rôle :
const { user } = useAuth();

if (user?.role === 'admin') {
  // Accès aux fonctionnalités admin :
  // - Gérer tous les événements
  // - Supprimer n'importe quel événement
  // - Voir les statistiques globales
  // - Modérer les avis
  // - Gérer les utilisateurs
}
```

### **Politiques RLS pour Admin**

```sql
-- Les admins peuvent tout voir et tout faire
CREATE POLICY "Admins can do everything"
  ON [table]
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
```

---

## 📋 COMMANDES SQL UTILES

### **Vérifier les utilisateurs admin**

```sql
SELECT id, email, role, created_at
FROM users
WHERE role = 'admin';
```

### **Promouvoir un utilisateur en admin**

```sql
UPDATE users
SET role = 'admin'
WHERE email = 'email@example.com';
```

### **Rétrograder un admin en client**

```sql
UPDATE users
SET role = 'client'
WHERE email = 'email@example.com';
```

### **Voir tous les utilisateurs avec leurs rôles**

```sql
SELECT
  u.email,
  u.role,
  u.created_at,
  au.last_sign_in_at
FROM users u
LEFT JOIN auth.users au ON u.id = au.id
ORDER BY u.created_at DESC;
```

---

## 🔒 SÉCURITÉ

### **Bonnes Pratiques**

1. **Mot de passe fort**
   - Minimum 12 caractères
   - Majuscules, minuscules, chiffres, symboles
   - Unique pour cette application

2. **Email sécurisé**
   - Utilisez un email professionnel
   - Activez l'authentification à 2 facteurs sur votre email

3. **Limiter les comptes admin**
   - Créez uniquement les comptes admin nécessaires
   - Évitez les comptes admin partagés

4. **Audit des actions admin**
   - Toutes les actions admin sont loggées
   - Possibilité d'ajouter une table `admin_logs`

### **Rotation des Comptes**

```sql
-- Désactiver un compte admin compromis
UPDATE users
SET role = 'client'
WHERE email = 'compromised-admin@example.com';

-- Vérifier qu'il n'y a pas trop d'admins
SELECT COUNT(*) as total_admins
FROM users
WHERE role = 'admin';
-- Devrait être < 5 en général
```

---

## 🚨 DÉPANNAGE

### **Problème : Je ne vois pas les fonctionnalités admin après promotion**

**Solution :**
1. Déconnectez-vous complètement
2. Reconnectez-vous
3. Le token JWT sera régénéré avec le nouveau rôle

### **Problème : L'update SQL ne fonctionne pas**

**Vérification :**
```sql
-- Vérifier que le compte existe bien
SELECT id, email, role FROM users WHERE email = 'votre-email';

-- Vérifier que le trigger de sync fonctionne
SELECT * FROM auth.users WHERE email = 'votre-email';
```

### **Problème : Je n'ai pas accès au dashboard Supabase**

**Solution :** Utilisez la Solution 1 (création via l'interface)

---

## 📞 SUPPORT

Si vous rencontrez des problèmes :

1. **Vérifier les logs Supabase**
   - Dashboard > Logs
   - Regarder les erreurs d'authentification

2. **Vérifier la synchronisation**
   ```sql
   -- Vérifier que le trigger fonctionne
   SELECT COUNT(*) FROM auth.users;
   SELECT COUNT(*) FROM users;
   -- Les deux devraient avoir des comptes correspondants
   ```

3. **Reset complet** (dernier recours)
   ```sql
   -- Supprimer tous les utilisateurs (ATTENTION: DESTRUCTIF)
   -- À utiliser uniquement en développement
   DELETE FROM users;
   -- Les comptes auth.users peuvent être supprimés via le dashboard
   ```

---

## ✅ CHECKLIST DE CRÉATION D'UN ADMIN

- [ ] Créer un compte via l'interface ou le dashboard
- [ ] Vérifier que le compte existe dans `auth.users`
- [ ] Vérifier que le compte existe dans `public.users`
- [ ] Exécuter la requête UPDATE pour promouvoir en admin
- [ ] Vérifier le rôle : `SELECT role FROM users WHERE email = '...'`
- [ ] Se déconnecter
- [ ] Se reconnecter
- [ ] Tester l'accès aux fonctionnalités admin
- [ ] Changer le mot de passe si c'était un mot de passe temporaire

---

## 🎯 RÉSUMÉ

**Actuellement** : Aucun compte admin fonctionnel

**Solution rapide (5 minutes)** :
1. S'inscrire sur `/register` avec un email
2. Exécuter : `UPDATE users SET role = 'admin' WHERE email = 'votre-email'`
3. Se reconnecter
4. ✅ Accès admin actif

**Prochaines étapes** :
- Créer des pages d'administration
- Implémenter les fonctionnalités de modération
- Ajouter des logs d'audit
