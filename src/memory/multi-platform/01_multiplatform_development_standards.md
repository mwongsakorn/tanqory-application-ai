# 01. Multi-Platform Development Standards / มาตรฐานการพัฒนาแพลตฟอร์มหลากหลาย

> **Multi-Platform Memory**: Comprehensive development standards for 8 target platforms supporting global billion-dollar scale operations.
>
> **ความเป็นเยี่ยมแพลตฟอร์มหลากหลาย**: มาตรฐานการพัฒนาที่ครอบคลุมสำหรับ 8 แพลตฟอร์มเป้าหมายรองรับการดำเนินงานระดับพันล้านทั่วโลก

## Platform Architecture Overview

### **Core Platform Matrix**
```
┌─────────────────────────────────────────────────────────────────┐
│                    TANQORY PLATFORM ECOSYSTEM                  │
├─────────────────────────────────────────────────────────────────┤
│ Web Platform       │ Next.js (App Router + Server Actions)     │
│ Mobile Platform    │ React Native (New Architecture)           │
│ Desktop Platform   │ Electron (Security Hardened)              │
│ Vision Platform    │ visionOS (Spatial Computing)              │
│ TV Platform        │ tvOS / Tizen / webOS                      │
│ Watch Platform     │ watchOS / Wear OS                         │
│ Car Platform       │ Android Auto / Apple CarPlay              │
│ Backend Platform   │ Node.js / Deno (Microservices)            │
└─────────────────────────────────────────────────────────────────┘
```

### **Tanqory Unified Technology Stack (OFFICIAL)**

> **Official Technology Versions**: All version specifications are centrally managed in [`memory/core/00_official_technology_versions.md`](../core/00_official_technology_versions.md)

This document focuses on **platform-specific implementations and configurations**. For exact versions, compatibility matrices, and update schedules, always reference the official technology versions registry.

CORE_FOUNDATION:
  primary_language: "TypeScript (Strict mode across all platforms)"
  runtime_backend: "Node.js LTS (Primary) | Deno | Bun (Alternatives)"
  compilation_target: "ES2022+ with platform-specific transpilation"
  package_management: "npm workspaces (monorepos) | pnpm (performance-critical)"

PLATFORM_SPECIFIC_STACKS:
  web_platform:
    framework: "Next.js (App Router + Server Components)"
    styling: "Tailwind CSS + CSS Modules"
    state: "Zustand + TanStack Query"
    testing: "Jest + Testing Library + Playwright E2E"
    deployment: "Vercel Edge + Cloudflare Workers"

  mobile_platform:
    framework: "React Native (New Architecture - Fabric + TurboModules)"
    development: "Expo (Development builds + EAS)"
    state: "Zustand + AsyncStorage + WatermelonDB (Offline)"
    testing: "Jest + React Native Testing Library + Detox E2E"
    deployment: "EAS Build + App Store Connect + Google Play Console"

  desktop_platform:
    framework: "Electron (Security Hardened)"
    ui_layer: "React + Electron-specific components"
    state: "Zustand + Electron Store"
    testing: "Jest + Spectron + Playwright (Cross-platform)"
    deployment: "Electron Builder + Auto-updater + Code signing"

  vision_platform:
    framework: "SwiftUI + RealityKit (visionOS)"
    spatial_computing: "ARKit + Hand tracking + Eye tracking"
    state: "SwiftUI State Management + CloudKit sync"
    testing: "XCTest + visionOS Simulator"
    deployment: "Xcode Cloud + App Store Connect"

  tv_platform:
    framework: "React Native TV / Tizen Studio / webOS SDK"
    navigation: "Spatial navigation + Remote control"
    state: "Zustand + TV-specific storage"
    testing: "Jest + TV Emulators"
    deployment: "Platform-specific stores (Samsung, LG, Apple TV)"

  watch_platform:
    ios: "SwiftUI (watchOS) + Complications + HealthKit"
    android: "Jetpack Compose (Wear OS) + Health Services"
    state: "Platform-specific state management + Watch Connectivity"
    testing: "XCTest / Android Test + Watch simulators"
    deployment: "App Store Connect / Google Play Console"

  car_platform:
    ios: "CarPlay Framework + SiriKit"
    android: "Android Auto AAR + Voice Actions"
    ui_principles: "Voice-first + Simplified UI + Safety compliance"
    testing: "CarPlay Simulator / Android Auto Test Suite"
    deployment: "App Store Connect / Google Play Console (Auto)"

