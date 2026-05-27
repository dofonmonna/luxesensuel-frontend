# Architecture & Scalabilité — LuxeDropShopping

## Vision Architecture (3 phases)

```
Phase 1 (Actuel — 0→10k commandes/mois)
  Netlify → React App
  Render  → Express Monolith (Node.js)
  Supabase → PostgreSQL + Auth + Storage

Phase 2 (Croissance — 10k→100k commandes/mois)
  Netlify → React App (+ Edge Functions)
  Railway/Fly.io → Express API (auto-scaling)
  Supabase → PostgreSQL (connection pooling via pgBouncer)
  Upstash  → Redis (cache + queue)
  Cloudflare → CDN + WAF (protection DDoS)

Phase 3 (Scale — 100k+ commandes/mois)
  Same frontend
  Microservices backend :
    - service-catalog    (produits, catégories, recherche)
    - service-orders     (commandes, paiements, fulfillment)
    - service-users      (auth, profils, adresses)
    - service-suppliers  (AliExpress, EPROLO, sync inventaire)
    - service-notifs     (emails, SMS, push)
  PostgreSQL → read replicas
  Elasticsearch → recherche produits avancée
  Kubernetes ou Fly.io → orchestration
```

---

## Interface Fournisseur (abstraction obligatoire)

```typescript
// Toujours abstraire les fournisseurs — jamais d'appel direct AliExpress dans les routes
interface ISupplierService {
  searchProducts(query: string, category: string, page: number): Promise<SupplierProduct[]>;
  getProductDetail(productId: string): Promise<SupplierProduct>;
  placeOrder(items: OrderItem[], shippingAddress: Address): Promise<SupplierOrder>;
  trackOrder(orderId: string): Promise<TrackingInfo>;
}

class AliExpressService implements ISupplierService { ... }
class EPROLOService implements ISupplierService { ... }
class CJDropshippingService implements ISupplierService { ... }

// Le SupplierFactory choisit le bon fournisseur
class SupplierFactory {
  static create(supplier: 'aliexpress' | 'eprolo' | 'cj'): ISupplierService {
    switch (supplier) {
      case 'aliexpress': return new AliExpressService();
      case 'eprolo': return new EPROLOService();
      case 'cj': return new CJDropshippingService();
    }
  }
}
```

---

## Schéma Base de Données Principal

```sql
-- Utilisateurs (géré par Supabase Auth + extension)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  phone TEXT,
  default_address_id UUID,
  preferred_currency TEXT DEFAULT 'USD',
  preferred_language TEXT DEFAULT 'fr',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Produits
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier TEXT NOT NULL, -- 'aliexpress' | 'eprolo' | 'cj'
  supplier_product_id TEXT NOT NULL,
  title JSONB NOT NULL,  -- { "fr": "...", "en": "...", "es": "..." }
  description JSONB,
  price_usd DECIMAL(10,2) NOT NULL,
  compare_price_usd DECIMAL(10,2),
  category TEXT NOT NULL,
  tags TEXT[],
  images TEXT[],
  variants JSONB,
  stock_status TEXT DEFAULT 'in_stock',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(supplier, supplier_product_id)
);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_supplier ON products(supplier);

-- Commandes
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending', -- pending|paid|processing|shipped|delivered|cancelled
  items JSONB NOT NULL,
  shipping_address JSONB NOT NULL,
  subtotal_usd DECIMAL(10,2),
  shipping_cost_usd DECIMAL(10,2),
  total_usd DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  total_local DECIMAL(10,2), -- montant dans devise client
  payment_method TEXT,       -- 'paypal'|'paydunya'|'stripe'
  payment_id TEXT,
  supplier_order_id TEXT,
  tracking_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

-- Panier (persistant)
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  product_id UUID REFERENCES products(id),
  variant_id TEXT,
  quantity INTEGER DEFAULT 1,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id, variant_id)
);

-- Wishlist
CREATE TABLE wishlist (
  user_id UUID REFERENCES auth.users(id),
  product_id UUID REFERENCES products(id),
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, product_id)
);

-- Avis produits
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  user_id UUID REFERENCES auth.users(id),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Jobs Asynchrones (BullMQ)

```typescript
// Queues définies
const queues = {
  productImport: new Queue('product-import'),  // Import AliExpress/EPROLO
  emailSend: new Queue('email-send'),           // Emails transactionnels
  orderFulfill: new Queue('order-fulfill'),     // Transmission commande fournisseur
  inventorySync: new Queue('inventory-sync'),   // Sync stock fournisseurs (cron)
  imageOptimize: new Queue('image-optimize'),   // Compression + WebP conversion
  pushNotif: new Queue('push-notification'),    // Notifications push mobile
};

// Worker exemple — import produits
const importWorker = new Worker('product-import', async (job) => {
  const { keyword, category, supplierId } = job.data;
  const supplier = SupplierFactory.create(supplierId);
  const products = await supplier.searchProducts(keyword, category, 1);
  // Bulk upsert dans Supabase
  await supabase.from('products').upsert(products.map(normalize));
  return { imported: products.length };
});
```

---

## Gestion des Erreurs

```typescript
// Middleware global d'erreur Express
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  const status = err instanceof AppError ? err.statusCode : 500;
  const isDev = process.env.NODE_ENV === 'development';

  logger.error({ message: err.message, stack: isDev ? err.stack : undefined, path: req.path });

  res.status(status).json({
    error: isDev ? err.message : 'Une erreur est survenue',
    code: err instanceof AppError ? err.code : 'INTERNAL_ERROR',
  });
};

// Classe d'erreur métier
class AppError extends Error {
  constructor(public message: string, public statusCode: number, public code: string) {
    super(message);
  }
}
```
