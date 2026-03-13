import { storage } from "./storage";

const PAYMOB_BASE = "https://accept.paymob.com/api";

async function getPaymobConfig() {
  const apiKey = await storage.getSetting("paymob_api_key");
  const integrationId = await storage.getSetting("paymob_integration_id");
  const iframeId = await storage.getSetting("paymob_iframe_id");
  const hmacSecret = await storage.getSetting("paymob_hmac_secret");
  return { apiKey, integrationId, iframeId, hmacSecret };
}

export async function isPaymobConfigured(): Promise<boolean> {
  const { apiKey, integrationId, iframeId } = await getPaymobConfig();
  return !!(apiKey && integrationId && iframeId);
}

async function getAuthToken(): Promise<string> {
  const { apiKey } = await getPaymobConfig();
  if (!apiKey) throw new Error("Paymob API key not configured");
  const res = await fetch(`${PAYMOB_BASE}/auth/tokens`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: apiKey }),
  });
  if (!res.ok) throw new Error("Paymob authentication failed");
  const data = await res.json();
  return data.token;
}

export async function createPaymobOrder(
  amountCents: number,
  currency: string,
  merchantOrderId: string
): Promise<{ orderId: number; token: string }> {
  const token = await getAuthToken();
  const res = await fetch(`${PAYMOB_BASE}/ecommerce/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      auth_token: token,
      delivery_needed: false,
      amount_cents: amountCents,
      currency,
      merchant_order_id: merchantOrderId,
      items: [],
    }),
  });
  if (!res.ok) throw new Error("Failed to create Paymob order");
  const data = await res.json();
  return { orderId: data.id, token };
}

export async function getPaymentKey(
  authToken: string,
  orderId: number,
  amountCents: number,
  currency: string,
  billingData: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }
): Promise<string> {
  const { integrationId } = await getPaymobConfig();
  if (!integrationId) throw new Error("Paymob integration ID not configured");

  const res = await fetch(`${PAYMOB_BASE}/acceptance/payment_keys`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      auth_token: authToken,
      amount_cents: amountCents,
      expiration: 3600,
      order_id: orderId,
      billing_data: {
        apartment: "NA",
        email: billingData.email,
        floor: "NA",
        first_name: billingData.firstName,
        street: "NA",
        building: "NA",
        phone_number: billingData.phone || "+966500000000",
        shipping_method: "NA",
        postal_code: "NA",
        city: "NA",
        country: "SA",
        last_name: billingData.lastName,
        state: "NA",
      },
      currency,
      integration_id: parseInt(integrationId),
    }),
  });
  if (!res.ok) throw new Error("Failed to get payment key");
  const data = await res.json();
  return data.token;
}

export async function getIframeUrl(paymentToken: string): Promise<string> {
  const { iframeId } = await getPaymobConfig();
  if (!iframeId) throw new Error("Paymob iframe ID not configured");
  return `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentToken}`;
}

export async function verifyHmac(
  data: Record<string, any>,
  receivedHmac: string
): Promise<boolean> {
  const { hmacSecret } = await getPaymobConfig();
  if (!hmacSecret) return false;

  const crypto = await import("crypto");
  const orderId = typeof data.order === "object" ? data.order?.id : data.order;
  const concatenated = [
    data.amount_cents,
    data.created_at,
    data.currency,
    data.error_occured,
    data.has_parent_transaction,
    data.id,
    data.integration_id,
    data.is_3d_secure,
    data.is_auth,
    data.is_capture,
    data.is_refunded,
    data.is_standalone_payment,
    data.is_voided,
    orderId,
    data.owner,
    data.pending,
    data.source_data?.pan || data.source_data_pan,
    data.source_data?.sub_type || data.source_data_sub_type,
    data.source_data?.type || data.source_data_type,
    data.success,
  ].join("");

  const hash = crypto
    .createHmac("sha512", hmacSecret)
    .update(concatenated)
    .digest("hex");

  return hash === receivedHmac;
}

export const PLAN_PRICES: Record<string, number> = {
  pro: 4900,      // 49 SAR in halalas
  business: 9900, // 99 SAR in halalas
};

export async function initPricesFromDB(storage: any) {
  try {
    const proPrice = await storage.getSetting("price_pro");
    const businessPrice = await storage.getSetting("price_business");
    if (proPrice) PLAN_PRICES.pro = parseInt(proPrice);
    if (businessPrice) PLAN_PRICES.business = parseInt(businessPrice);
  } catch {}
}
