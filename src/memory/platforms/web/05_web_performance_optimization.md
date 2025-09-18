---
title: Web Performance Optimization & Core Web Vitals Achievement
version: 2.0
owner: Performance Engineering Team + Frontend Architecture Team
last_reviewed: 2025-09-16
next_review: 2025-10-16
classification: CONFIDENTIAL
technical_scope: [Performance, Core_Web_Vitals, Bundle_Optimization, Next.js, TypeScript]
primary_stack: "Next.js + Webpack + SWC + Progressive Enhancement + CDN (see official technology versions)"
---

# Web Performance Optimization & Core Web Vitals Achievement

> **Platform Memory**: Enterprise-grade performance optimization framework achieving perfect Core Web Vitals scores and sub-second load times for billion-dollar e-commerce operations

## Core Web Vitals Achievement Strategy

### **Performance Philosophy & Targets**
```yaml
Core Web Vitals Targets:
  LCP (Largest Contentful Paint): <1.5s (target: 1.2s)
  FID (First Input Delay): <50ms (target: 30ms)
  CLS (Cumulative Layout Shift): <0.05 (target: 0.03)
  INP (Interaction to Next Paint): <100ms (target: 80ms)

Additional Performance Metrics:
  TTFB (Time to First Byte): <400ms
  FCP (First Contentful Paint): <1.2s
  TTI (Time to Interactive): <2.5s
  Speed Index: <2.0s

Performance Budget:
  First Load JS: <150KB gzipped
  Total Page Size: <500KB
  Image Optimization: WebP/AVIF + <100KB initial
  Font Loading: <50KB + display: swap
```

### **Bundle Optimization Strategies**
```typescript
// next.config.js - Advanced optimization configuration
const nextConfig = {
  // Production optimizations
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  // SWC compiler optimizations
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    reactRemoveProperties: process.env.NODE_ENV === 'production'
      ? { properties: ['^data-test'] }
      : false,
  },

  // Experimental optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      '@tanqory/ui-components',
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      'date-fns',
      'lodash-es'
    ],
    serverComponentsExternalPackages: [
      '@tanqory/server-utils',
      'sharp',
      'canvas'
    ],
    webVitalsAttribution: ['CLS', 'LCP', 'FCP', 'FID', 'INP'],
    instrumentationHook: true,
    ppr: true, // Partial Pre-rendering
  },

  // Advanced webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
    // Bundle analyzer in development
    if (!dev && !isServer) {
      const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
      if (process.env.ANALYZE) {
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            reportFilename: '../bundle-analysis.html'
          })
        );
      }
    }

    // Optimize chunks
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          // Vendor chunk for stable dependencies
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            chunks: 'all',
          },

          // UI components chunk
          ui: {
            test: /[\\/]components[\\/]ui[\\/]/,
            name: 'ui-components',
            priority: 20,
            chunks: 'all',
          },

          // Utils chunk
          utils: {
            test: /[\\/]lib[\\/]/,
            name: 'utils',
            priority: 15,
            chunks: 'all',
          }
        }
      },

      // Module concatenation
      concatenateModules: true,

      // Tree shaking optimization
      usedExports: true,
      providedExports: true,
      sideEffects: false,
    };

    // Compression plugins
    if (!dev) {
      const CompressionPlugin = require('compression-webpack-plugin');
      config.plugins.push(
        new CompressionPlugin({
          algorithm: 'gzip',
          test: /\.(js|css|html|svg)$/,
          threshold: 8192,
          minRatio: 0.8,
        }),
        new CompressionPlugin({
          algorithm: 'brotliCompress',
          test: /\.(js|css|html|svg)$/,
          compressionOptions: { level: 11 },
          threshold: 8192,
          minRatio: 0.8,
          filename: '[path][base].br',
        })
      );
    }

    return config;
  },

  // Image optimization
  images: {
    domains: ['cdn.tanqory.com', 'images.tanqory.com', 'static.tanqory.com'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",

    // Custom loader for advanced image optimization
    loader: 'custom',
    loaderFile: './lib/performance/image-loader.js',
  },

  // Headers for performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Preload critical resources
          {
            key: 'Link',
            value: [
              '</fonts/inter-var.woff2>; rel=preload; as=font; type=font/woff2; crossorigin=anonymous',
              '</css/critical.css>; rel=preload; as=style',
              '</js/critical.js>; rel=modulepreload',
            ].join(', ')
          },

          // Security and performance headers
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },

          // Cache control
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ],
      },

      // Static assets caching
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },

      // API routes caching
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400'
          }
        ]
      }
    ];
  },

  // Redirects with performance consideration
  async redirects() {
    return [
      // Remove trailing slashes for better caching
      {
        source: '/:path*/',
        destination: '/:path*',
        permanent: true,
      }
    ];
  },

  // Output optimization
  output: 'standalone',
  trailingSlash: false,
  generateEtags: false,

  // PWA optimization
  pwa: {
    dest: 'public',
    register: true,
    skipWaiting: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts',
          expiration: {
            maxEntries: 4,
            maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
          }
        }
      },
      {
        urlPattern: /^https:\/\/cdn\.tanqory\.com\/.*/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'tanqory-cdn',
          cacheKeyWillBeUsed: async ({ request }) => {
            return `${request.url}?v=${buildId}`;
          }
        }
      }
    ]
  }
};

module.exports = nextConfig;
```

