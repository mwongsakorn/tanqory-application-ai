---
title: Official Technology Stack Versions
version: 1.0.0
owner: CTO Office
last_reviewed: 2025-09-16
next_review: 2025-10-16
classification: CONFIDENTIAL
status: PRODUCTION
scope: [All_Teams, Technology_Standards, Version_Management]
---

# TANQORY OFFICIAL TECHNOLOGY STACK VERSIONS

> **SINGLE SOURCE OF TRUTH**: This is the only document that defines technology versions for the entire organization. All other documentation must reference this file.

## 📋 Document Information

- **Purpose**: Central registry for all technology versions across Tanqory platforms
- **Owner**: CTO Office
- **Classification**: CONFIDENTIAL
- **Status**: PRODUCTION
- **Last Updated**: September 16, 2025
- **Next Review**: October 16, 2025

---

## 🎯 Core Foundation Stack

### **Primary Language**
- **TypeScript**: `5+` (Strict mode)
- **Compilation Target**: ES2022+
- **Package Management**:
  - **Single Project/Service**: `npm` (default for all single repos)
  - **Monorepo**: `pnpm` (better performance, workspace support, disk efficiency)
  - **Legacy Projects**: `yarn` (maintain existing projects only)
  - **CI/CD**: Use same package manager as project (npm/pnpm/yarn)

> **Package Manager Strategy**: npm for simplicity in single repos, pnpm for monorepos due to performance benefits.

#### **Package Manager Usage Examples**

##### **Single Repository (npm)**
```bash
# ✅ Standard single repo setup
npm init -y
npm install express mongoose
npm install -D typescript @types/node
npm run dev
```

##### **Monorepo (pnpm) - Recommended Structure**
```bash
# ✅ Monorepo setup with pnpm workspaces
# Project structure:
tanqory-platform/
├── pnpm-workspace.yaml
├── package.json
├── packages/
│   ├── @tanqory/api-client/
│   ├── @tanqory/ui-components/
│   └── @tanqory/shared-utils/
└── apps/
    ├── web-app/
    ├── mobile-app/
    └── admin-dashboard/

# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'

# Root package.json
{
  "name": "tanqory-platform",
  "scripts": {
    "build": "pnpm -r build",
    "test": "pnpm -r test",
    "dev": "pnpm --parallel -r dev"
  }
}

# Installation and usage
pnpm install                    # Install all dependencies
pnpm -r build                   # Build all packages
pnpm --filter web-app dev       # Run specific app
pnpm --filter @tanqory/ui-components build
```

##### **Package Installation Examples**
```bash
# Single repo (npm)
npm install @tanqory/api-client
npm install -D jest @types/jest

# Monorepo (pnpm)
pnpm add @tanqory/api-client --filter web-app
pnpm add -D jest --filter @tanqory/ui-components
pnpm add typescript -w  # Add to workspace root

# Cross-package dependencies in monorepo
pnpm add @tanqory/shared-utils --filter @tanqory/ui-components
```

##### **CI/CD Pipeline Examples**
```yaml
# Single repo CI (npm)
- name: Install dependencies
  run: npm ci

- name: Build
  run: npm run build

- name: Test
  run: npm test

# Monorepo CI (pnpm)
- name: Setup pnpm
  uses: pnpm/action-setup@v2
  with:
    version: 8

- name: Install dependencies
  run: pnpm install --frozen-lockfile

- name: Build all packages
  run: pnpm -r build

- name: Test all packages
  run: pnpm -r test

- name: Build specific app
  run: pnpm --filter web-app build
```

##### **Performance Comparison**
```yaml
Installation_Speed:
  npm: "baseline"
  pnpm: "2-3x faster (with workspace)"
  yarn: "similar to npm"

Disk_Usage:
  npm: "baseline (node_modules duplication)"
  pnpm: "60-70% less disk space (content-addressable store)"
  yarn: "similar to npm"

Monorepo_Support:
  npm: "basic workspaces support"
  pnpm: "advanced workspaces, filtering, parallel execution"
  yarn: "good workspace support"
```

---

## 🖥️ Runtime Platforms

### **Backend Runtime**
- **Primary**: Node.js `20+` LTS
- **Alternatives**:
  - Deno `2.0+`
  - Bun `1.1+`

### **Edge Computing**
- Cloudflare Workers
- Vercel Edge Runtime

---

## 🌐 Frontend Frameworks

### **Web Platform**
- **Framework**: Next.js `15+`
- **UI Library**: React `18+`
- **Router**: App Router
- **Features**: Server Components, Server Actions

### **Mobile Platform**

