---
title: Web SEO Optimization & Next.js Search Engine Strategy
version: 2.0
owner: SEO & Marketing Team + Frontend Architecture Team
last_reviewed: 2025-09-16
next_review: 2025-10-16
classification: CONFIDENTIAL
technical_scope: [SEO, Next.js, Meta_Tags, Structured_Data, Core_Web_Vitals]
primary_stack: "Next.js App Router + JSON-LD + Open Graph + Schema.org (see official technology versions)"
---

# Web SEO Optimization & Next.js Search Engine Strategy

> **Platform Memory**: Enterprise-grade SEO framework achieving 95+ Lighthouse SEO scores and top search engine rankings for billion-dollar e-commerce operations

## Next.js SEO Best Practices

### **SEO Architecture Strategy**
```yaml
SEO Framework: Next.js App Router + Server Components (see official technology versions)
Target Score: Lighthouse SEO 95+ (consistently)
Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
Search Coverage: 99.5% crawlable pages + 0% crawl errors
Indexing Strategy: Strategic noindex + sitemap optimization
Performance Budget: <200KB First Load JS + <3s TTI
```

### **Meta Tags & Metadata Framework**
```typescript
// app/layout.tsx - Root Layout SEO Configuration
import { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!),
  title: {
    template: '%s | Tanqory - Global E-commerce Platform',
    default: 'Tanqory - AI-First E-commerce Platform | Shop Globally',
    absolute: 'Tanqory - AI-First E-commerce Platform'
  },
  description: 'Discover millions of products on Tanqory, the AI-powered global e-commerce platform. Shop electronics, fashion, home goods and more with free shipping worldwide.',
  applicationName: 'Tanqory',
  authors: [
    { name: 'Tanqory Team', url: 'https://tanqory.com/about' }
  ],
  generator: 'Next.js',
  keywords: [
    'e-commerce',
    'online shopping',
    'global marketplace',
    'AI shopping',
    'free shipping',
    'electronics',
    'fashion',
    'home goods'
  ],
  referrer: 'origin-when-cross-origin',
  creator: 'Tanqory Engineering Team',
  publisher: 'Tanqory Inc.',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['th_TH', 'ja_JP', 'zh_CN', 'ko_KR', 'es_ES', 'fr_FR'],
    url: 'https://tanqory.com',
    siteName: 'Tanqory',
    title: 'Tanqory - Global E-commerce Platform',
    description: 'Shop millions of products with AI-powered recommendations. Free worldwide shipping on orders over $50.',
    images: [
      {
        url: '/og-image-1200x630.jpg',
        width: 1200,
        height: 630,
        alt: 'Tanqory - Global E-commerce Platform',
      },
      {
        url: '/og-image-square.jpg',
        width: 1200,
        height: 1200,
        alt: 'Tanqory Logo',
      }
    ],
  },

  // Twitter
  twitter: {
    card: 'summary_large_image',
    site: '@tanqory',
    creator: '@tanqory',
    title: 'Tanqory - Global E-commerce Platform',
    description: 'Shop millions of products with AI-powered recommendations.',
    images: ['/twitter-image-1200x600.jpg'],
  },

  // Verification
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    yahoo: process.env.YAHOO_SITE_VERIFICATION,
    other: {
      'msvalidate.01': process.env.BING_SITE_VERIFICATION!,
      'baidu-site-verification': process.env.BAIDU_SITE_VERIFICATION!,
    }
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Icons and PWA
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },

  manifest: '/site.webmanifest',

  // Additional meta tags
  other: {
    'theme-color': '#1f2937',
    'msapplication-TileColor': '#1f2937',
    'msapplication-config': '/browserconfig.xml',
  }
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1f2937' }
  ],
  colorScheme: 'dark light',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};
```

