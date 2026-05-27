# Logistique & Gestion Commandes — LuxeDropShopping

## Cycle de vie d'une commande

```
Client paie
    ↓
[pending] → Paiement en cours
    ↓
[paid] → Paiement confirmé (webhook PayPal/PayDunya/Stripe)
    ↓
[processing] → Commande transmise au fournisseur (AliExpress/EPROLO)
    ↓
[shipped] → Fournisseur a expédié (numéro de tracking reçu)
    ↓
[in_transit] → En cours de livraison
    ↓
[delivered] → Livré (confirmation client ou signal transporteur)
    ↓
[completed] → 14 jours après livraison, pas de litige

Branches alternatives :
[paid] → [refunded]  : remboursement demandé
[processing] → [supplier_error] : fournisseur ne peut pas honorer
[any] → [disputed] : litige ouvert
[disputed] → [refunded] ou [resolved]
```

---

## 1. Service de Fulfillment

```typescript
// services/OrderFulfillmentService.ts

export class OrderFulfillmentService {

  async processOrder(orderId: string): Promise<void> {
    const order = await this.getOrder(orderId);
    if (order.status !== 'paid') throw new AppError('Commande non payée', 400, 'INVALID_STATUS');

    await this.updateStatus(orderId, 'processing');

    // Grouper les items par fournisseur
    const itemsBySupplier = this.groupBySupplier(order.items);

    for (const [supplier, items] of Object.entries(itemsBySupplier)) {
      try {
        const supplierService = SupplierFactory.create(supplier as any);
        const supplierOrder = await supplierService.placeOrder(items, order.shipping_address);

        await supabase.from('orders').update({
          supplier_order_id: supplierOrder.id,
          status: 'processing',
        }).eq('id', orderId);

        // Email de confirmation au client
        await emailQueue.add('order-processing', {
          to: order.user_email,
          orderId,
          estimatedDelivery: supplierOrder.estimatedDelivery,
        });

      } catch (err) {
        await this.handleFulfillmentError(orderId, err);
      }
    }
  }

  async handleFulfillmentError(orderId: string, error: Error): Promise<void> {
    await this.updateStatus(orderId, 'supplier_error');
    // Alerter l'admin immédiatement
    await emailQueue.add('admin-alert', {
      subject: `⚠️ Erreur fulfillment commande ${orderId}`,
      body: error.message,
    });
    // Rembourser automatiquement si erreur fournisseur
    await this.initiateRefund(orderId, 'supplier_unavailable');
  }

  private groupBySupplier(items: OrderItem[]): Record<string, OrderItem[]> {
    return items.reduce((acc, item) => {
      const key = item.supplier || 'aliexpress';
      acc[key] = [...(acc[key] || []), item];
      return acc;
    }, {} as Record<string, OrderItem[]>);
  }
}
```

---

## 2. Tracking de Livraison

```typescript
// Services de tracking recommandés
// - 17Track API (couvre 2000+ transporteurs mondiaux)
// - AfterShip (alternative, bon dashboard)

// services/TrackingService.ts
export class TrackingService {
  async getTracking(trackingNumber: string, carrier?: string): Promise<TrackingInfo> {
    const response = await fetch('https://api.17track.net/track/v2.2/gettrackinfo', {
      method: 'POST',
      headers: {
        '17token': process.env.SEVENTEEN_TRACK_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{ number: trackingNumber, carrier }]),
    });

    const data = await response.json();
    const track = data.data.accepted[0];

    return {
      status: this.mapStatus(track.track.e),
      lastEvent: track.track.z0?.a,
      lastLocation: track.track.z0?.l,
      estimatedDelivery: track.track.tdt,
      events: track.track.z?.map((e: any) => ({
        date: e.a,
        location: e.l,
        description: e.z,
      })) || [],
    };
  }

  // Cron : vérifier le statut de toutes les commandes 'shipped' toutes les 6h
  async syncAllTrackingStatuses(): Promise<void> {
    const { data: orders } = await supabase
      .from('orders')
      .select('id, tracking_number')
      .eq('status', 'shipped')
      .not('tracking_number', 'is', null);

    for (const order of orders || []) {
      const info = await this.getTracking(order.tracking_number);
      if (info.status === 'delivered') {
        await supabase.from('orders').update({ status: 'delivered' }).eq('id', order.id);
        // Notifier le client
        await emailQueue.add('order-delivered', { orderId: order.id });
      }
    }
  }
}
```

