# Configuration LuxeSensuel - Guide d'installation

Ce guide explique comment configurer tous les services nécessaires pour faire fonctionner votre boutique en ligne.

---

## 1. PAIEMENT PAR CARTE - Stripe

### Créer un compte Stripe
1. Allez sur https://stripe.com
2. Créez un compte business gratuit
3. Activez votre compte (vérification d'identité requise pour les vrais paiements)

### Obtenir vos clés API
1. Dans le dashboard Stripe, allez dans **Developers > API keys**
2. Copiez votre **Publishable key** (commence par `pk_test_` ou `pk_live_`)
3. Copiez votre **Secret key** (commence par `sk_test_` ou `sk_live_`)

### Configurer dans le projet
Dans `src/pages/Checkout.tsx`, ligne 15 :
```typescript
const stripePromise = loadStripe('pk_test_VOTRE_CLE_PUBLIQUE');
```

**Important** : Vous avez besoin d'un backend pour créer les PaymentIntent. Options :
- **Option A** : Utiliser Stripe Checkout (redirection vers Stripe)
- **Option B** : Créer un serveur Node.js (voir exemple ci-dessous)

### Backend simple avec Node.js/Express

Créez un fichier `server.js` :
```javascript
const express = require('express');
const stripe = require('stripe')('sk_VOTRE_CLE_SECRETE');
const app = express();

app.use(express.json());

app.post('/api/create-payment-intent', async (req, res) => {
  const { amount } = req.body;
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: 'eur',
    automatic_payment_methods: { enabled: true },
  });
  
  res.json({ clientSecret: paymentIntent.client_secret });
});

app.listen(3001, () => console.log('Server running on port 3001'));
```

---

## 2. PAIEMENT PAYPAL

### Créer un compte PayPal Business
1. Allez sur https://www.paypal.com/business
2. Créez un compte business
3. Validez votre compte

### Obtenir votre Client ID
1. Allez sur https://developer.paypal.com
2. Connectez-vous avec votre compte PayPal
3. Allez dans **Dashboard > My Apps & Credentials**
4. Créez une nouvelle application
5. Copiez le **Client ID**

### Configurer dans le projet
Dans `src/pages/Checkout.tsx`, ligne 335 :
```typescript
clientId: 'VOTRE_PAYPAL_CLIENT_ID',
```

---

## 3. BASE DE DONNÉES - Firebase

### Créer un projet Firebase
1. Allez sur https://console.firebase.google.com
2. Cliquez sur **Créer un projet**
3. Nommez-le "luxesensuel"
4. Désactivez Google Analytics (ou activez-le si vous voulez)

### Créer une base de données Firestore
1. Dans le menu de gauche, cliquez sur **Firestore Database**
2. Cliquez sur **Créer une base de données**
3. Choisissez **Mode production**
4. Sélectionnez la région **europe-west** (pour la France)

### Obtenir la configuration
1. Allez dans **Paramètres du projet > Général**
2. En bas, cliquez sur **</> Ajouter une application Web**
3. Donnez-lui un nom (ex: "luxesensuel-web")
4. Copiez la configuration Firebase

### Configurer dans le projet
Dans `src/lib/firebase.ts`, remplacez la configuration :
```typescript
const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "luxesensuel.firebaseapp.com",
  projectId: "luxesensuel",
  storageBucket: "luxesensuel.appspot.com",
  messagingSenderId: "VOTRE_MESSAGING_SENDER_ID",
  appId: "VOTRE_APP_ID"
};
```

### Règles de sécurité Firestore
Dans **Firestore Database > Règles**, mettez :
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /orders/{order} {
      allow read, write: if true; // En production, utilisez l'authentification
    }
  }
}
```

---

## 4. EMAILS - EmailJS

### Créer un compte EmailJS
1. Allez sur https://www.emailjs.com
2. Créez un compte gratuit
3. Vérifiez votre email

### Créer un service email
1. Allez dans **Email Services > Add New Service**
2. Choisissez votre fournisseur (Gmail, Outlook, etc.)
3. Connectez votre compte email
4. Copiez le **Service ID**

### Créer les templates d'emails

#### Template 1 : Confirmation client
1. Allez dans **Email Templates > Create New Template**
2. Nommez-le "order_confirmation_customer"
3. Designez votre email avec ces variables :
   - `{{to_name}}` - Nom du client
   - `{{to_email}}` - Email du client
   - `{{order_id}}` - Numéro de commande
   - `{{order_details}}` - Détails des articles
   - `{{order_total}}` - Total de la commande
   - `{{shipping_address}}` - Adresse de livraison
4. Copiez le **Template ID**

#### Template 2 : Notification admin
1. Créez un autre template nommé "order_notification_admin"
2. Variables similaires
3. Copiez le **Template ID**

### Obtenir votre clé publique
1. Allez dans **Account > General**
2. Copiez votre **Public Key**

### Configurer dans le projet
Dans `src/lib/email.ts` :
```typescript
const EMAILJS_SERVICE_ID = 'VOTRE_SERVICE_ID';
const EMAILJS_TEMPLATE_CUSTOMER = 'VOTRE_TEMPLATE_ID_CLIENT';
const EMAILJS_TEMPLATE_ADMIN = 'VOTRE_TEMPLATE_ID_ADMIN';
const EMAILJS_PUBLIC_KEY = 'VOTRE_PUBLIC_KEY';
```

---

## 5. FOURNISSEUR / DROPSHIPPING

### Options de fournisseurs

#### Option A : AliExpress Dropshipping
- **Avantage** : Large choix de produits, prix bas
- **Inconvénient** : Délais de livraison longs (2-4 semaines)
- **API** : Utilisez des outils comme DSers ou Oberlo

#### Option B : Fournisseur européen (recommandé)
- **Exemples** : 
  - SextoyDropshipping (France)
  - Eropartner (Pays-Bas)
  - SextoyDistribution (Allemagne)
- **Avantage** : Livraison rapide (3-7 jours), qualité garantie
- **Contactez-les** pour obtenir un accès API

### Configuration dans l'admin
1. Connectez-vous à `/admin`
2. Allez dans l'onglet **Fournisseur**
3. Renseignez :
   - Nom du fournisseur
   - URL de l'API
   - Clé API

### Fonctionnalités automatiques (à développer)
- Synchronisation des stocks
- Passage automatique des commandes
- Récupération des numéros de tracking

---

## RÉCAPITULATIF DES CLÉS À CONFIGURER

| Service | Fichier | Variable | Où trouver |
|---------|---------|----------|------------|
| Stripe | `src/pages/Checkout.tsx` | `pk_test_...` | Dashboard Stripe > API Keys |
| PayPal | `src/pages/Checkout.tsx` | Client ID | Developer PayPal > Apps |
| Firebase | `src/lib/firebase.ts` | `apiKey`, etc. | Firebase Console > Settings |
| EmailJS | `src/lib/email.ts` | Service ID, Template ID | EmailJS Dashboard |

---

## TESTER VOTRE CONFIGURATION

### Mode test
1. Utilisez les **clés de test** de Stripe et PayPal
2. Pour Stripe, utilisez la carte de test : `4242 4242 4242 4242`
3. Pour PayPal, utilisez le sandbox

### Passer en production
1. Remplacez les clés de test par les clés de production
2. Testez une commande réelle avec un petit montant
3. Vérifiez que tout fonctionne correctement

---

## SUPPORT ET AIDE

- **Stripe** : https://stripe.com/docs
- **PayPal** : https://developer.paypal.com/docs/
- **Firebase** : https://firebase.google.com/docs
- **EmailJS** : https://www.emailjs.com/docs/

---

## SÉCURITÉ IMPORTANTE

⚠️ **Ne jamais commiter vos clés secrètes dans Git !**

Pour une vraie production, utilisez des variables d'environnement :
1. Créez un fichier `.env` à la racine
2. Ajoutez vos clés :
```
VITE_STRIPE_PUBLIC_KEY=pk_test_...
VITE_PAYPAL_CLIENT_ID=...
VITE_FIREBASE_API_KEY=...
```
3. Utilisez `import.meta.env.VITE_STRIPE_PUBLIC_KEY` dans le code