### **Dynamic Page SEO Implementation**
```typescript
// app/products/[slug]/page.tsx - Product Page SEO
import { Metadata } from 'next';
import { getProduct, getRelatedProducts } from '@/lib/api/products';
import { generateProductJsonLd, generateBreadcrumbJsonLd } from '@/lib/seo/structured-data';
import { notFound } from 'next/navigation';

interface ProductPageProps {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  try {
    const product = await getProduct(params.slug);

    if (!product) {
      return {
        title: 'Product Not Found',
        robots: { index: false, follow: false }
      };
    }

    const images = product.images.map(image => ({
      url: image.url,
      width: image.width,
      height: image.height,
      alt: image.alt || product.name,
    }));

    return {
      title: `${product.name} - ${product.category} | Best Price Guaranteed`,
      description: `Buy ${product.name} online at the best price. ${product.shortDescription} Free shipping on orders over $50. ${product.rating}★ rating from ${product.reviewCount} verified reviews.`,

      keywords: [
        product.name.toLowerCase(),
        product.category.toLowerCase(),
        product.brand?.toLowerCase(),
        ...product.tags.map(tag => tag.toLowerCase()),
        'buy online',
        'best price',
        'free shipping'
      ].filter(Boolean),

      openGraph: {
        type: 'product',
        title: product.name,
        description: product.shortDescription,
        images,
        url: `https://tanqory.com/products/${params.slug}`,
        siteName: 'Tanqory',
        locale: 'en_US',
      },

      twitter: {
        card: 'summary_large_image',
        title: product.name,
        description: product.shortDescription,
        images: [images[0]?.url],
      },

      // Product-specific meta
      other: {
        'product:price:amount': product.price.toString(),
        'product:price:currency': product.currency,
        'product:availability': product.inStock ? 'in_stock' : 'out_of_stock',
        'product:brand': product.brand || '',
        'product:category': product.category,
        'product:rating': product.rating.toString(),
        'product:review_count': product.reviewCount.toString(),
      },

      alternates: {
        canonical: `https://tanqory.com/products/${params.slug}`,
        languages: {
          'en': `https://tanqory.com/products/${params.slug}`,
          'th': `https://th.tanqory.com/products/${params.slug}`,
          'ja': `https://ja.tanqory.com/products/${params.slug}`,
          'zh': `https://zh.tanqory.com/products/${params.slug}`,
        }
      }
    };
  } catch (error) {
    console.error('Error generating product metadata:', error);
    return {
      title: 'Product Not Found',
      robots: { index: false, follow: false }
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.id);
  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: product.category, href: `/category/${product.categorySlug}` },
    { name: product.name, href: `/products/${params.slug}` }
  ];

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            generateProductJsonLd(product),
            generateBreadcrumbJsonLd(breadcrumbs)
          ])
        }}
      />

      {/* Product content */}
      <main>
        {/* Product details */}
      </main>
    </>
  );
}
```

### **Structured Data Implementation**
```typescript
// lib/seo/structured-data.ts
import type { Product, Category, Review, Organization } from '@/types';

// Organization Schema
export function generateOrganizationJsonLd(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Tanqory',
    url: 'https://tanqory.com',
    logo: 'https://tanqory.com/logo.png',
    description: 'Global AI-first e-commerce platform connecting buyers with sellers worldwide',
    foundingDate: '2023',
    founders: [
      {
        '@type': 'Person',
        name: 'Tanqory Team'
      }
    ],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'US',
      addressRegion: 'CA',
      addressLocality: 'San Francisco'
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        telephone: '+1-800-TANQORY',
        email: 'support@tanqory.com',
        availableLanguage: ['English', 'Thai', 'Japanese', 'Chinese', 'Korean']
      }
    ],
    sameAs: [
      'https://twitter.com/tanqory',
      'https://facebook.com/tanqory',
      'https://linkedin.com/company/tanqory',
      'https://instagram.com/tanqory'
    ]
  };
}

// Product Schema with rich data
export function generateProductJsonLd(product: Product): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images.map(img => img.url),
    sku: product.sku,
    mpn: product.mpn,
    brand: product.brand ? {
      '@type': 'Brand',
      name: product.brand
    } : undefined,
    category: product.category,

    offers: {
      '@type': 'Offer',
      url: `https://tanqory.com/products/${product.slug}`,
      priceCurrency: product.currency,
      price: product.price,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Tanqory',
        url: 'https://tanqory.com'
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 30,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn'
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: product.price >= 50 ? 0 : 9.99,
          currency: product.currency
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 2,
            unitCode: 'DAY'
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 3,
            maxValue: 7,
            unitCode: 'DAY'
          }
        }
      }
    },

    aggregateRating: product.reviewCount > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
      bestRating: 5,
      worstRating: 1
    } : undefined,

    review: product.reviews?.slice(0, 5).map(review => ({
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1
      },
      author: {
        '@type': 'Person',
        name: review.author.name
      },
      reviewBody: review.content,
      datePublished: review.createdAt
    }))
  };
}

