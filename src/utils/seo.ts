/**
 * SEO & Metadata Manager for React SPA
 * Dynamically updates document title, meta tags, canonical link, and JSON-LD schema
 */

export interface SeoMetadata {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  structuredData?: Record<string, any>;
}

function updateMetaTag(name: string, content: string, isProperty = false) {
  const attr = isProperty ? "property" : "name";
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
}

function updateLinkCanonical(url: string) {
  let el = document.querySelector(`link[rel="canonical"]`) as HTMLLinkElement;
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = url;
}

function updateStructuredData(data: Record<string, any> | null) {
  const SCRIPT_ID = "app-structured-data-jsonld";
  let el = document.getElementById(SCRIPT_ID) as HTMLScriptElement;

  if (!data) {
    if (el) el.remove();
    return;
  }

  if (!el) {
    el = document.createElement("script");
    el.id = SCRIPT_ID;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }

  el.textContent = JSON.stringify(data);
}

const DEFAULT_TITLE = "پروتئین گلمحمدی | تأمین تخصصی گوشت و استیک هتل‌ها و رستوران‌ها";
const DEFAULT_DESC = "تأمین بدون واسطه گوشت قرمز دستچین، استیک‌های درای‌ایج و ریب‌آی با بسته‌بندی مکانیزه و استاندارد زنجیره سرد در سراسر کشور.";
const DEFAULT_CANONICAL = "https://golmohamadi.com";

export function applySeoMetadata(meta: SeoMetadata) {
  const title = meta.title || DEFAULT_TITLE;
  const description = meta.description || DEFAULT_DESC;
  const canonical = meta.canonicalUrl || (window.location.origin + window.location.pathname);
  const ogTitle = meta.ogTitle || title;
  const ogDesc = meta.ogDescription || description;
  const ogImage = meta.ogImage || "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80";
  const ogType = meta.ogType || "website";

  // Document Title
  document.title = title;

  // Standard Meta Tags
  updateMetaTag("description", description);
  if (meta.keywords) {
    updateMetaTag("keywords", meta.keywords);
  }

  // Canonical URL
  updateLinkCanonical(canonical);

  // Open Graph
  updateMetaTag("og:title", ogTitle, true);
  updateMetaTag("og:description", ogDesc, true);
  updateMetaTag("og:url", canonical, true);
  updateMetaTag("og:image", ogImage, true);
  updateMetaTag("og:type", ogType, true);
  updateMetaTag("og:site_name", "پروتئین گلمحمدی", true);

  // Article-specific OG tags
  if (ogType === "article") {
    if (meta.publishedTime) {
      updateMetaTag("article:published_time", meta.publishedTime, true);
    }
    if (meta.modifiedTime) {
      updateMetaTag("article:modified_time", meta.modifiedTime, true);
    }
    if (meta.author) {
      updateMetaTag("article:author", meta.author, true);
    }
  }

  // Twitter / X
  updateMetaTag("twitter:card", "summary_large_image");
  updateMetaTag("twitter:title", ogTitle);
  updateMetaTag("twitter:description", ogDesc);
  updateMetaTag("twitter:image", ogImage);

  // Schema.org Structured Data
  if (meta.structuredData) {
    updateStructuredData(meta.structuredData);
  } else {
    // Default Organization Schema
    updateStructuredData({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "پروتئین گلمحمدی",
      url: "https://golmohamadi.com",
      logo: "https://golmohamadi.com/assets/logo.png",
      description: DEFAULT_DESC,
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+98-21-22000000",
        contactType: "customer service",
      },
    });
  }
}