### **Advanced Image & Asset Optimization**
```typescript
// lib/performance/image-optimization.ts
import sharp from 'sharp';
import { NextRequest, NextResponse } from 'next/server';

interface ImageOptimizationConfig {
  quality: number;
  format: 'webp' | 'avif' | 'jpeg' | 'png';
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

export class ImageOptimizer {
  // Advanced image transformation with multiple formats
  static async optimizeImage(
    input: Buffer | string,
    config: ImageOptimizationConfig
  ): Promise<{ buffer: Buffer; format: string; size: number }> {
    let pipeline = sharp(input);

    // Auto-orient images
    pipeline = pipeline.rotate();

    // Resize if dimensions provided
    if (config.width || config.height) {
      pipeline = pipeline.resize(config.width, config.height, {
        fit: config.fit || 'cover',
        withoutEnlargement: true
      });
    }

    // Format-specific optimizations
    switch (config.format) {
      case 'avif':
        pipeline = pipeline.avif({
          quality: config.quality,
          speed: 5, // Faster encoding
          chromaSubsampling: '4:2:0'
        });
        break;

      case 'webp':
        pipeline = pipeline.webp({
          quality: config.quality,
          effort: 6, // Better compression
          smartSubsample: true
        });
        break;

      case 'jpeg':
        pipeline = pipeline.jpeg({
          quality: config.quality,
          progressive: true,
          mozjpeg: true
        });
        break;

      case 'png':
        pipeline = pipeline.png({
          quality: config.quality,
          compressionLevel: 9,
          palette: true
        });
        break;
    }

    const buffer = await pipeline.toBuffer();

    return {
      buffer,
      format: config.format,
      size: buffer.length
    };
  }

  // Generate responsive image variants
  static async generateResponsiveImages(
    input: Buffer | string,
    baseConfig: Omit<ImageOptimizationConfig, 'width'>
  ): Promise<Array<{ width: number; buffer: Buffer; size: number }>> {
    const widths = [320, 640, 768, 1024, 1280, 1920];
    const variants = [];

    for (const width of widths) {
      const optimized = await this.optimizeImage(input, {
        ...baseConfig,
        width,
        quality: width <= 768 ? baseConfig.quality : Math.max(baseConfig.quality - 10, 60)
      });

      variants.push({
        width,
        buffer: optimized.buffer,
        size: optimized.size
      });
    }

    return variants;
  }

  // Smart format selection based on browser support
  static selectOptimalFormat(acceptHeader: string): 'avif' | 'webp' | 'jpeg' {
    if (acceptHeader.includes('image/avif')) return 'avif';
    if (acceptHeader.includes('image/webp')) return 'webp';
    return 'jpeg';
  }
}

// Smart Image Component with advanced optimization
interface SmartImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  sizes?: string;
  quality?: number;
  className?: string;
}

export function SmartImage({
  src,
  alt,
  width,
  height,
  priority = false,
  placeholder = 'blur',
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  quality = 85,
  className
}: SmartImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');

  // Generate optimized src URLs
  const generateSrcSet = (baseSrc: string) => {
    const widths = [320, 640, 768, 1024, 1280, 1920];
    return widths
      .map(w => `${baseSrc}?w=${w}&q=${quality}&f=webp ${w}w`)
      .join(', ');
  };

  // Progressive image loading
  useEffect(() => {
    const img = new Image();

    // Start with low quality placeholder
    const placeholder = `${src}?w=50&q=10&f=webp`;
    setCurrentSrc(placeholder);

    // Load high quality version
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoaded(true);
    };

    img.onerror = () => {
      setIsError(true);
    };

    img.src = src;
  }, [src]);

  if (isError) {
    return (
      <div
        className={cn('bg-gray-200 flex items-center justify-center', className)}
        style={{ aspectRatio: `${width}/${height}` }}
      >
        <span className="text-gray-400 text-sm">Image unavailable</span>
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <Image
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        placeholder={placeholder}
        sizes={sizes}
        srcSet={generateSrcSet(src)}
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-70'
        )}
        onLoad={() => setIsLoaded(true)}
        onError={() => setIsError(true)}
      />

      {/* Loading skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
      )}
    </div>
  );
}

// Asset preloading utilities
export class AssetPreloader {
  private static preloadedAssets = new Set<string>();

  static preloadCriticalAssets() {
    const criticalAssets = [
      { href: '/fonts/inter-var.woff2', as: 'font', type: 'font/woff2' },
      { href: '/css/critical.css', as: 'style' },
      { href: '/images/hero-banner.webp', as: 'image' },
    ];

    criticalAssets.forEach(asset => {
      if (!this.preloadedAssets.has(asset.href)) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = asset.href;
        link.as = asset.as;
        if (asset.type) link.type = asset.type;
        if (asset.as === 'font') link.crossOrigin = 'anonymous';

        document.head.appendChild(link);
        this.preloadedAssets.add(asset.href);
      }
    });
  }

  static preloadRoute(href: string) {
    if (!this.preloadedAssets.has(href)) {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      document.head.appendChild(link);
      this.preloadedAssets.add(href);
    }
  }

  static preconnectToDomains() {
    const domains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://cdn.tanqory.com',
      'https://api.tanqory.com'
    ];

    domains.forEach(domain => {
      if (!this.preloadedAssets.has(domain)) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = domain;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
        this.preloadedAssets.add(domain);
      }
    });
  }
}
```