BACKEND_MICROSERVICES_ARCHITECTURE:
  framework: "Express.js (High-performance + Middleware ecosystem)"
  api_standards: "REST (Primary - OpenAPI 3.0.3) + GraphQL (Complex data) + gRPC (High-performance) - see official technology versions"
  message_queue: "Apache Kafka (Event streaming) + Redis Streams (Fast messaging)"
  gateway: "Kong Gateway (API management) + NGINX Ingress (Load balancing)"
  service_mesh: "Istio (Advanced) | Linkerd (Lightweight)"

DATABASE_MULTI_TIER_STRATEGY:
  primary_operational: "MongoDB (Replica sets + Sharding + Atlas managed)"
  caching_layer: "Redis (Cluster mode + Persistence + ElastiCache)"
  analytics_olap: "ClickHouse (Time-series + Real-time analytics)"
  search_engine: "Elasticsearch (Full-text search + APM)"
  data_warehouse: "AWS Redshift (Data analytics) + BigQuery (ML workloads)"
  time_series: "InfluxDB (IoT data + Metrics)"

AUTHENTICATION_SECURITY_STACK:
  primary_auth: "Auth0 (Enterprise) + JWT + OAuth 2.1 + OIDC"
  biometric_auth: "Touch ID, Face ID, Fingerprint (platform-native)"
  enterprise_sso: "SAML 2.0 + Active Directory + Okta integration"
  api_security: "API Keys + Rate limiting + CORS + Content Security Policy"
  encryption: "AES-256 + RSA-4096 + TLS 1.3 + End-to-end encryption"

CLOUD_INFRASTRUCTURE_STRATEGY:
  primary_cloud: "AWS (Multi-region: us-east-1, eu-west-1, ap-southeast-1)"
  cdn_global: "CloudFront (AWS native) + Cloudflare (Performance + Security)"
  container_orchestration: "Amazon EKS (Kubernetes) + Docker + Helm Charts"
  deployment_strategy: "GitOps (ArgoCD) + Blue-Green deployments + Canary releases"
  monitoring_observability: "Prometheus + Grafana + Jaeger (Tracing) + Sentry (Errors)"
  cost_optimization: "AWS Cost Explorer + Spot instances + Auto-scaling groups"

UNIFIED_STATE_MANAGEMENT:
  library: "Zustand 4+ (Lightweight + TypeScript-first)"
  data_fetching: "TanStack Query v5 (Server state + Caching + Offline support)"
  cross_platform_sync: "@tanqory/unified-state (Custom sync layer)"
  persistence: "Platform-specific (localStorage, AsyncStorage, Electron Store)"
  real_time: "Socket.io + Server-Sent Events + WebRTC (P2P)"

API_CLIENT_ECOSYSTEM:
  unified_client: "@tanqory/api-client (Platform-agnostic HTTP client)"
  request_library: "Axios (Feature-rich) | Fetch (Native) + Platform adapters"
  real_time_communication: "Socket.io (WebSocket) + Server-Sent Events + WebRTC"
  offline_support: "Service Workers (Web) + Background sync + Retry mechanisms"
  compression: "Brotli + gzip + Protocol Buffers (Binary data)"
  caching: "HTTP caching + Application-level caching + CDN caching"

UI_COMPONENT_DESIGN_SYSTEM:
  web_components: "Tailwind CSS 3+ + Radix UI + Framer Motion + Custom components"
  mobile_components: "React Native Elements + Tamagui + Reanimated 3+ + Gesture Handler"
  desktop_components: "Electron + Web components + Native menus + System integration"
  cross_platform_library: "@tanqory/ui-components (Unified design system)"
  design_tokens: "Design tokens (colors, spacing, typography) across platforms"
  accessibility: "WCAG 2.1 AA compliance + Screen reader support + Keyboard navigation"