// Breadcrumb Schema
export function generateBreadcrumbJsonLd(breadcrumbs: Array<{name: string, href: string}>): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `https://tanqory.com${item.href}`
    }))
  };
}

// Website Search Schema
export function generateWebsiteJsonLd(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Tanqory',
    url: 'https://tanqory.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://tanqory.com/search?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    },
    sameAs: [
      'https://twitter.com/tanqory',
      'https://facebook.com/tanqory',
      'https://instagram.com/tanqory'
    ]
  };
}

// FAQ Schema
export function generateFAQJsonLd(faqs: Array<{question: string, answer: string}>): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

// Local Business Schema (for physical stores)
export function generateLocalBusinessJsonLd(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://tanqory.com/#organization',
    name: 'Tanqory',
    image: 'https://tanqory.com/logo.png',
    telephone: '+1-800-TANQORY',
    email: 'support@tanqory.com',
    url: 'https://tanqory.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Commerce Street',
      addressLocality: 'San Francisco',
      addressRegion: 'CA',
      postalCode: '94102',
      addressCountry: 'US'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '37.7749',
      longitude: '-122.4194'
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00'
      }
    ],
    priceRange: '$-$$$$',
    paymentAccepted: 'Credit Card, PayPal, Apple Pay, Google Pay',
    currenciesAccepted: 'USD, THB, JPY, CNY, KRW'
  };
}
```

### **Performance Optimization for SEO**
```typescript
// lib/seo/performance.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

// SEO-optimized image component
interface SEOImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
}

export function SEOImage({ src, alt, width, height, priority = false, className }: SEOImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      placeholder="blur"
      blurDataURL={generateBlurDataURL()}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
    />
  );
}

// Core Web Vitals optimization utilities
export class WebVitalsOptimizer {
  // Largest Contentful Paint optimization
  static optimizeLCP() {
    return {
      preloadCriticalImages: (images: string[]) => {
        return images.slice(0, 2).map(src => (
          <link
            key={src}
            rel="preload"
            as="image"
            href={src}
            fetchPriority="high"
          />
        ));
      },

      criticalCSS: `
        /* Critical CSS for above-the-fold content */
        .hero-section { display: block; }
        .product-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
        .loading-skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); }
      `,
    };
  }

  // First Input Delay optimization
  static optimizeFID() {
    return {
      deferNonCriticalJS: () => {
        if (typeof window !== 'undefined') {
          // Defer analytics and non-critical scripts
          const scripts = ['analytics', 'chat-widget', 'reviews'];
          scripts.forEach(script => {
            const element = document.getElementById(script);
            if (element) {
              element.setAttribute('loading', 'lazy');
            }
          });
        }
      },

      optimizeEventHandlers: () => {
        // Use passive event listeners where possible
        const options = { passive: true, capture: false };
        return options;
      }
    };
  }

  // Cumulative Layout Shift optimization
  static optimizeCLS() {
    return {
      reserveSpace: {
        heroImage: 'aspect-ratio: 16/9; width: 100%;',
        productCard: 'min-height: 400px;',
        adSlot: 'height: 250px; width: 100%;',
      },

      fontDisplay: `
        @font-face {
          font-family: 'Inter';
          font-display: swap;
          src: url('/fonts/inter-var.woff2') format('woff2');
        }
      `
    };
  }
}

// SEO-friendly URL generation
export function generateSEOUrl(title: string, category?: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // Remove special characters
    .replace(/\s+/g, '-')        // Replace spaces with hyphens
    .replace(/-+/g, '-')         // Remove multiple hyphens
    .trim()
    .substring(0, 60);           // Limit length for URLs

  return category ? `/${category}/${slug}` : `/${slug}`;
}

// Canonical URL utilities
export function getCanonicalUrl(pathname: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  const cleanPath = pathname.replace(/\/$/, '') || '/';
  return `${baseUrl}${cleanPath}`;
}

