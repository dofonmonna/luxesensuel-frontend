# Conformité Légale & RGPD — LuxeDropShopping

## Priorité par zone géographique

| Zone | Réglementation clé | Priorité |
|---|---|---|
| Union Européenne | RGPD, DSA, Directive e-commerce | 🔴 Critique |
| Afrique de l'Ouest | UEMOA, lois locales Côte d'Ivoire | 🔴 Critique |
| USA | CCPA (Californie), CAN-SPAM | 🟡 Important |
| Royaume-Uni | UK GDPR | 🟡 Important |
| Canada | LPRPDE / PIPEDA | 🟠 À terme |

---

## 1. RGPD (obligatoire dès le premier client européen)

### Bannière cookies
```typescript
// Utiliser une solution certifiée RGPD : Osano, Cookiebot, ou implémentation custom
// La bannière DOIT :
// - Apparaître avant tout cookie non essentiel
// - Permettre refus aussi facilement qu'acceptation
// - Ne pas utiliser de dark patterns (bouton "Refuser" grisé)

// Catégories de cookies à déclarer :
const COOKIE_CATEGORIES = {
  essential: true,      // Session, auth, panier — toujours actif
  analytics: false,     // PostHog, GA4 — opt-in
  marketing: false,     // Facebook Pixel, TikTok Pixel — opt-in
  preferences: false,   // Langue, devise sauvegardée — opt-in
};
```

### Droits des utilisateurs
```typescript
// Endpoints obligatoires RGPD :

// GET /api/account/data-export — Droit d'accès (export de toutes ses données)
app.get('/api/account/data-export', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const [profile, orders, reviews, wishlist] = await Promise.all([
    supabase.from('user_profiles').select('*').eq('id', userId).single(),
    supabase.from('orders').select('*').eq('user_id', userId),
    supabase.from('reviews').select('*').eq('user_id', userId),
    supabase.from('wishlist').select('*').eq('user_id', userId),
  ]);
  res.json({ profile: profile.data, orders: orders.data, reviews: reviews.data, wishlist: wishlist.data });
});

// DELETE /api/account — Droit à l'effacement (droit à l'oubli)
app.delete('/api/account', requireAuth, async (req, res) => {
  const userId = req.user.id;
  // Anonymiser les commandes (garder pour comptabilité, supprimer données perso)
  await supabase.from('orders').update({
    user_id: null,
    shipping_address: { anonymized: true },
  }).eq('user_id', userId);
  // Supprimer les données personnelles
  await supabase.from('user_profiles').delete().eq('id', userId);
  await supabase.from('wishlist').delete().eq('user_id', userId);
  await supabase.from('cart_items').delete().eq('user_id', userId);
  await supabase.auth.admin.deleteUser(userId);
  res.json({ message: 'Compte supprimé' });
});

// PUT /api/account/privacy — Gestion des consentements
app.put('/api/account/privacy', requireAuth, async (req, res) => {
  const { analyticsConsent, marketingConsent } = req.body;
  await supabase.from('user_profiles').update({
    analytics_consent: analyticsConsent,
    marketing_consent: marketingConsent,
    consent_updated_at: new Date().toISOString(),
  }).eq('id', req.user.id);
  res.json({ message: 'Préférences mises à jour' });
});
```

### Durée de conservation des données
```
Données compte : jusqu'à suppression du compte ou 3 ans d'inactivité
Commandes : 10 ans (obligation comptable)
Logs techniques : 12 mois
Cookies analytics : 13 mois max
Données marketing : jusqu'au désabonnement
```

---

## 2. Pages légales obligatoires

```typescript
// Routes à créer :
// /fr/mentions-legales
// /fr/politique-de-confidentialite
// /fr/conditions-generales-de-vente
// /fr/politique-de-retour
// /fr/politique-cookies

// Contenu minimum requis pour chaque page :

const LEGAL_PAGES_CONTENT = {
  mentions_legales: [
    'Identité de l\'éditeur (nom, adresse, SIRET/RCCM)',
    'Hébergeur (Netlify Inc., 44 Montgomery St, San Francisco, CA)',
    'Contact : email, téléphone',
    'Directeur de la publication',
  ],
  cgv: [
    'Prix TTC et frais de livraison',
    'Modes de paiement acceptés',
    'Délais de livraison estimés par zone',
    'Politique de retour et remboursement (14 jours UE — droit de rétractation)',
    'Garanties légales (défaut de conformité)',
    'Règlement des litiges (médiation)',
    'Loi applicable et tribunal compétent',
  ],
  politique_retour: [
    'Fenêtre de retour : 30 jours (aller au-delà des 14 jours légaux UE pour être compétitif)',
    'Conditions : produit non utilisé, emballage d\'origine',
    'Processus : formulaire en ligne → validation → remboursement sous 7 jours ouvrés',
    'Exceptions : produits intimes (hygiène), produits personnalisés',
    'Frais de retour : à la charge du client ou offerts (décision commerciale)',
  ],
};
```