DEVELOPMENT_TOOLS_ECOSYSTEM:
  code_quality: "ESLint 8+ + Prettier + TypeScript ESLint + SonarQube"
  testing_stack: "Jest 29+ + Testing Library + Playwright (E2E) + Detox (Mobile E2E)"
  bundlers: "Webpack 5 (Next.js) + Metro (React Native) + Vite (Dev tools)"
  ci_cd_pipeline: "GitHub Actions (Primary) + AWS CodePipeline + Jenkins (Enterprise)"
  code_coverage: "Istanbul + Codecov + Quality gates (80%+ coverage)"
  performance_monitoring: "Lighthouse CI + Web Vitals + React Native Performance"

ANALYTICS_BUSINESS_INTELLIGENCE:
  application_monitoring: "Sentry (Primary across all platforms) + DataDog (Enterprise Optional) + Performance Monitoring"
  performance_monitoring: "Core Web Vitals + React Native Performance + Custom metrics"
  business_analytics: "Mixpanel (Product analytics) + Google Analytics 4 + Custom events"
  error_tracking: "Sentry + Bugsnag + CloudWatch Logs + Custom error boundaries"
  logging: "Winston (Structured JSON) + AWS CloudWatch + ELK Stack (Enterprise)"
  a_b_testing: "LaunchDarkly (Feature flags) + Optimizely + Custom A/B framework"

INTEGRATION_CAPABILITIES:
  payment_processing: "Stripe (Primary) + PayPal + Regional gateways + Apple Pay + Google Pay"
  email_communication: "SendGrid (Transactional) + Mailchimp (Marketing) + SES (Bulk)"
  sms_notifications: "Twilio (SMS) + AWS SNS + Regional SMS providers"
  push_notifications: "Firebase Cloud Messaging + Apple Push Notification + Expo Push"
  file_storage: "AWS S3 + CloudFront CDN + Image optimization + Video streaming"
  search_integration: "Algolia (Search as a Service) + Elasticsearch + Custom search"

COST_CONSIDERATIONS:
  development_efficiency: "70%+ code sharing reduces development costs"
  maintenance_overhead: "Unified stack reduces maintenance complexity"
  talent_acquisition: "TypeScript/JavaScript talent pool abundance"
  cloud_costs: "Multi-cloud strategy prevents vendor lock-in"
  licensing: "Open-source preference + Enterprise licenses where necessary"
  scalability: "Pay-per-use model aligned with business growth"
```

### **Platform Integration Matrix**
```typescript
// Cross-platform technology relationships
interface TanqoryPlatformIntegration {
  // Shared Libraries
  sharedLibraries: {
    '@tanqory/api-client': 'Unified HTTP client across all platforms';
    '@tanqory/auth-sdk': 'Authentication and authorization';
    '@tanqory/ui-components': 'Cross-platform design system';
    '@tanqory/unified-state': 'State synchronization';
    '@tanqory/analytics': 'Unified analytics and tracking';
    '@tanqory/crypto-utils': 'Encryption and security utilities';
    '@tanqory/platform-utils': 'Platform detection and utilities';
  };

  // Data Synchronization
  dataSynchronization: {
    realTime: 'WebSocket + Server-Sent Events for live updates';
    offline: 'Background sync when connectivity restored';
    conflict_resolution: 'Last-write-wins with timestamp comparison';
    data_compression: 'Protocol Buffers for mobile data efficiency';
  };

  // Cross-Platform Features
  crossPlatformFeatures: {
    authentication: 'OAuth 2.1 + JWT tokens work across all platforms';
    push_notifications: 'Unified notification system';
    deep_linking: 'Universal links and custom URL schemes';
    file_sharing: 'Cloud storage accessible from all platforms';
    analytics: 'Consistent event tracking and user journey';
  };

