# Paiements Mondiaux — LuxeDropShopping

## Couverture géographique par méthode

| Méthode | Zones | Statut |
|---|---|---|
| PayPal | Mondial (200+ pays) | ✅ Live |
| PayDunya | Afrique de l'Ouest (CI, SN, ML, BF, GN, TG, BJ, NE) | ✅ Live |
| Stripe | 46 pays (Europe, Amérique, Asie) | 🔧 À intégrer |
| Orange Money direct | Côte d'Ivoire, Sénégal, Mali | Via PayDunya |
| Wave | Côte d'Ivoire, Sénégal | Via PayDunya |
| MTN MoMo | Ghana, Côte d'Ivoire, Bénin | Via PayDunya |
| M-Pesa (Safaricom) | Kenya, Tanzanie | 🔧 Phase 2 |
| Flutterwave | Nigeria + Afrique | 🔧 Phase 2 |
| Crypto (USDT/BTC) | Mondial | 🔧 Phase 3 |

---

## 1. PayPal (implémentation actuelle)

```typescript
// backend/services/PayPalService.ts
import checkoutNodeJssdk from '@paypal/checkout-server-sdk';

function getPayPalClient() {
  const env = process.env.NODE_ENV === 'production'
    ? new checkoutNodeJssdk.core.LiveEnvironment(
        process.env.PAYPAL_CLIENT_ID!,
        process.env.PAYPAL_CLIENT_SECRET!
      )
    : new checkoutNodeJssdk.core.SandboxEnvironment(
        process.env.PAYPAL_CLIENT_ID_SANDBOX!,
        process.env.PAYPAL_CLIENT_SECRET_SANDBOX!
      );
  return new checkoutNodeJssdk.core.PayPalHttpClient(env);
}

// Créer une commande PayPal
export const createPayPalOrder = async (amount: number, currency = 'USD', orderId: string) => {
  const client = getPayPalClient();
  const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      reference_id: orderId,
      amount: { currency_code: currency, value: amount.toFixed(2) },
    }],
    application_context: {
      return_url: `${process.env.FRONTEND_URL}/fr/checkout/success`,
      cancel_url: `${process.env.FRONTEND_URL}/fr/checkout/cancel`,
      brand_name: 'LuxeDropShopping',
      user_action: 'PAY_NOW',
    },
  });
  const response = await client.execute(request);
  return response.result;
};

// Capturer le paiement
export const capturePayPalOrder = async (paypalOrderId: string) => {
  const client = getPayPalClient();
  const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(paypalOrderId);
  const response = await client.execute(request);
  return response.result;
};

// Webhook PayPal — route : POST /api/paypal/webhook
app.post('/api/paypal/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  // 1. Vérifier la signature (voir security.md)
  const event = JSON.parse(req.body.toString());

  switch (event.event_type) {
    case 'PAYMENT.CAPTURE.COMPLETED':
      const orderId = event.resource.purchase_units[0].reference_id;
      await OrderFulfillmentService.processOrder(orderId);
      break;
    case 'PAYMENT.CAPTURE.DENIED':
      await supabase.from('orders').update({ status: 'payment_failed' })
        .eq('id', event.resource.purchase_units[0].reference_id);
      break;
  }
  res.status(200).json({ received: true });
});
```

---

## 2. PayDunya (Afrique de l'Ouest)

```typescript
// Installation : npm install paydunya
import * as paydunya from 'paydunya';

// Configuration
paydunya.setup({
  masterKey: process.env.PAYDUNYA_MASTER_KEY!,
  privateKey: process.env.PAYDUNYA_PRIVATE_KEY!,
  publicKey: process.env.PAYDUNYA_PUBLIC_KEY!,
  token: process.env.PAYDUNYA_TOKEN!,
  mode: process.env.NODE_ENV === 'production' ? 'live' : 'test',
});

// Créer une facture de paiement
export const createPayDunyaInvoice = async (order: Order) => {
  const invoice = new paydunya.CheckoutInvoice();

  invoice.addItem(order.id, 1, order.total_usd * 655, order.total_usd * 655, 'Commande LuxeDropShopping');
  invoice.totalAmount = order.total_usd * 655; // Conversion USD → XOF (taux fixe FCFA)

  invoice.store.name = 'LuxeDropShopping';
  invoice.store.tagline = 'Mode, Beauté & Lifestyle';
  invoice.store.phoneNumber = process.env.STORE_PHONE!;
  invoice.store.logoURL = 'https://luxedropshoping.com/logo.png';
  invoice.store.websiteURL = 'https://luxedropshoping.com';

  invoice.cancelURL = `${process.env.FRONTEND_URL}/fr/checkout/cancel`;
  invoice.returnURL = `${process.env.FRONTEND_URL}/fr/checkout/success`;
  invoice.callbackURL = `${process.env.API_URL}/api/paydunya/webhook`;

  const success = await invoice.create();
  if (!success) throw new AppError('Erreur création facture PayDunya', 500, 'PAYDUNYA_ERROR');

  return { invoiceToken: invoice.token, paymentUrl: invoice.url };
};

// Webhook PayDunya — POST /api/paydunya/webhook
app.post('/api/paydunya/webhook', async (req, res) => {
  // Vérifier signature HMAC (voir security.md)
  const { data } = req.body;

  if (data.status === 'completed') {
    const orderId = data.custom_data?.order_id;
    await OrderFulfillmentService.processOrder(orderId);
  }

  res.status(200).json({ received: true });
});
```