---

## 3. Paiements & Conformité Financière

```typescript
// PCI DSS : NE JAMAIS stocker les données de carte bancaire
// → Déléguer 100% à Stripe / PayPal (ils sont PCI DSS certifiés)
// → LuxeDropShopping ne touche jamais les numéros de carte

// Facturation : émettre une facture pour chaque commande
// Format minimum de la facture :
const INVOICE_FIELDS = [
  'Numéro de facture unique',
  'Date d\'émission',
  'Coordonnées vendeur (LuxeDropShopping)',
  'Coordonnées client',
  'Détail des articles (quantité, prix unitaire HT, TVA)',
  'Total HT, TVA, Total TTC',
  'Mode de paiement',
  'Numéro de commande',
];

// TVA : selon les seuils par pays (UE : OSS depuis 2021, seuil 10k€)
// En dessous de 10k€ de ventes UE/an → TVA du pays vendeur
// Au-dessus → s'enregistrer à l'OSS (One Stop Shop)
```

---

## 4. Mentions obligatoires sur le site

```html
<!-- Footer — toujours visible -->
<footer>
  <!-- Liens légaux -->
  <a href="/fr/mentions-legales">Mentions légales</a>
  <a href="/fr/politique-de-confidentialite">Confidentialité</a>
  <a href="/fr/conditions-generales-de-vente">CGV</a>
  <a href="/fr/politique-de-retour">Retours</a>
  <a href="/fr/cookies">Cookies</a>

  <!-- Paiements sécurisés (renforcer la confiance) -->
  <div class="payment-icons">
    <!-- Logos PayPal, Visa, Mastercard, Orange Money, Wave -->
  </div>

  <!-- Mentions légales courtes -->
  <p>© 2024 LuxeDropShopping. Tous droits réservés.</p>
  <p>LuxeDropShopping est une marque déposée. Siège : Abidjan, Côte d'Ivoire.</p>
</footer>
```

---

## 5. Conformité Produits

```typescript
// Produits adultes / lingerie :
// - Vérification âge obligatoire (18+) sur la page d'accueil ou à l'inscription
// - Mentions claires sur les fiches produit pour les produits adultes
// - Respect des restrictions de vente par pays

// Produits cosmétiques :
// - Liste des ingrédients (INCI) si vente vers UE
// - Certifications selon les marchés (CE, FDA, NAFDAC Nigeria, etc.)

// Vérification âge (implémentation simple)
const AgeGateModal = () => {
  const [confirmed, setConfirmed] = useState(false);

  if (confirmed || sessionStorage.getItem('age_verified')) return null;

  return (
    <div className="age-gate-overlay">
      <h2>Êtes-vous majeur(e) ?</h2>
      <p>Ce site contient des produits réservés aux adultes (18+)</p>
      <button onClick={() => {
        sessionStorage.setItem('age_verified', 'true');
        setConfirmed(true);
      }}>J'ai 18 ans ou plus</button>
      <a href="https://google.com">Quitter</a>
    </div>
  );
};
```

---

## 6. Checklist Conformité Légale

- [ ] Mentions légales complètes publiées
- [ ] CGV complètes avec politique de retour 30 jours
- [ ] Politique de confidentialité conforme RGPD
- [ ] Bannière cookies avec vraie option de refus
- [ ] Endpoint export de données (/api/account/data-export)
- [ ] Endpoint suppression de compte (/api/account DELETE)
- [ ] Aucune donnée carte bancaire stockée (délégué à Stripe/PayPal)
- [ ] Factures générées automatiquement pour chaque commande
- [ ] Vérification d'âge pour produits adultes
- [ ] SSL/HTTPS sur tous les domaines (Netlify + Render gèrent)
- [ ] Email de contact visible (contact@luxedropshoping.com)