// Sitemap generation utilities
export async function generateSitemap(): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  const staticPages = [
    { url: '', changefreq: 'daily', priority: 1.0 },
    { url: '/about', changefreq: 'monthly', priority: 0.8 },
    { url: '/contact', changefreq: 'monthly', priority: 0.7 },
    { url: '/privacy', changefreq: 'yearly', priority: 0.5 },
    { url: '/terms', changefreq: 'yearly', priority: 0.5 },
  ];

  // Dynamic pages (products, categories, etc.)
  const products = await getProductsForSitemap();
  const categories = await getCategoriesForSitemap();

  const allUrls = [
    ...staticPages,
    ...products.map(product => ({
      url: `/products/${product.slug}`,
      changefreq: 'weekly',
      priority: 0.9,
      lastmod: product.updatedAt
    })),
    ...categories.map(category => ({
      url: `/category/${category.slug}`,
      changefreq: 'daily',
      priority: 0.8,
      lastmod: category.updatedAt
    }))
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    ${page.lastmod ? `<lastmod>${new Date(page.lastmod).toISOString()}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>`;

  return sitemap;
}
```

### **Core Web Vitals Optimization**
```typescript
// lib/seo/web-vitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB, type Metric } from 'web-vitals';

// Web Vitals monitoring and optimization
export class CoreWebVitalsOptimizer {
  private static instance: CoreWebVitalsOptimizer;
  private metrics: Map<string, number> = new Map();

  static getInstance(): CoreWebVitalsOptimizer {
    if (!CoreWebVitalsOptimizer.instance) {
      CoreWebVitalsOptimizer.instance = new CoreWebVitalsOptimizer();
    }
    return CoreWebVitalsOptimizer.instance;
  }

  // Initialize Web Vitals monitoring
  init() {
    if (typeof window === 'undefined') return;

    getCLS(this.handleMetric.bind(this));
    getFID(this.handleMetric.bind(this));
    getFCP(this.handleMetric.bind(this));
    getLCP(this.handleMetric.bind(this));
    getTTFB(this.handleMetric.bind(this));
  }

  private handleMetric(metric: Metric) {
    this.metrics.set(metric.name, metric.value);

    // Send to analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', metric.name, {
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        metric_id: metric.id,
        metric_value: metric.value,
        metric_delta: metric.delta,
      });
    }

    // Alert if metrics are poor
    this.checkThresholds(metric);
  }

  private checkThresholds(metric: Metric) {
    const thresholds = {
      CLS: 0.1,
      FID: 100,
      LCP: 2500,
      FCP: 1800,
      TTFB: 600,
    };

    const threshold = thresholds[metric.name as keyof typeof thresholds];
    if (threshold && metric.value > threshold) {
      console.warn(`⚠️ Poor ${metric.name}: ${metric.value} (threshold: ${threshold})`);

      // Send alert to monitoring system
      this.sendAlert(metric, threshold);
    }
  }

  private async sendAlert(metric: Metric, threshold: number) {
    try {
      await fetch('/api/monitoring/web-vitals-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric: metric.name,
          value: metric.value,
          threshold,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: Date.now()
        })
      });
    } catch (error) {
      console.error('Failed to send web vitals alert:', error);
    }
  }

  // Get current metrics
  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  // Resource optimization strategies
  static optimizeResources() {
    return {
      // Critical resource hints
      preconnect: [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
        'https://cdn.tanqory.com'
      ],

      // DNS prefetch for third-party domains
      dnsPrefetch: [
        'https://www.google-analytics.com',
        'https://www.googletagmanager.com',
        'https://api.stripe.com'
      ],

      // Module preloading for critical JavaScript
      modulePreload: [
        '/js/critical.js',
        '/js/shopping-cart.js'
      ]
    };
  }
}

// LCP optimization strategies
export const LCPOptimizations = {
  // Preload hero images
  preloadHeroImage: (src: string) => (
    <link
      rel="preload"
      as="image"
      href={src}
      fetchPriority="high"
    />
  ),

  // Critical CSS inlining
  inlineCriticalCSS: () => (
    <style dangerouslySetInnerHTML={{
      __html: `
        .hero-section { display: block; background: #f8f9fa; }
        .product-grid { display: grid; gap: 1rem; }
        .loading { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `
    }} />
  ),

  // Font optimization
  optimizeFonts: () => (
    <>
      <link
        rel="preconnect"
        href="https://fonts.googleapis.com"
        crossOrigin="anonymous"
      />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        rel="preload"
        href="/fonts/inter-var.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
    </>
  )
};
```

### **Server-Side Rendering Strategies**
```typescript
// lib/seo/ssr-optimization.ts