  // Platform-Specific Adaptations
  platformAdaptations: {
    web: 'Progressive Web App features + Service Workers';
    mobile: 'Native modules + Platform-specific UI patterns';
    desktop: 'Native system integration + Auto-updater';
    vision: 'Spatial computing + Hand/Eye tracking';
    tv: 'Remote control navigation + Voice commands';
    watch: 'Complications + Health data integration';
    car: 'Voice-first interface + Safety compliance';
  };
}
```

## Platform-Specific Standards

### **1. Web Platform (Next.js)**
```typescript
// Next.js App Router Configuration
// app/layout.tsx
import { TanqoryProvider } from '@tanqory/web-sdk';
import { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Tanqory',
    default: 'Tanqory - Global E-commerce Platform'
  },
  description: 'AI-first e-commerce platform supporting billion-dollar operations',
  keywords: ['e-commerce', 'AI', 'global', 'platform'],
  authors: [{ name: 'Tanqory Team' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['th_TH', 'ja_JP', 'zh_CN'],
    siteName: 'Tanqory'
  }
};

export const viewport: Viewport = {
  themeColor: '#000000',
  colorScheme: 'dark light',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <TanqoryProvider>
          {children}
        </TanqoryProvider>
      </body>
    </html>
  );
}
```

**Web Platform Requirements:**
- ✅ Next.js with App Router
- ✅ Server Components + Server Actions
- ✅ Progressive Web App (PWA) capabilities
- ✅ SEO optimization for global markets
- ✅ Performance budgets: Core Web Vitals compliance
- ✅ Accessibility: WCAG 2.1 AA compliance

### **2. Mobile Platform (React Native)**
```typescript
// React Native New Architecture
// App.tsx
import { TanqoryMobileProvider } from '@tanqory/mobile-sdk';
import { enableScreens } from 'react-native-screens';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

enableScreens();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TanqoryMobileProvider
        config={{
          apiEndpoint: process.env.API_ENDPOINT,
          enableHermes: true,
          enableFabric: true,
          enableTurboModules: true
        }}
      >
        <AppNavigator />
      </TanqoryMobileProvider>
    </GestureHandlerRootView>
  );
}

// Platform-specific configurations
// android/app/build.gradle
android {
  compileSdkVersion 34
  buildToolsVersion "34.0.0"

  defaultConfig {
    applicationId "com.tanqory.app"
    minSdkVersion 21
    targetSdkVersion 34
    versionCode 1
    versionName "1.0.0"
    multiDexEnabled true
  }

  buildFeatures {
    compose true
  }
}
```

**Mobile Platform Requirements:**
- ✅ React Native with New Architecture
- ✅ iOS 13+ / Android 7+ (API 24+) support
- ✅ Biometric authentication integration
- ✅ Offline-first architecture
- ✅ Push notifications with Firebase/APNs
- ✅ App Store / Google Play compliance

### **3. Desktop Platform (Electron)**
```typescript
// Electron Security Configuration
// main.ts
import { app, BrowserWindow, ipcMain, session } from 'electron';
import { TanqoryElectronSecurity } from '@tanqory/electron-security';

class TanqoryDesktopApp {
  private mainWindow: BrowserWindow | null = null;

  constructor() {
    this.initializeApp();
  }

  private async initializeApp(): Promise<void> {
    await app.whenReady();

    // Security hardening
    TanqoryElectronSecurity.configure({
      contentSecurityPolicy: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'"],
        'connect-src': ["'self'", "https://api.tanqory.com"],
        'img-src': ["'self'", "data:", "https:"],
      },
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false
    });

    this.createMainWindow();
  }

  private createMainWindow(): void {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, 'preload.js')
      },
      titleBarStyle: 'hiddenInset',
      trafficLightPosition: { x: 16, y: 16 }
    });
  }
}

new TanqoryDesktopApp();
```

**Desktop Platform Requirements:**
- ✅ Electron with security hardening
- ✅ macOS 11+ / Windows 10+ / Ubuntu 20.04+ support
- ✅ Auto-updater with code signing
- ✅ Native menu integration
- ✅ System tray functionality
- ✅ Deep linking support

### **4. Vision Platform (visionOS)**
```swift
// visionOS Spatial Computing
// TanqoryVisionApp.swift
import SwiftUI
import RealityKit
import ARKit

@main
struct TanqoryVisionApp: App {
    @StateObject private var appModel = TanqoryAppModel()

