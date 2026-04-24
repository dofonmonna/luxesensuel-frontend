# 📊 Configuration Analytics - LuxeSensuel

Ce guide explique comment obtenir tes clés API pour tracker les conversions.

---

## 1. Google Analytics 4 (GRATUIT)

### Étape 1 : Créer une propriété GA4
1. Va sur [analytics.google.com](https://analytics.google.com)
2. Clique **"Démarrer la mesure"** ou **"Créer une propriété"**
3. Nom de la propriété : **LuxeSensuel**
4. Fuseau horaire : **France**
5. Devise : **Euro (EUR)**
6. Clique **Suivant** → Réponds aux questions → **Créer**

### Étape 2 : Récupérer l'ID de mesure
1. Dans le menu latéral, clique sur **Admin** (engrenage en bas)
2. Dans la colonne "Propriété", clique sur **Flux de données** → **Web**
3. Clique sur ton flux
4. Copie l'**ID de mesure** (format : `G-XXXXXXXXXX`)

### Étape 3 : Ajouter à Render
1. Va sur [dashboard.render.com](https://dashboard.render.com)
2. Sélectionne ton service **luxesensuel-frontend**
3. Onglet **Environment**
4. Ajoute :
   ```
   VITE_GA4_ID=G-XXXXXXXXXX
   ```

---

## 2. Meta Pixel (Facebook/Instagram) (GRATUIT)

### Étape 1 : Créer un Pixel
1. Va sur [business.facebook.com/events_manager](https://business.facebook.com/events_manager)
2. Clique sur **"Connecter des sources de données"**
3. Sélectionne **"Web"** → **Nommer** : LuxeSensuel Pixel
4. Clique **Créer**

### Étape 2 : Récupérer l'ID
1. Tu verras ton **Pixel ID** (15 chiffres)
2. Copie ce numéro

### Étape 3 : Ajouter à Render
```
VITE_META_PIXEL_ID=123456789012345
```

### Étape 4 : Vérifier le domaine (IMPORTANT pour iOS 14.5+)
1. Dans Events Manager → Clique sur ton Pixel
2. Onglet **Paramètres**
3. Section **"Vérifier le domaine"**
4. Clique **Ajouter un domaine**
5. Saisis : `luxesensuel.onrender.com`
6. Choisis **Méta-tag Verification**
7. Copie la balise meta
8. Demande-moi de l'ajouter au site

---

## 3. TikTok Pixel (OPTIONNEL)

### Étape 1 : Créer un compte
1. Va sur [ads.tiktok.com](https://ads.tiktok.com)
2. Crée un compte Business
3. Va dans **Assets** → **Events**
4. Clique **"Create Pixel"**

### Étape 2 : Récupérer l'ID
1. Nomme ton pixel : **LuxeSensuel**
2. Sélectionne **TikTok Pixel**
3. Copie l'ID du pixel

### Étape 3 : Ajouter à Render
```
VITE_TIKTOK_PIXEL_ID=XXXXXXXXXX
```

---

## 🎯 Événements trackés automatiquement

| Événement | Quand | Importance |
|-----------|-------|------------|
| **PageView** | Chaque page visitée | Moyenne |
| **ViewContent** | Produit vu | Moyenne |
| **AddToCart** | Ajout au panier | **HAUTE** |
| **InitiateCheckout** | Début du paiement | **HAUTE** |
| **Purchase** | ✅ Achat complété | **CRITIQUE** |

---

## 📱 Où vérifier que ça marche ?

### Google Analytics
- [analytics.google.com](https://analytics.google.com) → Rapports → Temps réel

### Facebook Pixel
- Installe l'extension Chrome **"Meta Pixel Helper"**
- Visite ton site, l'extension devient verte si le pixel est détecté

### Test complet
1. Ouvre ton site en navigation privée
2. Ajoute un produit au panier
3. Regarde dans GA4 Temps réel → Événements

---

## ⚡ Prochaines étapes recommandées

1. ✅ **GA4** → Obligatoire pour comprendre tes clients
2. ✅ **Meta Pixel** → Obligatoire pour les pubs Facebook/Instagram
3. ⏸️ **TikTok** → Seulement si tu fais du marketing TikTok

**Commence par GA4 + Meta Pixel**, c'est suffisant pour 90% des e-commerces.

---

Besoin d'aide ? Demande-moi ! 🚀
