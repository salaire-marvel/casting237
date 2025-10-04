# Supabase Edge Functions - Guide de déploiement

## 📧 Configuration de l'envoi d'emails avec Resend

### Étape 1 : Créer un compte Resend (GRATUIT)

1. Allez sur **https://resend.com**
2. Créez un compte gratuit (100 emails/jour inclus)
3. Vérifiez votre email

### Étape 2 : Obtenir votre clé API Resend

1. Connectez-vous à votre compte Resend
2. Allez dans **API Keys** (dans le menu)
3. Cliquez sur **Create API Key**
4. Nommez-la "Casting App" et créez-la
5. **COPIEZ LA CLÉ** (elle commence par `re_...`)

### Étape 3 : Installer Supabase CLI

```bash
# Installer Supabase CLI
npm install -g supabase
```

### Étape 4 : Se connecter à votre projet Supabase

```bash
# Se connecter à Supabase
supabase login

# Lier votre projet local au projet Supabase
supabase link --project-ref rzfrsuhgjpvmwmbmqkro
```

### Étape 5 : Configurer la clé API Resend

```bash
# Ajouter la clé API Resend comme secret
supabase secrets set RESEND_API_KEY=re_votre_cle_api_ici
```

### Étape 6 : Déployer la fonction

```bash
# Déployer la fonction send-confirmation-email
supabase functions deploy send-confirmation-email
```

### Étape 7 : Tester localement (optionnel)

```bash
# Démarrer les fonctions localement
supabase functions serve send-confirmation-email --env-file .env

# Dans un autre terminal, tester avec curl :
curl -i --location --request POST 'http://localhost:54321/functions/v1/send-confirmation-email' \
  --header 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"name":"Test User","email":"test@example.com","phone":"0123456789","timeslot":"10:00 - 10:30","castingDate":"2025-10-05","castingTitle":"Test Casting"}'
```

## ✅ Vérification

Une fois déployé :
1. Faites une réservation de test sur votre application
2. Vérifiez que l'email de confirmation arrive dans la boîte mail du candidat
3. Si l'email n'arrive pas, vérifiez les logs : `supabase functions logs send-confirmation-email`

## 🔧 Dépannage

**Problème : L'email n'arrive pas**
- Vérifiez que la clé API Resend est correctement configurée
- Vérifiez les logs : `supabase functions logs send-confirmation-email`
- Vérifiez que la fonction est bien déployée : `supabase functions list`

**Problème : Erreur "Invalid API Key"**
- Vérifiez que vous avez bien configuré le secret : `supabase secrets list`
- Reconfigurez la clé si nécessaire : `supabase secrets set RESEND_API_KEY=re_...`

## 📝 Notes importantes

- **Email par défaut** : Par défaut, les emails sont envoyés depuis `onboarding@resend.dev`. Pour utiliser votre propre domaine, configurez-le dans Resend.
- **Limite gratuite** : 100 emails/jour avec le plan gratuit Resend
- **Non-bloquant** : L'envoi d'email est non-bloquant. Même si l'email échoue, la réservation est quand même enregistrée.