    var body: some Scene {
        WindowGroup {
            TanqoryContentView()
                .environmentObject(appModel)
        }
        .windowStyle(.volumetric)
        .defaultSize(width: 1.0, height: 1.0, depth: 1.0, in: .meters)

        ImmersiveSpace(id: "ImmersiveSpace") {
            TanqoryImmersiveView()
                .environmentObject(appModel)
        }
        .immersionStyle(selection: .constant(.progressive), in: .progressive)
    }
}

// Spatial Commerce Experience
struct TanqoryImmersiveView: View {
    @EnvironmentObject var appModel: TanqoryAppModel
    @State private var productCatalog: ProductCatalog3D?

    var body: some View {
        RealityView { content in
            await setupSpatialCommerce(content: content)
        } update: { content in
            updateProductDisplays(content: content)
        }
        .gesture(
            TapGesture()
                .targetedToAnyEntity()
                .onEnded { value in
                    handleProductInteraction(entity: value.entity)
                }
        )
    }
}
```

**Vision Platform Requirements:**
- ✅ visionOS 2.0+ with Spatial Computing
- ✅ RealityKit + ARKit integration
- ✅ Hand tracking and eye tracking
- ✅3D product visualization
- ✅ Immersive shopping experiences
- ✅ App Store compliance for visionOS

### **5. TV Platform (tvOS/Tizen/webOS)**
```typescript
// React Native TV Configuration
// App.tv.tsx
import { TanqoryTVProvider } from '@tanqory/tv-sdk';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

export default function TanqoryTVApp() {
  return (
    <TanqoryTVProvider
      config={{
        platform: Platform.OS as 'android' | 'ios' | 'web',
        remoteControlConfig: {
          enableGestures: true,
          enableVoiceControl: true,
          focusEngine: 'spatial'
        }
      }}
    >
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            gestureEnabled: false
          }}
        >
          <Stack.Screen name="Home" component={TVHomeScreen} />
          <Stack.Screen name="Catalog" component={TVCatalogScreen} />
          <Stack.Screen name="Player" component={TVPlayerScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </TanqoryTVProvider>
  );
}

// TV-Specific UI Components
const TVHomeScreen: React.FC = () => {
  const { focusManager } = useTVNavigation();

  return (
    <TVSafeAreaView>
      <TVGrid
        data={featuredContent}
        renderItem={({ item, index }) => (
          <TVCard
            item={item}
            focusable
            onFocus={() => focusManager.setFocus(index)}
            onPress={() => navigateToDetail(item)}
          />
        )}
        numColumns={4}
        spacing={20}
      />
    </TVSafeAreaView>
  );
};
```

**TV Platform Requirements:**
- ✅ tvOS 18+ / Tizen 8.0+ / webOS 24+ support
- ✅ Remote control navigation
- ✅ 4K/HDR content support
- ✅ Voice control integration
- ✅ Smart TV app store compliance
- ✅ Lean-back user experience

### **6. Watch Platform (watchOS/Wear OS)**
```swift
// watchOS Implementation
// TanqoryWatchApp.swift
import SwiftUI
import WatchKit
import HealthKit

@main
struct TanqoryWatchApp: App {
    var body: some Scene {
        WindowGroup {
            TanqoryWatchContentView()
        }
    }
}

struct TanqoryWatchContentView: View {
    @StateObject private var watchModel = TanqoryWatchModel()

    var body: some View {
        TabView {
            WatchHomeView()
                .tabItem {
                    Image(systemName: "house.fill")
                    Text("Home")
                }

            WatchOrdersView()
                .tabItem {
                    Image(systemName: "bag.fill")
                    Text("Orders")
                }

            WatchNotificationsView()
                .tabItem {
                    Image(systemName: "bell.fill")
                    Text("Alerts")
                }
        }
        .environmentObject(watchModel)
    }
}