// SEO-optimized data fetching
export async function generateStaticParams() {
  // Pre-generate paths for top 1000 products
  const topProducts = await getTopProducts(1000);

  return topProducts.map((product) => ({
    slug: product.slug,
  }));
}

// ISR (Incremental Static Regeneration) configuration
export const revalidate = 3600; // Revalidate every hour

// Custom SEO middleware for edge optimization
export function seoMiddleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const userAgent = request.headers.get('user-agent') || '';
  const isBot = /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot/i.test(userAgent);

  // Bot-specific optimizations
  if (isBot) {
    // Serve static HTML for bots
    url.searchParams.set('_bot', '1');

    // Remove unnecessary query parameters for clean URLs
    const allowedParams = ['page', 'sort', 'filter'];
    for (const [key] of url.searchParams) {
      if (!allowedParams.includes(key)) {
        url.searchParams.delete(key);
      }
    }
  }

  // Canonical URL handling
  if (url.pathname.endsWith('/') && url.pathname !== '/') {
    url.pathname = url.pathname.slice(0, -1);
    return NextResponse.redirect(url, 301);
  }

  // WWW redirect
  if (url.hostname === 'www.tanqory.com') {
    url.hostname = 'tanqory.com';
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

// SEO-optimized API routes
export class SEOApiOptimizer {
  static generateRobotsTxt(): string {
    return `User-agent: *
Allow: /

User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: Slurp
Allow: /
Crawl-delay: 2

# Block AI training crawlers
User-agent: GPTBot
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: anthropic-ai
Disallow: /

# Disallow admin and internal pages
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /checkout/
Disallow: /account/

# Allow important pages
Allow: /api/products/sitemap
Allow: /api/categories/sitemap

Sitemap: https://tanqory.com/sitemap.xml`;
  }

  static async generateProductFeed(): Promise<string> {
    const products = await getAllProducts();

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Tanqory Product Feed</title>
    <description>Latest products from Tanqory</description>
    <link>https://tanqory.com</link>
    ${products.map(product => `
    <item>
      <g:id>${product.id}</g:id>
      <g:title><![CDATA[${product.name}]]></g:title>
      <g:description><![CDATA[${product.description}]]></g:description>
      <g:link>https://tanqory.com/products/${product.slug}</g:link>
      <g:image_link>${product.images[0]?.url}</g:image_link>
      <g:price>${product.price} ${product.currency}</g:price>
      <g:availability>${product.inStock ? 'in stock' : 'out of stock'}</g:availability>
      <g:brand><![CDATA[${product.brand || ''}]]></g:brand>
      <g:condition>new</g:condition>
      <g:google_product_category>${product.googleProductCategory}</g:google_product_category>
      <g:product_type><![CDATA[${product.category}]]></g:product_type>
      <g:gtin>${product.gtin || ''}</g:gtin>
      <g:mpn>${product.mpn || ''}</g:mpn>
      <g:shipping>
        <g:country>US</g:country>
        <g:service>Standard</g:service>
        <g:price>${product.price >= 50 ? '0 USD' : '9.99 USD'}</g:price>
      </g:shipping>
    </item>`).join('')}
  </channel>
</rss>`;
  }
}
```

### **Analytics & Tracking Implementation**
```typescript
// lib/seo/analytics.ts
import { GoogleAnalytics } from '@next/third-parties/google';

// Comprehensive analytics setup
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Google Analytics 4 */}
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />

      {/* Google Search Console */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');
          `
        }}
      />

      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            generateOrganizationJsonLd(),
            generateWebsiteJsonLd()
          ])
        }}
      />

      {children}
    </>
  );
}

