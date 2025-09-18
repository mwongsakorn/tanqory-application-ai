---
title: Web Development Standards & Next.js Architecture
version: 2.0
owner: Frontend Architecture Team
last_reviewed: 2025-09-16
next_review: 2025-10-16
classification: CONFIDENTIAL
technical_scope: [Next.js, React, TypeScript, Web_Platform]
primary_stack: "Next.js App Router + React + TypeScript (see official technology versions)"
---

# Web Development Standards & Next.js Architecture

> **Platform Memory**: Enterprise-grade web development standards for Next.js and React applications supporting billion-dollar scale operations

## Primary Web Technology Stack

### **Core Web Platform Stack**

> **Technology Versions**: For specific version requirements, see [`memory/core/00_official_technology_versions.md`](../../core/00_official_technology_versions.md)

```yaml
# For complete technology stack and versions, see:
# memory/core/00_official_technology_versions.md

Primary Framework: Next.js (see official versions)
UI Library: React (see official versions)
Language: TypeScript (see official versions)
Runtime: Node.js (see official versions)
Styling: Tailwind CSS + CSS Modules
State Management: Zustand + TanStack Query
Testing: Jest + Testing Library + Playwright
Deployment: Vercel Edge + Cloudflare Workers
Monitoring: Sentry (primary) + Web Vitals
```

### **Web Platform Architecture**
```typescript
// Next.js App Router Configuration
// app/layout.tsx
import { TanqoryWebProvider } from '@tanqory/web-sdk';
import { Metadata, Viewport } from 'next';
import { Inter, Noto_Sans_Thai } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai'],
  display: 'swap',
  variable: '--font-noto-thai'
});

export const metadata: Metadata = {
  title: {
    template: '%s | Tanqory',
    default: 'Tanqory - Global E-commerce Platform'
  },
  description: 'AI-first e-commerce platform supporting billion-dollar operations across 8 platforms',
  keywords: ['e-commerce', 'AI', 'global', 'platform', 'multi-platform'],
  authors: [{ name: 'Tanqory Engineering Team' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['th_TH', 'ja_JP', 'zh_CN', 'ko_KR'],
    siteName: 'Tanqory',
    images: ['/og-image-1200x630.png']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  }
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' }
  ],
  colorScheme: 'dark light',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${notoSansThai.variable}`}
    >
      <body className="font-sans antialiased">
        <TanqoryWebProvider
          config={{
            apiEndpoint: process.env.NEXT_PUBLIC_API_URL,
            enableAnalytics: true,
            enablePerformanceMonitoring: true,
            theme: 'system',
            i18n: {
              defaultLocale: 'en',
              locales: ['en', 'th', 'ja', 'zh', 'ko']
            }
          }}
        >
          {children}
        </TanqoryWebProvider>
      </body>
    </html>
  );
}
```

### **Web Platform Technical Requirements**

#### **Performance Standards**
- ✅ Core Web Vitals compliance (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- ✅ Lighthouse score 95+ (Performance, Accessibility, Best Practices, SEO)
- ✅ Bundle size < 200KB gzipped (First Load JS)
- ✅ Time to Interactive (TTI) < 3s on 3G networks
- ✅ Server Components for data fetching and static content
- ✅ Client Components for interactive features only

#### **SEO & Accessibility**
- ✅ WCAG 2.1 AA compliance across all components
- ✅ Structured data (JSON-LD) for rich search results
- ✅ Multi-language support with proper hreflang tags
- ✅ Progressive Web App (PWA) capabilities
- ✅ Open Graph and Twitter Card optimization
- ✅ Sitemap generation and robots.txt optimization

#### **Security Standards**
- ✅ Content Security Policy (CSP) headers
- ✅ HTTPS enforcement with HSTS
- ✅ XSS protection and input sanitization
- ✅ CSRF protection for forms and mutations
- ✅ Rate limiting for API routes
- ✅ Environment variable security (no client-side secrets)

### **State Management Architecture**
```typescript
// Web-specific state management
// stores/web-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface WebAppState {
  // UI State
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  searchQuery: string;
  filters: ProductFilters;

  // User Preferences
  layout: 'grid' | 'list';
  itemsPerPage: 12 | 24 | 48;
  currency: SupportedCurrency;
  language: SupportedLanguage;

  // Navigation State
  currentCategory: string | null;
  breadcrumbs: Breadcrumb[];
  searchHistory: string[];

  // Actions
  setTheme: (theme: ThemeMode) => void;
  toggleSidebar: () => void;
  updateFilters: (filters: Partial<ProductFilters>) => void;
  setLayout: (layout: 'grid' | 'list') => void;
  addToSearchHistory: (query: string) => void;
}