// Complication Support
struct TanqoryWatchComplication: Widget {
    let kind: String = "TanqoryWatchComplication"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: TanqoryComplicationProvider()) { entry in
            TanqoryComplicationEntryView(entry: entry)
        }
        .configurationDisplayName("Tanqory")
        .description("Quick access to your orders and notifications")
        .supportedFamilies([
            .accessoryCircular,
            .accessoryRectangular,
            .accessoryInline
        ])
    }
}
```

**Watch Platform Requirements:**
- ✅ watchOS 11+ / Wear OS 5+ support
- ✅ Complication widgets
- ✅ Health data integration
- ✅ Quick actions and shortcuts
- ✅ Haptic feedback patterns
- ✅ Battery optimization

### **7. Car Platform (Android Auto/CarPlay)**
```swift
// CarPlay Implementation
// TanqoryCarPlaySceneDelegate.swift
import CarPlay
import UIKit

class TanqoryCarPlaySceneDelegate: UIResponder, CPTemplateApplicationSceneDelegate {

    func templateApplicationScene(
        _ templateApplicationScene: CPTemplateApplicationScene,
        didConnect interfaceController: CPInterfaceController
    ) {
        let rootTemplate = createMainTabBarTemplate()
        interfaceController.setRootTemplate(rootTemplate, animated: true)
    }

    private func createMainTabBarTemplate() -> CPTabBarTemplate {
        let homeTab = CPListTemplate(
            title: "Home",
            sections: [createFeaturedSection()]
        )
        homeTab.tabImage = UIImage(systemName: "house.fill")

        let ordersTab = CPListTemplate(
            title: "Orders",
            sections: [createOrdersSection()]
        )
        ordersTab.tabImage = UIImage(systemName: "bag.fill")

        return CPTabBarTemplate(templates: [homeTab, ordersTab])
    }

    private func createFeaturedSection() -> CPListSection {
        let items = featuredProducts.map { product in
            CPListItem(
                text: product.name,
                detailText: product.price,
                image: product.carPlayImage
            )
        }

        return CPListSection(items: items)
    }
}

// Android Auto Implementation
class TanqoryAndroidAutoService : CarAppService() {
    override fun createHostValidator(): HostValidator {
        return if (BuildConfig.DEBUG) {
            HostValidator.ALLOW_ALL_HOSTS_VALIDATOR
        } else {
            HostValidator.Builder(applicationContext)
                .addAllowedHosts(androidx.car.app.R.array.hosts_allowlist_sample)
                .build()
        }
    }

    override fun onCreateSession(): Session {
        return TanqoryCarSession()
    }
}
```

**Car Platform Requirements:**
- ✅ Android Auto / Apple CarPlay compliance
- ✅ Voice-first navigation
- ✅ Simplified UI for driving safety
- ✅ Location-based services
- ✅ Integration with car systems
- ✅ Hands-free operation

## Shared Architecture Patterns

### **Unified State Management**
```typescript
// @tanqory/unified-state
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface TanqoryGlobalState {
  // User state
  user: UserProfile | null;
  authentication: AuthenticationState;

  // App state
  theme: 'light' | 'dark' | 'auto';
  language: SupportedLanguage;
  region: SupportedRegion;

  // Platform state
  platform: DetectedPlatform;
  capabilities: PlatformCapabilities;

  // Business state
  cart: ShoppingCart;
  orders: Order[];
  preferences: UserPreferences;

  // Actions
  setUser: (user: UserProfile | null) => void;
  updateCart: (cart: ShoppingCart) => void;
  setTheme: (theme: ThemeMode) => void;
  setLanguage: (language: SupportedLanguage) => void;
}

export const useTanqoryStore = create<TanqoryGlobalState>()(
  persist(
    immer((set, get) => ({
      // Initial state
      user: null,
      authentication: { isAuthenticated: false },
      theme: 'auto',
      language: 'en',
      region: 'global',
      platform: detectPlatform(),
      capabilities: detectCapabilities(),
      cart: createEmptyCart(),
      orders: [],
      preferences: getDefaultPreferences(),

      // Actions
      setUser: (user) =>
        set((state) => {
          state.user = user;
          state.authentication.isAuthenticated = !!user;
        }),

      updateCart: (cart) =>
        set((state) => {
          state.cart = cart;
        }),

      setTheme: (theme) =>
        set((state) => {
          state.theme = theme;
        }),

      setLanguage: (language) =>
        set((state) => {
          state.language = language;
        }),
    })),
    {
      name: 'tanqory-global-state',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined'
          ? localStorage
          : require('@react-native-async-storage/async-storage').default
      ),
    }
  )
);
```

### **Cross-Platform Component System**
```typescript
// @tanqory/ui-components
import { styled, css } from '@tanqory/styled-system';