### **Caching Strategies & CDN Integration**
```typescript
// lib/performance/caching.ts
import { NextRequest, NextResponse } from 'next/server';
import { Redis } from 'ioredis';

interface CacheConfig {
  ttl: number; // Time to live in seconds
  staleWhileRevalidate?: number;
  tags?: string[];
  vary?: string[];
}

export class PerformanceCaching {
  private static redis = new Redis(process.env.REDIS_URL!);

  // Multi-layer caching strategy
  static async getWithCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    config: CacheConfig
  ): Promise<T> {
    // Layer 1: Memory cache (fastest)
    if (PerformanceCaching.memoryCache.has(key)) {
      const cached = PerformanceCaching.memoryCache.get(key);
      if (cached && cached.expires > Date.now()) {
        return cached.data;
      }
    }

    // Layer 2: Redis cache (fast)
    const cached = await this.redis.get(key);
    if (cached) {
      const data = JSON.parse(cached);

      // Store in memory cache
      PerformanceCaching.memoryCache.set(key, {
        data,
        expires: Date.now() + (config.ttl * 1000)
      });

      return data;
    }

    // Layer 3: Fetch from source (slowest)
    const data = await fetcher();

    // Cache in all layers
    PerformanceCaching.memoryCache.set(key, {
      data,
      expires: Date.now() + (config.ttl * 1000)
    });

    await this.redis.setex(key, config.ttl, JSON.stringify(data));

    return data;
  }

  private static memoryCache = new Map<string, { data: any; expires: number }>();

  // CDN edge caching with smart invalidation
  static generateCacheHeaders(config: CacheConfig): Record<string, string> {
    const headers: Record<string, string> = {
      'Cache-Control': `public, max-age=${config.ttl}, s-maxage=${config.ttl * 2}`,
    };

    if (config.staleWhileRevalidate) {
      headers['Cache-Control'] += `, stale-while-revalidate=${config.staleWhileRevalidate}`;
    }

    if (config.vary) {
      headers['Vary'] = config.vary.join(', ');
    }

    if (config.tags) {
      headers['Cache-Tag'] = config.tags.join(', ');
    }

    return headers;
  }

  // Smart cache invalidation
  static async invalidateCache(tags: string[]) {
    // Invalidate memory cache
    for (const [key, value] of PerformanceCaching.memoryCache) {
      // Simple tag-based invalidation
      if (tags.some(tag => key.includes(tag))) {
        PerformanceCaching.memoryCache.delete(key);
      }
    }

    // Invalidate Redis cache
    const pattern = tags.map(tag => `*${tag}*`);
    for (const p of pattern) {
      const keys = await this.redis.keys(p);
      if (keys.length) {
        await this.redis.del(...keys);
      }
    }

    // Invalidate CDN cache (Cloudflare example)
    if (process.env.CLOUDFLARE_ZONE_ID && process.env.CLOUDFLARE_API_TOKEN) {
      await fetch(`https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/purge_cache`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tags })
      });
    }
  }
}

// Middleware for edge caching
export function cacheMiddleware(request: NextRequest) {
  const url = new URL(request.url);

  // API routes caching
  if (url.pathname.startsWith('/api/')) {
    const cacheHeaders = PerformanceCaching.generateCacheHeaders({
      ttl: 300, // 5 minutes
      staleWhileRevalidate: 3600, // 1 hour
      vary: ['Accept-Encoding', 'User-Agent'],
    });

    const response = NextResponse.next();
    Object.entries(cacheHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  }

  // Static assets caching
  if (url.pathname.startsWith('/_next/static/')) {
    const response = NextResponse.next();
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    );
    return response;
  }

  // Image optimization caching
  if (url.pathname.startsWith('/_next/image')) {
    const response = NextResponse.next();
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, stale-while-revalidate=86400'
    );
    return response;
  }

  return NextResponse.next();
}

// Service Worker for advanced caching
export const serviceWorkerConfig = `
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('tanqory-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/offline',
        '/fonts/inter-var.woff2',
        '/css/critical.css',
        '/js/critical.js',
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request).then((fetchResponse) => {
        // Cache successful responses
        if (fetchResponse.ok) {
          const responseClone = fetchResponse.clone();
          caches.open('tanqory-v1').then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return fetchResponse;
      });
    }).catch(() => {
      // Return offline page for navigation requests
      if (event.request.destination === 'document') {
        return caches.match('/offline');
      }
    })
  );
});
`;
```

