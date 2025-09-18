---
title: Enterprise Coding Standards & JavaScript Style Guide
version: 2.0
owner: Chief Technology Officer
last_reviewed: 2025-09-16
next_review: 2025-10-16
classification: CONFIDENTIAL
technical_scope: [JavaScript, TypeScript, Enterprise_Development]
eslint_config: "@tanqory/eslint-config"
primary_technology_stack: "Node.js + TypeScript + Multi-Platform Architecture (see official technology versions)"
---

# Enterprise Coding Standards & Tanqory Technology Stack

> **Core Memory**: Comprehensive coding standards and unified technology stack for billion-dollar scale platform development with enterprise-grade JavaScript/TypeScript guidelines, automated tooling, and AI-first development practices

## 🎯 **Tanqory Primary Technology Stack**

> **Official Technology Versions**: See complete specifications in [`memory/core/00_official_technology_versions.md`](00_official_technology_versions.md)

### **Technology Stack Overview**
Our unified technology stack is centrally managed to ensure consistency across all platforms and services. This document focuses on **coding standards and best practices** rather than specific versions.

**Key Technology Categories:**
- **Core Languages**: TypeScript (primary), Swift, Kotlin, Python, Go, Rust
- **Runtime Platforms**: Node.js (primary), Deno, Bun alternatives
- **Frontend Frameworks**: Next.js (web), React Native (mobile), Electron (desktop)
- **Backend Architecture**: Express.js, microservices, API standards
- **Database Strategy**: MongoDB (primary), Redis (cache), ClickHouse (analytics)

> **Note**: For exact versions, compatibility matrices, and update schedules, always reference the official technology versions registry.

**For complete technology specifications including frameworks, databases, cloud infrastructure, development tools, and all version requirements, see:**
- [`memory/core/00_official_technology_versions.md`](00_official_technology_versions.md)

### **Technology Choice Rationale**

#### **🎯 Core Language Decision: TypeScript**

> **Version**: See official technology versions in [`memory/core/00_official_technology_versions.md`](00_official_technology_versions.md)
```yaml
Rationale:
  - Type Safety: Catches 60%+ of runtime errors at compile time
  - Developer Productivity: IntelliSense, refactoring, code navigation
  - Ecosystem Maturity: Excellent tooling and library support
  - Team Scalability: Easier onboarding and code maintenance
  - Future-Proof: Microsoft's long-term commitment and active development

Performance Benefits:
  - Compile-time optimization eliminates runtime type checking
  - Tree-shaking and dead code elimination
  - Better IDE support increases development velocity
  - Reduced debugging time in production

Migration Path:
  - JavaScript → TypeScript: Gradual migration with allowJs: true
  - Legacy systems: Incremental adoption with .d.ts files
  - Third-party libraries: Community-maintained or auto-generated types
```

#### **🎯 Backend Runtime: Node.js**

> **Version**: See official technology versions in [`memory/core/00_official_technology_versions.md`](00_official_technology_versions.md)
```yaml
Rationale:
  - Performance: V8 engine optimizations, 40%+ faster than previous versions
  - Unified Language: Same TypeScript across frontend and backend
  - Ecosystem: Largest package ecosystem (2M+ packages)
  - Enterprise Support: LTS versions with 30-month support lifecycle
  - Scalability: Event-driven architecture handles high concurrency

Alternative Options:
  - Deno 2.0+: Built-in TypeScript, security-first, Web API compatibility
  - Bun 1.1+: 3x faster startup, built-in bundler, Jest-compatible test runner

Cost Considerations:
  - Developer Hiring: Abundant talent pool reduces recruitment costs
  - Training: Minimal learning curve for JavaScript developers
  - Tooling: Mature ecosystem reduces development time
  - Hosting: Excellent cloud provider support (AWS, GCP, Azure)
```

#### **🎯 Web Platform: Next.js**

> **Version**: See official technology versions in [`memory/core/00_official_technology_versions.md`](00_official_technology_versions.md)
```yaml
Rationale:
  - Performance: React Server Components reduce bundle size by 50%+
  - SEO: Built-in SSR/SSG with automatic optimization
  - Developer Experience: File-based routing, built-in optimization
  - Production Ready: Used by Netflix, TikTok, Twitch, Hulu
  - Framework Stability: Vercel's commercial backing ensures longevity

Performance Metrics:
  - First Contentful Paint: <1.5s (vs 3s+ with SPA)
  - Core Web Vitals: 95+ scores across all metrics
  - Bundle Splitting: Automatic code splitting and optimization
  - Image Optimization: WebP/AVIF conversion, lazy loading

Business Impact:
  - SEO Performance: 40%+ better search rankings vs SPAs
  - Conversion Rates: Faster loading increases conversion by 2-7%
  - Maintenance: Less configuration and boilerplate code
```

#### **🎯 Mobile Platform: React Native**

> **Version**: See official technology versions in [`memory/core/00_official_technology_versions.md`](00_official_technology_versions.md)
```yaml
Rationale:
  - Code Sharing: 70%+ code reuse between iOS and Android
  - Performance: New Architecture (Fabric + TurboModules) = near-native performance
  - Team Efficiency: Web developers can contribute to mobile
  - Meta's Investment: $50M+ annual investment, used in Facebook, Instagram
  - Enterprise Adoption: Microsoft, Shopify, Discord use React Native

New Architecture Benefits:
  - Fabric Renderer: Direct access to native UI thread
  - TurboModules: Lazy loading of native modules
  - JSI (JavaScript Interface): Direct communication with native
  - Hermes Engine: Optimized for mobile, faster startup times

Cost Analysis:
  - Development: 40%+ faster than native iOS + Android separate teams
  - Maintenance: Single codebase reduces ongoing maintenance costs
  - Time to Market: 50%+ faster feature delivery
  - Talent: Shared resources between web and mobile teams
```

#### **🎯 Database Strategy: MongoDB + Redis + ClickHouse**
```yaml
Primary Database - MongoDB 7+:
  Rationale:
    - Document Model: Perfect for product catalogs, user profiles
    - Horizontal Scaling: Sharding built-in for billion-dollar scale
    - Schema Flexibility: Rapid iteration without migrations
    - Query Performance: Advanced indexing and aggregation
    - Enterprise Features: Atlas managed service, security compliance

Caching Layer - Redis 7+:
  Rationale:
    - Performance: Sub-millisecond response times
    - Data Structures: Lists, sets, sorted sets for complex operations
    - Pub/Sub: Real-time features and microservice communication
    - Persistence: RDB + AOF for data durability
    - Clustering: Horizontal scaling to terabytes

Analytics Database - ClickHouse 23+:
  Rationale:
    - OLAP Performance: 100-1000x faster than traditional databases
    - Column Storage: Optimal for analytics and reporting queries
    - Compression: 90%+ data compression reduces storage costs
    - Real-time: Insert and query data simultaneously
    - SQL Compatibility: Easy adoption for data analysts

Integration Benefits:
  - MongoDB: Operational data (products, users, orders)
  - Redis: Session storage, caching, real-time data
  - ClickHouse: Analytics, reporting, business intelligence
  - Cost Optimization: Right tool for each data pattern
```

