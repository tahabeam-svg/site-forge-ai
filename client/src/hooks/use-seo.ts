import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonical?: string;
  noindex?: boolean;
  lang?: "ar" | "en";
  structuredData?: Record<string, unknown>;
}

const BASE_TITLE = "ArabyWeb.net";
const BASE_URL = "https://arabyweb.net";

export function useSEO({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogImage = "/og-image.png",
  canonical,
  noindex = false,
  lang = "ar",
  structuredData,
}: SEOProps = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${BASE_TITLE}` : `${BASE_TITLE} | بناء موقع إلكتروني مجاني بالذكاء الاصطناعي`;
    document.title = fullTitle;

    const setMeta = (selector: string, attr: string, value: string | null) => {
      if (!value) return;
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        if (selector.startsWith('[property')) {
          el.setAttribute("property", selector.match(/property="([^"]+)"/)?.[1] || "");
        } else if (selector.startsWith('[name')) {
          el.setAttribute("name", selector.match(/name="([^"]+)"/)?.[1] || "");
        }
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    if (description) setMeta('[name="description"]', "content", description);
    if (keywords) setMeta('[name="keywords"]', "content", keywords);
    setMeta('[name="robots"]', "content", noindex ? "noindex, nofollow" : "index, follow");
    setMeta('[property="og:title"]', "content", ogTitle || fullTitle);
    if (ogDescription || description) setMeta('[property="og:description"]', "content", ogDescription || description || "");
    setMeta('[property="og:image"]', "content", `${BASE_URL}${ogImage}`);
    setMeta('[property="og:url"]', "content", canonical || `${BASE_URL}${window.location.pathname}`);
    setMeta('[name="twitter:title"]', "content", ogTitle || fullTitle);
    if (ogDescription || description) setMeta('[name="twitter:description"]', "content", ogDescription || description || "");

    const html = document.documentElement;
    html.lang = lang;
    html.dir = lang === "ar" ? "rtl" : "ltr";

    let canonEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonEl) {
      canonEl = document.createElement("link");
      canonEl.rel = "canonical";
      document.head.appendChild(canonEl);
    }
    canonEl.href = canonical || `${BASE_URL}${window.location.pathname}`;

    if (structuredData) {
      const id = "dynamic-structured-data";
      let script = document.getElementById(id) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement("script");
        script.id = id;
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }

    return () => {
      const dynamicScript = document.getElementById("dynamic-structured-data");
      if (dynamicScript) dynamicScript.remove();
    };
  }, [title, description, keywords, ogTitle, ogDescription, ogImage, canonical, noindex, lang, structuredData]);
}
