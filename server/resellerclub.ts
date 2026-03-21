/**
 * ResellerClub (LogicBoxes) API Client
 * Docs: https://manage.resellerclub.com/kb/answer/2156
 * Demo mode: works without credentials — returns mock data
 */

const RC_BASE = "https://httpapi.com/api";
const RC_TEST = "https://test.httpapi.com/api";

function getCredentials() {
  const userId = process.env.RESELLERCLUB_USER_ID || "";
  const apiKey = process.env.RESELLERCLUB_API_KEY || "";
  const isDemo = !userId || !apiKey;
  const base = isDemo ? null : (process.env.RESELLERCLUB_TEST === "true" ? RC_TEST : RC_BASE);
  return { userId, apiKey, isDemo, base };
}

async function rcFetch(path: string, params: Record<string, string> = {}): Promise<any> {
  const { userId, apiKey, isDemo, base } = getCredentials();
  if (isDemo) return null;
  const url = new URL(`${base}${path}`);
  url.searchParams.set("auth-userid", userId);
  url.searchParams.set("api-key", apiKey);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`ResellerClub API error: ${res.status}`);
  return res.json();
}

// ── TLD pricing config (SAR prices set by admin) ─────────────────────────────
export const DEFAULT_TLD_PRICES: Record<string, { register: number; renew: number; transfer: number }> = {
  ".com":    { register: 49,  renew: 49,  transfer: 49 },
  ".net":    { register: 55,  renew: 55,  transfer: 55 },
  ".org":    { register: 55,  renew: 55,  transfer: 55 },
  ".sa":     { register: 299, renew: 299, transfer: 299 },
  ".com.sa": { register: 199, renew: 199, transfer: 199 },
  ".store":  { register: 39,  renew: 79,  transfer: 39 },
  ".online": { register: 29,  renew: 69,  transfer: 29 },
  ".site":   { register: 29,  renew: 69,  transfer: 29 },
  ".tech":   { register: 59,  renew: 99,  transfer: 59 },
  ".io":     { register: 149, renew: 149, transfer: 149 },
  ".ai":     { register: 299, renew: 299, transfer: 299 },
  ".app":    { register: 69,  renew: 99,  transfer: 69 },
};

export const HOSTING_PLANS = [
  {
    id: "starter",
    nameAr: "ستارتر",
    nameEn: "Starter",
    priceMonthly: 29,
    priceYearly: 299,
    features: {
      ar: ["1 موقع", "10 GB مساحة", "بيانات غير محدودة", "SSL مجاني", "نطاق مجاني لسنة"],
      en: ["1 Website", "10 GB Storage", "Unlimited Bandwidth", "Free SSL", "Free Domain 1yr"],
    },
    rcPlanId: "starter",
  },
  {
    id: "business",
    nameAr: "بيزنس",
    nameEn: "Business",
    priceMonthly: 59,
    priceYearly: 599,
    features: {
      ar: ["5 مواقع", "50 GB مساحة", "بيانات غير محدودة", "SSL مجاني", "نطاق مجاني لسنة", "بريد إلكتروني مهني"],
      en: ["5 Websites", "50 GB Storage", "Unlimited Bandwidth", "Free SSL", "Free Domain 1yr", "Professional Email"],
    },
    rcPlanId: "business",
  },
  {
    id: "pro",
    nameAr: "برو",
    nameEn: "Pro",
    priceMonthly: 99,
    priceYearly: 999,
    features: {
      ar: ["مواقع غير محدودة", "200 GB مساحة", "بيانات غير محدودة", "SSL مجاني", "نطاق مجاني لسنة", "بريد مهني", "نسخ احتياطية يومية"],
      en: ["Unlimited Websites", "200 GB Storage", "Unlimited Bandwidth", "Free SSL", "Free Domain 1yr", "Professional Email", "Daily Backups"],
    },
    rcPlanId: "pro",
  },
];

// ── Domain availability check ─────────────────────────────────────────────────
export interface DomainResult {
  domain: string;
  tld: string;
  available: boolean | "unknown";
  price: number;
  renewPrice: number;
  status?: string;
}

export async function checkDomainAvailability(
  sld: string,
  tlds: string[]
): Promise<DomainResult[]> {
  const { isDemo } = getCredentials();
  const cleanSld = sld.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/^-+|-+$/g, "");

  if (isDemo) {
    return tlds.map((tld) => {
      const prices = DEFAULT_TLD_PRICES[tld] || { register: 49, renew: 49 };
      // Simulate: .com always taken for common names, others available
      const simTaken = tld === ".com" && ["google", "facebook", "amazon", "apple"].includes(cleanSld);
      return {
        domain: `${cleanSld}${tld}`,
        tld,
        available: !simTaken,
        price: prices.register,
        renewPrice: prices.renew,
        status: !simTaken ? "available" : "taken",
      };
    });
  }

  try {
    const tldList = tlds.map((t) => t.replace(".", "")).join(",");
    const data = await rcFetch("/domains/available.json", {
      "domain-name": cleanSld,
      tlds: tldList,
    });

    return tlds.map((tld) => {
      const prices = DEFAULT_TLD_PRICES[tld] || { register: 49, renew: 49 };
      const tldKey = tld.replace(".", "");
      const status = data?.[`${cleanSld}${tld}`]?.status || "unknown";
      return {
        domain: `${cleanSld}${tld}`,
        tld,
        available: status === "available",
        price: prices.register,
        renewPrice: prices.renew,
        status,
      };
    });
  } catch {
    return tlds.map((tld) => {
      const prices = DEFAULT_TLD_PRICES[tld] || { register: 49, renew: 49 };
      return {
        domain: `${cleanSld}${tld}`,
        tld,
        available: "unknown",
        price: prices.register,
        renewPrice: prices.renew,
        status: "error",
      };
    });
  }
}

// ── Register domain (called after payment) ───────────────────────────────────
export interface RegisterDomainOptions {
  domain: string;
  years: number;
  customerId: string;
  regContactId: string;
  adminContactId: string;
  techContactId: string;
  billingContactId: string;
  nameservers?: string[];
}

export async function registerDomain(opts: RegisterDomainOptions): Promise<{ orderId?: string; error?: string }> {
  const { isDemo } = getCredentials();
  if (isDemo) {
    return { orderId: `DEMO-${Date.now()}` };
  }
  try {
    const ns = opts.nameservers || ["ns1.arabyweb.net", "ns2.arabyweb.net"];
    const data = await rcFetch("/domains/register.json", {
      "domain-name": opts.domain.split(".")[0],
      tld: opts.domain.slice(opts.domain.indexOf(".")),
      years: String(opts.years),
      "customer-id": opts.customerId,
      "reg-contact-id": opts.regContactId,
      "admin-contact-id": opts.adminContactId,
      "tech-contact-id": opts.techContactId,
      "billing-contact-id": opts.billingContactId,
      ...Object.fromEntries(ns.map((n, i) => [`ns${i + 1}`, n])),
    });
    return { orderId: String(data?.entityid || data?.orderid || "") };
  } catch (e: any) {
    return { error: e.message };
  }
}

export function isConfigured(): boolean {
  return !!process.env.RESELLERCLUB_USER_ID && !!process.env.RESELLERCLUB_API_KEY;
}