## Table of Contents
- [Quick Start & Tooling](#quick-start--tooling)
- [JavaScript Style Guide (Tanqory Standard)](#javascript-style-guide-tanqory-standard)
- [Enterprise Development Principles](#enterprise-development-principles)
- [Project Structure](#project-structure)
- [TypeScript/JavaScript Standards](#typescriptjavascript-standards)
- [API Service Patterns](#api-service-patterns)
- [Database Patterns](#database-patterns)
- [Testing Standards](#testing-standards)
- [Error Handling](#error-handling)
- [Logging Standards](#logging-standards)
- [AI-Specific Guidelines](#ai-specific-guidelines)
- [Code Review Checklist](#code-review-checklist)
- [Related Prompt Templates](#related-prompt-templates)

## 🔗 **Related Prompt Templates & Multi-Platform Support**
> **AI Agents**: Use these prompt templates when generating or reviewing code across all platforms

### **Primary Code Generation Templates**
- `docs/prompts/code-generation.md` - Enterprise code generation patterns and best practices
- `docs/prompts/microservice-design.md` - Microservice architecture implementation following coding standards
- `docs/prompts/multi-platform-architecture.md` - Cross-platform development patterns for web, mobile, desktop, and specialized platforms

### **Platform-Specific Templates**
- `docs/prompts/web-development.md` - Next.js/React web application standards
- `docs/prompts/mobile-development.md` - React Native mobile application patterns
- `docs/prompts/desktop-development.md` - Electron desktop application guidelines
- `docs/prompts/platform-optimization.md` - Performance optimization across platforms

### **Quality Assurance Templates**
- `docs/prompts/testing.md` - Comprehensive testing strategies aligned with coding standards
- `docs/prompts/core/03_core_security_review.md` - Code security review and vulnerability assessment
- `docs/prompts/performance-optimization.md` - Code performance optimization techniques

### **API Development Templates**
- `docs/prompts/core/03_core_api_standards.md` - API implementation following enterprise coding patterns
- `docs/prompts/database-schema.md` - Database interaction patterns and ORM usage

### **Multi-Platform Integration Context**
When generating code, AI agents should:
1. **Follow patterns** defined in this document for all JavaScript/TypeScript code
2. **Apply platform standards** from `20_multi_platform_development_standards.md`
3. **Use platform implementations** from `21_platform_specific_implementations.md`
4. **Follow deployment patterns** from `22_cross_platform_deployment.md`
5. **Implement APIs** according to `03_core_api_standards.md` standards
6. **Apply security measures** from `04_core_security.md` requirements
7. **Include monitoring** per `08_monitoring_observability.md` guidelines
8. **Ensure compliance** with `06_ai_workflow_rules.md` automation requirements

---

## Quick Start & Tooling

### **ESLint Configuration Setup**
```bash
# For projects without React
npm install --save-dev @tanqory/eslint-config-base

# For React projects
npm install --save-dev @tanqory/eslint-config

# Install Prettier for code formatting
npm install --save-dev prettier eslint-config-prettier
```

### **ESLint Configuration**
```json
// .eslintrc.json
{
  "extends": [
    "@tanqory/eslint-config",
    "prettier"
  ],
  "env": {
    "node": true,
    "es2022": true
  },
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module"
  },
  "rules": {
    // Tanqory-specific overrides
    "@typescript-eslint/explicit-function-return-type": "error",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### **Prettier Configuration**
```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

### **VS Code Settings**
```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "eslint.validate": ["javascript", "typescript"],
  "typescript.preferences.quoteStyle": "single"
}
```

---

## JavaScript Style Guide (Tanqory Standard)

### **Core JavaScript Rules**

#### **Variables & References**
```javascript
// ✅ GOOD: Use const for all references
const user = { name: 'John', age: 30 };
const items = [1, 2, 3];

// ✅ GOOD: Use let for reassignment
let counter = 0;
counter += 1;

// ❌ BAD: Never use var
var isActive = true; // ❌

// ✅ GOOD: Destructuring for multiple properties
const { firstName, lastName, email } = user;

// ✅ GOOD: Array destructuring
const [first, second] = items;
```

#### **Functions & Arrow Functions**
```javascript
// ✅ GOOD: Named function expressions
const calculateTotal = function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
};

// ✅ GOOD: Arrow functions for callbacks
const activeUsers = users.filter((user) => user.isActive);

// ✅ GOOD: Always use parentheses around arrow function parameters
const processUser = (user) => ({ ...user, processed: true });

// ✅ GOOD: Use implicit return for single expressions
const userNames = users.map((user) => user.name);

// ✅ GOOD: Use explicit return for multi-line
const processData = (data) => {
  const cleaned = sanitizeData(data);
  return validateData(cleaned);
};
```

#### **Objects & Arrays**
```javascript
// ✅ GOOD: Object literal syntax
const user = {
  name: 'John',
  email: 'john@example.com',
  isActive: true,
};

// ✅ GOOD: Object shorthand
const name = 'John';
const age = 30;
const user = { name, age }; // Instead of { name: name, age: age }

// ✅ GOOD: Method shorthand
const calculator = {
  add(a, b) {
    return a + b;
  },

  multiply(a, b) {
    return a * b;
  },
};

// ✅ GOOD: Array spread for copying
const newItems = [...existingItems, newItem];

// ✅ GOOD: Object spread for copying
const updatedUser = { ...user, isActive: false };
```

#### **Classes & Modules**
```javascript
// ✅ GOOD: Use class syntax
class UserService {
  constructor(private userRepository: UserRepository) {}

  async createUser(userData: CreateUserData): Promise<User> {
    const validation = this.validateUserData(userData);
    if (!validation.isValid) {
      throw new ValidationError(validation.errors);
    }

    return this.userRepository.create(userData);
  }

  private validateUserData(data: CreateUserData): ValidationResult {
    // validation logic
  }
}

// ✅ GOOD: ES6 Modules
import { UserService } from './user.service';
import { validateEmail } from '../utils/validation';

export default UserService;
export { UserValidation };
```

#### **Async/Await Patterns**
```javascript
// ✅ GOOD: Use async/await over Promises
async function fetchUserData(userId: string): Promise<User> {
  try {
    const user = await userRepository.findById(userId);
    const profile = await profileService.getProfile(userId);

    return {
      ...user,
      profile,
    };
  } catch (error) {
    logger.error('Failed to fetch user data', { userId, error });
    throw new UserFetchError(`Unable to fetch user: ${userId}`);
  }
}

// ✅ GOOD: Handle multiple async operations
async function processUsers(userIds: string[]): Promise<ProcessedUser[]> {
  const users = await Promise.all(
    userIds.map((id) => fetchUserData(id))
  );

  return users.map((user) => processUser(user));
}
```

### **Enterprise-Specific Rules**

#### **Error Handling**
```javascript
// ✅ GOOD: Custom error classes for different scenarios
class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public code: string = 'VALIDATION_ERROR'
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

class BusinessLogicError extends Error {
  constructor(
    message: string,
    public operation: string,
    public context: Record<string, unknown> = {}
  ) {
    super(message);
    this.name = 'BusinessLogicError';
  }
}

// ✅ GOOD: Comprehensive error handling
async function processPayment(paymentData: PaymentData): Promise<PaymentResult> {
  try {
    // Validate input
    const validation = validatePaymentData(paymentData);
    if (!validation.isValid) {
      throw new ValidationError(
        'Invalid payment data',
        validation.field,
        'INVALID_PAYMENT_DATA'
      );
    }

    // Process payment
    const result = await paymentGateway.charge(paymentData);

    // Log success
    logger.info('Payment processed successfully', {
      paymentId: result.id,
      amount: paymentData.amount,
      userId: paymentData.userId,
    });

    return result;
  } catch (error) {
    // Log error with context
    logger.error('Payment processing failed', {
      paymentData: sanitizePaymentData(paymentData),
      error: error.message,
      stack: error.stack,
    });

    // Re-throw with appropriate error type
    if (error instanceof ValidationError) {
      throw error;
    }

    throw new BusinessLogicError(
      'Payment processing failed',
      'processPayment',
      { originalError: error.message }
    );
  }
}
```

#### **Type Safety & Documentation**
```typescript
// ✅ GOOD: Comprehensive TypeScript interfaces
interface CreateUserRequest {
  /** User's email address - must be unique */
  email: string;

  /** User's full name */
  name: string;

  /** User's role in the system */
  role: 'admin' | 'user' | 'moderator';

  /** Optional user preferences */
  preferences?: {
    theme: 'light' | 'dark';
    notifications: boolean;
    language: string;
  };
}

// ✅ GOOD: Generic types for reusability
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
  timestamp: Date;
  requestId: string;
}

// ✅ GOOD: Utility types for enterprise patterns
type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
type AuditableEntity<T> = T & {
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
};
```

### **Performance & Security Rules**

```javascript
// ✅ GOOD: Debouncing for frequent operations
const debouncedSearch = debounce(async (query: string) => {
  const results = await searchService.search(query);
  updateSearchResults(results);
}, 300);

// ✅ GOOD: Input sanitization
const sanitizeUserInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>"'&]/g, (char) => {
      const entities = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;',
      };
      return entities[char] || char;
    });
};

// ✅ GOOD: Memory-efficient data processing
const processLargeDataset = async function* (data: LargeDataset) {
  for (const chunk of data.chunks(1000)) {
    const processed = await processChunk(chunk);
    yield processed;
  }
};
```

### **AI-Friendly Code Patterns**

```javascript
// ✅ GOOD: Self-documenting function names and clear intentions
const shouldAllowUserToAccessResource = (
  user: User,
  resource: Resource,
  permissions: Permission[]
): boolean => {
  const hasRequiredRole = user.roles.some((role) =>
    resource.requiredRoles.includes(role)
  );

  const hasExplicitPermission = permissions.some((permission) =>
    permission.userId === user.id && permission.resourceId === resource.id
  );

  return hasRequiredRole || hasExplicitPermission;
};

// ✅ GOOD: Predictable data transformations
const transformUserForAPI = (user: DatabaseUser): ApiUser => ({
  id: user._id.toString(),
  name: user.fullName,
  email: user.emailAddress,
  isActive: user.status === 'active',
  lastLoginAt: user.lastLoginTimestamp?.toISOString() || null,
  roles: user.assignedRoles.map((role) => role.name),
});
```

---

## Enterprise Development Principles

### **Multi-Platform Enterprise Code Philosophy**
```yaml
Core Principles:
1. Readability over cleverness - Code is read 10x more than written
2. Explicit over implicit - Clear intentions, no magic
3. Composition over inheritance - Flexible, maintainable designs
4. Fail fast and loudly - Early error detection
5. Testable by design - Every function should be unit testable
6. Security by default - Never trust input, always validate
7. Performance awareness - Billion-dollar scale considerations
8. Compliance first - SOX, GDPR, audit trail requirements
9. Documentation as code - Self-documenting patterns
10. AI-friendly patterns - Predictable, analyzable code structures
11. Platform agnostic - Write once, adapt everywhere
12. Unified experience - Consistent UX across all platforms
13. Accessibility first - WCAG 2.1 AA compliance on all platforms
14. Offline resilience - Graceful degradation without connectivity
15. Resource conscious - Optimize for each platform's constraints

Multi-Platform Standards:
1. Shared Business Logic - Core logic lives in shared libraries
2. Platform Adaptation - UI/UX adapted to platform conventions
3. Unified State Management - Consistent data flow across platforms
4. Cross-Platform Testing - Automated testing on all target platforms
5. Progressive Enhancement - Features degrade gracefully
6. Performance Budgets - Platform-specific performance targets
7. Responsive Design - Adaptive layouts for different screen sizes
8. Native Integration - Platform-specific features when appropriate
```

### **Naming Conventions**
```typescript
// Variables & Functions: camelCase
const userName = 'john.doe';
const calculateTotalPrice = (items: CartItem[]) => { };

// Constants: SCREAMING_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_PAGE_SIZE = 20;

// Classes & Interfaces: PascalCase
class UserService { }
interface ProductData { }

// Files & Directories: kebab-case
user-service.ts
product-catalog/
auth-middleware.ts

// Environment Variables: SCREAMING_SNAKE_CASE
DATABASE_URL=mongodb://localhost:27017
JWT_SECRET_KEY=xyz123
```

### **File Organization**
```
src/
   controllers/           # HTTP request handlers
   services/             # Business logic
   repositories/         # Data access layer
   models/              # Data models & schemas
   middleware/          # Express middleware
   utils/               # Helper functions
   types/               # TypeScript type definitions
   config/              # Configuration files
   __tests__/           # Test files
```

---

## Project Structure

### **Multi-Platform Project Structure Template**
```
# Backend Service Structure
services/catalog-api/
   src/
      controllers/
         product.controller.ts
         category.controller.ts
         health.controller.ts
      services/
         product.service.ts
         category.service.ts
         cache.service.ts
      repositories/
         product.repository.ts
         category.repository.ts
      models/
         product.model.ts
         category.model.ts
      middleware/
         auth.middleware.ts
         validation.middleware.ts
         rate-limit.middleware.ts
      utils/
         logger.util.ts
         validation.util.ts
         crypto.util.ts
      types/
         api.types.ts
         product.types.ts
         common.types.ts
      config/
         database.config.ts
         redis.config.ts
         environment.config.ts
      __tests__/
         unit/
         integration/
         e2e/
   package.json
   tsconfig.json
   .eslintrc.json
   .prettierrc
   Dockerfile
   docker-compose.yml

# Web Platform Structure (Next.js)
web-platform/
   app/
      (auth)/
      (dashboard)/
      api/
      globals.css
      layout.tsx
      page.tsx
   components/
      ui/
      forms/
      layouts/
      features/
   lib/
   hooks/
   store/
   styles/
   public/
   middleware.ts
   next.config.js

# Mobile Platform Structure (React Native)
mobile-platform/
   src/
      components/
         ui/
         forms/
         navigation/
      screens/
         auth/
         home/
         product/
         profile/
      navigation/
      hooks/
      store/
      services/
      utils/
      types/
      constants/
   ios/
   android/
   metro.config.js
   react-native.config.js

# Desktop Platform Structure (Electron)
desktop-platform/
   src/
      main/          # Main process
         main.ts
         menu.ts
         protocol.ts
         updater.ts
      renderer/       # Renderer process
         components/
         pages/
         hooks/
         utils/
      preload/       # Preload scripts
         api.ts
         security.ts
      shared/        # Shared types and utilities
   build/
      icons/
      installers/
   electron-builder.json
   forge.config.js

# Shared Libraries Structure
shared-libraries/
   @tanqory/
      api-client/
         src/
         tests/
         docs/
         package.json
      ui-components/
         src/
            web/
            mobile/
            desktop/
         tests/
         storybook/
         package.json
      platform-utils/
         src/
            platform-detection/
            cross-platform-storage/
            unified-analytics/
         tests/
         package.json
```

### **Multi-Platform Architecture Pattern**
```yaml
Platform Independence:
  - Each platform = dedicated implementation
  - Shared business logic via libraries
  - Platform-specific optimizations
  - Unified API contracts (OpenAPI 3.0.3)
  - Cross-platform state synchronization

Platform Naming:
  # Backend Services
  - {domain}-api (e.g., user-api, catalog-api)
  - {domain}-worker (e.g., email-worker, analytics-worker)
  - {domain}-gateway (e.g., payment-gateway)

  # Frontend Platforms
  - {domain}-web (e.g., catalog-web, admin-web)
  - {domain}-mobile (e.g., catalog-mobile, driver-mobile)
  - {domain}-desktop (e.g., admin-desktop, pos-desktop)
  - {domain}-tv (e.g., catalog-tv, media-tv)
  - {domain}-watch (e.g., notifications-watch, fitness-watch)
  - {domain}-car (e.g., navigation-car, music-car)
  - {domain}-vision (e.g., shopping-vision, training-vision)

Shared Library Naming:
  - @tanqory/{library-name} (e.g., @tanqory/api-client)
  - @tanqory/platform-{platform} (e.g., @tanqory/platform-mobile)
  - @tanqory/{domain}-types (e.g., @tanqory/catalog-types)

Platform-Specific Standards:
  # Web Platform (Next.js)
  - Server Components for performance
  - Progressive Web App features
  - SEO optimization
  - Responsive design patterns

  # Mobile Platform (React Native)
  - Native module integration
  - Platform-specific UI components
  - Offline-first architecture
  - Push notification handling

  # Desktop Platform (Electron)
  - Security hardening
  - Auto-updater integration
  - Native menu systems
  - File system access

  # Specialized Platforms
  - TV: Remote control navigation
  - Watch: Complication widgets
  - Car: Voice-first interfaces
  - Vision: Spatial computing
```

---

## TypeScript/JavaScript Standards

### **Controller Layer Pattern**
```typescript
// ✅ Controller handles HTTP concerns only (Express.js)
import express, { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { Logger } from '../utils/logger';
import { validateRequest } from '../middleware/validation.middleware';
import { authenticateUser } from '../middleware/auth.middleware';
import { CreateProductDto, GetProductsQuery } from '../types/product.types';

export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly logger: Logger
  ) {}

  // GET /api/v1/products - Get paginated products
  async getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as GetProductsQuery;
      const result = await this.productService.getProducts(query);

      res.status(200).json({
        data: result,
        success: true,
        message: 'Products retrieved successfully',
        timestamp: new Date(),
        requestId: req.headers['x-request-id'] || generateRequestId()
      });
    } catch (error) {
      this.logger.error('Failed to get products', { error, query: req.query });
      next(error);
    }
  }

  // POST /api/v1/products - Create new product
  async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const createProductDto = req.body as CreateProductDto;
      const user = req.user; // From auth middleware

      const result = await this.productService.createProduct(
        createProductDto,
        user.id
      );

      res.status(201).json({
        data: result,
        success: true,
        message: 'Product created successfully',
        timestamp: new Date(),
        requestId: req.headers['x-request-id'] || generateRequestId()
      });
    } catch (error) {
      this.logger.error('Failed to create product', { error, body: req.body });
      next(error);
    }
  }

  // Router setup
  getRouter(): express.Router {
    const router = express.Router();

    router.get('/', this.getProducts.bind(this));
    router.post('/',
      authenticateUser,
      validateRequest(CreateProductDto),
      this.createProduct.bind(this)
    );

    return router;
  }
}
```

### **Service Layer Pattern**
```typescript
// ✅ Service contains business logic (Express.js with Dependency Injection)
import { ProductRepository } from '../repositories/product.repository';
import { CategoryService } from './category.service';
import { EventBus } from '../events/event-bus';
import { Logger } from '../utils/logger';
import {
  CreateProductDto,
  Product,
  BusinessLogicError,
  ProductCreatedEvent
} from '../types';

export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryService: CategoryService,
    private readonly eventBus: EventBus,
    private readonly logger: Logger
  ) {}

  async createProduct(
    createProductDto: CreateProductDto,
    userId: string
  ): Promise<Product> {
    // Business validation
    await this.validateProductData(createProductDto);

    // Check category exists
    const category = await this.categoryService.findById(
      createProductDto.categoryId
    );
    if (!category) {
      throw new BusinessLogicError(
        'Category not found',
        'createProduct',
        { categoryId: createProductDto.categoryId }
      );
    }

    // Create product
    const productData = {
      ...createProductDto,
      slug: this.generateSlug(createProductDto.name),
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const product = await this.productRepository.create(productData);

    // Emit domain event
    await this.eventBus.publish(
      new ProductCreatedEvent(product.id, userId, product)
    );

    this.logger.info('Product created', {
      productId: product.id,
      name: product.name,
      categoryId: product.categoryId,
      createdBy: userId
    });

    return product;
  }

  private async validateProductData(data: CreateProductDto): Promise<void> {
    const validation = await this.productValidator.validate(data);
    if (!validation.isValid) {
      throw new ValidationError(
        'Invalid product data',
        validation.field,
        'INVALID_PRODUCT_DATA'
      );
    }
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
```

### **Repository Layer Pattern**
```typescript
// ✅ Repository handles data access only (Express.js + Mongoose ODM)
import { Model, Types } from 'mongoose';
import { Logger } from '../utils/logger';
import {
  CreateProductData,
  Product,
  ProductDocument,
  DatabaseError,
  PaginatedResult,
  ProductQuery,
  PaginationOptions
} from '../types';

export class ProductRepository {
  constructor(
    private readonly productModel: Model<ProductDocument>,
    private readonly logger: Logger
  ) {}

  async create(productData: CreateProductData): Promise<Product> {
    try {
      const product = new this.productModel(productData);
      const saved = await product.save();

      return this.transformToEntity(saved);
    } catch (error) {
      this.logger.error('Failed to create product', { error, productData });
      throw new DatabaseError('Failed to create product', 'create', error);
    }
  }

  async findById(id: string): Promise<Product | null> {
    try {
      const product = await this.productModel
        .findById(id)
        .populate('category')
        .lean()
        .exec();

      return product ? this.transformToEntity(product) : null;
    } catch (error) {
      this.logger.error('Failed to find product by ID', { error, id });
      throw new DatabaseError('Failed to find product', 'findById', error);
    }
  }

  async findWithPagination(
    query: ProductQuery,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<Product>> {
    try {
      const filter = this.buildFilter(query);
      const sort = this.buildSort(query.sortBy, query.sortOrder);

      const [products, total] = await Promise.all([
        this.productModel
          .find(filter)
          .sort(sort)
          .skip(pagination.offset)
          .limit(pagination.limit)
          .populate('category')
          .lean()
          .exec(),
        this.productModel.countDocuments(filter).exec()
      ]);

      return {
        data: products.map(p => this.transformToEntity(p)),
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(total / pagination.limit)
      };
    } catch (error) {
      this.logger.error('Failed to find products with pagination', {
        error,
        query,
        pagination
      });
      throw new DatabaseError(
        'Failed to find products',
        'findWithPagination',
        error
      );
    }
  }

  private buildFilter(query: ProductQuery): FilterQuery<ProductDocument> {
    const filter: FilterQuery<ProductDocument> = {};

    if (query.name) {
      filter.name = { $regex: query.name, $options: 'i' };
    }

    if (query.categoryId) {
      filter.categoryId = query.categoryId;
    }

    if (query.isActive !== undefined) {
      filter.isActive = query.isActive;
    }

    if (query.priceMin || query.priceMax) {
      filter.price = {};
      if (query.priceMin) filter.price.$gte = query.priceMin;
      if (query.priceMax) filter.price.$lte = query.priceMax;
    }

    return filter;
  }

  private transformToEntity(doc: any): Product {
    return {
      id: doc._id.toString(),
      name: doc.name,
      description: doc.description,
      price: doc.price,
      categoryId: doc.categoryId,
      slug: doc.slug,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy,
      updatedBy: doc.updatedBy
    };
  }
}
```

---

## API Service Patterns

### **Standardized Response Format**
```typescript
// ✅ Consistent API response structure
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
  timestamp: Date;
  requestId: string;
  pagination?: PaginationMeta;
  errors?: ValidationError[];
}

// ✅ Error response structure
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    field?: string;
    timestamp: Date;
    requestId: string;
    traceId: string;
  };
}

// ✅ Response builder utility
export class ApiResponseBuilder {
  static success<T>(
    data: T,
    message: string = 'Operation successful',
    pagination?: PaginationMeta
  ): ApiResponse<T> {
    return {
      data,
      success: true,
      message,
      timestamp: new Date(),
      requestId: generateRequestId(),
      pagination
    };
  }

  static error(
    code: string,
    message: string,
    details?: unknown,
    field?: string
  ): ErrorResponse {
    return {
      success: false,
      error: {
        code,
        message,
        details,
        field,
        timestamp: new Date(),
        requestId: generateRequestId(),
        traceId: getCurrentTraceId()
      }
    };
  }
}
```

### **Input Validation Patterns**
```typescript
// ✅ Comprehensive DTO validation
export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  @ApiProperty({
    description: 'Product name',
    example: 'Premium Coffee Beans',
    minLength: 1,
    maxLength: 100
  })
  name: string;

  @IsString()
  @IsOptional()
  @Length(0, 1000)
  @ApiProperty({
    description: 'Product description',
    example: 'High-quality arabica coffee beans',
    required: false,
    maxLength: 1000
  })
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Min(0.01)
  @Max(999999.99)
  @ApiProperty({
    description: 'Product price in USD',
    example: 29.99,
    minimum: 0.01,
    maximum: 999999.99
  })
  price: number;

  @IsMongoId()
  @ApiProperty({
    description: 'Category ID',
    example: '507f1f77bcf86cd799439011'
  })
  categoryId: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ApiProperty({
    description: 'Product tags',
    example: ['coffee', 'premium', 'arabica'],
    required: false,
    type: [String]
  })
  tags?: string[];

  @ValidateNested()
  @Type(() => ProductMetadataDto)
  @IsOptional()
  @ApiProperty({
    description: 'Product metadata',
    required: false,
    type: ProductMetadataDto
  })
  metadata?: ProductMetadataDto;
}

// ✅ Custom validation decorators
export function IsValidSlug(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidSlug',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return typeof value === 'string' && /^[a-z0-9-]+$/.test(value);
        },
        defaultMessage() {
          return 'Slug must contain only lowercase letters, numbers, and hyphens';
        }
      }
    });
  };
}
```

---

## Database Patterns

### **MongoDB Schema Design**
```typescript
// ✅ Well-structured Mongoose schema
@Schema({
  timestamps: true,
  collection: 'products',
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
})
export class Product {
  @Prop({
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 100,
    index: true
  })
  name: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[a-z0-9-]+$/
  })
  slug: string;

  @Prop({
    trim: true,
    maxlength: 1000
  })
  description?: string;

  @Prop({
    required: true,
    min: 0.01,
    max: 999999.99,
    get: (v: number) => parseFloat(v.toFixed(2)),
    set: (v: number) => parseFloat(v.toFixed(2))
  })
  price: number;

  @Prop({
    type: Types.ObjectId,
    ref: 'Category',
    required: true,
    index: true
  })
  categoryId: Types.ObjectId;

  @Prop({
    type: [String],
    default: [],
    index: true
  })
  tags: string[];

  @Prop({
    default: true,
    index: true
  })
  isActive: boolean;

  @Prop({
    type: Object,
    default: {}
  })
  metadata: Record<string, any>;

  @Prop({
    required: true,
    index: true
  })
  createdBy: string;

  @Prop({
    index: true
  })
  updatedBy?: string;

  @Prop({
    default: Date.now,
    index: true
  })
  createdAt: Date;

  @Prop({
    default: Date.now
  })
  updatedAt: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// ✅ Compound indexes for query optimization
ProductSchema.index({ categoryId: 1, isActive: 1, createdAt: -1 });
ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ price: 1, isActive: 1 });
ProductSchema.index({ slug: 1 }, { unique: true });

// ✅ Pre-save middleware for business logic
ProductSchema.pre('save', function() {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = new Date();
  }
});

// ✅ Instance methods
ProductSchema.methods.generateSlug = function() {
  this.slug = this.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export type ProductDocument = Product & Document;
```

### **Advanced Query Patterns**
```typescript
// ✅ Complex aggregation pipelines
export class ProductAnalyticsRepository {
  async getProductSalesAnalytics(
    startDate: Date,
    endDate: Date,
    categoryId?: string
  ): Promise<ProductSalesAnalytics[]> {
    const matchStage: any = {
      createdAt: { $gte: startDate, $lte: endDate }
    };

    if (categoryId) {
      matchStage.categoryId = new Types.ObjectId(categoryId);
    }

    return this.productModel.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'items.productId',
          as: 'orders'
        }
      },
      {
        $addFields: {
          totalSales: {
            $sum: {
              $map: {
                input: '$orders',
                as: 'order',
                in: {
                  $sum: {
                    $map: {
                      input: {
                        $filter: {
                          input: '$$order.items',
                          cond: { $eq: ['$$this.productId', '$_id'] }
                        }
                      },
                      as: 'item',
                      in: { $multiply: ['$$item.quantity', '$$item.price'] }
                    }
                  }
                }
              }
            }
          },
          totalQuantitySold: {
            $sum: {
              $map: {
                input: '$orders',
                as: 'order',
                in: {
                  $sum: {
                    $map: {
                      input: {
                        $filter: {
                          input: '$$order.items',
                          cond: { $eq: ['$$this.productId', '$_id'] }
                        }
                      },
                      as: 'item',
                      in: '$$item.quantity'
                    }
                  }
                }
              }
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          price: 1,
          totalSales: 1,
          totalQuantitySold: 1,
          averageOrderValue: {
            $cond: {
              if: { $gt: ['$totalQuantitySold', 0] },
              then: { $divide: ['$totalSales', '$totalQuantitySold'] },
              else: 0
            }
          }
        }
      },
      { $sort: { totalSales: -1 } }
    ]);
  }

  // ✅ Efficient search with faceted results
  async searchProductsWithFacets(
    searchQuery: ProductSearchQuery
  ): Promise<FacetedSearchResult> {
    const pipeline = [
      {
        $match: this.buildSearchFilter(searchQuery)
      },
      {
        $facet: {
          products: [
            { $skip: searchQuery.offset },
            { $limit: searchQuery.limit },
            {
              $lookup: {
                from: 'categories',
                localField: 'categoryId',
                foreignField: '_id',
                as: 'category'
              }
            },
            { $unwind: '$category' }
          ],
          totalCount: [
            { $count: 'count' }
          ],
          categoryFacets: [
            {
              $group: {
                _id: '$categoryId',
                count: { $sum: 1 },
                categoryName: { $first: '$category.name' }
              }
            },
            { $sort: { count: -1 } }
          ],
          priceRanges: [
            {
              $bucket: {
                groupBy: '$price',
                boundaries: [0, 25, 50, 100, 250, 500, 1000, Infinity],
                default: 'Other',
                output: {
                  count: { $sum: 1 },
                  avgPrice: { $avg: '$price' }
                }
              }
            }
          ]
        }
      }
    ];

    const [result] = await this.productModel.aggregate(pipeline);
    return this.transformFacetedResult(result);
  }
}
```

---

## Testing Standards

### **Unit Testing Patterns**
```typescript
// ✅ Comprehensive unit test structure
describe('ProductService', () => {
  let productService: ProductService;
  let productRepository: jest.Mocked<ProductRepository>;
  let categoryService: jest.Mocked<CategoryService>;
  let eventBus: jest.Mocked<EventBus>;
  let logger: jest.Mocked<Logger>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: ProductRepository,
          useValue: createMockRepository()
        },
        {
          provide: CategoryService,
          useValue: createMockCategoryService()
        },
        {
          provide: EventBus,
          useValue: createMockEventBus()
        },
        {
          provide: Logger,
          useValue: createMockLogger()
        }
      ]
    }).compile();

    productService = module.get<ProductService>(ProductService);
    productRepository = module.get(ProductRepository);
    categoryService = module.get(CategoryService);
    eventBus = module.get(EventBus);
    logger = module.get(Logger);
  });

  describe('createProduct', () => {
    const validCreateProductDto: CreateProductDto = {
      name: 'Test Product',
      description: 'Test Description',
      price: 29.99,
      categoryId: '507f1f77bcf86cd799439011',
      tags: ['test', 'product']
    };

    const userId = 'user123';

    it('should create product successfully with valid data', async () => {
      // Arrange
      const category = createMockCategory({ id: validCreateProductDto.categoryId });
      const expectedProduct = createMockProduct({
        ...validCreateProductDto,
        id: 'product123',
        slug: 'test-product',
        createdBy: userId
      });

      categoryService.findById.mockResolvedValue(category);
      productRepository.create.mockResolvedValue(expectedProduct);
      eventBus.publish.mockResolvedValue(undefined);

      // Act
      const result = await productService.createProduct(validCreateProductDto, userId);

      // Assert
      expect(result).toEqual(expectedProduct);
      expect(categoryService.findById).toHaveBeenCalledWith(validCreateProductDto.categoryId);
      expect(productRepository.create).toHaveBeenCalledWith({
        ...validCreateProductDto,
        slug: 'test-product',
        createdBy: userId,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      });
      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.any(ProductCreatedEvent)
      );
      expect(logger.info).toHaveBeenCalledWith(
        'Product created',
        expect.objectContaining({
          productId: expectedProduct.id,
          name: expectedProduct.name,
          createdBy: userId
        })
      );
    });

    it('should throw ValidationError for invalid product data', async () => {
      // Arrange
      const invalidData = {
        ...validCreateProductDto,
        name: '', // Invalid: empty name
        price: -10 // Invalid: negative price
      };

      // Act & Assert
      await expect(
        productService.createProduct(invalidData, userId)
      ).rejects.toThrow(ValidationError);

      expect(productRepository.create).not.toHaveBeenCalled();
      expect(eventBus.publish).not.toHaveBeenCalled();
    });

    it('should throw BusinessLogicError when category does not exist', async () => {
      // Arrange
      categoryService.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        productService.createProduct(validCreateProductDto, userId)
      ).rejects.toThrow(BusinessLogicError);

      expect(productRepository.create).not.toHaveBeenCalled();
      expect(eventBus.publish).not.toHaveBeenCalled();
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const category = createMockCategory({ id: validCreateProductDto.categoryId });
      const repositoryError = new DatabaseError('Connection failed', 'create');

      categoryService.findById.mockResolvedValue(category);
      productRepository.create.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(
        productService.createProduct(validCreateProductDto, userId)
      ).rejects.toThrow(DatabaseError);

      expect(eventBus.publish).not.toHaveBeenCalled();
    });
  });

  describe('getProducts', () => {
    it('should return paginated products with filters', async () => {
      // Arrange
      const query: GetProductsQuery = {
        page: 1,
        limit: 10,
        categoryId: '507f1f77bcf86cd799439011',
        isActive: true,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      const mockProducts = [
        createMockProduct({ id: '1', name: 'Product 1' }),
        createMockProduct({ id: '2', name: 'Product 2' })
      ];

      const expectedResult: PaginatedResult<Product> = {
        data: mockProducts,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1
      };

      productRepository.findWithPagination.mockResolvedValue(expectedResult);

      // Act
      const result = await productService.getProducts(query);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(productRepository.findWithPagination).toHaveBeenCalledWith(
        {
          categoryId: query.categoryId,
          isActive: query.isActive,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder
        },
        {
          page: query.page,
          limit: query.limit,
          offset: 0
        }
      );
    });
  });
});

// ✅ Test utilities and factories
function createMockRepository(): jest.Mocked<ProductRepository> {
  return {
    create: jest.fn(),
    findById: jest.fn(),
    findWithPagination: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  } as any;
}

function createMockProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'product123',
    name: 'Test Product',
    slug: 'test-product',
    description: 'Test Description',
    price: 29.99,
    categoryId: '507f1f77bcf86cd799439011',
    tags: ['test'],
    isActive: true,
    metadata: {},
    createdBy: 'user123',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    ...overrides
  };
}
```

### **Integration Testing Patterns**
```typescript
// ✅ Integration test with real database
describe('ProductController (Integration)', () => {
  let app: INestApplication;
  let mongoConnection: Connection;
  let productModel: Model<ProductDocument>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    })
    .overrideProvider(ConfigService)
    .useValue({
      get: jest.fn((key: string) => {
        if (key === 'DATABASE_URL') return process.env.TEST_DATABASE_URL;
        return process.env[key];
      })
    })
    .compile();

    app = moduleFixture.createNestApplication();

    // Setup validation pipe
    app.useGlobalPipes(new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true
    }));

    await app.init();

    mongoConnection = moduleFixture.get(getConnectionToken());
    productModel = moduleFixture.get(getModelToken(Product.name));
  });

  beforeEach(async () => {
    // Clean database before each test
    await mongoConnection.dropDatabase();

    // Seed test data
    await seedTestData();
  });

  afterAll(async () => {
    await mongoConnection.close();
    await app.close();
  });

  describe('POST /api/v1/products', () => {
    it('should create product with valid data', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Integration Test Product',
        description: 'Created via integration test',
        price: 49.99,
        categoryId: testCategory.id,
        tags: ['integration', 'test']
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${validJwtToken}`)
        .send(createProductDto)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Product created successfully',
        data: {
          id: expect.any(String),
          name: createProductDto.name,
          description: createProductDto.description,
          price: createProductDto.price,
          slug: 'integration-test-product',
          categoryId: createProductDto.categoryId,
          tags: createProductDto.tags,
          isActive: true,
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        }
      });

      // Verify product was actually saved to database
      const savedProduct = await productModel.findById(response.body.data.id);
      expect(savedProduct).toBeTruthy();
      expect(savedProduct.name).toBe(createProductDto.name);
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        name: '', // Invalid: empty name
        price: -10, // Invalid: negative price
        categoryId: 'invalid-id' // Invalid: not a valid ObjectId
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${validJwtToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: expect.any(String),
          message: expect.stringContaining('validation'),
          details: expect.any(Array)
        }
      });
    });

    it('should return 401 for missing authentication', async () => {
      const validData = {
        name: 'Test Product',
        price: 29.99,
        categoryId: testCategory.id
      };

      await request(app.getHttpServer())
        .post('/api/v1/products')
        .send(validData)
        .expect(401);
    });
  });

  describe('GET /api/v1/products', () => {
    it('should return paginated products', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/products')
        .query({
          page: 1,
          limit: 10,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          data: expect.any(Array),
          total: expect.any(Number),
          page: 1,
          limit: 10,
          totalPages: expect.any(Number)
        }
      });

      expect(response.body.data.data).toHaveLength(
        Math.min(10, response.body.data.total)
      );
    });

    it('should filter products by category', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/products')
        .query({
          categoryId: testCategory.id,
          page: 1,
          limit: 50
        })
        .expect(200);

      expect(response.body.data.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            categoryId: testCategory.id
          })
        ])
      );
    });
  });

  // ✅ Test data seeding utilities
  async function seedTestData(): Promise<void> {
    // Create test category
    testCategory = await categoryModel.create({
      name: 'Test Category',
      slug: 'test-category',
      description: 'Category for testing',
      isActive: true,
      createdBy: 'test-user'
    });

    // Create test products
    const products = Array.from({ length: 5 }, (_, index) => ({
      name: `Test Product ${index + 1}`,
      slug: `test-product-${index + 1}`,
      description: `Description for test product ${index + 1}`,
      price: (index + 1) * 10,
      categoryId: testCategory._id,
      tags: ['test', `product-${index + 1}`],
      isActive: true,
      createdBy: 'test-user'
    }));

    await productModel.insertMany(products);
  }
});
```

---

## Error Handling

### **Enterprise Error Hierarchy**
```typescript
// ✅ Base error class with enterprise features
export abstract class BaseError extends Error {
  abstract readonly statusCode: number;
  abstract readonly errorCode: string;
  abstract readonly isOperational: boolean;