### **Progressive Enhancement & Loading Strategies**
```typescript
// lib/performance/loading-strategies.ts
import { lazy, Suspense, ComponentType } from 'react';
import dynamic from 'next/dynamic';

// Advanced code splitting with loading strategies
export class LoadingStrategies {
  // Lazy load components with intelligent prefetching
  static createLazyComponent<T extends ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    options: {
      ssr?: boolean;
      loading?: ComponentType;
      strategy?: 'eager' | 'idle' | 'visible' | 'hover';
      preload?: boolean;
    } = {}
  ): ComponentType<any> {
    const {
      ssr = true,
      loading = LoadingStrategies.defaultLoading,
      strategy = 'visible',
      preload = false
    } = options;

    let dynamicComponent: ComponentType<any>;

    switch (strategy) {
      case 'eager':
        // Load immediately
        dynamicComponent = dynamic(importFn, {
          ssr,
          loading
        });
        break;

      case 'idle':
        // Load when browser is idle
        dynamicComponent = dynamic(
          () => new Promise((resolve) => {
            if ('requestIdleCallback' in window) {
              requestIdleCallback(() => resolve(importFn()));
            } else {
              setTimeout(() => resolve(importFn()), 0);
            }
          }),
          { ssr, loading }
        );
        break;

      case 'visible':
        // Load when component becomes visible
        dynamicComponent = dynamic(importFn, {
          ssr,
          loading,
          // Add intersection observer logic in the actual component
        });
        break;

      case 'hover':
        // Preload on hover, load on interaction
        dynamicComponent = dynamic(importFn, {
          ssr,
          loading,
        });
        break;

      default:
        dynamicComponent = dynamic(importFn, { ssr, loading });
    }

    return dynamicComponent;
  }

  // Default loading component
  static defaultLoading = () => (
    <div className="animate-pulse bg-gray-200 rounded-lg h-20 w-full" />
  );

  // Advanced loading skeleton generator
  static createLoadingSkeleton(type: 'card' | 'list' | 'hero' | 'grid') {
    const skeletons = {
      card: () => (
        <div className="animate-pulse">
          <div className="bg-gray-200 rounded-lg aspect-square mb-4" />
          <div className="space-y-2">
            <div className="bg-gray-200 rounded h-4 w-3/4" />
            <div className="bg-gray-200 rounded h-4 w-1/2" />
          </div>
        </div>
      ),

      list: () => (
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex space-x-4">
              <div className="bg-gray-200 rounded w-16 h-16" />
              <div className="flex-1 space-y-2">
                <div className="bg-gray-200 rounded h-4 w-3/4" />
                <div className="bg-gray-200 rounded h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ),

      hero: () => (
        <div className="animate-pulse">
          <div className="bg-gray-200 rounded-lg h-96 mb-6" />
          <div className="space-y-3">
            <div className="bg-gray-200 rounded h-6 w-1/2" />
            <div className="bg-gray-200 rounded h-4 w-3/4" />
            <div className="bg-gray-200 rounded h-4 w-2/3" />
          </div>
        </div>
      ),

      grid: () => (
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i}>
              <div className="bg-gray-200 rounded-lg aspect-square mb-3" />
              <div className="space-y-2">
                <div className="bg-gray-200 rounded h-4 w-3/4" />
                <div className="bg-gray-200 rounded h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )
    };

    return skeletons[type];
  }

  // Intersection Observer for lazy loading
  static useIntersectionObserver(
    ref: React.RefObject<Element>,
    options: IntersectionObserverInit = {}
  ): boolean {
    const [isIntersecting, setIsIntersecting] = useState(false);

    useEffect(() => {
      if (!ref.current) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          setIsIntersecting(entry.isIntersecting);
        },
        {
          threshold: 0.1,
          rootMargin: '50px',
          ...options
        }
      );

      observer.observe(ref.current);

      return () => observer.disconnect();
    }, [ref, options]);

    return isIntersecting;
  }

  // Resource hints injection
  static injectResourceHints() {
    useEffect(() => {
      // DNS prefetch
      const prefetchDomains = [
        'https://cdn.tanqory.com',
        'https://fonts.googleapis.com',
        'https://www.google-analytics.com'
      ];

      prefetchDomains.forEach(domain => {
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = domain;
        document.head.appendChild(link);
      });

      // Preconnect to critical domains
      const preconnectDomains = [
        'https://fonts.gstatic.com',
        'https://api.tanqory.com'
      ];

      preconnectDomains.forEach(domain => {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = domain;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      });
    }, []);
  }
}

// Advanced lazy loading component
interface LazyComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  strategy?: 'visible' | 'hover' | 'idle';
  offset?: number;
}

export function LazyComponent({
  children,
  fallback,
  strategy = 'visible',
  offset = 100
}: LazyComponentProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const isVisible = LoadingStrategies.useIntersectionObserver(ref, {
    rootMargin: `${offset}px`
  });

  useEffect(() => {
    switch (strategy) {
      case 'visible':
        if (isVisible) setShouldLoad(true);
        break;

      case 'idle':
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => setShouldLoad(true));
        } else {
          setTimeout(() => setShouldLoad(true), 100);
        }
        break;

      case 'hover':
        // Load on first interaction
        const handleInteraction = () => {
          setShouldLoad(true);
          document.removeEventListener('mouseover', handleInteraction);
          document.removeEventListener('touchstart', handleInteraction);
        };
        document.addEventListener('mouseover', handleInteraction);
        document.addEventListener('touchstart', handleInteraction);

        return () => {
          document.removeEventListener('mouseover', handleInteraction);
          document.removeEventListener('touchstart', handleInteraction);
        };

      default:
        setShouldLoad(true);
    }
  }, [strategy, isVisible]);

  return (
    <div ref={ref}>
      {shouldLoad ? children : fallback || <LoadingStrategies.defaultLoading />}
    </div>
  );
}
```

