export const sendOrderConfirmationEmail = async (email: string, name: string, orderId: string, total: number) => {
  console.log(`[Email] Confirmation de COMMANDE envoyée à ${email} (ID: ${orderId})`);
  return { success: true };
};

export const sendShippingConfirmationEmail = async (email: string, name: string, orderId: string, trackingNumber: string) => {
  console.log(`[Email] Confirmation d'EXPÉDITION envoyée à ${email} (Suivi: ${trackingNumber})`);
  return { success: true };
};