  constructor(
    message: string,
    public readonly context: Record<string, unknown> = {},
    public readonly correlationId: string = generateCorrelationId()
  ) {
    super(message);
    this.name = this.constructor.name;

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): ErrorResponse {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      errorCode: this.errorCode,
      context: this.context,
      correlationId: this.correlationId,
      timestamp: new Date().toISOString(),
      stack: this.stack
    };
  }
}

// ✅ Domain-specific error classes
export class ValidationError extends BaseError {
  readonly statusCode = 400;
  readonly errorCode = 'VALIDATION_ERROR';
  readonly isOperational = true;

  constructor(
    message: string,
    public readonly field?: string,
    public readonly validationCode?: string,
    context: Record<string, unknown> = {}
  ) {
    super(message, { ...context, field, validationCode });
  }
}

export class BusinessLogicError extends BaseError {
  readonly statusCode = 422;
  readonly errorCode = 'BUSINESS_LOGIC_ERROR';
  readonly isOperational = true;

  constructor(
    message: string,
    public readonly operation: string,
    context: Record<string, unknown> = {}
  ) {
    super(message, { ...context, operation });
  }
}

export class DatabaseError extends BaseError {
  readonly statusCode = 500;
  readonly errorCode = 'DATABASE_ERROR';
  readonly isOperational = true;