### **Performance Monitoring & Real-time Optimization**
```typescript
// lib/performance/monitoring.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB, onINP, type Metric } from 'web-vitals';

export class PerformanceMonitor {
  private static metrics: Map<string, number> = new Map();
  private static observers: PerformanceObserver[] = [];

  // Initialize comprehensive performance monitoring
  static init() {
    // Core Web Vitals monitoring
    getCLS(this.handleMetric.bind(this));
    getFID(this.handleMetric.bind(this));
    getFCP(this.handleMetric.bind(this));
    getLCP(this.handleMetric.bind(this));
    getTTFB(this.handleMetric.bind(this));
    onINP(this.handleMetric.bind(this));

    // Custom performance observers
    this.observeNavigationTiming();
    this.observeResourceTiming();
    this.observeLongTasks();
    this.observeMemoryUsage();
  }

  private static handleMetric(metric: Metric) {
    this.metrics.set(metric.name, metric.value);

    // Real-time performance alerting
    this.checkPerformanceThresholds(metric);

    // Send to analytics
    this.sendToAnalytics(metric);

    // Trigger optimizations if needed
    this.triggerOptimizations(metric);
  }

  private static checkPerformanceThresholds(metric: Metric) {
    const thresholds = {
      LCP: 1500, // 1.5s target
      FID: 50,   // 50ms target
      CLS: 0.05, // 0.05 target
      INP: 80,   // 80ms target
      FCP: 1200, // 1.2s target
      TTFB: 400  // 400ms target
    };

    const threshold = thresholds[metric.name as keyof typeof thresholds];
    if (threshold && metric.value > threshold) {
      console.warn(`⚠️ Performance Issue: ${metric.name} = ${metric.value}ms (threshold: ${threshold}ms)`);

      // Send alert to monitoring system
      this.sendPerformanceAlert({
        metric: metric.name,
        value: metric.value,
        threshold,
        severity: this.calculateSeverity(metric.value, threshold),
        url: window.location.href,
        timestamp: Date.now()
      });
    }
  }

  private static calculateSeverity(value: number, threshold: number): 'low' | 'medium' | 'high' {
    const ratio = value / threshold;
    if (ratio > 2) return 'high';
    if (ratio > 1.5) return 'medium';
    return 'low';
  }

  private static async sendPerformanceAlert(alert: any) {
    try {
      await fetch('/api/monitoring/performance-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert)
      });
    } catch (error) {
      console.error('Failed to send performance alert:', error);
    }
  }

  private static sendToAnalytics(metric: Metric) {
    // Send to Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', metric.name, {
        custom_parameter_value: Math.round(
          metric.name === 'CLS' ? metric.value * 1000 : metric.value
        ),
        metric_id: metric.id,
        metric_value: metric.value,
        metric_delta: metric.delta,
      });
    }

    // Send to custom analytics endpoint
    fetch('/api/analytics/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metric: metric.name,
        value: metric.value,
        id: metric.id,
        delta: metric.delta,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      })
    }).catch(error => {
      console.error('Failed to send performance data:', error);
    });
  }

  private static triggerOptimizations(metric: Metric) {
    // Auto-optimization based on metrics
    switch (metric.name) {
      case 'LCP':
        if (metric.value > 2000) {
          // Preload critical resources
          AssetPreloader.preloadCriticalAssets();
        }
        break;

      case 'FID':
        if (metric.value > 100) {
          // Defer non-critical JavaScript
          this.deferNonCriticalScripts();
        }
        break;

      case 'CLS':
        if (metric.value > 0.1) {
          // Add size attributes to images without dimensions
          this.fixLayoutShift();
        }
        break;
    }
  }

  private static deferNonCriticalScripts() {
    const scripts = document.querySelectorAll('script[data-defer]');
    scripts.forEach(script => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          const newScript = document.createElement('script');
          newScript.src = script.getAttribute('src')!;
          newScript.async = true;
          document.head.appendChild(newScript);
        });
      }
    });
  }

  private static fixLayoutShift() {
    // Add dimensions to images without explicit sizes
    const images = document.querySelectorAll('img:not([width]):not([height])');
    images.forEach((img: HTMLImageElement) => {
      if (img.naturalWidth && img.naturalHeight) {
        img.width = img.naturalWidth;
        img.height = img.naturalHeight;
      }
    });
  }

  private static observeNavigationTiming() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries() as PerformanceNavigationTiming[];
        entries.forEach(entry => {
          this.metrics.set('domContentLoaded', entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart);
          this.metrics.set('loadComplete', entry.loadEventEnd - entry.loadEventStart);
          this.metrics.set('dnsLookup', entry.domainLookupEnd - entry.domainLookupStart);
          this.metrics.set('tcpConnect', entry.connectEnd - entry.connectStart);
        });
      });

      observer.observe({ entryTypes: ['navigation'] });
      this.observers.push(observer);
    }
  }

  private static observeResourceTiming() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries() as PerformanceResourceTiming[];

        // Track slow resources
        const slowResources = entries.filter(entry => entry.duration > 1000);
        slowResources.forEach(resource => {
          console.warn(`Slow resource detected: ${resource.name} took ${resource.duration}ms`);
        });

        // Track resource sizes
        const totalSize = entries.reduce((sum, entry) => {
          return sum + (entry.transferSize || 0);
        }, 0);

        this.metrics.set('totalResourceSize', totalSize);
      });

      observer.observe({ entryTypes: ['resource'] });
      this.observers.push(observer);
    }
  }

  private static observeLongTasks() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          console.warn(`Long task detected: ${entry.duration}ms`);
          this.sendPerformanceAlert({
            metric: 'long-task',
            value: entry.duration,
            threshold: 50,
            severity: 'medium',
            url: window.location.href,
            timestamp: Date.now()
          });
        });
      });

      observer.observe({ entryTypes: ['longtask'] });
      this.observers.push(observer);
    }
  }

  private static observeMemoryUsage() {
    if ('memory' in performance) {
      const checkMemory = () => {
        const memory = (performance as any).memory;
        const memoryUsage = {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit
        };

        this.metrics.set('memoryUsed', memoryUsage.used);
        this.metrics.set('memoryTotal', memoryUsage.total);

        // Alert on high memory usage
        const usagePercent = (memoryUsage.used / memoryUsage.total) * 100;
        if (usagePercent > 80) {
          console.warn(`High memory usage: ${usagePercent.toFixed(2)}%`);
        }
      };

      setInterval(checkMemory, 10000); // Check every 10 seconds
    }
  }

  // Generate performance report
  static generatePerformanceReport(): PerformanceReport {
    return {
      coreWebVitals: {
        lcp: this.metrics.get('LCP') || 0,
        fid: this.metrics.get('FID') || 0,
        cls: this.metrics.get('CLS') || 0,
        inp: this.metrics.get('INP') || 0,
      },
      additionalMetrics: {
        fcp: this.metrics.get('FCP') || 0,
        ttfb: this.metrics.get('TTFB') || 0,
        domContentLoaded: this.metrics.get('domContentLoaded') || 0,
        loadComplete: this.metrics.get('loadComplete') || 0,
      },
      networkMetrics: {
        dnsLookup: this.metrics.get('dnsLookup') || 0,
        tcpConnect: this.metrics.get('tcpConnect') || 0,
        totalResourceSize: this.metrics.get('totalResourceSize') || 0,
      },
      memoryMetrics: {
        used: this.metrics.get('memoryUsed') || 0,
        total: this.metrics.get('memoryTotal') || 0,
      },
      timestamp: Date.now(),
      url: window.location.href,
    };
  }

  // Cleanup observers
  static cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics.clear();
  }
}

interface PerformanceReport {
  coreWebVitals: {
    lcp: number;
    fid: number;
    cls: number;
    inp: number;
  };
  additionalMetrics: {
    fcp: number;
    ttfb: number;
    domContentLoaded: number;
    loadComplete: number;
  };
  networkMetrics: {
    dnsLookup: number;
    tcpConnect: number;
    totalResourceSize: number;
  };
  memoryMetrics: {
    used: number;
    total: number;
  };
  timestamp: number;
  url: string;
}

// Performance monitoring hook
export function usePerformanceMonitoring() {
  useEffect(() => {
    PerformanceMonitor.init();

    // Send periodic performance reports
    const interval = setInterval(() => {
      const report = PerformanceMonitor.generatePerformanceReport();
      console.log('Performance Report:', report);
    }, 30000); // Every 30 seconds

    return () => {
      clearInterval(interval);
      PerformanceMonitor.cleanup();
    };
  }, []);

  return {
    getMetrics: () => PerformanceMonitor.generatePerformanceReport(),
  };
}
```

### **Integration with Platform Ecosystem**
- **Backend Performance APIs**: Real-time performance metric collection and analysis
- **Mobile App Consistency**: Shared performance budgets and optimization strategies
- **Desktop Integration**: Native performance monitoring and resource management
- **Analytics Unification**: Cross-platform performance tracking and alerting
- **CDN Optimization**: Intelligent edge caching and content delivery strategies
- **Monitoring Integration**: Real-time performance dashboards and automated optimization triggers

---

**Document Classification**: CONFIDENTIAL
**Technical Scope**: Performance, Core Web Vitals, Bundle Optimization, Next.js, TypeScript
**Platform Priority**: Critical (User Experience & Revenue)
**Review Cycle**: Weekly
**Last Updated**: September 16, 2025
**Version**: 2.0.0