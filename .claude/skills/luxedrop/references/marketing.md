# Marketing & Croissance — LuxeDropShopping

## Stratégie globale : Owned > Paid

> Priorité aux canaux qu'on possède (SEO, email, communauté) avant les pubs payantes.
> Un canal owned ne peut pas être "éteint" par une plateforme.

---

## 1. Email Marketing (canal #1 ROI)

```typescript
// Provider : Resend (transactionnel) + Mailchimp ou Brevo (campagnes marketing)

// Séquences d'emails automatisées à construire :

const EMAIL_SEQUENCES = {
  // Bienvenue (5 emails sur 7 jours)
  welcome: [
    { delay: 0,    subject: "Bienvenue chez LuxeDropShopping 🎉", content: "intro + top produits" },
    { delay: '1d', subject: "Notre histoire et notre promesse", content: "brand story" },
    { delay: '3d', subject: "Les catégories qui font notre succès", content: "catégories + bestsellers" },
    { delay: '5d', subject: "Comment commander en 3 étapes", content: "tutoriel commande" },
    { delay: '7d', subject: "Code promo de bienvenue -10%", content: "coupon BIENVENUE10" },
  ],

  // Panier abandonné (3 emails)
  abandoned_cart: [
    { delay: '1h',  subject: "Vous avez oublié quelque chose... 🛒", content: "items + photos" },
    { delay: '24h', subject: "Votre panier vous attend encore", content: "items + urgence" },
    { delay: '72h', subject: "Dernière chance + -5% 🎁", content: "coupon RETOUR5" },
  ],

  // Post-achat (fidélisation)
  post_purchase: [
    { delay: '1d',  subject: "Votre commande est en cours de préparation 📦" },
    { delay: '7d',  subject: "Comment se passe votre livraison ?" },
    { delay: '21d', subject: "Donnez votre avis + obtenez 50 points 🌟" },
    { delay: '30d', subject: "Produits qui complètent votre achat" }, // Cross-sell
    { delay: '60d', subject: "On vous a manqué ? -15% pour votre retour" }, // Réactivation
  ],
};
```

---

## 2. Social Media (organique)

```typescript
// Stratégie de contenu par plateforme

const CONTENT_STRATEGY = {
  instagram: {
    frequency: '1 post / jour + 5-7 stories',
    formats: ['Reels (produits en situation)', 'Carousels (lookbooks)', 'Stories (coulisses, polls)'],
    hashtags: '#luxedropshopping #mode #lingerie #beauté #lifestyle',
    best_times: ['8h-9h', '12h-13h', '19h-21h'],
  },
  tiktok: {
    frequency: '1-2 vidéos / jour',
    formats: ['Unboxing produits', 'Try-on hauls', 'Tendances', 'Avant/Après (cosmétiques)'],
    strategy: 'Trendjacking — surfer sur les sons et défis populaires',
  },
  facebook: {
    frequency: '1 post / jour',
    formats: ['Partage des Instagram posts', 'Groupes mode Afrique', 'Facebook Shops'],
    ads: 'Retargeting visiteurs + lookalike audience clients',
  },
  pinterest: {
    frequency: '5-10 épingles / jour (automatisable)',
    strategy: 'SEO Pinterest — descriptions avec mots-clés',
    boards: ['Lingerie', 'Robes', 'Cosmétiques', 'Parfums', 'Bijoux', 'Tenues du jour'],
  },
};
```

---

## 3. Programme d'Affiliation