  constructor(
    message: string,
    public readonly operation: string,
    public readonly originalError?: Error,
    context: Record<string, unknown> = {}
  ) {
    super(message, {
      ...context,
      operation,
      originalError: originalError?.message
    });
  }
}

export class ExternalServiceError extends BaseError {
  readonly statusCode = 502;
  readonly errorCode = 'EXTERNAL_SERVICE_ERROR';
  readonly isOperational = true;

  constructor(
    message: string,
    public readonly serviceName: string,
    public readonly httpStatus?: number,
    context: Record<string, unknown> = {}
  ) {
    super(message, { ...context, serviceName, httpStatus });
  }
}

export class AuthenticationError extends BaseError {
  readonly statusCode = 401;
  readonly errorCode = 'AUTHENTICATION_ERROR';
  readonly isOperational = true;

  constructor(
    message: string = 'Authentication required',
    context: Record<string, unknown> = {}
  ) {
    super(message, context);
  }
}

export class AuthorizationError extends BaseError {
  readonly statusCode = 403;
  readonly errorCode = 'AUTHORIZATION_ERROR';
  readonly isOperational = true;

  constructor(
    message: string = 'Insufficient permissions',
    public readonly requiredPermission?: string,
    context: Record<string, unknown> = {}
  ) {
    super(message, { ...context, requiredPermission });
  }
}

