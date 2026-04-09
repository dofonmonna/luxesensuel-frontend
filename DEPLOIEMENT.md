# LuxeSensuel — Guide de Déploiement

## Architecture

```
LuxeSensuel/
├── src/               ← Frontend React/Vite
├── backend/           ← API Node.js/Express
├── .env               ← Variables frontend
└── backend/.env       ← Variables backend
```

---

## 1. Base de données PostgreSQL

### Installer PostgreSQL
Télécharger: https://www.postgresql.org/download/

### Créer la base
```bash
psql -U postgres
CREATE DATABASE luxesensuel;
\q
```

### Initialiser le schéma
```bash
cd backend
npm install
node db/init.js
```

---

## 2. Backend (Node.js)

### Configurer les variables
```bash
cd backend
cp .env.example .env
# Éditer .env avec vos valeurs
```

### Variables critiques à définir:
```
DB_PASSWORD=votre_mot_de_passe_postgres
JWT_SECRET=une_clé_aléatoire_de_64_caractères_minimum
ADMIN_PASSWORD_HASH=hash_bcrypt_de_votre_mot_de_passe
PAYPAL_CLIENT_SECRET=votre_secret_paypal
PAYPAL_WEBHOOK_ID=id_webhook_depuis_dashboard_paypal
```

### Générer le hash du mot de passe admin:
```bash
node -e "require('bcryptjs').hash('VotreMotDePasseAdmin', 12).then(console.log)"
```

### Démarrer en développement:
```bash
npm run dev
# → http://localhost:4000
```

### Démarrer en production:
```bash
npm start
```

---

## 3. Frontend (React/Vite)

### Configurer
```bash
# Éditer .env à la racine
VITE_API_URL=https://votre-backend.com/api
VITE_PAYPAL_CLIENT_ID=votre_client_id_paypal
```

### Développement:
```bash
npm install
npm run dev
# → http://localhost:5173
```

### Build production:
```bash
npm run build
# → dossier dist/
```

---

## 4. PayPal — Configuration

### Obtenir les credentials sandbox:
1. Aller sur https://developer.paypal.com/
2. Dashboard → My Apps & Credentials
3. Créer une app sandbox
4. Copier Client ID + Secret

### Configurer le Webhook:
1. Dans le dashboard PayPal → Webhooks
2. URL: `https://votre-backend.com/api/webhook/paypal`
3. Événements à cocher:
   - `CHECKOUT.ORDER.APPROVED`
   - `PAYMENT.CAPTURE.DENIED`
   - `PAYMENT.CAPTURE.REFUNDED`
4. Copier le Webhook ID dans `PAYPAL_WEBHOOK_ID`

### Passer en production:
```
PAYPAL_ENV=production
PAYPAL_CLIENT_ID=votre_id_production
PAYPAL_CLIENT_SECRET=votre_secret_production
```

---

## 5. Déploiement Netlify (Frontend)

### Via CLI:
```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

### Variables d'environnement Netlify:
- `VITE_API_URL` → URL de votre backend
- `VITE_PAYPAL_CLIENT_ID` → Client ID PayPal

### netlify.toml (déjà présent):
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 6. Déploiement Backend (Railway / Render)

### Railway:
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

### Variables à configurer dans Railway:
Toutes les variables du `backend/.env`

---

## 7. Exemples de requêtes API

### Lister les produits:
```bash
curl http://localhost:4000/api/products
```

### Créer une commande:
```bash
curl -X POST http://localhost:4000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"product_id": "UUID_DU_PRODUIT", "quantity": 1}],
    "customer": {"email": "client@example.com", "first_name": "Sophie", "last_name": "Martin"},
    "shipping": {"address": "12 rue des Lilas", "city": "Paris", "postal": "75001", "country": "France"}
  }'
```

### Login admin:
```bash
curl -X POST http://localhost:4000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password": "VotreMotDePasseAdmin"}'
# → {"token": "eyJ..."}
```

### Dashboard admin (avec JWT):
```bash
curl http://localhost:4000/api/admin/dashboard \
  -H "Authorization: Bearer eyJ..."
```

### Créer l'ordre PayPal:
```bash
curl -X POST http://localhost:4000/api/pay/create \
  -H "Content-Type: application/json" \
  -d '{"order_id": "UUID_COMMANDE"}'
```

---

## 8. Parties critiques — Explications

### Sécurité PayPal
- **Le client ne capture JAMAIS le paiement directement**
- Le frontend appelle `/api/pay/create` → le backend crée l'ordre PayPal
- Après approbation, le frontend appelle `/api/pay/capture` → le backend capture
- Le webhook `/api/webhook/paypal` est la **source de vérité absolue**
- Le stock n'est décrémenté QUE par le webhook (pas par le capture)

### Sécurité Admin
- Le mot de passe admin n'est **jamais stocké en clair**
- Il est hashé avec bcrypt (12 rounds) et stocké dans `.env`
- L'authentification retourne un JWT signé
- Toutes les routes admin vérifient le JWT + le rôle `admin`
- Limite de 10 tentatives de login par 15 minutes (anti-brute force)

### Sécurité Stock
- Lors de la création de commande, le stock est **verrouillé** (FOR UPDATE)
- Si stock insuffisant → erreur 409 Conflict
- Le stock est décrémenté dans une transaction atomique
- Alert automatique si stock ≤ seuil configuré (défaut: 5)