#### **React Native Decision Context & Rationale**
```yaml
Decision_Context:
  business_requirements:
    platforms: "iOS and Android with feature parity"
    time_to_market: "6 months from concept to app store"
    team_constraints: "Limited native iOS/Android developers"
    maintenance_burden: "Single codebase for multiple platforms"

  performance_requirements:
    startup_time: "<3 seconds on mid-range devices"
    ui_responsiveness: "60 FPS scrolling and animations"
    memory_usage: "<200MB on background, <500MB active"
    battery_efficiency: "Comparable to native apps"

  platform_capabilities_needed:
    camera: "QR code scanning, photo capture for reviews"
    payments: "Biometric authentication for payments"
    notifications: "Push notifications with rich content"
    offline: "Offline-first product browsing"

Rationale:
  development_efficiency:
    - "90% code sharing between iOS and Android"
    - "Faster development with hot reload and debugging"
    - "TypeScript ecosystem alignment with backend"
    - "Single team can maintain both platforms"

  performance_with_new_architecture:
    - "Native module performance with TurboModules"
    - "60 FPS UI with Fabric renderer"
    - "Hermes engine optimization for startup time"
    - "Memory efficiency improvements over bridge"

  ecosystem_and_tooling:
    - "Expo managed workflow for faster development"
    - "EAS Build for CI/CD pipeline integration"
    - "Rich component ecosystem (React Native Elements)"
    - "Debugging tools (Flipper, React DevTools)"

Alternatives_Considered:
  flutter:
    pros: "Excellent performance, single codebase, growing ecosystem"
    cons: "Dart language learning curve, smaller talent pool"
    rejection_reason: "Team expertise in JavaScript/TypeScript ecosystem"

  native_development:
    pros: "Best possible performance, platform-specific features"
    cons: "2x development time, separate teams needed, maintenance overhead"
    rejection_reason: "Time to market and resource constraints"

  ionic:
    pros: "Web technologies, rapid development"
    cons: "Performance limitations, WebView constraints"
    rejection_reason: "Performance requirements for e-commerce app"

  xamarin:
    pros: "Microsoft ecosystem, C# expertise"
    cons: "Declining support, performance overhead"
    rejection_reason: "Ecosystem momentum and Microsoft's focus shift"

New_Architecture_Mandate:
  rationale:
    - "Better performance and smaller bundle sizes"
    - "Improved interoperability with native code"
    - "Future-proofing for React Native roadmap"
    - "Required for latest platform features"

  migration_timeline: "All apps must migrate by React Native 0.76 (Q2 2026)"
```

#### **Platform Configuration**
```yaml
Framework: "React Native 0.74+ (Latest stable as of September 2025)"
Architecture: "New Architecture (Fabric + TurboModules) - mandatory"
Development_Platform: "Expo 51+ with EAS Build"

Build_Targets:
  ios:
    minimum: "iOS 13.0 (covers 95%+ of active devices)"
    target: "iOS 18+ (latest features and optimizations)"
    rationale: "Balance of market coverage and modern capabilities"

  android:
    minimum: "API 21 (Android 5.0) - covers 99%+ of active devices"
    target: "API 34 (Android 14) - latest security and performance"
    rationale: "Maximize market reach while using modern Android features"

Performance_Optimizations:
  javascript_engine: "Hermes (enabled by default)"
  hermes_rationale:
    - "Faster app startup time (50% improvement)"
    - "Reduced memory usage (30% lower baseline)"
    - "Better debugging experience with source maps"
    - "Optimized for React Native execution patterns"
```

> **Strategic Direction**: React Native New Architecture mandatory for all new mobile applications. Legacy bridge architecture deprecated and unsupported for new development.

### **Desktop Platform**
- **Framework**: Electron `32+`
- **Security**: Security Hardened
- **UI Layer**: React `18+`

### **Vision Platform**
- **Framework**: SwiftUI
- **Platform**: visionOS `2.0+`
- **Features**: RealityKit, ARKit

### **TV Platform**
- **Frameworks**:
  - React Native TV
  - Tizen Studio
  - webOS SDK
- **Platforms**: tvOS `18+`, Tizen `8.0+`, webOS `24+`

### **Watch Platform**
- **iOS**: SwiftUI (watchOS `11+`)
- **Android**: Jetpack Compose (Wear OS `5+`)

### **Car Platform**
- **iOS**: CarPlay Framework
- **Android**: Android Auto AAR

---

## ⚙️ Backend Architecture

### **Framework**
- **Primary**: Express.js `4+` (Official standard since September 2025)