---

## 3. Système de Remboursement

```typescript
// services/RefundService.ts
export class RefundService {

  async initiateRefund(orderId: string, reason: string): Promise<void> {
    const order = await this.getOrder(orderId);

    switch (order.payment_method) {
      case 'paypal':
        await this.refundPayPal(order.payment_id, order.total_usd);
        break;
      case 'stripe':
        await stripe.refunds.create({ payment_intent: order.payment_id });
        break;
      case 'paydunya':
        // PayDunya : rembourser manuellement via dashboard ou API selon plan
        await this.notifyAdminManualRefund(order, reason);
        break;
    }

    await supabase.from('orders').update({
      status: 'refunded',
      refund_reason: reason,
      refunded_at: new Date().toISOString(),
    }).eq('id', orderId);

    await emailQueue.add('refund-confirmed', {
      to: order.user_email,
      orderId,
      amount: order.total_usd,
      currency: order.currency,
    });
  }

  private async refundPayPal(captureId: string, amount: number): Promise<void> {
    const client = getPayPalClient();
    const request = new paypal.payments.CapturesRefundRequest(captureId);
    request.requestBody({
      amount: { value: amount.toFixed(2), currency_code: 'USD' },
    });
    await client.execute(request);
  }
}
```

---

## 4. Gestion des Stocks (Dropshipping)

```typescript
// En dropshipping, le stock est chez le fournisseur — synchronisation régulière

// Cron toutes les 4h : vérifier disponibilité des produits actifs
const inventoryWorker = new Worker('inventory-sync', async (job) => {
  const { data: products } = await supabase
    .from('products')
    .select('id, supplier, supplier_product_id')
    .eq('is_active', true);

  for (const product of products || []) {
    const supplier = SupplierFactory.create(product.supplier);
    const detail = await supplier.getProductDetail(product.supplier_product_id);

    if (!detail.available) {
      await supabase.from('products').update({
        stock_status: 'out_of_stock',
        is_active: false,
      }).eq('id', product.id);
    }

    // Mettre à jour le prix si changé (marge configurée)
    if (Math.abs(detail.price - product.supplier_price) > 0.5) {
      const newPrice = detail.price * (1 + MARKUP_PERCENTAGE);
      await supabase.from('products').update({
        price_usd: newPrice,
        supplier_price: detail.price,
      }).eq('id', product.id);
    }
  }
});

// Politique de markup par catégorie
const MARKUP_BY_CATEGORY: Record<string, number> = {
  lingerie: 2.5,     // 150% de marge
  cosmetics: 3.0,    // 200%
  perfume: 2.8,
  jewelry: 4.0,      // 300% — marges plus élevées
  accessories: 3.5,
};
```

---

## 5. Emails Transactionnels (Resend)

```typescript
// Templates emails à créer (HTML responsive)
const EMAIL_TEMPLATES = {
  ORDER_CONFIRMED: 'order-confirmed',     // Reçu commande + récapitulatif
  ORDER_PROCESSING: 'order-processing',   // Transmis au fournisseur
  ORDER_SHIPPED: 'order-shipped',         // Expédié + lien tracking
  ORDER_DELIVERED: 'order-delivered',     // Livré + demande d'avis
  ORDER_REFUNDED: 'order-refunded',       // Remboursement confirmé
  WELCOME: 'welcome',                     // Bienvenue après inscription
  PASSWORD_RESET: 'password-reset',       // Réinitialisation mot de passe
  CART_ABANDONED: 'cart-abandoned',       // Relance panier abandonné (1h, 24h)
  PRICE_DROP: 'price-drop',              // Baisse de prix produit wishlist
  BACK_IN_STOCK: 'back-in-stock',        // Produit à nouveau disponible
};

// Séquence d'abandon de panier
// +1h  : "Vous avez oublié quelque chose ?" — montrer les produits
// +24h : "Votre panier expire bientôt" + code promo -5%
// +72h : Dernier rappel
```