export class NotFoundError extends BaseError {
  readonly statusCode = 404;
  readonly errorCode = 'NOT_FOUND_ERROR';
  readonly isOperational = true;

  constructor(
    message: string,
    public readonly resourceType: string,
    public readonly resourceId?: string,
    context: Record<string, unknown> = {}
  ) {
    super(message, { ...context, resourceType, resourceId });
  }
}

export class RateLimitError extends BaseError {
  readonly statusCode = 429;
  readonly errorCode = 'RATE_LIMIT_ERROR';
  readonly isOperational = true;

  constructor(
    message: string = 'Rate limit exceeded',
    public readonly retryAfter?: number,
    context: Record<string, unknown> = {}
  ) {
    super(message, { ...context, retryAfter });
  }
}
```

### **Global Error Handler**
```typescript
// ✅ Enterprise error handling middleware
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: Logger,
    private readonly configService: ConfigService,
    private readonly metricsService: MetricsService
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = this.buildErrorResponse(exception, request);

    // Log error with context
    this.logError(exception, request, errorResponse);

    // Record metrics
    this.recordErrorMetrics(errorResponse);

    // Send response
    response
      .status(errorResponse.statusCode)
      .json({
        success: false,
        error: {
          code: errorResponse.errorCode,
          message: errorResponse.message,
          ...(this.shouldIncludeDetails() && {
            details: errorResponse.context,
            stack: errorResponse.stack
          }),
          timestamp: errorResponse.timestamp,
          requestId: request.headers['x-request-id'] || generateRequestId(),
          path: request.url
        }
      });
  }

  private buildErrorResponse(
    exception: unknown,
    request: Request
  ): ErrorResponse {
    // Handle BaseError instances
    if (exception instanceof BaseError) {
      return {
        statusCode: exception.statusCode,
        errorCode: exception.errorCode,
        message: exception.message,
        context: exception.context,
        timestamp: new Date().toISOString(),
        stack: exception.stack
      };
    }

    // Handle Express.js HTTP errors
    if (exception.status && exception.message) {
      const status = exception.status;
      const response = exception.message;

      return {
        statusCode: status,
        errorCode: this.getErrorCodeFromStatus(status),
        message: typeof response === 'string' ? response : response['message'] || 'HTTP Exception',
        context: typeof response === 'object' ? response : {},
        timestamp: new Date().toISOString(),
        stack: exception.stack
      };
    }

    // Handle validation errors
    if (exception instanceof Error && exception.name === 'ValidationError') {
      return {
        statusCode: 400,
        errorCode: 'VALIDATION_ERROR',
        message: exception.message,
        context: { validationError: true },
        timestamp: new Date().toISOString(),
        stack: exception.stack
      };
    }

    // Handle unexpected errors
    return {
      statusCode: 500,
      errorCode: 'INTERNAL_SERVER_ERROR',
      message: this.shouldIncludeDetails()
        ? (exception as Error)?.message || 'An unexpected error occurred'
        : 'Internal server error',
      context: {},
      timestamp: new Date().toISOString(),
      stack: (exception as Error)?.stack
    };
  }

  private logError(
    exception: unknown,
    request: Request,
    errorResponse: ErrorResponse
  ): void {
    const logContext = {
      error: {
        name: (exception as Error)?.name,
        message: errorResponse.message,
        code: errorResponse.errorCode,
        statusCode: errorResponse.statusCode,
        stack: errorResponse.stack
      },
      request: {
        method: request.method,
        url: request.url,
        headers: this.sanitizeHeaders(request.headers),
        body: this.sanitizeBody(request.body),
        params: request.params,
        query: request.query,
        ip: request.ip,
        userAgent: request.headers['user-agent']
      },
      user: {
        id: request['user']?.id,
        email: request['user']?.email,
        roles: request['user']?.roles
      },
      context: errorResponse.context,
      timestamp: errorResponse.timestamp
    };

    if (errorResponse.statusCode >= 500) {
      this.logger.error('Unhandled server error', logContext);
    } else if (errorResponse.statusCode >= 400) {
      this.logger.warn('Client error', logContext);
    } else {
      this.logger.log('Handled error', logContext);
    }
  }

  private recordErrorMetrics(errorResponse: ErrorResponse): void {
    this.metricsService.incrementCounter('api_errors_total', {
      status_code: errorResponse.statusCode.toString(),
      error_code: errorResponse.errorCode,
      error_type: errorResponse.statusCode >= 500 ? 'server' : 'client'
    });
  }

  private shouldIncludeDetails(): boolean {
    return this.configService.get('NODE_ENV') !== 'production';
  }

  private sanitizeHeaders(headers: any): any {
    const sensitive = ['authorization', 'cookie', 'x-api-key'];
    const sanitized = { ...headers };

    sensitive.forEach(key => {
      if (sanitized[key]) {
        sanitized[key] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;

    const sensitive = ['password', 'token', 'secret', 'key'];
    const sanitized = JSON.parse(JSON.stringify(body));

    const sanitizeRecursive = (obj: any): void => {
      Object.keys(obj).forEach(key => {
        if (sensitive.some(s => key.toLowerCase().includes(s))) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeRecursive(obj[key]);
        }
      });
    };

    sanitizeRecursive(sanitized);
    return sanitized;
  }

  private getErrorCodeFromStatus(status: number): string {
    const statusCodeMap = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_SERVER_ERROR',
      502: 'BAD_GATEWAY',
      503: 'SERVICE_UNAVAILABLE'
    };

    return statusCodeMap[status] || 'UNKNOWN_ERROR';
  }
}