#### **Decision Context & Rationale**
```yaml
Decision_Context:
  business_context:
    scale: "Building for billion-dollar revenue scale"
    team_size: "50+ backend developers globally"
    timeline: "18 months to IPO readiness"
    performance_requirement: "10K+ requests/second per service"

  technical_context:
    architecture: "Microservices with independent deployment"
    infrastructure: "Kubernetes with auto-scaling"
    team_expertise: "Strong JavaScript/TypeScript, varied NestJS experience"
    existing_services: "30% NestJS services requiring migration"

  constraints:
    compatibility: "Must maintain API compatibility during migration"
    migration_window: "12 months for existing services"
    uptime_requirement: "Zero downtime for production services"

Rationale:
  simplicity_and_performance:
    - "Lower overhead than NestJS decorators"
    - "Direct control over request/response cycle"
    - "20% better performance for high-traffic APIs"

  team_velocity:
    - "Faster onboarding: <2 weeks vs 4-6 weeks with NestJS"
    - "Less abstraction = more straightforward debugging"
    - "Reduced complexity in microservices architecture"

  ecosystem_maturity:
    - "Largest Node.js framework ecosystem"
    - "Better third-party middleware compatibility"
    - "More flexible for custom implementations"

Alternatives_Considered:
  nestjs:
    pros: "TypeScript decorators, dependency injection, structured"
    cons: "Learning curve, performance overhead, complex debugging"
    rejection_reason: "Team velocity concerns at scale"

  fastify:
    pros: "Excellent performance, TypeScript support, JSON schema"
    cons: "Smaller ecosystem, fewer familiar developers"
    status: "Retained as alternative for high-performance scenarios"

  koa:
    pros: "Modern async/await, lightweight, flexible"
    cons: "Requires more boilerplate, smaller community"
    rejection_reason: "Developer productivity concerns"

Migration_Strategy:
  phase_1: "Months 1-3: New services use Express.js only"
  phase_2: "Months 4-9: Migrate critical path services"
  phase_3: "Months 10-12: Complete migration of remaining services"
  rollback_plan: "Maintain parallel NestJS capability for 6 months"

Success_Metrics:
  - "Developer onboarding time: <2 weeks (from 4-6 weeks)"
  - "API response time: 20% improvement average"
  - "Memory usage: 15% reduction per service"
  - "Bug resolution time: 30% reduction"
  - "Team satisfaction: >4.0/5.0 monthly survey"
```

**Architecture Pattern**: Layered architecture (Controller -> Service -> Repository)
**Database Integration**: Mongoose ODM (Official standard)
**Alternatives**: Fastify `4+` (for high-performance scenarios only)

### **API Standards**

#### **Primary API Standard: REST**
- **REST APIs**: OpenAPI `3.0.3` (Primary for all public and internal APIs)

#### **API Standards Priority & Usage Matrix**
```yaml
Primary_Standard: "REST APIs with OpenAPI 3.0.3"
Primary_Usage:
  - "All CRUD operations and standard business logic"
  - "Public APIs for external integrations"
  - "Mobile app APIs (simple request/response patterns)"
  - "Web application APIs (standard data fetching)"
  - "Microservice communication (standard scenarios)"

Supplementary_Standards:
  GraphQL_Federation:
    usage: "Complex data fetching scenarios ONLY"
    when_to_use:
      - "Frontend needs complex nested data with relationships"
      - "Multiple data sources need to be aggregated"
      - "Real-time subscriptions for live features"
    examples: "Product catalog with nested categories, reviews, pricing"

  gRPC_Protocol_Buffers:
    usage: "High-performance inter-service communication ONLY"
    when_to_use:
      - "Internal microservice communication requiring <10ms latency"
      - "High-frequency data synchronization between services"
      - "Real-time streaming data between backend services"
    examples: "Payment processing, inventory updates, real-time analytics"

Decision_Matrix:
  Choose_REST_When:
    - "Standard CRUD operations"
    - "Public API endpoints"
    - "Mobile and web client communication"
    - "Simple request/response patterns"
    - "Third-party integrations"

  Choose_GraphQL_When:
    - "Complex nested data requirements"
    - "Multiple related entities in single request"
    - "Frontend-driven data requirements"
    - "Real-time subscriptions needed"

  Choose_gRPC_When:
    - "Internal service-to-service communication"
    - "High-performance requirements (<10ms)"
    - "Streaming data between services"
    - "Type-safe contract enforcement"

Default_Rule: "When in doubt, use REST APIs with OpenAPI 3.0.3"
```

### **Message Queue**
- **Primary**: Apache Kafka `3+`
- **Secondary**: Redis Streams

### **Gateway**
- **API Management**: Kong Gateway
- **Load Balancing**: NGINX Ingress

### **Service Mesh**
- **Advanced**: Istio
- **Lightweight**: Linkerd

---

## 🗄️ Database Strategy

### **Primary Database**

#### **Multi-Database Strategy Decision Context & Rationale**
```yaml
Decision_Context:
  business_requirements:
    scale: "100M+ products, 10M+ users, billion-dollar GMV"
    performance: "API responses <100ms P95, search <50ms"
    availability: "99.9% uptime, 24/7 global operations"
    compliance: "SOX, GDPR, PCI-DSS requirements"

  data_characteristics:
    operational_data: "Variable schema, rapid development, JSON documents"
    analytics_data: "Time-series, aggregations, complex queries"
    search_data: "Full-text search, faceted search, relevance scoring"
    cache_data: "Hot data, session state, real-time features"

  team_context:
    expertise: "Strong JavaScript/TypeScript, limited SQL experience"
    development_speed: "Rapid iteration, flexible schema changes"
    operational_capacity: "Managed services preferred over self-hosted"
```