// Platform-adaptive button
interface TanqoryButtonProps {
  variant: 'primary' | 'secondary' | 'ghost';
  size: 'small' | 'medium' | 'large';
  platform?: 'web' | 'mobile' | 'tv' | 'watch' | 'car';
  children: React.ReactNode;
  onPress: () => void;
}

export const TanqoryButton: React.FC<TanqoryButtonProps> = ({
  variant,
  size,
  platform = detectPlatform(),
  children,
  onPress,
  ...props
}) => {
  const Component = getButtonComponent(platform);

  return (
    <Component
      style={[
        buttonBaseStyles,
        buttonVariantStyles[variant],
        buttonSizeStyles[size],
        platformButtonStyles[platform]
      ]}
      onPress={onPress}
      {...props}
    >
      {children}
    </Component>
  );
};

const buttonBaseStyles = css`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease-in-out;
  cursor: pointer;

  &:hover {
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const platformButtonStyles = {
  web: css`
    border: none;
    outline: none;
    user-select: none;
  `,
  mobile: css`
    elevation: 2;
    shadow-radius: 4px;
  `,
  tv: css`
    focus-ring: 4px solid rgba(0, 122, 255, 0.5);
    scale-on-focus: 1.05;
  `,
  watch: css`
    min-height: 44px;
    font-size: 14px;
  `,
  car: css`
    min-height: 48px;
    font-size: 16px;
    high-contrast: true;
  `
};
```

### **Unified API Client**
```typescript
// @tanqory/api-client
export class TanqoryApiClient {
  private baseURL: string;
  private platform: Platform;
  private retryConfig: RetryConfig;

  constructor(config: TanqoryApiConfig) {
    this.baseURL = config.baseURL;
    this.platform = config.platform || detectPlatform();
    this.retryConfig = config.retry || getDefaultRetryConfig();

    this.setupInterceptors();
    this.setupOfflineSync();
  }

  async request<T>(config: RequestConfig): Promise<ApiResponse<T>> {
    const requestId = generateRequestId();

    try {
      // Add platform-specific headers
      const enhancedConfig = this.enhanceRequestConfig(config);

      // Handle offline scenarios
      if (!this.isOnline() && this.canServeFromCache(config)) {
        return this.serveFromCache<T>(config);
      }

      // Execute request with retry logic
      const response = await this.executeWithRetry<T>(enhancedConfig);

      // Cache successful responses
      if (response.success && this.shouldCache(config)) {
        await this.cacheResponse(config, response);
      }

      return response;
    } catch (error) {
      // Handle platform-specific error scenarios
      return this.handleRequestError<T>(error, config, requestId);
    }
  }

  private enhanceRequestConfig(config: RequestConfig): RequestConfig {
    return {
      ...config,
      headers: {
        ...config.headers,
        'X-Platform': this.platform,
        'X-App-Version': getAppVersion(),
        'X-Device-ID': getDeviceId(),
        'X-Request-ID': generateRequestId(),
        'Accept-Language': getCurrentLanguage(),
        'Accept-Encoding': 'gzip, deflate, br'
      }
    };
  }
}
```

## Performance Standards