interface ErrorResponse {
  statusCode: number;
  errorCode: string;
  message: string;
  context: Record<string, unknown>;
  timestamp: string;
  stack?: string;
}
```

---

## Logging Standards

### **Structured Logging Implementation**
```typescript
// ✅ Enterprise logging service
@Injectable()
export class LoggerService {
  private readonly logger: winston.Logger;

  constructor(private readonly configService: ConfigService) {
    this.logger = winston.createLogger({
      level: this.configService.get('LOG_LEVEL', 'info'),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return JSON.stringify({
            timestamp,
            level,
            message,
            service: 'tanqory-api',
            version: process.env.APP_VERSION || '1.0.0',
            environment: this.configService.get('NODE_ENV'),
            correlationId: this.getCorrelationId(),
            ...meta
          });
        })
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          maxsize: 10485760, // 10MB
          maxFiles: 5
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
          maxsize: 10485760, // 10MB
          maxFiles: 10
        })
      ]
    });

    // Add external transports for production
    if (this.configService.get('NODE_ENV') === 'production') {
      this.addProductionTransports();
    }
  }

  // ✅ Structured logging methods
  info(message: string, context: LogContext = {}): void {
    this.logger.info(message, this.enhanceContext(context));
  }

  warn(message: string, context: LogContext = {}): void {
    this.logger.warn(message, this.enhanceContext(context));
  }

  error(message: string, context: LogContext = {}): void {
    this.logger.error(message, this.enhanceContext(context));
  }

  debug(message: string, context: LogContext = {}): void {
    this.logger.debug(message, this.enhanceContext(context));
  }

  // ✅ Specialized logging methods
  logApiRequest(request: Request, response: Response, duration: number): void {
    const context = {
      request: {
        method: request.method,
        url: request.url,
        userAgent: request.headers['user-agent'],
        ip: request.ip,
        correlationId: request.headers['x-correlation-id']
      },
      response: {
        statusCode: response.statusCode,
        contentLength: response.get('content-length')
      },
      performance: {
        duration,
        timestamp: new Date().toISOString()
      },
      user: {
        id: request['user']?.id,
        email: request['user']?.email
      }
    };

    if (response.statusCode >= 400) {
      this.error(`API request failed: ${request.method} ${request.url}`, context);
    } else {
      this.info(`API request: ${request.method} ${request.url}`, context);
    }
  }

  logDatabaseOperation(
    operation: string,
    collection: string,
    duration: number,
    success: boolean,
    context: Record<string, unknown> = {}
  ): void {
    const logContext = {
      database: {
        operation,
        collection,
        duration,
        success
      },
      ...context
    };

    if (success) {
      this.info(`Database operation: ${operation} on ${collection}`, logContext);
    } else {
      this.error(`Database operation failed: ${operation} on ${collection}`, logContext);
    }
  }

  logBusinessEvent(
    event: string,
    entityType: string,
    entityId: string,
    userId?: string,
    context: Record<string, unknown> = {}
  ): void {
    this.info(`Business event: ${event}`, {
      business: {
        event,
        entityType,
        entityId,
        userId
      },
      ...context
    });
  }

  logSecurityEvent(
    event: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    context: Record<string, unknown> = {}
  ): void {
    const logContext = {
      security: {
        event,
        severity,
        timestamp: new Date().toISOString()
      },
      ...context
    };

    if (severity === 'critical' || severity === 'high') {
      this.error(`Security event: ${event}`, logContext);
    } else {
      this.warn(`Security event: ${event}`, logContext);
    }
  }

  logPerformanceMetric(
    operation: string,
    duration: number,
    success: boolean,
    context: Record<string, unknown> = {}
  ): void {
    this.info(`Performance metric: ${operation}`, {
      performance: {
        operation,
        duration,
        success,
        timestamp: new Date().toISOString()
      },
      ...context
    });
  }

  private enhanceContext(context: LogContext): LogContext {
    return {
      ...context,
      correlationId: this.getCorrelationId(),
      timestamp: new Date().toISOString(),
      service: 'tanqory-api',
      version: process.env.APP_VERSION || '1.0.0'
    };
  }

  private getCorrelationId(): string {
    // Get from async context or generate new one
    return AsyncContext.get('correlationId') || generateCorrelationId();
  }

  private addProductionTransports(): void {
    // Add CloudWatch transport
    if (this.configService.get('AWS_CLOUDWATCH_ENABLED')) {
      this.logger.add(new WinstonCloudWatch({
        logGroupName: this.configService.get('AWS_CLOUDWATCH_GROUP'),
        logStreamName: this.configService.get('AWS_CLOUDWATCH_STREAM'),
        awsRegion: this.configService.get('AWS_REGION'),
        messageFormatter: ({ level, message, ...meta }) =>
          `[${level.toUpperCase()}] ${message} ${JSON.stringify(meta)}`
      }));
    }

    // Add external logging service (e.g., DataDog, Splunk)
    if (this.configService.get('EXTERNAL_LOGGING_ENABLED')) {
      // Configure external logging transport
    }
  }
}

