# Tests & Qualité — LuxeDropShopping

## Pyramide de tests

```
        /‾‾‾‾‾‾‾‾‾‾‾‾\
       /   E2E (10%)   \       Playwright — flux critiques
      /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
     / Integration (30%) \     Supertest — routes API + DB
    /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
   /   Unit Tests (60%)   \    Vitest — services, utils, hooks
  /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
```

---

## 1. Tests Unitaires (Vitest)

```typescript
// Installation
// npm install -D vitest @testing-library/react @testing-library/user-event jsdom

// vitest.config.ts
export default { test: { environment: 'jsdom', globals: true, setupFiles: ['./src/test/setup.ts'] } };

// utils/currency.test.ts
import { describe, it, expect } from 'vitest';
import { formatPrice } from '../utils/currency';

describe('formatPrice', () => {
  it('formate USD correctement', () => {
    expect(formatPrice(25.5, 'USD')).toBe('$25.50');
  });
  it('formate XOF sans décimales', () => {
    expect(formatPrice(25000, 'XOF')).toBe('FCFA 25,000');
  });
  it('retourne "Prix indisponible" si montant négatif', () => {
    expect(formatPrice(-1, 'USD')).toBe('Prix indisponible');
  });
});

// services/AliExpressImportService.test.ts
import { describe, it, expect, vi } from 'vitest';
import { AliExpressService } from '../services/AliExpressService';

describe('AliExpressService.searchProducts', () => {
  it('inclut toujours category_ids dans la requête', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ products: [] });
    const svc = new AliExpressService(mockFetch);
    await svc.searchProducts('lingerie', 'lingerie', 1);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({ category_ids: expect.any(String) })
    );
  });
});
```

---

## 2. Tests d'Intégration (Supertest)

```typescript
// Installation : npm install -D supertest @types/supertest

// routes/products.test.ts
import request from 'supertest';
import app from '../app';
import { supabase } from '../supabase';

describe('GET /api/products', () => {
  it('retourne 200 avec une liste de produits', async () => {
    const res = await request(app).get('/api/products?category=lingerie');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('retourne 400 si page invalide', async () => {
    const res = await request(app).get('/api/products?page=abc');
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('bloque après 5 tentatives (rate limiting)', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app).post('/api/auth/login').send({ email: 'test@test.com', password: 'wrong' });
    }
    const res = await request(app).post('/api/auth/login').send({ email: 'test@test.com', password: 'wrong' });
    expect(res.status).toBe(429); // Too Many Requests
  });
});
```

---

## 3. Tests E2E (Playwright)

```typescript
// Installation : npm install -D @playwright/test && npx playwright install

// playwright.config.ts
export default {
  baseURL: 'https://staging.luxedropshoping.com',
  testDir: './e2e',
  use: { screenshot: 'only-on-failure', video: 'retain-on-failure' },
};

// e2e/checkout.spec.ts — Le flux le plus critique
import { test, expect } from '@playwright/test';

test('Flux achat complet (ajout panier → paiement)', async ({ page }) => {
  // 1. Page produit
  await page.goto('/fr/products/robe-dentelle-noire');
  await expect(page.locator('h1')).toBeVisible();

  // 2. Ajouter au panier
  await page.click('[data-testid="add-to-cart"]');
  await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1');

  // 3. Aller au panier
  await page.goto('/fr/panier');
  await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);

  // 4. Checkout
  await page.click('[data-testid="checkout-btn"]');
  await page.fill('[data-testid="email"]', 'test@luxedrop.com');
  await page.fill('[data-testid="full-name"]', 'Test User');
  await page.fill('[data-testid="address"]', '123 Rue Test');

  // 5. Vérifier page de confirmation
  await page.click('[data-testid="place-order"]');
  await expect(page).toHaveURL(/\/confirmation/);
  await expect(page.locator('[data-testid="order-number"]')).toBeVisible();
});

test('Recherche produit fonctionne', async ({ page }) => {
  await page.goto('/fr');
  await page.fill('[data-testid="search-input"]', 'parfum');
  await page.press('[data-testid="search-input"]', 'Enter');
  await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible();
});
```

---

## 4. Tests de Composants React

```typescript
// components/ProductCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from './ProductCard';

const mockProduct = {
  id: '1', title: { fr: 'Robe Noire' }, price_usd: 29.99,
  images: ['https://example.com/img.jpg'], slug: 'robe-noire',
};

describe('ProductCard', () => {
  it('affiche le titre et le prix', () => {
    render(<ProductCard product={mockProduct} lang="fr" />);
    expect(screen.getByText('Robe Noire')).toBeInTheDocument();
    expect(screen.getByText(/29/)).toBeInTheDocument();
  });

  it('appelle onAddToCart au clic', () => {
    const handleAdd = vi.fn();
    render(<ProductCard product={mockProduct} lang="fr" onAddToCart={handleAdd} />);
    fireEvent.click(screen.getByTestId('add-to-cart'));
    expect(handleAdd).toHaveBeenCalledWith(mockProduct.id);
  });
});
```

---

## 5. CI/CD — GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: cd backend && npm ci
      - run: cd backend && npm run lint
      - run: cd backend && npm run type-check
      - run: cd backend && npm test
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: cd frontend && npm ci
      - run: cd frontend && npm run lint
      - run: cd frontend && npm run type-check
      - run: cd frontend && npm test -- --run

  e2e:
    runs-on: ubuntu-latest
    needs: [test-backend, test-frontend]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci && npx playwright install --with-deps
      - run: npx playwright test
        env:
          BASE_URL: ${{ secrets.STAGING_URL }}
```

---

## 6. Couverture de code cible

| Domaine | Cible |
|---|---|
| Services métier (AliExpress, EPROLO, Order) | ≥ 80% |
| Utils / helpers | ≥ 90% |
| Routes Express | ≥ 70% |
| Composants React (critiques) | ≥ 60% |
| E2E flux critiques | 100% (checkout, auth, search) |