### **Platform Performance Budgets**
```typescript
interface PerformanceBudgets {
  web: {
    firstContentfulPaint: 1500; // ms
    largestContentfulPaint: 2500; // ms
    firstInputDelay: 100; // ms
    cumulativeLayoutShift: 0.1;
    totalBlockingTime: 200; // ms
    bundleSize: 200; // KB (gzipped)
  };

  mobile: {
    appStartup: 2000; // ms
    screenTransition: 300; // ms
    listScrolling: 60; // fps
    memoryUsage: 150; // MB
    batteryUsage: 'minimal';
    networkRequests: 10; // concurrent
  };

  desktop: {
    appStartup: 3000; // ms
    windowResize: 60; // fps
    memoryUsage: 500; // MB
    cpuUsage: 15; // %
    diskSpace: 100; // MB
  };

  tv: {
    appLaunch: 5000; // ms
    navigationResponse: 200; // ms
    videoPlayback: '4K@60fps';
    memoryUsage: 200; // MB
    remoteLatency: 100; // ms
  };

  watch: {
    appLaunch: 1000; // ms
    complicationUpdate: 100; // ms
    batteryUsage: 'ultraLow';
    memoryUsage: 50; // MB
    syncLatency: 500; // ms
  };

  car: {
    appConnect: 2000; // ms
    voiceResponse: 500; // ms
    safetyCompliance: 'NHTSA';
    memoryUsage: 100; // MB
    networkLatency: 200; // ms
  };
}
```

### **Global Deployment Strategy**
```yaml
# Multi-Platform CI/CD Pipeline
name: Tanqory Multi-Platform Deployment

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  web-deployment:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel
        run: |
          npm run build:web
          vercel --prod --token ${{ secrets.VERCEL_TOKEN }}

  mobile-deployment:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build iOS/Android
        run: |
          npm run build:mobile
          fastlane ios release
          fastlane android release

  desktop-deployment:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - name: Build Desktop App
        run: |
          npm run build:desktop
          npm run package:${{ matrix.os }}

  vision-deployment:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build visionOS App
        run: |
          xcodebuild -project TanqoryVision.xcodeproj -scheme TanqoryVision -destination 'platform=visionOS Simulator'

  tv-deployment:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build TV Apps
        run: |
          npm run build:tv:tizen
          npm run build:tv:webos
          npm run build:tv:tvos
```

## Integration Requirements

### **Cross-Platform Data Sync**
```typescript
// @tanqory/sync-engine
export class TanqorySyncEngine {
  private platforms: Set<Platform> = new Set();
  private syncState: SyncState = {};

  async initializeSync(platform: Platform): Promise<void> {
    this.platforms.add(platform);

    // Platform-specific sync initialization
    switch (platform) {
      case 'web':
        await this.initializeWebSync();
        break;
      case 'mobile':
        await this.initializeMobileSync();
        break;
      case 'desktop':
        await this.initializeDesktopSync();
        break;
      case 'watch':
        await this.initializeWatchSync();
        break;
      case 'car':
        await this.initializeCarSync();
        break;
    }
  }

  async syncUserData(userId: string): Promise<SyncResult> {
    const syncPlan = await this.createSyncPlan(userId);
    const results: SyncResult[] = [];

    for (const operation of syncPlan.operations) {
      const result = await this.executeSyncOperation(operation);
      results.push(result);

      if (!result.success) {
        await this.handleSyncFailure(operation, result.error);
      }
    }

    return this.consolidateSyncResults(results);
  }
}
```

### **Universal Analytics**
```typescript
// @tanqory/analytics
export class TanqoryAnalytics {
  private trackers: Map<Platform, AnalyticsTracker> = new Map();

  track(event: AnalyticsEvent): void {
    const enhancedEvent = this.enhanceEvent(event);

    // Track across all initialized platforms
    this.trackers.forEach((tracker, platform) => {
      tracker.track(this.adaptEventForPlatform(enhancedEvent, platform));
    });
  }

  private enhanceEvent(event: AnalyticsEvent): EnhancedAnalyticsEvent {
    return {
      ...event,
      timestamp: Date.now(),
      sessionId: getSessionId(),
      userId: getCurrentUserId(),
      platform: getCurrentPlatform(),
      deviceInfo: getDeviceInfo(),
      appVersion: getAppVersion(),
      buildNumber: getBuildNumber(),
      correlationId: generateCorrelationId()
    };
  }
}
```

---

**Document Version**: 1.0.0
**Compliance**: IPO Nasdaq readiness, SOX 404, Global Platform Standards
**Platform Coverage**: 8/8 target platforms (100% coverage)
**Maintained By**: Platform Engineering Team