export const useWebStore = create<WebAppState>()(n  persist(
    immer((set, get) => ({
      // Initial state
      theme: 'system',
      sidebarOpen: false,
      searchQuery: '',
      filters: {},
      layout: 'grid',
      itemsPerPage: 24,
      currency: 'USD',
      language: 'en',
      currentCategory: null,
      breadcrumbs: [],
      searchHistory: [],

      // Actions
      setTheme: (theme) => set((state) => {
        state.theme = theme;
      }),

      toggleSidebar: () => set((state) => {
        state.sidebarOpen = !state.sidebarOpen;
      }),

      updateFilters: (newFilters) => set((state) => {
        state.filters = { ...state.filters, ...newFilters };
      }),

      setLayout: (layout) => set((state) => {
        state.layout = layout;
      }),

      addToSearchHistory: (query) => set((state) => {
        if (!state.searchHistory.includes(query)) {
          state.searchHistory.unshift(query);
          // Keep only last 10 searches
          state.searchHistory = state.searchHistory.slice(0, 10);
        }
      }),
    })),
    {
      name: 'tanqory-web-preferences',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        layout: state.layout,
        itemsPerPage: state.itemsPerPage,
        currency: state.currency,
        language: state.language,
        searchHistory: state.searchHistory
      })
    }
  )
);
```

### **Component Architecture Standards**
```typescript
// components/ui/product-card.tsx
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import { trackEvent } from '@/lib/analytics';

interface ProductCardProps {
  product: Product;
  layout: 'grid' | 'list';
  priority?: boolean; // For image loading optimization
  onProductClick?: (product: Product) => void;
}

export function ProductCard({
  product,
  layout,
  priority = false,
  onProductClick
}: ProductCardProps) {
  const { addToCart, isInCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    trackEvent('add_to_cart', {
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      category: product.category
    });
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      trackEvent('remove_from_wishlist', { product_id: product.id });
    } else {
      addToWishlist(product);
      trackEvent('add_to_wishlist', { product_id: product.id });
    }
  };

  const handleProductClick = () => {
    onProductClick?.(product);
    trackEvent('product_view', {
      product_id: product.id,
      product_name: product.name,
      category: product.category,
      view_context: layout
    });
  };

  return (
    <Card
      className={cn(
        'group cursor-pointer transition-all hover:shadow-lg',
        layout === 'list' && 'flex-row'
      )}
      onClick={handleProductClick}
    >
      <div className="relative overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          width={layout === 'grid' ? 300 : 200}
          height={layout === 'grid' ? 300 : 200}
          className="aspect-square object-cover transition-transform group-hover:scale-105"
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
        />

        {product.discount > 0 && (
          <Badge className="absolute top-2 left-2 bg-red-500">
            -{product.discount}%
          </Badge>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleWishlistToggle}
          aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={cn(
              'h-4 w-4',
              isInWishlist(product.id) && 'fill-red-500 text-red-500'
            )}
          />
        </Button>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold line-clamp-2 mb-2">{product.name}</h3>

        <div className="flex items-center gap-1 mb-2">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm text-gray-600">
            {product.rating} ({product.reviewCount} reviews)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">
            {formatCurrency(product.price)}
          </span>
          {product.originalPrice > product.price && (
            <span className="text-sm text-gray-500 line-through">
              {formatCurrency(product.originalPrice)}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          onClick={handleAddToCart}
          className="w-full"
          disabled={isInCart(product.id)}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {isInCart(product.id) ? 'In Cart' : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  );
}
```

### **API Integration Patterns**
```typescript
// lib/api/products.ts
import { TanqoryApiClient } from '@tanqory/api-client';
import { cache } from 'react';

const apiClient = new TanqoryApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL!,
  platform: 'web'
});

// Server Component data fetching (cached)
export const getProducts = cache(async (
  params: GetProductsParams
): Promise<PaginatedResponse<Product>> => {
  return apiClient.get('/products', { params });
});

export const getProduct = cache(async (
  id: string
): Promise<Product> => {
  return apiClient.get(`/products/${id}`);
});

// Client-side data fetching with TanStack Query
export function useProducts(params: GetProductsParams) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => apiClient.get('/products', { params }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => apiClient.get(`/products/${id}`),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
```

### **Deployment & Infrastructure**
```yaml
# next.config.js optimizations
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverComponentsExternalPackages: ['@tanqory/server-utils'],
    optimizePackageImports: ['@tanqory/ui-components', 'lucide-react']
  },

  images: {
    domains: ['cdn.tanqory.com', 'images.tanqory.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  },

  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: cspHeader.replace(/\n/g, '')
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains; preload'
        }
      ]
    }
  ],

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false
      };
    }
    return config;
  }
};
```

### **Dev Portal Integration**

#### **Mini App Development Portal**
```typescript
// Dev Portal for Mini App management
class DevPortalManager {
    private apiClient: DevPortalAPIClient;
    private miniAppRegistry: MiniAppRegistry;
    private reviewSystem: ReviewSystem;