---

## 3. Stripe (International — à intégrer)

```typescript
// npm install stripe @stripe/stripe-js @stripe/react-stripe-js

// Backend : créer un PaymentIntent
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-12-18.acacia' });

app.post('/api/stripe/create-payment-intent', requireAuth, async (req, res) => {
  const { orderId } = req.body;
  const order = await getOrder(orderId);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(order.total_usd * 100), // En centimes
    currency: 'usd',
    metadata: { order_id: orderId, user_id: req.user.id },
    automatic_payment_methods: { enabled: true }, // Active Apple Pay, Google Pay, etc.
  });

  res.json({ clientSecret: paymentIntent.client_secret });
});

// Frontend : Stripe Elements
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function CheckoutForm({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async () => {
    if (!stripe || !elements) return;
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/fr/checkout/success` },
    });
    if (error) console.error(error.message);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement /> {/* Affiche automatiquement les méthodes disponibles (carte, Apple Pay, etc.) */}
      <button type="submit" disabled={!stripe}>Payer</button>
    </form>
  );
}

// Webhook Stripe
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']!;
  const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);

  switch (event.type) {
    case 'payment_intent.succeeded':
      const orderId = event.data.object.metadata.order_id;
      await OrderFulfillmentService.processOrder(orderId);
      break;
    case 'payment_intent.payment_failed':
      // Notifier le client et marquer la commande
      break;
  }
  res.json({ received: true });
});
```

---

## 4. Flutterwave (Nigeria + Afrique — Phase 2)

```typescript
// Coverage : Nigeria, Ghana, Kenya, Tanzanie, Ouganda, Rwanda, Zambie, Afrique du Sud
// Méthodes : Carte, Bank Transfer, USSD, M-Pesa, MTN MoMo, Airtel Money

// npm install flutterwave-node-v3
import Flutterwave from 'flutterwave-node-v3';
const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);

const initFlutterwavePayment = async (order: Order, customer: User) => {
  const payload = {
    tx_ref: `LUX-${order.id}-${Date.now()}`,
    amount: order.total_usd,
    currency: 'USD',
    redirect_url: `${process.env.FRONTEND_URL}/fr/checkout/success`,
    customer: { email: customer.email, name: customer.full_name },
    customizations: {
      title: 'LuxeDropShopping',
      logo: 'https://luxedropshoping.com/logo.png',
    },
    meta: { order_id: order.id },
  };
  const response = await flw.Charge.card(payload);
  return response.data.link; // URL de paiement
};
```

---

## 5. Unification du flux de paiement (Frontend)

```typescript
// hooks/useCheckout.ts — Interface unifiée pour tous les providers
export function useCheckout() {
  const initiatePayment = async (method: 'paypal' | 'paydunya' | 'stripe', orderId: string) => {
    switch (method) {
      case 'paypal': {
        const { approvalUrl } = await api.createPayPalOrder(orderId);
        window.location.href = approvalUrl;
        break;
      }
      case 'paydunya': {
        const { paymentUrl } = await api.createPayDunyaInvoice(orderId);
        window.location.href = paymentUrl;
        break;
      }
      case 'stripe': {
        const { clientSecret } = await api.createStripeIntent(orderId);
        // Afficher le modal Stripe Elements
        openStripeModal(clientSecret);
        break;
      }
    }
  };

  return { initiatePayment };
}

// Afficher les méthodes disponibles selon le pays détecté
const getAvailableMethods = (countryCode: string) => {
  const methods = ['paypal', 'stripe']; // Disponibles partout
  const westAfrica = ['CI', 'SN', 'ML', 'BF', 'GN', 'TG', 'BJ', 'NE', 'GH'];
  if (westAfrica.includes(countryCode)) methods.push('paydunya');
  return methods;
};
```