#### **Operational Database: MongoDB 7+**
```yaml
Rationale:
  schema_flexibility:
    - "JSON document structure matches product catalog needs"
    - "Rapid schema evolution without migrations"
    - "TypeScript interfaces provide type safety"

  scaling_capability:
    - "Horizontal sharding for 100M+ documents"
    - "Replica sets for read scaling and high availability"
    - "Auto-sharding based on shard keys"

  developer_productivity:
    - "Natural fit with JavaScript/TypeScript ecosystem"
    - "Aggregation pipeline for complex queries"
    - "Atlas managed service reduces operational overhead"

Alternatives_Considered:
  postgresql:
    pros: "ACID transactions, mature ecosystem, SQL familiarity"
    cons: "Schema migrations complexity, horizontal scaling challenges"
    rejection_reason: "Scaling complexity at our growth rate, team expertise"

  dynamodb:
    pros: "Serverless, infinite scale, AWS native"
    cons: "Vendor lock-in, complex query patterns, cost at scale"
    rejection_reason: "Multi-cloud strategy, query flexibility needs"

Driver_Choice: "Mongoose ODM (Official standard)"
Driver_Rationale:
  - "Schema validation and type safety with TypeScript"
  - "Built-in middleware for hooks and plugins"
  - "Mature ecosystem with extensive community support"
  - "Simplified relationship management and population"
  - "Enterprise-grade features (transactions, change streams)"
  - "Better developer experience and faster development velocity"

Configuration:
  production: "MongoDB Atlas (managed service) with Mongoose ODM"
  development: "Local MongoDB instance with Mongoose ODM"
  schema: "Mongoose schemas with TypeScript interfaces for type safety"
  validation: "Built-in Mongoose validation + custom validators"
```

#### **Caching: Redis 7+**
```yaml
Rationale:
  performance_requirements:
    - "In-memory performance for <10ms response times"
    - "Session storage for 10M+ concurrent users"
    - "Real-time features (chat, notifications, live updates)"

  reliability_features:
    - "Cluster mode for high availability and scaling"
    - "Persistence (RDB + AOF) for data durability"
    - "Sentinel for automatic failover"

  data_structure_support:
    - "Rich data types: strings, hashes, lists, sets, sorted sets"
    - "Pub/Sub for real-time messaging"
    - "Lua scripting for atomic operations"

Alternatives_Considered:
  memcached:
    pros: "Simple, fast, wide adoption"
    cons: "No persistence, limited data structures, no clustering"
    rejection_reason: "Need persistence and advanced data structures"

  hazelcast:
    pros: "Distributed computing, Java ecosystem"
    cons: "JVM overhead, complexity, licensing costs"
    rejection_reason: "Node.js ecosystem focus, operational simplicity"

Use_Cases:
  - "Session storage and user authentication state"
  - "API response caching with TTL"
  - "Real-time data for live features"
  - "Rate limiting and throttling counters"

Configuration:
  mode: "Cluster mode with persistence"
  persistence: "RDB snapshots + AOF for durability"
  scaling: "Horizontal scaling via cluster sharding"
```

#### **Analytics: ClickHouse 23+**
```yaml
Rationale:
  analytics_requirements:
    - "OLAP queries on billions of events"
    - "Sub-second aggregations for business intelligence"
    - "Time-series analysis for user behavior"
    - "Real-time analytics dashboards"

  performance_characteristics:
    - "Columnar storage for analytical workloads"
    - "Vectorized query execution"
    - "Compression rates 10x better than row-based stores"
    - "Linear scaling with commodity hardware"

  cost_effectiveness:
    - "Significantly lower costs than traditional data warehouses"
    - "Open source with enterprise support available"
    - "Efficient storage and compute resource utilization"

Alternatives_Considered:
  bigquery:
    pros: "Serverless, Google ecosystem, SQL familiarity"
    cons: "Vendor lock-in, cost unpredictability, data locality"
    rejection_reason: "Multi-cloud strategy, cost control needs"

  snowflake:
    pros: "Data sharing, separation of compute/storage"
    cons: "High costs, vendor lock-in, complexity"
    rejection_reason: "Cost structure doesn't fit our usage patterns"

  postgresql_timescaledb:
    pros: "SQL familiarity, ACID transactions"
    cons: "Limited analytical performance, scaling complexity"
    rejection_reason: "Analytical performance requirements"

Integration_Strategy:
  - "Real-time data pipeline from MongoDB via change streams"
  - "Event streaming through Kafka/Kinesis"
  - "Automated ETL processes for data transformation"

Use_Cases:
  - "Business intelligence and executive dashboards"
  - "User behavior analysis and cohort analysis"
  - "Financial reporting and revenue analytics"
  - "A/B testing and experimentation results"
```

#### **Search: Elasticsearch 8+**
```yaml
Rationale:
  search_requirements:
    - "Full-text search across 100M+ products"
    - "Faceted search with filters and aggregations"
    - "Relevance scoring and personalization"
    - "Auto-complete and search suggestions"

  performance_needs:
    - "Search results <50ms P95"
    - "Real-time indexing of new products"
    - "High availability with zero search downtime"

  feature_richness:
    - "Advanced text analysis and tokenization"
    - "Geo-spatial search capabilities"
    - "Machine learning features for relevance"
    - "Multi-language search support"

Alternatives_Considered:
  algolia:
    pros: "Managed service, excellent performance, easy integration"
    cons: "Cost at scale, vendor lock-in, limited customization"
    status: "Considered for specific use cases or MVP phases"

  opensearch:
    pros: "Open source, AWS managed option"
    cons: "Feature lag behind Elasticsearch, ecosystem fragmentation"
    rejection_reason: "Elasticsearch ecosystem maturity and features"

  mongodb_atlas_search:
    pros: "Integrated with MongoDB, simplified architecture"
    cons: "Limited search features, performance constraints"
    rejection_reason: "Advanced search requirements exceed capabilities"

Integration_Strategy:
  - "Synchronized with MongoDB via change streams"
  - "Real-time indexing with minimal lag"
  - "Backup and disaster recovery procedures"

Use_Cases:
  - "Product catalog search with filters"
  - "Log analysis and monitoring"
  - "Content search across documentation"
  - "User-generated content search"
```