    constructor() {
        this.apiClient = new DevPortalAPIClient();
        this.miniAppRegistry = new MiniAppRegistry();
        this.reviewSystem = new ReviewSystem();
    }

    async uploadMiniApp(packageFile: File, metadata: MiniAppMetadata): Promise<UploadResult> {
        // Validate package format (.mpkg)
        const validation = await this.validatePackage(packageFile);
        if (!validation.valid) {
            throw new Error(`Package validation failed: ${validation.errors.join(', ')}`);
        }

        // Upload to storage
        const uploadUrl = await this.apiClient.getUploadUrl(metadata.appId);
        const uploadResult = await this.uploadPackage(uploadUrl, packageFile);

        // Register in system
        const registration = await this.miniAppRegistry.register({
            ...metadata,
            packageUrl: uploadResult.url,
            version: metadata.version,
            uploadedAt: new Date().toISOString()
        });

        // Submit for review
        const reviewId = await this.reviewSystem.submitForReview(registration.id);

        return {
            success: true,
            appId: metadata.appId,
            version: metadata.version,
            reviewId,
            status: 'pending_review'
        };
    }

    async getMiniAppAnalytics(appId: string, timeRange: TimeRange): Promise<MiniAppAnalytics> {
        return {
            installs: await this.getInstallMetrics(appId, timeRange),
            usage: await this.getUsageMetrics(appId, timeRange),
            performance: await this.getPerformanceMetrics(appId, timeRange),
            crashes: await this.getCrashMetrics(appId, timeRange),
            reviews: await this.getReviewMetrics(appId, timeRange)
        };
    }
}
```

#### **Developer Dashboard**
```typescript
// Developer dashboard for Mini App management
export default function DeveloperDashboard() {
    const { user } = useAuth();
    const { data: apps } = useQuery('developer-apps', () =>
        devPortalAPI.getApps(user.id)
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Developer Dashboard</h1>
                <p className="text-gray-600">Manage your Mini Apps and track performance</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                    title="Total Apps"
                    value={apps?.length || 0}
                    icon={<Package className="h-6 w-6" />}
                />
                <StatsCard
                    title="Active Users"
                    value="12.5K"
                    icon={<Users className="h-6 w-6" />}
                />
                <StatsCard
                    title="Monthly Revenue"
                    value="$2,340"
                    icon={<DollarSign className="h-6 w-6" />}
                />
                <StatsCard
                    title="Avg Rating"
                    value="4.8"
                    icon={<Star className="h-6 w-6" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Mini Apps</CardTitle>
                            <Button asChild>
                                <Link href="/dev-portal/new-app">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create New App
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <MiniAppsList apps={apps} />
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ActivityFeed />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
```

#### **Mini App Hosting System**
```typescript
// Mini App hosting and distribution
class MiniAppHostingManager {
    private cdnManager: CDNManager;
    private versionManager: VersionManager;
    private rolloutManager: RolloutManager;

    constructor() {
        this.cdnManager = new CDNManager();
        this.versionManager = new VersionManager();
        this.rolloutManager = new RolloutManager();
    }

    async deployMiniApp(appId: string, version: string, packageData: ArrayBuffer): Promise<DeployResult> {
        try {
            // Extract and validate package
            const extractedFiles = await this.extractMPKGPackage(packageData);

            // Deploy to CDN
            const deploymentUrls = await this.cdnManager.deploy(appId, version, extractedFiles);

            // Update version registry
            await this.versionManager.registerVersion(appId, version, {
                deploymentUrls,
                deployedAt: new Date().toISOString(),
                status: 'deployed'
            });

            // Initialize rollout
            const rolloutConfig = await this.createRolloutConfig(appId, version);
            await this.rolloutManager.startRollout(appId, rolloutConfig);

            return {
                success: true,
                appId,
                version,
                deploymentUrls,
                rolloutId: rolloutConfig.id
            };

        } catch (error) {
            console.error(`Deployment failed for ${appId}@${version}:`, error);
            throw error;
        }
    }

    async serveMiniApp(appId: string, platform: string, userAgent: string): Promise<MiniAppBundle> {
        // Determine appropriate version based on rollout
        const version = await this.rolloutManager.getVersionForUser(appId, userAgent);

        // Get platform-specific bundle
        const bundle = await this.versionManager.getBundle(appId, version, platform);

        if (!bundle) {
            throw new Error(`No bundle found for ${appId}@${version} on ${platform}`);
        }

        return bundle;
    }

    private async createRolloutConfig(appId: string, version: string): Promise<RolloutConfig> {
        return {
            id: generateRolloutId(),
            appId,
            version,
            phases: [
                { percentage: 5, duration: 24 * 60 * 60 * 1000 },   // 5% for 24h
                { percentage: 25, duration: 48 * 60 * 60 * 1000 },  // 25% for 48h
                { percentage: 100, duration: 0 }                     // 100% indefinitely
            ],
            startTime: Date.now(),
            status: 'active'
        };
    }
}
```

#### **Review and Approval System**
```typescript
// Mini App review system
class MiniAppReviewSystem {
    private reviewQueue: ReviewQueue;
    private automatedChecks: AutomatedChecks;
    private humanReviewers: ReviewerPool;

    constructor() {
        this.reviewQueue = new ReviewQueue();
        this.automatedChecks = new AutomatedChecks();
        this.humanReviewers = new ReviewerPool();
    }

    async submitForReview(appId: string, version: string): Promise<ReviewSubmission> {
        const submission: ReviewSubmission = {
            id: generateReviewId(),
            appId,
            version,
            submittedAt: new Date().toISOString(),
            status: 'pending',
            automatedChecks: [],
            humanReviews: []
        };

        // Run automated checks first
        const automatedResults = await this.runAutomatedChecks(appId, version);
        submission.automatedChecks = automatedResults;

        // If automated checks pass, queue for human review
        if (automatedResults.every(check => check.passed)) {
            await this.reviewQueue.add(submission);
            submission.status = 'queued_for_review';
        } else {
            submission.status = 'failed_automated_checks';
        }

        return submission;
    }

    private async runAutomatedChecks(appId: string, version: string): Promise<AutomatedCheck[]> {
        const checks: AutomatedCheck[] = [];

        // Security checks
        checks.push(await this.automatedChecks.runSecurityScan(appId, version));

        // Performance checks
        checks.push(await this.automatedChecks.runPerformanceTest(appId, version));

        // Manifest validation
        checks.push(await this.automatedChecks.validateManifest(appId, version));

        // Content policy checks
        checks.push(await this.automatedChecks.runContentScan(appId, version));

        // API usage validation
        checks.push(await this.automatedChecks.validateAPIUsage(appId, version));

        return checks;
    }

    async processReview(reviewId: string): Promise<ReviewResult> {
        const submission = await this.reviewQueue.get(reviewId);
        if (!submission) {
            throw new Error(`Review submission ${reviewId} not found`);
        }

        // Assign to available reviewer
        const reviewer = await this.humanReviewers.assignReviewer(submission);

        // Conduct human review
        const humanReview = await this.conductHumanReview(submission, reviewer);

        // Make final decision
        const decision = this.makeFinalDecision(submission.automatedChecks, [humanReview]);

        // Update submission status
        await this.updateSubmissionStatus(reviewId, decision);

        return {
            reviewId,
            appId: submission.appId,
            version: submission.version,
            decision: decision.status,
            feedback: decision.feedback,
            reviewedAt: new Date().toISOString()
        };
    }
}
```

### **Configuration Management**
```typescript
// Remote configuration for Mini Apps and feature flags
class WebConfigurationManager {
    private configCache: Map<string, ConfigValue> = new Map();
    private wsConnection: WebSocket | null = null;
    private updateCallbacks: Map<string, Function[]> = new Map();

    constructor() {
        this.setupRealtimeUpdates();
    }

    private setupRealtimeUpdates(): void {
        this.wsConnection = new WebSocket(
            `${process.env.NEXT_PUBLIC_WS_URL}/config-updates`
        );

        this.wsConnection.onmessage = (event) => {
            const update = JSON.parse(event.data);
            this.handleConfigUpdate(update);
        };
    }

    async getConfig(key: string, defaultValue?: any): Promise<any> {
        // Check cache first
        if (this.configCache.has(key)) {
            const cached = this.configCache.get(key)!;
            if (Date.now() - cached.timestamp < 5 * 60 * 1000) { // 5 minute cache
                return cached.value;
            }
        }

        // Fetch from server
        try {
            const response = await fetch(`/api/config/${key}`);
            const config = await response.json();

            // Cache the value
            this.configCache.set(key, {
                value: config.value,
                timestamp: Date.now()
            });

            return config.value;
        } catch (error) {
            return defaultValue;
        }
    }

    async getMiniAppConfig(appId: string): Promise<MiniAppConfig> {
        return this.getConfig(`miniapp:${appId}`, {
            enabled: true,
            version: 'latest',
            rolloutPercentage: 100
        });
    }

    subscribeToUpdates(key: string, callback: (value: any) => void): () => void {
        if (!this.updateCallbacks.has(key)) {
            this.updateCallbacks.set(key, []);
        }

        this.updateCallbacks.get(key)!.push(callback);

        // Return unsubscribe function
        return () => {
            const callbacks = this.updateCallbacks.get(key) || [];
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        };
    }

    private handleConfigUpdate(update: ConfigUpdate): void {
        const { key, value } = update;

        // Update cache
        this.configCache.set(key, {
            value,
            timestamp: Date.now()
        });

        // Notify subscribers
        const callbacks = this.updateCallbacks.get(key) || [];
        callbacks.forEach(callback => callback(value));
    }
}
```

### **Integration with Platform Ecosystem**
- **Backend Integration**: REST APIs (Primary) + GraphQL subscriptions (Real-time features only)
- **Mobile Synchronization**: Shared state via WebSocket + Server-Sent Events
- **Desktop Integration**: Electron bridge for native features
- **Mini App Ecosystem**: Dev Portal + hosting + distribution system
- **Super App Integration**: Mini App runtime for web browsers
- **TV/Wearable Integration**: Responsive design + companion experiences
- **Analytics**: Unified tracking across all platforms
- **Authentication**: OAuth 2.0 + JWT with platform-specific adapters
- **Payment Processing**: Stripe + PayPal + regional payment gateways

---

**Document Classification**: CONFIDENTIAL
**Technical Scope**: Next.js, React, TypeScript, Web Platform
**Platform Priority**: Primary (Revenue-generating)
**Review Cycle**: Monthly
**Last Updated**: September 16, 2025
**Version**: 2.0.0