interface LogContext {
  [key: string]: unknown;
}

// ✅ Logging interceptor for automatic request/response logging
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        this.logger.logApiRequest(request, response, duration);
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        this.logger.logApiRequest(request, response, duration);
        throw error;
      })
    );
  }
}
```

---

## AI-Specific Guidelines

### **AI-Friendly Code Patterns**
```typescript
// ✅ Predictable function signatures and clear intentions
interface UserManagementService {
  // Clear input/output types
  createUser(userData: CreateUserData): Promise<User>;
  updateUser(userId: string, updates: UpdateUserData): Promise<User>;
  deleteUser(userId: string): Promise<void>;
  getUserById(userId: string): Promise<User | null>;

  // Descriptive method names that indicate business logic
  activateUserAccount(userId: string): Promise<void>;
  deactivateUserAccount(userId: string): Promise<void>;
  resetUserPassword(userId: string): Promise<PasswordResetToken>;

  // Batch operations with clear naming
  createMultipleUsers(usersData: CreateUserData[]): Promise<User[]>;
  updateMultipleUsers(updates: UserUpdate[]): Promise<User[]>;
}

// ✅ Self-documenting data transformations
export class UserTransformer {
  // Explicit transformation with clear mappings
  static fromDatabaseToAPI(dbUser: DatabaseUser): APIUser {
    return {
      id: dbUser._id.toString(),
      email: dbUser.emailAddress,
      fullName: dbUser.firstName + ' ' + dbUser.lastName,
      isActive: dbUser.status === 'active',
      createdAt: dbUser.createdTimestamp.toISOString(),
      lastLoginAt: dbUser.lastLoginTimestamp?.toISOString() || null,
      roles: dbUser.assignedRoles.map(role => role.name),
      preferences: {
        theme: dbUser.preferences?.theme || 'light',
        language: dbUser.preferences?.language || 'en',
        notifications: dbUser.preferences?.notifications ?? true
      }
    };
  }

  // Reverse transformation with validation
  static fromAPIToDatabase(apiUser: APIUser): Partial<DatabaseUser> {
    const [firstName, ...lastNameParts] = apiUser.fullName.split(' ');

    return {
      emailAddress: apiUser.email.toLowerCase().trim(),
      firstName: firstName.trim(),
      lastName: lastNameParts.join(' ').trim(),
      status: apiUser.isActive ? 'active' : 'inactive',
      preferences: {
        theme: apiUser.preferences.theme,
        language: apiUser.preferences.language,
        notifications: apiUser.preferences.notifications
      }
    };
  }
}

// ✅ Consistent error handling patterns
export class OrderProcessor {
  async processOrder(orderData: CreateOrderData): Promise<ProcessOrderResult> {
    try {
      // Step 1: Validate order data
      const validation = await this.validateOrderData(orderData);
      if (!validation.isValid) {
        return {
          success: false,
          error: 'VALIDATION_FAILED',
          details: validation.errors,
          order: null
        };
      }

      // Step 2: Check inventory availability
      const inventoryCheck = await this.checkInventoryAvailability(orderData.items);
      if (!inventoryCheck.isAvailable) {
        return {
          success: false,
          error: 'INSUFFICIENT_INVENTORY',
          details: inventoryCheck.unavailableItems,
          order: null
        };
      }

      // Step 3: Calculate pricing
      const pricing = await this.calculateOrderPricing(orderData);

      // Step 4: Create order
      const order = await this.createOrder({
        ...orderData,
        totalAmount: pricing.total,
        tax: pricing.tax,
        shipping: pricing.shipping
      });

      // Step 5: Reserve inventory
      await this.reserveInventory(orderData.items, order.id);

      // Step 6: Send confirmation
      await this.sendOrderConfirmation(order);

      return {
        success: true,
        error: null,
        details: null,
        order: order
      };

    } catch (error) {
      // Consistent error logging and re-throwing
      this.logger.error('Order processing failed', {
        orderData: this.sanitizeOrderData(orderData),
        error: error.message,
        stack: error.stack
      });

      return {
        success: false,
        error: 'PROCESSING_FAILED',
        details: error.message,
        order: null
      };
    }
  }

  // Predictable validation with detailed results
  private async validateOrderData(data: CreateOrderData): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // Validate customer
    if (!data.customerId) {
      errors.push({ field: 'customerId', message: 'Customer ID is required' });
    } else {
      const customerExists = await this.customerService.exists(data.customerId);
      if (!customerExists) {
        errors.push({ field: 'customerId', message: 'Customer not found' });
      }
    }