#### **Time Series: InfluxDB 2+**
```yaml
Rationale:
  time_series_needs:
    - "Performance metrics and monitoring data"
    - "IoT sensor data from connected devices"
    - "Application and infrastructure metrics"
    - "Real-time alerting and anomaly detection"

  specialized_features:
    - "Purpose-built for time-series data"
    - "Efficient compression and storage"
    - "Built-in downsampling and retention policies"
    - "Flux query language for time-series analysis"

Use_Cases:
  - "Application performance monitoring metrics"
  - "Infrastructure and Kubernetes metrics"
  - "IoT device telemetry and sensor data"
  - "Business metrics and KPI tracking"

Integration:
  - "Prometheus metrics forwarding"
  - "Custom application metrics collection"
  - "Grafana dashboards for visualization"
```

> **Multi-Database Strategy**: Optimized approach using specialized databases for specific use cases, maximizing performance while maintaining operational simplicity.

### **Data Warehouse**
- **AWS**: AWS Redshift
- **GCP**: BigQuery

---

## 🔐 Authentication & Security

### **Authentication**
- **Primary Identity Provider**: Auth0 (Enterprise plan)
  - **Implementation**: OAuth 2.1 + OIDC for web and mobile
  - **Token Management**: JWT with refresh token rotation
  - **Session Management**: Redis-backed sessions for web
- **Enterprise SSO Integration**:
  - **SAML 2.0**: Active Directory, Okta, Azure AD
  - **LDAP**: Enterprise directory integration
  - **Multi-tenant**: Separate Auth0 tenants per enterprise customer
- **Mobile Biometric Authentication**:
  - **iOS**: Touch ID, Face ID via LocalAuthentication
  - **Android**: Fingerprint, Face unlock via BiometricPrompt
- **API Authentication**: JWT Bearer tokens for all API calls
- **Service-to-Service**: Service accounts with JWT or mTLS

> **Authentication Architecture**: Auth0 as centralized identity provider. Platform-specific biometric integration. Enterprise SSO via SAML federation.

### **Encryption**
- AES-256
- RSA-4096
- TLS `1.3`

---

## ☁️ Cloud Infrastructure

### **Primary Cloud**
- **Provider**: AWS
- **Regions**: us-east-1, eu-west-1, ap-southeast-1

### **CDN**
- **AWS Native**: CloudFront
- **Performance**: Cloudflare

### **Container Orchestration**
- Amazon EKS (Kubernetes)
- Docker
- Helm Charts

### **Deployment Strategy**
- GitOps (ArgoCD)
- Blue-Green deployments
- Canary releases

### **Monitoring & Observability**
- **Primary Error Tracking**: Sentry (all platforms - web, mobile, backend)
- **Infrastructure Metrics**: Prometheus + Grafana (Kubernetes and system metrics)
- **Distributed Tracing**: Jaeger (microservices request tracing)
- **Application Performance**: Sentry Performance (integrated with error tracking)
- **Enterprise Monitoring**: DataDog (for enterprise customers requiring advanced dashboards)
- **Log Aggregation**: ELK Stack (Elasticsearch + Logstash + Kibana)

> **Monitoring Strategy**: Sentry as primary for all application monitoring. Prometheus/Grafana for infrastructure. DataDog optional for enterprise requirements.

---

## 📊 State Management & Data Fetching

### **State Management**
- **Library**: Zustand `4+`
- **Data Fetching**: TanStack Query `v5`
- **Cross-Platform Sync**: @tanqory/unified-state

### **Real-Time Communication**
- Socket.io
- Server-Sent Events
- WebRTC

---

## 🎨 UI & Styling

### **Web Platform**
- **Styling**: Tailwind CSS `3+`
- **Components**: Radix UI
- **Animations**: Framer Motion
- **CSS Modules**: CSS Modules

### **Mobile Platform**
- **Components**: React Native Elements
- **Styling**: Tamagui
- **Animations**: Reanimated `3+`
- **Gestures**: Gesture Handler

### **Desktop Platform**
- **Components**: Electron + Web components
- **Native Integration**: Native menus

### **Cross-Platform**
- **Library**: @tanqory/ui-components

---

## 🛠️ Development Tools

### **Bundlers**
- **Web**: Webpack `5` (via Next.js)
- **Mobile**: Metro
- **Dev Tools**: Vite

### **Testing**
- **Unit**: Jest `29+`
- **Component**: Testing Library
- **E2E Web**: Playwright
- **E2E Mobile**: Detox

### **Code Quality**
- **Linting**: ESLint `8+`
- **Formatting**: Prettier
- **TypeScript**: TypeScript ESLint
- **Coverage**: Istanbul

