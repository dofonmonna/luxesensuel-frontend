import emailjs from '@emailjs/browser';

// Configuration EmailJS - Remplacez par vos propres valeurs
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_CUSTOMER = 'YOUR_TEMPLATE_ID_CUSTOMER';
const EMAILJS_TEMPLATE_ADMIN = 'YOUR_TEMPLATE_ID_ADMIN';
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';

interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  address: string;
  city: string;
  postalCode: string;
}

export const sendOrderConfirmationEmail = async (orderData: OrderEmailData) => {
  try {
    // Email au client
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_CUSTOMER,
      {
        to_name: orderData.customerName,
        to_email: orderData.customerEmail,
        order_id: orderData.orderId,
        order_details: orderData.items.map(item => 
          `${item.name} x${item.quantity} - ${(item.price * item.quantity).toFixed(2)}€`
        ).join('\n'),
        order_total: `${orderData.total.toFixed(2)}€`,
        shipping_address: `${orderData.address}, ${orderData.postalCode} ${orderData.city}`,
      },
      EMAILJS_PUBLIC_KEY
    );

    // Email à l'admin (vous)
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ADMIN,
      {
        order_id: orderData.orderId,
        customer_name: orderData.customerName,
        customer_email: orderData.customerEmail,
        order_details: orderData.items.map(item => 
          `${item.name} x${item.quantity} - ${(item.price * item.quantity).toFixed(2)}€`
        ).join('\n'),
        order_total: `${orderData.total.toFixed(2)}€`,
        shipping_address: `${orderData.address}, ${orderData.postalCode} ${orderData.city}`,
      },
      EMAILJS_PUBLIC_KEY
    );

    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};

export const sendShippingConfirmationEmail = async (
  customerEmail: string,
  customerName: string,
  orderId: string,
  trackingNumber?: string
) => {
  try {
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      'YOUR_SHIPPING_TEMPLATE_ID',
      {
        to_name: customerName,
        to_email: customerEmail,
        order_id: orderId,
        tracking_number: trackingNumber || 'Disponible prochainement',
      },
      EMAILJS_PUBLIC_KEY
    );
    return { success: true };
  } catch (error) {
    console.error('Error sending shipping email:', error);
    return { success: false, error };
  }
};