    // Validate items
    if (!data.items || data.items.length === 0) {
      errors.push({ field: 'items', message: 'Order must contain at least one item' });
    } else {
      for (let i = 0; i < data.items.length; i++) {
        const item = data.items[i];
        if (!item.productId) {
          errors.push({
            field: `items[${i}].productId`,
            message: 'Product ID is required'
          });
        }
        if (!item.quantity || item.quantity <= 0) {
          errors.push({
            field: `items[${i}].quantity`,
            message: 'Quantity must be greater than 0'
          });
        }
      }
    }

    // Validate shipping address
    if (!data.shippingAddress) {
      errors.push({ field: 'shippingAddress', message: 'Shipping address is required' });
    } else {
      const addressValidation = this.validateAddress(data.shippingAddress);
      if (!addressValidation.isValid) {
        errors.push(...addressValidation.errors);
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
}
```

### **Documentation Standards for AI**
```typescript
/**
 * User management service providing CRUD operations and business logic for user entities.
 *
 * @example
 * ```typescript
 * const userService = new UserService(userRepository, logger);
 *
 * // Create a new user
 * const newUser = await userService.createUser({
 *   email: 'john@example.com',
 *   name: 'John Doe',
 *   role: 'user'
 * });
 *
 * // Update user
 * const updatedUser = await userService.updateUser(newUser.id, {
 *   name: 'John Smith'
 * });
 * ```
 */
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: Logger,
    private readonly eventBus: EventBus
  ) {}

  /**
   * Creates a new user with the provided data.
   *
   * @param userData - The user data for creation
   * @param userData.email - User's email address (must be unique)
   * @param userData.name - User's full name
   * @param userData.role - User's role in the system
   * @param userData.preferences - Optional user preferences
   *
   * @returns Promise resolving to the created user
   *
   * @throws {ValidationError} When user data is invalid
   * @throws {BusinessLogicError} When email already exists
   * @throws {DatabaseError} When database operation fails
   *
   * @example
   * ```typescript
   * const user = await userService.createUser({
   *   email: 'jane@example.com',
   *   name: 'Jane Doe',
   *   role: 'admin',
   *   preferences: {
   *     theme: 'dark',
   *     notifications: true
   *   }
   * });
   * ```
   */
  async createUser(userData: CreateUserData): Promise<User> {
    // Implementation...
  }

  /**
   * Retrieves a user by their unique identifier.
   *
   * @param userId - The unique identifier of the user
   * @returns Promise resolving to the user if found, null otherwise
   *
   * @throws {DatabaseError} When database operation fails
   *
   * @example
   * ```typescript
   * const user = await userService.getUserById('507f1f77bcf86cd799439011');
   * if (user) {
   *   console.log(`Found user: ${user.name}`);
   * } else {
   *   console.log('User not found');
   * }
   * ```
   */
  async getUserById(userId: string): Promise<User | null> {
    // Implementation...
  }

  /**
   * Updates an existing user with the provided data.
   * Only provided fields will be updated, undefined fields are ignored.
   *
   * @param userId - The unique identifier of the user to update
   * @param updateData - Partial user data for update
   * @returns Promise resolving to the updated user
   *
   * @throws {NotFoundError} When user with given ID doesn't exist
   * @throws {ValidationError} When update data is invalid
   * @throws {DatabaseError} When database operation fails
   *
   * @example
   * ```typescript
   * const updatedUser = await userService.updateUser('507f1f77bcf86cd799439011', {
   *   name: 'John Updated',
   *   preferences: {
   *     theme: 'light'
   *   }
   * });
   * ```
   */
  async updateUser(userId: string, updateData: UpdateUserData): Promise<User> {
    // Implementation...
  }
}

/**
 * Data structure for creating a new user.
 */
export interface CreateUserData {
  /** User's email address - must be unique across the system */
  email: string;

  /** User's full name */
  name: string;

  /** User's role determining their permissions */
  role: 'admin' | 'user' | 'moderator';

  /** Optional user preferences */
  preferences?: {
    /** UI theme preference */
    theme: 'light' | 'dark';

    /** Whether to receive notifications */
    notifications: boolean;

    /** Preferred language code */
    language: string;
  };
}

/**
 * Data structure for updating an existing user.
 * All fields are optional - only provided fields will be updated.
 */
export interface UpdateUserData {
  /** User's full name */
  name?: string;

  /** User's role determining their permissions */
  role?: 'admin' | 'user' | 'moderator';

  /** User preferences */
  preferences?: {
    /** UI theme preference */
    theme?: 'light' | 'dark';

    /** Whether to receive notifications */
    notifications?: boolean;

    /** Preferred language code */
    language?: string;
  };
}
```

---

## Code Review Checklist

### **Enterprise Code Review Standards**
```yaml
Security Review:
  ✅ Input validation implemented for all user inputs
  ✅ SQL injection prevention (parameterized queries)
  ✅ XSS prevention (input sanitization/escaping)
  ✅ Authentication and authorization checks
  ✅ Sensitive data not logged or exposed
  ✅ Error messages don't reveal sensitive information
  ✅ Rate limiting implemented for public endpoints
  ✅ HTTPS enforcement for sensitive operations

Performance Review:
  ✅ Database queries optimized (indexes, pagination)
  ✅ N+1 query problems avoided
  ✅ Caching implemented where appropriate
  ✅ Memory leaks prevented (event listeners, timers)
  ✅ Large dataset processing uses streaming/chunking
  ✅ API response times under SLA requirements
  ✅ Resource cleanup in finally blocks

Code Quality Review:
  ✅ Functions are single-purpose and testable
  ✅ Variable and function names are descriptive
  ✅ Code follows established patterns and conventions
  ✅ Error handling is comprehensive and consistent
  ✅ Logging includes sufficient context
  ✅ Comments explain complex business logic
  ✅ TypeScript types are properly defined
  ✅ No unused imports or variables

Testing Review:
  ✅ Unit tests cover all business logic paths
  ✅ Integration tests cover API endpoints
  ✅ Error scenarios are tested
  ✅ Test names clearly describe what is being tested
  ✅ Tests are independent and can run in any order
  ✅ Test data is properly cleaned up
  ✅ Mocks are used appropriately

Business Logic Review:
  ✅ Requirements are correctly implemented
  ✅ Edge cases are handled appropriately
  ✅ Data consistency is maintained
  ✅ Business rules are enforced
  ✅ Audit trails are created for important operations
  ✅ Backward compatibility is maintained

Documentation Review:
  ✅ API documentation is updated
  ✅ README files reflect changes
  ✅ JSDoc comments are comprehensive
  ✅ Database schema changes are documented
  ✅ Migration scripts are provided where needed

Compliance Review:
  ✅ GDPR compliance for personal data handling
  ✅ SOX compliance for financial data
  ✅ Audit logging for compliance requirements
  ✅ Data retention policies are followed
  ✅ Privacy by design principles applied
```

### **Automated Code Quality Checks**
```json
// .eslintrc.json - Enterprise ESLint configuration
{
  "extends": [
    "@tanqory/eslint-config",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:security/recommended",
    "plugin:sonarjs/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json",
    "ecmaVersion": 2022,
    "sourceType": "module"
  },
  "plugins": [
    "@typescript-eslint",
    "security",
    "sonarjs",
    "import",
    "prefer-arrow"
  ],
  "rules": {
    // TypeScript specific rules
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/prefer-readonly": "error",
    "@typescript-eslint/strict-boolean-expressions": "error",

    // Security rules
    "security/detect-object-injection": "error",
    "security/detect-non-literal-regexp": "error",
    "security/detect-unsafe-regex": "error",

    // Code quality rules
    "sonarjs/cognitive-complexity": ["error", 15],
    "sonarjs/no-duplicate-string": ["error", 3],
    "sonarjs/no-identical-functions": "error",

    // Import rules
    "import/order": ["error", {
      "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
      "alphabetize": { "order": "asc" }
    }],
    "import/no-cycle": "error",
    "import/no-unresolved": "error",

    // General rules
    "prefer-const": "error",
    "no-var": "error",
    "no-console": "warn",
    "complexity": ["error", 10],
    "max-lines-per-function": ["error", 50],
    "max-depth": ["error", 4]
  },
  "overrides": [
    {
      "files": ["**/*.test.ts", "**/*.spec.ts"],
      "rules": {
        "max-lines-per-function": "off",
        "@typescript-eslint/no-explicit-any": "off"
      }
    }
  ]
}
```

---

*This comprehensive enterprise coding standards document establishes Tanqory as a world-class development organization with IPO-ready code quality, enterprise-grade JavaScript/TypeScript standards, and automated tooling supporting billion-dollar scale development operations.*

**Document Classification**: CONFIDENTIAL
**Technical Scope**: JavaScript, TypeScript, Enterprise Development
**ESLint Package**: @tanqory/eslint-config
**Review Cycle**: Monthly (due to rapid development iteration)

**Last Updated**: September 16, 2025
**Version**: 2.0.0