### **CI/CD**
- **Primary**: GitHub Actions
- **Enterprise**: AWS CodePipeline
- **Alternative**: Jenkins

---

## 🌐 API Client & Networking

### **HTTP Client**
- **Unified**: @tanqory/api-client
- **Library**: Axios
- **Alternative**: Fetch API

### **Features**
- **Offline Support**: Service Workers
- **Compression**: Brotli, gzip, Protocol Buffers

---

## 📈 Analytics & Monitoring

### **Application Monitoring**
- Sentry
- DataDog

### **Performance Monitoring**
- Web Vitals
- React Native Performance

### **Business Analytics**
- Mixpanel
- Google Analytics `4`

### **Error Tracking**
- Sentry
- Bugsnag

### **Logging**
- Winston
- Structured JSON logging

---

## 🔗 Integration Services

### **Payment Processing**
- **Primary**: Stripe
- **Alternatives**: PayPal, Regional gateways
- **Mobile**: Apple Pay, Google Pay

### **Communication**
- **Email Transactional**: SendGrid
- **Email Marketing**: Mailchimp
- **SMS**: Twilio
- **Push Notifications**: Firebase Cloud Messaging

### **File Storage**
- **Primary**: AWS S3
- **CDN**: CloudFront CDN
- **Optimization**: Image optimization

### **Search**
- **SaaS**: Algolia
- **Self-hosted**: Elasticsearch

---

## 🎯 Platform-Specific vs Unified Technology Strategy

### **Unified Approaches (Cross-Platform)**
> Technologies and patterns used consistently across ALL platforms

#### **Core Unified Stack**
```yaml
Language:
  primary: "TypeScript 5+ (ALL platforms)"
  rationale: "Type safety, developer productivity, unified codebase"

Business Logic:
  packages: "@tanqory/core-business, @tanqory/api-client"
  rationale: "Single source of truth for business rules"

Authentication:
  provider: "Auth0 (ALL platforms)"
  implementation: "OAuth 2.1 + JWT tokens"
  rationale: "Centralized identity management, enterprise SSO support"

State Management Core:
  library: "Zustand (ALL platforms)"
  rationale: "Lightweight, TypeScript-first, platform-agnostic"

Error Tracking:
  service: "Sentry (ALL platforms)"
  rationale: "Unified error tracking, performance monitoring"

API Communication:
  client: "@tanqory/api-client (ALL platforms)"
  primary_protocol: "REST APIs with OpenAPI 3.0.3"
  rationale: "Consistent REST API interface, shared error handling, standardized responses"

Analytics:
  tracking: "Unified event schema across platforms"
  rationale: "Consistent user behavior analysis"
```

### **Platform-Specific Approaches**
> Technologies that MUST vary by platform due to constraints or optimization

#### **Web Platform Specific**
```yaml
Deployment:
  strategy: "Vercel Edge + Cloudflare Workers"
  rationale: "Edge computing for global performance"

Storage:
  client: "localStorage + sessionStorage"
  rationale: "Browser-native storage APIs"

Routing:
  library: "Next.js App Router"
  rationale: "Server Components, SSR optimization"

UI Framework:
  base: "React 18+ Server Components"
  rationale: "SEO, performance, server-side rendering"
```

#### **Mobile Platform Specific**
```yaml
Deployment:
  strategy: "EAS Build + App Store Distribution"
  rationale: "Native app store requirements"

Storage:
  client: "AsyncStorage + SQLite"
  rationale: "Mobile-optimized offline storage"

Navigation:
  library: "React Navigation"
  rationale: "Native mobile navigation patterns"

UI Framework:
  base: "React Native New Architecture"
  rationale: "Native performance, platform APIs"

Biometric:
  implementation: "Platform-specific (Touch ID, Face ID, Fingerprint)"
  rationale: "Native security features"
```

#### **Desktop Platform Specific**
```yaml
Deployment:
  strategy: "Electron Builder + Auto-updater"
  rationale: "Cross-platform desktop distribution"

Storage:
  client: "electron-store + SQLite"
  rationale: "Desktop file system access"

Native APIs:
  communication: "Electron IPC"
  rationale: "Access to OS-level features"

Security:
  approach: "Code signing + sandboxing"
  rationale: "OS security requirements"
```

#### **TV Platform Specific**
```yaml
Deployment:
  strategy: "Platform stores (Samsung, LG, Apple TV)"
  rationale: "TV platform distribution requirements"

Input Handling:
  method: "Remote control navigation"
  rationale: "TV-specific user interaction"

UI Adaptation:
  approach: "10-foot UI design"
  rationale: "Living room viewing distance"
```

### **Decision Matrix: Unified vs Platform-Specific**
```yaml
Choose_Unified_When:
  - Business logic and rules
  - API communication patterns
  - Authentication and authorization
  - Error handling and logging
  - Data validation and transformation
  - Analytics event definitions

Choose_Platform_Specific_When:
  - Deployment and distribution
  - Storage and persistence layers
  - UI/UX patterns and navigation
  - Platform-specific APIs and features
  - Performance optimizations
  - Native integrations
```

---