```typescript
// Modèle : commission 10-15% sur chaque vente générée

// Table affiliates dans Supabase
/*
CREATE TABLE affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  code TEXT UNIQUE NOT NULL,         -- ex: "SARAH15"
  commission_rate DECIMAL(5,2) DEFAULT 10.00, -- 10%
  total_clicks INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  total_earned_usd DECIMAL(10,2) DEFAULT 0,
  payout_threshold_usd DECIMAL(10,2) DEFAULT 50.00, -- Min pour paiement
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES affiliates(id),
  ip_hash TEXT,   -- Hasher l'IP (RGPD)
  referrer TEXT,
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);
*/

// Tracking des clics affiliés
app.get('/ref/:code', async (req, res) => {
  const { code } = req.params;
  const { redirect } = req.query;

  const { data: affiliate } = await supabase
    .from('affiliates').select('id').eq('code', code).single();

  if (affiliate) {
    await supabase.from('affiliate_clicks').insert({
      affiliate_id: affiliate.id,
      ip_hash: crypto.createHash('sha256').update(req.ip).digest('hex'),
      referrer: req.headers.referer,
    });
    // Cookie 30 jours
    res.cookie('affiliate_code', code, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
  }

  res.redirect(redirect as string || '/');
});
```

---

## 4. Programme de Fidélité (Points)

```typescript
// Système de points simple et motivant

const POINTS_CONFIG = {
  earn: {
    purchase: 1,           // 1 point par dollar dépensé
    review: 50,            // Laisser un avis
    signup: 100,           // Inscription
    birthday: 200,         // Anniversaire
    referral: 150,         // Parrainer un ami
    social_share: 20,      // Partager un produit
  },
  redeem: {
    rate: 100,             // 100 points = $1 de réduction
    min_redeem: 500,       // Minimum 500 points pour utiliser
  },
  tiers: {
    bronze:   { min: 0,    discount: 0,    perks: ['Accès ventes flash'] },
    silver:   { min: 500,  discount: 0.05, perks: ['5% de réduction permanente', 'Livraison prioritaire'] },
    gold:     { min: 2000, discount: 0.10, perks: ['10% de réduction', 'Accès exclusif nouveautés'] },
    platinum: { min: 5000, discount: 0.15, perks: ['15% de réduction', 'Conseiller personnel', 'Retours gratuits'] },
  },
};
```

---

## 5. SEA (Publicité Payante) — Phase 2

```
Canaux prioritaires :
1. Meta Ads (Instagram + Facebook) — le meilleur ROI pour la mode
   → Ciblage : femmes 18-45, intérêts mode/beauté
   → Retargeting : visiteurs 3 derniers jours, abandons panier
   → Lookalike : 1-3% similaires aux clients existants

2. TikTok Ads — croissance rapide, CPM plus bas que Meta
   → Spark Ads : booster les organic posts performants

3. Google Shopping — intention d'achat forte
   → Flux produit structuré (Google Merchant Center)
   → Smart Shopping campaigns

Budget recommandé départ : $500/mois
→ 70% Meta, 20% TikTok, 10% Google Shopping
→ Réallouer selon les ROAS après 2 semaines
```

---

## 6. Codes Promo

```typescript
// Table promo_codes
/*
CREATE TABLE promo_codes (
  code TEXT PRIMARY KEY,
  type TEXT,          -- 'percentage' | 'fixed' | 'free_shipping'
  value DECIMAL(10,2),
  min_order_usd DECIMAL(10,2) DEFAULT 0,
  max_uses INTEGER,
  uses_count INTEGER DEFAULT 0,
  user_id UUID,       -- NULL = tous les utilisateurs
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);
*/

// Validation côté backend (jamais côté frontend)
app.post('/api/checkout/validate-promo', requireAuth, async (req, res) => {
  const { code, cartTotal } = req.body;

  const { data: promo } = await supabase.from('promo_codes')
    .select('*').eq('code', code.toUpperCase()).eq('is_active', true).single();

  if (!promo) return res.status(404).json({ error: 'Code invalide' });
  if (promo.expires_at && new Date(promo.expires_at) < new Date())
    return res.status(400).json({ error: 'Code expiré' });
  if (promo.max_uses && promo.uses_count >= promo.max_uses)
    return res.status(400).json({ error: 'Code épuisé' });
  if (cartTotal < promo.min_order_usd)
    return res.status(400).json({ error: `Minimum de commande : $${promo.min_order_usd}` });

  const discount = promo.type === 'percentage'
    ? cartTotal * (promo.value / 100)
    : promo.value;

  res.json({ discount, type: promo.type, code: promo.code });
});
```