// SEO event tracking
export const seoTracking = {
  // Track search queries
  trackSearch: (query: string, results: number) => {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'search', {
        search_term: query,
        results_count: results,
      });
    }
  },

  // Track product views for SEO insights
  trackProductView: (product: Product) => {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'view_item', {
        currency: product.currency,
        value: product.price,
        items: [{
          item_id: product.id,
          item_name: product.name,
          category: product.category,
          price: product.price,
        }]
      });
    }
  },

  // Track page performance
  trackPagePerformance: (metrics: Record<string, number>) => {
    if (typeof gtag !== 'undefined') {
      Object.entries(metrics).forEach(([metric, value]) => {
        gtag('event', 'page_performance', {
          metric_name: metric,
          metric_value: value,
          page_url: window.location.href
        });
      });
    }
  }
};
```

### **Local SEO & Internationalization**
```typescript
// lib/seo/i18n-seo.ts

// Multi-language SEO configuration
export const i18nSEOConfig = {
  locales: ['en', 'th', 'ja', 'zh', 'ko'],
  defaultLocale: 'en',

  localeMetadata: {
    en: {
      name: 'English',
      title: 'Tanqory - Global E-commerce Platform',
      description: 'Shop millions of products with AI-powered recommendations. Free worldwide shipping.',
      currency: 'USD',
      region: 'US'
    },
    th: {
      name: 'ไทย',
      title: 'Tanqory - แพลตฟอร์มอีคอมเมิร์ซระดับโลก',
      description: 'ช้อปสินค้าหลายล้านชิ้นด้วย AI แนะนำผลิตภัณฑ์ ส่งฟรีทั่วโลก',
      currency: 'THB',
      region: 'TH'
    },
    ja: {
      name: '日本語',
      title: 'Tanqory - グローバルEコマースプラットフォーム',
      description: 'AI搭載の商品推薦で数百万の商品をショッピング。世界中で送料無料。',
      currency: 'JPY',
      region: 'JP'
    },
    zh: {
      name: '中文',
      title: 'Tanqory - 全球电商平台',
      description: '通过AI推荐购买数百万种产品。全球免费送货。',
      currency: 'CNY',
      region: 'CN'
    },
    ko: {
      name: '한국어',
      title: 'Tanqory - 글로벌 이커머스 플랫폼',
      description: 'AI 추천으로 수백만 개의 제품을 쇼핑하세요. 전 세계 무료 배송.',
      currency: 'KRW',
      region: 'KR'
    }
  }
};

// Generate hreflang tags
export function generateHreflangTags(pathname: string) {
  return i18nSEOConfig.locales.map(locale => ({
    hrefLang: locale,
    href: locale === i18nSEOConfig.defaultLocale
      ? `https://tanqory.com${pathname}`
      : `https://${locale}.tanqory.com${pathname}`
  }));
}

// Local business schema for different regions
export function generateLocalBusinessSchema(region: string) {
  const locations = {
    US: { lat: '37.7749', lng: '-122.4194', address: 'San Francisco, CA' },
    TH: { lat: '13.7563', lng: '100.5018', address: 'Bangkok, Thailand' },
    JP: { lat: '35.6762', lng: '139.6503', address: 'Tokyo, Japan' },
    CN: { lat: '31.2304', lng: '121.4737', address: 'Shanghai, China' },
    KR: { lat: '37.5665', lng: '126.9780', address: 'Seoul, South Korea' }
  };

  const location = locations[region as keyof typeof locations];
  if (!location) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `Tanqory ${region}`,
    address: location.address,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: location.lat,
      longitude: location.lng
    }
  };
}
```

### **Integration with Platform Ecosystem**
- **Backend SEO APIs**: Dynamic sitemap generation and structured data endpoints
- **Mobile App Deep Linking**: Universal links and app-specific meta tags
- **Desktop Integration**: Rich snippets for desktop search experiences
- **Analytics Unification**: Cross-platform SEO performance tracking
- **Content Management**: Headless CMS integration for SEO-optimized content
- **Performance Monitoring**: Real-time Core Web Vitals tracking and alerting

---

**Document Classification**: CONFIDENTIAL
**Technical Scope**: SEO, Next.js, Meta Tags, Structured Data, Core Web Vitals
**Platform Priority**: Critical (Traffic Acquisition)
**Review Cycle**: Weekly
**Last Updated**: September 16, 2025
**Version**: 2.0.0