## 🏗️ Repository Architecture Strategy

### **Repository Organization**

#### **Backend Microservices: Multi-repo approach**
```bash
# ✅ One microservice = One repository
catalog-api/                    # Product catalog service
├── package.json               # npm for single service
├── src/
├── tests/
└── Dockerfile

user-api/                      # User management service
├── package.json               # npm for single service
├── src/
├── tests/
└── Dockerfile

order-api/                     # Order processing service
├── package.json               # npm for single service
├── src/
├── tests/
└── Dockerfile
```
**Rationale**: Independent deployment, team ownership, service isolation

#### **Frontend Platforms: Monorepo approach**
```bash
# ✅ Multiple platforms in single repository
tanqory-platform/               # Frontend monorepo
├── pnpm-workspace.yaml        # pnpm for monorepo
├── package.json
├── packages/
│   ├── @tanqory/ui-components/ # Shared UI components
│   ├── @tanqory/api-client/    # API client
│   ├── @tanqory/shared-utils/  # Utilities
│   └── @tanqory/design-tokens/ # Design system
└── apps/
    ├── web-app/               # Next.js web application
    ├── mobile-app/            # React Native application
    ├── desktop-app/           # Electron application
    └── admin-dashboard/       # Admin interface
```
**Rationale**: Shared UI components, unified state management, atomic releases

#### **Shared Libraries: Monorepo with pnpm workspaces**
```bash
# ✅ Cross-platform shared libraries
tanqory-sdk/                   # SDK monorepo
├── pnpm-workspace.yaml       # pnpm for monorepo
├── package.json
└── packages/
    ├── @tanqory/core-business/    # Business logic
    ├── @tanqory/api-client/       # API communication
    ├── @tanqory/auth-sdk/         # Authentication
    ├── @tanqory/payment-sdk/      # Payment processing
    ├── @tanqory/analytics-sdk/    # Analytics tracking
    └── @tanqory/dev-tools/        # Development utilities
```
**Rationale**: Version synchronization, easier refactoring, shared tooling

#### **Infrastructure: Dedicated repositories per domain**
```bash
# ✅ Infrastructure separation
tanqory-infrastructure/        # Terraform, K8s configs
├── package.json              # npm for infrastructure tools
├── terraform/
├── kubernetes/
└── helm-charts/

tanqory-cicd-pipelines/       # CI/CD configurations
├── package.json              # npm for pipeline tools
├── github-actions/
├── azure-pipelines/
└── deployment-scripts/
```
**Rationale**: Clear separation of concerns, different team ownership

### **Monorepo vs Multi-repo Decision Matrix**
```yaml
Use_Monorepo_When:
  - Shared code dependencies (UI components, utilities)
  - Coordinated releases required (frontend platforms)
  - Same team maintains multiple related packages
  - Atomic changes across multiple packages needed

Use_Multi_repo_When:
  - Independent service lifecycle (microservices)
  - Different team ownership and responsibility
  - Independent deployment schedules
  - Service isolation and security boundaries required
```

> **Hybrid Strategy**: Selective use of monorepo for shared code, multi-repo for microservices. Best of both approaches based on use case.

---

## 📝 Version Update Rules

### **Update Frequency**
- Monthly review cycle
- Quarterly major updates

### **Approval Process**
1. **Proposal**: RFC document with justification
2. **Testing**: Cross-platform compatibility testing
3. **Approval**: CTO Office sign-off required
4. **Communication**: 2-week notice to engineering teams
5. **Implementation**: Phased rollout with monitoring

### **Rollback Requirements**
- All major version updates must include rollback plan
- Automated rollback triggers for critical issues
- Post-update monitoring for 48 hours

---

## 📖 Usage Guidelines

### **Reference Format**
When referencing technology versions in documentation:

```markdown
> **Technology Stack**: See official versions in `memory/core/00_official_technology_versions.md`

Framework: Next.js (see official versions)
Runtime: Node.js (see official versions)
Language: TypeScript (see official versions)
```

### **Prohibited Actions**
- ❌ DO NOT specify versions directly in other documentation files
- ❌ DO NOT use outdated versions without approval
- ❌ DO NOT introduce new technologies without CTO approval

### **Required Actions**
- ✅ ALL documentation must reference this file for versions
- ✅ UPDATE this file ONLY when versions change officially
- ✅ NOTIFY engineering teams before major version updates

---

## 🏛️ Governance & Compliance

### **Ownership**
- **Primary Owner**: CTO Office
- **Secondary Contact**: Platform Engineering Team
- **Emergency Contact**: On-call Engineering Lead

### **Compliance Standards**
- SOX 404 compliance
- Enterprise security requirements
- Audit trail for all changes
- Documentation standards adherence

### **Change Management**
- All changes tracked in git
- Approval workflow required
- Impact assessment mandatory
- Communication plan required

---

## 🚨 Emergency Procedures

### **Critical Security Updates**
1. Immediate CTO approval
2. Update this registry
3. Emergency deployment across platforms
4. Post-incident review and documentation

### **Rollback Procedures**
1. Identify affected systems
2. Revert registry to previous stable versions
3. Execute rollback deployments
4. Document lessons learned
5. Update procedures if needed

