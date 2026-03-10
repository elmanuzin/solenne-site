export type AnalyticsEventName =
  | "product_view"
  | "whatsapp_click"
  | "add_to_cart"
  | "banner_click";

type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(
  name: AnalyticsEventName,
  payload: AnalyticsPayload = {}
) {
  if (typeof window === "undefined") return;

  const eventPayload = { event: name, ...payload };

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push(eventPayload);
  }

  if (typeof window.gtag === "function") {
    window.gtag("event", name, payload);
  }

  if (process.env.NODE_ENV !== "production") {
    console.debug("[analytics]", name, payload);
  }
}
