# Sécurité Complète — LuxeDropShopping

## 1. Authentification & Sessions

```typescript
// ✅ Supabase Auth — ne jamais réinventer l'auth
const { data, error } = await supabase.auth.signInWithPassword({ email, password });

// ✅ Vérifier JWT sur CHAQUE route protégée côté backend
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'Token manquant' });
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Token invalide' });
  req.user = user;
  next();
};

// ✅ Refresh token en httpOnly cookie, access token en mémoire
// ❌ JAMAIS stocker access_token en localStorage
// ❌ JAMAIS faire confiance au user_id envoyé par le client
```

**Politique mots de passe** : min 8 chars, uppercase + lowercase + chiffre + symbole.
Rate limiting login : **5 tentatives / 15 min par IP**.
OAuth : Google + Facebook via Supabase Auth (réduire friction inscription).

---

## 2. Row Level Security (Supabase)

```sql
-- Activer RLS sur TOUTES les tables
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;

-- Politique : user voit uniquement ses données
CREATE POLICY "user_sees_own_orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_manages_own_cart" ON cart_items
  FOR ALL USING (auth.uid() = user_id);

-- Admin : accès total via service role (backend seulement)
-- Le service role bypass le RLS — ne JAMAIS exposer côté frontend
```

---

## 3. Injection SQL

```typescript
// ✅ Supabase client = paramètres préparés automatiques
const { data } = await supabase.from('products').select('*').eq('id', productId);

// ❌ JAMAIS interpoler des données utilisateur dans SQL brut
const q = `SELECT * FROM products WHERE id = '${req.params.id}'`; // DANGER

// ✅ Si SQL brut nécessaire (rare), utiliser les paramètres Postgres
const { data } = await supabase.rpc('get_product', { p_id: productId });
```

---

## 4. XSS

```typescript
// React échappe automatiquement les variables JSX ✅
<p>{userInput}</p>

// ❌ dangerouslySetInnerHTML TOUJOURS sanitisé
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(productDesc) }} />

// ✅ Sanitiser les inputs backend aussi
import { escape } from 'validator';
const safeTitle = escape(req.body.title);
```

---

## 5. CSRF & CORS

```typescript
import cors from 'cors';
app.use(cors({
  origin: [
    'https://luxedropshoping.com',
    'https://www.luxedropshoping.com',
    'https://staging.luxedropshoping.com',
  ],
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
// ❌ JAMAIS origin: '*' en production
```

---

## 6. Vérification Signatures Webhooks

```typescript
// PayPal
import { webhooks } from '@paypal/checkout-server-sdk';
const isValid = await webhooks.verifyWebhookSignature(
  { auth_algo, cert_url, transmission_id, transmission_sig, transmission_time, webhook_id },
  JSON.stringify(req.body)
);
if (!isValid) return res.status(403).json({ error: 'Signature invalide' });

// PayDunya
import crypto from 'crypto';
const hash = crypto.createHmac('sha512', process.env.PAYDUNYA_MASTER_KEY!)
  .update(JSON.stringify(req.body)).digest('hex');
if (hash !== req.headers['x-paydunya-signature']) return res.status(403);

// Stripe
import Stripe from 'stripe';
const event = stripe.webhooks.constructEvent(
  req.rawBody, req.headers['stripe-signature']!, process.env.STRIPE_WEBHOOK_SECRET!
);
```

---

## 7. Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redisClient } from './redis';

const make = (max: number, windowMs: number) => rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({ sendCommand: (...args) => redisClient.sendCommand(args) }),
});

app.use('/api/auth/login', make(5, 15 * 60 * 1000));      // 5 / 15min
app.use('/api/auth/register', make(10, 60 * 60 * 1000));   // 10 / heure
app.use('/api/checkout', make(20, 60 * 1000));              // 20 / min
app.use('/api/admin/import', make(5, 60 * 1000));           // 5 / min
```

---

## 8. Headers HTTP (Helmet)

```typescript
import helmet from 'helmet';
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "https://www.paypal.com", "https://js.stripe.com"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "blob:", "https://*.aliexpress.com", "https://*.supabase.co"],
    connectSrc: ["'self'", "https://api.luxedropshoping.com", "https://*.supabase.co"],
    frameSrc: ["https://www.paypal.com", "https://js.stripe.com"],
  },
}));
```

---

## 9. Variables d'environnement

```bash
# === BACKEND (Render) — jamais exposé au frontend ===
SUPABASE_SERVICE_KEY=...        # ⚠️ accès total DB — backend only
PAYPAL_CLIENT_SECRET=...
PAYDUNYA_MASTER_KEY=...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
REDIS_URL=...
JWT_REFRESH_SECRET=...

# === FRONTEND (Netlify) — préfixe VITE_ obligatoire ===
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...   # clé publique anonyme, pas la service key
VITE_PAYPAL_CLIENT_ID=...
VITE_API_URL=https://api.luxedropshoping.com
```

**Jamais committer** : `.env`, `.env.local`, `.env.production`
**Rotation régulière** : changer les secrets tous les 90 jours minimum.

---

## 10. Upload Fichiers

```typescript
import fileType from 'file-type';
import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

app.post('/api/products/image', requireAuth, upload.single('image'), async (req, res) => {
  const buffer = req.file?.buffer;
  if (!buffer) return res.status(400).json({ error: 'Fichier manquant' });

  const type = await fileType.fromBuffer(buffer);
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
  if (!type || !allowed.includes(type.mime)) {
    return res.status(400).json({ error: 'Type de fichier non autorisé' });
  }
  // Upload vers Supabase Storage
  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(`${Date.now()}.${type.ext}`, buffer, { contentType: type.mime });
});
```

---

## 11. Logs & Monitoring Sécurité

```typescript
// ✅ Logger les événements de sécurité
logger.warn('LOGIN_FAILED', { ip: req.ip, email: req.body.email, timestamp: new Date() });
logger.warn('WEBHOOK_SIGNATURE_INVALID', { provider: 'paypal', ip: req.ip });
logger.error('UNAUTHORIZED_ADMIN_ACCESS', { userId: req.user?.id, route: req.path });

// ❌ JAMAIS logger des données sensibles
logger.info({ password: req.body.password });   // ❌
logger.info({ token: req.headers.authorization }); // ❌
logger.info({ cardNumber: payment.card });       // ❌
```

---

## 12. Checklist Audit Sécurité (mensuelle)

- [ ] `npm audit --audit-level=moderate` → 0 vulnérabilité critique
- [ ] `git grep -rn "sk_live\|password=\|SECRET\|PRIVATE"` → aucun résultat dans le code
- [ ] Toutes les nouvelles tables ont RLS activé
- [ ] Headers HTTP vérifiés via securityheaders.com
- [ ] Logs vérifiés pour tentatives d'intrusion inhabituelles
- [ ] Certificats SSL valides (Netlify + Render gèrent automatiquement)
- [ ] Dépendances mises à jour : `npm outdated`
- [ ] Tester le flux d'auth complet : login, refresh, logout
- [ ] Vérifier que `SUPABASE_SERVICE_KEY` n'est pas dans le bundle frontend