---

---

## 🎯 **SINGLE SOURCE OF TRUTH NOTICE**

> **IMPORTANT**: This document is the **ONLY authoritative source** for technology versions and architecture decisions at Tanqory.

### **Documentation Standards**
- ✅ **All other documents MUST reference this file** for technology versions
- ❌ **DO NOT duplicate version information** in other documentation files
- ✅ **Reference format**: "See official versions in `memory/core/00_official_technology_versions.md`"
- ✅ **Updates to this document require CTO approval** and architecture review

### **Platform-Specific vs Unified Documentation Guidelines**
```yaml
When_Writing_Documentation:
  unified_approaches:
    what_to_document: "Business logic, API patterns, authentication flows"
    where_to_document: "Core documentation with cross-platform examples"
    reference_style: "This pattern applies to ALL platforms"
    example: "@tanqory/api-client usage is identical across web, mobile, desktop"

  platform_specific_approaches:
    what_to_document: "UI patterns, deployment, storage, native integrations"
    where_to_document: "Platform-specific documentation sections"
    reference_style: "This pattern is specific to [PLATFORM]"
    example: "React Navigation is specific to mobile, Next.js Router is specific to web"

Documentation_Structure:
  shared_concepts: "Document once in core, reference from platform docs"
  platform_variations: "Document in platform-specific sections with clear rationale"
  decision_rationale: "Always include WHY a technology was chosen for specific use case"

Cross_References:
  format: "For web implementation, see [web-specific docs]. For mobile, see [mobile-specific docs]"
  unified_reference: "For unified approach across platforms, see [core docs]"
```

### **Decision Context Documentation Requirements**
```yaml
All_Technology_Decisions_Must_Include:
  business_context:
    - Scale requirements (users, data, transactions)
    - Performance requirements (latency, throughput)
    - Timeline constraints (time to market, migration windows)

  technical_context:
    - Team expertise and learning curve
    - Integration requirements with existing systems
    - Operational complexity and maintenance burden

  alternatives_considered:
    - At least 2-3 alternatives evaluated
    - Pros and cons of each alternative
    - Specific rejection reasons with quantifiable impact

  success_metrics:
    - Measurable criteria for technology choice success
    - Timeline for evaluation and potential re-evaluation
    - Rollback plan if technology choice fails

Documentation_Template:
  ```yaml
  Technology_Name:
    decision_context:
      business_requirements: "Specific business needs"
      technical_constraints: "Technical limitations and requirements"
      team_context: "Team skills and operational capacity"

    rationale:
      primary_benefits: "Main reasons for choosing this technology"
      performance_characteristics: "Performance and scalability benefits"
      ecosystem_fit: "How it fits with other technology choices"

    alternatives_considered:
      option_1:
        pros: "Advantages of this alternative"
        cons: "Disadvantages and limitations"
        rejection_reason: "Specific reason for not choosing"

    success_metrics:
      - "Measurable outcome 1"
      - "Measurable outcome 2"
      - "Timeline for evaluation"
  ```
```

### **Compliance Requirements**
- All new projects MUST use technologies and versions specified in this document
- Deviations require written Architecture Review Board approval
- Legacy systems have 12 months to migrate to current standards
- Emergency exceptions require CTO approval within 24 hours

### **Last Migration Updates**
- **September 16, 2025**: Backend framework standardized to Express.js (from NestJS)
- **September 16, 2025**: Repository strategy clarified (hybrid monorepo/multi-repo with concrete examples)
- **September 16, 2025**: Database driver standardized to Mongoose ODM (final decision)
- **September 16, 2025**: Monitoring stack clarified (Sentry primary across ALL platforms, DataDog optional for enterprise only)
- **September 16, 2025**: API standards prioritized (REST primary, GraphQL/gRPC supplementary)
- **September 16, 2025**: Package manager examples added (npm single repo, pnpm monorepo with complete examples)

### **Critical Standardization Decisions**
```yaml
Database_ODM: "Mongoose (FINAL DECISION)"
Rationale: "Better developer experience, TypeScript integration, enterprise features"

Monitoring_Primary: "Sentry (FINAL DECISION for ALL platforms)"
Rationale: "Unified error tracking, cross-platform support, better developer experience"
Secondary: "DataDog (Enterprise customers only, optional advanced dashboards)"

API_Standards_Priority: "REST PRIMARY, GraphQL/gRPC SUPPLEMENTARY (FINAL DECISION)"
Rationale: "REST for standard operations, GraphQL for complex data only, gRPC for high-performance only"
Default_Rule: "When in doubt, use REST APIs with OpenAPI 3.0.3"

Package_Manager_Strategy: "npm single repos, pnpm monorepos (FINAL DECISION)"
Rationale: "npm simplicity for single projects, pnpm performance for monorepos"
Performance_Benefit: "pnpm 2-3x faster installation, 60-70% less disk space for monorepos"
```

---

**Last Updated**: September 16, 2025
**Document Version**: 1.0.0
**Classification**: CONFIDENTIAL
**Status**: ACTIVE
**Review Cycle**: Monthly
**Next Review**: October 16, 2025